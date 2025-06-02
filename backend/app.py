from flask import Flask
from config import Config
from models import db
from routes.users import users_bp
from routes.subscription import subscription_bp
from flask_migrate import Migrate
from routes.books import books_bp as books_routes_bp
from routes.borrow import books_bp as borrow_routes_bp
from flask_cors import CORS



app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

db.init_app(app)
migrate = Migrate(app, db)

app.register_blueprint(books_routes_bp)
app.register_blueprint(borrow_routes_bp)
app.register_blueprint(users_bp)
app.register_blueprint(subscription_bp)
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')



