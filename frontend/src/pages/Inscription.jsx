import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Inscription() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    birth_date: '',
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

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
        setTimeout(() => navigate('/'), 2000) // redirige après 2s
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }


  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Créer un compte</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="first_name"
          placeholder="Prénom"
          value={formData.first_name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="last_name"
          placeholder="Nom"
          value={formData.last_name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Adresse e-mail"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="date"
          name="birth_date"
          value={formData.birth_date}
          onChange={handleChange}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>S'inscrire</button>
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
      </form>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '3rem auto',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#333'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    padding: '10px',
    marginBottom: '1rem',
    border: '1px solid #ccc',
    borderRadius: '6px'
  },
  button: {
    padding: '10px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  error: {
    color: 'red',
    marginTop: '1rem'
  },
  success: {
    color: 'green',
    marginTop: '1rem'
  }
}
export default Inscription
