import React from 'react';
import './RegearingGuidance.css';

const RegearingGuidance = ({ guidance }) => {
  if (!guidance) {
    return null;
  }

  const {
    likelihood,
    consensus,
    realityCheck,
    whyRegear,
    whyNotRegear,
    costContext,
    recommendation,
    transmissionNote,
    forumSources
  } = guidance;

  // Get visual style based on likelihood percentage
  const getLikelihoodLevel = () => {
    const pct = parseInt(likelihood);
    if (pct >= 80) return 'very-high';
    if (pct >= 60) return 'high';
    if (pct >= 40) return 'moderate';
    if (pct >= 20) return 'low';
    return 'very-low';
  };

  const likelihoodLevel = getLikelihoodLevel();

  return (
    <div className="regearing-guidance card">
      <h3>Regearing: Real-World Guidance</h3>
      <p className="section-hint">Based on actual forum data and user experiences</p>

      {/* Consensus Header */}
      <div className={`guidance-header likelihood-${likelihoodLevel}`}>
        <div className="consensus-statement">
          <div className="consensus-text">
            <h4>{consensus}</h4>
            <div className="likelihood-badge">
              ~{likelihood} of users regear for this setup
            </div>
          </div>
        </div>
      </div>

      {/* Reality Check */}
      <div className="reality-check">
        <strong>Reality Check:</strong>
        <p>{realityCheck}</p>
      </div>

      {/* Recommendation */}
      <div className={`recommendation-box likelihood-${likelihoodLevel}`}>
        <h4>Recommendation</h4>
        <p>{recommendation}</p>
      </div>

      {/* Why People Do/Don't Regear */}
      <div className="decision-factors">
        <div className="factor-column">
          <h4>Why People DO Regear:</h4>
          <ul>
            {whyRegear.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>

        <div className="factor-column">
          <h4>Why People DON'T Regear:</h4>
          <ul>
            {whyNotRegear.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Cost Context */}
      {costContext && (
        <div className="cost-context">
          <strong>Cost:</strong> {costContext}
        </div>
      )}

      {/* Transmission Note */}
      {transmissionNote && (
        <div className="transmission-note">
          <strong>Transmission Type Matters:</strong>
          <p>{transmissionNote}</p>
        </div>
      )}

      {/* Forum Sources */}
      {forumSources && (
        <div className="forum-sources">
          <details>
            <summary>Forum Data Source</summary>
            <p>{forumSources}</p>
          </details>
        </div>
      )}
    </div>
  );
};

export default RegearingGuidance;
