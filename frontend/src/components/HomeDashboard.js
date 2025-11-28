import React, { useState, useEffect } from 'react';
import './HomeDashboard.css';

const HomeDashboard = ({ user, onLogout }) => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    filesProcessed: 0,
    accuracyRate: 0,
    users: 0
  });

  // Features data
  const features = [
    {
      icon: '🔍',
      title: 'Text Recognition',
      description: 'Advanced OCR technology extracts text from handwriting with high accuracy'
    },
    {
      icon: '🧠',
      title: 'AI Summarization',
      description: 'Intelligent algorithms create concise summaries from your notes'
    },
    {
      icon: '⚡',
      title: 'Fast Processing',
      description: 'Get results in seconds with our optimized processing engine'
    },
    {
      icon: '📁',
      title: 'Multi-format Support',
      description: 'Works with PNG, JPG, JPEG, WebP, and PDF formats'
    }
  ];

  // Animate stats on component mount
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedStats(prev => ({
        filesProcessed: prev.filesProcessed < 12560 ? prev.filesProcessed + 47 : 12560,
        accuracyRate: prev.accuracyRate < 94 ? prev.accuracyRate + 1 : 94,
        users: prev.users < 3420 ? prev.users + 19 : 3420
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Rotate through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="home-dashboard">
      {/* Header */}
   

      <div className="dashboard-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-content">
            <h2>Welcome back{user?.name ? `, ${user.name}` : ''}!</h2>
            <p>Transform your handwritten notes into digital text and AI-powered summaries with our advanced technology.</p>
            <div className="welcome-stats">
              <div className="stat-item">
                <span className="stat-number">{animatedStats.filesProcessed.toLocaleString()}+</span>
                <span className="stat-label">Files Processed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{animatedStats.accuracyRate}%</span>
                <span className="stat-label">Accuracy Rate</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{animatedStats.users.toLocaleString()}+</span>
                <span className="stat-label">Active Users</span>
              </div>
            </div>
          </div>
          <div className="welcome-visual">
            <div className="floating-card card-1">
              <span>📝</span>
              <p>Text Extraction</p>
            </div>
            <div className="floating-card card-2">
              <span>✨</span>
              <p>AI Summary</p>
            </div>
            <div className="floating-card card-3">
              <span>📊</span>
              <p>Smart Analysis</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works">
          <h2>How SmartNoteScan Works</h2>
          <div className="process-steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload Your Notes</h3>
              <p>Simply upload images or PDFs of your handwritten notes through our intuitive interface.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Processing</h3>
              <p>Our advanced algorithms analyze and extract text from your handwriting with precision.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Results</h3>
              <p>Receive both the extracted text and an intelligent summary of your notes in seconds.</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2>Powerful Features</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card ${index === activeFeature ? 'active' : ''}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pro Tips Section */}
        <section className="pro-tips">
          <h2>Pro Tips</h2>
          <div className="tips-container">
            <div className="tip-card">
              <div className="tip-header">
                <span className="tip-icon">💡</span>
                <h3>Image Quality Matters</h3>
              </div>
              <p>For best results, use high-contrast images with clear handwriting and good lighting.</p>
            </div>
            <div className="tip-card">
              <div className="tip-header">
                <span className="tip-icon">💡</span>
                <h3>Organize Your Notes</h3>
              </div>
              <p>Process related notes together to get more coherent and contextual summaries.</p>
            </div>
            <div className="tip-card">
              <div className="tip-header">
                <span className="tip-icon">💡</span>
                <h3>Review and Edit</h3>
              </div>
              <p>While our AI is accurate, always review extracted text for any formatting adjustments.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeDashboard;