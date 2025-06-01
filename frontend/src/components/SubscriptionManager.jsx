import { useState } from 'react'

function SubscriptionManager({ currentPlan }) {
  const [newPlan, setNewPlan] = useState(currentPlan)

  const handleChange = (e) => {
    setNewPlan(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Forfait changé vers ${newPlan} (simulation)`)
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Modifier mon forfait</h3>
      <form onSubmit={handleSubmit}>
        <select value={newPlan} onChange={handleChange}>
          <option value="Basic">Basic (2 livres)</option>
          <option value="Standard">Standard (5 livres)</option>
          <option value="Premium">Premium (10 livres)</option>
        </select>
        <button type="submit" style={{ marginLeft: '1rem' }}>Mettre à jour</button>
      </form>
      <p style={{ marginTop: '1rem' }}>Forfait actuel : <strong>{currentPlan}</strong></p>
    </div>
  )
}

export default SubscriptionManager
