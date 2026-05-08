import React from 'react'
import { Link } from 'react-router-dom'

export default function ArchitecturePage() {
  return (
    <div className="architecture-container">
      {/* Navigation */}
      <nav className="arch-nav">
        <Link to="/" className="arch-back">
          ← Back to Home
        </Link>
      </nav>

      {/* Hero */}
      <section className="arch-hero">
        <div className="arch-hero-content">
          <h1>System Architecture</h1>
          <p className="arch-subtitle">
            End-to-end ML pipeline for ICU patient monitoring and predictive analytics
          </p>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="arch-section">
        <h2>Data Flow Pipeline</h2>
        <div className="arch-diagram">
          <div className="arch-stage">
            <div className="stage-icon">📊</div>
            <h3>Data Ingestion</h3>
            <p>Real-time vitals from bedside monitors via MQTT or HTTP endpoints</p>
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-stage">
            <div className="stage-icon">🔄</div>
            <h3>Preprocessing</h3>
            <p>Normalization, feature engineering, temporal windowing</p>
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-stage">
            <div className="stage-icon">🧠</div>
            <h3>LSTM Model</h3>
            <p>Deep learning inference for outcome prediction</p>
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-stage">
            <div className="stage-icon">⚠️</div>
            <h3>Risk Scoring</h3>
            <p>Probabilistic predictions + clinical alerts</p>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="arch-section">
        <h2>Technology Stack</h2>
        <div className="tech-grid">
          <div className="tech-card">
            <h4>Backend</h4>
            <ul>
              <li>FastAPI - REST endpoints</li>
              <li>PyTorch - ML inference</li>
              <li>SQLite - Patient data</li>
              <li>MQTT - Real-time streaming</li>
            </ul>
          </div>
          <div className="tech-card">
            <h4>Frontend</h4>
            <ul>
              <li>React 18 - UI framework</li>
              <li>Vite - Build tool</li>
              <li>React Router - Navigation</li>
              <li>Tailwind CSS - Styling</li>
            </ul>
          </div>
          <div className="tech-card">
            <h4>ML Pipeline</h4>
            <ul>
              <li>LSTM Networks - Time series</li>
              <li>PhysioNet - Training data</li>
              <li>SHAP - Model explainability</li>
              <li>NEWS2 - Clinical scoring</li>
            </ul>
          </div>
          <div className="tech-card">
            <h4>Hardware</h4>
            <ul>
              <li>ESP32-MAX30105 - Pulse sensor</li>
              <li>WiFi/MQTT protocol</li>
              <li>Edge computing ready</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Model Performance */}
      <section className="arch-section">
        <h2>Model Performance Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-box">
            <div className="metric-number">96.2%</div>
            <div className="metric-label">AUC-ROC Score</div>
          </div>
          <div className="metric-box">
            <div className="metric-number">92.7%</div>
            <div className="metric-label">Accuracy</div>
          </div>
          <div className="metric-box">
            <div className="metric-number">82.8%</div>
            <div className="metric-label">Precision</div>
          </div>
          <div className="metric-box">
            <div className="metric-number">54.9%</div>
            <div className="metric-label">Recall</div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="arch-section">
        <h2>Key Features</h2>
        <div className="features-list">
          <div className="feature-item">
            <h3>🔍 Real-Time Monitoring</h3>
            <p>Continuous ingestion and processing of patient vitals with sub-second latency</p>
          </div>
          <div className="feature-item">
            <h3>🤖 AI-Powered Predictions</h3>
            <p>LSTM networks trained on 100k+ patient-hours from PhysioNet ICU datasets</p>
          </div>
          <div className="feature-item">
            <h3>📊 Clinical Transparency</h3>
            <p>SHAP-based explainability showing which vitals drive each prediction</p>
          </div>
          <div className="feature-item">
            <h3>⚡ Scalable Pipeline</h3>
            <p>Microservices architecture supporting high-throughput multi-patient monitoring</p>
          </div>
          <div className="feature-item">
            <h3>🔐 Healthcare-Grade Security</h3>
            <p>HIPAA-ready design with encryption and audit logging</p>
          </div>
          <div className="feature-item">
            <h3>📱 Edge Computing Ready</h3>
            <p>Sensor integration with ESP32 for decentralized patient monitoring</p>
          </div>
        </div>
      </section>

      {/* Deployment */}
      <section className="arch-section">
        <h2>Deployment</h2>
        <div className="deployment-info">
          <div className="deployment-option">
            <h3>Development</h3>
            <code>npm run dev (frontend) + python app.py (backend)</code>
          </div>
          <div className="deployment-option">
            <h3>Production Ready</h3>
            <p>Docker containerization, GitHub Actions CI/CD, cloud-ready deployment</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="arch-cta">
        <h2>Ready to explore?</h2>
        <Link to="/dashboard" className="arch-btn">
          Launch Dashboard →
        </Link>
      </section>
    </div>
  )
}
