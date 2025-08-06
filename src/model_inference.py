import torch
import os
from .models.imitator import Imitator
from .config_loader import cfg
from .paths import path_vars
import numpy as np
from .llm_tokenizer import LLM_Tokenizer

class SignModel():
    def __init__(self):
        self.state_location = f"Assets/Models/checkpoint.pth"
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.llm_tokenizer = LLM_Tokenizer()
        self.llm_tokenizer.load_model()

        self.load_model()

    def load_model(self):

        model_cfg = cfg.model

        adjacency_matrix = np.load(path_vars.A_matrix, allow_pickle=True)

        model = Imitator(A=adjacency_matrix, **model_cfg)
        state_dict = torch.load(os.path.join(os.getcwd(), self.state_location))
        model.load_state_dict(state_dict["model_state"])
        self.imitator_model = model
        self.imitator_model.to(self.device).eval()

    def inference_keypoints(self, keypoints):
        keypoints_batch = keypoints.view(keypoints.size(0), keypoints.size(1), 2).unsqueeze(0)
        keypoints_batch = keypoints_batch.to(torch.float32).to(self.device)

        mask = torch.zeros(1, keypoints_batch.size(1))
        mask = mask.to(self.device)

        with torch.no_grad():
            output = self.imitator_model(keypoints_batch, mask)

        return self.llm_tokenizer.embeddings_to_text(output)