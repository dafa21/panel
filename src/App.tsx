import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { FormDai } from './pages/FormDai'
import { Reward } from './pages/Reward'
import { Settings } from './pages/Settings'
import { History } from './pages/History'
import { WargaDashboard } from './pages/WargaDashboard'
import { LpjReport } from './pages/LpjReport'
import { LpjProvider } from './context/LpjContext'
import { PvProvider } from './context/PvContext'
import './index.css'

function App() {
  return (
    <LpjProvider>
      <PvProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/input" element={<FormDai />} />
              <Route path="/history" element={<History />} />
              <Route path="/warga/:id" element={<WargaDashboard />} />
              <Route path="/reward" element={<Reward />} />
              <Route path="/lpj" element={<LpjReport />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </PvProvider>
    </LpjProvider>
  )
}

export default App
