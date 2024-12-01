from flask import Flask
from extensions import db, mongo

app = Flask(__name__)

# Configuração MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Salsa.0700@localhost/onlib'
db.init_app(app)

# Configuração MongoDB
app.config["MONGO_URI"] = "mongodb://localhost:27017/onlib"
mongo.init_app(app)

# Importar e registrar blueprints
from routes.books import books_bp
from routes.borrow import borrow_bp
from routes.returns import returns_bp
from routes.recommendations import recommendations_bp
from routes.sync import sync_bp

app.register_blueprint(books_bp)
app.register_blueprint(borrow_bp)
app.register_blueprint(returns_bp)
app.register_blueprint(recommendations_bp)
app.register_blueprint(sync_bp)

# Garantir que as tabelas são criadas
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)