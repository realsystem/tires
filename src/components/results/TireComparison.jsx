import React from 'react';
import './TireComparison.css';

const TireComparison = ({ comparison }) => {
  const { current, new: newTire, differences } = comparison;

  const formatChange = (value, suffix = '"') => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}${suffix}`;
  };

  const formatPct = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const metrics = [
    {
      label: 'Overall Diameter',
      current: `${current.diameter.toFixed(2)}"`,
      new: `${newTire.diameter.toFixed(2)}"`,
      change: formatChange(differences.diameter.inches),
      changePct: formatPct(differences.diameter.percentage),
      highlight: Math.abs(differences.diameter.percentage) > 5
    },
    {
      label: 'Section Width',
      current: `${current.widthInches.toFixed(2)}"`,
      new: `${newTire.widthInches.toFixed(2)}"`,
      change: formatChange(differences.width.inches),
      changePct: formatPct(differences.width.percentage),
      highlight: Math.abs(differences.width.percentage) > 10
    },
    {
      label: 'Sidewall Height',
      current: `${current.sidewallInches.toFixed(2)}"`,
      new: `${newTire.sidewallInches.toFixed(2)}"`,
      change: formatChange(differences.sidewall.inches),
      changePct: formatPct(differences.sidewall.percentage),
      highlight: false
    },
    {
      label: 'Circumference',
      current: `${current.circumference.toFixed(2)}"`,
      new: `${newTire.circumference.toFixed(2)}"`,
      change: formatChange(differences.circumference.inches),
      changePct: formatPct(differences.circumference.percentage),
      highlight: false
    },
    {
      label: 'Revs/Mile',
      current: current.revolutionsPerMile.toFixed(0),
      new: newTire.revolutionsPerMile.toFixed(0),
      change: formatChange(differences.revolutionsPerMile.absolute, ''),
      changePct: formatPct(differences.revolutionsPerMile.percentage),
      highlight: false
    }
  ];

  return (
    <div className="tire-comparison card">
      <h3>Tire Specifications</h3>

      <div className="comparison-table">
        <div className="table-header">
          <div className="col-metric">Metric</div>
          <div className="col-current">Current</div>
          <div className="col-new">New</div>
          <div className="col-change">Change</div>
        </div>

        {metrics.map((metric, i) => (
          <div key={i} className={`table-row ${metric.highlight ? 'highlight' : ''}`}>
            <div className="col-metric">
              <strong>{metric.label}</strong>
            </div>
            <div className="col-current">{metric.current}</div>
            <div className="col-new">{metric.new}</div>
            <div className="col-change">
              <span className="change-absolute">{metric.change}</span>
              <span className="change-percent">{metric.changePct}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="key-takeaways">
        <div className="takeaway">
          <span className="takeaway-icon">🎯</span>
          <div>
            <strong>Ground Clearance Gain:</strong>{' '}
            {formatChange(differences.groundClearance.inches)}
            <span className="muted"> ({(differences.groundClearance.mm).toFixed(0)}mm)</span>
          </div>
        </div>

        {Math.abs(differences.diameter.percentage) > 5 && (
          <div className="takeaway warning">
            <span className="takeaway-icon">⚠️</span>
            <div>
              <strong>Significant Size Change:</strong>{' '}
              {formatPct(differences.diameter.percentage)} diameter increase will impact performance
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TireComparison;
