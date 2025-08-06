import ollama
from ollama import ChatResponse, ResponseError

class OllamaClient:
    def __init__(self, model: str = "gemma3n/e2b"):
        self.model = model

    def load_model(self):
        try:
            ollama.pull('gemma3n:e2b')
        except Exception as e:
            raise RuntimeError(f"Failed to pull model '{self.model}': {e}")

    def respond(self, prompt:str) -> str:
        try:
            response: ChatResponse = ollama.chat(
                model='gemma3n:e2b', 
                messages=[{'role': 'user','content': prompt}],
            )
            return response.message.content
        except ResponseError as re:
            raise RuntimeError(f"Ollama API Error: {re}")
        except Exception as e:
            raise RuntimeError(f"Failed to get response from model '{self.model}': {e}")
        
    async def respond_async(self, prompt: str) -> str:
        from ollama import AsyncClient

        client = AsyncClient()
        try:
            await client.pull(self.model)

            response = await client.chat(
                model = self.model,
                messages=[{'role': 'user','content': prompt}],
            )
            return response.message.content
        except ResponseError as re:
            raise RuntimeError(f"Ollama async API Error: {re}")
        except Exception as e:
            raise RuntimeError(f"Async call failed fom model '{self.model}': {e}")
