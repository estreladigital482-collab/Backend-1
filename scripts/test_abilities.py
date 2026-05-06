#!/usr/bin/env python3
"""
Testes para o sistema de abilities do Aura Sphere
Testa a integração com GitHub API e parsing de código Python
"""

import unittest
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# Adicionar o caminho para importar os módulos
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'packages', 'bridge'))

from agent.ability_discovery_engine import AbilityDiscoveryEngine


class TestAbilityDiscoveryEngine(unittest.TestCase):
    """Testes para AbilityDiscoveryEngine"""

    def setUp(self):
        """Configurar testes"""
        self.engine = AbilityDiscoveryEngine()

    @patch('requests.get')
    def test_search_github_success(self, mock_get):
        """Testar busca no GitHub com sucesso"""
        # Mock da resposta da API do GitHub
        mock_response = Mock()
        mock_response.json.return_value = {
            'items': [
                {
                    'name': 'data-utils',
                    'full_name': 'user/data-utils',
                    'clone_url': 'https://github.com/user/data-utils.git',
                    'description': 'Useful data utilities',
                    'language': 'Python',
                    'stargazers_count': 150
                }
            ]
        }
        mock_get.return_value = mock_response

        results = self.engine.search_repositories('data analysis')

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'data-utils')
        self.assertEqual(results[0]['url'], 'https://github.com/user/data-utils.git')

    @patch('requests.get')
    def test_search_github_api_error(self, mock_get):
        """Testar tratamento de erro da API do GitHub"""
        mock_get.side_effect = Exception('API rate limit exceeded')

        results = self.engine.search_repositories('test query')
        self.assertEqual(len(results), 0)  # Deve retornar lista vazia em caso de erro

    def test_extract_functions_simple(self):
        """Testar extração de funções simples"""
        code = '''
def analyze_data(data, columns=None):
    """Analyze data columns and return statistics."""
    return {"mean": data.mean(), "std": data.std()}

def clean_data(data):
    """Clean data by removing nulls."""
    return data.dropna()
'''

        functions = self.engine.extract_functions_from_code(code)

        self.assertEqual(len(functions), 2)
        self.assertEqual(functions[0].name, 'analyze_data')
        self.assertEqual(functions[1].name, 'clean_data')

    def test_extract_functions_with_class(self):
        """Testar extração de métodos de classe"""
        code = '''
class DataProcessor:
    def __init__(self):
        pass

    def process_data(self, data):
        """Process the input data."""
        return data * 2

    def clean_data(self, data):
        """Clean the data."""
        return data.dropna()
'''

        functions = self.engine.extract_functions_from_code(code)

        # Deve extrair todos os métodos, incluindo __init__
        self.assertEqual(len(functions), 3)
        method_names = [f.name for f in functions]
        self.assertIn('__init__', method_names)
        self.assertIn('process_data', method_names)
        self.assertIn('clean_data', method_names)

    def test_extract_functions_no_functions(self):
        """Testar código sem funções"""
        code = 'print("Hello World")\nx = 1 + 1\n'

        functions = self.engine.extract_functions_from_code(code)

        self.assertEqual(len(functions), 0)

    def test_extract_functions_malformed_code(self):
        """Testar código mal formado"""
        code = 'def incomplete_function(\n    pass'

        functions = self.engine.extract_functions_from_code(code)

        # Deve lidar graciosamente com código mal formado
        self.assertEqual(len(functions), 0)

    @patch('requests.get')
    def test_discover_abilities_full_flow(self, mock_get):
        """Testar fluxo completo de descoberta de abilities"""
        # Mock da busca
        mock_search_response = Mock()
        mock_search_response.json.return_value = {
            'items': [
                {
                    'name': 'test-repo',
                    'clone_url': 'https://github.com/user/test-repo.git',
                    'description': 'Test repository',
                    'stargazers_count': 50,
                    'language': 'Python'
                }
            ]
        }

        # Mock do fetch dos arquivos
        mock_contents_response = Mock()
        mock_contents_response.json.return_value = [
            {
                'name': 'main.py',
                'download_url': 'https://raw.githubusercontent.com/user/test-repo/main/main.py'
            }
        ]

        mock_file_response = Mock()
        mock_file_response.text = '''
def useful_function(data):
    """A useful function for data processing."""
    return data.upper()

def another_function(x, y=10):
    """Another function."""
    return x + y
'''

        # Configurar os mocks
        mock_get.side_effect = [mock_search_response, mock_contents_response, mock_file_response]

        # Testar o fluxo
        repos = self.engine.search_repositories('data processing')
        self.assertEqual(len(repos), 1)

        files = self.engine.fetch_repo_files('https://github.com/user/test-repo.git')
        self.assertIn('main.py', files)

        functions = self.engine.extract_functions_from_code(files['main.py'])
        self.assertEqual(len(functions), 2)


if __name__ == '__main__':
    unittest.main()