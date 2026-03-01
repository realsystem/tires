import React from 'react';
import './RotationalPhysics.css';

const RotationalPhysics = ({ rotationalPhysics }) => {
  if (!rotationalPhysics) {
    return null;
  }

  const { current, new: newTire, changes, performance_impact, recommendations, confidence } = rotationalPhysics;
  const isLowConfidence = confidence.overall === 'LOW';

  return (
    <div className="rotational-physics card">
      <h3>Rotational Inertia & Performance Impact</h3>
      <p className="section-hint">Physics-based analysis of acceleration and braking changes</p>

      {isLowConfidence && (
        <div className="confidence-notice">
          <strong>⚠️ Estimated Values:</strong> {confidence.notes.join(' ')}
          <br />
          <small>For precise analysis, use tire sizes in our database or add your tire model to improve accuracy.</small>
        </div>
      )}

      {/* Tire Weight Comparison */}
      <div className="weight-comparison">
        <div className="section-header">
          <h4>Tire Weight Comparison</h4>
          {confidence.overall === 'HIGH' && (
            <span className="confidence-badge high" title="Weights from TireRack measured data">
              ✓ High Confidence
            </span>
          )}
        </div>

        <div className="weight-grid">
          <div className="weight-item">
            <div className="weight-label">Current: {current.tire}</div>
            <div className="weight-value">{current.weight_lbs} lbs per tire</div>
          </div>

          <div className="weight-item">
            <div className="weight-label">New: {newTire.tire}</div>
            <div className="weight-value">{newTire.weight_lbs} lbs per tire</div>
          </div>

          <div className={`weight-item ${changes.weight.delta_lbs > 0 ? 'negative' : 'positive'}`}>
            <div className="weight-label">Weight Change</div>
            <div className="weight-value">
              {changes.weight.delta_lbs > 0 ? '+' : ''}
              {changes.weight.delta_lbs.toFixed(1)} lbs per tire
              <br />
              <span className="total-change">
                ({changes.weight.delta_lbs > 0 ? '+' : ''}
                {changes.weight.all_four_tires.toFixed(0)} lbs total)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rotational Inertia Analysis */}
      <div className="inertia-section">
        <div className="section-header">
          <h4>Rotational Inertia Change</h4>
          <div className="physics-note">
            <small>Formula: I = m × r² (mass × radius²)</small>
          </div>
        </div>

        <div className={`inertia-impact severity-${changes.rotational_inertia.category.toLowerCase()}`}>
          <div className="impact-metric">
            <div className="metric-value">
              {changes.rotational_inertia.factor > 0 ? '+' : ''}
              {changes.rotational_inertia.factor.toFixed(1)}%
            </div>
            <div className="metric-label">Rotational Impact Factor</div>
          </div>

          <div className="impact-category">
            <span className={`category-badge ${changes.rotational_inertia.category.toLowerCase()}`}>
              {changes.rotational_inertia.category}
            </span>
            <p className="category-description">{changes.rotational_inertia.description}</p>
          </div>
        </div>

        <div className="physics-breakdown">
          <div className="breakdown-item">
            <strong>Weight contribution:</strong>
            {changes.weight.delta_pct > 0 ? '+' : ''}
            {changes.weight.delta_pct.toFixed(1)}%
          </div>
          <div className="breakdown-item">
            <strong>Diameter contribution:</strong>
            {changes.diameter.delta_pct > 0 ? '+' : ''}
            {changes.diameter.delta_pct.toFixed(1)}%
            <small> (weighted 1.5× due to r² effect)</small>
          </div>
        </div>
      </div>

      {/* Performance Impact */}
      <div className="performance-section">
        <h4>Predicted Performance Impact</h4>

        <div className="performance-grid">
          <div className="performance-card">
            <div className="performance-icon">🚀</div>
            <strong>Acceleration</strong>
            <div className={`performance-value ${Math.abs(performance_impact.acceleration.impact_pct) > 3 ? 'warning' : 'info'}`}>
              {performance_impact.acceleration.impact_pct > 0 ? '+' : ''}
              {performance_impact.acceleration.impact_pct.toFixed(1)}%
            </div>
            <p className="performance-description">{performance_impact.acceleration.description}</p>
          </div>

          <div className="performance-card">
            <div className="performance-icon">🛑</div>
            <strong>Braking</strong>
            <div className={`performance-value ${Math.abs(performance_impact.braking.impact_pct) > 3 ? 'warning' : 'info'}`}>
              {performance_impact.braking.impact_pct > 0 ? '+' : ''}
              {performance_impact.braking.impact_pct.toFixed(1)}%
            </div>
            <p className="performance-description">{performance_impact.braking.description}</p>
          </div>

          <div className="performance-card">
            <div className="performance-icon">⚖️</div>
            <strong>Unsprung Mass</strong>
            <div className={`performance-value ${Math.abs(performance_impact.unsprung_mass.increase_lbs) > 40 ? 'warning' : 'info'}`}>
              {performance_impact.unsprung_mass.increase_lbs > 0 ? '+' : ''}
              {performance_impact.unsprung_mass.increase_lbs.toFixed(0)} lbs
            </div>
            <p className="performance-description">{performance_impact.unsprung_mass.impact}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="recommendations-section">
          <h4>Engineering Recommendations</h4>
          <ul className="recommendations-list">
            {recommendations.map((rec, index) => (
              <li key={index} className="recommendation-item">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      <div className="summary-section">
        <div className="summary-text">
          <strong>Summary:</strong> {rotationalPhysics.summary}
        </div>
      </div>

      {/* Methodology Note */}
      <div className="methodology-note">
        <details>
          <summary>Methodology & Confidence</summary>
          <div className="methodology-content">
            <p>
              <strong>Data Sources:</strong>
              {current.confidence === 'high' && newTire.confidence === 'high'
                ? ' Both tire weights from TireRack measured data (high confidence)'
                : current.confidence === 'low' || newTire.confidence === 'low'
                ? ' One or both tire weights are diameter-based estimates (low confidence)'
                : ' Mixed confidence levels'}
            </p>
            <p>
              <strong>Physics Model:</strong> Rotational inertia calculated using I = m × r².
              Diameter changes weighted 1.5× because radius has a squared effect on inertia.
              Performance impact models are simplified but based on established physics principles.
            </p>
            <p>
              <strong>Limitations:</strong> Actual performance impact varies by vehicle weight,
              driving style, and drivetrain configuration. These are generalized estimates for
              comparative purposes.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default RotationalPhysics;
