import torch

class LLM_Tokenizer():
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_location = "Assets/Gemma/gemma_embedding_matrix.pt"

    def load_model(self):
        self.model = torch.load(self.model_location)
        self.model = self.model.to(self.device)

    def embedding_conversion(self, embeddings):
        similarities = torch.matmul(embeddings, self.model)
        best_idx = torch.argmax(similarities)
        