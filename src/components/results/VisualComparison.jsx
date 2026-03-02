import React from 'react';
import './VisualComparison.css';

const VisualComparison = ({ comparison }) => {
  const { current, new: newTire, differences } = comparison;

  // Scale factor for visualization (pixels per inch)
  const scale = 4;

  // Calculate dimensions for visualization
  const currentDiameter = current.diameter * scale;
  const newDiameter = newTire.diameter * scale;

  // Calculate container size
  const maxDiameter = Math.max(currentDiameter, newDiameter);
  const spacing = 40; // Space between tires
  const containerWidth = currentDiameter + newDiameter + spacing + 40; // Add padding
  const containerHeight = maxDiameter + 60; // Extra space for labels

  // Ground line at bottom
  const groundY = containerHeight - 20;

  // Position tires side by side on ground
  const currentCenterX = (currentDiameter / 2) + 20;
  const currentCenterY = groundY - (currentDiameter / 2);

  const newCenterX = currentDiameter + spacing + (newDiameter / 2) + 20;
  const newCenterY = groundY - (newDiameter / 2);

  return (
    <div className="visual-comparison card">
      <h3>Visual Size Comparison</h3>
      <p className="visual-hint">Side-by-side comparison on ground level (to scale)</p>

      <div className="comparison-visualization">
        <div className="tire-visual-container">
          <svg width={containerWidth} height={containerHeight} className="tire-svg-overlap">
            {/* Ground line */}
            <line
              x1="0"
              y1={groundY}
              x2={containerWidth}
              y2={groundY}
              className="ground-line"
              strokeWidth="2"
            />

            {/* Current tire (left) */}
            <g className="tire-group current">
              <circle
                cx={currentCenterX}
                cy={currentCenterY}
                r={currentDiameter / 2}
                className="tire-outer current"
                strokeWidth="4"
              />
              <circle
                cx={currentCenterX}
                cy={currentCenterY}
                r={(current.wheelDiameter * scale) / 2}
                className="tire-inner current"
                strokeWidth="2"
              />
              <circle
                cx={currentCenterX}
                cy={currentCenterY}
                r="3"
                className="tire-center"
              />
            </g>

            {/* New tire (right) */}
            <g className="tire-group new">
              <circle
                cx={newCenterX}
                cy={newCenterY}
                r={newDiameter / 2}
                className="tire-outer new"
                strokeWidth="4"
              />
              <circle
                cx={newCenterX}
                cy={newCenterY}
                r={(newTire.wheelDiameter * scale) / 2}
                className="tire-inner new"
                strokeWidth="2"
              />
              <circle
                cx={newCenterX}
                cy={newCenterY}
                r="3"
                className="tire-center new"
              />
            </g>

            {/* Diameter labels */}
            <text
              x={currentCenterX}
              y={groundY + 20}
              className="tire-label current"
              textAnchor="middle"
            >
              {current.diameter.toFixed(1)}"
            </text>
            <text
              x={newCenterX}
              y={groundY + 20}
              className="tire-label new"
              textAnchor="middle"
            >
              {newTire.diameter.toFixed(1)}"
            </text>
          </svg>
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
