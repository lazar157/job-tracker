import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages'
import LoginPage from './pages/LoginPage' 
import RegisterPage from './pages/RegisterPage' 
import { AuthProvider } from './context/AuthContext' 
import ProtectedRoute from './components/ProtectedRoute'
import RedirectRoute from './components/RedirectRoute' 
function App() {


  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={  <RedirectRoute>
              <LoginPage />
            </RedirectRoute>} />
          <Route path="/register" element={  <RedirectRoute>
              <RegisterPage />
            </RedirectRoute>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
