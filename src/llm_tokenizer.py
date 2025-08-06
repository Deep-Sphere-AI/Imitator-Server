import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import torch

class LLM_Tokenizer():
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    def load_model(self):
        from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

        model_id = "unsloth/gemma-3n-E2B-it-unsloth-bnb-4bit"

        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4",  # o "fp4"
            bnb_4bit_compute_dtype=torch.bfloat16,  # o torch.float16 si no tienes soporte bf16
        )
        llama_model = AutoModelForCausalLM.from_pretrained(model_id, quantization_config=bnb_config)
        self.tokenizer = AutoTokenizer.from_pretrained(model_id)
        embeddings = llama_model.get_input_embeddings()
        self.all_embeddings = llama_model.get_input_embeddings().weight.data

        embeddings = embeddings.to(self.device)

        del llama_model
        torch.cuda.empty_cache()

    def embeddings_to_text(self, embeddings: torch.Tensor) -> str:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            
        embeddings = embeddings.to(device)
        embedding_matrix = self.all_embeddings.to(device)  # [V, D]

        embedding_matrix_norm = F.normalize(embedding_matrix, p=2, dim=1)  # [V, D]
        embeddings_norm = F.normalize(embeddings, p=2, dim=1)  # [T, D]

        similarities = embeddings_norm @ embedding_matrix_norm.T  # [T, V]
        token_ids = similarities.argmax(dim=1)

        #print(f"Token IDs: {token_ids}")
        return self.tokenizer.batch_decode(token_ids.cpu().tolist(), skip_special_tokens=True)