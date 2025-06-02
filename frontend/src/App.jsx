import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Books from './pages/Books'
import HistoryPage from './pages/HistoryPage' 
import Inscription from './pages/Inscription'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/books">Mes livres</Link></li>
            <li><Link to="/books/borrowed">Historique</Link></li>
            <li><Link to="/inscription">Inscription</Link></li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/borrowed" element={<HistoryPage />} />
            <Route path="/inscription" element={<Inscription />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
