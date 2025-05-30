from flask import Blueprint, request, jsonify
from models import db, Book, User, UserBook 
from datetime import datetime

users_bp = Blueprint('users', __name__)
books_bp = Blueprint('borrow', __name__)  


# 🔹 Emprunter un livre
@books_bp.route('/borrow', methods=['POST'])
def borrow_book():
    data = request.get_json()
    user_id = data.get('user_id')
    book_id = data.get('book_id')

    if not user_id or not book_id:
        return jsonify({'error': 'user_id and book_id are required'}), 400

    # Vérifier si le livre existe
    book = Book.query.get(book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404

    # Vérifier si l'utilisateur existe
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Vérifier si l'utilisateur a un abonnement
    if not user.subscription:
        return jsonify({'error': 'User has no active subscription'}), 403

    # Vérifier si le livre est déjà emprunté
    existing_borrow = UserBook.query.filter_by(book_id=book_id, return_date=None).first()
    if existing_borrow:
        return jsonify({'error': 'Book is already borrowed'}), 409

    # Vérifier le nombre de livres empruntés
    current_loans = UserBook.query.filter_by(user_id=user_id, return_date=None).count()
    
    # Premium: max_books = -1 (illimité)
    if user.subscription.max_books != -1 and current_loans >= user.subscription.max_books:
        return jsonify({
            'error': f'Borrow limit reached for {user.subscription.name} subscription',
            'current_borrowed': current_loans,
            'max_allowed': user.subscription.max_books
        }), 403

    # Enregistrer l'emprunt
    borrow = UserBook(
        user_id=user_id,
        book_id=book_id,
        borrow_date=datetime.utcnow()
    )
    db.session.add(borrow)
    db.session.commit()

    return jsonify({
        'message': 'Book successfully borrowed',
        'current_borrowed': current_loans + 1,
        'max_allowed': user.subscription.max_books
    })

# 🔹 Retourner un livre
@books_bp.route('/return', methods=['POST'])
def return_book():
    data = request.get_json()
    user_id = data.get('user_id')
    book_id = data.get('book_id')

    if not user_id or not book_id:
        return jsonify({'error': 'user_id and book_id are required'}), 400

    borrow_record = UserBook.query.filter_by(
        user_id=user_id,
        book_id=book_id,
        return_date=None
    ).first()

    if not borrow_record:
        return jsonify({'error': 'No active borrow record found for this user and book'}), 404

    borrow_record.return_date = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Book successfully returned'})

# 🔹 Livres empruntés par un utilisateur
@users_bp.route('/users/<int:id>/borrowed_books', methods=['GET'])
def get_borrowed_books_for_user(id):
    records = UserBook.query.filter_by(user_id=id, return_date=None).all()
    result = []
    for record in records:
        book = Book.query.get(record.book_id)
        result.append({
            'book_id': book.id,
            'title': book.title,
            'author': book.author,
            'borrow_date': record.borrow_date.strftime('%Y-%m-%d')
        })
    return jsonify(result)

# 🔹 Tous les livres empruntés (non retournés)
@books_bp.route('/books/borrowed', methods=['GET'])
def get_borrowed_books():
    borrowed = UserBook.query.filter_by(return_date=None).all()
    result = []
    for record in borrowed:
        book = Book.query.get(record.book_id)
        user = User.query.get(record.user_id)
        result.append({
            'book_id': book.id,
            'title': book.title,
            'author': book.author,
            'borrow_date': record.borrow_date.strftime('%Y-%m-%d'),
            'borrower_id': record.user_id,
            'borrower_name': f"{user.first_name} {user.last_name}",
            'borrower_subscription': user.subscription.name if user.subscription else None
        })
    return jsonify(result)

