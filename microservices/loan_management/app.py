import sys
import os
from flask import Flask, request, jsonify
import pika
import json
from datetime import datetime, timezone, timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

# Adicionar o caminho da raiz do projeto ao sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from extensions import db
from models import Loan, Book

app = Flask(__name__)

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Salsa.0700@localhost/onlib'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuração do JWT
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
jwt = JWTManager(app)

db.init_app(app)

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    if username != 'user1' or password != '1password':
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)

def send_notification(user_id, message):
    notification_message = {"user_id": user_id, "message": message}
    send_message('notification_queue', notification_message)

@app.route('/loans', methods=['POST'])
@jwt_required()
def create_loan():
    with app.app_context():
        data = request.get_json()
        user_id = data['user_id']
        book_id = data['book_id']
        
        # Usar a sessão para obter o livro
        book = db.session.get(Book, book_id)
        
        if book and book.available:
            book.available = False
            loan = Loan(user_id=user_id, book_id=book_id, loan_date=datetime.now(timezone.utc))
            db.session.add(loan)
            db.session.commit()
            send_message('loan_queue', {'user_id': user_id, 'book_id': book_id})
            send_notification(user_id, f"Empréstimo do livro '{book.title}' confirmado.")
            return jsonify({"message": "Loan created"}), 200
        return jsonify({"message": "Book not available"}), 400

@app.route('/loans/return', methods=['PUT'])
@jwt_required()
def return_loan():
    with app.app_context():
        data = request.get_json()
        loan_id = data['loan_id']
        
        # Usar a sessão para obter o empréstimo
        loan = db.session.get(Loan, loan_id)
        
        if loan:
            loan.return_date = datetime.now(timezone.utc)
            book = db.session.get(Book, loan.book_id)
            book.available = True
            db.session.commit()
            send_message('return_queue', {'loan_id': loan_id, 'book_id': loan.book_id})
            send_notification(loan.user_id, f"Devolução do livro '{book.title}' confirmada.")
            return jsonify({"message": "Loan returned"}), 200
        return jsonify({"message": "Loan not found"}), 400

def send_message(queue, message):
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost',
        virtual_host='/onlib_vhost',
        credentials=pika.PlainCredentials('onlib_admin', 'Slb.1904')
    ))
    channel = connection.channel()
    channel.queue_declare(queue=queue)
    channel.basic_publish(exchange='', routing_key=queue, body=json.dumps(message))
    connection.close()

def receive_messages(queue, callback):
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost',
        virtual_host='/onlib_vhost',
        credentials=pika.PlainCredentials('onlib_admin', 'Slb.1904')
    ))
    channel = connection.channel()
    channel.queue_declare(queue=queue)
    channel.basic_consume(queue=queue, on_message_callback=callback, auto_ack=True)
    print('Waiting for messages...')
    channel.start_consuming()

if __name__ == '__main__':
    app.run(debug=True, port=5002)