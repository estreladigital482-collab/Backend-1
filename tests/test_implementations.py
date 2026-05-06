"""
Testes para todas as funcionalidades implementadas
"""

import unittest
from datetime import datetime
from packages.bridge.memory.consolidated_memory_system import ConsolidatedMemorySystem
from packages.bridge.agent.ability_discovery_engine import AbilityDiscoveryEngine
from packages.bridge.agent.ability_wrapper import AbilityWrapper, generate_ability_wrapper

class TestConsolidatedMemory(unittest.TestCase):
    def setUp(self):
        self.memory_system = ConsolidatedMemorySystem()
    
    def test_store_memory(self):
        """Test memory storage"""
        memory = self.memory_system.store_memory(
            content="Test memory",
            memory_type="user",
            category="test"
        )
        self.assertEqual(memory['type'], 'user')
        self.assertEqual(memory['category'], 'test')
        self.assertEqual(len(self.memory_system.memories), 1)
    
    def test_search_memories(self):
        """Test memory search with filtering"""
        self.memory_system.store_memory("Python data analysis", "assistant", "project")
        self.memory_system.store_memory("JavaScript frontend", "assistant", "project")
        
        results = self.memory_system.search_memories("Python")
        self.assertEqual(len(results), 1)
        self.assertIn("Python", results[0]['content'])
    
    def test_pin_memory(self):
        """Test pinning memories"""
        memory = self.memory_system.store_memory("Important", "user", "note")
        self.memory_system.pin_memory(memory['id'], pinned=True)
        
        results = self.memory_system.search_memories("Important")
        self.assertTrue(results[0]['pinned'])
    
    def test_consolidate_memories(self):
        """Test memory consolidation"""
        self.memory_system.store_memory("React component", "user", "programming")
        self.memory_system.store_memory("React hooks", "assistant", "programming")
        
        consolidated = self.memory_system.consolidate_related_memories("React")
        self.assertGreater(consolidated['total_memories'], 0)

class TestAbilityDiscovery(unittest.TestCase):
    def setUp(self):
        self.engine = AbilityDiscoveryEngine()
    
    def test_extract_functions(self):
        """Test function extraction from code"""
        code = """
def add(a, b):
    '''Add two numbers'''
    return a + b

def multiply(x, y):
    '''Multiply two numbers'''
    return x * y
"""
        functions = self.engine.extract_functions_from_code(code)
        self.assertEqual(len(functions), 2)
        self.assertTrue(any(f.name == 'add' for f in functions))

class TestAbilityWrapper(unittest.TestCase):
    def test_wrapper_validation(self):
        """Test ability wrapper validation"""
        def sample_function(name: str, age: int):
            return f"{name} is {age}"
        
        wrapper = AbilityWrapper(
            sample_function,
            safety_checks={'name': {'type': str, 'max_length': 50}}
        )
        
        self.assertTrue(wrapper.validate_parameters(name="John", age=30))
    
    def test_wrapper_type_check(self):
        """Test wrapper type validation"""
        def sample_function(x):
            return x * 2
        
        wrapper = AbilityWrapper(
            sample_function,
            safety_checks={'x': {'type': int}}
        )
        
        with self.assertRaises(TypeError):
            wrapper.validate_parameters(x="string")

if __name__ == '__main__':
    unittest.main()
