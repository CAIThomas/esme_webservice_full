import '../App.css'
import React, { useEffect, useState } from 'react'
import QuotaDisplay from '../components/QuotaDisplay'
import SubscriptionManager from '../components/SubscriptionManager'

function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Appelle une API fictive pour récupérer les infos de l'utilisateur
    fetch('http://127.0.0.1:5009/user') // à adapter selon ton backend
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des données utilisateur')
        return res.json()
      })
      .then(data => setUser(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Chargement des données utilisateur...</p>
  if (error) return <p style={{ color: 'red' }}>❌ {error}</p>

  return (
    <div>
      <h1>Bienvenue, {user.name} 👋</h1>

      <QuotaDisplay quotaMax={user.quota_max} booksBorrowed={user.books_borrowed} />

      <SubscriptionManager currentPlan={user.plan} />
    </div>
  )
}

export default Home
