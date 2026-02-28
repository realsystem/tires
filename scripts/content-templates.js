/**
 * SEO Content Generation Templates
 * Generates engineered content blocks with calculated values
 * Written in experienced builder voice - technical, accurate, no fluff
 */

/**
 * Generate complete page content from calculation results
 */
export function generatePageContent(config) {
  const { currentTire, newTire, gearRatio, vehicleType, intendedUse, comparison, url } = config;

  const title = generateTitle(config);
  const metaDescription = generateMetaDescription(config);
  const h1 = generateH1(config);
  const intro = generateIntro(config, comparison);
  const comparisonBlock = generateComparisonBlock(comparison);
  const gearImpactBlock = generateGearImpactBlock(config, comparison);
  const advisoryBlock = generateAdvisoryBlock(config, comparison);
  const internalLinks = generateInternalLinks(config);
  const structuredData = generateStructuredData(config, comparison);

  return {
    title,
    metaDescription,
    h1,
    intro,
    comparisonBlock,
    gearImpactBlock,
    advisoryBlock,
    internalLinks,
    structuredData,
    url,
  };
}

/**
 * Generate SEO title
 */
export function generateTitle(config) {
  const { currentTire, newTire, gearRatio, vehicleType } = config;

  if (vehicleType && currentTire && newTire) {
    const vehName = formatVehicleName(vehicleType);
    return `${vehName}: ${currentTire} vs ${newTire} Tire Upgrade${gearRatio ? ` | ${gearRatio} Gears` : ''} - Engineering Analysis`;
  }

  if (currentTire && newTire) {
    return `${currentTire} vs ${newTire} - Tire Comparison & Gear Ratio Calculator`;
  }

  if (newTire) {
    return `${newTire} Tire Specs - Diameter, Gearing & Fitment Calculator`;
  }

  return 'Offroad Tire & Gear Ratio Engineering Tool';
}

/**
 * Generate meta description
 */
export function generateMetaDescription(config) {
  const { currentTire, newTire, gearRatio, vehicleType, comparison } = config;

  const diamDiff = comparison?.differences?.diameter?.absolute?.toFixed(2);
  const diamPct = comparison?.differences?.diameter?.percentage?.toFixed(1);

  if (vehicleType && currentTire && newTire && diamDiff) {
    const vehName = formatVehicleName(vehicleType);
    return `Upgrading your ${vehName} from ${currentTire} to ${newTire} adds ${diamDiff}" diameter (${diamPct}%). Engineering analysis: speedometer error, RPM changes, clearance requirements, and re-gear recommendations${gearRatio ? ` for ${gearRatio} gears` : ''}.`;
  }

  if (currentTire && newTire && diamDiff) {
    return `Engineering comparison: ${currentTire} to ${newTire} = +${diamDiff}" diameter (+${diamPct}%). Speedometer error, gear ratio impact, RPM changes, clearance analysis, and fitment requirements.`;
  }

  return 'Production-ready tire comparison calculator for serious 4x4 builds. Accurate speedometer error, gear ratio recommendations, clearance analysis, and drivetrain impact calculations.';
}

/**
 * Generate H1 heading
 */
export function generateH1(config) {
  const { currentTire, newTire, vehicleType } = config;

  if (vehicleType && currentTire && newTire) {
    const vehName = formatVehicleName(vehicleType);
    return `${vehName} Tire Upgrade: ${currentTire} to ${newTire}`;
  }

  if (currentTire && newTire) {
    return `${currentTire} vs ${newTire} Tire Comparison`;
  }

  if (newTire) {
    return `${newTire} Tire Analysis`;
  }

  return 'Offroad Tire & Gear Ratio Engineering Tool';
}

/**
 * Generate introductory content with calculated values
 */
export function generateIntro(config, comparison) {
  const { currentTire, newTire, gearRatio, vehicleType, intendedUse } = config;

  if (!comparison) {
    return `This page analyzes the ${newTire} tire size for off-road and overland builds. Use the calculator below to compare against your current tire size.`;
  }

  const currentDiam = comparison.current.diameter.toFixed(2);
  const newDiam = comparison.new.diameter.toFixed(2);
  const diamDiff = comparison.differences.diameter.absolute.toFixed(2);
  const diamPct = comparison.differences.diameter.percentage.toFixed(1);
  const clearanceGain = comparison.differences.groundClearance.gain.toFixed(2);
  const widthDiff = comparison.differences.width.absolute.toFixed(2);

  let intro = `Upgrading from **${currentTire}** (${currentDiam}" diameter) to **${newTire}** (${newDiam}" diameter) increases your tire diameter by **${diamDiff} inches** (${diamPct}%). This gives you **${clearanceGain}" additional ground clearance** and changes width by ${widthDiff}".`;

  // Add vehicle-specific context
  if (vehicleType) {
    const vehName = formatVehicleName(vehicleType);
    intro += ` This is a common upgrade for ${vehName} owners looking to improve off-road capability.`;
  }

  // Add gearing context if provided
  if (gearRatio && comparison.drivetrainImpact) {
    const effectiveRatio = comparison.drivetrainImpact.newEffectiveRatio?.toFixed(2);
    const rpmChange = comparison.drivetrainImpact.rpmChange?.toFixed(0);
    intro += ` With your current **${gearRatio} axle gears**, this changes your effective ratio to ${effectiveRatio} and drops highway RPM by approximately ${Math.abs(rpmChange)} RPM.`;
  }

  return intro;
}

/**
 * Generate detailed comparison block
 */
export function generateComparisonBlock(comparison) {
  if (!comparison) return '';

  const speedometerData = comparison.speedometerError;
  const diamDiff = comparison.differences.diameter.absolute.toFixed(2);
  const diamPct = comparison.differences.diameter.percentage.toFixed(1);

  let block = `## Diameter & Speedometer Impact\n\n`;
  block += `The **${diamDiff}" diameter increase** (${diamPct}%) directly affects your speedometer accuracy:\n\n`;

  if (speedometerData && speedometerData.errors) {
    const speeds = [30, 45, 60, 75];
    speeds.forEach(speed => {
      const key = `at${speed}mph`;
      const data = speedometerData.errors[key];
      if (data) {
        const indicated = data.indicated;
        const actual = data.actual.toFixed(1);
        const error = data.error.toFixed(1);
        block += `- **${indicated} mph indicated** = ${actual} mph actual (+${error} mph)\n`;
      }
    });

    const at60 = speedometerData.errors.at60mph;
    if (at60) {
      block += `\n**Bottom line**: Your speedometer will read slower than you're actually going. At 60 mph indicated, you're doing ${at60.actual.toFixed(1)} mph actual. This matters for speed limits and odometer-based maintenance intervals.\n`;
    }
  } else {
    block += `Your speedometer will be affected based on the diameter change. Use the calculator below for precise speed error calculations.\n`;
  }

  return block;
}

/**
 * Generate gear ratio impact analysis
 */
export function generateGearImpactBlock(config, comparison) {
  const { gearRatio, intendedUse } = config;

  if (!comparison?.drivetrainImpact) {
    return `## Re-Gearing Considerations\n\nUse the calculator below to enter your specific gear ratio for detailed RPM analysis and re-gear recommendations.`;
  }

  const impact = comparison.drivetrainImpact;
  const currentRatio = parseFloat(gearRatio);
  const effectiveRatio = impact.newEffectiveRatio?.toFixed(2) || 'N/A';
  const rpmChange = impact.rpmChange?.toFixed(0) || '0';
  const rpmAt65Current = impact.rpmAt65Current?.toFixed(0) || 'N/A';
  const rpmAt65New = impact.rpmAt65New?.toFixed(0) || 'N/A';
  const ratioChangePct = impact.ratioChangePercent ? Math.abs(parseFloat(impact.ratioChangePercent)) : 0;

  let block = `## Drivetrain & Gearing Impact\n\n`;
  block += `With **${gearRatio} axle gears**, this tire upgrade changes your effective gear ratio from ${currentRatio} to **${effectiveRatio}** (${ratioChangePct.toFixed(1)}% reduction).\n\n`;

  if (rpmAt65Current !== 'N/A' && rpmAt65New !== 'N/A') {
    block += `### Engine RPM Changes\n`;
    block += `- **Highway cruising (65 mph)**: ${rpmAt65Current} RPM → ${rpmAt65New} RPM (${rpmChange} RPM drop)\n`;
    block += `- **Power band shift**: ${Math.abs(parseInt(rpmChange)) > 100 ? 'Noticeable' : 'Minimal'} loss of low-end torque and throttle response\n`;
  }

  // Re-gear recommendation based on use case
  if (ratioChangePct > 10) {
    block += `\n### Re-Gearing Recommendation: **REQUIRED**\n\n`;
    block += `A ${ratioChangePct.toFixed(1)}% ratio change is significant. Re-gearing will restore power delivery and prevent drivetrain strain. `;

    if (intendedUse === 'rock_crawling') {
      block += `For rock crawling, consider **5.13 or 5.29 gears** to maintain low-end torque and improve crawl ratio.`;
    } else if (intendedUse === 'overlanding') {
      block += `For overlanding, **4.56 or 4.88 gears** will restore highway performance while maintaining loaded climbing ability.`;
    } else {
      block += `For weekend trail use, **4.56 or 4.88 gears** will restore factory-like performance.`;
    }
  } else if (ratioChangePct > 5) {
    block += `\n### Re-Gearing Recommendation: **Recommended**\n\n`;
    block += `A ${ratioChangePct.toFixed(1)}% ratio change is noticeable. Re-gearing is optional but recommended if you tow, drive at altitude, or frequently run loaded.`;
  } else {
    block += `\n### Re-Gearing Recommendation: **Optional**\n\n`;
    block += `The ratio change is minimal (${ratioChangePct.toFixed(1)}%). Most drivers won't need to re-gear unless running heavy loads or extreme terrain.`;
  }

  return block;
}

/**
 * Generate clearance and advisory warnings
 */
export function generateAdvisoryBlock(config, comparison) {
  const { vehicleType, intendedUse } = config;

  if (!comparison) return '';

  const diamDiff = comparison.differences.diameter.absolute;
  const widthDiff = comparison.differences.width.absolute;

  let block = `## Fitment & Clearance\n\n`;

  // Lift requirements
  if (diamDiff > 3) {
    block += `**Lift Required**: 3-4" suspension lift minimum. Possible trimming or body mount chop.\n\n`;
  } else if (diamDiff > 2) {
    block += `**Lift Required**: 2.5-3" suspension lift. Fender trimming or cutting likely needed.\n\n`;
  } else if (diamDiff > 1) {
    block += `**Lift Required**: 1.5-2" lift recommended. Minor trimming possible depending on wheel offset.\n\n`;
  } else {
    block += `**Lift Required**: 0-1" lift or extensive trimming. May fit with proper wheel offset.\n\n`;
  }

  // Width considerations
  if (widthDiff > 1.5) {
    block += `**Width Clearance**: +${widthDiff.toFixed(2)}" width increase requires significant clearancing. Check fender liner, UCA clearance, and full-lock turning radius.\n\n`;
  } else if (widthDiff > 0.5) {
    block += `**Width Clearance**: +${widthDiff.toFixed(2)}" wider. Verify clearance at full steering lock and compression.\n\n`;
  }

  // Vehicle-specific notes
  if (vehicleType === 'tacoma' || vehicleType === '4runner' || vehicleType === 'fourrunner') {
    block += `**IFS Note**: Independent front suspension limits flex but improves on-road handling. Wider tires can stress CV joints at extreme angles. Diff drop or UCA replacement may be needed for >2.5" lift.\n\n`;
  }

  if (vehicleType === 'jeep') {
    block += `**Solid Axle Note**: Wrangler and Gladiator solid axles handle large tires well. Focus on proper gearing and bump stop adjustment to prevent tire contact at full compression.\n\n`;
  }

  // Intended use advisory
  if (intendedUse === 'overlanding') {
    block += `**Overlanding Consideration**: Larger tires reduce fuel economy by 1-3 MPG and affect range. Plan fuel stops accordingly. Heavier rotating mass increases braking distance.\n\n`;
  }

  if (intendedUse === 'rock_crawling') {
    block += `**Rock Crawling Setup**: Run 12-15 PSI for maximum traction. Beadlock wheels recommended. Re-gear for crawl ratio >50:1 for technical obstacles.\n\n`;
  }

  return block;
}

/**
 * Generate internal links to related comparisons
 */
export function generateInternalLinks(config) {
  const { currentTire, newTire, vehicleType } = config;

  let links = `## Related Comparisons\n\n`;

  // Generate related tire comparisons
  const relatedComparisons = generateRelatedComparisons(currentTire, newTire, vehicleType);

  relatedComparisons.forEach(link => {
    links += `- [${link.text}](${link.url})\n`;
  });

  return links;
}

/**
 * Generate related comparison links
 */
function generateRelatedComparisons(currentTire, newTire, vehicleType) {
  // This would be populated with actual related comparisons from seo-data.json
  // For now, return placeholder structure
  return [
    { text: 'Popular tire sizes for your build', url: '/tire-sizes' },
    { text: 'Gear ratio calculator', url: '/gear-ratio-calculator' },
    { text: 'Lift requirements guide', url: '/lift-requirements' },
  ];
}

/**
 * Generate structured data (JSON-LD) for SEO
 */
export function generateStructuredData(config, comparison) {
  const { currentTire, newTire, vehicleType, url } = config;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: generateTitle(config),
    description: generateMetaDescription(config),
    url: `https://overlandn.com/tires${url}`,
    author: {
      '@type': 'Organization',
      name: 'Offroad Engineering Tools',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Offroad Engineering Tools',
    },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  };

  if (comparison) {
    structuredData.mainEntity = {
      '@type': 'Product',
      name: `${newTire} Tire`,
      description: `Technical specifications for ${newTire} tire including ${comparison.new.diameter.toFixed(2)}" diameter`,
    };
  }

  return JSON.stringify(structuredData, null, 2);
}

/**
 * Format vehicle name for display
 */
function formatVehicleName(vehicleType) {
  const names = {
    tacoma: 'Toyota Tacoma',
    '4runner': 'Toyota 4Runner',
    fourrunner: 'Toyota 4Runner',
    jeep: 'Jeep Wrangler',
    bronco: 'Ford Bronco',
    ranger: 'Ford Ranger',
    f150: 'Ford F-150',
    f250: 'Ford F-250',
    colorado: 'Chevrolet Colorado',
    silverado: 'Chevrolet Silverado',
    sierra: 'GMC Sierra',
  };

  return names[vehicleType.toLowerCase()] || vehicleType;
}
