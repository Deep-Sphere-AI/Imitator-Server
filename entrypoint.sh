#!/usr/bin/env bash
set -e

# 1. Start Ollama in the background
ollama serve &

# 2. Start your Python server (PID 1, so it receives SIGTERM)
exec python3 server.py
