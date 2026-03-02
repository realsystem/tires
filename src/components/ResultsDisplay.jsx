import React, { useState, useEffect } from 'react';
import TireComparison from './results/TireComparison';
import SpeedometerError from './results/SpeedometerError';
import DrivetrainImpact from './results/DrivetrainImpact';
import ClearanceImpact from './results/ClearanceImpact';
import RegearRecommendations from './results/RegearRecommendations';
import AdvisoryPanel from './results/AdvisoryPanel';
import VisualComparison from './results/VisualComparison';
import WeightLoadAnalysis from './results/WeightLoadAnalysis';
import RotationalPhysics from './results/RotationalPhysics';
import RegearingGuidance from './results/RegearingGuidance';
import Toast from './Toast';
import EmbedCodeGenerator from './EmbedCodeGenerator';
import { exportToJSON, exportToCSV, exportToText } from '../utils/exportImport';
import { generateForumText, generateBBCodeText, copyToClipboard } from '../utils/forumExport';
import './ResultsDisplay.css';

const ResultsDisplay = ({ results, onReset }) => {
  const { comparison, comparisonWithNewGears, finalStateComparison, regearRecommendations, advisory, formData, compatibility } = results;
  const [activeTab, setActiveTab] = useState('overview');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [toast, setToast] = useState(null);

  // Scroll to top when results are displayed
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Export handlers
  const handleExportJSON = () => {
    exportToJSON(results, formData);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    exportToCSV(results);
    setShowExportMenu(false);
  };

  const handleExportText = () => {
    exportToText(results);
    setShowExportMenu(false);
  };

  const handleCopyForumText = async () => {
    const forumText = generateForumText(comparison, formData);
    const success = await copyToClipboard(forumText);
    setShowExportMenu(false);

    if (success) {
      setToast({ message: 'Forum text copied to clipboard!', type: 'success' });
    } else {
      setToast({ message: 'Failed to copy. Please try again.', type: 'error' });
    }
  };

  const handleCopyBBCode = async () => {
    const bbCodeText = generateBBCodeText(comparison, formData);
    const success = await copyToClipboard(bbCodeText);
    setShowExportMenu(false);

    if (success) {
      setToast({ message: 'BBCode copied to clipboard!', type: 'success' });
    } else {
      setToast({ message: 'Failed to copy. Please try again.', type: 'error' });
    }
  };

  // Use finalStateComparison for drivetrain display when new gears are specified
  // This shows: original (current tires + current gears) → final (new tires + new gears)
  const drivetrainComparison = finalStateComparison || comparison;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '' },
    { id: 'drivetrain', label: 'Drivetrain', icon: '' },
    { id: 'advisory', label: 'Build Impact', icon: '' },
    { id: 'regear', label: 'Re-Gearing', icon: '' }
  ];

  // Filter critical and important warnings for prominent display
  const criticalWarnings = compatibility?.warnings?.filter(w => w.severity === 'critical') || [];
  const importantWarnings = compatibility?.warnings?.filter(w => w.severity === 'important') || [];

  return (
    <div className="results-display">
      <div className="results-header">
        <div className="results-title">
          <h2>Compare Tires</h2>
          <p className="tire-comparison-label">
            {comparison.current.formatted} → {comparison.new.formatted}
          </p>
          {formData.vehicleType && (
            <p className="vehicle-label">
              Vehicle: {formData.vehicleType} {formData.vehicleLabel && `— ${formData.vehicleLabel}`}
            </p>
          )}
        </div>
        <div className="results-actions">
          <div className="export-dropdown">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn btn-secondary"
            >
              Export Results ▼
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <div className="export-section">
                  <div className="export-section-title">Share on Forums</div>
                  <button onClick={handleCopyForumText} className="export-option export-highlight">
                    📋 Copy for Forum (Plain Text)
                  </button>
                  <button onClick={handleCopyBBCode} className="export-option">
                    📋 Copy as BBCode
                  </button>
                </div>
                <div className="export-divider"></div>
                <div className="export-section">
                  <div className="export-section-title">Save & Archive</div>
                  <button onClick={handleExportJSON} className="export-option">
                    Export as JSON (for re-import)
                  </button>
                  <button onClick={handleExportCSV} className="export-option">
                    Export as CSV (spreadsheet)
                  </button>
                  <button onClick={handleExportText} className="export-option">
                    Export as Text Report
                  </button>
                </div>
              </div>
            )}
          </div>
          <button onClick={onReset} className="btn btn-secondary">
            ← New Calculation
          </button>
        </div>
      </div>

      {/* Compatibility Warnings - Show before results */}
      {(criticalWarnings.length > 0 || importantWarnings.length > 0) && (
        <div className="compatibility-warnings">
          {criticalWarnings.map((warning, i) => (
            <div key={`critical-${i}`} className="alert alert-critical">
              <h3>🔴 {warning.message}</h3>
              <p>{warning.detail}</p>
            </div>
          ))}
          {importantWarnings.map((warning, i) => (
            <div key={`important-${i}`} className="alert alert-warning">
              <h3>⚠️ {warning.message}</h3>
              <p>{warning.detail}</p>
            </div>
          ))}
        </div>
      )}

      <div className="results-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="results-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <VisualComparison comparison={comparison} />
            <TireComparison comparison={comparison} />
            <SpeedometerError speedometerError={comparison.speedometerError} />
            <ClearanceImpact clearance={comparison.clearance} differences={comparison.differences} />
            {(comparison.weightAnalysis || comparison.loadCapacityAnalysis) && (
              <WeightLoadAnalysis
                weightAnalysis={comparison.weightAnalysis}
                loadCapacityAnalysis={comparison.loadCapacityAnalysis}
              />
            )}
            <RotationalPhysics rotationalPhysics={comparison.rotationalPhysics} />
          </div>
        )}

        {activeTab === 'drivetrain' && (
          <div className="drivetrain-tab">
            {drivetrainComparison.drivetrainImpact ? (
              <>
                {finalStateComparison && (
                  <div className="card gear-ratio-comparison">
                    <h3>Complete Setup Comparison</h3>
                    <p className="section-desc">
                      Comparing your current setup ({comparison.current.formatted} + {formData.axleGearRatio} gears) vs. final setup ({comparison.new.formatted} + {formData.newAxleGearRatio} gears)
                    </p>

                    <div className="comparison-grid">
                      <div className="comparison-column">
                        <h4 className="column-header">Current Setup</h4>
                        <div className="scenario-label">
                          {finalStateComparison.current.formatted} + {formData.axleGearRatio} gears
                        </div>
                        <div className="metric-group">
                          <div className="metric-item">
                            <span className="metric-label">Highway RPM @ 65 mph:</span>
                            <span className="metric-value">{Math.round(finalStateComparison.drivetrainImpact.rpm.original)} RPM</span>
                          </div>
                          <div className="metric-item">
                            <span className="metric-label">Effective Gear Ratio:</span>
                            <span className="metric-value">{finalStateComparison.drivetrainImpact.effectiveGearRatio.original.toFixed(2)}</span>
                          </div>
                          <div className="metric-item">
                            <span className="metric-label">Crawl Ratio (4-Low):</span>
                            <span className="metric-value">{finalStateComparison.drivetrainImpact.crawlRatio.original.toFixed(1)}:1</span>
                          </div>
                        </div>
                      </div>

                      <div className="comparison-column highlighted">
                        <h4 className="column-header">Final Setup</h4>
                        <div className="scenario-label">
                          {finalStateComparison.new.formatted} + {formData.newAxleGearRatio} gears
                        </div>
                        <div className="metric-group">
                          <div className="metric-item">
                            <span className="metric-label">Highway RPM @ 65 mph:</span>
                            <span className="metric-value metric-highlight">{Math.round(finalStateComparison.drivetrainImpact.rpm.new)} RPM</span>
                            <span className="metric-change">
                              ({Math.round(finalStateComparison.drivetrainImpact.rpm.new) - Math.round(finalStateComparison.drivetrainImpact.rpm.original) > 0 ? '+' : ''}
                              {Math.round(finalStateComparison.drivetrainImpact.rpm.new) - Math.round(finalStateComparison.drivetrainImpact.rpm.original)} RPM)
                            </span>
                          </div>
                          <div className="metric-item">
                            <span className="metric-label">Effective Gear Ratio:</span>
                            <span className="metric-value metric-highlight">{finalStateComparison.drivetrainImpact.effectiveGearRatio.new.toFixed(2)}</span>
                            <span className="metric-change">
                              ({finalStateComparison.drivetrainImpact.effectiveGearRatio.new - finalStateComparison.drivetrainImpact.effectiveGearRatio.original > 0 ? '+' : ''}
                              {(finalStateComparison.drivetrainImpact.effectiveGearRatio.new - finalStateComparison.drivetrainImpact.effectiveGearRatio.original).toFixed(2)})
                            </span>
                          </div>
                          <div className="metric-item">
                            <span className="metric-label">Crawl Ratio (4-Low):</span>
                            <span className="metric-value metric-highlight">{finalStateComparison.drivetrainImpact.crawlRatio.new.toFixed(1)}:1</span>
                            <span className="metric-change">
                              ({(finalStateComparison.drivetrainImpact.crawlRatio.new - finalStateComparison.drivetrainImpact.crawlRatio.original).toFixed(1)}:1)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="comparison-verdict">
                      <h4>Impact Summary</h4>
                      <ul>
                        <li>
                          <strong>Performance Restoration:</strong> {
                            Math.abs(finalStateComparison.drivetrainImpact.effectiveGearRatio.new - finalStateComparison.drivetrainImpact.effectiveGearRatio.original) < 0.3
                              ? '✅ Excellent restoration of factory performance'
                              : Math.abs(finalStateComparison.drivetrainImpact.effectiveGearRatio.changePercentage) < 10
                              ? '✅ Good restoration - close to original feel'
                              : '⚠️ Notable change from stock performance'
                          }
                        </li>
                        <li>
                          <strong>Highway Cruising:</strong> {
                            finalStateComparison.drivetrainImpact.rpm.new >= 1800 && finalStateComparison.drivetrainImpact.rpm.new <= 2200
                              ? '✅ RPM in ideal range (1800-2200)'
                              : finalStateComparison.drivetrainImpact.rpm.new < 1800
                              ? '⚠️ RPM may be too low (lugging)'
                              : '⚠️ RPM higher than optimal'
                          }
                        </li>
                        <li>
                          <strong>Rock Crawling:</strong> {
                            finalStateComparison.drivetrainImpact.crawlRatio.new > finalStateComparison.drivetrainImpact.crawlRatio.original
                              ? `✅ Improved crawl ratio (+${(finalStateComparison.drivetrainImpact.crawlRatio.new - finalStateComparison.drivetrainImpact.crawlRatio.original).toFixed(1)}:1)`
                              : finalStateComparison.drivetrainImpact.crawlRatio.new < finalStateComparison.drivetrainImpact.crawlRatio.original
                              ? `⚠️ Reduced crawl ratio (${(finalStateComparison.drivetrainImpact.crawlRatio.new - finalStateComparison.drivetrainImpact.crawlRatio.original).toFixed(1)}:1)`
                              : '➖ Crawl ratio unchanged'
                          }
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {!finalStateComparison && (
                  <DrivetrainImpact
                    drivetrainImpact={drivetrainComparison.drivetrainImpact}
                    comparison={drivetrainComparison}
                  />
                )}

                {/* Real-world regearing guidance based on forum data */}
                <RegearingGuidance guidance={comparison.regearingGuidance} />
              </>
            ) : (
              <div className="no-data-message">
                <h3>Drivetrain Data Not Available</h3>
                <p>Enter your axle gear ratio to see detailed drivetrain impact analysis including:</p>
                <ul>
                  <li>Effective gear ratio changes</li>
                  <li>RPM changes at highway speed</li>
                  <li>Crawl ratio impact</li>
                  <li>Power delivery characteristics</li>
                </ul>
                <button onClick={onReset} className="btn btn-primary">
                  Add Gear Ratio
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'advisory' && (
          <div className="advisory-tab">
            <AdvisoryPanel advisory={advisory} comparison={comparison} formData={formData} />
          </div>
        )}

        {activeTab === 'regear' && (
          <div className="regear-tab">
            {regearRecommendations ? (
              <RegearRecommendations
                regearRecommendations={regearRecommendations}
                comparison={comparison}
              />
            ) : (
              <div className="no-data-message">
                <h3>Re-Gearing Analysis Not Available</h3>
                <p>Enter your current axle gear ratio to receive intelligent re-gearing recommendations.</p>
                <p>You'll get:</p>
                <ul>
                  <li>Gear ratios that restore factory performance</li>
                  <li>Optimal ratios for your intended use case</li>
                  <li>RPM and crawl ratio analysis for each option</li>
                  <li>Cost estimates and installation guidance</li>
                </ul>
                <button onClick={onReset} className="btn btn-primary">
                  Add Gear Ratio
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embed Code Generator */}
      <EmbedCodeGenerator
        currentTire={formData.currentTireSize}
        newTire={formData.newTireSize}
        gearRatio={formData.axleGearRatio}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ResultsDisplay;
