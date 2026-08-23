import { BrowserRouter, Route, Routes } from 'react-router-dom'
import NavBar from './components/common/NavBar'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <NavBar />
        <main className="site-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analysis/:analysisId" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
