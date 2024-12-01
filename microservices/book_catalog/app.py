import sys
import os
import threading
from flask import Flask, jsonify, request
import pika
import json

# Adicionar o caminho da raiz do projeto ao sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from extensions import db
from models import Book

app = Flask(__name__)

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Salsa.0700@localhost/onlib'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route('/books', methods=['GET'])
def get_books():
    with app.app_context():
        books = Book.query.all()
        books_list = [{"id": book.id, "title": book.title, "author": book.author, "isbn": book.isbn, "available": book.available} for book in books]
        return jsonify(books_list)

@app.route('/books/search', methods=['GET'])
def search_books():
    with app.app_context():
        title = request.args.get('title')
        author = request.args.get('author')
        isbn = request.args.get('isbn')
        query = Book.query
        
        if title:
            query = query.filter(Book.title.ilike(f'%{title}%'))
        if author:
            query = query.filter(Book.author.ilike(f'%{author}%'))
        if isbn:
            query = query.filter(Book.isbn.ilike(f'%{isbn}%'))
        
        books = query.all()
        books_list = [{"id": book.id, "title": book.title, "author": book.author, "isbn": book.isbn, "available": book.available} for book in books]
        return jsonify(books_list)

@app.route('/books', methods=['POST'])
def add_book():
    with app.app_context():
        data = request.get_json()
        book = Book(title=data['title'], author=data['author'], isbn=data['isbn'], available=True)
        db.session.add(book)
        db.session.commit()
        send_notification(f"Novo livro adicionado: {book.title}")
        return jsonify({"message": "Book added"}), 201

@app.route('/books/<int:id>', methods=['PUT'])
def update_book(id):
    with app.app_context():
        data = request.get_json()
        book = Book.query.get(id)
        if book:
            book.title = data['title']
            book.author = data['author']
            book.isbn = data['isbn']
            db.session.commit()
            send_notification(f"Livro atualizado: {book.title}")
            return jsonify({"message": "Book updated"}), 200
        return jsonify({"message": "Book not found"}), 404

def send_notification(message):
    send_message('notification_queue', {"message": message})

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

def callback(ch, method, properties, body):
    print(f"Received: {body}")

if __name__ == '__main__':
    threading.Thread(target=lambda: receive_messages('loan_queue', callback)).start()
    app.run(debug=True, port=5001)
