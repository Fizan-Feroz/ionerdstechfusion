import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import TrainingConfig from './components/TrainingConfig'
import TrainingMonitor from './components/TrainingMonitor'
import TrainingJobsList from './components/TrainingJobsList'

function Dashboard() {
  const patients = [...Array(6)].map((_,i)=>({patient_id:`P${i+1}`, risk: Math.floor(Math.random()*100)}))
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-gray-800">Predictive ICU System</h1>
            <div className="flex gap-6">
              <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link to="/training" className="text-gray-600 hover:text-blue-600 font-medium">
                Training
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Patient Risk Dashboard (Mock)</h2>
          <div className="grid grid-cols-3 gap-4">
            {patients.map(p=> (
              <div key={p.patient_id} className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg text-gray-800">{p.patient_id}</div>
                    <div className="text-sm text-gray-500">Risk Score</div>
                  </div>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${p.risk>70? 'bg-red-600':'bg-green-600'}`}>
                    {p.risk}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/training" element={<TrainingJobsList />} />
        <Route path="/training/new" element={<TrainingConfig />} />
        <Route path="/training/:jobId" element={<TrainingMonitor />} />
      </Routes>
    </BrowserRouter>
  )
}
