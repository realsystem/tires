import React from 'react';
import './DrivetrainStress.css';

const DrivetrainStress = ({ drivetrainStress }) => {
  if (!drivetrainStress) {
    return null;
  }

  const { score, classification, severity, breakdown, regearing, recommendations, summary } = drivetrainStress;

  // Score color based on severity
  const getScoreColor = () => {
    if (score >= 61) return 'high';
    if (score >= 31) return 'moderate';
    return 'low';
  };

  const getUrgencyBadge = () => {
    switch (regearing.urgency) {
      case 'immediate':
        return { text: 'IMMEDIATE', class: 'urgent-immediate' };
      case 'soon':
        return { text: 'SOON', class: 'urgent-soon' };
      case 'eventually':
        return { text: 'EVENTUALLY', class: 'urgent-eventually' };
      default:
        return { text: 'AS NEEDED', class: 'urgent-optional' };
    }
  };

  const urgencyBadge = getUrgencyBadge();

  return (
    <div className="drivetrain-stress card">
      <h3>Drivetrain Stress Analysis</h3>
      <p className="section-hint">Weighted scoring system (0-100) measuring upgrade impact</p>

      {/* Main Score Display */}
      <div className={`stress-score-display severity-${getScoreColor()}`}>
        <div className="score-circle">
          <div className="score-value">{score}</div>
          <div className="score-max">/100</div>
        </div>

        <div className="score-details">
          <div className={`classification-badge ${classification.toLowerCase()}`}>
            {classification} STRESS
          </div>
          <div className="severity-text">{severity} impact on drivetrain</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="stress-breakdown">
        <h4>Score Breakdown</h4>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">Diameter Change</span>
              <span className="breakdown-weight">{breakdown.diameter.weight}</span>
            </div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill diameter"
                style={{ width: `${breakdown.diameter.score}%` }}
              ></div>
            </div>
            <div className="breakdown-value">
              {breakdown.diameter.score}/100 (contributes {breakdown.diameter.contribution} points)
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">Weight & Inertia</span>
              <span className="breakdown-weight">{breakdown.weight.weight}</span>
            </div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill weight"
                style={{ width: `${breakdown.weight.score}%` }}
              ></div>
            </div>
            <div className="breakdown-value">
              {breakdown.weight.score}/100 (contributes {breakdown.weight.contribution} points)
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">Gear Ratio Loss</span>
              <span className="breakdown-weight">{breakdown.gearing.weight}</span>
            </div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill gearing"
                style={{ width: `${breakdown.gearing.score}%` }}
              ></div>
            </div>
            <div className="breakdown-value">
              {breakdown.gearing.score}/100 (contributes {breakdown.gearing.contribution} points)
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">Vehicle Weight Factor</span>
              <span className="breakdown-weight">{breakdown.vehicle.weight}</span>
            </div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill vehicle"
                style={{ width: `${breakdown.vehicle.score}%` }}
              ></div>
            </div>
            <div className="breakdown-value">
              {breakdown.vehicle.score}/100 (contributes {breakdown.vehicle.contribution} points)
            </div>
          </div>
        </div>
      </div>

      {/* Regearing Recommendation */}
      <div className={`regearing-section priority-${regearing.priority}`}>
        <div className="regearing-header">
          <h4>Re-Gearing Recommendation</h4>
          <span className={`urgency-badge ${urgencyBadge.class}`}>
            {urgencyBadge.text}
          </span>
        </div>

        <div className="regearing-content">
          <div className="regearing-status">
            <strong>Status:</strong> Regearing is <span className="regear-rec">{regearing.recommendation}</span>
          </div>

          {regearing.suggestedGearIncrease && (
            <div className="regearing-suggestion">
              <strong>Suggested Gear Increase:</strong>
              <div className="gear-increase-detail">
                {regearing.suggestedGearIncrease.percentIncrease}% numerically higher gears
                <br />
                <small>{regearing.suggestedGearIncrease.example}</small>
              </div>
              <div className="gear-reasoning">
                {regearing.suggestedGearIncrease.reasoning}
              </div>
            </div>
          )}

          <div className={`priority-indicator priority-${regearing.priority}`}>
            <strong>Priority:</strong> {regearing.priority.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="stress-recommendations">
          <h4>Engineering Recommendations</h4>
          <ul className="recommendations-list">
            {recommendations.map((rec, index) => (
              <li
                key={index}
                className={`recommendation-item ${rec.includes('⚠️') || rec.includes('🔴') ? 'critical' : ''}`}
              >
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      <div className={`stress-summary severity-${getScoreColor()}`}>
        <strong>Summary:</strong> {summary}
      </div>

      {/* Methodology */}
      <div className="methodology-note">
        <details>
          <summary>Scoring Methodology</summary>
          <div className="methodology-content">
            <p>
              <strong>Weighted Formula:</strong>
            </p>
            <ul>
              <li>Diameter Change: 30% (biggest factor in effective gearing)</li>
              <li>Weight & Rotational Inertia: 25% (impacts acceleration and braking)</li>
              <li>Gear Ratio Loss: 35% (torque multiplication loss)</li>
              <li>Vehicle Weight: 10% (heavier vehicles handle upgrades better)</li>
            </ul>
            <p>
              <strong>Score Ranges:</strong>
            </p>
            <ul>
              <li>0-30: LOW stress (regearing optional)</li>
              <li>31-60: MODERATE stress (regearing recommended)</li>
              <li>61-100: HIGH stress (regearing essential)</li>
            </ul>
            <p>
              <strong>Note:</strong> Scores are adjusted based on intended use. Daily drivers
              are penalized (+15% stress), while rock crawlers are given leniency (-15% stress).
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default DrivetrainStress;
