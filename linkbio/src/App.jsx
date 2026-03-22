import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './theme.css'
import Landing from './pages/Landing'
import Editor  from './pages/Editor'
import Preview from './pages/Preview'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/editor"    element={<Editor />} />
        <Route path="/p/:handle" element={<Preview />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
