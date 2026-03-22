import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './theme.css'
import { AuthProvider } from './contexts/AuthContext'
import Landing   from './pages/Landing'
import Auth      from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Editor    from './pages/Editor'
import Preview   from './pages/Preview'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"           element={<Landing />} />
          <Route path="/auth"       element={<Auth />} />
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/editor"     element={<Editor />} />
          <Route path="/editor/:id" element={<Editor />} />
          <Route path="/p/:handle"  element={<Preview />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
