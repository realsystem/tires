import React, { useState } from 'react';
import CalculatorForm from './components/CalculatorForm';
import ResultsDisplay from './components/ResultsDisplay';
import { parseTireSize, validateTireCompatibility } from './engine/tireParser';
import { calculateTireComparison } from './engine/tireCalculator';
import { generateRegearRecommendations } from './engine/regearEngine';
import { generateAdvisory } from './engine/advisoryEngine';
import { importFromJSON } from './utils/exportImport';
import './styles/App.css';

/**
 * Calculate drivetrain impact when BOTH tires and gears are changing
 * Compares: original state (current tires + current gears) → final state (new tires + new gears)
 */
function calculateFinalStateDrivetrainImpact(currentTireMetrics, newTireMetrics, currentGearRatio, newGearRatio, drivetrain) {
  const {
    transmissionTopGear = 1.0,
    transferCaseRatio = 1.0,
    transferCaseLowRatio = 2.5,
    firstGearRatio = 3.5  // Default first gear ratio for crawl calculations
  } = drivetrain;

  const testSpeed = 65; // mph

  // Original state: current tires + current gears
  const originalEffectiveRatio = currentGearRatio;
  const originalRPM = (testSpeed * currentGearRatio * transmissionTopGear * 336) / currentTireMetrics.diameter;
  const originalCrawlRatio = currentGearRatio * transferCaseLowRatio * firstGearRatio;

  // Final state: new tires + new gears
  const finalEffectiveRatio = newGearRatio;
  const finalRPM = (testSpeed * newGearRatio * transmissionTopGear * 336) / newTireMetrics.diameter;
  const finalCrawlRatio = newGearRatio * transferCaseLowRatio * firstGearRatio;

  // Calculate changes
  const effectiveRatioChange = finalEffectiveRatio - originalEffectiveRatio;
  const effectiveRatioChangePct = (effectiveRatioChange / originalEffectiveRatio) * 100;
  const rpmChange = finalRPM - originalRPM;
  const rpmChangePct = (rpmChange / originalRPM) * 100;
  const crawlRatioChange = finalCrawlRatio - originalCrawlRatio;
  const crawlRatioChangePct = (crawlRatioChange / originalCrawlRatio) * 100;

  return {
    effectiveGearRatio: {
      original: originalEffectiveRatio,
      new: finalEffectiveRatio,
      change: effectiveRatioChange,
      changePercentage: effectiveRatioChangePct,
      summary: effectiveRatioChangePct < -5
        ? 'Effective gearing is LOWER (taller) - reduced acceleration, lower RPM'
        : effectiveRatioChangePct > 5
          ? 'Effective gearing is HIGHER (shorter) - improved acceleration, higher RPM'
          : 'Minimal effective gear ratio change'
    },
    rpm: {
      original: originalRPM,
      new: finalRPM,
      change: rpmChange,
      changePercentage: rpmChangePct,
      testSpeed: testSpeed,
      summary: `${Math.abs(rpmChange).toFixed(0)} RPM ${rpmChange > 0 ? 'increase' : 'decrease'} at ${testSpeed} mph`
    },
    crawlRatio: {
      original: originalCrawlRatio,
      new: finalCrawlRatio,
      change: crawlRatioChange,
      changePercentage: crawlRatioChangePct,
      summary: crawlRatioChangePct > 5
        ? 'Improved crawl capability - better control at low speeds'
        : crawlRatioChangePct < -5
          ? 'Reduced crawl capability - less control at low speeds'
          : 'Maintained crawl capability'
    }
  };
}

function App() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleCalculate = (formData) => {
    try {
      setError(null);

      // Parse tire sizes
      const currentTire = parseTireSize(formData.currentTireSize);
      const newTire = parseTireSize(formData.newTireSize);

      // Validate compatibility - get warnings but never block
      const compatibility = validateTireCompatibility(currentTire, newTire);

      // Build drivetrain config (current setup)
      const drivetrain = {};
      if (formData.axleGearRatio) {
        drivetrain.axleGearRatio = parseFloat(formData.axleGearRatio);
      }
      if (formData.transmissionTopGear) {
        drivetrain.transmissionTopGear = parseFloat(formData.transmissionTopGear);
      }
      if (formData.transferCaseRatio) {
        drivetrain.transferCaseRatio = parseFloat(formData.transferCaseRatio);
      }
      if (formData.transferCaseLowRatio) {
        drivetrain.transferCaseLowRatio = parseFloat(formData.transferCaseLowRatio);
      }
      if (formData.firstGearRatio) {
        drivetrain.firstGearRatio = parseFloat(formData.firstGearRatio);
      }

      // Build tire specs config (optional advanced specs)
      const tireSpecs = {};
      if (formData.currentTireWeight) {
        tireSpecs.currentTireWeight = parseFloat(formData.currentTireWeight);
      }
      if (formData.newTireWeight) {
        tireSpecs.newTireWeight = parseFloat(formData.newTireWeight);
      }
      if (formData.currentTireLoadIndex) {
        tireSpecs.currentTireLoadIndex = parseInt(formData.currentTireLoadIndex);
      }
      if (formData.newTireLoadIndex) {
        tireSpecs.newTireLoadIndex = parseInt(formData.newTireLoadIndex);
      }

      // Calculate comparison (current tires + current gears → new tires + current gears)
      const comparison = calculateTireComparison(currentTire, newTire, drivetrain, tireSpecs, formData.intendedUse);

      // If new gear ratio specified, calculate with new gears
      let comparisonWithNewGears = null;
      let finalStateComparison = null;
      if (formData.newAxleGearRatio && formData.axleGearRatio) {
        const drivetrainWithNewGears = {
          ...drivetrain,
          axleGearRatio: parseFloat(formData.newAxleGearRatio)
        };
        comparisonWithNewGears = calculateTireComparison(currentTire, newTire, drivetrainWithNewGears, tireSpecs, formData.intendedUse);

        // Create final state comparison: current tires + current gears → new tires + new gears
        // This is what the user actually wants to see in the Drivetrain Impact section
        finalStateComparison = {
          ...comparisonWithNewGears,
          // Override current metrics to use original drivetrain
          current: comparison.current,
          // Calculate proper drivetrain impact between original and final states
          drivetrainImpact: calculateFinalStateDrivetrainImpact(
            comparison.current,
            comparisonWithNewGears.new,
            parseFloat(formData.axleGearRatio),
            parseFloat(formData.newAxleGearRatio),
            drivetrain
          )
        };
      }

      // Generate re-gear recommendations (if gear ratio provided)
      let regearRecommendations = null;
      if (formData.axleGearRatio) {
        regearRecommendations = generateRegearRecommendations(
          comparison,
          parseFloat(formData.axleGearRatio),
          formData.intendedUse,
          drivetrain,
          formData.vehicleType || null
        );
      }

      // Generate advisory
      const advisory = generateAdvisory(
        comparison,
        formData.intendedUse,
        { suspensionType: formData.suspensionType }
      );

      // Set results
      setResults({
        comparison,
        comparisonWithNewGears,
        finalStateComparison,
        regearRecommendations,
        advisory,
        compatibility,
        formData
      });

    } catch (err) {
      setError({
        type: 'parse',
        message: err.message
      });
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  const handleImport = async (file) => {
    try {
      setError(null);
      const importedData = await importFromJSON(file);

      // Restore results
      setResults(importedData.results);

    } catch (err) {
      setError({
        type: 'import',
        message: 'Import failed: ' + err.message
      });
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-top">
            <a href="https://overlandn.com" className="back-to-main">← Back to main page</a>
          </div>
          <h1>Offroad Tire & Gear Ratio Engineering Tool</h1>
          <p className="tagline">Tire analysis for serious 4x4 builds and overlanding</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {error && (
            <div className={`alert alert-${error.type === 'validation' ? 'warning' : 'error'}`}>
              <h3>⚠️ {error.type === 'validation' ? 'Validation Issues' : 'Error'}</h3>
              {error.message && <p>{error.message}</p>}
              {error.errors && error.errors.length > 0 && (
                <ul>
                  {error.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
              {error.warnings && error.warnings.length > 0 && (
                <div>
                  <strong>Warnings:</strong>
                  <ul>
                    {error.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!results ? (
            <CalculatorForm onCalculate={handleCalculate} onImport={handleImport} />
          ) : (
            <ResultsDisplay results={results} onReset={handleReset} />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Built for overlanders and off-road enthusiasts. All calculations use industry-standard formulas.</p>
        <p className="disclaimer">Always verify clearance and consult professionals for major modifications.</p>
      </footer>
    </div>
  );
}

export default App;
