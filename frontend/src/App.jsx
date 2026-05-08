import React, { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import TrainingConfig from './components/TrainingConfig'
import TrainingMonitor from './components/TrainingMonitor'
import TrainingJobsList from './components/TrainingJobsList'

const BASE_PATIENTS = [
  {
    patient_id: '132547',
    bed: 'ICU-04',
    status: 'High',
    risk: 76,
    trend: '+2',
    lead: 'Mixed instability',
    vitals: { HR: 112, SpO2: 91, Resp: 27, Temp: 38.0 },
    waveform: [56, 60, 58, 61, 64, 62, 66, 69, 68, 71, 74, 76],
  },
  {
    patient_id: '132611',
    bed: 'ICU-09',
    status: 'Watch',
    risk: 63,
    trend: '+1',
    lead: 'Hemodynamic watch',
    vitals: { HR: 96, SpO2: 94, Resp: 22, Temp: 37.6 },
    waveform: [44, 47, 45, 49, 52, 50, 53, 57, 58, 60, 61, 63],
  },
  {
    patient_id: '132590',
    bed: 'ICU-12',
    status: 'Watch',
    risk: 52,
    trend: '+0',
    lead: 'Early inflammatory signal',
    vitals: { HR: 90, SpO2: 95, Resp: 21, Temp: 37.5 },
    waveform: [36, 38, 39, 37, 41, 40, 43, 44, 45, 48, 49, 52],
  },
  {
    patient_id: '132539',
    bed: 'ICU-02',
    status: 'Stable',
    risk: 31,
    trend: '-1',
    lead: 'Baseline recovery',
    vitals: { HR: 75, SpO2: 97, Resp: 18, Temp: 36.7 },
    waveform: [38, 37, 35, 36, 33, 34, 32, 31, 30, 32, 30, 31],
  },
]

const SCENARIOS = {
  baseline: {
    label: 'Baseline Mix',
    lead: 'Mixed instability',
    profile: { hr: 0, spo2: 0, resp: 0, temp: 0, riskDrift: 0, volatility: 1.5 },
  },
  respiratory: {
    label: 'Respiratory Decline',
    lead: 'Respiratory decline',
    profile: { hr: 4, spo2: -3, resp: 5, temp: 0.3, riskDrift: 4, volatility: 2.5 },
  },
  septic: {
    label: 'Septic Shock',
    lead: 'Sepsis escalation',
    profile: { hr: 8, spo2: -2, resp: 4, temp: 0.8, riskDrift: 6, volatility: 3 },
  },
  cardiac: {
    label: 'Cardiac Stress',
    lead: 'Arrhythmic stress',
    profile: { hr: 11, spo2: -1, resp: 2, temp: 0.2, riskDrift: 5, volatility: 4 },
  },
  recovery: {
    label: 'Recovery Trend',
    lead: 'Clinical recovery',
    profile: { hr: -5, spo2: 2, resp: -3, temp: -0.4, riskDrift: -5, volatility: 1.2 },
  },
}

const modelStats = [
  { label: 'AUC-ROC', value: '0.938', tone: 'good' },
  { label: 'Accuracy', value: '92.7%', tone: 'good' },
  { label: 'Precision', value: '82.8%', tone: 'good' },
  { label: 'Recall', value: '54.9%', tone: 'warn' },
]

const signals = [
  { name: 'Respiratory Rate', contribution: 34 },
  { name: 'SpO2 Saturation', contribution: 27 },
  { name: 'Heart Rate', contribution: 19 },
  { name: 'Temperature', contribution: 12 },
  { name: 'Blood Pressure', contribution: 8 },
]

function Shell({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand" aria-label="Predictive ICU home">
          <span className="brand-mark">IC</span>
          <span>
            <strong>ICU Sentinel</strong>
            <small>Predictive Monitoring</small>
          </span>
        </Link>

        <nav className="nav-stack" aria-label="Primary navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span aria-hidden="true">⌁</span>
            Dashboard
          </NavLink>
          <NavLink to="/training" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span aria-hidden="true">▣</span>
            Training
          </NavLink>
        </nav>

        <div className="sidebar-status">
          <span className="pulse-dot" />
          <div>
            <strong>Live vitals stream</strong>
            <small>HTTP ingest ready</small>
          </div>
        </div>
      </aside>
      <main className="main-surface">{children}</main>
    </div>
  )
}

function Sparkline({ points }) {
  const width = 148
  const height = 44
  const min = Math.min(...points)
  const max = Math.max(...points)
  const scaleX = width / (points.length - 1)
  const scaleY = (value) => height - ((value - min) / (max - min || 1)) * height
  const d = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * scaleX} ${scaleY(point)}`).join(' ')

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Risk trend">
      <path d={d} />
    </svg>
  )
}

function RiskDial({ value }) {
  const normalized = Math.min(100, Math.max(0, value))
  return (
    <div className="risk-dial" style={{ '--risk': `${normalized * 3.6}deg` }}>
      <span>{value}</span>
    </div>
  )
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function randomCentered(scale) {
  return (Math.random() * 2 - 1) * scale
}

function statusForRisk(risk) {
  if (risk >= 85) return 'Critical'
  if (risk >= 70) return 'High'
  if (risk >= 45) return 'Watch'
  return 'Stable'
}

function updatePatient(patient, scenarioProfile, scenarioLead) {
  const randomizer = scenarioProfile.volatility
  const nextVitals = {
    HR: Math.round(clamp(patient.vitals.HR + scenarioProfile.hr * 0.35 + randomCentered(randomizer), 45, 170)),
    SpO2: Math.round(clamp(patient.vitals.SpO2 + scenarioProfile.spo2 * 0.25 + randomCentered(randomizer * 0.35), 75, 100)),
    Resp: Math.round(clamp(patient.vitals.Resp + scenarioProfile.resp * 0.25 + randomCentered(randomizer * 0.4), 10, 42)),
    Temp: Number(clamp(patient.vitals.Temp + scenarioProfile.temp * 0.12 + randomCentered(randomizer * 0.03), 34.5, 41).toFixed(1)),
  }

  const signalDelta =
    (nextVitals.HR - 85) * 0.24 +
    (92 - nextVitals.SpO2) * 1.7 +
    (nextVitals.Resp - 18) * 0.6 +
    (nextVitals.Temp - 37) * 4.5

  const nextRisk = Math.round(clamp(patient.risk + scenarioProfile.riskDrift * 0.35 + signalDelta * 0.05 + randomCentered(randomizer), 8, 99))
  const previousRisk = patient.risk
  const riskChange = nextRisk - previousRisk
  const trend = `${riskChange >= 0 ? '+' : ''}${riskChange}`

  return {
    ...patient,
    risk: nextRisk,
    trend,
    status: statusForRisk(nextRisk),
    lead: nextRisk < 45 ? 'Baseline recovery' : scenarioLead,
    vitals: nextVitals,
    waveform: [...patient.waveform.slice(1), nextRisk],
  }
}

function Dashboard() {
  const [activeScenario, setActiveScenario] = useState('baseline')
  const [patientQueue, setPatientQueue] = useState(BASE_PATIENTS)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isPaused, setIsPaused] = useState(false)

  const scenarioEntries = useMemo(() => Object.entries(SCENARIOS), [])
  const criticalCount = patientQueue.filter((patient) => patient.risk >= 75).length
  const activeScenarioLabel = SCENARIOS[activeScenario].label

  useEffect(() => {
    if (isPaused) return undefined

    const intervalId = window.setInterval(() => {
      const { profile, lead } = SCENARIOS[activeScenario]
      setPatientQueue((current) => current.map((patient) => updatePatient(patient, profile, lead)))
      setLastUpdated(new Date())
    }, 1500)
    return () => window.clearInterval(intervalId)
  }, [activeScenario, isPaused])

  const handleResetSimulation = () => {
    setPatientQueue(BASE_PATIENTS)
    setActiveScenario('baseline')
    setIsPaused(false)
    setLastUpdated(new Date())
  }

  return (
    <Shell>
      <section className="page-header">
        <div>
          <p className="eyebrow">Critical care command center</p>
          <h1>Predictive ICU Monitoring System</h1>
        </div>
        <div className="header-actions">
          <Link to="/training/new" className="button secondary">New model run</Link>
          <Link to="/training" className="button primary">View training</Link>
        </div>
      </section>

      <section className="summary-grid" aria-label="Operational summary">
        <article className="summary-tile danger">
          <span>High acuity</span>
          <strong>{criticalCount}</strong>
          <small>patients need review</small>
        </article>
        <article className="summary-tile">
          <span>Patients tracked</span>
          <strong>24</strong>
          <small>across ICU beds</small>
        </article>
        <article className="summary-tile">
          <span>Average lead time</span>
          <strong>3.4h</strong>
          <small>before deterioration</small>
        </article>
        <article className="summary-tile">
          <span>False alarm rate</span>
          <strong>11.2%</strong>
          <small>NEWS2 benchmark</small>
        </article>
      </section>

      <section className="scenario-panel" aria-label="Scenario simulation controls">
        <div>
          <h3>Simulation Scenarios</h3>
          <p>
            Now running: {activeScenarioLabel}
            {isPaused ? ' (paused)' : ' (live)'}
          </p>
        </div>
        <div className="scenario-controls">
          <div className="scenario-buttons">
            {scenarioEntries.map(([scenarioKey, scenario]) => (
              <button
                key={scenarioKey}
                type="button"
                className={`scenario-button ${activeScenario === scenarioKey ? 'active' : ''}`}
                onClick={() => setActiveScenario(scenarioKey)}
              >
                {scenario.label}
              </button>
            ))}
          </div>
          <div className="simulation-actions">
            <button
              type="button"
              className="scenario-button action"
              onClick={() => setIsPaused((current) => !current)}
            >
              {isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            </button>
            <button
              type="button"
              className="scenario-button action"
              onClick={handleResetSimulation}
            >
              Reset to Baseline
            </button>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel patient-panel">
          <div className="panel-heading">
            <div>
              <h2>Ranked Patient Risk</h2>
              <p>Sorted by deterioration probability</p>
            </div>
            <span className="timestamp">Updated {lastUpdated.toLocaleTimeString()}</span>
          </div>

          <div className="patient-list">
            {patientQueue.map((patient) => (
              <article className="patient-row" key={patient.patient_id}>
                <div className="patient-identity">
                  <span className={`status-pill ${patient.status.toLowerCase()}`}>{patient.status}</span>
                  <strong>{patient.bed}</strong>
                  <small>Patient {patient.patient_id}</small>
                </div>
                <Sparkline points={patient.waveform} />
                <div className="vital-strip" aria-label={`Vitals for patient ${patient.patient_id}`}>
                  <span>HR <b>{patient.vitals.HR}</b></span>
                  <span>SpO2 <b>{patient.vitals.SpO2}</b></span>
                  <span>RR <b>{patient.vitals.Resp}</b></span>
                  <span>T <b>{patient.vitals.Temp}</b></span>
                </div>
                <div className="risk-block">
                  <RiskDial value={patient.risk} />
                  <small>{patient.trend} trend</small>
                </div>
                <div className="lead-signal">{patient.lead}</div>
              </article>
            ))}
          </div>
        </div>

        <aside className="panel insight-panel">
          <div className="panel-heading compact">
            <h2>Model Snapshot</h2>
            <span className="model-badge">LSTM baseline</span>
          </div>
          <div className="metric-grid">
            {modelStats.map((stat) => (
              <div className={`metric-card ${stat.tone}`} key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          <div className="divider" />

          <h3>Top Risk Contributors</h3>
          <div className="signal-list">
            {signals.map((signal) => (
              <div className="signal-row" key={signal.name}>
                <div>
                  <span>{signal.name}</span>
                  <small>{signal.contribution}% contribution</small>
                </div>
                <div className="bar-track">
                  <span style={{ width: `${signal.contribution}%` }} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </Shell>
  )
}

function RoutedPage({ children }) {
  return <Shell>{children}</Shell>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/training" element={<RoutedPage><TrainingJobsList /></RoutedPage>} />
        <Route path="/training/new" element={<RoutedPage><TrainingConfig /></RoutedPage>} />
        <Route path="/training/:jobId" element={<RoutedPage><TrainingMonitor /></RoutedPage>} />
      </Routes>
    </BrowserRouter>
  )
}
