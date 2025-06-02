from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship

db = SQLAlchemy()

# 🔸 Association : emprunts
class UserBook(db.Model):
    __tablename__ = 'user_book'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    borrow_date = db.Column(db.DateTime, nullable=False)
    return_date = db.Column(db.DateTime)

    user = relationship("User", back_populates="user_books")
    book = relationship("Book", back_populates="user_books")

# 🔹 Livre
class Book(db.Model):
    __tablename__ = 'book'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    published_at = db.Column(db.DateTime)

    user_books = relationship("UserBook", back_populates="book", cascade="all, delete-orphan")
    borrowers = relationship("User", secondary="user_book", viewonly=True)


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    birth_date = db.Column(db.Date)
    password=db.Column(db.String(20), unique=True, nullable=False)
    subscription_id = db.Column(db.Integer, db.ForeignKey('subscription.id'))
    subscription = db.relationship('Subscription')

    user_books = db.relationship("UserBook", back_populates="user", cascade="all, delete-orphan")
    borrowed_books = db.relationship("Book", secondary="user_book", viewonly=True)

# 📌 Abonnement

class Subscription(db.Model):
    __tablename__ = 'subscription'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)  # basic, standard, premium
    max_books = db.Column(db.Integer, nullable=False)  # 1, 3, -1

    users = db.relationship('User', back_populates='subscription')