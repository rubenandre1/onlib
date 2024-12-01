import sys
import os
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

@app.route('/recommendations', methods=['GET'])
def get_recommendations():
    with app.app_context():
        user_id = request.args.get('user_id')
        recommendations = generate_recommendations(user_id)
        return jsonify(recommendations)

def generate_recommendations(user_id):
    # Lógica para gerar recomendações com base nas preferências do utilizador
    # Esta é uma implementação simplificada, podes melhorar conforme necessário
    books = Book.query.filter(Book.available == True).limit(5).all()
    recommendations = [{"id": book.id, "title": book.title, "author": book.author, "isbn": book.isbn, "available": book.available} for book in books]
    return recommendations

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
    app.run(debug=True, port=5003)