import React from 'react';
import './SpeedometerError.css';

const SpeedometerError = ({ speedometerError }) => {
  const { summary, errors } = speedometerError;

  const speedTests = [
    { speed: 30, data: errors.at30mph },
    { speed: 45, data: errors.at45mph },
    { speed: 60, data: errors.at60mph },
    { speed: 75, data: errors.at75mph }
  ];

  const isSignificant = Math.abs(speedometerError.ratio - 1) > 0.03;

  return (
    <div className={`speedometer-error card ${isSignificant ? 'warning' : ''}`}>
      <h3>Speedometer Impact</h3>

      <div className="speedometer-summary">
        <p className="summary-text">{summary}</p>
        {isSignificant && (
          <div className="alert-box">
            <strong>⚠️ Important:</strong> Speedometer recalibration or GPS speed tracking recommended
          </div>
        )}
      </div>

      <div className="speed-table">
        <div className="table-header">
          <div>Indicated Speed</div>
          <div>Actual Speed</div>
          <div>Error</div>
        </div>

        {speedTests.map(({ speed, data }, i) => (
          <div key={i} className="table-row">
            <div className="speed-indicated">{data.indicated} mph</div>
            <div className="speed-actual">
              <strong>{data.actual.toFixed(1)} mph</strong>
            </div>
            <div className="speed-error">
              <span className={data.error > 0 ? 'positive' : data.error < 0 ? 'negative' : 'neutral'}>
                {data.error > 0 ? '+' : ''}{data.error.toFixed(1)} mph
              </span>
              <span className="error-pct">({data.errorPercentage.toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>

      <div className="speedometer-note">
        <p>
          <strong>Example:</strong> If your speedometer shows {speedTests[2].speed} mph,
          you're actually going <strong>{speedTests[2].data.actual.toFixed(1)} mph</strong>
        </p>
      </div>
    </div>
  );
};

export default SpeedometerError;
