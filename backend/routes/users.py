from flask import Blueprint, request, jsonify
from models import db, User, Book, UserBook, Subscription
from datetime import datetime
from sqlalchemy.orm import joinedload
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

users_bp = Blueprint('users', __name__)

# 🔹 Récupérer tous les utilisateurs (avec pagination)
@users_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.options(joinedload(User.subscription)).all()  # Charge la relation subscription
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "birth_date": user.birth_date.isoformat(),
            "subscription": {
                "id": user.subscription.id,
                "name": user.subscription.name,
                "max_books": user.subscription.max_books
            } if user.subscription else None
        })
    return jsonify({
        "page": 1,
        "per_page": 10,
        "total": len(result),
        "users": result
    })

# 🔹 Récupérer un utilisateur par ID
@users_bp.route('/users/<int:id>', methods=['GET'])
def get_user(id):
    user = User.query.get_or_404(id, description="User not found")
    return jsonify({
        'id': user.id,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'birth_date': user.birth_date.strftime('%Y-%m-%d') if user.birth_date else None,
        'email': user.email,
        'subscription': user.subscription.name if user.subscription else None
    })


# 🔹 Ajouter un utilisateur
@users_bp.route('/users', methods=['POST'])
def add_user():
    data = request.get_json()

    if not data or 'first_name' not in data or 'last_name' not in data or 'email' not in data:
       return jsonify({'error': 'first_name, last_name, and email are required'}), 400
    
    if 'password' not in data:
        return jsonify({'error': 'Password is required'}), 400

    birth_date = None
    if 'birth_date' in data:
        try:
            birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format, expected YYYY-MM-DD'}), 400

    subscription = None
    if 'subscription_name' in data:
        subscription = Subscription.query.filter_by(name=data['subscription_name']).first()
        if not subscription:
            return jsonify({'error': 'Subscription not found'}), 404

    # Vérifier que l'email est unique
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400

    new_user = User(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        password=data['password'],
        birth_date=birth_date,
        subscription=subscription
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully', 'user_id': new_user.id}), 201


# 🔹 Mettre à jour un utilisateur
@users_bp.route('/users/<int:id>', methods=['PUT'])
def update_user(id):
    user = User.query.get_or_404(id, description="User not found")

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'email' in data:
        user.email = data['email']
    if 'birth_date' in data:
        try:
            user.birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format, expected YYYY-MM-DD'}), 400

    db.session.commit()
    return jsonify({'message': 'User updated successfully'})

# 🔹 Modifier l'abonnement d'un utilisateur
@users_bp.route('/users/<int:id>/subscription', methods=['PUT'])
def update_subscription(id):
    user = User.query.get_or_404(id, description="User not found")
    data = request.get_json()

    if not data or 'subscription_name' not in data:
        return jsonify({'error': 'subscription_name is required'}), 400

    subscription = Subscription.query.filter_by(name=data['subscription_name']).first()
    if not subscription:
        return jsonify({'error': 'Subscription not found'}), 404

    # Vérifier le nombre de livres actuellement empruntés
    current_loans = UserBook.query.filter_by(user_id=id, return_date=None).count()
    
    # Si le nouvel abonnement a une limite inférieure au nombre de livres empruntés
    if subscription.max_books != -1 and current_loans > subscription.max_books:
        return jsonify({
            'error': f'Cannot switch to {subscription.name} subscription while having {current_loans} books borrowed',
            'current_borrowed': current_loans,
            'new_limit': subscription.max_books
        }), 400

    user.subscription = subscription
    db.session.commit()
    
    return jsonify({
        'message': f'Subscription updated to {subscription.name} successfully',
        'borrow_limit': subscription.max_books,
        'current_borrowed': current_loans
    })

# 🔹 Supprimer un utilisateur
@users_bp.route('/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get_or_404(id, description="User not found")

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'})


# 🔹 Récupérer les livres empruntés par un utilisateur
@users_bp.route('/users/<int:id>/borrowed_books', methods=['GET'])
def get_borrowed_books_for_user(id):
    borrowings = UserBook.query.filter_by(user_id=id, return_date=None).all()
    result = []
    for b in borrowings:
        book = Book.query.get(b.book_id)
        result.append({
            'book_id': book.id,
            'title': book.title,
            'borrow_date': b.borrow_date.strftime('%Y-%m-%d')
        })
    return jsonify(result)

# 🔹 Connexion utilisateur (mot de passe en clair)
@users_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400

    # Recherche de l'utilisateur par email et mot de passe
    user = User.query.options(joinedload(User.subscription)).filter_by(
        email=data['email'],
        password=data['password']
    ).first()

    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'birth_date': user.birth_date.isoformat() if user.birth_date else None,
        'subscription': {
            'id': user.subscription.id,
            'name': user.subscription.name,
            'max_books': user.subscription.max_books
        } if user.subscription else None
    })
