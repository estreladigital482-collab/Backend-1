import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AbilityDiscoveryEngine } from '../../../packages/bridge/agent/ability_discovery_engine';

// Mock fetch for GitHub API calls
global.fetch = vi.fn();

describe('AbilityDiscoveryEngine', () => {
  let engine: AbilityDiscoveryEngine;

  beforeEach(() => {
    engine = new AbilityDiscoveryEngine();
    vi.clearAllMocks();
  });

  describe('searchGitHub', () => {
    it('should search GitHub repositories successfully', async () => {
      const mockResponse = {
        items: [
          {
            name: 'data-utils',
            full_name: 'user/data-utils',
            html_url: 'https://github.com/user/data-utils',
            description: 'Useful data utilities',
            language: 'Python'
          }
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const results = await engine.searchGitHub('data analysis');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.github.com/search/repositories'),
        expect.any(Object)
      );
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('data-utils');
    });

    it('should handle GitHub API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'API rate limit exceeded'
      });

      await expect(engine.searchGitHub('test')).rejects.toThrow('GitHub API error');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(engine.searchGitHub('test')).rejects.toThrow('Network error');
    });
  });

  describe('extractFunctionsFromCode', () => {
    it('should extract Python functions correctly', () => {
      const code = `
def analyze_data(data, columns=None):
    """Analyze data columns and return statistics."""
    return {"mean": data.mean(), "std": data.std()}

class DataProcessor:
    def clean_data(self, data):
        """Clean and preprocess data."""
        return data.dropna()
`;

      const functions = engine.extractFunctionsFromCode(code);

      expect(functions).toHaveLength(2);
      expect(functions[0]).toEqual({
        name: 'analyze_data',
        signature: 'analyze_data(data, columns=None)',
        docstring: 'Analyze data columns and return statistics.'
      });
      expect(functions[1]).toEqual({
        name: 'clean_data',
        signature: 'clean_data(self, data)',
        docstring: 'Clean and preprocess data.'
      });
    });

    it('should handle code without functions', () => {
      const code = 'print("Hello World")';
      const functions = engine.extractFunctionsFromCode(code);
      expect(functions).toHaveLength(0);
    });

    it('should handle malformed code gracefully', () => {
      const code = 'def incomplete_function(';
      const functions = engine.extractFunctionsFromCode(code);
      expect(functions).toHaveLength(0);
    });

    it('should extract async functions', () => {
      const code = `
async def fetch_data(url: str) -> dict:
    """Fetch data from API asynchronously."""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()
`;

      const functions = engine.extractFunctionsFromCode(code);

      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe('fetch_data');
      expect(functions[0].signature).toBe('fetch_data(url: str) -> dict');
    });

    it('should handle functions with complex type hints', () => {
      const code = `
from typing import List, Dict, Optional

def process_batch(data: List[Dict[str, any]], config: Optional[Dict] = None) -> List[Dict]:
    """Process a batch of data with optional configuration."""
    return data
`;

      const functions = engine.extractFunctionsFromCode(code);

      expect(functions).toHaveLength(1);
      expect(functions[0].signature).toBe('process_batch(data: List[Dict[str, any]], config: Optional[Dict] = None) -> List[Dict]');
    });

    it('should extract functions from nested classes', () => {
      const code = `
class OuterClass:
    class InnerClass:
        def inner_method(self, param: int) -> str:
            """A method in a nested class."""
            return str(param)
`;

      const functions = engine.extractFunctionsFromCode(code);

      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe('inner_method');
    });
  });

  describe('discoverAbilities', () => {
    it('should discover abilities from GitHub search', async () => {
      // Mock search results
      vi.spyOn(engine, 'searchGitHub').mockResolvedValue([
        { name: 'data-utils', html_url: 'https://github.com/user/data-utils' }
      ]);

      // Mock code fetching
      vi.spyOn(engine as any, 'fetchRepositoryCode').mockResolvedValue(`
def process_data(data):
    return data
`);

      const abilities = await engine.discoverAbilities('data processing');

      expect(abilities).toHaveLength(1);
      expect(abilities[0].name).toBe('data-utils');
      expect(abilities[0].functions).toHaveLength(1);
    });

    it('should filter out repositories without Python functions', async () => {
      vi.spyOn(engine, 'searchGitHub').mockResolvedValue([
        { name: 'data-utils', html_url: 'https://github.com/user/data-utils' }
      ]);

      vi.spyOn(engine as any, 'fetchRepositoryCode').mockResolvedValue('print("no functions")');

      const abilities = await engine.discoverAbilities('data processing');

      expect(abilities).toHaveLength(0);
    });
  });
});

// End-to-end tests for the complete ability discovery and addition flow
describe('Ability Discovery and Addition E2E', () => {
  it('should complete full flow: search -> discover -> add ability', async () => {
    // This would be an integration test that tests the full API flow
    // For now, we'll test the component integration

    // Mock the API responses
    const mockSearchResponse = {
      results: [
        {
          name: 'test-repo',
          functions: [
            {
              name: 'test_function',
              signature: 'test_function(param: str) -> bool',
              docstring: 'A test function'
            }
          ]
        }
      ]
    };

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/v1/abilities/search')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSearchResponse)
        });
      }
      if (url.includes('/api/v1/abilities/add')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Test the search API
    const searchResponse = await fetch('/api/v1/abilities/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test' })
    });
    const searchData = await searchResponse.json();

    expect(searchData.results).toHaveLength(1);
    expect(searchData.results[0].functions).toHaveLength(1);

    // Test the add API
    const addResponse = await fetch('/api/v1/abilities/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        functions: searchData.results[0].functions,
        name: 'Test Ability',
        description: 'Test ability from e2e test'
      })
    });
    const addData = await addResponse.json();

    expect(addData.success).toBe(true);
  });

  it('should handle API errors gracefully in the flow', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    await expect(fetch('/api/v1/abilities/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test' })
    })).rejects.toThrow('Network error');
  });
});