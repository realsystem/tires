import React from 'react';
import './DrivetrainImpact.css';

const DrivetrainImpact = ({ drivetrainImpact, comparison }) => {
  const { effectiveGearRatio, rpm, crawlRatio } = drivetrainImpact;

  const formatChange = (value, decimals = 2) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}`;
  };

  const getSeverityClass = (percentage) => {
    const abs = Math.abs(percentage);
    if (abs > 10) return 'severe';
    if (abs > 5) return 'significant';
    if (abs > 3) return 'moderate';
    return 'minimal';
  };

  return (
    <div className="drivetrain-impact">
      <div className="card">
        <h3>Effective Gear Ratio Change</h3>
        <p className="section-desc">
          Larger tires create a "taller" effective gear ratio, reducing acceleration and low-end torque.
        </p>

        <div className="metric-grid">
          <div className="metric-box">
            <div className="metric-label">Current Effective Ratio</div>
            <div className="metric-value">{effectiveGearRatio.original.toFixed(2)}</div>
          </div>

          <div className="metric-box">
            <div className="metric-label">New Effective Ratio</div>
            <div className="metric-value">{effectiveGearRatio.new.toFixed(2)}</div>
          </div>

          <div className={`metric-box ${getSeverityClass(effectiveGearRatio.changePercentage)}`}>
            <div className="metric-label">Change</div>
            <div className="metric-value">
              {formatChange(effectiveGearRatio.change)}
              <span className="metric-pct">
                ({formatChange(effectiveGearRatio.changePercentage)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="impact-summary">
          <p>{effectiveGearRatio.summary}</p>
        </div>
      </div>

      <div className="card">
        <h3>Engine RPM at Highway Speed</h3>
        <p className="section-desc">
          How your engine RPM changes at {rpm.testSpeed} mph with the new tire size.
        </p>

        <div className="metric-grid">
          <div className="metric-box">
            <div className="metric-label">Current RPM @ {rpm.testSpeed} mph</div>
            <div className="metric-value">{Math.round(rpm.original)} RPM</div>
          </div>

          <div className="metric-box">
            <div className="metric-label">New RPM @ {rpm.testSpeed} mph</div>
            <div className="metric-value">{Math.round(rpm.new)} RPM</div>
          </div>

          <div className={`metric-box ${getSeverityClass(rpm.changePercentage)}`}>
            <div className="metric-label">Change</div>
            <div className="metric-value">
              {formatChange(rpm.change, 0)} RPM
              <span className="metric-pct">
                ({formatChange(rpm.changePercentage)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="impact-summary">
          <p>{rpm.summary}</p>
          {rpm.new < 2000 && (
            <p className="note positive">✓ Good highway cruising RPM - comfortable and efficient</p>
          )}
          {rpm.new > 2700 && (
            <p className="note warning">⚠️ High highway RPM - may be loud and hurt fuel economy</p>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Crawl Ratio Impact</h3>
        <p className="section-desc">
          Your low-range crawl capability for technical terrain and rock crawling.
        </p>

        <div className="metric-grid">
          <div className="metric-box">
            <div className="metric-label">Current Crawl Ratio</div>
            <div className="metric-value">{crawlRatio.original.toFixed(1)}:1</div>
          </div>

          <div className="metric-box">
            <div className="metric-label">New Crawl Ratio</div>
            <div className="metric-value">{crawlRatio.new.toFixed(1)}:1</div>
          </div>

          <div className={`metric-box ${getSeverityClass(crawlRatio.changePercentage)}`}>
            <div className="metric-label">Change</div>
            <div className="metric-value">
              {formatChange(crawlRatio.change, 1)}
              <span className="metric-pct">
                ({formatChange(crawlRatio.changePercentage)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="impact-summary">
          <p>{crawlRatio.summary}</p>
          {crawlRatio.crawlSpeed && (
            <p className={`note ${Math.abs(crawlRatio.crawlSpeed.changePercentage) > 10 ? 'warning' : 'info'}`}>
              <strong>Actual crawl speed @ {crawlRatio.crawlSpeed.testRPM} RPM:</strong> {crawlRatio.crawlSpeed.original.toFixed(2)} mph → {crawlRatio.crawlSpeed.new.toFixed(2)} mph
              ({formatChange(crawlRatio.crawlSpeed.changePercentage)}%)
              <br />
              {crawlRatio.crawlSpeed.summary}
            </p>
          )}
          {crawlRatio.new < 30 && (
            <p className="note warning">
              ⚠️ Crawl ratio below 30:1 may limit control on technical terrain
            </p>
          )}
          {crawlRatio.new >= 30 && crawlRatio.new < 40 && (
            <p className="note info">
              ℹ️ Crawl ratio adequate for most off-road use. 40:1+ recommended for serious rock crawling.
            </p>
          )}
          {crawlRatio.new >= 50 && (
            <p className="note positive">✓ Excellent crawl ratio for technical terrain</p>
          )}
        </div>
      </div>

      <div className="card drivetrain-advice">
        <h3>What This Means</h3>
        <div className="advice-grid">
          <div className="advice-item">
            <strong>Acceleration:</strong>
            <p>
              {effectiveGearRatio.changePercentage < -5
                ? 'Noticeably slower. You\'ll feel the difference, especially when loaded or towing.'
                : effectiveGearRatio.changePercentage < -3
                  ? 'Slightly reduced. Acceptable for most driving but noticeable under load.'
                  : 'Minimal impact on acceleration.'}
            </p>
          </div>

          <div className="advice-item">
            <strong>Highway Driving:</strong>
            <p>
              {rpm.changePercentage < -10
                ? 'Lower RPM means quieter highway cruising but less power available for passing.'
                : rpm.changePercentage > 10
                  ? 'Higher RPM means engine working harder on highway - louder and worse fuel economy.'
                  : 'Minimal change to highway driving experience.'}
            </p>
          </div>

          <div className="advice-item">
            <strong>Transmission Strain:</strong>
            <p>
              {Math.abs(effectiveGearRatio.changePercentage) > 10
                ? 'CRITICAL: Significant additional strain. Transmission overheating and premature wear likely without re-gearing.'
                : Math.abs(effectiveGearRatio.changePercentage) > 5
                  ? 'Moderate strain increase. Monitor transmission temps, especially when towing or in mountains.'
                  : 'Minimal additional transmission strain.'}
            </p>
          </div>

          <div className="advice-item">
            <strong>Re-Gearing Priority:</strong>
            <p>
              {Math.abs(effectiveGearRatio.changePercentage) > 10
                ? '🔴 MANDATORY - Do not skip re-gearing with this tire size'
                : Math.abs(effectiveGearRatio.changePercentage) > 7
                  ? '🟡 STRONGLY RECOMMENDED - Budget for re-gearing'
                  : Math.abs(effectiveGearRatio.changePercentage) > 3
                    ? '🟢 OPTIONAL - Re-gear if budget allows or if you notice performance issues'
                    : '⚪ NOT NEEDED - Tire size change is minimal'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrivetrainImpact;
