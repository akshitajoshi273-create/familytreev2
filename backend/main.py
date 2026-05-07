"""
Main Flask application
"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = str(Path(__file__).parent)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import get_config, Config
from routes_auth import auth_bp
from routes_family import family_bp
from routes_locations import locations_bp
from routes_admin import admin_bp
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)
    
    # Load configuration
    config = get_config()
    app.config.from_object(config)
    
    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})
    jwt = JWTManager(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(family_bp)
    app.register_blueprint(locations_bp)
    app.register_blueprint(admin_bp)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Endpoint not found',
            'error': str(error)
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'Internal server error',
            'error': str(error)
        }), 500
    
    # Health check
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Family Tree API',
            'version': '1.0.0'
        }), 200
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'message': 'Family Tree API',
            'version': '1.0.0',
            'docs': '/api/docs'
        }), 200
    
    logger.info(f"Flask app created with environment: {app.config['ENV']}")
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting server on port {port} (debug={debug})")
    app.run(host='0.0.0.0', port=port, debug=debug)
