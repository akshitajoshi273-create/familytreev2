#!/bin/bash
set -euo pipefail

IMAGE_NAME="familytree-app:latest"

echo "Building Docker image (backend + frontend bundled)..."
docker build -f Dockerfile.backend -t ${IMAGE_NAME} .

echo "Docker image built: ${IMAGE_NAME}"
echo "\nNext steps:"
echo " - To run locally: docker run -p 5000:5000 ${IMAGE_NAME}"
echo " - To deploy on Railway using Docker, either:"
echo "     * Use the Railway web UI and point it to this repo Dockerfile, or"
echo "     * Install Railway CLI and run: railway up --dockerfile Dockerfile.backend"

exit 0
