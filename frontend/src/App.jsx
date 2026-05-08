import React from 'react'

export default function App(){
  const patients = [...Array(6)].map((_,i)=>({patient_id:`P${i+1}`, risk: Math.floor(Math.random()*100)}))
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Predictive ICU Dashboard (Mock)</h1>
      <div className="grid grid-cols-3 gap-4">
        {patients.map(p=> (
          <div key={p.patient_id} className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{p.patient_id}</div>
                <div className="text-sm text-gray-500">Risk: {p.risk}</div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${p.risk>70? 'bg-red-600':'bg-green-600'}`}>
                {p.risk}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
