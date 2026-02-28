# Vehicle Configurations

This document explains the vehicle-specific configuration system that automatically sets suspension type and available gear ratios based on the selected vehicle.

## Overview

When a user selects a vehicle from the dropdown, the calculator automatically configures:
- **Suspension Type**: IFS, Solid Axle, or Independent (All)
- **Available Gear Ratios**: Factory options specific to that vehicle category
- **Current Tire Size**: Factory tire size for the selected model
- **Axle Gear Ratio**: Factory gear ratio for the selected configuration

## Configuration File

**Location**: `src/data/vehicle-configurations.csv`

### CSV Structure

| Column | Description | Example |
|--------|-------------|---------|
| category | Vehicle category key | tacoma, jeep, bronco |
| suspensionType | Suspension configuration | ifs, solid_axle, independent_all |
| trimLevels | Comma-separated trim levels | "Sport,Sahara,Rubicon" |
| availableGearRatios | Factory gear ratio options | "3.73,4.10,4.56" |
| notes | Technical notes | "IFS front with solid axle rear" |

### Suspension Types

| Type | Description | Vehicles |
|------|-------------|----------|
| `ifs` | Independent Front Suspension with solid rear axle | Toyota Tacoma, 4Runner, Ford Bronco, Ram 1500 |
| `solid_axle` | Solid axle front and rear | Jeep Wrangler, Gladiator, Suzuki vehicles |
| `independent_all` | Independent suspension all around with air | Land Rover Defender |

## Vehicle Research Sources

### Toyota Tacoma & 4Runner
- **Suspension**: IFS (Independent Front Suspension) with solid rear axle
- **Front**: Double-wishbone coil springs
- **Rear**: Solid axle with leaf springs (Tacoma) or coil springs (4Runner)
- **Source**: [RCV Ultimate IFS CV Axle Set](https://exitoffroad.com/product/rcv-ultimate-ifs-cv-axle-set-tacoma-4runner-fj-cruiser-gx470-gx460/)

### Jeep Wrangler (JK/JL) & Gladiator
- **Suspension**: Solid axle front and rear
- **Front**: Dana 30 (Sport/Sahara) or Dana 44 (Rubicon)
- **Rear**: Dana 44 (all models)
- **JL Improvements**: Stronger Dana 44 with 32-spline shafts (vs 30-spline in JK)
- **Sources**:
  - [Revolution Gear: Identifying Wranglers and Their Different Axles](https://revolutiongear.com/blog/identifying-wranglers-and-their-different-axles/)
  - [Extreme Terrain: How to Identify Wrangler Axles](https://www.extremeterrain.com/wrangler-jeep-axle-identification.html)

### Ford Bronco
- **Suspension**: IFS front with Dana 44 solid rear axle
- **Front**: Independent double-wishbone with long-travel coil-overs
- **Rear**: Dana 44 AdvanTEK solid axle with four-link and track bar
- **Why IFS**: Better on-road manners and comfort compared to solid front axle
- **Sources**:
  - [Motor1: 2021 Ford Bronco Why It Has Independent Front Suspension](https://www.motor1.com/news/440768/ford-bronco-why-has-independent-suspension/)
  - [DrivingLine: IFS Versus Solid Axle - Ford Bronco versus Jeep Wrangler](https://www.drivingline.com/articles/ifs-versus-solid-axle-ford-bronco-versus-the-jeep-wrangler/)

### Ford F-150 Raptor
- **Suspension**: IFS front with solid rear axle (five-link coil spring)
- **Front**: Independent with high-performance Fox shocks
- **Rear**: Solid axle (NOT independent) with five-link coil spring setup
- **Note**: Switched from leaf springs to coil springs in 2021 for better articulation
- **Travel**: 15 inches rear suspension travel (25% more than first-gen)
- **Sources**:
  - [Ford Authority: 2021 Ford F-150 Raptor Rear Suspension Is Not Independent](https://fordauthority.com/2021/02/2021-ford-f-150-raptor-rear-suspension-is-not-independent/)
  - [The Drive: Why the 2021 Ford Raptor Ditched Leaf Springs](https://www.thedrive.com/news/39062/why-the-2021-ford-raptor-ditched-leaf-springs-for-a-five-link-coil-suspension)

### Ram 1500 (Rebel/TRX)
- **Suspension**: Independent front with solid rear (coil springs)
- **Front**: All-new independent front suspension with active damping
- **Rear**: Five-link coil system with Dana 60 rear axle (TRX)
- **Note**: Only truck in class with coil-spring rear (not leaf springs)
- **Travel**: Up to 13 inches rear axle travel
- **Sources**:
  - [MoparInsiders: A Deeper Look At The 2021 Ram 1500 TRX Suspension](https://moparinsiders.com/a-deeper-look-at-the-2021-ram-1500-trx-suspension/)
  - [Carli Suspension: 2019-2025 Ram 1500 Rear Coil Springs](https://www.carlisuspension.com/2019-ram-1500-rebel/)

### Ram 2500/3500 (Power Wagon)
- **Suspension**: Solid front axle with solid rear
- **Front**: Live front axle (unlike Ram 1500)
- **Rear**: Five-link coil spring with Bilstein shocks plus kicker shock
- **Note**: Heavy-duty platform uses traditional solid front axle
- **Source**: [Tread Magazine: Ram Rebel HD 2500](https://www.treadmagazine.com/vehicles/trucks/2023-ram-rebel-hd-2500/)

### Land Rover Defender (2020+)
- **Suspension**: Fully independent (IFS front, IRS rear) with air suspension
- **Front**: Double-wishbone independent
- **Rear**: Integral link independent rear suspension
- **Air Suspension**: Standard on all trims, adjustable ground clearance 8.5-11.5"
- **Note**: Major departure from classic Defender's solid axles
- **Sources**:
  - [Autoblog: Land Rover Defender 110 Suspension Deep Dive](https://www.autoblog.com/features/land-rover-defender-110-suspension-deep-dive)
  - [Wikipedia: Land Rover Defender](https://en.wikipedia.org/wiki/Land_Rover_Defender)

### Toyota Land Cruiser
- **Suspension**: IFS front with solid rear axle
- **Front**: Independent front suspension
- **Rear**: Traditional solid rear axle (not independent)
- **Note**: "Old school but gold school" - provides excellent articulation
- **Source**: [Motor1: 2021 Toyota Land Cruiser vs Land Rover Defender Comparison](https://www.motor1.com/reviews/494690/toyota-land-cruiser-land-rover-defender-comparison/)

## How It Works

### Code Integration

**File**: `src/engine/vehicleConfigData.js`

Key functions:
```javascript
getSuspensionType(category)           // Returns suspension type for vehicle
getAvailableGearRatiosForVehicle(category) // Returns factory gear ratios
getAllSuspensionTypes()               // Returns all suspension type options
```

### User Experience

1. User selects vehicle from "Select Your Vehicle" dropdown
2. System automatically sets:
   - Current tire size
   - Factory gear ratio
   - **Suspension type** (based on category)
   - **Vehicle category** (for filtering gear ratios)
3. "Suspension Type" dropdown updates to show vehicle-appropriate type
4. "Axle Gear Ratio" dropdown shows factory options first, then all available ratios
5. Helpful hints update to show vehicle-specific information

### Example

**Before** (selecting Jeep Wrangler Rubicon):
- Suspension Type: "IFS (Independent Front Suspension)" ❌ WRONG
- Gear Ratios: Shows Tacoma/Jeep generic options

**After** (selecting Jeep Wrangler Rubicon):
- Suspension Type: "Solid Axle (Front & Rear)" ✅ CORRECT
- Gear Ratios: Shows "Factory Jeep Ratios: 3.21, 3.45, 3.73, 4.10, 4.56, 4.88, 5.13"
- Hint: "Auto-set for your jeep. Affects clearance and CV angle warnings."

## Maintenance

### Adding a New Vehicle Category

1. Research the vehicle's suspension configuration
2. Verify with manufacturer specifications or technical documentation
3. Add entry to `src/data/vehicle-configurations.csv`:
   ```csv
   category,suspensionType,trimLevels,availableGearRatios,notes
   newvehicle,ifs,"Base,Sport,Pro","3.55,3.73,4.10","IFS front with solid rear"
   ```
4. Add vehicles to `src/data/vehicle-database.csv`
5. Update `CalculatorForm.jsx` vehicle database object
6. Test by selecting the vehicle and verifying suspension type and gear ratios

### Updating Existing Configurations

1. Verify changes with official sources
2. Update appropriate CSV file
3. Test in UI to confirm proper display
4. Document sources in this file

## Common Issues

**Issue**: Suspension type not updating when vehicle selected

**Solution**: Check that `vehicleCategory` is being set in `handleVehicleSelect` and that the CSV has the correct category key

**Issue**: Gear ratios showing generic options instead of vehicle-specific

**Solution**: Verify `getAvailableGearRatiosForVehicle()` is returning values for that category

**Issue**: CSV not loading in browser

**Solution**: Check Vite import syntax: `import('../data/vehicle-configurations.csv?raw')`

## Testing

All functionality works in test environment with graceful fallback:
- Browser: Loads CSV data dynamically via Vite
- Node.js: Returns empty arrays (tests don't rely on CSV data)
- UI: Degrades gracefully to generic options if CSV fails to load

## Future Enhancements

- [ ] Add transfer case ratios to configuration
- [ ] Include transmission gear ratios
- [ ] Auto-populate advanced drivetrain fields
- [ ] Add year-specific configurations (e.g., 2024 vs 2016 Tacoma)
- [ ] Include trim-specific suspension notes (e.g., Rubicon vs Sport)
