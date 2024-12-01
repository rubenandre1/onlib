from flask import Blueprint, request, jsonify
from extensions import db
from models import Loan, Book
from datetime import datetime

returns_bp = Blueprint('returns', __name__)

@returns_bp.route('/return', methods=['PUT'])
def return_book():
    data = request.get_json()
    loan_id = data['loan_id']
    loan = Loan.query.get(loan_id)
    if loan:
        loan.return_date = datetime.utcnow()
        book = Book.query.get(loan.book_id)
        book.available = True
        db.session.commit()
        return jsonify({"message": "Book returned successfully"}), 200
    return jsonify({"message": "Loan not found"}), 400
