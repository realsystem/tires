# Import/Export Guide

Save and reload your tire calculations without creating an account. All data is stored locally on your device.

## Export Results

After calculating a tire comparison, you can export your results in three formats:

### 1. JSON Format (Recommended for Re-Import)

**Use for**: Saving calculations to reload later

**How to export**:
1. Complete a tire calculation
2. Click "Export Results" button
3. Select "Export as JSON (for re-import)"
4. File downloads as: `tire-calc_265-70R17_to_285-75R17_2026-02-27.json`

**What's saved**:
- All calculation results
- Form input data (tire sizes, gear ratios, intended use)
- Complete drivetrain analysis
- Re-gearing recommendations
- Advisory information

**Re-importing**:
1. On calculator form, click "Import Saved Results"
2. Select your saved JSON file
3. Results instantly restored

### 2. CSV Format (Spreadsheet)

**Use for**: Opening in Excel, Google Sheets, or data analysis tools

**How to export**:
1. Complete a tire calculation
2. Click "Export Results" button
3. Select "Export as CSV (spreadsheet)"
4. File downloads as: `tire-calc_265-70R17_to_285-75R17_2026-02-27.csv`

**Contains**:
- Tire specifications comparison
- Diameter, width, sidewall measurements
- Speedometer error table
- Drivetrain impact (if gear ratios provided)
- RPM changes, crawl ratio

**Use cases**:
- Track multiple tire options in spreadsheet
- Create comparison charts
- Share with mechanic or shop
- Budget planning

### 3. Text Report

**Use for**: Printing, sharing via email/text, keeping offline reference

**How to export**:
1. Complete a tire calculation
2. Click "Export Results" button
3. Select "Export as Text Report"
4. File downloads as: `tire-calc_265-70R17_to_285-75R17_2026-02-27.txt`

**Format**:
```
═══════════════════════════════════════════════════
  OFF-ROAD TIRE CALCULATOR - RESULTS REPORT
═══════════════════════════════════════════════════

Export Date: 2/27/2026, 10:30:15 AM
Comparison: 265/70R17 → 285/75R17

───────────────────────────────────────────────────
TIRE SPECIFICATIONS
───────────────────────────────────────────────────

Current Tire: 265/70R17
  Diameter:     31.65"
  Width:        10.43"
  Sidewall:     7.28"
  Circumference: 99.43"

[...]
```

**Use cases**:
- Print for shop appointment
- Email to friend/forum
- Save in build notes
- Reference without internet

## File Naming Convention

All exported files follow this pattern:
```
tire-calc_[current-tire]_to_[new-tire]_[date].ext

Examples:
tire-calc_265-70R17_to_285-75R17_2026-02-27.json
tire-calc_33x10.50R17_to_37x12.50R17_2026-02-27.csv
tire-calc_LT285-75R16_to_LT315-75R16_2026-02-27.txt
```

This makes it easy to:
- Identify what comparison the file contains
- Sort by date
- Find specific calculations later

## Import Saved Results

### Step-by-Step

1. **Start calculator**: Open tire calculator (no need to fill form)
2. **Click Import**: "Import Saved Results" button
3. **Select file**: Choose your saved JSON file
4. **Instant restore**: All results appear immediately

### What Gets Restored

When importing a JSON file:
- Complete calculation results displayed
- All tabs available (Overview, Drivetrain, Advisory, Re-Gearing)
- Original form inputs preserved
- Ready to export in different format if needed

### Compatibility

- **Format**: Only JSON files can be imported (CSV and TXT are export-only)
- **Version**: Files created with v1.0 of calculator
- **Browser**: Works in all modern browsers
- **No account needed**: Everything stays on your device

## Use Cases

### Scenario 1: Shopping Multiple Tire Options

```
1. Calculate: 265/70R17 → 285/70R17
2. Export JSON as "option1_285-70.json"
3. Click "New Calculation"
4. Calculate: 265/70R17 → 285/75R17
5. Export JSON as "option2_285-75.json"
6. Calculate: 265/70R17 → 33x10.50R17
7. Export JSON as "option3_33inch.json"

Later:
- Import each file to compare
- Export all as CSV
- Analyze in spreadsheet
- Make informed decision
```

### Scenario 2: Planning Build Over Time

```
Week 1: Research tire options
- Calculate various sizes
- Export each as JSON
- Save in "Tacoma Build" folder

Week 3: Shop for tires
- Import saved calculations
- Export as text reports
- Print for tire shop visit

Week 5: Plan re-gearing
- Import calculations again
- Export CSV for budget spreadsheet
- Share with mechanic
```

### Scenario 3: Forum/Community Sharing

```
Calculate your specific setup:
- Current: 265/70R17, 3.909 gears
- New: 285/75R17
- Use: Weekend trail

Export text report:
- Post to TacomaWorld forum
- Include in build thread
- Help others with same setup
- Reference in replies

Or share JSON:
- Upload to Google Drive
- Share link in forum
- Others import for exact comparison
- Build knowledge base
```

### Scenario 4: Multiple Vehicles

```
Save calculations per vehicle:

tacoma/
├── stock_to_33s.json
├── 33s_to_35s.json
└── regear_485.json

jeep/
├── stock_to_37s.json
├── rubicon_gears.json
└── expedition_tires.json

wife_4runner/
├── mild_upgrade.json
└── conservative_option.json
```

## Browser Storage (Optional)

The calculator also auto-saves your last calculation to browser local storage. This means:

- Refresh page → last calculation still there
- Close browser → reopen → still there
- Local only → no server, no account

**Note**: Browser storage is cleared if you:
- Clear browser cache
- Use private/incognito mode
- Switch browsers

**Solution**: Export important calculations as JSON files for permanent storage.

## Privacy & Security

### What's Saved Locally
- Calculation results
- Form inputs (tire sizes, gear ratios)
- User preferences

### What's NOT Saved
- No personal information
- No account data
- No tracking
- No server uploads

### Data Location
- **JSON/CSV/TXT files**: Your Downloads folder
- **Browser storage**: Local storage in your browser only
- **No cloud**: Nothing sent to server

## File Sizes

Typical file sizes:

| Format | Size | Notes |
|--------|------|-------|
| JSON | 5-15 KB | Complete data, re-importable |
| CSV | 1-3 KB | Smaller, spreadsheet format |
| TXT | 2-5 KB | Human-readable, printable |

All very small - you can save hundreds of calculations without worrying about space.

## Tips & Best Practices

1. **Organize by vehicle**: Create folders for each vehicle
2. **Descriptive filenames**: Rename files if comparing many options
3. **Keep JSON master copies**: Always have JSON version for re-import
4. **Export before closing**: Browser storage can be cleared
5. **CSV for comparison**: Export multiple calculations as CSV, combine in spreadsheet
6. **Text for sharing**: Best format for forums and emails
7. **Date your builds**: Files auto-include date in filename

## Troubleshooting

### Import Failed

**Error**: "Invalid import file format"

**Solution**:
- Only JSON files can be imported
- CSV and TXT are export-only
- Make sure file hasn't been edited

**Error**: "Failed to parse import file"

**Solution**:
- File may be corrupted
- Re-export from original calculation
- Don't edit JSON files manually

### Export Not Working

**Issue**: Button doesn't download

**Solution**:
- Check browser download settings
- Allow downloads from site
- Check popup blocker
- Try different browser

### Old Calculations Won't Import

**Issue**: File from older calculator version

**Solution**:
- Check file version in JSON
- May need to recalculate
- Format changes in updates

## Advanced: JSON File Structure

For developers or advanced users, JSON files contain:

```json
{
  "version": "1.0",
  "exportDate": "2026-02-27T18:30:15.123Z",
  "formData": {
    "currentTireSize": "265/70R17",
    "newTireSize": "285/75R17",
    "axleGearRatio": "3.909",
    "intendedUse": "weekend_trail",
    ...
  },
  "results": {
    "comparison": { ... },
    "drivetrainImpact": { ... },
    "regearRecommendations": { ... },
    "advisory": { ... }
  },
  "metadata": {
    "appName": "Off-Road Tire Calculator",
    "appVersion": "1.0"
  }
}
```

This allows:
- Script automation
- Data analysis
- Custom tools integration
- Batch processing

## Future Features

Potential enhancements:

- Compare multiple calculations side-by-side
- Auto-organize by vehicle/date
- Cloud sync (optional, with account)
- Share via link
- Import from popular tire retailers

## Support

Questions or issues:
- Check main [README.md](README.md)
- Review [Examples](EXAMPLES.md)
- Open issue on GitHub

---

**No account required. Your data stays on your device. Export and import freely.**
