from flask import Blueprint, jsonify ,Flask, request
from models import db, User, Subscription

subscription_bp = Blueprint('subscriptions', __name__)

@subscription_bp.route('/init-subscriptions', methods=['POST'])
def init_subscriptions():
    # Vérifier si les abonnements existent déjà
    existing = Subscription.query.count()
    if existing > 0:
        return jsonify({'message': 'Subscriptions already exist'}), 200

    subscriptions = [
        Subscription(name='basic', max_books=1),
        Subscription(name='standard', max_books=3),
        Subscription(name='premium', max_books=-1),  # -1 pour illimité
    ]

    db.session.add_all(subscriptions)
    db.session.commit()
    return jsonify({'message': 'Subscriptions initialized'}), 201

@subscription_bp.route('/subscriptions', methods=['GET'])
def list_subscriptions():
    subs = Subscription.query.all()
    return jsonify([
        {'id': s.id, 'name': s.name, 'max_books': s.max_books}
        for s in subs
    ])

@subscription_bp.route('/user/<int:user_id>/subscription', methods=['PUT'])
def update_user_subscription(user_id):
    data = request.json
    subscription_name = data.get('subscription_name')
    
    # Cherche l'utilisateur
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    # Cherche le nouvel abonnement
    new_subscription = Subscription.query.filter_by(name=subscription_name).first()
    if not new_subscription:
        return jsonify({"message": "Subscription not found"}), 404
    
    # Vérifie le nombre de livres actuellement empruntés
    current_loans = len([ub for ub in user.borrowed_books if ub.return_date is None])

    # Si la nouvelle limite est inférieure au nombre de livres empruntés
    if new_subscription.max_books != -1 and current_loans > new_subscription.max_books:
        return jsonify({
            "message": "Cannot downgrade subscription",
            "reason": f"User currently has {current_loans} borrowed books. Limit for '{new_subscription.name}' is {new_subscription.max_books}.",
            "suggestion": "Please return some books before downgrading."
        }), 403

    # Mise à jour de l’abonnement
    user.subscription = new_subscription
    db.session.commit()
    
    return jsonify({"message": "User subscription updated successfully"})
