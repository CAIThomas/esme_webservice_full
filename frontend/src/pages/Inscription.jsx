import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Inscription() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    subscription_name: '',
  })

  const [subscriptions, setSubscriptions] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    fetch('http://127.0.0.1:5009/subscriptions')
      .then(res => res.json())
      .then(data => setSubscriptions(data))
      .catch(() => setError('Impossible de charger les abonnements'))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    fetch('http://127.0.0.1:5009/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Erreur inconnue")
        setSuccess("Compte créé avec succès !")
        setTimeout(() => navigate('/'), 2000)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      <h1>Créer un compte</h1>
      <form onSubmit={handleSubmit}>

        {/* Prénom */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1em' }}>
          <label htmlFor="first_name">Prénom :</label>
          <input id="first_name" type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>

        {/* Nom */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1em' }}>
          <label htmlFor="last_name">Nom :</label>
          <input id="last_name" type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>

        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1em' }}>
          <label htmlFor="email">Email :</label>
          <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        {/* Mot de passe */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1em' }}>
          <label htmlFor="password">Mot de passe :</label>
          <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>

        {/* Date de naissance */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1em' }}>
          <label htmlFor="birth_date">Date de naissance :</label>
          <input id="birth_date" type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} />
        </div>

        {/* Subscription */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1em' }}>
          <label htmlFor="subscription_name">Abonnement :</label>
          <select
            id="subscription_name"
            name="subscription_name"
            value={formData.subscription_name}
            onChange={handleChange}
            required
          >
            <option value="">-- Choisissez un abonnement --</option>
            {subscriptions.map(sub => (
              <option key={sub.id} value={sub.name}>
                {sub.name.charAt(0).toUpperCase() + sub.name.slice(1)} ({sub.max_books === -1 ? 'Illimité' : sub.max_books + ' livres'})
              </option>
              ))}
          </select>

        </div>

        <button type="submit" disabled={loading} style={{ padding: '0.5em 1em' }}>
          {loading ? "Création en cours..." : "S'inscrire"}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </form>
    </div>
  )
}

export default Inscription
