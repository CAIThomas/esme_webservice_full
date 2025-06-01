import React from 'react'

function QuotaDisplay({ quotaMax, booksBorrowed }) {
  const quotaRestant = quotaMax - booksBorrowed

  return (
    <div style={{
      margin: '2rem auto',
      padding: '1rem',
      maxWidth: '400px',
      border: '1px solid #ccc',
      borderRadius: '10px',
      backgroundColor: '#f5f5f5',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <h2>📦 Quota d’emprunt</h2>
      <p><strong>Livres empruntés :</strong> {booksBorrowed} / {quotaMax}</p>
      <p style={{ color: quotaRestant === 0 ? 'red' : 'green' }}>
        🔓 Quota restant : <strong>{quotaRestant}</strong>
      </p>
      {quotaRestant === 0 && (
        <p style={{ color: 'red', marginTop: '1rem' }}>
          ⚠️ Vous avez atteint votre quota maximum.
        </p>
      )}
    </div>
  )
}

export default QuotaDisplay
