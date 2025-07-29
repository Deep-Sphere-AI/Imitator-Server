from fastapi import FastAPI, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from src.keypoint_model import Keypoints_Model
from src.model_inference import Model

import tempfile
import os

app = FastAPI()
#model = Model(102, 1, 1)
keypointModel = Keypoints_Model()

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
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            tmp.write(await video.read())
            tmp.flush()
            os.fsync(tmp.fileno())
            tmp_path = tmp.name

        keypoints = keypointModel.get_keypoints(tmp_path)
        
        #embedding_output = model.inference_keypoints(keypoints)

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host= "0.0.0.0", port=8000)