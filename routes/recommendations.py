from flask import Blueprint, jsonify
from extensions import mongo

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    # Lógica para gerar recomendações
    return jsonify({"recommendations": []})