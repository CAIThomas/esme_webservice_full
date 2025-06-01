import { useState, useEffect } from 'react'

function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://127.0.0.1:5009/books/borrowed') // Assure-toi que cette route existe côté backend
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors du chargement de l’historique')
        return res.json()
      })
      .then((data) => setHistory(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Chargement de l'historique...</p>
  if (error) return <p style={{ color: 'red' }}>❌ {error}</p>

  return (
    <div>
      <h1>Historique des emprunts</h1>
      {history.length === 0 ? (
        <p>Vous n'avez encore emprunté aucun livre.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {history.map((item) => (
            <li
              key={item.id}
              style={{
                borderBottom: '1px solid #ccc',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
              }}
            >
              <h3>{item.title}</h3>
              <p>Auteur : {item.author}</p>
              <p>Date d'emprunt : {item.borrow_date}</p>
              <p>Date de retour : {'Non retourné'}</p>
              <p>Emprunté par : {item.borrower_name}</p>

            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default HistoryPage
