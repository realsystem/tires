# Vehicle Database

This document explains the vehicle database structure and how to maintain it.

## Files

- **vehicle-database.csv**: Main data source (CSV format for easy editing)
- **vehicle-ratios-update.js**: JavaScript version (for backwards compatibility)

## CSV Structure

The vehicle database is stored in `vehicle-database.csv` with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| category | Vehicle category/brand | tacoma, jeep, bronco |
| label | Full vehicle description | 2016-2023 Tacoma TRD Off-Road |
| tire | Factory tire size | 265/70R16 |
| gear | Axle gear ratio | 3.909 |
| tcase | Transfer case low ratio | 2.566 |
| first | First gear ratio | 3.538 |

## How to Update

### Adding a New Vehicle

1. Open `vehicle-database.csv` in a spreadsheet app (Excel, Google Sheets) or text editor
2. Add a new row with all required columns
3. Save the file
4. Optionally update `vehicle-ratios-update.js` for backwards compatibility

**Example**:
```csv
tacoma,2025 Tacoma Trailhunter,265/70R18,4.30,2.566,3.538
```

### Editing Existing Vehicle

1. Find the vehicle row in `vehicle-database.csv`
2. Update the relevant column(s)
3. Save the file

### Verifying Accuracy

After making changes, verify with manufacturer specifications:

**Toyota Sources**:
- Owner's manual specifications
- Window sticker
- Door jamb sticker
- Toyota parts catalog

**Jeep Sources**:
- Owner's manual
- Jeep specifications database
- Window sticker

**Formula to verify crawl ratio**:
```
Crawl Ratio = Axle Gear × Transfer Case Low × First Gear
```

**Example calculations**:
- Tacoma TRD Off-Road: 3.909 × 2.566 × 3.538 = 35.5:1
- Jeep Rubicon: 4.10 × 4.0 × 4.71 = 77.2:1
- Bronco Sasquatch: 4.70 × 3.06 × 4.696 = 67.6:1

## Integration with Calculator

To use this CSV in the calculator:

### Option 1: Convert to JSON at Build Time

Add a build step to convert CSV to JSON:

```bash
# Using a tool like csv2json
npm install -g csv2json
csv2json vehicle-database.csv > src/data/vehicles.json
```

### Option 2: Load CSV at Runtime

Use a CSV parser library:

```javascript
import Papa from 'papaparse';

Papa.parse(csvFile, {
  header: true,
  complete: (results) => {
    const vehicles = results.data;
    // Process and use data
  }
});
```

### Option 3: Manual Sync

1. Edit `vehicle-database.csv`
2. Manually update `vehicle-ratios-update.js`
3. Integrate into `CalculatorForm.jsx`

## Common Vehicle Categories

| Category | Examples |
|----------|----------|
| tacoma | Toyota Tacoma (all trims) |
| fourrunner | Toyota 4Runner |
| jeep | Jeep Wrangler JK/JL |
| gladiator | Jeep Gladiator |
| landcruiser | Toyota Land Cruiser |
| raptor | Ford F-150 Raptor |
| ram | RAM trucks |
| suzuki | Suzuki off-road vehicles |
| landrover | Land Rover Defender, Discovery, Range Rover |
| bronco | Ford Bronco |

## Adding New Categories

When adding a new vehicle brand/category:

1. Choose a short, lowercase category name (e.g., `tundra`, `ranger`, `colorado`)
2. Add all trims/models for that category
3. Group by model year ranges
4. Include all relevant drivetrain configurations

## Data Quality Guidelines

1. **Accuracy**: Always verify with OEM sources
2. **Consistency**: Use same format for model years (e.g., "2016-2023")
3. **Completeness**: Include all common trims
4. **Clarity**: Use descriptive labels that identify the exact configuration
5. **Precision**: Use exact gear ratios (3.909 not 3.91, 4.696 not 4.7)

## Field-Specific Notes

### tire
- Use standard tire size notation
- P-metric: 265/70R17
- LT-metric: LT285/75R16
- Flotation: 35x12.50R17

### gear
- Axle gear ratio (differential)
- Typically 3.45 to 5.13 for off-road vehicles
- More precise values like 3.909 are preferred over rounded

### tcase
- Transfer case low range ratio
- 2WD vehicles: use 1.0 or omit
- Common values: 2.48, 2.566, 2.72, 3.06, 4.0
- Rubicon: 4.0 (Rock-Trac)
- Sasquatch: 3.06

### first
- First gear ratio from transmission
- Used for crawl ratio calculation
- Manual transmissions: typically 3.5-4.7
- Automatic transmissions: typically 3.3-4.7

## Example CSV Entries

**Well-formatted entries**:
```csv
tacoma,2016-2023 Tacoma TRD Off-Road,265/70R16,3.909,2.566,3.538
jeep,JL Wrangler Rubicon (2018+),285/70R17,4.10,4.0,4.71
bronco,Bronco Wildtrak/Sasquatch (2021+),315/70R17,4.70,3.06,4.696
```

**Poor formatting (avoid)**:
```csv
tacoma,Tacoma,265/70R16,3.9,2.57,3.5        # Too vague, rounded numbers
jeep,Rubicon,285/70,4.1,4,4.7               # Missing wheel diameter, rounded
bronco,2021 Bronco,315/70R17,4.7,3,4.7      # Missing trim, rounded ratios
```

## Troubleshooting

**Issue**: Crawl ratio doesn't match manufacturer specs

**Solution**: Verify all three values:
- Axle gear ratio (check door jamb or window sticker)
- Transfer case low (consult owner's manual)
- First gear ratio (transmission specs)

**Issue**: Multiple configurations for same model

**Solution**: Create separate entries for each configuration:
```csv
tacoma,2016-2023 Tacoma TRD Off-Road (Manual),265/70R16,3.73,2.566,4.03
tacoma,2016-2023 Tacoma TRD Off-Road (Auto),265/70R16,3.909,2.566,3.538
```

## Maintenance Schedule

- Review annually for new model years
- Update when new trims are released
- Verify after major manufacturer updates
- Cross-check with community feedback

## Contributing

When submitting updates:

1. Verify with official sources
2. Test in calculator
3. Provide source references
4. Check crawl ratio calculation
5. Ensure CSV formatting is valid

## Sources

- Toyota: Owner's manuals, window stickers, parts catalogs
- Jeep: Owner's manuals, Jeep specifications database
- Ford: Owner's manuals, build sheets
- RAM: Owner's manuals, build sheets
- Land Rover: Technical specifications
- Community: TacomaWorld, JeepForum, Bronco6G forums
