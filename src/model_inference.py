import torch
import os
from torch.serialization import add_safe_globals
from torch._dynamo.eval_frame import OptimizedModule

class Model():
    def __init__(self, model_version, model_checkpoint, epoch):
        self.model_location = f"Assets/Models/{model_version}/{model_checkpoint}/{epoch}/model.pt"
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        add_safe_globals([OptimizedModule])
        self.load_model()

    def load_model(self):
        checkpoint = torch.load(self.model_location, map_location=self.device, weights_only=True)
        model_raw = getattr(checkpoint, "_orig_mod", checkpoint)
        if hasattr(model_raw, "module"):
            model_raw = model_raw.module
        self.imitator_model = model_raw
        self.imitator_model.to(self.device).eval()

    def inference_keypoints(self, keypoints):
        keypoints_batch = keypoints.view(keypoints.size(0), keypoints.size(1)//2, 2).unsqueeze(0)
        keypoints_batch = keypoints_batch.to(self.device)

        mask = torch.zeros(1, keypoints_batch.size(1))
        mask = mask.to(self.device)

        with torch.no_grad():
            output = self.imitator_model(keypoints_batch, mask)