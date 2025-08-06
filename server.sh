docker build -t chat-server .

docker run \
  --gpus all \
  --restart unless-stopped \
  -p 8000:8000 \
  -v "$(pwd)/Assets:/server/Assets:ro" \
  -p 11434:11434 \
  chat-server