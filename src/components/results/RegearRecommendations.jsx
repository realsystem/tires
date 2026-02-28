import React, { useState } from 'react';
import './RegearRecommendations.css';

const RegearRecommendations = ({ regearRecommendations, comparison }) => {
  const { necessity, useCase, currentRatio, recommendations, analysis, realWorldExamples } = regearRecommendations;
  const [selectedRatio, setSelectedRatio] = useState(recommendations[0]?.ratio);

  const getNecessityBadge = (level) => {
    const badges = {
      strongly_recommended: { icon: '🔴', label: 'STRONGLY RECOMMENDED', class: 'critical' },
      recommended: { icon: '🟡', label: 'RECOMMENDED', class: 'high' },
      consider: { icon: '🟢', label: 'CONSIDER', class: 'medium' },
      optional: { icon: '⚪', label: 'OPTIONAL', class: 'low' }
    };
    return badges[level] || badges.optional;
  };

  const badge = getNecessityBadge(necessity.level);
  const selected = recommendations.find(r => r.ratio === selectedRatio) || recommendations[0];

  return (
    <div className="regear-recommendations">
      <div className="card necessity-assessment">
        <div className="assessment-header">
          <h3>Re-Gearing Assessment</h3>
          <div className={`necessity-badge ${badge.class}`}>
            <span className="badge-icon">{badge.icon}</span>
            <span className="badge-label">{badge.label}</span>
          </div>
        </div>
        <p className="necessity-reason">{necessity.reason}</p>

        <div className="necessity-stats">
          <div className="stat">
            <strong>Diameter Change:</strong> {necessity.diameterChange.toFixed(1)}%
          </div>
          <div className="stat">
            <strong>Current Ratio:</strong> {currentRatio.toFixed(2)}
          </div>
          <div className="stat">
            <strong>Use Case:</strong> {useCase}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Recommended Gear Ratios</h3>
        <p className="section-desc">
          Click a ratio to see detailed impact analysis. Recommendations are sorted by best fit for your use case.
        </p>

        <div className="ratio-selector">
          {recommendations.map((rec, i) => (
            <button
              key={i}
              className={`ratio-option ${selectedRatio === rec.ratio ? 'selected' : ''} verdict-${rec.verdict.score >= 70 ? 'good' : rec.verdict.score >= 50 ? 'ok' : 'poor'}`}
              onClick={() => setSelectedRatio(rec.ratio)}
            >
              <div className="ratio-value">{rec.ratio.toFixed(2)}</div>
              <div className="ratio-type">{rec.type === 'restoration' ? 'Restore' : 'Optimal'}</div>
              <div className="ratio-score">Score: {rec.verdict.score}/100</div>
              {rec.realWorldValidation && (
                <div className="real-world-badge" title={`Proven choice for ${rec.realWorldValidation.source}`}>
                  ✓ Verified
                </div>
              )}
              {rec.popularity && (
                <div className="popularity-badge" title={`Popular across ${rec.popularity.vehicles.join(', ')}`}>
                  ★ #{rec.popularity.rank}
                </div>
              )}
            </button>
          ))}
        </div>

        {selected && (
          <div className="ratio-analysis">
            <div className="analysis-header">
              <h4>Analysis: {selected.ratio.toFixed(2)} Gear Ratio</h4>
              <div className={`verdict verdict-${selected.verdict.score >= 70 ? 'excellent' : selected.verdict.score >= 50 ? 'good' : 'acceptable'}`}>
                {selected.verdict.recommendation}
              </div>
            </div>

            <div className="impact-metrics">
              <div className="metric">
                <div className="metric-label">Highway RPM @ 65 mph</div>
                <div className="metric-value">{selected.impact.rpm} RPM</div>
                <div className="metric-note">{selected.impact.highwayComfort}</div>
              </div>

              <div className="metric">
                <div className="metric-label">Crawl Ratio (4-Low)</div>
                <div className="metric-value">{selected.impact.crawlRatio}:1</div>
                <div className="metric-note">
                  {parseFloat(selected.impact.crawlRatio) >= 50 ? 'Excellent' : parseFloat(selected.impact.crawlRatio) >= 40 ? 'Good' : 'Adequate'}
                </div>
              </div>

              <div className="metric">
                <div className="metric-label">Acceleration</div>
                <div className="metric-value capitalize">{selected.impact.acceleration}</div>
                <div className="metric-note">vs. stock with new tires</div>
              </div>

              <div className="metric">
                <div className="metric-label">Fuel Economy</div>
                <div className="metric-value capitalize">{selected.impact.fuelEconomy}</div>
                <div className="metric-note">vs. stock with new tires</div>
              </div>

              <div className="metric">
                <div className="metric-label">Performance Restoration</div>
                <div className="metric-value">{selected.impact.restorationPercentage.toFixed(1)}%</div>
                <div className="metric-note">
                  {Math.abs(selected.impact.restorationPercentage) < 3 ? 'Nearly perfect' : Math.abs(selected.impact.restorationPercentage) < 7 ? 'Close match' : 'Notable difference'}
                </div>
              </div>
            </div>

            <div className="verdict-details">
              {selected.verdict.pros.length > 0 && (
                <div className="pros">
                  <h5>✓ Advantages</h5>
                  <ul>
                    {selected.verdict.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.verdict.cons.length > 0 && (
                <div className="cons">
                  <h5>⚠️ Considerations</h5>
                  <ul>
                    {selected.verdict.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {realWorldExamples && realWorldExamples.length > 0 && (
        <div className="card real-world-examples">
          <h3>Real-World Builds</h3>
          <p className="section-desc">
            Examples of similar tire upgrades from the community and manufacturers
          </p>

          <div className="examples-grid">
            {realWorldExamples.map((example, i) => (
              <div key={i} className="example-card">
                <div className="example-header">
                  <strong>{example.vehicleType}</strong>
                  <span className="example-gear">{example.recommendedGearRatio.toFixed(2)}</span>
                </div>
                <div className="example-details">
                  <div className="example-row">
                    <span className="label">Tires:</span>
                    <span className="value">{example.stockTireDiameter}" → {example.newTireDiameter}"</span>
                  </div>
                  <div className="example-row">
                    <span className="label">Use:</span>
                    <span className="value">{example.useCase}</span>
                  </div>
                  {example.notes && (
                    <div className="example-notes">{example.notes}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default RegearRecommendations;
