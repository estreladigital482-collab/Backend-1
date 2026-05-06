"""
StorageOptimizer - Otimização de armazenamento
Responsável por limpeza e gerenciamento de espaço
"""

import os
import shutil
import glob
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime, timedelta

class StorageOptimizer:
    """Otimizador de armazenamento para limpeza automática"""

    def __init__(self, base_path: str = None):
        self.base_path = Path(base_path or os.getcwd())
        self.temp_dirs = [
            '/tmp',
            '/var/tmp',
            self.base_path / 'temp',
            self.base_path / 'cache'
        ]
        self.cache_dirs = [
            self.base_path / '.cache',
            self.base_path / 'node_modules' / '.cache',
            Path.home() / '.cache'
        ]

    def analyze_storage_usage(self) -> Dict[str, Any]:
        """Analisar uso de armazenamento por categoria"""
        analysis = {
            'temp_files': self._analyze_temp_files(),
            'cache_files': self._analyze_cache_files(),
            'log_files': self._analyze_log_files(),
            'old_backups': self._analyze_old_backups(),
            'large_files': self._find_large_files(),
            'duplicate_files': self._find_duplicate_files()
        }

        # Calcular totais
        total_size = sum(item['total_size_mb'] for item in analysis.values())
        total_files = sum(item['file_count'] for item in analysis.values())

        return {
            'categories': analysis,
            'total_size_mb': total_size,
            'total_files': total_files,
            'recommendations': self._generate_recommendations(analysis)
        }

    def _analyze_temp_files(self) -> Dict[str, Any]:
        """Analisar arquivos temporários"""
        temp_files = []
        total_size = 0

        for temp_dir in self.temp_dirs:
            temp_path = Path(temp_dir)
            if temp_path.exists():
                for file_path in temp_path.rglob('*'):
                    if file_path.is_file():
                        try:
                            size = file_path.stat().st_size
                            temp_files.append({
                                'path': str(file_path),
                                'size_mb': size / (1024 * 1024),
                                'age_days': (datetime.now() - datetime.fromtimestamp(file_path.stat().st_mtime)).days
                            })
                            total_size += size
                        except (OSError, PermissionError):
                            continue

        # Filtrar arquivos antigos (>7 dias)
        old_temp = [f for f in temp_files if f['age_days'] > 7]

        return {
            'files': old_temp,
            'file_count': len(old_temp),
            'total_size_mb': total_size / (1024 * 1024)
        }

    def _analyze_cache_files(self) -> Dict[str, Any]:
        """Analisar arquivos de cache"""
        cache_files = []
        total_size = 0

        for cache_dir in self.cache_dirs:
            if cache_dir.exists():
                for file_path in cache_dir.rglob('*'):
                    if file_path.is_file():
                        try:
                            size = file_path.stat().st_size
                            cache_files.append({
                                'path': str(file_path),
                                'size_mb': size / (1024 * 1024),
                                'age_days': (datetime.now() - datetime.fromtimestamp(file_path.stat().st_mtime)).days
                            })
                            total_size += size
                        except (OSError, PermissionError):
                            continue

        # Filtrar caches antigos (>30 dias)
        old_cache = [f for f in cache_files if f['age_days'] > 30]

        return {
            'files': old_cache,
            'file_count': len(old_cache),
            'total_size_mb': total_size / (1024 * 1024)
        }

    def _analyze_log_files(self) -> Dict[str, Any]:
        """Analisar arquivos de log"""
        log_patterns = ['*.log', '*.log.*', '*.out', '*.err']
        log_files = []
        total_size = 0

        for pattern in log_patterns:
            for file_path in self.base_path.rglob(pattern):
                try:
                    size = file_path.stat().st_size
                    log_files.append({
                        'path': str(file_path),
                        'size_mb': size / (1024 * 1024),
                        'age_days': (datetime.now() - datetime.fromtimestamp(file_path.stat().st_mtime)).days
                    })
                    total_size += size
                except (OSError, PermissionError):
                    continue

        # Filtrar logs grandes (>10MB) ou antigos (>90 dias)
        problematic_logs = [f for f in log_files if f['size_mb'] > 10 or f['age_days'] > 90]

        return {
            'files': problematic_logs,
            'file_count': len(problematic_logs),
            'total_size_mb': total_size / (1024 * 1024)
        }

    def _analyze_old_backups(self) -> Dict[str, Any]:
        """Analisar backups antigos"""
        backup_patterns = ['*.bak', '*.backup', '*~', '*.old']
        backup_files = []
        total_size = 0

        for pattern in backup_patterns:
            for file_path in self.base_path.rglob(pattern):
                try:
                    size = file_path.stat().st_size
                    backup_files.append({
                        'path': str(file_path),
                        'size_mb': size / (1024 * 1024),
                        'age_days': (datetime.now() - datetime.fromtimestamp(file_path.stat().st_mtime)).days
                    })
                    total_size += size
                except (OSError, PermissionError):
                    continue

        # Filtrar backups muito antigos (>180 dias)
        old_backups = [f for f in backup_files if f['age_days'] > 180]

        return {
            'files': old_backups,
            'file_count': len(old_backups),
            'total_size_mb': total_size / (1024 * 1024)
        }

    def _find_large_files(self, min_size_mb: int = 100) -> Dict[str, Any]:
        """Encontrar arquivos grandes"""
        large_files = []

        for file_path in self.base_path.rglob('*'):
            if file_path.is_file():
                try:
                    size_mb = file_path.stat().st_size / (1024 * 1024)
                    if size_mb > min_size_mb:
                        large_files.append({
                            'path': str(file_path),
                            'size_mb': size_mb,
                            'age_days': (datetime.now() - datetime.fromtimestamp(file_path.stat().st_mtime)).days
                        })
                except (OSError, PermissionError):
                    continue

        return {
            'files': sorted(large_files, key=lambda x: x['size_mb'], reverse=True),
            'file_count': len(large_files),
            'total_size_mb': sum(f['size_mb'] for f in large_files)
        }

    def _find_duplicate_files(self) -> Dict[str, Any]:
        """Encontrar arquivos duplicados (simplificado)"""
        # Implementação simplificada - apenas verificar nomes iguais
        seen_files = {}
        duplicates = []

        for file_path in self.base_path.rglob('*'):
            if file_path.is_file():
                name = file_path.name
                size = file_path.stat().st_size

                key = (name, size)
                if key in seen_files:
                    try:
                        duplicates.append({
                            'path': str(file_path),
                            'duplicate_of': str(seen_files[key]),
                            'size_mb': size / (1024 * 1024)
                        })
                    except:
                        pass
                else:
                    seen_files[key] = file_path

        return {
            'files': duplicates,
            'file_count': len(duplicates),
            'total_size_mb': sum(f['size_mb'] for f in duplicates)
        }

    def _generate_recommendations(self, analysis: Dict) -> List[Dict]:
        """Gerar recomendações baseadas na análise"""
        recommendations = []

        # Recomendações por categoria
        if analysis['temp_files']['file_count'] > 0:
            recommendations.append({
                'category': 'temp_files',
                'action': 'Limpar arquivos temporários antigos',
                'estimated_freed_mb': analysis['temp_files']['total_size_mb'],
                'risk_level': 'low'
            })

        if analysis['cache_files']['file_count'] > 0:
            recommendations.append({
                'category': 'cache_files',
                'action': 'Limpar caches antigos',
                'estimated_freed_mb': analysis['cache_files']['total_size_mb'],
                'risk_level': 'low'
            })

        if analysis['log_files']['file_count'] > 0:
            recommendations.append({
                'category': 'log_files',
                'action': 'Arquivar ou deletar logs antigos/grandes',
                'estimated_freed_mb': analysis['log_files']['total_size_mb'],
                'risk_level': 'medium'
            })

        if analysis['old_backups']['file_count'] > 0:
            recommendations.append({
                'category': 'old_backups',
                'action': 'Remover backups muito antigos',
                'estimated_freed_mb': analysis['old_backups']['total_size_mb'],
                'risk_level': 'high'
            })

        if analysis['large_files']['file_count'] > 0:
            recommendations.append({
                'category': 'large_files',
                'action': 'Revisar arquivos grandes desnecessários',
                'estimated_freed_mb': analysis['large_files']['total_size_mb'] * 0.1,  # Assumir 10% removíveis
                'risk_level': 'high'
            })

        return recommendations

    def execute_cleanup(self, recommendations: List[Dict], dry_run: bool = True) -> Dict[str, Any]:
        """Executar limpeza baseada nas recomendações"""
        results = {
            'executed_actions': [],
            'freed_space_mb': 0,
            'errors': [],
            'dry_run': dry_run
        }

        for rec in recommendations:
            try:
                if rec['category'] == 'temp_files':
                    freed = self._cleanup_temp_files(dry_run)
                elif rec['category'] == 'cache_files':
                    freed = self._cleanup_cache_files(dry_run)
                elif rec['category'] == 'log_files':
                    freed = self._cleanup_log_files(dry_run)
                else:
                    continue

                results['executed_actions'].append({
                    'action': rec['action'],
                    'freed_mb': freed
                })
                results['freed_space_mb'] += freed

            except Exception as e:
                results['errors'].append(f"Erro em {rec['action']}: {str(e)}")

        return results

    def _cleanup_temp_files(self, dry_run: bool = True) -> float:
        """Limpar arquivos temporários"""
        freed_space = 0

        for temp_dir in self.temp_dirs:
            temp_path = Path(temp_dir)
            if temp_path.exists():
                for file_path in temp_path.rglob('*'):
                    if file_path.is_file():
                        try:
                            age_days = (datetime.now() - datetime.fromtimestamp(file_path.stat().st_mtime)).days
                            if age_days > 7:  # Arquivos com mais de 7 dias
                                size_mb = file_path.stat().st_size / (1024 * 1024)
                                if not dry_run:
                                    file_path.unlink()
                                freed_space += size_mb
                        except:
                            continue

        return freed_space

    def _cleanup_cache_files(self, dry_run: bool = True) -> float:
        """Limpar arquivos de cache"""
        freed_space = 0

        for cache_dir in self.cache_dirs:
            if cache_dir.exists():
                for file_path in cache_dir.rglob('*'):
                    if file_path.is_file():
                        try:
                            age_days = (datetime.now() - datetime.fromtimestamp(file_path.stat().st_mtime)).days
                            if age_days > 30:  # Caches com mais de 30 dias
                                size_mb = file_path.stat().st_size / (1024 * 1024)
                                if not dry_run:
                                    file_path.unlink()
                                freed_space += size_mb
                        except:
                            continue

        return freed_space

    def _cleanup_log_files(self, dry_run: bool = True) -> float:
        """Limpar arquivos de log"""
        freed_space = 0

        log_patterns = ['*.log', '*.log.*', '*.out', '*.err']
        for pattern in log_patterns:
            for file_path in self.base_path.rglob(pattern):
                try:
                    size_mb = file_path.stat().st_size / (1024 * 1024)
                    age_days = (datetime.now() - datetime.fromtimestamp(file_path.stat().st_mtime)).days

                    # Logs grandes (>10MB) ou muito antigos (>90 dias)
                    if size_mb > 10 or age_days > 90:
                        if not dry_run:
                            file_path.unlink()
                        freed_space += size_mb
                except:
                    continue

        return freed_space