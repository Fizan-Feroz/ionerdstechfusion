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

function ExplainabilityWaveform({ points }) {
  const width = 280
  const height = 86
  const min = Math.min(...points)
  const max = Math.max(...points)
  const scaleX = width / Math.max(1, points.length - 1)
  const scaleY = (value) => height - ((value - min) / (max - min || 1)) * height
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * scaleX} ${scaleY(point)}`).join(' ')

  const explainBand = (value) => {
    if (value >= 80) return { label: 'SpO2 drop pattern', tone: 'spo2' }
    if (value >= 65) return { label: 'Respiratory strain', tone: 'resp' }
    if (value >= 45) return { label: 'Cardiac stress', tone: 'hr' }
    return { label: 'Thermal/inflammatory drift', tone: 'temp' }
  }

  return (
    <div className="explainability-waveform">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Explainability overlay waveform">
        <path d={path} className="wave-line" />
        {points.map((point, index) => {
          const x = index * scaleX
          const y = scaleY(point)
          const band = explainBand(point)
          return <circle key={`${point}-${index}`} cx={x} cy={y} r="4" className={`wave-dot ${band.tone}`} />
        })}
      </svg>
      <div className="wave-legend">
        <span className="pill spo2">SpO2-related</span>
        <span className="pill resp">Resp-related</span>
        <span className="pill hr">HR-related</span>
        <span className="pill temp">Temp-related</span>
      </div>
    </div>
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

function scoreContributions(vitals) {
  const contributions = [
    { name: 'Heart Rate', value: (vitals.HR - 85) * 0.24 },
    { name: 'SpO2 Saturation', value: (92 - vitals.SpO2) * 1.7 },
    { name: 'Respiratory Rate', value: (vitals.Resp - 18) * 0.6 },
    { name: 'Temperature', value: (vitals.Temp - 37) * 4.5 },
  ]
  const total = contributions.reduce((sum, metric) => sum + metric.value, 0)
  return {
    total,
    metrics: contributions.map((metric) => ({
      ...metric,
      points: Number((metric.value * 0.05).toFixed(2)),
    })),
  }
}

function buildAlerts(patients) {
  const alerts = []
  patients.forEach((patient) => {
    if (patient.risk >= 90) {
      alerts.push({ level: 'critical', text: `Patient ${patient.patient_id} at ${patient.risk}% risk - immediate bedside review needed.` })
      return
    }
    if (patient.vitals.SpO2 <= 88) {
      alerts.push({ level: 'warning', text: `Patient ${patient.patient_id} has low SpO2 (${patient.vitals.SpO2}%).` })
    }
    if (patient.vitals.Resp >= 30) {
      alerts.push({ level: 'warning', text: `Patient ${patient.patient_id} respiratory rate elevated (${patient.vitals.Resp}/min).` })
    }
    if (patient.vitals.Temp >= 39) {
      alerts.push({ level: 'info', text: `Patient ${patient.patient_id} temperature trend suggests infection (${patient.vitals.Temp} C).` })
    }
  })
  return alerts.slice(0, 5)
}

function calculateNews2(patient) {
  let score = 0
  const { HR, Resp, Temp, SpO2 } = patient.vitals
  if (Resp <= 8 || Resp >= 25) score += 3
  else if (Resp >= 21) score += 2
  else if (Resp >= 9 && Resp <= 11) score += 1

  if (SpO2 <= 91) score += 3
  else if (SpO2 <= 93) score += 2
  else if (SpO2 <= 95) score += 1

  if (Temp <= 35) score += 3
  else if (Temp >= 39.1) score += 2
  else if (Temp >= 38.1) score += 1

  if (HR <= 40 || HR >= 131) score += 3
  else if (HR >= 111) score += 2
  else if (HR >= 91 || HR <= 50) score += 1
  return score
}

function hasDeteriorationEvent(patient) {
  return patient.vitals.SpO2 <= 90 || patient.vitals.Resp >= 30 || patient.vitals.Temp >= 39.2 || patient.risk >= 88
}

function classificationStats(rows) {
  const totals = rows.reduce(
    (acc, row) => {
      if (row.predicted && row.actual) acc.tp += 1
      else if (row.predicted && !row.actual) acc.fp += 1
      else if (!row.predicted && row.actual) acc.fn += 1
      else acc.tn += 1
      return acc
    },
    { tp: 0, fp: 0, tn: 0, fn: 0 }
  )

  const sensitivity = totals.tp + totals.fn ? totals.tp / (totals.tp + totals.fn) : 0
  const specificity = totals.tn + totals.fp ? totals.tn / (totals.tn + totals.fp) : 0
  const precision = totals.tp + totals.fp ? totals.tp / (totals.tp + totals.fp) : 0

  return {
    ...totals,
    sensitivity: Number((sensitivity * 100).toFixed(1)),
    specificity: Number((specificity * 100).toFixed(1)),
    precision: Number((precision * 100).toFixed(1)),
  }
}

function updatePatient(patient, scenarioProfile, scenarioLead) {
  const randomizer = scenarioProfile.volatility
  const nextVitals = {
    HR: Math.round(clamp(patient.vitals.HR + scenarioProfile.hr * 0.35 + randomCentered(randomizer), 45, 170)),
    SpO2: Math.round(clamp(patient.vitals.SpO2 + scenarioProfile.spo2 * 0.25 + randomCentered(randomizer * 0.35), 75, 100)),
    Resp: Math.round(clamp(patient.vitals.Resp + scenarioProfile.resp * 0.25 + randomCentered(randomizer * 0.4), 10, 42)),
    Temp: Number(clamp(patient.vitals.Temp + scenarioProfile.temp * 0.12 + randomCentered(randomizer * 0.03), 34.5, 41).toFixed(1)),
  }

  const contributionData = scoreContributions(nextVitals)

  const nextRisk = Math.round(clamp(patient.risk + scenarioProfile.riskDrift * 0.35 + contributionData.total * 0.05 + randomCentered(randomizer), 8, 99))
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
  const [isPaused, setIsPaused] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState(BASE_PATIENTS[0].patient_id)
  const [alertThreshold, setAlertThreshold] = useState(75)

  const scenarioEntries = useMemo(() => Object.entries(SCENARIOS), [])
  const criticalCount = patientQueue.filter((patient) => patient.risk >= 75).length
  const activeScenarioLabel = SCENARIOS[activeScenario].label
  const alertItems = useMemo(() => buildAlerts(patientQueue), [patientQueue])
  const selectedPatient = patientQueue.find((patient) => patient.patient_id === selectedPatientId) || patientQueue[0]
  const impactMetrics = selectedPatient ? scoreContributions(selectedPatient.vitals).metrics : []
  const currentNews2 = selectedPatient ? calculateNews2(selectedPatient) : 0

  const modelRows = useMemo(
    () =>
      patientQueue.map((patient) => ({
        actual: hasDeteriorationEvent(patient),
        predicted: patient.risk >= alertThreshold,
      })),
    [patientQueue, alertThreshold]
  )
  const news2Rows = useMemo(
    () =>
      patientQueue.map((patient) => ({
        actual: hasDeteriorationEvent(patient),
        predicted: calculateNews2(patient) >= 7,
      })),
    [patientQueue]
  )

  const modelPerf = useMemo(() => classificationStats(modelRows), [modelRows])
  const news2Perf = useMemo(() => classificationStats(news2Rows), [news2Rows])
  const averageLeadTime = useMemo(() => {
    const lead = patientQueue.map((patient) => clamp((100 - patient.risk) / 12, 0.5, 6))
    return (lead.reduce((sum, val) => sum + val, 0) / lead.length).toFixed(1)
  }, [patientQueue])

  useEffect(() => {
    if (!patientQueue.some((patient) => patient.patient_id === selectedPatientId)) {
      setSelectedPatientId(patientQueue[0]?.patient_id)
    }
  }, [patientQueue, selectedPatientId])

  useEffect(() => {
    if (isPaused) return undefined

    const intervalId = window.setInterval(() => {
      const { profile, lead } = SCENARIOS[activeScenario]
      setPatientQueue((current) => current.map((patient) => updatePatient(patient, profile, lead)))
      setLastUpdated(new Date())
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [activeScenario, isPaused])

  const handleResetSimulation = () => {
    setPatientQueue(BASE_PATIENTS)
    setActiveScenario('baseline')
    setIsPaused(true)
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
              {isPaused ? 'Start Simulation' : 'Pause Simulation'}
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

      <section className="alerts-panel" aria-label="Real-time alerts">
        <div className="panel-heading compact">
          <h2>Live Alerts</h2>
          <span className="model-badge">{alertItems.length} active</span>
        </div>
        {alertItems.length === 0 ? (
          <p className="alerts-empty">No threshold breaches. Monitoring continues.</p>
        ) : (
          <div className="alerts-list">
            {alertItems.map((alert, idx) => (
              <article key={`${alert.text}-${idx}`} className={`alert-item ${alert.level}`}>
                {alert.text}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="analytics-grid" aria-label="Model analytics and threshold tuning">
        <article className="panel analytics-panel">
          <div className="panel-heading compact">
            <h2>Threshold Tuning</h2>
            <span className="model-badge">Alert {'>='} {alertThreshold}</span>
          </div>
          <label className="slider-label" htmlFor="alert-threshold">
            Risk threshold ({alertThreshold})
          </label>
          <input
            id="alert-threshold"
            type="range"
            min="50"
            max="95"
            step="1"
            value={alertThreshold}
            onChange={(event) => setAlertThreshold(Number(event.target.value))}
          />
          <div className="metric-grid tuning">
            <div className="metric-card good">
              <span>Sensitivity</span>
              <strong>{modelPerf.sensitivity}%</strong>
            </div>
            <div className="metric-card good">
              <span>Specificity</span>
              <strong>{modelPerf.specificity}%</strong>
            </div>
            <div className="metric-card">
              <span>Precision</span>
              <strong>{modelPerf.precision}%</strong>
            </div>
            <div className="metric-card">
              <span>False alarms</span>
              <strong>{modelPerf.fp}</strong>
            </div>
          </div>
        </article>

        <article className="panel analytics-panel">
          <div className="panel-heading compact">
            <h2>NEWS2 Baseline vs Model</h2>
            <span className="model-badge">Lead time {averageLeadTime}h</span>
          </div>
          <div className="compare-grid">
            <div>
              <h3>AI Model</h3>
              <p>Sensitivity {modelPerf.sensitivity}% | Specificity {modelPerf.specificity}%</p>
            </div>
            <div>
                <h3>NEWS2 ({'>='}7)</h3>
              <p>Sensitivity {news2Perf.sensitivity}% | Specificity {news2Perf.specificity}%</p>
            </div>
          </div>
          <small className="timestamp">Selected patient NEWS2 score: {currentNews2}</small>
        </article>
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
                <button
                  type="button"
                  className={`inspect-button ${selectedPatientId === patient.patient_id ? 'active' : ''}`}
                  onClick={() => setSelectedPatientId(patient.patient_id)}
                >
                  Inspect impact
                </button>
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

          <h3>Risk Impact - Patient {selectedPatient?.patient_id}</h3>
          <ExplainabilityWaveform points={selectedPatient?.waveform || []} />
          <div className="signal-list">
            {impactMetrics.map((metric) => (
              <div className="signal-row" key={metric.name}>
                <div>
                  <span>{metric.name}</span>
                  <small>{metric.points >= 0 ? '+' : ''}{metric.points} risk points</small>
                </div>
                <div className={`bar-track impact ${metric.points >= 0 ? 'up' : 'down'}`}>
                  <span style={{ width: `${Math.min(100, Math.abs(metric.value) * 10)}%` }} />
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
