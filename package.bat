@echo off
REM Build and package the Family Tree application for distribution

setlocal enabledelayedexpansion

set VERSION=1.0.0
set PACKAGE_NAME=family-tree-app-%VERSION%
set DIST_DIR=dist
set ZIP_NAME=%PACKAGE_NAME%.zip

echo.
echo ==========================================
echo Family Tree Application Packager
echo ==========================================
echo Version: %VERSION%
echo.

REM Clean previous build
echo Cleaning previous builds...
if exist %DIST_DIR% rmdir /s /q %DIST_DIR%
if exist %ZIP_NAME% del %ZIP_NAME%

REM Create distribution directory
echo Creating directory structure...
mkdir %DIST_DIR%\%PACKAGE_NAME%
mkdir %DIST_DIR%\%PACKAGE_NAME%\backend
mkdir %DIST_DIR%\%PACKAGE_NAME%\frontend\src
mkdir %DIST_DIR%\%PACKAGE_NAME%\docs
mkdir %DIST_DIR%\%PACKAGE_NAME%\scripts
mkdir %DIST_DIR%\%PACKAGE_NAME%\backend\uploads

REM Copy backend files
echo Copying backend files...
xcopy backend\*.py %DIST_DIR%\%PACKAGE_NAME%\backend\ /Y
xcopy backend\*.txt %DIST_DIR%\%PACKAGE_NAME%\backend\ /Y

REM Copy frontend files
echo Copying frontend files...
xcopy frontend\src\* %DIST_DIR%\%PACKAGE_NAME%\frontend\src\ /E /Y
copy frontend\package.json %DIST_DIR%\%PACKAGE_NAME%\frontend\
copy frontend\vite.config.js %DIST_DIR%\%PACKAGE_NAME%\frontend\
copy frontend\tailwind.config.js %DIST_DIR%\%PACKAGE_NAME%\frontend\
copy frontend\postcss.config.js %DIST_DIR%\%PACKAGE_NAME%\frontend\
copy frontend\index.html %DIST_DIR%\%PACKAGE_NAME%\frontend\

REM Copy documentation
echo Copying documentation and configuration...
xcopy docs\*.md %DIST_DIR%\%PACKAGE_NAME%\docs\ /Y
copy README.md %DIST_DIR%\%PACKAGE_NAME%\
copy .env.example %DIST_DIR%\%PACKAGE_NAME%\
copy .gitignore %DIST_DIR%\%PACKAGE_NAME%\
copy docker-compose.yml %DIST_DIR%\%PACKAGE_NAME%\
copy Dockerfile.backend %DIST_DIR%\%PACKAGE_NAME%\
copy Dockerfile.frontend %DIST_DIR%\%PACKAGE_NAME%\
copy setup.bat %DIST_DIR%\%PACKAGE_NAME%\
copy setup.sh %DIST_DIR%\%PACKAGE_NAME%\
copy run.bat %DIST_DIR%\%PACKAGE_NAME%\
copy run.sh %DIST_DIR%\%PACKAGE_NAME%\

REM Create .gitkeep
echo. > %DIST_DIR%\%PACKAGE_NAME%\backend\uploads\.gitkeep

echo.
echo ==========================================
echo Creating ZIP archive...
echo ==========================================

REM You need 7-Zip or another tool installed for this
REM If you don't have 7-Zip, you can use Windows built-in compression
powershell -nologo -noprofile -command "& { Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory('.\\!DIST_DIR!\!PACKAGE_NAME!', '.\\!ZIP_NAME!'); }"

if exist %ZIP_NAME% (
    echo.
    echo ==========================================
    echo ✅ Package created successfully!
    echo ==========================================
    echo Package name: %ZIP_NAME%
    REM Get file size
    for %%A in (%ZIP_NAME%) do set SIZE=%%~zA
    echo Package size: %SIZE% bytes
    echo Location: %CD%\%ZIP_NAME%
    echo.
    echo 📦 Contents:
    echo   - Backend (Python Flask API^)
    echo   - Frontend (React Application^)
    echo   - Documentation
    echo   - Setup scripts
    echo   - Docker configuration
    echo.
    echo 📋 Next steps:
    echo 1. Extract the ZIP file
    echo 2. Run: setup.bat (Windows^) or setup.sh (Linux/Mac^)
    echo 3. Configure .env with Supabase credentials
    echo 4. Run: run.bat (Windows^) or run.sh (Linux/Mac^)
    echo.
    echo For detailed setup instructions, see docs/SETUP.md
) else (
    echo.
    echo ❌ Failed to create ZIP file
    echo Please ensure 7-Zip or PowerShell is available
)

pause
