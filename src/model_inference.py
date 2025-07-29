import torch
import os
from .models.imitator import Imitator
from .config_loader import ConfigLoader

class Model():
    def __init__(self, model_version, model_checkpoint, epoch):
        self.state_location = f"Assets/Models/{model_version}/{model_checkpoint}/{epoch}/checkpoint.pth"
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.load_model()

    def load_model(self):
        model_parameters = ConfigLoader("src/config.toml").load_config()
        model_parameters.update({
            "input_size": 133 * 2,
            "output_size": 3072,
            "use_checkpoint": False
        })

        model = Imitator(**model_parameters)
        state_dict = torch.load(os.path.join(os.getcwd(), self.state_location))
        model.load_state_dict(state_dict["model_state"])
        self.imitator_model = model
        self.imitator_model.to(self.device).eval()

    def inference_keypoints(self, keypoints):
        keypoints_batch = keypoints.view(keypoints.size(0), keypoints.size(1)//2, 2).unsqueeze(0)
        keypoints_batch = keypoints_batch.to(self.device)

        mask = torch.zeros(1, keypoints_batch.size(1))
        mask = mask.to(self.device)

        with torch.no_grad():
            output = self.imitator_model(keypoints_batch, mask)