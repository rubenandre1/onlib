from flask import Blueprint, request, jsonify
from extensions import db
from models import Loan, Book
from datetime import datetime

borrow_bp = Blueprint('borrow', __name__)

@borrow_bp.route('/borrow', methods=['POST'])
def borrow_book():
    data = request.get_json()
    user_id = data['user_id']
    book_id = data['book_id']
    book = Book.query.get(book_id)
    if book and book.available:
        book.available = False
        loan = Loan(user_id=user_id, book_id=book_id, loan_date=datetime.utcnow())
        db.session.add(loan)
        db.session.commit()
        return jsonify({"message": "Book borrowed successfully"}), 200
    return jsonify({"message": "Book not available"}), 400
