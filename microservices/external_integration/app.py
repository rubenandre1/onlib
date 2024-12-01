import sys
import os
import threading
from flask import Flask, request, jsonify
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

@app.route('/sync', methods=['POST'])
def sync_data():
    with app.app_context():
        data = request.get_json()
        # Lógica para sincronizar dados com serviços externos
        return jsonify({"message": "Data synchronized"}), 200

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
    threading.Thread(target=lambda: receive_messages('sync_queue', callback)).start()
    app.run(debug=True, port=5004)