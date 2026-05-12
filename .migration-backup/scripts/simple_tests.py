#!/usr/bin/env python3
"""
Testes simplificados - Sem dependências complexas
"""

import sys
sys.path.insert(0, '/workspaces/Aura-sphere-')

def test_memory_system():
    """Test ConsolidatedMemorySystem"""
    from packages.bridge.memory.consolidated_memory_system import ConsolidatedMemorySystem
    
    system = ConsolidatedMemorySystem()
    
    # Test store
    mem1 = system.store_memory("Python programming", "user", "coding")
    assert mem1['type'] == 'user'
    assert mem1['category'] == 'coding'
    print("✅ Memory storage: OK")
    
    # Test search
    system.store_memory("JavaScript frontend", "assistant", "coding")
    results = system.search_memories("Python")
    assert len(results) >= 1
    print("✅ Memory search: OK")
    
    # Test pin
    system.pin_memory(mem1['id'], pinned=True)
    results = system.search_memories("Python")
    assert results[0]['pinned'] == True
    print("✅ Memory pinning: OK")
    
    # Test export for prompt
    context = system.export_memories_for_prompt("Python")
    assert "Python" in context
    print("✅ Memory export: OK")

def test_ability_engine():
    """Test AbilityDiscoveryEngine"""
    from packages.bridge.agent.ability_discovery_engine import AbilityDiscoveryEngine
    
    engine = AbilityDiscoveryEngine()
    
    # Test AST extraction
    code = """
def add(a, b):
    '''Add two numbers'''
    return a + b

def multiply(x, y):
    '''Multiply numbers'''
    return x * y
"""
    
    functions = engine.extract_functions_from_code(code)
    assert len(functions) == 2
    assert functions[0].name == 'add'
    assert 'Add' in functions[0].docstring
    print("✅ AST parsing: OK")

def test_ability_wrapper():
    """Test AbilityWrapper"""
    from packages.bridge.agent.ability_wrapper import AbilityWrapper
    
    def sample(name, age):
        return f"{name} is {age}"
    
    wrapper = AbilityWrapper(
        sample,
        safety_checks={'name': {'type': str, 'max_length': 50}}
    )
    
    # Test validation
    assert wrapper.validate_parameters(name="John", age=30)
    print("✅ Wrapper validation: OK")
    
    # Test to_json
    json_repr = wrapper.to_json()
    assert json_repr['name'] == 'sample'
    print("✅ Wrapper JSON: OK")

def main():
    print("\n" + "="*60)
    print("🧪 EXECUTANDO TESTES SIMPLIFICADOS")
    print("="*60 + "\n")
    
    try:
        test_memory_system()
    except Exception as e:
        print(f"❌ Memory tests failed: {e}")
    
    try:
        test_ability_engine()
    except Exception as e:
        print(f"❌ Ability engine tests failed: {e}")
    
    try:
        test_ability_wrapper()
    except Exception as e:
        print(f"❌ Ability wrapper tests failed: {e}")
    
    print("\n" + "="*60)
    print("✅ TESTES CONCLUÍDOS!")
    print("="*60 + "\n")

if __name__ == '__main__':
    main()
