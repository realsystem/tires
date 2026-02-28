import React from 'react';
import './ClearanceImpact.css';

const ClearanceImpact = ({ clearance, differences }) => {
  const { groundClearanceGain, estimatedLiftRequired, liftRecommendation, fenderClearance, wheelOffset, bumpstopModification } = clearance;

  return (
    <div className="clearance-impact card">
      <h3>Clearance & Fitment</h3>

      <div className="clearance-grid">
        <div className="clearance-item positive">
          <div className="clearance-content">
            <h4>Ground Clearance Gain</h4>
            <p className="clearance-value">
              +{groundClearanceGain.toFixed(2)}" ({(groundClearanceGain * 25.4).toFixed(0)}mm)
            </p>
            <p className="clearance-note">
              Improved clearance for rocks, ruts, and obstacles
            </p>
          </div>
        </div>

        <div className={`clearance-item ${estimatedLiftRequired > 0 ? 'warning' : 'positive'}`}>
          <div className="clearance-icon">{estimatedLiftRequired > 0 ? '📐' : '✓'}</div>
          <div className="clearance-content">
            <h4>Suspension Lift</h4>
            <p className="clearance-value">
              {estimatedLiftRequired > 0
                ? `~${estimatedLiftRequired}" lift recommended`
                : 'May fit stock height'}
            </p>
            <p className="clearance-note">{liftRecommendation}</p>
          </div>
        </div>

        <div className={`clearance-item ${fenderClearance.concern ? 'warning' : 'positive'}`}>
          <div className="clearance-icon">{fenderClearance.concern ? '⚠️' : '✓'}</div>
          <div className="clearance-content">
            <h4>Fender Clearance</h4>
            <p className="clearance-note">{fenderClearance.message}</p>
            {fenderClearance.concern && (
              <ul className="clearance-modifications">
                <li>Trim inner fender liner</li>
                <li>Cut or fold pinch weld</li>
                <li>Possible body mount chop (BMC)</li>
              </ul>
            )}
          </div>
        </div>

        <div className={`clearance-item ${wheelOffset.changeNeeded ? 'warning' : 'positive'}`}>
          <div className="clearance-icon">{wheelOffset.changeNeeded ? '🔧' : '✓'}</div>
          <div className="clearance-content">
            <h4>Wheel Offset</h4>
            <p className="clearance-note">{wheelOffset.message}</p>
            {wheelOffset.changeNeeded && (
              <ul className="clearance-modifications">
                <li>Wheels with less backspacing</li>
                <li>Wheel spacers (1.25"-1.5")</li>
                <li>Verify scrub radius impact on steering</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {bumpstopModification && (
        <div className="clearance-alert">
          <strong>⚠️ Bump Stop Modification:</strong> {bumpstopModification}
        </div>
      )}

      <div className="fitment-checklist">
        <h4>Pre-Installation Checklist</h4>
        <ul>
          <li>Test fit tires before final installation</li>
          <li>Cycle suspension through full travel with steering at lock</li>
          <li>Check for rubbing on frame, control arms, and fender liner</li>
          <li>Verify brake caliper and CV boot clearance</li>
          <li>Test at different loads (empty vs loaded with gear)</li>
          <li>Road test at low speed before committing to trimming</li>
        </ul>
      </div>
    </div>
  );
};

export default ClearanceImpact;
