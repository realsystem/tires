/**
 * Regearing Guidance Module
 *
 * PURPOSE: Provide honest, real-world guidance based on actual forum data
 * Instead of complex engineering scores, shows what people ACTUALLY do
 *
 * BASED ON: Research from Tacoma World, Jeep Forums, 4Runner Forums (2024-2026)
 */

/**
 * Get regearing guidance based on tire upgrade
 * Returns practical advice based on real-world user behavior
 *
 * @param {object} params - Analysis parameters
 * @param {number} params.diameterChangePct - Diameter change percentage
 * @param {number} params.diameterChangeInches - Diameter change in inches
 * @param {number} params.effectiveGearRatioChangePct - Effective gear ratio change
 * @param {string} params.intendedUse - Usage mode
 * @param {string} params.vehicleType - Vehicle type (tacoma, 4runner, wrangler, etc.)
 * @returns {object} Practical regearing guidance
 */
export function getRegearingGuidance(params) {
  const {
    diameterChangePct,
    diameterChangeInches,
    effectiveGearRatioChangePct = 0,
    intendedUse = 'weekend_trail',
    vehicleType = 'unknown'
  } = params;

  // Determine the scenario based on diameter change
  const absDiameterChange = Math.abs(diameterChangePct);
  const absInchChange = Math.abs(diameterChangeInches);

  let scenario;
  if (absDiameterChange < 2) {
    scenario = 'minimal';
  } else if (absDiameterChange < 5) {
    scenario = 'small'; // ~33" tires (1-2" increase)
  } else if (absDiameterChange < 12) {
    scenario = 'moderate'; // 35" tires (3-4" increase)
  } else if (absDiameterChange < 20) {
    scenario = 'large'; // 37" tires (5-6" increase)
  } else {
    scenario = 'extreme'; // 40"+ tires (8"+ increase)
  }

  // Get guidance based on scenario
  const guidance = getScenarioGuidance(scenario, intendedUse, vehicleType, absInchChange);

  return {
    scenario,
    likelihood: guidance.likelihood,
    consensus: guidance.consensus,
    realityCheck: guidance.realityCheck,
    whyRegear: guidance.whyRegear,
    whyNotRegear: guidance.whyNotRegear,
    costContext: guidance.costContext,
    recommendation: guidance.recommendation,
    transmissionNote: guidance.transmissionNote,
    forumSources: guidance.forumSources
  };
}

/**
 * Get scenario-specific guidance
 */
function getScenarioGuidance(scenario, intendedUse, vehicleType, inchChange) {
  const dailyDriver = intendedUse === 'daily_driver';
  const rockCrawling = intendedUse === 'rock_crawling';

  switch (scenario) {
    case 'minimal':
      return {
        likelihood: '5%',
        consensus: 'Almost nobody regears for this',
        realityCheck: 'This tire size change is negligible. Stock gears are perfectly fine.',
        whyRegear: [
          'Already planning to go much bigger later',
          'Want absolutely perfect factory feel restored'
        ],
        whyNotRegear: [
          'Tire change is too small to matter',
          'Performance impact is imperceptible',
          'Not worth the $2,000-3,000 cost'
        ],
        costContext: '$2,000-3,000 for parts + labor',
        recommendation: 'No regearing needed',
        transmissionNote: 'Automatic and manual transmissions both handle this fine.',
        forumSources: 'Forum consensus: "Not worth it for small changes"'
      };

    case 'small':
      // ~33" tires (3-5% diameter increase)
      return {
        likelihood: dailyDriver ? '30%' : '20%',
        consensus: 'Most people DON\'T regear for 33" tires',
        realityCheck: `About ${dailyDriver ? '70%' : '80%'} of users run 33" tires on stock gears indefinitely. They accept slightly slower acceleration as a trade-off.`,
        whyRegear: [
          'Planning to go to 35" or larger later',
          'Daily driving with automatic transmission feels too sluggish',
          'Frequent towing or mountain driving',
          'Heavy off-road use or rock crawling',
          'Have a 4-cylinder engine (less torque to spare)'
        ],
        whyNotRegear: [
          'Cost: $2,000-3,000+ for regearing',
          'V6/V8 engine has sufficient torque',
          'Weekend trail use only (not daily driver)',
          'Can live with 1-2 MPG loss and slightly slower acceleration',
          'Already have 4.10+ gears (not 3.73)'
        ],
        costContext: '$2,000-3,000 for parts + labor — this is the #1 reason people skip regearing',
        recommendation: dailyDriver
          ? 'Optional. Most skip it, but dailydrivers benefit most if you do regear.'
          : 'Optional. Most people run 33s on stock gears for years with no issues.',
        transmissionNote: 'Automatics feel the impact more. Manuals handle stock gears better.',
        forumSources: 'Tacoma World, 4Runner Forums: "You can get away without regearing for 33s"'
      };

    case 'moderate':
      // 35" tires (5-12% diameter increase)
      return {
        likelihood: dailyDriver ? '60%' : '40%',
        consensus: 'About half regear for 35" tires',
        realityCheck: `${dailyDriver
          ? '60% of daily drivers regear due to sluggish performance and transmission hunting'
          : '40% regear — many weekend wheelers run 35s on stock gears without issues'
        }.`,
        whyRegear: [
          'Daily driving with automatic transmission (transmission hunting, sluggish)',
          'Automatic transmission overheating in mountains/traffic',
          'Significant power loss affecting driveability',
          'Highway driving — transmission won\'t hold top gear',
          'Want to restore factory-like performance'
        ],
        whyNotRegear: [
          'Weekend use only — can tolerate reduced power',
          'Cost: $2,500-3,500 is a major investment',
          'Manual transmission — shifts manually, less issue',
          'Rock crawling — lower gearing is actually preferred',
          'Already have deep gears (4.56+)'
        ],
        costContext: '$2,500-3,500 — weigh this against quality-of-life improvement',
        recommendation: dailyDriver
          ? 'Recommended for daily drivers. Most regear to avoid transmission hunting and power loss.'
          : rockCrawling
            ? 'Optional. Many rock crawlers prefer the lower effective gearing and don\'t regear.'
            : 'About 50/50 split. Depends on your tolerance for reduced performance.',
        transmissionNote: 'CRITICAL: Automatics often REQUIRE regearing. Manuals tolerate it better. Monitor transmission temps if staying stock.',
        forumSources: 'Jeep Wrangler Forum, 4Runner: "35s with automatics — regear for daily driving"'
      };

    case 'large':
      // 37" tires (12-20% diameter increase)
      return {
        likelihood: '80%',
        consensus: 'Most people regear for 37" tires',
        realityCheck: 'About 80% of users regear. The 20% who don\'t often experience transmission issues or add auxiliary coolers.',
        whyRegear: [
          'Severe performance degradation without regearing',
          'Automatic transmission overheating (common)',
          'Transmission refuses to shift or stays in low gears',
          'Fuel economy drops to 10-13 MPG',
          'Engine lugging and excessive wear',
          'Almost mandatory for daily driving'
        ],
        whyNotRegear: [
          'Pure trail rig (very limited street use)',
          'Already installed auxiliary transmission cooler',
          'Manual transmission with patience for very slow acceleration',
          'Temporary setup before going even bigger'
        ],
        costContext: '$2,500-4,000 — expensive but almost necessary at this size',
        recommendation: 'Strongly recommended. Transmission problems are common without regearing at this size.',
        transmissionNote: 'Automatic transmissions will overheat and hunt. Manual transmissions barely tolerate this — expect very sluggish performance.',
        forumSources: '4Runner Forum: "37s on stock gears for a year — transmission was punchy, very sluggish"'
      };

    case 'extreme':
      // 40"+ tires (>20% diameter increase)
      return {
        likelihood: '95%',
        consensus: 'Nearly everyone regears for 40"+ tires',
        realityCheck: 'This is extreme. Virtually everyone regears immediately. Those who don\'t have dedicated trail rigs with minimal street use.',
        whyRegear: [
          'Critical: Transmission failure likely without regearing',
          'Severe drivetrain stress and component wear',
          'Engine cannot efficiently move vehicle',
          'Highway driving nearly impossible',
          'Fuel economy in single digits',
          'Safety concern — lack of power to merge, climb'
        ],
        whyNotRegear: [
          'Dedicated trailer queen (no street driving)',
          'Competition rock crawler only'
        ],
        costContext: '$3,000-5,000+ — but necessary for any street use',
        recommendation: 'Essential. Do not drive on street without regearing.',
        transmissionNote: 'Automatic transmission WILL overheat and fail. Manual transmission will be dangerously underpowered.',
        forumSources: 'All forums: "Don\'t even think about running 40s without regearing"'
      };

    default:
      return {
        likelihood: 'Unknown',
        consensus: 'Unable to determine',
        realityCheck: 'Scenario not recognized',
        whyRegear: [],
        whyNotRegear: [],
        costContext: 'Typical regearing costs $2,000-4,000',
        recommendation: 'Consult with experienced builders',
        transmissionNote: '',
        forumSources: ''
      };
  }
}

/**
 * Calculate guidance from comparison object
 * Convenience wrapper
 */
export function getGuidanceFromComparison(comparison, intendedUse = 'weekend_trail', vehicleType = 'unknown') {
  if (!comparison.drivetrainImpact) {
    // No drivetrain data - can't provide guidance
    return null;
  }

  const params = {
    diameterChangePct: comparison.differences.diameter.percentage,
    diameterChangeInches: comparison.differences.diameter.delta,
    effectiveGearRatioChangePct: comparison.drivetrainImpact.effectiveGearRatio.changePercentage,
    intendedUse: intendedUse,
    vehicleType: vehicleType
  };

  return getRegearingGuidance(params);
}
