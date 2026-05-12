"""
AbilityDiscoveryEngine - Descobrir e integrar habilidades de repositórios GitHub
"""

import requests
import ast
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class Function:
    name: str
    signature: str
    docstring: Optional[str]
    params: List[str]

class AbilityDiscoveryEngine:
    def __init__(self):
        self.github_api = "https://api.github.com"
        
    def search_repositories(self, keyword: str, language: str = 'python', min_stars: int = 10) -> List[Dict]:
        """Buscar repositórios no GitHub com palavra-chave"""
        try:
            query = f"{keyword} language:{language} stars:>={min_stars}"
            response = requests.get(
                f"{self.github_api}/search/repositories",
                params={"q": query, "sort": "stars", "per_page": 10}
            )
            if response.status_code == 200:
                repos = response.json().get('items', [])
                return [{
                    'name': repo['name'],
                    'url': repo['clone_url'],
                    'description': repo['description'],
                    'stars': repo['stargazers_count'],
                    'language': repo['language']
                } for repo in repos]
        except Exception as e:
            print(f"Erro ao buscar repos: {e}")
        return []

    def extract_functions_from_code(self, code: str) -> List[Function]:
        """Extrair funções do código Python usando AST"""
        try:
            tree = ast.parse(code)
            functions = []
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    params = [arg.arg for arg in node.args.args]
                    docstring = ast.get_docstring(node)
                    signature = f"def {node.name}({', '.join(params)})"
                    
                    functions.append(Function(
                        name=node.name,
                        signature=signature,
                        docstring=docstring,
                        params=params
                    ))
            return functions
        except Exception as e:
            print(f"Erro ao extrair funções: {e}")
        return []

    def fetch_repo_files(self, repo_url: str, file_pattern: str = "*.py") -> Dict[str, str]:
        """Buscar arquivos Python de um repositório"""
        try:
            owner, repo = repo_url.replace("https://github.com/", "").replace(".git", "").split("/")
            api_url = f"{self.github_api}/repos/{owner}/{repo}/contents"
            response = requests.get(api_url)
            
            if response.status_code == 200:
                items = response.json()
                files = {}
                for item in items:
                    if item['name'].endswith('.py'):
                        file_response = requests.get(item['download_url'])
                        files[item['name']] = file_response.text
                return files
        except Exception as e:
            print(f"Erro ao buscar arquivos do repo: {e}")
        return {}


# Exemplo de uso
engine = AbilityDiscoveryEngine()
repos = engine.search_repositories("data-analysis")
print(f"Encontrados {len(repos)} repositórios")
