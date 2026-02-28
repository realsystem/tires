/**
 * Export/Import utilities for tire calculations
 * Allows users to save and reload calculation results
 */

/**
 * Export calculation results to JSON file
 * @param {Object} results - Complete calculation results
 * @param {Object} formData - Form input data
 */
export function exportToJSON(results, formData) {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    formData: formData,
    results: results,
    metadata: {
      appName: 'Off-Road Tire Calculator',
      appVersion: '1.0'
    }
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;

  // Generate filename from tire sizes
  const currentTire = results.comparison.current.formatted.replace(/\//g, '-');
  const newTire = results.comparison.new.formatted.replace(/\//g, '-');
  const timestamp = new Date().toISOString().split('T')[0];

  link.download = `tire-calc_${currentTire}_to_${newTire}_${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export calculation results to CSV file
 * @param {Object} results - Complete calculation results
 */
export function exportToCSV(results) {
  const { comparison, drivetrainImpact } = results.comparison;

  const rows = [
    ['Off-Road Tire Calculator - Results Export'],
    ['Export Date', new Date().toLocaleString()],
    [''],
    ['Tire Comparison'],
    ['Metric', 'Current', 'New', 'Change'],
    ['Tire Size', comparison.current.formatted, comparison.new.formatted, ''],
    ['Diameter (inches)', comparison.current.diameter.toFixed(2), comparison.new.diameter.toFixed(2), comparison.differences.diameter.inches.toFixed(2)],
    ['Width (inches)', comparison.current.widthInches.toFixed(2), comparison.new.widthInches.toFixed(2), comparison.differences.width.inches.toFixed(2)],
    ['Sidewall (inches)', comparison.current.sidewallInches.toFixed(2), comparison.new.sidewallInches.toFixed(2), comparison.differences.sidewall.inches.toFixed(2)],
    ['Circumference (inches)', comparison.current.circumference.toFixed(2), comparison.new.circumference.toFixed(2), comparison.differences.circumference.inches.toFixed(2)],
    ['Ground Clearance Gain (inches)', '', '', comparison.differences.groundClearance.inches.toFixed(2)],
    [''],
    ['Speedometer Error'],
    ['Speed (indicated)', '30 mph', '45 mph', '60 mph', '75 mph'],
    ['Actual Speed',
      comparison.speedometerError.errors.at30mph.actual.toFixed(1),
      comparison.speedometerError.errors.at45mph.actual.toFixed(1),
      comparison.speedometerError.errors.at60mph.actual.toFixed(1),
      comparison.speedometerError.errors.at75mph.actual.toFixed(1)
    ],
    ['']
  ];

  if (drivetrainImpact) {
    rows.push(
      ['Drivetrain Impact'],
      ['Metric', 'Current', 'New', 'Change'],
      ['Effective Gear Ratio',
        drivetrainImpact.effectiveGearRatio.original.toFixed(2),
        drivetrainImpact.effectiveGearRatio.new.toFixed(2),
        drivetrainImpact.effectiveGearRatio.change.toFixed(2) + ' (' + drivetrainImpact.effectiveGearRatio.changePercentage.toFixed(1) + '%)'
      ],
      ['RPM @ 65 mph',
        Math.round(drivetrainImpact.rpm.original),
        Math.round(drivetrainImpact.rpm.new),
        Math.round(drivetrainImpact.rpm.change) + ' (' + drivetrainImpact.rpm.changePercentage.toFixed(1) + '%)'
      ],
      ['Crawl Ratio (4-Low)',
        drivetrainImpact.crawlRatio.original.toFixed(1) + ':1',
        drivetrainImpact.crawlRatio.new.toFixed(1) + ':1',
        drivetrainImpact.crawlRatio.change.toFixed(1)
      ]
    );
  }

  const csvContent = rows.map(row => row.join(',')).join('\n');
  const dataBlob = new Blob([csvContent], { type: 'text/csv' });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;

  const currentTire = comparison.current.formatted.replace(/\//g, '-');
  const newTire = comparison.new.formatted.replace(/\//g, '-');
  const timestamp = new Date().toISOString().split('T')[0];

  link.download = `tire-calc_${currentTire}_to_${newTire}_${timestamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export calculation results to text report
 * @param {Object} results - Complete calculation results
 */
export function exportToText(results) {
  const { comparison } = results;
  const drivetrainImpact = comparison.drivetrainImpact;

  let text = '';
  text += '═══════════════════════════════════════════════════\n';
  text += '  OFF-ROAD TIRE CALCULATOR - RESULTS REPORT\n';
  text += '═══════════════════════════════════════════════════\n\n';
  text += `Export Date: ${new Date().toLocaleString()}\n`;
  text += `Comparison: ${comparison.current.formatted} → ${comparison.new.formatted}\n\n`;

  text += '───────────────────────────────────────────────────\n';
  text += 'TIRE SPECIFICATIONS\n';
  text += '───────────────────────────────────────────────────\n\n';

  text += `Current Tire: ${comparison.current.formatted}\n`;
  text += `  Diameter:     ${comparison.current.diameter.toFixed(2)}"\n`;
  text += `  Width:        ${comparison.current.widthInches.toFixed(2)}"\n`;
  text += `  Sidewall:     ${comparison.current.sidewallInches.toFixed(2)}"\n`;
  text += `  Circumference: ${comparison.current.circumference.toFixed(2)}"\n\n`;

  text += `New Tire: ${comparison.new.formatted}\n`;
  text += `  Diameter:     ${comparison.new.diameter.toFixed(2)}"\n`;
  text += `  Width:        ${comparison.new.widthInches.toFixed(2)}"\n`;
  text += `  Sidewall:     ${comparison.new.sidewallInches.toFixed(2)}"\n`;
  text += `  Circumference: ${comparison.new.circumference.toFixed(2)}"\n\n`;

  text += 'Changes:\n';
  text += `  Diameter:     ${comparison.differences.diameter.inches >= 0 ? '+' : ''}${comparison.differences.diameter.inches.toFixed(2)}" (${comparison.differences.diameter.percentage >= 0 ? '+' : ''}${comparison.differences.diameter.percentage.toFixed(1)}%)\n`;
  text += `  Width:        ${comparison.differences.width.inches >= 0 ? '+' : ''}${comparison.differences.width.inches.toFixed(2)}" (${comparison.differences.width.percentage >= 0 ? '+' : ''}${comparison.differences.width.percentage.toFixed(1)}%)\n`;
  text += `  Ground Clearance Gain: +${comparison.differences.groundClearance.inches.toFixed(2)}"\n\n`;

  text += '───────────────────────────────────────────────────\n';
  text += 'SPEEDOMETER ERROR\n';
  text += '───────────────────────────────────────────────────\n\n';

  text += `30 mph indicated = ${comparison.speedometerError.errors.at30mph.actual.toFixed(1)} mph actual\n`;
  text += `45 mph indicated = ${comparison.speedometerError.errors.at45mph.actual.toFixed(1)} mph actual\n`;
  text += `60 mph indicated = ${comparison.speedometerError.errors.at60mph.actual.toFixed(1)} mph actual\n`;
  text += `75 mph indicated = ${comparison.speedometerError.errors.at75mph.actual.toFixed(1)} mph actual\n\n`;

  if (drivetrainImpact) {
    text += '───────────────────────────────────────────────────\n';
    text += 'DRIVETRAIN IMPACT\n';
    text += '───────────────────────────────────────────────────\n\n';

    text += 'Effective Gear Ratio:\n';
    text += `  Current: ${drivetrainImpact.effectiveGearRatio.original.toFixed(2)}\n`;
    text += `  New:     ${drivetrainImpact.effectiveGearRatio.new.toFixed(2)}\n`;
    text += `  Change:  ${drivetrainImpact.effectiveGearRatio.change >= 0 ? '+' : ''}${drivetrainImpact.effectiveGearRatio.change.toFixed(2)} (${drivetrainImpact.effectiveGearRatio.changePercentage >= 0 ? '+' : ''}${drivetrainImpact.effectiveGearRatio.changePercentage.toFixed(1)}%)\n\n`;

    text += 'Engine RPM @ 65 mph:\n';
    text += `  Current: ${Math.round(drivetrainImpact.rpm.original)} RPM\n`;
    text += `  New:     ${Math.round(drivetrainImpact.rpm.new)} RPM\n`;
    text += `  Change:  ${drivetrainImpact.rpm.change >= 0 ? '+' : ''}${Math.round(drivetrainImpact.rpm.change)} RPM (${drivetrainImpact.rpm.changePercentage >= 0 ? '+' : ''}${drivetrainImpact.rpm.changePercentage.toFixed(1)}%)\n\n`;

    text += 'Crawl Ratio (4WD Low):\n';
    text += `  Current: ${drivetrainImpact.crawlRatio.original.toFixed(1)}:1\n`;
    text += `  New:     ${drivetrainImpact.crawlRatio.new.toFixed(1)}:1\n`;
    text += `  Change:  ${drivetrainImpact.crawlRatio.change >= 0 ? '+' : ''}${drivetrainImpact.crawlRatio.change.toFixed(1)}\n\n`;
  }

  text += '───────────────────────────────────────────────────\n';
  text += 'CLEARANCE & FITMENT\n';
  text += '───────────────────────────────────────────────────\n\n';

  text += `Lift Required: ${comparison.clearance.liftRecommendation}\n`;
  text += `Fender Clearance: ${comparison.clearance.fenderClearance.message}\n`;
  text += `Wheel Offset: ${comparison.clearance.wheelOffset.message}\n`;
  if (comparison.clearance.bumpstopModification) {
    text += `Bumpstop: ${comparison.clearance.bumpstopModification}\n`;
  }

  text += '\n';
  text += '═══════════════════════════════════════════════════\n';
  text += '  Generated by Off-Road Tire Calculator\n';
  text += '═══════════════════════════════════════════════════\n';

  const dataBlob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;

  const currentTire = comparison.current.formatted.replace(/\//g, '-');
  const newTire = comparison.new.formatted.replace(/\//g, '-');
  const timestamp = new Date().toISOString().split('T')[0];

  link.download = `tire-calc_${currentTire}_to_${newTire}_${timestamp}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import calculation results from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} Imported data
 */
export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Validate import data
        if (!data.version || !data.formData || !data.results) {
          reject(new Error('Invalid import file format'));
          return;
        }

        // Check version compatibility
        if (data.version !== '1.0') {
          console.warn(`Import file version ${data.version} may not be fully compatible`);
        }

        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse import file: ' + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read import file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Save calculation to browser local storage
 * @param {string} key - Storage key
 * @param {Object} results - Calculation results
 * @param {Object} formData - Form data
 */
export function saveToLocalStorage(key, results, formData) {
  try {
    const saveData = {
      version: '1.0',
      saveDate: new Date().toISOString(),
      formData: formData,
      results: results
    };

    localStorage.setItem(key, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Failed to save to local storage:', error);
    return false;
  }
}

/**
 * Load calculation from browser local storage
 * @param {string} key - Storage key
 * @returns {Object|null} Saved data or null
 */
export function loadFromLocalStorage(key) {
  try {
    const dataStr = localStorage.getItem(key);
    if (!dataStr) return null;

    const data = JSON.parse(dataStr);

    // Validate data
    if (!data.version || !data.formData || !data.results) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load from local storage:', error);
    return null;
  }
}

/**
 * List all saved calculations in local storage
 * @returns {Array} List of saved calculations with metadata
 */
export function listSavedCalculations() {
  const saved = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tire-calc-')) {
        const dataStr = localStorage.getItem(key);
        if (dataStr) {
          try {
            const data = JSON.parse(dataStr);
            saved.push({
              key: key,
              saveDate: data.saveDate,
              currentTire: data.results.comparison.current.formatted,
              newTire: data.results.comparison.new.formatted
            });
          } catch (e) {
            // Skip invalid entries
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to list saved calculations:', error);
  }

  return saved.sort((a, b) => new Date(b.saveDate) - new Date(a.saveDate));
}

/**
 * Delete saved calculation from local storage
 * @param {string} key - Storage key
 */
export function deleteSavedCalculation(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to delete saved calculation:', error);
    return false;
  }
}
