import pytest
from packages.bridge.agent.device_profiler import DeviceProfiler


def test_device_profile_contains_expected_fields():
    profiler = DeviceProfiler()
    profile = profiler.get_device_profile()

    assert profile.device_type in {'desktop', 'mac', 'linux_desktop', 'mobile', 'unknown'}
    assert isinstance(profile.os, str)
    assert isinstance(profile.os_version, str)
    assert isinstance(profile.architecture, str)
    assert isinstance(profile.storage_total_mb, int)
    assert isinstance(profile.storage_free_mb, int)
    assert isinstance(profile.ram_total_mb, int)
    assert isinstance(profile.ram_available_mb, int)
    assert isinstance(profile.cpu_cores, int)
    assert isinstance(profile.cpu_freq_mhz, (int, float))
    assert isinstance(profile.health_score, int)
    assert 0 <= profile.health_score <= 100


def test_device_profile_capabilities_keys():
    profiler = DeviceProfiler()
    profile = profiler.get_device_profile()

    assert 'gpu_acceleration' in profile.capabilities
    assert 'large_storage' in profile.capabilities
    assert 'high_memory' in profile.capabilities
    assert 'fast_cpu' in profile.capabilities
    assert 'network_access' in profile.capabilities
    assert 'offline_mode' in profile.capabilities


if __name__ == '__main__':
    pytest.main([__file__])