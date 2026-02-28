// Updated vehicle database with transfer case low and first gear ratios
//
// DATA SOURCE: src/data/vehicle-database.csv (easier to maintain than code)
// To integrate into CalculatorForm.jsx, use a CSV loader or convert to JSON at build time
//
// This JS file is kept for backwards compatibility and quick reference.
// For updates, edit src/data/vehicle-database.csv instead.

const vehicleDatabase = {
  tacoma: [
    { label: '2016-2023 Tacoma SR5', tire: '245/75R16', gear: '3.73', tcase: '2.566', first: '3.538' },
    { label: '2016-2023 Tacoma TRD Sport', tire: '265/65R17', gear: '3.73', tcase: '2.566', first: '3.538' },
    { label: '2016-2023 Tacoma TRD Off-Road', tire: '265/70R16', gear: '3.909', tcase: '2.566', first: '3.538' },
    { label: '2016-2023 Tacoma TRD Pro', tire: '265/70R16', gear: '4.10', tcase: '2.566', first: '3.538' },
    { label: '2024+ Tacoma TRD Pro', tire: '265/70R18', gear: '4.30', tcase: '2.566', first: '3.538' }
  ],
  fourrunner: [
    { label: '2010-2024 4Runner SR5', tire: '265/70R17', gear: '4.10', tcase: '2.566', first: '3.538' },
    { label: '2010-2024 4Runner TRD Off-Road', tire: '265/70R17', gear: '4.10', tcase: '2.566', first: '3.538' },
    { label: '2010-2024 4Runner TRD Pro', tire: '265/70R17', gear: '4.10', tcase: '2.566', first: '3.538' },
    { label: '2010-2024 4Runner Limited', tire: '245/60R20', gear: '4.10', tcase: '2.566', first: '3.538' }
  ],
  jeep: [
    { label: 'JK Wrangler Sport/Sahara (2007-2018)', tire: '255/75R17', gear: '3.73', tcase: '2.72', first: '4.71' },
    { label: 'JK Wrangler Rubicon (2007-2018)', tire: '255/75R17', gear: '4.10', tcase: '4.0', first: '4.71' },
    { label: 'JL Wrangler Sport (2018+)', tire: '245/75R17', gear: '3.45', tcase: '2.72', first: '4.71' },
    { label: 'JL Wrangler Sahara (2018+)', tire: '255/70R18', gear: '3.45', tcase: '2.72', first: '4.71' },
    { label: 'JL Wrangler Rubicon (2018+)', tire: '285/70R17', gear: '4.10', tcase: '4.0', first: '4.71' },
    { label: 'JL Wrangler Rubicon 392 (2021+)', tire: '285/70R17', gear: '4.10', tcase: '4.0', first: '4.71' },
    { label: 'JL Wrangler Xtreme Recon', tire: '35x12.50R17', gear: '4.56', tcase: '4.0', first: '4.71' }
  ],
  gladiator: [
    { label: 'Gladiator Sport/Overland', tire: '255/70R18', gear: '3.73', tcase: '2.72', first: '4.71' },
    { label: 'Gladiator Rubicon', tire: '285/70R17', gear: '4.10', tcase: '4.0', first: '4.71' },
    { label: 'Gladiator Mojave', tire: '285/70R17', gear: '4.10', tcase: '4.0', first: '4.71' }
  ],
  landcruiser: [
    { label: '100 Series Land Cruiser (1998-2007)', tire: '275/70R16', gear: '4.10', tcase: '2.48', first: '3.52' },
    { label: '200 Series Land Cruiser (2008-2021)', tire: '285/65R18', gear: '3.91', tcase: '2.566', first: '3.30' },
    { label: 'Land Cruiser 70 Series', tire: '265/70R16', gear: '4.11', tcase: '2.48', first: '3.93' },
    { label: '2024+ Land Cruiser 250', tire: '265/70R18', gear: '3.58', tcase: '2.48', first: '4.69' }
  ],
  raptor: [
    { label: 'F-150 Raptor (2017-2020)', tire: '315/70R17', gear: '4.10', tcase: '2.64', first: '4.696' },
    { label: 'F-150 Raptor (2021+)', tire: '315/70R17', gear: '4.10', tcase: '3.06', first: '4.696' },
    { label: 'F-150 Raptor R (2023+)', tire: '37x12.50R17', gear: '4.70', tcase: '3.06', first: '4.696' }
  ],
  ram: [
    { label: 'Ram 1500 Rebel (2019+)', tire: '285/70R17', gear: '3.92', tcase: '2.64', first: '4.71' },
    { label: 'Ram 1500 TRX (2021+)', tire: '35x11.50R18', gear: '3.55', tcase: '2.64', first: '4.71' },
    { label: 'Ram 2500 Power Wagon', tire: '285/70R17', gear: '4.10', tcase: '2.72', first: '3.00' }
  ],
  suzuki: [
    { label: 'Suzuki Samurai (1986-1995)', tire: '215/75R15', gear: '5.12', tcase: '2.03', first: '3.78' },
    { label: 'Suzuki Sidekick (1989-1998)', tire: '205/75R15', gear: '4.62', tcase: '2.03', first: '3.76' },
    { label: 'Suzuki Jimny (2018+)', tire: '195/80R15', gear: '5.08', tcase: '2.40', first: '3.48' }
  ],
  landrover: [
    { label: 'Defender 90/110 (2020+)', tire: '255/70R18', gear: '3.54', tcase: '2.93', first: '4.71' },
    { label: 'Defender 110 X-Dynamic (2020+)', tire: '265/65R19', gear: '3.54', tcase: '2.93', first: '4.71' },
    { label: 'Discovery (2017+)', tire: '255/60R19', gear: '3.73', tcase: '2.93', first: '4.71' },
    { label: 'Range Rover (2013+)', tire: '275/45R21', gear: '3.54', tcase: '2.93', first: '4.71' }
  ],
  bronco: [
    { label: 'Bronco Base (2021+)', tire: '255/70R16', gear: '3.73', tcase: '2.72', first: '4.696' },
    { label: 'Bronco Big Bend (2021+)', tire: '255/75R17', gear: '3.73', tcase: '2.72', first: '4.696' },
    { label: 'Bronco Badlands (2021+)', tire: '285/70R17', gear: '4.70', tcase: '2.72', first: '4.696' },
    { label: 'Bronco Wildtrak/Sasquatch (2021+)', tire: '315/70R17', gear: '4.70', tcase: '3.06', first: '4.696' },
    { label: 'Bronco Raptor (2022+)', tire: '37x12.50R17', gear: '4.70', tcase: '3.06', first: '4.696' }
  ]
};

// Crawl ratio calculations with correct values:
// Tacoma TRD Off-Road: 3.909 × 2.566 × 3.538 = 35.5:1
// Jeep Rubicon: 4.10 × 4.0 × 4.71 = 77.2:1
// Bronco Sasquatch: 4.70 × 3.06 × 4.696 = 67.6:1
