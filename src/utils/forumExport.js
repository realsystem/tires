/**
 * Forum Export Utility
 * Generates plain-text formatted tire comparison for forum posting
 * Optimized for Tacoma World, IH8MUD, JeepForum, Expedition Portal
 */

/**
 * Generate forum-friendly plain text output
 * @param {Object} comparison - Full comparison result
 * @param {Object} formData - Original form inputs
 * @returns {string} - Plain text formatted for forums
 */
export function generateForumText(comparison, formData) {
  if (!comparison) return '';

  const lines = [];
  const divider = '═══════════════════════════════════════════════';

  // Header
  lines.push(divider);
  lines.push(`TIRE COMPARISON: ${formData.currentTireSize} → ${formData.newTireSize}`);
  if (formData.vehicleCategory) {
    const vehicleName = getVehicleDisplayName(formData.vehicleCategory);
    if (vehicleName) {
      lines.push(`Vehicle: ${vehicleName}`);
    }
  }
  lines.push(divider);
  lines.push('');

  // Dimensions
  lines.push('DIMENSIONS');
  lines.push(`Current: ${formData.currentTireSize} (${comparison.current.diameter.toFixed(2)}" diameter, ${comparison.current.widthInches.toFixed(1)}" width)`);
  lines.push(`New:     ${formData.newTireSize} (${comparison.new.diameter.toFixed(2)}" diameter, ${comparison.new.widthInches.toFixed(1)}" width)`);

  const diamDiff = comparison.differences.diameter.absolute.toFixed(2);
  const diamPct = comparison.differences.diameter.percentage.toFixed(1);
  const widthDiff = comparison.differences.width.absolute.toFixed(2);
  const widthPct = comparison.differences.width.percentage.toFixed(1);

  lines.push(`Change:  ${diamDiff > 0 ? '+' : ''}${diamDiff}" diameter (${diamPct > 0 ? '+' : ''}${diamPct}%), ${widthDiff > 0 ? '+' : ''}${widthDiff}" width (${widthPct > 0 ? '+' : ''}${widthPct}%)`);
  lines.push('');

  // Speedometer Error
  if (comparison.speedometerError) {
    lines.push('SPEEDOMETER ERROR');
    const errors = comparison.speedometerError.errors;
    if (errors) {
      [30, 60, 75].forEach(speed => {
        const data = errors[`at${speed}mph`];
        if (data) {
          lines.push(`${speed} mph indicated → ${data.actual.toFixed(1)} mph actual (${data.error > 0 ? '+' : ''}${data.error.toFixed(1)} mph)`);
        }
      });
    }
    lines.push('');
  }

  // Gearing Impact
  if (comparison.drivetrainImpact && formData.axleGearRatio) {
    lines.push(`GEARING IMPACT (${formData.axleGearRatio} axle ratio)`);
    const impact = comparison.drivetrainImpact;

    if (impact.newEffectiveRatio) {
      const effRatioChange = impact.ratioChangePercent || 0;
      lines.push(`Effective ratio: ${formData.axleGearRatio} → ${impact.newEffectiveRatio.toFixed(2)} (${effRatioChange > 0 ? '+' : ''}${effRatioChange.toFixed(1)}%)`);
    }

    if (impact.rpmAt65Current && impact.rpmAt65New) {
      const rpmChange = impact.rpmChange || 0;
      lines.push(`Highway RPM @ 65 mph: ${impact.rpmAt65Current.toFixed(0)} → ${impact.rpmAt65New.toFixed(0)} (${rpmChange > 0 ? '+' : ''}${rpmChange.toFixed(0)} RPM)`);
    }

    if (impact.crawlRatioCurrent && impact.crawlRatioNew) {
      lines.push(`Crawl ratio (4WD Low): ${impact.crawlRatioCurrent.toFixed(1)}:1 → ${impact.crawlRatioNew.toFixed(1)}:1`);
    }

    lines.push('');

    // Re-gear recommendations
    lines.push('RE-GEAR RECOMMENDATION');
    const pctChange = Math.abs(parseFloat(impact.ratioChangePercent || 0));

    if (pctChange > 10) {
      lines.push('Status: REQUIRED - Significant ratio change');
    } else if (pctChange > 5) {
      lines.push('Status: Recommended - Noticeable change');
    } else {
      lines.push('Status: Optional - Minimal change');
    }

    // Suggest specific ratios based on use case
    if (formData.intendedUse === 'rock_crawling') {
      lines.push('For rock crawling: 5.13 or 5.29 gears');
    } else if (formData.intendedUse === 'overlanding') {
      lines.push('For overlanding: 4.56 or 4.88 gears');
    } else if (formData.intendedUse === 'daily_driver') {
      lines.push('For daily driving: 4.10 or 4.56 gears');
    } else {
      lines.push('For weekend trail: 4.56 or 4.88 gears');
    }
    lines.push('');
  }

  // Clearance & Fitment
  lines.push('CLEARANCE & FITMENT');
  const clearanceGain = comparison.differences.groundClearance.gain.toFixed(2);
  lines.push(`Ground clearance gain: +${clearanceGain}"`);

  // Lift requirements
  const diamChange = comparison.differences.diameter.absolute;
  if (diamChange > 3) {
    lines.push('Lift required: 3-4" suspension lift minimum');
    lines.push('Fender work: Extensive trimming or body mount chop required');
  } else if (diamChange > 2) {
    lines.push('Lift required: 2.5-3" suspension lift');
    lines.push('Fender work: Trimming or cutting likely needed');
  } else if (diamChange > 1) {
    lines.push('Lift required: 1.5-2" suspension lift recommended');
    lines.push('Fender work: Minor trimming possible');
  } else {
    lines.push('Lift required: 0-1" or extensive trimming');
    lines.push('Fender work: Depends on wheel offset');
  }

  lines.push('');

  // Footer
  lines.push(divider);
  lines.push('Generated by Offroad Tire & Gear Ratio Calculator');
  lines.push('https://overlandn.com/tires');
  lines.push(divider);

  return lines.join('\n');
}

/**
 * Generate BBCode formatted output for forums that support it
 * @param {Object} comparison - Full comparison result
 * @param {Object} formData - Original form inputs
 * @returns {string} - BBCode formatted text
 */
export function generateBBCodeText(comparison, formData) {
  if (!comparison) return '';

  const lines = [];

  // Header
  lines.push('[b]═══════════════════════════════════════════════[/b]');
  lines.push(`[b]TIRE COMPARISON: ${formData.currentTireSize} → ${formData.newTireSize}[/b]`);
  if (formData.vehicleCategory) {
    const vehicleName = getVehicleDisplayName(formData.vehicleCategory);
    if (vehicleName) {
      lines.push(`[i]Vehicle: ${vehicleName}[/i]`);
    }
  }
  lines.push('[b]═══════════════════════════════════════════════[/b]');
  lines.push('');

  // Dimensions
  lines.push('[b]DIMENSIONS[/b]');
  lines.push(`Current: ${formData.currentTireSize} (${comparison.current.diameter.toFixed(2)}" diameter, ${comparison.current.widthInches.toFixed(1)}" width)`);
  lines.push(`New:     ${formData.newTireSize} (${comparison.new.diameter.toFixed(2)}" diameter, ${comparison.new.widthInches.toFixed(1)}" width)`);

  const diamDiff = comparison.differences.diameter.absolute.toFixed(2);
  const diamPct = comparison.differences.diameter.percentage.toFixed(1);
  const widthDiff = comparison.differences.width.absolute.toFixed(2);

  lines.push(`[color=orange]Change:  ${diamDiff > 0 ? '+' : ''}${diamDiff}" diameter (${diamPct > 0 ? '+' : ''}${diamPct}%), ${widthDiff > 0 ? '+' : ''}${widthDiff}" width[/color]`);
  lines.push('');

  // Speedometer
  if (comparison.speedometerError?.errors) {
    lines.push('[b]SPEEDOMETER ERROR[/b]');
    const errors = comparison.speedometerError.errors;
    [30, 60, 75].forEach(speed => {
      const data = errors[`at${speed}mph`];
      if (data) {
        lines.push(`${speed} mph → [color=red]${data.actual.toFixed(1)} mph actual[/color]`);
      }
    });
    lines.push('');
  }

  // Gearing
  if (comparison.drivetrainImpact) {
    lines.push(`[b]GEARING IMPACT (${formData.axleGearRatio} gears)[/b]`);
    const impact = comparison.drivetrainImpact;

    if (impact.newEffectiveRatio) {
      lines.push(`Effective ratio: ${formData.axleGearRatio} → [color=orange]${impact.newEffectiveRatio.toFixed(2)}[/color]`);
    }
    lines.push('');
  }

  // Footer
  lines.push('[b]═══════════════════════════════════════════════[/b]');
  lines.push('[url=https://overlandn.com/tires]Offroad Tire Engineering Tool[/url]');
  lines.push('[b]═══════════════════════════════════════════════[/b]');

  return lines.join('\n');
}

/**
 * Get vehicle display name from category code
 */
function getVehicleDisplayName(category) {
  const vehicleNames = {
    'tacoma_3rd_gen': 'Toyota Tacoma (3rd Gen)',
    'tacoma_2nd_gen': 'Toyota Tacoma (2nd Gen)',
    '4runner_5th_gen': 'Toyota 4Runner (5th Gen)',
    '4runner_4th_gen': 'Toyota 4Runner (4th Gen)',
    '4runner_3rd_gen': 'Toyota 4Runner (3rd Gen)',
    '4runner_2nd_gen': 'Toyota 4Runner (2nd Gen)',
    '4runner_1st_gen': 'Toyota 4Runner (1st Gen)',
    'wrangler_jl': 'Jeep Wrangler JL',
    'wrangler_jk': 'Jeep Wrangler JK',
    'wrangler_tj': 'Jeep Wrangler TJ',
    'wrangler_yj': 'Jeep Wrangler YJ',
    'wrangler_cj': 'Jeep CJ Series',
    'gladiator_jt': 'Jeep Gladiator JT',
    'bronco_6th_gen': 'Ford Bronco (6th Gen)',
    'ranger_us_2019': 'Ford Ranger (2019+)',
    'f150_14th_gen': 'Ford F-150 (14th Gen)',
    'f250_4th_gen': 'Ford F-250 Super Duty',
    'colorado_2nd_gen': 'Chevrolet Colorado (2nd Gen)',
    'silverado_1500_4th': 'Chevrolet Silverado 1500',
    'silverado_2500_4th': 'Chevrolet Silverado 2500HD',
    'sierra_1500_4th': 'GMC Sierra 1500',
    'sierra_2500_4th': 'GMC Sierra 2500HD',
  };

  return vehicleNames[category] || '';
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}
