#!/bin/bash

# Build and package the Family Tree application for distribution

VERSION="1.0.0"
PACKAGE_NAME="family-tree-app-${VERSION}"
DIST_DIR="dist"
ZIP_NAME="${PACKAGE_NAME}.zip"

echo "=========================================="
echo "Family Tree Application Packager"
echo "=========================================="
echo "Version: $VERSION"
echo ""

# Clean previous build
echo "Cleaning previous builds..."
rm -rf "$DIST_DIR" "$ZIP_NAME"

# Create distribution directory
mkdir -p "$DIST_DIR/$PACKAGE_NAME"

# Copy project files
echo "Copying project files..."
# Backend
mkdir -p "$DIST_DIR/$PACKAGE_NAME/backend"
cp -r backend/*.py "$DIST_DIR/$PACKAGE_NAME/backend/"
cp -r backend/*.txt "$DIST_DIR/$PACKAGE_NAME/backend/"
mkdir -p "$DIST_DIR/$PACKAGE_NAME/backend/uploads"

# Frontend
mkdir -p "$DIST_DIR/$PACKAGE_NAME/frontend/src"
cp -r frontend/src/* "$DIST_DIR/$PACKAGE_NAME/frontend/src/"
cp frontend/package.json "$DIST_DIR/$PACKAGE_NAME/frontend/"
cp frontend/vite.config.js "$DIST_DIR/$PACKAGE_NAME/frontend/"
cp frontend/tailwind.config.js "$DIST_DIR/$PACKAGE_NAME/frontend/"
cp frontend/postcss.config.js "$DIST_DIR/$PACKAGE_NAME/frontend/"
cp frontend/index.html "$DIST_DIR/$PACKAGE_NAME/frontend/"

# Documentation and configs
echo "Copying documentation and configuration..."
mkdir -p "$DIST_DIR/$PACKAGE_NAME/docs"
mkdir -p "$DIST_DIR/$PACKAGE_NAME/scripts"
cp docs/*.md "$DIST_DIR/$PACKAGE_NAME/docs/"
cp scripts/*.py "$DIST_DIR/$PACKAGE_NAME/scripts/" 2>/dev/null || true
cp README.md "$DIST_DIR/$PACKAGE_NAME/"
cp .env.example "$DIST_DIR/$PACKAGE_NAME/"
cp .gitignore "$DIST_DIR/$PACKAGE_NAME/"
cp docker-compose.yml "$DIST_DIR/$PACKAGE_NAME/"
cp Dockerfile.backend "$DIST_DIR/$PACKAGE_NAME/"
cp Dockerfile.frontend "$DIST_DIR/$PACKAGE_NAME/"
cp setup.sh "$DIST_DIR/$PACKAGE_NAME/"
cp setup.bat "$DIST_DIR/$PACKAGE_NAME/"
cp run.sh "$DIST_DIR/$PACKAGE_NAME/"
cp run.bat "$DIST_DIR/$PACKAGE_NAME/"

# Create .gitkeep for uploads
touch "$DIST_DIR/$PACKAGE_NAME/backend/uploads/.gitkeep"

# Create ZIP file
echo "Creating ZIP archive..."
cd "$DIST_DIR"
zip -r "../$ZIP_NAME" "$PACKAGE_NAME" -x "*.pyc" "*/.*" "*/__pycache__/*"
cd ..

# Display summary
echo ""
echo "=========================================="
echo "✅ Package created successfully!"
echo "=========================================="
echo "Package name: $ZIP_NAME"
echo "Package size: $(du -h $ZIP_NAME | cut -f1)"
echo "Location: $(pwd)/$ZIP_NAME"
echo ""
echo "📦 Contents:"
echo "  - Backend (Python Flask API)"
echo "  - Frontend (React Application)"
echo "  - Documentation"
echo "  - Setup scripts"
echo "  - Docker configuration"
echo ""
echo "📋 Next steps:"
echo "1. Extract the ZIP file"
echo "2. Run: setup.sh (Linux/Mac) or setup.bat (Windows)"
echo "3. Configure .env with Supabase credentials"
echo "4. Run: run.sh (Linux/Mac) or run.bat (Windows)"
echo ""
echo "For detailed setup instructions, see docs/SETUP.md"
