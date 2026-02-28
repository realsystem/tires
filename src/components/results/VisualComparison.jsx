import React from 'react';
import './VisualComparison.css';

const VisualComparison = ({ comparison }) => {
  const { current, new: newTire, differences } = comparison;

  // Scale factor for visualization (pixels per inch)
  const scale = 3;

  // Calculate dimensions for visualization
  const currentDiameter = current.diameter * scale;
  const newDiameter = newTire.diameter * scale;
  const currentWidth = current.widthInches * scale;
  const newWidth = newTire.widthInches * scale;

  // Calculate container size
  const maxDiameter = Math.max(currentDiameter, newDiameter);
  const containerSize = maxDiameter + 40; // Add padding

  // Calculate positions (center the tires)
  const currentY = (containerSize - currentDiameter) / 2;
  const newY = (containerSize - newDiameter) / 2;

  return (
    <div className="visual-comparison card">
      <h3>Visual Size Comparison</h3>
      <p className="visual-hint">Side-by-side tire profile comparison (to scale)</p>

      <div className="comparison-visualization">
        <div className="tire-visual-container">
          <div className="tire-column">
            <div className="tire-label">Current</div>
            <svg width={containerSize} height={containerSize} className="tire-svg">
              {/* Current tire */}
              <g transform={`translate(${containerSize / 2}, ${containerSize / 2})`}>
                {/* Outer circle (tire) */}
                <circle
                  cx="0"
                  cy="0"
                  r={currentDiameter / 2}
                  className="tire-outer current"
                  strokeWidth="3"
                />
                {/* Inner circle (wheel) */}
                <circle
                  cx="0"
                  cy="0"
                  r={(current.wheelDiameter * scale) / 2}
                  className="tire-inner current"
                  strokeWidth="2"
                />
                {/* Center dot */}
                <circle cx="0" cy="0" r="3" className="tire-center" />
                {/* Diameter line */}
                <line
                  x1="0"
                  y1={-currentDiameter / 2}
                  x2="0"
                  y2={currentDiameter / 2}
                  className="tire-diameter-line"
                  strokeDasharray="4,4"
                />
                {/* Width indicator */}
                <rect
                  x={-currentWidth / 2}
                  y={-10}
                  width={currentWidth}
                  height={20}
                  className="tire-width-indicator current"
                  opacity="0.3"
                />
              </g>
            </svg>
            <div className="tire-specs">
              <div className="spec">{current.formatted}</div>
              <div className="spec-detail">{current.diameter.toFixed(1)}" diameter</div>
              <div className="spec-detail">{current.widthInches.toFixed(1)}" width</div>
            </div>
          </div>

          <div className="tire-column">
            <div className="tire-label">New</div>
            <svg width={containerSize} height={containerSize} className="tire-svg">
              {/* New tire */}
              <g transform={`translate(${containerSize / 2}, ${containerSize / 2})`}>
                {/* Outer circle (tire) */}
                <circle
                  cx="0"
                  cy="0"
                  r={newDiameter / 2}
                  className="tire-outer new"
                  strokeWidth="3"
                />
                {/* Inner circle (wheel) */}
                <circle
                  cx="0"
                  cy="0"
                  r={(newTire.wheelDiameter * scale) / 2}
                  className="tire-inner new"
                  strokeWidth="2"
                />
                {/* Center dot */}
                <circle cx="0" cy="0" r="3" className="tire-center" />
                {/* Diameter line */}
                <line
                  x1="0"
                  y1={-newDiameter / 2}
                  x2="0"
                  y2={newDiameter / 2}
                  className="tire-diameter-line"
                  strokeDasharray="4,4"
                />
                {/* Width indicator */}
                <rect
                  x={-newWidth / 2}
                  y={-10}
                  width={newWidth}
                  height={20}
                  className="tire-width-indicator new"
                  opacity="0.3"
                />
              </g>
            </svg>
            <div className="tire-specs">
              <div className="spec">{newTire.formatted}</div>
              <div className="spec-detail">{newTire.diameter.toFixed(1)}" diameter</div>
              <div className="spec-detail">{newTire.widthInches.toFixed(1)}" width</div>
            </div>
          </div>
        </div>

        <div className="comparison-stats">
          <div className={`stat-item ${differences.diameter.percentage > 0 ? 'positive' : 'negative'}`}>
            <span className="stat-icon">⬆</span>
            <div className="stat-content">
              <div className="stat-value">
                {differences.diameter.percentage > 0 ? '+' : ''}
                {differences.diameter.inches.toFixed(2)}"
              </div>
              <div className="stat-label">Diameter Change</div>
              <div className="stat-pct">
                ({differences.diameter.percentage > 0 ? '+' : ''}
                {differences.diameter.percentage.toFixed(1)}%)
              </div>
            </div>
          </div>

          <div className={`stat-item ${differences.width.percentage > 0 ? 'positive' : 'negative'}`}>
            <span className="stat-icon">↔</span>
            <div className="stat-content">
              <div className="stat-value">
                {differences.width.percentage > 0 ? '+' : ''}
                {differences.width.inches.toFixed(2)}"
              </div>
              <div className="stat-label">Width Change</div>
              <div className="stat-pct">
                ({differences.width.percentage > 0 ? '+' : ''}
                {differences.width.percentage.toFixed(1)}%)
              </div>
            </div>
          </div>

          <div className="stat-item positive">
            <span className="stat-icon">🏔</span>
            <div className="stat-content">
              <div className="stat-value">
                +{differences.groundClearance.inches.toFixed(2)}"
              </div>
              <div className="stat-label">Clearance Gain</div>
              <div className="stat-pct">
                ({differences.groundClearance.mm.toFixed(0)}mm)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualComparison;
