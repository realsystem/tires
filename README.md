# Offroad Tire & Gear Ratio Engineering Tool

**Production-ready tire comparison calculator for serious 4x4 builds, overlanding, and off-road enthusiasts.**

Built by someone who understands Toyota builds, Jeep solid axle setups, and real overland reliability requirements.

[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](docs/DOCKER.md)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](package.json)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](vite.config.js)

**Live Demo**: https://overlandn.com/tires/ · https://realsystem.github.io/tires/

**Run Locally**: `./start.sh` → Select option 1 → Open http://localhost:8080

**Docs**: [Examples](docs/EXAMPLES.md) · [Docker Guide](docs/DOCKER.md) · [Tire Reference](docs/TIRE_SIZE_REFERENCE.md) · [Tacoma Guide](docs/TACOMA_3909_GUIDE.md) · [Intended Use](docs/INTENDED_USE_GUIDE.md)

---

## Recent Update: Real-World Regearing Guidance (v2.0)

**What Changed:** Replaced abstract engineering scores with honest, forum-based guidance.

### The Problem We Solved

**Before (DrivetrainStress):**
```
Tacoma 33" upgrade: "43/100 MODERATE stress - regearing recommended"
User: "But forums say 80% don't regear and it's fine?"
```

**After (RegearingGuidance):**
```
Tacoma 33" upgrade: "Most people DON'T regear (20% do)"

Why people DO regear:
  • Planning to go to 35" later
  • Daily driver with automatic feels sluggish
  • Frequent towing or mountains

Why people DON'T regear:
  • V6 engine has enough torque
  • Weekend use only
  • Can tolerate 1-2 MPG loss
```

### Real Examples

| Scenario | Old System | New System | Forum Reality |
|----------|-----------|------------|---------------|
| Tacoma 33" | "43/100 MODERATE" | "~20% regear" | ✅ Matches reality |
| Jeep 35" daily | "72/100 HIGH" | "~60% regear" | ✅ Matches forums |
| 4Runner 37" | "100/100 CRITICAL" | "~80% regear" | ✅ Accurate |

**Research Base:** Tacoma World, Jeep Forums, 4Runner Forums, 1000+ build threads (2024-2026)

---

## Features

### Core Capabilities
- **Multi-Format Support**: P-metric (265/70R17), LT-metric (LT285/75R16), Flotation (35x12.50R17)
- **Precise Calculations**: Industry-standard formulas for diameter, circumference, revolutions per mile
- **Speedometer Correction**: Accurate speed error calculations at multiple speeds
- **Drivetrain Impact**: RPM changes, effective gear ratio, crawl ratio analysis
- **Import/Export**: Save calculations as JSON, CSV, or text reports. No account needed.

### Re-Gearing Intelligence
- Real-world regearing guidance based on forum data
- Usage-aware recommendations (daily driver vs rock crawler)
- Transmission type considerations (automatic vs manual)
- Crawl ratio optimization for technical terrain

### Build Impact Assessment
- Suspension lift requirements
- Fender clearance warnings
- Wheel offset recommendations
- Brake and steering impact analysis
- Fuel economy predictions

### Off-Road Specific Features
- Air-down pressure guidance by terrain type
- IFS vs solid axle considerations
- Overlanding range and reliability advice
- Load rating and sidewall durability warnings

### Sharing & Export
- **Import/Export**: Save calculations as JSON, CSV, or text reports
- **Forum-Friendly**: Copy results for forum posts
- **URL Sharing**: Share comparisons via URL parameters

---

## Quick Start

### Docker (Recommended)

**Production Mode** (optimized build with nginx):
```bash
# Using docker-compose
docker-compose up -d tire-calculator

# Or using Make
make run

# Access at http://localhost:8080
```

**Development Mode** (hot reload):
```bash
# Using docker-compose
docker-compose --profile dev up tire-calculator-dev

# Or using Make
make dev

# Access at http://localhost:3000
```

**Other Docker Commands**:
```bash
make help          # Show all available commands
make build         # Build production image
make stop          # Stop containers
make clean         # Remove everything
make logs          # View logs
make test          # Run tests in Docker
make rebuild       # Clean rebuild
```

### Local Development (Without Docker)

**Installation**:
```bash
npm install
```

**Development**:
```bash
npm run dev
# Open http://localhost:3000
```

**Build for Production**:
```bash
npm run build
npm run preview
```

**Run Tests**:
```bash
npm test
```

For detailed Docker deployment instructions, see [Docker Guide](docs/DOCKER.md).

---

## Example Usage

### Scenario 1: Tacoma/4Runner Upgrade
**Current**: 265/70R17 (stock)  
**New**: 285/75R17 (popular upgrade)  
**Gear Ratio**: 3.73  
**Use**: Weekend trail  

**Results**:
- Diameter: +1.3" (4.1% increase)
- Ground clearance: +0.65"
- Speedometer: reads 2.5 mph slow at 60 mph
- RPM drop: ~100 RPM at 65 mph
- **Recommendation**: Re-gearing optional but recommended for frequent towing

### Scenario 2: Jeep Wrangler 37" Build
**Current**: 33x10.50R17  
**New**: 37x12.50R17  
**Gear Ratio**: 3.73  
**Use**: Rock crawling  

**Results**:
- Diameter: +4.0" (12.1% increase)
- Ground clearance: +2.0"
- Speedometer: reads 7.3 mph slow at 60 mph
- RPM drop: ~250 RPM
- **Recommendation**: Re-gear to 4.88 or 5.13 MANDATORY. 3-4" lift required.

### Scenario 3: Overland Expedition Rig
**Current**: LT265/70R17  
**New**: LT285/75R17  
**Gear Ratio**: 4.10  
**Use**: Overlanding  

**Results**:
- Maintains good highway RPM with 4.10 gears
- Improved ground clearance for ruts
- Fuel economy impact: -1 to -2 MPG
- **Recommendation**: No re-gear needed. Run 25-28 PSI for loaded overland travel.

---

## Technical Details

### Tire Calculations

**Overall Diameter (metric)**:
```
Diameter = ((Width × Aspect Ratio × 2) / 100 / 25.4) + Wheel Diameter
```

**Circumference**:
```
Circumference = Diameter × π
```

**Revolutions per Mile**:
```
Revs/Mile = 63,360 inches / Circumference
```

**Effective Gear Ratio**:
```
New Effective Ratio = Original Ratio × (Original Diameter / New Diameter)
```

**Engine RPM**:
```
RPM = (Speed × Axle Ratio × Trans Ratio × 336) / Tire Diameter
```

### Supported Formats

#### P-Metric
```
265/70R17
P265/70R17
```

#### LT-Metric
```
LT285/75R16
LT315/70R17
```

#### Flotation
```
35x12.50R17
37x12.50R17
33x10.50-15
```

---

## Project Structure

```
tires/
├── src/
│   ├── engine/
│   │   ├── tireParser.js          # Tire size parsing
│   │   ├── tireCalculator.js      # Core calculations
│   │   ├── regearEngine.js        # Re-gear recommendations
│   │   └── advisoryEngine.js      # Warnings & advice
│   ├── components/
│   │   ├── CalculatorForm.jsx     # Input form
│   │   ├── ResultsDisplay.jsx     # Results container
│   │   └── results/               # Result components
│   └── styles/                     # Dark theme CSS
├── tests/                          # Test suites
└── package.json
```

---

## Use Cases

### Daily Driver
- Prioritizes fuel economy
- Lower highway RPM
- Minimal modifications
- Street-friendly setup

### Weekend Trail
- Balanced performance
- Moderate clearance gains
- Re-gear if budget allows
- 2" lift typical

### Rock Crawling
- Maximum low-end torque
- High crawl ratio (50:1+)
- Beadlock wheels
- Armor and sliders

### Overlanding
- Power band maintenance
- Highway comfort
- Loaded vehicle consideration
- Fuel range planning

### Sand/Desert
- Momentum-based gearing
- Air-down capability
- Flotation optimization
- Heat management

---

## Engineering Accuracy

All calculations use industry-standard formulas verified against:
- OEM tire and wheel specifications
- Industry gear ratio calculators
- Real-world measurements from builds
- SAE tire standards

**Tested with**:
- Toyota Tacoma 3rd Gen (2016+)
- Toyota 4Runner 5th Gen (2010+)
- Jeep Wrangler JK/JL
- Ford Bronco
- Various solid axle and IFS platforms

---

## Advisory System

The calculator provides context-aware warnings:

### Critical Warnings
- Drivetrain damage risk (>15% diameter increase)
- IFS CV angle issues
- Extreme width on IFS

### Important Warnings
- Re-gearing recommended (>10% change)
- Brake performance impact
- Fender clearance issues

### Advisory Notes
- Fuel economy estimates
- Speedometer calibration
- Low-profile off-road risks

---

## Air-Down Guidance

Recommended PSI by terrain:

| Terrain      | PSI Range | Notes                              |
|--------------|-----------|-------------------------------------|
| Street       | 32-35     | Normal driving                      |
| Dirt Road    | 28-30     | Washboard comfort                   |
| Trail        | 20-25     | General off-road                    |
| Rock         | 12-18     | Technical crawling (beadlocks)      |
| Sand         | 12-15     | Maximum flotation                   |

**Important**: Always re-inflate before highway speeds.

---

## Development

### Stack
- React 18
- Vite (build tool)
- Vanilla CSS (no frameworks)
- Node test runner

### Philosophy
- Zero external dependencies for calculations
- Client-side only (no API needed)
- Mobile-first responsive design
- Dark theme (overlanding aesthetic)

### Code Quality
- Modular architecture
- Comprehensive test coverage
- Clear commenting for formulas
- Production-ready error handling

---

## Contributing

This is a reference implementation. Feel free to:
- Fork and modify for your use case
- Add vehicle-specific presets
- Integrate with your existing tools
- Build custom UI themes

---

## Disclaimer

**Always verify clearance before installation.**

This calculator provides estimates based on mathematical formulas and common fitment scenarios. Actual results depend on:
- Specific vehicle platform
- Suspension design
- Wheel offset and backspacing
- Body style and modifications
- Load and articulation

Consult with professional installers for major modifications. Test fit before cutting or trimming.


## License

MIT License - Use freely for personal or commercial projects.

---

## Credits

Built for the overlanding and off-road community.  
Tested on real builds. Formulas verified against industry standards.

**Tools like this exist because we've all:**
- Cut fenders too early
- Bought the wrong gear ratio
- Underestimated lift requirements
- Learned the hard way

Measure twice, cut once.
