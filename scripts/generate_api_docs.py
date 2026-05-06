#!/usr/bin/env python3
"""
Gerador de Documentação Swagger/OpenAPI para todas as APIs
"""

import json
from typing import Dict, List

def generate_openapi_spec() -> Dict:
    """Gerar especificação OpenAPI 3.0 para o projeto"""
    
    spec = {
        "openapi": "3.0.0",
        "info": {
            "title": "Aura-sphere- API",
            "version": "2.0.0",
            "description": "API consolidada para Abilities, Memory, Planning, Actions e Device Management",
            "contact": {
                "name": "Aura-sphere- Team"
            }
        },
        "servers": [
            {
                "url": "http://localhost:5000",
                "description": "Development server"
            },
            {
                "url": "https://aura-sphere.vercel.app",
                "description": "Production server"
            }
        ],
        "paths": generate_paths(),
        "components": generate_components()
    }
    
    return spec

def generate_paths() -> Dict:
    """Gerar definições de paths"""
    
    paths = {
        "/api/v1/abilities/search": {
            "post": {
                "summary": "Search abilities on GitHub",
                "tags": ["Abilities"],
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "keyword": {"type": "string"},
                                    "language": {"type": "string", "default": "python"},
                                    "min_stars": {"type": "integer", "default": 10}
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "List of repositories found",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "results": {"type": "array"},
                                        "count": {"type": "integer"}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/abilities/add": {
            "post": {
                "summary": "Add ability to user",
                "tags": ["Abilities"],
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "repo_url": {"type": "string"},
                                    "ability_name": {"type": "string"},
                                    "selected_functions": {"type": "array", "items": {"type": "string"}}
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Ability added successfully",
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/AbilityResponse"}
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/abilities/list": {
            "get": {
                "summary": "List user's abilities",
                "tags": ["Abilities"],
                "responses": {
                    "200": {
                        "description": "List of abilities",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "abilities": {"type": "array", "items": {"$ref": "#/components/schemas/Ability"}}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/memory/list": {
            "get": {
                "summary": "List memories with filters",
                "tags": ["Memory"],
                "parameters": [
                    {
                        "name": "type",
                        "in": "query",
                        "schema": {"type": "string", "enum": ["user", "assistant", "system"]}
                    },
                    {
                        "name": "category",
                        "in": "query",
                        "schema": {"type": "string"}
                    },
                    {
                        "name": "pinned",
                        "in": "query",
                        "schema": {"type": "boolean"}
                    }
                ],
                "responses": {
                    "200": {
                        "description": "List of memories",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "memories": {"type": "array", "items": {"$ref": "#/components/schemas/Memory"}}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/memory/search": {
            "get": {
                "summary": "Search memories (uses cache)",
                "tags": ["Memory"],
                "parameters": [
                    {
                        "name": "query",
                        "in": "query",
                        "required": True,
                        "schema": {"type": "string"}
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Search results",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "memories": {"type": "array", "items": {"$ref": "#/components/schemas/Memory"}}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/planning/plans/{user_id}": {
            "get": {
                "summary": "Get user plans",
                "tags": ["Planning"],
                "parameters": [
                    {
                        "name": "user_id",
                        "in": "path",
                        "required": True,
                        "schema": {"type": "string"}
                    }
                ],
                "responses": {
                    "200": {
                        "description": "List of plans",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "plans": {"type": "array", "items": {"$ref": "#/components/schemas/Plan"}}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/actions/pending": {
            "get": {
                "summary": "Get pending actions",
                "tags": ["Actions"],
                "responses": {
                    "200": {
                        "description": "List of pending actions",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "pending_actions": {"type": "array", "items": {"$ref": "#/components/schemas/Action"}}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/device/profile": {
            "get": {
                "summary": "Get device profile",
                "tags": ["Device"],
                "responses": {
                    "200": {
                        "description": "Device information",
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/DeviceProfile"}
                            }
                        }
                    }
                }
            }
        }
    }
    
    return paths

def generate_components() -> Dict:
    """Gerar componentes reutilizáveis"""
    
    components = {
        "schemas": {
            "Ability": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "user_id": {"type": "string"},
                    "name": {"type": "string"},
                    "description": {"type": "string"},
                    "source_repo": {"type": "string"},
                    "functions_json": {"type": "object"},
                    "version": {"type": "string"}
                }
            },
            "AbilityResponse": {
                "type": "object",
                "properties": {
                    "ability_id": {"type": "string"},
                    "status": {"type": "string"},
                    "message": {"type": "string"}
                }
            },
            "Memory": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "content": {"type": "string"},
                    "type": {"type": "string", "enum": ["user", "assistant", "system"]},
                    "category": {"type": "string"},
                    "pinned": {"type": "boolean"},
                    "created_at": {"type": "string", "format": "date-time"},
                    "access_count": {"type": "integer"}
                }
            },
            "Plan": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "user_id": {"type": "string"},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "status": {"type": "string"},
                    "progress": {"type": "number"},
                    "task_count": {"type": "integer"},
                    "completed_tasks": {"type": "integer"}
                }
            },
            "Action": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "user_id": {"type": "string"},
                    "action_type": {"type": "string"},
                    "description": {"type": "string"},
                    "parameters": {"type": "object"},
                    "status": {"type": "string"},
                    "created_at": {"type": "string", "format": "date-time"}
                }
            },
            "DeviceProfile": {
                "type": "object",
                "properties": {
                    "device_type": {"type": "string"},
                    "storage_mb": {"type": "integer"},
                    "ram_mb": {"type": "integer"},
                    "health_score": {"type": "integer"}
                }
            }
        }
    }
    
    return components

def main():
    spec = generate_openapi_spec()
    
    # Save as JSON
    with open('/workspaces/Aura-sphere-/docs/openapi.json', 'w') as f:
        json.dump(spec, f, indent=2)
    
    # Save as YAML string (for docs)
    import yaml
    with open('/workspaces/Aura-sphere-/docs/openapi.yaml', 'w') as f:
        yaml.dump(spec, f, default_flow_style=False)
    
    print("✅ OpenAPI spec gerado!")
    print("📄 JSON: docs/openapi.json")
    print("📄 YAML: docs/openapi.yaml")
    print("\n📖 Você pode visualizar em: https://editor.swagger.io/ (cole o conteúdo)")

if __name__ == '__main__':
    main()
