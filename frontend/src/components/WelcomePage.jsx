import React from 'react'
import { Link } from 'react-router-dom'
import syncuraLogo from '../assets/syncura-logo.png'

export default function WelcomePage() {
  return (
    <div className="welcome-container">
      {/* Navigation Bar */}
      <nav className="welcome-nav">
        <div className="welcome-nav-content">
          <Link to="/" className="welcome-logo">
            <img src={syncuraLogo} alt="SynCura logo" className="welcome-logo-icon" />
            <span className="welcome-brand-name">SynCura</span>
          </Link>
          <div className="welcome-nav-links">
            <a href="#features" className="welcome-nav-link">Features</a>
            <a href="#tech" className="welcome-nav-link">Tech Stack</a>
            <a href="#about" className="welcome-nav-link">About</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="welcome-hero">
        <div className="welcome-hero-content">
          <div className="welcome-hero-text">
            <span className="welcome-badge">
              <span className="badge-dot"></span>
              Software-Only ICU Monitoring
            </span>
            <h1 className="welcome-headline">
              Predictive Clinical
              <br />
              <span className="highlight">Intelligence</span>
            </h1>
            <p className="welcome-subheadline">
              Bridging the gap between raw medical data and life-saving decisions. SynCura provides an end-to-end framework for ML-powered ICU patient monitoring and outcome prediction.
            </p>
            <div className="welcome-cta-group">
              <Link to="/dashboard" className="welcome-btn welcome-btn-primary">
                Explore Features →
              </Link>
              <button className="welcome-btn welcome-btn-secondary">
                See Architecture
              </button>
            </div>
          </div>

          {/* Live Dashboard Preview */}
          <div className="welcome-preview">
            <div className="preview-header">
              <span className="preview-badge">LIVE FEED: PATIENT #4012</span>
              <span className="preview-status">●</span>
            </div>

            <div className="preview-content">
              <div className="preview-metrics">
                <div className="metric-card metric-accent">
                  <div className="metric-wave">
                    <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                      <polyline
                        points="0,15 10,10 20,8 30,12 40,6 50,15 60,12 70,10 80,14 90,8 100,12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <div className="metric-value">72 BPM</div>
                </div>
              </div>

              <div className="preview-risk">
                <div className="risk-header">RISK ASSESSMENT</div>
                <div className="risk-item">
                  <div className="risk-label">84% Sepsis</div>
                  <div className="risk-bar">
                    <div className="risk-fill" style={{ width: '84%' }}></div>
                  </div>
                  <div className="risk-time">Predicted in next 4 hours</div>
                </div>
              </div>
            </div>

            <div className="preview-footer">
              <span className="footer-tag">MODEL_LOG: INFERENCE_ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Model Accuracy Badge */}
        <div className="accuracy-badge">
          <div className="accuracy-content">
            <svg className="accuracy-icon" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22C6.48 22 2 17.52 2 12s4.48-10 10-10 10 4.48 10 10-4.48 10-10 10z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div className="accuracy-label">Model Accuracy</div>
              <div className="accuracy-value">96.2%</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="welcome-features" id="features">
        <h2>Comprehensive Monitoring Suite</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2" />
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Real-Time Monitoring</h3>
            <p>Live patient vitals with instant risk scoring and clinical alerts</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>LSTM Architecture</h3>
            <p>Deep learning models trained on PhysioNet data for temporal predictions</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
              </svg>
            </div>
            <h3>92.7% Accuracy</h3>
            <p>State-of-the-art model performance on critical outcome prediction</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M9 9h6v6H9z" fill="currentColor" />
              </svg>
            </div>
            <h3>Interactive Dashboard</h3>
            <p>Intuitive interface for clinicians to review predictions and vitals</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h3>SHAP Explainability</h3>
            <p>Transparent feature contributions to every clinical prediction</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="2" />
                <path d="M7 10h10M7 14h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>NEWS2 Scoring</h3>
            <p>Integrated clinical risk scores alongside ML predictions</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="welcome-cta">
        <h2>Ready to Enhance Patient Outcomes?</h2>
        <p>Start exploring SynCura's predictive capabilities with real-time ICU monitoring.</p>
        <Link to="/dashboard" className="welcome-btn welcome-btn-primary welcome-btn-large">
          Launch Dashboard
        </Link>
      </section>
    </div>
  )
}
