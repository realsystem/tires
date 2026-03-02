import React from 'react';
import './WeightLoadAnalysis.css';

const WeightLoadAnalysis = ({ weightAnalysis, loadCapacityAnalysis }) => {
  if (!weightAnalysis && !loadCapacityAnalysis) {
    return null;
  }

  return (
    <div className="weight-load-analysis card">
      <h3>Weight & Load Capacity Analysis</h3>
      <p className="section-hint">Advanced analysis for experienced users</p>

      {weightAnalysis && (
        <div className="weight-section">
          <div className="section-header">
            <h4>Unsprung Weight Impact</h4>
            {weightAnalysis.isEstimate && (
              <span className="estimate-badge" title="Weights estimated from tire size and type. For precise analysis, enter actual tire weights in Advanced Tire Specifications.">
                Estimated Values
              </span>
            )}
          </div>

          {weightAnalysis.isEstimate && (
            <div className="estimate-notice">
              <strong>Note:</strong> Tire weights are estimated based on size, type (P-metric/LT), and construction.
              For precise analysis, enter actual manufacturer specifications in the Advanced Tire Specifications section.
            </div>
          )}

          <div className="weight-grid">
            <div className="weight-item">
              <div className="weight-label">Current Weight (per tire)</div>
              <div className="weight-value">{weightAnalysis.current.perTire} lbs</div>
            </div>

            <div className="weight-item">
              <div className="weight-label">New Weight (per tire)</div>
              <div className="weight-value">{weightAnalysis.new.perTire} lbs</div>
            </div>

            <div className={`weight-item ${weightAnalysis.difference.perTire >= 0 ? 'negative' : 'positive'}`}>
              <div className="weight-label">Weight Difference</div>
              <div className="weight-value">
                {weightAnalysis.difference.perTire >= 0 ? '+' : ''}
                {weightAnalysis.difference.perTire.toFixed(1)} lbs
                ({weightAnalysis.difference.perTirePct >= 0 ? '+' : ''}
                {weightAnalysis.difference.perTirePct.toFixed(1)}%)
              </div>
            </div>

            <div className={`weight-item ${Math.abs(weightAnalysis.difference.total) > 40 ? 'warning' : 'info'}`}>
              <div className="weight-label">Total Unsprung Weight Change</div>
              <div className="weight-value">
                {weightAnalysis.difference.total >= 0 ? '+' : ''}
                {weightAnalysis.difference.total.toFixed(1)} lbs (4 tires)
              </div>
            </div>
          </div>

          <div className="impact-grid">
            <div className={`impact-card severity-${weightAnalysis.impact.severity}`}>
              <strong>Severity:</strong>
              <span className="severity-badge">{weightAnalysis.impact.severity.toUpperCase()}</span>
            </div>

            <div className="impact-card">
              <strong>Acceleration:</strong>
              <p>{weightAnalysis.impact.acceleration}</p>
            </div>

            <div className="impact-card">
              <strong>Suspension:</strong>
              <p>{weightAnalysis.impact.suspension}</p>
            </div>

            <div className="impact-card">
              <strong>Braking:</strong>
              <p>{weightAnalysis.impact.braking}</p>
            </div>

            <div className="impact-card">
              <strong>Handling:</strong>
              <p>{weightAnalysis.impact.handling}</p>
            </div>
          </div>

          {weightAnalysis.recommendations && weightAnalysis.recommendations.length > 0 && (
            <div className="recommendations">
              <h5>Weight-Related Recommendations:</h5>
              <ul>
                {weightAnalysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {loadCapacityAnalysis && !loadCapacityAnalysis.error && (
        <div className="load-section">
          <h4>Load Capacity Analysis</h4>

          <div className="load-grid">
            <div className="load-item">
              <div className="load-label">Current Load Index</div>
              <div className="load-value">
                {loadCapacityAnalysis.current.loadIndex}
                <span className="load-detail">
                  ({loadCapacityAnalysis.current.capacityPerTire} lbs/tire)
                </span>
              </div>
            </div>

            <div className="load-item">
              <div className="load-label">New Load Index</div>
              <div className="load-value">
                {loadCapacityAnalysis.new.loadIndex}
                <span className="load-detail">
                  ({loadCapacityAnalysis.new.capacityPerTire} lbs/tire)
                </span>
              </div>
            </div>

            <div className={`load-item ${loadCapacityAnalysis.difference.capacityPerTire >= 0 ? 'positive' : 'negative'}`}>
              <div className="load-label">Capacity Change</div>
              <div className="load-value">
                {loadCapacityAnalysis.difference.capacityPerTire >= 0 ? '+' : ''}
                {loadCapacityAnalysis.difference.capacityPerTire} lbs/tire
                ({loadCapacityAnalysis.difference.capacityPerTirePct >= 0 ? '+' : ''}
                {loadCapacityAnalysis.difference.capacityPerTirePct.toFixed(1)}%)
              </div>
            </div>

            <div className="load-item total">
              <div className="load-label">Total Vehicle Capacity (4 tires)</div>
              <div className="load-value">
                {loadCapacityAnalysis.current.totalCapacity.toLocaleString()} lbs
                <span className="arrow">→</span>
                {loadCapacityAnalysis.new.totalCapacity.toLocaleString()} lbs
              </div>
            </div>
          </div>

          <div className={`load-assessment severity-${loadCapacityAnalysis.assessment.severity}`}>
            <div className="assessment-header">
              <strong>Assessment:</strong>
              <span className="severity-badge">{loadCapacityAnalysis.assessment.severity.toUpperCase()}</span>
            </div>
            <p className="assessment-warning">{loadCapacityAnalysis.assessment.warning}</p>
          </div>

          {loadCapacityAnalysis.assessment.suitability && loadCapacityAnalysis.assessment.suitability.length > 0 && (
            <div className="suitability-info">
              <h5>Suitability:</h5>
              <ul>
                {loadCapacityAnalysis.assessment.suitability.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {loadCapacityAnalysis.recommendations && loadCapacityAnalysis.recommendations.length > 0 && (
            <div className="recommendations">
              <h5>Load Capacity Recommendations:</h5>
              <ul>
                {loadCapacityAnalysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {loadCapacityAnalysis && loadCapacityAnalysis.error && (
        <div className="load-error">
          <strong>Load Capacity Error:</strong> {loadCapacityAnalysis.error}
        </div>
      )}

      <div className="advanced-note">
        <strong>Note:</strong> Weight and load capacity analysis requires accurate tire specifications.
        Consult manufacturer data sheets for precise values. Load index indicates maximum safe load per tire
        at maximum inflation pressure.
      </div>
    </div>
  );
};

export default WeightLoadAnalysis;
