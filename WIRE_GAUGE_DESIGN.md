# Wire Gauge Calculator - Design Document

## Overview
A production-ready wire gauge calculator for RV/camper/off-road applications, following the same architecture and design patterns as the existing tire calculator.

## Target Use Cases
1. **Auxiliary Lighting** - 10-20A, long runs (15-30 ft)
2. **Inverters/Fridges** - 40-100A, shorter runs (5-15 ft)
3. **Solar Panel Wiring** - 5-40A, variable lengths

## Architecture

### File Structure
```
src/
├── wire/
│   ├── WireGaugeApp.jsx              # Main wire calculator app component
│   ├── components/
│   │   ├── WireCalculatorForm.jsx    # Input form with presets
│   │   └── WireResultsDisplay.jsx    # Results display
│   ├── engine/
│   │   ├── wireCalculator.js         # Core calculation engine
│   │   └── wireData.js               # AWG tables and constants
│   └── styles/
│       ├── WireGaugeApp.css
│       ├── WireCalculatorForm.css
│       └── WireResultsDisplay.css
├── wire-main.jsx                      # Wire calculator entry point
public/
└── wire-gauge.html                    # Standalone wire calculator page
```

## Input Fields

### Required Inputs
1. **System Voltage**
   - Options: 12V, 24V
   - Default: 12V
   - Radio buttons

2. **Load Specification** (Two input methods)
   - **Option A**: Current Draw (Amps) - Direct input
   - **Option B**: Device Power (Watts) - Auto-converts to amps
   - Toggle between input methods

3. **Wire Run Length**
   - Input: Number (feet or meters)
   - Toggle: One-way or Round-trip
   - Help text: "One-way for positive wire only, round-trip for both positive and negative"
   - Unit selector: Feet or Meters

4. **Acceptable Voltage Drop**
   - Slider: 1% - 5%
   - Default: 3% (industry standard)
   - Presets: 2% (critical), 3% (standard), 5% (non-critical)

### Advanced Inputs (Collapsible)
5. **Wire Type**
   - Options: Copper (default), Aluminum (CCA - not recommended)
   - Default: Copper

6. **Temperature Rating**
   - Options: 60°C (140°F), 75°C (167°F), 90°C (194°F)
   - Default: 75°C
   - Affects ampacity derating

7. **Installation Method**
   - Options: Free air, Conduit/bundled
   - Default: Free air
   - Affects ampacity derating

8. **Ambient Temperature**
   - Slider: 30°F - 150°F (engine bay scenarios)
   - Default: 77°F (25°C)
   - Derating factor applied above 86°F

### Use Case Presets
Quick-fill buttons for common scenarios:
- **LED Light Bar** (12V, 15A, 25ft one-way, 3% drop)
- **Auxiliary Lights** (12V, 10A, 20ft one-way, 3% drop)
- **12V Fridge** (12V, 5A continuous, 10ft one-way, 2% drop)
- **2000W Inverter** (12V, 170A, 6ft one-way, 2% drop)
- **Solar Panel 200W** (12V, 12A, 30ft one-way, 2% drop)
- **Winch 9500lb** (12V, 400A peak/200A continuous, 8ft one-way, 3% drop)

## Calculation Engine (wireCalculator.js)

### AWG Wire Data Table
```javascript
// Resistance in ohms per 1000 feet at 75°C for copper
const AWG_COPPER_DATA = {
  '4/0': { resistance: 0.0500, ampacity60C: 195, ampacity75C: 230, ampacity90C: 260, diameter: 0.460 },
  '3/0': { resistance: 0.0630, ampacity60C: 165, ampacity75C: 200, ampacity90C: 225, diameter: 0.410 },
  '2/0': { resistance: 0.0795, ampacity60C: 145, ampacity75C: 175, ampacity90C: 195, diameter: 0.365 },
  '1/0': { resistance: 0.100,  ampacity60C: 125, ampacity75C: 150, ampacity90C: 170, diameter: 0.325 },
  '1':   { resistance: 0.126,  ampacity60C: 110, ampacity75C: 130, ampacity90C: 145, diameter: 0.289 },
  '2':   { resistance: 0.159,  ampacity60C: 95,  ampacity75C: 115, ampacity90C: 130, diameter: 0.258 },
  '4':   { resistance: 0.253,  ampacity60C: 70,  ampacity75C: 85,  ampacity90C: 95,  diameter: 0.204 },
  '6':   { resistance: 0.403,  ampacity60C: 55,  ampacity75C: 65,  ampacity90C: 75,  diameter: 0.162 },
  '8':   { resistance: 0.641,  ampacity60C: 40,  ampacity75C: 50,  ampacity90C: 55,  diameter: 0.128 },
  '10':  { resistance: 1.02,   ampacity60C: 30,  ampacity75C: 35,  ampacity90C: 40,  diameter: 0.102 },
  '12':  { resistance: 1.62,   ampacity60C: 25,  ampacity75C: 25,  ampacity90C: 30,  diameter: 0.081 },
  '14':  { resistance: 2.58,   ampacity60C: 20,  ampacity75C: 20,  ampacity90C: 25,  diameter: 0.064 },
  '16':  { resistance: 4.09,   ampacity60C: 18,  ampacity75C: 18,  ampacity90C: 18,  diameter: 0.051 },
  '18':  { resistance: 6.51,   ampacity60C: 16,  ampacity75C: 16,  ampacity90C: 16,  diameter: 0.040 }
};
```

### Core Calculation Functions

#### 1. Voltage Drop Calculation
```javascript
function calculateVoltageDrop(current, wireLength, wireGauge, wireType = 'copper') {
  const resistance = AWG_COPPER_DATA[wireGauge].resistance; // ohms per 1000 ft
  const totalResistance = (wireLength / 1000) * resistance;
  const voltageDrop = current * totalResistance;
  return voltageDrop;
}
```

#### 2. Wire Size Recommendation
```javascript
function recommendWireGauge(systemVoltage, current, wireLength, maxDropPercent, options = {}) {
  const maxDropVoltage = systemVoltage * (maxDropPercent / 100);

  // Start from smallest gauge and find first that meets requirements
  const awgSizes = Object.keys(AWG_COPPER_DATA).reverse();

  for (const gauge of awgSizes) {
    const voltageDrop = calculateVoltageDrop(current, wireLength, gauge);
    const ampacity = getAmpacity(gauge, options);

    // Must meet BOTH voltage drop and ampacity requirements
    if (voltageDrop <= maxDropVoltage && current <= ampacity * 0.8) { // 80% derating
      return {
        recommended: gauge,
        voltageDrop,
        voltageDropPercent: (voltageDrop / systemVoltage) * 100,
        ampacity,
        safe: true
      };
    }
  }

  return {
    recommended: '4/0',
    warning: 'Load exceeds safe wiring capacity - consult professional',
    safe: false
  };
}
```

#### 3. Ampacity Derating
```javascript
function getAmpacity(gauge, options = {}) {
  const {
    tempRating = 75,
    ambientTemp = 77,
    installMethod = 'free-air'
  } = options;

  let baseAmpacity = AWG_COPPER_DATA[gauge][`ampacity${tempRating}C`];

  // Temperature derating (above 86°F)
  if (ambientTemp > 86) {
    const deratingFactor = getTempDeratingFactor(ambientTemp, tempRating);
    baseAmpacity *= deratingFactor;
  }

  // Conduit/bundled derating
  if (installMethod === 'conduit') {
    baseAmpacity *= 0.8; // 80% derating for bundled wires
  }

  return Math.floor(baseAmpacity);
}
```

#### 4. Fuse/Breaker Sizing
```javascript
function recommendFuseSize(current, wireGauge, options = {}) {
  const ampacity = getAmpacity(wireGauge, options);

  // Fuse should protect wire, not load
  // Use 125% of continuous load, but never exceed wire ampacity
  const minFuse = Math.ceil(current * 1.25);
  const maxFuse = Math.floor(ampacity);

  // Find closest standard fuse size
  const standardSizes = [5, 7.5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 100,
                         125, 150, 175, 200, 225, 250, 300, 350, 400];

  // Find smallest standard size >= minFuse and <= maxFuse
  const recommended = standardSizes.find(size => size >= minFuse && size <= maxFuse);

  return {
    recommended,
    min: minFuse,
    max: maxFuse,
    warning: !recommended ? 'No standard fuse size fits - consult professional' : null
  };
}
```

## Output Display

### Results Sections

#### 1. Wire Gauge Recommendation (Primary Card)
```
┌─────────────────────────────────────────────────┐
│ 🔌 Recommended Wire Gauge                       │
│                                                 │
│         [LARGE] 10 AWG                          │
│                                                 │
│ ✓ Meets voltage drop requirement (2.8%)        │
│ ✓ Ampacity: 35A (Load: 15A - 43% capacity)     │
│                                                 │
│ Wire Specifications:                            │
│ • Diameter: 0.102 inches (2.59mm)              │
│ • Resistance: 1.02 Ω/1000ft                    │
│ • Temperature Rating: 75°C (167°F)             │
└─────────────────────────────────────────────────┘
```

#### 2. Voltage Drop Analysis
```
┌─────────────────────────────────────────────────┐
│ ⚡ Voltage Drop Analysis                        │
│                                                 │
│ Actual Drop: 0.34V (2.8% of 12V)               │
│ Allowable:   0.36V (3.0% limit)                │
│                                                 │
│ At Load:                                        │
│ • Wire Input:  12.00V                           │
│ • Device Gets: 11.66V                           │
│ • Power Loss:  5.1W in wire resistance          │
│                                                 │
│ [Progress Bar: 2.8% / 3.0%]                     │
└─────────────────────────────────────────────────┘
```

#### 3. Fuse/Breaker Recommendation
```
┌─────────────────────────────────────────────────┐
│ 🛡️ Circuit Protection                           │
│                                                 │
│ Recommended Fuse: 20A                           │
│                                                 │
│ Sizing:                                         │
│ • Load Current:     15A                         │
│ • 125% of Load:     19A (continuous load rule)  │
│ • Wire Ampacity:    35A (max protection)        │
│                                                 │
│ ⚠️ Use inline fuse within 18" of battery       │
└─────────────────────────────────────────────────┘
```

#### 4. Alternative Wire Options (Comparison Table)
```
┌─────────────────────────────────────────────────┐
│ 📊 Wire Size Comparison                         │
│                                                 │
│ Gauge | Voltage Drop | Ampacity | Cost Factor  │
│ ──────┼──────────────┼──────────┼──────────────│
│   8   │   1.8% ✓     │   50A ✓  │   2.1x       │
│  10   │   2.8% ✓     │   35A ✓  │   1.0x ⭐    │
│  12   │   4.5% ✗     │   25A ✓  │   0.6x       │
│  14   │   7.1% ✗     │   20A ✓  │   0.4x       │
│                                                 │
│ ⭐ = Recommended (best value)                    │
│ ✓ = Acceptable  ✗ = Exceeds limits              │
└─────────────────────────────────────────────────┘
```

#### 5. Installation Guidance (Advisory Card)
```
┌─────────────────────────────────────────────────┐
│ 🔧 Installation Best Practices                  │
│                                                 │
│ For this installation (15A, 25ft):              │
│                                                 │
│ ✓ Use marine-grade tinned copper wire          │
│ ✓ Install 20A fuse within 18" of battery       │
│ ✓ Use insulated ring terminals with adhesive   │
│ ✓ Protect wire through firewall/sharp edges    │
│ ✓ Secure wire every 18" to prevent vibration   │
│                                                 │
│ ⚠️ High-current applications (>50A):            │
│   Consider battery relocation or dual batteries │
└─────────────────────────────────────────────────┘
```

### Warning/Advisory System

#### Voltage Drop Warnings
- **< 2%**: ✓ Excellent - minimal power loss
- **2-3%**: ✓ Good - acceptable for most applications
- **3-5%**: ⚠️ Marginal - acceptable for non-critical loads
- **> 5%**: ❌ Excessive - will cause performance issues

#### Ampacity Warnings
- **< 50% capacity**: ✓ Conservative - excellent safety margin
- **50-80% capacity**: ✓ Normal - industry standard
- **80-100% capacity**: ⚠️ High utilization - minimal safety margin
- **> 100% capacity**: ❌ Dangerous - fire hazard

#### Special Cases
- **Very high current (>100A)**: Suggest battery relocation, dual batteries, or auxiliary battery
- **Very long runs (>50ft)**: Suggest voltage boost or higher system voltage (24V)
- **Engine bay routing**: Warning about high ambient temperature derating
- **Aluminum wire**: Strong warning against CCA (Copper Clad Aluminum) for automotive use

## UI/UX Patterns

### Form Layout (Match Tire Calculator)
- Single column form on mobile, two-column on desktop
- Grouped sections: Basic, Advanced (collapsible)
- Use case preset buttons at top
- Clear "Calculate" button at bottom

### Results Layout
- Stacked cards on mobile, grid on desktop
- Primary result (wire gauge) prominent and large
- Color coding: Green (safe), Yellow (marginal), Red (unsafe)
- Expandable "Why this size?" explanations

### Interactive Elements
- Slider for voltage drop % with live percentage display
- Toggle switches for one-way/round-trip, feet/meters
- Radio buttons for voltage system (12V/24V)
- Tabs or toggle for Amps vs Watts input

### Visual Design
- Match existing dark theme from tire calculator
- Use same color palette (--color-accent, --color-success, etc.)
- Same card styling (--color-bg-card, --radius-lg)
- Consistent typography (Inter font, JetBrains Mono for numbers)

## Validation & Error Handling

### Input Validation
- Current: 0.1 - 500A (warn >100A)
- Voltage: 12V or 24V only
- Length: 1 - 200ft (warn >50ft)
- Voltage drop: 1% - 5%

### Edge Cases
1. **Load exceeds largest wire**: Show error, suggest splitting circuits
2. **Very short runs (<3ft)**: Recommend next size up for mechanical durability
3. **Solar charging**: Special note about allowing 25% extra capacity for charging efficiency
4. **Intermittent loads (winch)**: Calculate for continuous rating, note peak/surge

## Testing Scenarios

### Test Cases
1. **LED Light Bar**: 12V, 15A, 25ft → Should recommend 10 AWG
2. **2000W Inverter**: 12V, 167A, 6ft → Should recommend 2/0 AWG
3. **Solar Panel**: 12V, 10A, 40ft → Should recommend 10 AWG (2% drop)
4. **12V Fridge**: 12V, 5A, 15ft → Should recommend 14 AWG
5. **Winch**: 12V, 200A continuous, 8ft → Should recommend 2 AWG

### Validation Tests
- Verify against NEC (National Electrical Code) tables
- Cross-reference with marine wiring standards (ABYC)
- Compare with online calculators (Blue Sea Systems, etc.)

## Future Enhancements (Not v1)
- Multi-conductor cable support (14/3, 12/2, etc.)
- Wire weight/cost calculator
- PDF report generation
- Metric wire sizes (mm²)
- Three-phase calculations (for larger RV systems)
- Integration with battery capacity planning

## References
- NEC Table 310.15(B)(16) - Ampacity ratings
- ABYC E-11 - AC & DC Electrical Systems on Boats
- Blue Sea Systems Circuit Wizard
- Voltage Drop Formula: Vdrop = 2 × I × R × L / 1000
  - Factor of 2 accounts for round-trip (positive + negative)
  - I = current in amps
  - R = resistance in ohms per 1000 ft
  - L = one-way length in feet
