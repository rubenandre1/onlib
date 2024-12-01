from flask import Blueprint, request, jsonify

sync_bp = Blueprint('sync', __name__)

@sync_bp.route('/sync', methods=['POST'])
def sync_data():
    # Lógica para sincronização de dados
    return jsonify({"message": "Data synchronized successfully"}), 200