import '../App.css'
import React, { useState } from 'react'
import QuotaDisplay from '../components/QuotaDisplay'
import SubscriptionManager from '../components/SubscriptionManager'

function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [booksBorrowed, setBooksBorrowed] = useState(0)

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    fetch('http://127.0.0.1:5009/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
      .then(res => {
        if (!res.ok) throw new Error("Identifiants invalides")
        return res.json()
      })
      .then(data => {
        setUser(data)
        // 🔄 Appeler ensuite l'API pour les livres empruntés
        return fetch(`http://127.0.0.1:5009/users/${data.id}/borrowed_books`)
      })
      .then(res => res.json())
      .then(borrowed => setBooksBorrowed(borrowed.length))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const handleChangePlan = (newPlan) => {
    
    fetch(`http://localhost:5009/users/${user.id}/subscription`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription_name: newPlan }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors de la mise à jour du forfait')
        return res.json()
      })
      .then(data => {
        // Mets à jour l’état utilisateur avec le nouveau plan
        setUser(prev => ({
          ...prev,
          subscription: { name: newPlan, max_books: data.borrow_limit }
        }))
      })
      .catch(err => alert(err.message))
  }

  if (loading) return <p>🔄 Connexion en cours...</p>

  if (!user) {
    return (
      <div>
        <h1>Connexion</h1>
        <form onSubmit={handleLogin} style={{ maxWidth: '300px', margin: 'auto' }}>
          <label>Email :</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: '1rem' }}
          />
          <label>Mot de passe :</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: '1rem' }}
          />
          <button type="submit">Se connecter</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      </div>
    )
  }

  return (
    <div>
      <h1>Bienvenue, {user.first_name} 👋</h1>
      <p>Email : {user.email}</p>
      <p>Abonnement : {user.subscription?.name || 'Aucun'}</p>
      <p>Date de naissance : {user.birth_date}</p>

      <QuotaDisplay
        quotaMax={user.subscription?.max_books || 0}
        booksBorrowed={booksBorrowed}
      />
      <SubscriptionManager currentPlan={user.subscription?.name} onChangePlan={handleChangePlan} />
    </div>
  )
}

export default Home
