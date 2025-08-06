from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from src.keypoint_model import KeypointsModel
from src.model_inference import SignModel
from src.gemma_comunication import OllamaClient

from pydantic import BaseModel
import tempfile
import os

app = FastAPI()

signModel = SignModel()
signModel.load_model()
keypointModel = KeypointsModel()
keypointModel.load_model()
ollamaClient = OllamaClient(model="gemma3n/e2b")
ollamaClient.load_model()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

app.mount("/static", StaticFiles(directory="frontend/dist"), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse("frontend/dist/index.html")

@app.post("/process_video")
async def process_video(video: UploadFile):
    try:
        print("Embedding Output Shape: ")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            tmp.write(await video.read())
            tmp.flush()
            os.fsync(tmp.fileno())
            tmp_path = tmp.name

        keypoints = keypointModel.get_keypoints(tmp_path)
        embedding_output = signModel.inference_keypoints(keypoints)

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

class ChatResponse(BaseModel):
    reply: str

class ChatRequest(BaseModel):
    prompt: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Takes a user prompt and returns the model's reply.
    """
    try:
        reply = ollamaClient.respond(request.prompt)
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host= "0.0.0.0", port=8000)