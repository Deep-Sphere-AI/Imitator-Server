FROM pytorch/pytorch:2.8.0-cuda12.8-cudnn9-runtime

WORKDIR /server

RUN apt-get update && \
    apt-get install --no-install-recommends -y \
    libx11-6 \
    ffmpeg \
    git \
    build-essential \
    pkg-config \
    libssl-dev \
    python3-dev \
    curl && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && \
    apt-get install --no-install-recommends -y \
    rustc \
    cargo \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://ollama.com/install.sh | sh 

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY frontend/dist /server/frontend/dist
COPY src /server/src
COPY server.py .

COPY entrypoint.sh .
ENTRYPOINT ["./entrypoint.sh"]
