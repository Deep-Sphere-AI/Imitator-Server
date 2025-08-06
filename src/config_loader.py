import tomllib
from pathlib import Path

class ConfigDict(dict):
    def __getattr__(self, name):
        try:
            value = self[name]
            return ConfigDict(value) if isinstance(value, dict) else value
        except KeyError as e:
            raise AttributeError(f"No attribute or key '{name}'") from e

    def __setattr__(self, name, value):
        self[name] = value

    def __delattr__(self, name):
        del self[name]
        
def load_toml(path: str | Path) -> ConfigDict:
    with open(path, "rb") as f:
        return ConfigDict(tomllib.load(f))

class ConfigLoader:
    _instance = None

    def __new__(cls, *paths: str | Path):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.config = ConfigDict()
            for path in paths:
                cls._instance._merge(load_toml(path))
        return cls._instance

    def _merge(self, other: dict):
        self.config.update(other)

    def __getattr__(self, item):
        return getattr(self.config, item)

# Instancia global
cfg = ConfigLoader("src/config.toml")