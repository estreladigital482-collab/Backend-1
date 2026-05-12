"""
DeviceProfiler - Análise e perfil de dispositivos
Responsável por detectar características do dispositivo atual
"""

import platform
import psutil
import os
import shutil
from typing import Dict, Any
from dataclasses import dataclass

@dataclass
class DeviceProfile:
    """Perfil completo do dispositivo"""
    device_type: str
    os: str
    os_version: str
    architecture: str
    storage_total_mb: int
    storage_free_mb: int
    ram_total_mb: int
    ram_available_mb: int
    cpu_cores: int
    cpu_freq_mhz: float
    capabilities: Dict[str, bool]
    health_score: int  # 0-100

class DeviceProfiler:
    """Analisador de dispositivos para otimização e adaptação"""

    def __init__(self):
        self.system = platform.system().lower()

    def get_device_profile(self) -> DeviceProfile:
        """Obter perfil completo do dispositivo"""
        # Sistema operacional
        os_info = self._get_os_info()

        # Armazenamento
        storage_info = self._get_storage_info()

        # Memória RAM
        ram_info = self._get_ram_info()

        # CPU
        cpu_info = self._get_cpu_info()

        # Capacidades
        capabilities = self._assess_capabilities()

        # Health score
        health_score = self._calculate_health_score(storage_info, ram_info, cpu_info)

        # Tipo de dispositivo
        device_type = self._determine_device_type()

        return DeviceProfile(
            device_type=device_type,
            os=os_info['name'],
            os_version=os_info['version'],
            architecture=os_info['architecture'],
            storage_total_mb=storage_info['total'],
            storage_free_mb=storage_info['free'],
            ram_total_mb=ram_info['total'],
            ram_available_mb=ram_info['available'],
            cpu_cores=cpu_info['cores'],
            cpu_freq_mhz=cpu_info['freq'],
            capabilities=capabilities,
            health_score=health_score
        )

    def _get_os_info(self) -> Dict[str, str]:
        """Informações do sistema operacional"""
        return {
            'name': platform.system(),
            'version': platform.release(),
            'architecture': platform.machine()
        }

    def _get_storage_info(self) -> Dict[str, int]:
        """Informações de armazenamento em MB"""
        try:
            # Disco principal
            disk = psutil.disk_usage('/')
            total_mb = disk.total // (1024 * 1024)
            free_mb = disk.free // (1024 * 1024)

            return {
                'total': total_mb,
                'free': free_mb,
                'used': total_mb - free_mb
            }
        except Exception:
            # Fallback se psutil falhar
            return {
                'total': 100000,  # 100GB assumido
                'free': 50000,    # 50GB assumido
                'used': 50000
            }

    def _get_ram_info(self) -> Dict[str, int]:
        """Informações de RAM em MB"""
        try:
            ram = psutil.virtual_memory()
            total_mb = ram.total // (1024 * 1024)
            available_mb = ram.available // (1024 * 1024)

            return {
                'total': total_mb,
                'available': available_mb,
                'used': total_mb - available_mb
            }
        except Exception:
            # Fallback
            return {
                'total': 8192,   # 8GB assumido
                'available': 4096,  # 4GB assumido
                'used': 4096
            }

    def _get_cpu_info(self) -> Dict[str, Any]:
        """Informações da CPU"""
        try:
            cpu_freq = psutil.cpu_freq()
            freq_mhz = cpu_freq.current if cpu_freq else 2500  # 2.5GHz assumido

            return {
                'cores': psutil.cpu_count(logical=True),
                'physical_cores': psutil.cpu_count(logical=False),
                'freq': freq_mhz
            }
        except Exception:
            return {
                'cores': 4,
                'physical_cores': 2,
                'freq': 2500
            }

    def _assess_capabilities(self) -> Dict[str, bool]:
        """Avaliar capacidades do dispositivo"""
        capabilities = {
            'gpu_acceleration': False,
            'large_storage': False,
            'high_memory': False,
            'fast_cpu': False,
            'network_access': True,  # Assumido
            'file_system_access': True,  # Assumido
            'offline_mode': True
        }

        # Verificar GPU (simplificado)
        try:
            import torch
            capabilities['gpu_acceleration'] = torch.cuda.is_available()
        except ImportError:
            pass

        # Armazenamento
        profile = self.get_device_profile()
        capabilities['large_storage'] = profile.storage_total_mb > 500000  # >500GB

        # Memória
        capabilities['high_memory'] = profile.ram_total_mb > 16384  # >16GB

        # CPU
        capabilities['fast_cpu'] = profile.cpu_cores >= 8 and profile.cpu_freq_mhz > 3000

        return capabilities

    def _calculate_health_score(self, storage: Dict, ram: Dict, cpu: Dict) -> int:
        """Calcular score de saúde do dispositivo (0-100)"""
        score = 100

        # Penalizar pouco espaço livre (<10%)
        free_ratio = storage['free'] / storage['total']
        if free_ratio < 0.1:
            score -= 30
        elif free_ratio < 0.2:
            score -= 15

        # Penalizar pouca RAM disponível (<25%)
        ram_ratio = ram['available'] / ram['total']
        if ram_ratio < 0.25:
            score -= 20
        elif ram_ratio < 0.5:
            score -= 10

        # Penalizar CPU lenta
        if cpu['freq'] < 2000:
            score -= 15

        return max(0, min(100, score))

    def _determine_device_type(self) -> str:
        """Determinar tipo de dispositivo"""
        system = platform.system().lower()

        if system == 'windows':
            return 'desktop'
        elif system == 'darwin':
            return 'mac'
        elif system == 'linux':
            # Verificar se é mobile/tablet (simplificado)
            try:
                with open('/proc/cpuinfo', 'r') as f:
                    cpuinfo = f.read().lower()
                    if 'arm' in cpuinfo or 'aarch64' in cpuinfo:
                        return 'mobile'
            except:
                pass
            return 'linux_desktop'
        else:
            return 'unknown'

    def get_optimization_recommendations(self) -> Dict[str, Any]:
        """Gerar recomendações de otimização"""
        profile = self.get_device_profile()

        recommendations = []
        freed_mb = 0

        # Recomendações de armazenamento
        if profile.storage_free_mb < 10000:  # <10GB
            recommendations.append({
                'type': 'storage_cleanup',
                'description': 'Limpar arquivos temporários e cache',
                'estimated_freed_mb': 5000
            })
            freed_mb += 5000

        # Recomendações de memória
        if profile.ram_available_mb < 1024:  # <1GB
            recommendations.append({
                'type': 'memory_optimization',
                'description': 'Fechar aplicações desnecessárias',
                'estimated_freed_mb': 0  # Não afeta storage
            })

        # Recomendações gerais
        if profile.health_score < 70:
            recommendations.append({
                'type': 'system_maintenance',
                'description': 'Executar manutenção do sistema',
                'estimated_freed_mb': 1000
            })
            freed_mb += 1000

        return {
            'recommendations': recommendations,
            'estimated_freed_mb': freed_mb,
            'actions_proposed': len(recommendations)
        }