import React, { useState } from 'react';
import './AdvisoryPanel.css';

const AdvisoryPanel = ({ advisory, comparison, formData }) => {
  const { severity, warnings, recommendations, buildImpact, airDownGuidance, overlanding } = advisory;
  const [expandedSections, setExpandedSections] = useState({
    warnings: true,
    buildImpact: true,
    airDown: false,
    overlanding: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSeverityBadge = (sev) => {
    const badges = {
      critical: { icon: '🔴', label: 'CRITICAL', class: 'critical' },
      high: { icon: '🟠', label: 'HIGH PRIORITY', class: 'high' },
      medium: { icon: '🟡', label: 'MODERATE', class: 'medium' },
      low: { icon: '🟢', label: 'LOW IMPACT', class: 'low' }
    };
    return badges[sev] || badges.low;
  };

  const badge = getSeverityBadge(severity);

  const getImpactClass = (impact) => {
    if (impact === 'critical') return 'critical';
    if (impact === 'high') return 'high';
    if (impact === 'medium') return 'medium';
    return 'low';
  };

  return (
    <div className="advisory-panel">
      <div className={`severity-banner ${badge.class}`}>
        <span className="severity-icon">{badge.icon}</span>
        <span className="severity-label">{badge.label}</span>
        <span className="severity-desc">
          {severity === 'critical' && 'Major modifications required - review carefully'}
          {severity === 'high' && 'Significant modifications recommended'}
          {severity === 'medium' && 'Some modifications needed'}
          {severity === 'low' && 'Minimal modifications required'}
        </span>
      </div>

      {/* WARNINGS */}
      <div className="card advisory-section">
        <div className="section-header" onClick={() => toggleSection('warnings')}>
          <h3>
            <span className="toggle-icon">{expandedSections.warnings ? '▼' : '▶'}</span>
            ⚠️ Warnings & Advisories
          </h3>
          <span className="warning-count">
            {warnings.critical.length + warnings.important.length + warnings.advisory.length} items
          </span>
        </div>

        {expandedSections.warnings && (
          <div className="section-content">
            {warnings.critical.length > 0 && (
              <div className="warning-group critical">
                <h4>🔴 Critical Warnings</h4>
                {warnings.critical.map((warn, i) => (
                  <div key={i} className="warning-item">
                    <div className="warning-header">
                      <strong>{warn.category}:</strong> {warn.message}
                    </div>
                    <p className="warning-detail">{warn.detail}</p>
                    <div className="warning-action">
                      <strong>Action Required:</strong> {warn.action}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {warnings.important.length > 0 && (
              <div className="warning-group important">
                <h4>🟡 Important Considerations</h4>
                {warnings.important.map((warn, i) => (
                  <div key={i} className="warning-item">
                    <div className="warning-header">
                      <strong>{warn.category}:</strong> {warn.message}
                    </div>
                    <p className="warning-detail">{warn.detail}</p>
                    <div className="warning-action">
                      <strong>Recommended:</strong> {warn.action}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {warnings.advisory.length > 0 && (
              <div className="warning-group advisory">
                <h4>💡 Advisory Notes</h4>
                {warnings.advisory.map((warn, i) => (
                  <div key={i} className="warning-item">
                    <div className="warning-header">
                      <strong>{warn.category}:</strong> {warn.message}
                    </div>
                    <p className="warning-detail">{warn.detail}</p>
                    {warn.action && (
                      <div className="warning-action">
                        <strong>Note:</strong> {warn.action}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {warnings.critical.length === 0 && warnings.important.length === 0 && warnings.advisory.length === 0 && (
              <p className="no-warnings">✓ No significant warnings for this tire size change</p>
            )}
          </div>
        )}
      </div>

      {/* BUILD IMPACT */}
      <div className="card advisory-section">
        <div className="section-header" onClick={() => toggleSection('buildImpact')}>
          <h3>
            <span className="toggle-icon">{expandedSections.buildImpact ? '▼' : '▶'}</span>
            🔧 Build Impact Assessment
          </h3>
        </div>

        {expandedSections.buildImpact && (
          <div className="section-content">
            <div className="impact-grid">
              <div className={`impact-card ${getImpactClass(buildImpact.suspension.impact)}`}>
                <h4>Suspension</h4>
                <div className="impact-level">{buildImpact.suspension.impact.toUpperCase()}</div>
                <p>{buildImpact.suspension.description}</p>
                <ul className="modifications-list">
                  {buildImpact.suspension.modifications.map((mod, i) => (
                    <li key={i}>{mod}</li>
                  ))}
                </ul>
              </div>

              <div className={`impact-card ${getImpactClass(buildImpact.drivetrain.impact)}`}>
                <h4>Drivetrain</h4>
                <div className="impact-level">{buildImpact.drivetrain.impact.toUpperCase()}</div>
                <p>{buildImpact.drivetrain.description}</p>
                <ul className="modifications-list">
                  {buildImpact.drivetrain.modifications.map((mod, i) => (
                    <li key={i}>{mod}</li>
                  ))}
                </ul>
              </div>

              <div className={`impact-card ${getImpactClass(buildImpact.steering.impact)}`}>
                <h4>Steering</h4>
                <div className="impact-level">{buildImpact.steering.impact.toUpperCase()}</div>
                <p>{buildImpact.steering.description}</p>
                <ul className="modifications-list">
                  {buildImpact.steering.modifications.map((mod, i) => (
                    <li key={i}>{mod}</li>
                  ))}
                </ul>
              </div>

              <div className={`impact-card ${getImpactClass(buildImpact.brakes.impact)}`}>
                <h4>Brakes</h4>
                <div className="impact-level">{buildImpact.brakes.impact.toUpperCase()}</div>
                <p>{buildImpact.brakes.description}</p>
                <ul className="modifications-list">
                  {buildImpact.brakes.modifications.map((mod, i) => (
                    <li key={i}>{mod}</li>
                  ))}
                </ul>
              </div>

              <div className={`impact-card ${getImpactClass(buildImpact.fuelEconomy.impact)}`}>
                <h4>Fuel Economy</h4>
                <div className="impact-level">{buildImpact.fuelEconomy.impact.toUpperCase()}</div>
                <p>{buildImpact.fuelEconomy.description}</p>
                <p className="note">{buildImpact.fuelEconomy.note}</p>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="recommendations-section">
                <h4>📋 Recommended Modifications</h4>
                {recommendations.map((rec, i) => (
                  <div key={i} className={`recommendation-card priority-${rec.priority}`}>
                    <div className="rec-header">
                      <h5>{rec.category}: {rec.title}</h5>
                      <span className="priority-badge">{rec.priority.toUpperCase()}</span>
                    </div>
                    <ul>
                      {rec.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AIR DOWN GUIDANCE */}
      {airDownGuidance && (
        <div className="card advisory-section">
          <div className="section-header" onClick={() => toggleSection('airDown')}>
            <h3>
              <span className="toggle-icon">{expandedSections.airDown ? '▼' : '▶'}</span>
              Air-Down Guidance
            </h3>
          </div>

          {expandedSections.airDown && (
            <div className="section-content">
              <p className="section-intro">
                Recommended tire pressures for different terrain types with your new tire size.
              </p>

              <div className="airdown-table">
                {Object.entries(airDownGuidance.guidance).map(([terrain, data], i) => (
                  <div key={i} className="airdown-row">
                    <div className="terrain-name">{terrain.replace('_', ' ').toUpperCase()}</div>
                    <div className="pressure-value">{data.psi} PSI</div>
                    <div className="pressure-desc">{data.description}</div>
                    {data.warning && (
                      <div className="pressure-warning">⚠️ {data.warning}</div>
                    )}
                  </div>
                ))}
              </div>

              {airDownGuidance.notes.length > 0 && (
                <div className="airdown-notes">
                  <h5>Important Notes:</h5>
                  <ul>
                    {airDownGuidance.notes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="airdown-general">
                <h5>General Air-Down Best Practices:</h5>
                <ul>
                  {airDownGuidance.general.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* OVERLANDING ADVICE */}
      {overlanding && (
        <div className="card advisory-section">
          <div className="section-header" onClick={() => toggleSection('overlanding')}>
            <h3>
              <span className="toggle-icon">{expandedSections.overlanding ? '▼' : '▶'}</span>
              🌍 Overlanding Considerations
            </h3>
          </div>

          {expandedSections.overlanding && (
            <div className="section-content">
              {Object.entries(overlanding).map(([key, section], i) => (
                <div key={i} className="overlanding-section">
                  <h4>{section.title}</h4>
                  <ul>
                    {section.advice.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvisoryPanel;
