"""
API Endpoints para Abilities, Social, e Device Management
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import json

# Blueprint para Abilities
abilities_bp = Blueprint('abilities', __name__, url_prefix='/api/v1/abilities')

@abilities_bp.route('/search', methods=['POST'])
def search_abilities():
    """Buscar habilidades no GitHub"""
    data = request.get_json()
    keyword = data.get('keyword')
    language = data.get('language', 'python')
    
    # TODO: Integrar com AbilityDiscoveryEngine
    from packages.bridge.agent.ability_discovery_engine import AbilityDiscoveryEngine
    engine = AbilityDiscoveryEngine()
    repos = engine.search_repositories(keyword, language)
    
    return jsonify({
        'results': repos,
        'count': len(repos)
    })

@abilities_bp.route('/add', methods=['POST'])
def add_ability():
    """Adicionar habilidade ao usuário"""
    data = request.get_json()
    # TODO: Implementar lógica de adicionar ability ao banco
    return jsonify({
        'ability_id': 'ability-123',
        'status': 'added',
        'message': 'Habilidade adicionada com sucesso'
    })

@abilities_bp.route('/list', methods=['GET'])
def list_abilities():
    """Listar habilidades do usuário"""
    # TODO: Buscar do banco de dados
    return jsonify({
        'abilities': []
    })

@abilities_bp.route('/<ability_id>/details', methods=['GET'])
def get_ability_details(ability_id):
    """Obter detalhes de uma habilidade"""
    # TODO: Buscar detalhes do banco
    return jsonify({
        'id': ability_id,
        'name': 'Habilidade exemplo',
        'functions': [],
        'examples': []
    })

# Blueprint para Social
social_bp = Blueprint('social', __name__, url_prefix='/api/v1/social')

@social_bp.route('/instagram/login', methods=['POST'])
def instagram_login():
    """Login seguro no Instagram"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    verification_code = data.get('verification_code')
    user_id = data.get('user_id', 'default_user')  # TODO: Obter do JWT

    if not username or not password:
        return jsonify({'error': 'Username e password são obrigatórios'}), 400

    try:
        from packages.bridge.agent.instagram_session import InstagramSession
        session = InstagramSession(user_id)

        result = session.login(username, password, verification_code)

        if result['success']:
            # Salvar conta no banco
            # TODO: Implementar persistência no banco
            return jsonify({
                'account_id': f"instagram_{result['account']['id']}",
                'status': 'authenticated',
                'account': result['account']
            })
        else:
            status_code = 400
            if result.get('requires_2fa'):
                status_code = 401  # Unauthorized, precisa 2FA
            return jsonify(result), status_code

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/instagram/sync', methods=['GET'])
def sync_instagram():
    """Sincronizar posts salvos do Instagram"""
    user_id = request.args.get('user_id', 'default_user')  # TODO: Obter do JWT

    try:
        from packages.bridge.agent.instagram_session import InstagramSession
        session = InstagramSession(user_id)

        # Tentar restaurar sessão
        if not session.restore_session():
            return jsonify({'error': 'Sessão não encontrada. Faça login primeiro.'}), 401

        saved_posts = session.get_saved_posts(limit=50)

        # TODO: Salvar no banco e categorizar com IA
        # Por enquanto, retornar dados brutos
        return jsonify({
            'synced_count': len(saved_posts),
            'posts': saved_posts[:10],  # Retornar apenas primeiros 10
            'total_available': len(saved_posts)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/instagram/collections', methods=['GET'])
def list_instagram_collections():
    """Listar coleções do Instagram"""
    user_id = request.args.get('user_id', 'default_user')  # TODO: Obter do JWT

    # TODO: Buscar coleções do banco
    return jsonify({
        'collections': [
            {
                'id': 'collection-1',
                'name': 'Anime Favorites',
                'filters': {'query': 'anime'},
                'item_count': 25
            }
        ]
    })

@social_bp.route('/instagram/collections', methods=['POST'])
def create_instagram_collection():
    """Criar nova coleção do Instagram"""
    data = request.get_json()
    user_id = data.get('user_id', 'default_user')  # TODO: Obter do JWT
    name = data.get('name')
    filters = data.get('filters', {})

    if not name:
        return jsonify({'error': 'Nome da coleção é obrigatório'}), 400

    # TODO: Salvar no banco
    return jsonify({
        'collection_id': 'collection-123',
        'name': name,
        'filters': filters,
        'status': 'created'
    })

@social_bp.route('/instagram/recommendations', methods=['GET'])
def get_instagram_recommendations():
    """Obter recomendações baseadas em posts salvos"""
    user_id = request.args.get('user_id', 'default_user')  # TODO: Obter do JWT
    theme = request.args.get('theme')
    limit = int(request.args.get('limit', 5))

    # TODO: Implementar lógica de recomendações com embeddings
    # Por enquanto, retornar dados mock
    return jsonify({
        'recommendations': [
            {
                'type': 'similar_content',
                'title': f'Conteúdo similar ao tema: {theme}',
                'items': [
                    {'id': 'rec-1', 'title': 'Anime recommendation 1'},
                    {'id': 'rec-2', 'title': 'Anime recommendation 2'}
                ]
            }
        ],
        'theme': theme,
        'limit': limit
    })

@social_bp.route('/<platform>/actions/propose', methods=['POST'])
def propose_social_action(platform):
    """Propor ação social para aprovação"""
    data = request.get_json()
    user_id = data.get('user_id', 'default_user')  # TODO: Obter do JWT
    action_type = data.get('action_type')  # publish, schedule, like, follow, follow_back, message_template
    description = data.get('description')
    parameters = data.get('parameters', {})

    if not action_type or not description:
        return jsonify({'error': 'action_type e description são obrigatórios'}), 400

    # Usar ActionQueueService para propor ação
    from packages.bridge.agent.action_queue_service import ActionQueueService
    action_service = ActionQueueService()

    action_proposal = action_service.submit_action_proposal(
        user_id=user_id,
        action_type=f"social_{platform}_{action_type}",
        description=description,
        parameters=parameters
    )

    return jsonify({
        'action_id': action_proposal['id'],
        'preview_description': description,
        'status': 'proposed',
        'requires_approval': True
    })

@social_bp.route('/<platform>/analytics', methods=['GET'])
def get_social_analytics(platform):
    """Obter analytics básicos da plataforma social"""
    user_id = request.args.get('user_id', 'default_user')  # TODO: Obter do JWT

    # TODO: Implementar analytics reais baseados na plataforma
    # Por enquanto, mock data
    return jsonify({
        'platform': platform,
        'followers': 1250,
        'engagement_rate': 4.2,
        'posts_this_month': 15,
        'last_updated': datetime.now().isoformat()
    })

# Blueprint para Device
device_bp = Blueprint('device', __name__, url_prefix='/api/v1/device')

@device_bp.route('/profile', methods=['GET'])
def get_device_profile():
    """Obter perfil do dispositivo"""
    return jsonify({
        'device_type': 'desktop',
        'storage_mb': 500000,
        'ram_mb': 16000,
        'health_score': 95
    })

@device_bp.route('/optimize', methods=['POST'])
def optimize_device():
    """Gerar plano de otimização"""
    return jsonify({
        'recommendations': [
            'Limpar cache de navegador',
            'Deletar files temporários'
        ],
        'estimated_freed_mb': 5000
    })

@device_bp.route('/sync/status', methods=['GET'])
def get_sync_status():
    """Status de sincronização offline"""
    return jsonify({
        'status': 'synced',
        'last_sync': datetime.now().isoformat(),
        'pending_changes': 0
    })
