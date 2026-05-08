import React from 'react'
import { useSimulation } from '../simulationContext'

export default function SimulatedDataFeed() {
  const {
    activeScenarioLabel,
    patientQueue,
    lastUpdated,
    isPaused,
    toggleSimulation,
    resetSimulation,
  } = useSimulation()

  return (
    <section className="sim-feed-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Sensor stream monitor</p>
          <h1>Simulated Patient Data</h1>
        </div>
        <div className="header-actions">
          <button type="button" className="button secondary" onClick={toggleSimulation}>
            {isPaused ? 'Start Feed' : 'Pause Feed'}
          </button>
          <button type="button" className="button primary" onClick={resetSimulation}>
            Reset Feed
          </button>
        </div>
      </header>

      <section className="sim-feed-meta">
        <span><strong>Scenario:</strong> {activeScenarioLabel}</span>
        <span><strong>Status:</strong> {isPaused ? 'Paused' : 'Streaming'}</span>
        <span><strong>Last update:</strong> {lastUpdated.toLocaleTimeString()}</span>
      </section>

      <section className="sim-feed-table-wrap" aria-label="Simulated patient live stream">
        <table className="sim-feed-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Bed</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Trend</th>
              <th>HR</th>
              <th>SpO2</th>
              <th>RR</th>
              <th>Temp</th>
              <th>Lead Signal</th>
              <th>Recent Risk Window</th>
            </tr>
          </thead>
          <tbody>
            {patientQueue.map((patient) => (
              <tr key={patient.patient_id}>
                <td>{patient.patient_id}</td>
                <td>{patient.bed}</td>
                <td>{patient.status}</td>
                <td>{patient.risk}%</td>
                <td>{patient.trend}</td>
                <td>{patient.vitals.HR}</td>
                <td>{patient.vitals.SpO2}</td>
                <td>{patient.vitals.Resp}</td>
                <td>{patient.vitals.Temp}</td>
                <td>{patient.lead}</td>
                <td>{patient.waveform.slice(-6).join(' | ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  )
}
