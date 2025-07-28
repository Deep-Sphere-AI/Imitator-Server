from pathlib import Path
from os import getcwd
import tomllib

class ConfigLoader:
    def __init__(self, config_path: str|Path, base_path: str|Path = None):
        base_path = Path(base_path) if base_path else Path(f"{getcwd()}")
        self.config_path:Path = base_path / Path(config_path)
    
    def load_config(self) -> dict:
        with open(self.config_path, 'rb') as f:
            return tomllib.load(f)