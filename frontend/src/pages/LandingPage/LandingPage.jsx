import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Workflow,
  BrainCircuit,
  TerminalSquare,
  CheckCircle2,
} from "lucide-react";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Background Grid */}
      <div className="grid-background"></div>

      {/* Navigation (Minimal) */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <div className="logo-box">
            <img src="/logo.svg" alt="Sky" className="logo-img" />
          </div>
          <span className="logo-text">sky</span>
        </div>
        {/* Login button removed as requested */}
      </nav>

      {/* Hero Section */}
      <main className="landing-hero">
        <div className="hero-badge">
          <Zap size={14} fill="currentColor" />
          <span>v1.0 is now live</span>
        </div>

        <h1 className="hero-title">
          Automate your logic,
          <br />
          <span className="text-muted">visually.</span>
        </h1>

        <p className="hero-subtitle">
          Build complex backend workflows with a simple drag-and-drop interface.
          Connect AI, APIs, and databases in seconds.
        </p>

        <div className="hero-actions">
          <button
            className="cta-primary"
            onClick={() => navigate("/dashboard/workflow")}
          >
            <span>Launch Dashboard</span>
            <ArrowRight size={18} />
          </button>
          {/* Documentation button removed */}
        </div>
      </main>

      {/* Feature Grid Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Everything you need to build</h2>
          <p>Industrial-grade tools for modern automation.</p>
        </div>

        <div className="features-grid">
          <FeatureCard
            icon={<Workflow size={24} />}
            title="Visual Builder"
            desc="Drag, drop, and connect nodes to create logic flows without writing boilerplate code."
          />
          <FeatureCard
            icon={<BrainCircuit size={24} />}
            title="AI Integration"
            desc="Built-in nodes for Gemini and OpenAI. Process text, analyze files, and generate content."
          />
          <FeatureCard
            icon={<TerminalSquare size={24} />}
            title="Live Execution"
            desc="Watch your workflows run in real-time with detailed step-by-step execution logs."
          />
        </div>
      </section>

      {/* How it Works / Steps Section */}
      <section className="steps-section">
        <div className="steps-container">
          <StepItem
            number="01"
            title="Trigger"
            desc="Start with a Webhook, Schedule, or Manual trigger."
          />
          <div className="step-connector"></div>
          <StepItem
            number="02"
            title="Process"
            desc="Use LLMs or Code nodes to transform your data."
          />
          <div className="step-connector"></div>
          <StepItem
            number="03"
            title="Action"
            desc="Send results to Telegram, Slack, or your DB."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-col">
            <span className="logo-text footer-logo">sky</span>
            <p>© 2026 Sky Automation.</p>
          </div>
          <div className="footer-links">
            <span>Twitter</span>
            <span>GitHub</span>
            <span>Discord</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sub-components for cleaner code
const FeatureCard = ({ icon, title, desc }) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const StepItem = ({ number, title, desc }) => (
  <div className="step-item">
    <div className="step-number">{number}</div>
    <h4>{title}</h4>
    <p>{desc}</p>
  </div>
);

export default LandingPage;
