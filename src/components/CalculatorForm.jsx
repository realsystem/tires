import React, { useState } from 'react';
import { getAvailableGearRatios, getUseCaseProfiles } from '../engine/regearEngine';
import { getSuspensionType, getAvailableGearRatiosForVehicle, getAllSuspensionTypes } from '../engine/vehicleConfigData';
import './CalculatorForm.css';

const CalculatorForm = ({ onCalculate, onImport }) => {
  const [formData, setFormData] = useState({
    currentTireSize: '265/70R17',
    newTireSize: '285/75R17',
    axleGearRatio: '3.73',
    newAxleGearRatio: '',
    transmissionTopGear: '1.0',
    transferCaseRatio: '1.0',
    transferCaseLowRatio: '2.5',
    firstGearRatio: '4.0',
    intendedUse: 'weekend_trail',
    suspensionType: 'ifs',
    vehicleCategory: '', // Track selected vehicle category for filtering
    // Optional advanced tire specs
    currentTireWeight: '',
    newTireWeight: '',
    currentTireLoadIndex: '',
    newTireLoadIndex: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTireSpecs, setShowTireSpecs] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate(formData);
  };

  const useCaseProfiles = getUseCaseProfiles();
  const gearRatios = getAvailableGearRatios();

  // Popular off-road vehicles with factory tire sizes (VERIFIED from manufacturer specs)
  const vehicleDatabase = {
    tacoma: [
      { label: '1995-2004 Tacoma 4cyl 4x4', tire: '225/75R15', gear: '4.10' },
      { label: '1995-2004 Tacoma V6 4x4 Manual', tire: '225/75R15', gear: '3.58' },
      { label: '2000-2004 Tacoma V6 4x4 Auto', tire: '265/70R16', gear: '4.10' },
      { label: '2005-2015 Tacoma PreRunner V6', tire: '265/65R17', gear: '3.73' },
      { label: '2005-2015 Tacoma TRD Sport V6', tire: '265/65R17', gear: '3.73' },
      { label: '2005-2015 Tacoma TRD Off-Road', tire: '265/70R16', gear: '4.10' },
      { label: '2016-2023 Tacoma SR', tire: '245/75R16', gear: '3.73' },
      { label: '2016-2023 Tacoma SR5', tire: '245/75R16', gear: '3.73' },
      { label: '2016-2023 Tacoma TRD Sport', tire: '265/65R17', gear: '3.73' },
      { label: '2016-2023 Tacoma TRD Off-Road', tire: '265/70R16', gear: '3.909' },
      { label: '2016-2023 Tacoma TRD Pro', tire: '265/70R16', gear: '4.10' },
      { label: '2016-2023 Tacoma Limited', tire: '265/60R18', gear: '3.909' },
      { label: '2024+ Tacoma TRD Sport', tire: '265/70R17', gear: '4.30' },
      { label: '2024+ Tacoma TRD Off-Road', tire: '265/70R17', gear: '4.30' },
      { label: '2024+ Tacoma TRD Pro', tire: '265/70R18', gear: '4.30' },
      { label: '2024+ Tacoma Trailhunter', tire: '265/70R18', gear: '4.30' }
    ],
    fourrunner: [
      { label: '1984-1989 4Runner SR5 (1st Gen)', tire: '31x10.50R15', gear: '4.10' },
      { label: '1984-1989 4Runner (1st Gen)', tire: '225/75R15', gear: '4.56' },
      { label: '1990-1995 4Runner SR5 (2nd Gen)', tire: '265/70R15', gear: '3.73' },
      { label: '1990-1995 4Runner (2nd Gen)', tire: '31x10.50R15', gear: '4.10' },
      { label: '1996-2002 4Runner SR5 (3rd Gen)', tire: '265/70R16', gear: '4.10' },
      { label: '1996-2002 4Runner Limited (3rd Gen)', tire: '265/70R16', gear: '3.73' },
      { label: '2003-2009 4Runner SR5 (4th Gen)', tire: '265/70R16', gear: '4.10' },
      { label: '2003-2009 4Runner Sport Edition', tire: '265/65R17', gear: '4.10' },
      { label: '2003-2009 4Runner Limited (4th Gen)', tire: '265/65R17', gear: '3.73' },
      { label: '2010-2013 4Runner SR5 (5th Gen)', tire: '265/70R17', gear: '4.10' },
      { label: '2010-2013 4Runner Trail Edition', tire: '265/70R17', gear: '4.10' },
      { label: '2010-2024 4Runner Limited', tire: '245/60R20', gear: '3.73' },
      { label: '2014-2024 4Runner TRD Off-Road', tire: '265/70R17', gear: '4.10' },
      { label: '2015-2024 4Runner TRD Pro', tire: '265/70R17', gear: '4.10' },
      { label: '2020-2024 4Runner Venture Edition', tire: '265/70R17', gear: '4.10' },
      { label: '2020-2024 4Runner TRD Off-Road Premium', tire: '265/70R17', gear: '4.10' }
    ],
    jeep: [
      { label: 'JK Wrangler Sport/Sahara (2007-2018)', tire: '255/75R17', gear: '3.73' },
      { label: 'JK Wrangler Rubicon (2007-2018)', tire: '255/75R17', gear: '4.10' },
      { label: 'JL Wrangler Sport (2018+)', tire: '245/75R17', gear: '3.45' },
      { label: 'JL Wrangler Sahara (2018+)', tire: '255/70R18', gear: '3.45' },
      { label: 'JL Wrangler Rubicon (2018+)', tire: '285/70R17', gear: '4.10' },
      { label: 'JL Wrangler Rubicon 392 (2021+)', tire: '285/70R17', gear: '4.10' },
      { label: 'JL Wrangler Xtreme Recon', tire: '35x12.50R17', gear: '4.56' }
    ],
    gladiator: [
      { label: 'Gladiator Sport/Overland', tire: '255/70R18', gear: '3.73' },
      { label: 'Gladiator Rubicon', tire: '285/70R17', gear: '4.10' },
      { label: 'Gladiator Mojave', tire: '285/70R17', gear: '4.10' }
    ],
    landcruiser: [
      { label: '100 Series Land Cruiser (1998-2007)', tire: '275/70R16', gear: '4.10' },
      { label: '200 Series Land Cruiser (2008-2021)', tire: '285/65R18', gear: '3.91' },
      { label: 'Land Cruiser 70 Series', tire: '265/70R16', gear: '4.11' },
      { label: '2024+ Land Cruiser 250', tire: '265/70R18', gear: '3.58' }
    ],
    raptor: [
      { label: 'F-150 Raptor (2017-2020)', tire: '315/70R17', gear: '4.10' },
      { label: 'F-150 Raptor (2021+)', tire: '315/70R17', gear: '4.10' },
      { label: 'F-150 Raptor R (2023+)', tire: '37x12.50R17', gear: '4.70' }
    ],
    ram: [
      { label: 'Ram 1500 Rebel (2019+)', tire: '285/70R17', gear: '3.92' },
      { label: 'Ram 1500 TRX (2021+)', tire: '35x11.50R18', gear: '3.55' }
    ],
    ram2500: [
      { label: 'Ram 2500 Power Wagon', tire: '285/70R17', gear: '4.10' }
    ],
    suzuki: [
      { label: 'Suzuki Samurai (1986-1995)', tire: '215/75R15', gear: '5.12' },
      { label: 'Suzuki Sidekick (1989-1998)', tire: '205/75R15', gear: '4.62' },
      { label: 'Suzuki Jimny (2018+)', tire: '195/80R15', gear: '5.08' }
    ],
    landrover: [
      { label: 'Defender 90/110 (2020+)', tire: '255/70R18', gear: '3.54' },
      { label: 'Defender 110 X-Dynamic (2020+)', tire: '265/65R19', gear: '3.54' },
      { label: 'Discovery (2017+)', tire: '255/60R19', gear: '3.73' },
      { label: 'Range Rover (2013+)', tire: '275/45R21', gear: '3.54' }
    ],
    bronco: [
      { label: 'Bronco Base (2021+)', tire: '255/70R16', gear: '3.73' },
      { label: 'Bronco Big Bend (2021+)', tire: '255/75R17', gear: '3.73' },
      { label: 'Bronco Badlands (2021+)', tire: '285/70R17', gear: '4.70' },
      { label: 'Bronco Wildtrak/Sasquatch (2021+)', tire: '315/70R17', gear: '4.70' },
      { label: 'Bronco Raptor (2022+)', tire: '37x12.50R17', gear: '4.70' }
    ],
    lexusgx: [
      { label: 'GX470 (2003-2009)', tire: '265/65R17', gear: '4.30' },
      { label: 'GX460 (2010-2023)', tire: '265/60R18', gear: '4.30' },
      { label: 'GX460 Luxury (2010-2023)', tire: '265/60R18', gear: '4.30' }
    ],
    tundra: [
      { label: '2000-2006 Tundra SR5 4x4', tire: '265/70R16', gear: '3.909' },
      { label: '2000-2006 Tundra Limited 4x4', tire: '265/70R16', gear: '4.30' },
      { label: '2007-2021 Tundra SR5', tire: '275/65R18', gear: '4.30' },
      { label: '2007-2021 Tundra TRD Off-Road', tire: '275/65R18', gear: '4.30' },
      { label: '2015-2021 Tundra TRD Pro', tire: '275/65R18', gear: '4.30' },
      { label: '2022-2024 Tundra SR5', tire: '265/70R18', gear: '3.31' },
      { label: '2022-2024 Tundra TRD Pro', tire: '285/65R18', gear: '3.31' }
    ],
    sequoia: [
      { label: '2001-2007 Sequoia Limited 4x4', tire: 'P265/65R17', gear: '4.10' },
      { label: '2005-2007 Sequoia Limited', tire: 'P265/65R17', gear: '4.10' },
      { label: '2008-2021 Sequoia SR5', tire: 'P275/65R18', gear: '3.909' },
      { label: '2008-2021 Sequoia Limited', tire: 'P275/55R20', gear: '3.909' },
      { label: '2008-2021 Sequoia TRD Sport', tire: 'P275/55R20', gear: '4.30' },
      { label: '2023-2024 Sequoia SR5', tire: 'P265/70R18', gear: '3.90' },
      { label: '2023-2024 Sequoia TRD Pro', tire: '275/65R18', gear: '3.90' }
    ],
    t100: [
      { label: '1993-1994 T100 4x4 V6 Manual', tire: '31x10.50R15', gear: '4.70' },
      { label: '1995-1998 T100 4x4 V6 Manual', tire: '265/70R16', gear: '4.10' },
      { label: '1995-1998 T100 4x4 V6 Auto', tire: '265/70R16', gear: '4.30' }
    ],
    pickup: [
      { label: '1979-1985 Pickup 4cyl 4x4', tire: '225/75R15', gear: '4.10' },
      { label: '1986-1995 Pickup 22RE 4x4', tire: '225/75R15', gear: '4.10' },
      { label: '1986-1995 Pickup V6 4x4', tire: '31x10.50R15', gear: '4.56' }
    ],
    cherokee: [
      { label: '1984-2001 Cherokee XJ 4.0L', tire: '215/75R15', gear: '3.55' },
      { label: '1984-2001 Cherokee XJ Sport', tire: '225/75R15', gear: '3.73' }
    ],
    grandcherokee: [
      { label: '1999-2004 Grand Cherokee WJ Laredo', tire: '225/75R16', gear: '3.55' },
      { label: '2005-2010 Grand Cherokee WK Limited', tire: '245/65R17', gear: '3.73' },
      { label: '2011-2021 Grand Cherokee WK2 Laredo', tire: '245/60R20', gear: '3.45' },
      { label: '2011-2021 Grand Cherokee WK2 Overland', tire: '265/60R18', gear: '3.45' },
      { label: '2011-2021 Grand Cherokee WK2 Trailhawk', tire: '265/60R18', gear: '3.45' }
    ],
    tj: [
      { label: '1997-2002 TJ Wrangler Sport', tire: '225/75R16', gear: '3.73' },
      { label: '1997-2002 TJ Wrangler Sahara', tire: '30x9.50R15', gear: '4.10' },
      { label: '2003-2006 TJ Wrangler Rubicon', tire: '245/75R16', gear: '4.10' }
    ],
    yj: [
      { label: '1987-1995 YJ Wrangler', tire: '215/75R15', gear: '3.73' },
      { label: '1987-1995 YJ Wrangler Sport', tire: '225/75R15', gear: '4.10' }
    ],
    cj: [
      { label: '1972-1983 CJ-5', tire: '31x10.50R15', gear: '3.73' },
      { label: '1976-1986 CJ-7 Base', tire: '31x10.50R15', gear: '3.73' },
      { label: '1976-1986 CJ-7 Renegade', tire: '31x10.50R15', gear: '4.10' },
      { label: '1981-1986 CJ-8 Scrambler', tire: '31x10.50R15', gear: '3.73' }
    ],
    ranger: [
      { label: '1983-1992 Ranger 4WD', tire: '225/75R15', gear: '4.10' },
      { label: '1993-1997 Ranger XLT 4WD', tire: '225/75R15', gear: '4.10' },
      { label: '1998-2011 Ranger FX4', tire: '235/75R15', gear: '4.10' },
      { label: '2019-2024 Ranger XLT', tire: '255/70R16', gear: '3.55' },
      { label: '2019-2024 Ranger Tremor', tire: '265/70R17', gear: '4.46' }
    ],
    f150: [
      { label: '2004-2008 F-150 FX4', tire: '265/70R17', gear: '3.73' },
      { label: '2009-2014 F-150 FX4', tire: '275/65R18', gear: '3.73' },
      { label: '2015-2020 F-150 XLT 4WD', tire: '265/70R17', gear: '3.55' },
      { label: '2015-2020 F-150 Lariat 4WD', tire: '275/55R20', gear: '3.55' },
      { label: '2021-2024 F-150 XLT 4WD', tire: '265/70R17', gear: '3.55' },
      { label: '2021-2024 F-150 Tremor', tire: '285/70R18', gear: '3.73' }
    ],
    f250: [
      { label: '1999-2007 F-250 XLT 4WD', tire: '235/85R16', gear: '3.73' },
      { label: '1999-2007 F-250 Lariat 4WD', tire: '245/75R17', gear: '4.10' },
      { label: '2008-2010 F-250 XLT', tire: 'LT275/65R18', gear: '3.73' },
      { label: '2008-2010 F-250 King Ranch', tire: 'LT275/70R18', gear: '4.10' },
      { label: '2011-2016 F-250 XLT', tire: '275/65R18', gear: '3.73' },
      { label: '2011-2016 F-250 Tremor', tire: '285/75R18', gear: '4.30' },
      { label: '2017-2024 F-250 XLT', tire: '275/65R18', gear: '3.55' },
      { label: '2017-2024 F-250 Tremor', tire: '285/75R18', gear: '4.30' }
    ],
    colorado: [
      { label: '2004-2012 Colorado Z71', tire: '265/75R15', gear: '3.73' },
      { label: '2004-2012 Colorado Z85', tire: '235/75R15', gear: '3.42' },
      { label: '2015-2020 Colorado Z71', tire: '265/65R17', gear: '3.42' },
      { label: '2015-2020 Colorado ZR2', tire: '285/70R17', gear: '3.42' },
      { label: '2021-2024 Colorado Z71', tire: '265/65R17', gear: '3.42' },
      { label: '2024+ Colorado ZR2', tire: '285/70R17', gear: '3.42' }
    ],
    silverado1500: [
      { label: '2007-2013 Silverado LT', tire: '265/65R18', gear: '3.42' },
      { label: '2007-2013 Silverado Z71', tire: '265/70R17', gear: '3.73' },
      { label: '2014-2018 Silverado LT', tire: '265/65R18', gear: '3.42' },
      { label: '2014-2018 Silverado Z71', tire: '265/65R18', gear: '3.42' },
      { label: '2019-2024 Silverado Trail Boss', tire: '275/65R18', gear: '3.23' },
      { label: '2023+ Silverado ZR2', tire: '285/70R17', gear: '3.73' }
    ],
    silverado2500: [
      { label: '2007-2024 Silverado 2500HD LT', tire: '265/70R17', gear: '3.73' },
      { label: '2007-2024 Silverado 2500HD Duramax', tire: 'LT265/70R17', gear: '4.10' }
    ],
    sierra1500: [
      { label: '2007-2013 Sierra SLT', tire: '265/65R18', gear: '3.42' },
      { label: '2007-2013 Sierra SLE', tire: '265/70R17', gear: '3.42' },
      { label: '2019-2024 Sierra AT4', tire: '275/65R18', gear: '3.23' },
      { label: '2023+ Sierra AT4X', tire: '285/70R17', gear: '3.73' }
    ],
    sierra2500: [
      { label: '2007-2024 Sierra 2500HD SLE', tire: '265/70R17', gear: '3.73' },
      { label: '2007-2024 Sierra 2500HD Denali', tire: 'LT265/70R17', gear: '4.10' }
    ]
  };

  const handleVehicleSelect = (e) => {
    const selected = e.target.value;
    if (!selected) return;

    const [category, index] = selected.split('-');
    const vehicle = vehicleDatabase[category][parseInt(index)];

    if (vehicle) {
      // Extract vehicle type from label (e.g., "2016-2023 Tacoma SR5" -> "Toyota Tacoma")
      let vehicleType = '';
      if (category === 'tacoma') vehicleType = 'Toyota Tacoma';
      else if (category === 'fourrunner') vehicleType = 'Toyota 4Runner';
      else if (category === 'jeep') vehicleType = 'Jeep Wrangler';
      else if (category === 'gladiator') vehicleType = 'Jeep Gladiator';
      else if (category === 'bronco') vehicleType = 'Ford Bronco';
      else if (category === 'raptor') vehicleType = 'Ford F-150 Raptor';
      else if (category === 'landcruiser') vehicleType = 'Toyota Land Cruiser';
      else if (category === 'ram') vehicleType = 'Ram 1500';
      else if (category === 'ram2500') vehicleType = 'Ram 2500';
      else if (category === 'landrover') vehicleType = 'Land Rover';
      else if (category === 'suzuki') vehicleType = 'Suzuki';
      else if (category === 'lexusgx') vehicleType = 'Lexus GX';
      else if (category === 'tundra') vehicleType = 'Toyota Tundra';
      else if (category === 'sequoia') vehicleType = 'Toyota Sequoia';
      else if (category === 't100') vehicleType = 'Toyota T100';
      else if (category === 'pickup') vehicleType = 'Toyota Pickup';
      else if (category === 'cherokee') vehicleType = 'Jeep Cherokee';
      else if (category === 'grandcherokee') vehicleType = 'Jeep Grand Cherokee';
      else if (category === 'ranger') vehicleType = 'Ford Ranger';
      else if (category === 'f150') vehicleType = 'Ford F-150';
      else if (category === 'f250') vehicleType = 'Ford F-250';
      else if (category === 'colorado') vehicleType = 'Chevrolet Colorado';
      else if (category === 'silverado1500') vehicleType = 'Chevrolet Silverado 1500';
      else if (category === 'silverado2500') vehicleType = 'Chevrolet Silverado 2500HD';
      else if (category === 'sierra1500') vehicleType = 'GMC Sierra 1500';
      else if (category === 'sierra2500') vehicleType = 'GMC Sierra 2500HD';
      else if (category === 'cj') vehicleType = 'Jeep CJ';
      else if (category === 'yj') vehicleType = 'Jeep YJ Wrangler';
      else if (category === 'tj') vehicleType = 'Jeep TJ Wrangler';

      // Get vehicle-specific suspension type
      const suspensionType = getSuspensionType(category);

      setFormData(prev => ({
        ...prev,
        currentTireSize: vehicle.tire,
        axleGearRatio: String(parseFloat(vehicle.gear)),
        vehicleType: vehicleType,
        suspensionType: suspensionType,
        vehicleCategory: category // Store category for filtering gear ratios
      }));
    }
  };

  const exampleSizes = [
    { label: 'Stock Tacoma/4Runner', value: '265/70R17' },
    { label: 'Popular Upgrade', value: '285/75R17' },
    { label: '33" Tire', value: '33x10.50R17' },
    { label: '35" Tire', value: '35x12.50R17' },
    { label: 'Jeep 37"', value: '37x12.50R17' },
    { label: 'LT315/70R17', value: 'LT315/70R17' }
  ];

  return (
    <div className="calculator-form-wrapper">
      <form onSubmit={handleSubmit} className="calculator-form">

        <section className="form-section">
          <h2>Tire Sizes</h2>
          <p className="section-hint">Supports P-metric (265/70R17), LT-metric (LT285/75R16), and Flotation (35x12.50R17)</p>

          <div className="form-group">
            <label htmlFor="vehicleSelect">
              Select Your Vehicle
              <span className="optional">(optional - quick setup)</span>
            </label>
            <select
              id="vehicleSelect"
              onChange={handleVehicleSelect}
              defaultValue=""
            >
              <option value="">Manual entry / Other vehicle</option>

              {/* Most Popular Off-Road Vehicles */}
              <optgroup label="Jeep Wrangler (JK/JL)">
                {vehicleDatabase.jeep.map((vehicle, i) => (
                  <option key={i} value={`jeep-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Toyota Tacoma">
                {vehicleDatabase.tacoma.map((vehicle, i) => (
                  <option key={i} value={`tacoma-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Toyota 4Runner">
                {vehicleDatabase.fourrunner.map((vehicle, i) => (
                  <option key={i} value={`fourrunner-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Jeep Gladiator">
                {vehicleDatabase.gladiator.map((vehicle, i) => (
                  <option key={i} value={`gladiator-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Ford Bronco">
                {vehicleDatabase.bronco.map((vehicle, i) => (
                  <option key={i} value={`bronco-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Jeep TJ Wrangler (1997-2006)">
                {vehicleDatabase.tj.map((vehicle, i) => (
                  <option key={i} value={`tj-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Jeep YJ Wrangler (1987-1995)">
                {vehicleDatabase.yj.map((vehicle, i) => (
                  <option key={i} value={`yj-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Ford F-150 Raptor">
                {vehicleDatabase.raptor.map((vehicle, i) => (
                  <option key={i} value={`raptor-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Jeep CJ Series (Classic)">
                {vehicleDatabase.cj.map((vehicle, i) => (
                  <option key={i} value={`cj-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Toyota Land Cruiser">
                {vehicleDatabase.landcruiser.map((vehicle, i) => (
                  <option key={i} value={`landcruiser-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Chevrolet Colorado / ZR2">
                {vehicleDatabase.colorado.map((vehicle, i) => (
                  <option key={i} value={`colorado-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Ford Ranger">
                {vehicleDatabase.ranger.map((vehicle, i) => (
                  <option key={i} value={`ranger-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Lexus GX">
                {vehicleDatabase.lexusgx.map((vehicle, i) => (
                  <option key={i} value={`lexusgx-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Jeep Cherokee XJ (Classic)">
                {vehicleDatabase.cherokee.map((vehicle, i) => (
                  <option key={i} value={`cherokee-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Ram 1500">
                {vehicleDatabase.ram.map((vehicle, i) => (
                  <option key={i} value={`ram-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              {/* Full-Size Trucks */}
              <optgroup label="Chevrolet Silverado 1500">
                {vehicleDatabase.silverado1500.map((vehicle, i) => (
                  <option key={i} value={`silverado1500-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="GMC Sierra 1500">
                {vehicleDatabase.sierra1500.map((vehicle, i) => (
                  <option key={i} value={`sierra1500-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Ford F-150">
                {vehicleDatabase.f150.map((vehicle, i) => (
                  <option key={i} value={`f150-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Toyota Tundra">
                {vehicleDatabase.tundra.map((vehicle, i) => (
                  <option key={i} value={`tundra-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Toyota Sequoia">
                {vehicleDatabase.sequoia.map((vehicle, i) => (
                  <option key={i} value={`sequoia-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              {/* Heavy Duty Trucks */}
              <optgroup label="Ram 2500/3500 HD">
                {vehicleDatabase.ram2500.map((vehicle, i) => (
                  <option key={i} value={`ram2500-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Ford F-250 Super Duty">
                {vehicleDatabase.f250.map((vehicle, i) => (
                  <option key={i} value={`f250-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Chevrolet Silverado 2500HD">
                {vehicleDatabase.silverado2500.map((vehicle, i) => (
                  <option key={i} value={`silverado2500-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="GMC Sierra 2500HD">
                {vehicleDatabase.sierra2500.map((vehicle, i) => (
                  <option key={i} value={`sierra2500-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              {/* SUVs & Specialty */}
              <optgroup label="Jeep Grand Cherokee">
                {vehicleDatabase.grandcherokee.map((vehicle, i) => (
                  <option key={i} value={`grandcherokee-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Land Rover">
                {vehicleDatabase.landrover.map((vehicle, i) => (
                  <option key={i} value={`landrover-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              {/* Classic Toyota */}
              <optgroup label="Toyota T100">
                {vehicleDatabase.t100.map((vehicle, i) => (
                  <option key={i} value={`t100-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Toyota Pickup (Classic)">
                {vehicleDatabase.pickup.map((vehicle, i) => (
                  <option key={i} value={`pickup-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Suzuki">
                {vehicleDatabase.suzuki.map((vehicle, i) => (
                  <option key={i} value={`suzuki-${i}`}>
                    {vehicle.label} - {vehicle.tire}
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="input-hint">Auto-fills tire size and gear ratio for your vehicle</div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currentTireSize">
                Current Tire Size
                <span className="required">*</span>
              </label>
              <input
                type="text"
                id="currentTireSize"
                name="currentTireSize"
                value={formData.currentTireSize}
                onChange={handleChange}
                placeholder="e.g., 265/70R17"
                required
              />
              <div className="input-hint">Your current tire size</div>
            </div>

            <div className="form-group">
              <label htmlFor="newTireSize">
                New Tire Size
                <span className="required">*</span>
              </label>
              <input
                type="text"
                id="newTireSize"
                name="newTireSize"
                value={formData.newTireSize}
                onChange={handleChange}
                placeholder="e.g., 285/75R17"
                required
              />
              <div className="input-hint">The upgrade you're considering</div>
            </div>
          </div>

          <div className="quick-select">
            <span>Quick examples:</span>
            {exampleSizes.map((size, i) => (
              <button
                key={i}
                type="button"
                className="quick-select-btn"
                onClick={() => setFormData(prev => ({ ...prev, newTireSize: size.value }))}
              >
                {size.label}
              </button>
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>Vehicle Configuration</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="axleGearRatio">
                Axle Gear Ratio
                <span className="optional">(optional but recommended)</span>
              </label>
              <select
                id="axleGearRatio"
                name="axleGearRatio"
                value={formData.axleGearRatio}
                onChange={handleChange}
              >
                <option value="">Not sure / Skip</option>

                {formData.vehicleCategory && getAvailableGearRatiosForVehicle(formData.vehicleCategory).length > 0 ? (
                  <>
                    <optgroup label={`Factory ${formData.vehicleCategory.charAt(0).toUpperCase() + formData.vehicleCategory.slice(1)} Ratios`}>
                      {getAvailableGearRatiosForVehicle(formData.vehicleCategory).map(ratio => (
                        <option key={ratio} value={ratio}>
                          {ratio === 3.909 ? ratio.toFixed(3) : ratio.toFixed(2)}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="All Available Ratios">
                      {gearRatios.map(ratio => (
                        <option key={ratio} value={ratio}>
                          {ratio === 3.909 ? `${ratio.toFixed(3)}` : ratio.toFixed(2)}
                        </option>
                      ))}
                    </optgroup>
                  </>
                ) : (
                  <>
                    <optgroup label="Common Tacoma/4Runner Ratios">
                      <option value="3.73">3.73 - Early models, MT, economy</option>
                      <option value="3.909">3.909 - 2016+ TRD Off-Road Auto ⭐</option>
                      <option value="4.10">4.10 - TRD Pro, strong acceleration</option>
                      <option value="4.30">4.30 - Heavy duty, ideal for 35" tires</option>
                    </optgroup>

                    <optgroup label="Common Jeep Wrangler Ratios">
                      <option value="3.21">3.21 - JK Sport/Sahara MT (2007-2018)</option>
                      <option value="3.45">3.45 - JL Sport/Sahara (2018+)</option>
                      <option value="3.73">3.73 - JK Sport/Sahara AT (2007-2018)</option>
                      <option value="4.10">4.10 - Rubicon (all generations)</option>
                      <option value="4.56">4.56 - Regear for 35" tires</option>
                      <option value="4.88">4.88 - Regear for 37" tires</option>
                      <option value="5.13">5.13 - Regear for 37"+ tires</option>
                    </optgroup>

                    <optgroup label="All Available Ratios">
                      {gearRatios.map(ratio => (
                        <option key={ratio} value={ratio}>
                          {ratio === 3.909 ? `${ratio.toFixed(3)}` : ratio.toFixed(2)}
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}
              </select>
              <div className="input-hint">
                {formData.vehicleCategory
                  ? `Showing factory options for your ${formData.vehicleCategory}. Found on differential tag or owner's manual.`
                  : 'Found on differential tag or owner\'s manual. 3.909 is Tacoma\'s sweet spot ratio.'}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="suspensionType">Suspension Type</label>
              <select
                id="suspensionType"
                name="suspensionType"
                value={formData.suspensionType}
                onChange={handleChange}
              >
                {getAllSuspensionTypes().map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <div className="input-hint">
                {formData.vehicleCategory
                  ? `Auto-set for your ${formData.vehicleCategory}. Affects clearance and CV angle warnings.`
                  : 'Affects clearance and CV angle warnings'}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="intendedUse">Intended Use</label>
            <select
              id="intendedUse"
              name="intendedUse"
              value={formData.intendedUse}
              onChange={handleChange}
            >
              {Object.entries(useCaseProfiles).map(([key, profile]) => (
                <option key={key} value={key}>
                  {profile.name} - {profile.description}
                </option>
              ))}
            </select>
            <div className="input-hint">Affects re-gear and advisory recommendations</div>
          </div>

          <div className="form-group">
            <label htmlFor="newAxleGearRatio">
              New/Target Axle Gear Ratio
              <span className="optional">(optional - to compare re-gear scenario)</span>
            </label>
            <select
              id="newAxleGearRatio"
              name="newAxleGearRatio"
              value={formData.newAxleGearRatio}
              onChange={handleChange}
            >
              <option value="">Skip / Keep current ratio</option>

              <optgroup label="Common Tacoma/4Runner Ratios">
                <option value="3.73">3.73 - Early models, MT, economy</option>
                <option value="3.909">3.909 - 2016+ TRD Off-Road Auto ⭐</option>
                <option value="4.10">4.10 - TRD Pro, strong acceleration</option>
                <option value="4.30">4.30 - Heavy duty, ideal for 35" tires</option>
              </optgroup>

              <optgroup label="Common Jeep Wrangler Ratios">
                <option value="3.21">3.21 - JK Sport/Sahara MT (2007-2018)</option>
                <option value="3.45">3.45 - JL Sport/Sahara (2018+)</option>
                <option value="3.73">3.73 - JK Sport/Sahara AT (2007-2018)</option>
                <option value="4.10">4.10 - Rubicon (all generations)</option>
                <option value="4.56">4.56 - Regear for 35" tires</option>
                <option value="4.88">4.88 - Regear for 37" tires</option>
                <option value="5.13">5.13 - Regear for 37"+ tires</option>
              </optgroup>

              <optgroup label="All Available Ratios">
                {gearRatios.map(ratio => (
                  <option key={ratio} value={ratio}>
                    {ratio === 3.909 ? `${ratio.toFixed(3)}` : ratio.toFixed(2)}
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="input-hint">Compare performance with new tires AND new gears together</div>
          </div>
        </section>

        <section className="form-section advanced-section">
          <button
            type="button"
            className="toggle-advanced"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▼' : '▶'} Advanced Drivetrain Settings
            <span className="optional">(recommended for accurate crawl ratio calculations)</span>
          </button>

          {showAdvanced && (
            <div className="advanced-fields">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="transmissionTopGear">
                    Transmission Final Ratio
                  </label>
                  <input
                    type="number"
                    id="transmissionTopGear"
                    name="transmissionTopGear"
                    value={formData.transmissionTopGear}
                    onChange={handleChange}
                    step="0.01"
                    min="0.5"
                    max="2.0"
                  />
                  <div className="input-hint">Usually 0.7-1.0 (overdrive) or 1.0 (direct)</div>
                </div>

                <div className="form-group">
                  <label htmlFor="firstGearRatio">
                    First Gear Ratio
                  </label>
                  <input
                    type="number"
                    id="firstGearRatio"
                    name="firstGearRatio"
                    value={formData.firstGearRatio}
                    onChange={handleChange}
                    step="0.01"
                    min="2.0"
                    max="6.0"
                    placeholder="3.5"
                  />
                  <div className="input-hint">Tacoma/4Runner: 3.538 | Jeep Wrangler: 4.71 | Bronco: 4.696</div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="transferCaseRatio">
                    Transfer Case High Ratio
                  </label>
                  <input
                    type="number"
                    id="transferCaseRatio"
                    name="transferCaseRatio"
                    value={formData.transferCaseRatio}
                    onChange={handleChange}
                    step="0.01"
                    min="0.8"
                    max="1.5"
                  />
                  <div className="input-hint">Usually 1.0 (4WD high) or N/A for 2WD</div>
                </div>

                <div className="form-group">
                  <label htmlFor="transferCaseLowRatio">
                    Transfer Case Low Ratio
                  </label>
                  <input
                    type="number"
                    id="transferCaseLowRatio"
                    name="transferCaseLowRatio"
                    value={formData.transferCaseLowRatio}
                    onChange={handleChange}
                    step="0.01"
                    min="1.5"
                    max="4.5"
                    placeholder="2.5"
                  />
                  <div className="input-hint">Tacoma/4Runner: 2.566 | Jeep non-Rubicon: 2.72 | Jeep Rubicon: 4.0 | Bronco Sasquatch: 3.06</div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="form-section advanced-section">
          <button
            type="button"
            className="toggle-advanced"
            onClick={() => setShowTireSpecs(!showTireSpecs)}
          >
            {showTireSpecs ? '▼' : '▶'} Advanced Tire Specifications
            <span className="optional">(for experienced users - weight and load rating analysis)</span>
          </button>

          {showTireSpecs && (
            <div className="advanced-fields">
              <p className="section-hint">
                Optional tire specifications for advanced analysis. Weight affects unsprung mass and performance.
                Load index determines safe load capacity. Leave blank for basic calculations.
              </p>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="currentTireWeight">
                    Current Tire Weight (lbs)
                    <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="number"
                    id="currentTireWeight"
                    name="currentTireWeight"
                    value={formData.currentTireWeight}
                    onChange={handleChange}
                    step="1"
                    min="20"
                    max="150"
                    placeholder="e.g., 50"
                  />
                  <div className="input-hint">Found on tire manufacturer specs. P-metric: 35-55 lbs | LT 33": 55-65 lbs | LT 35": 65-75 lbs | LT 37": 75-85 lbs</div>
                </div>

                <div className="form-group">
                  <label htmlFor="newTireWeight">
                    New Tire Weight (lbs)
                    <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="number"
                    id="newTireWeight"
                    name="newTireWeight"
                    value={formData.newTireWeight}
                    onChange={handleChange}
                    step="1"
                    min="20"
                    max="150"
                    placeholder="e.g., 65"
                  />
                  <div className="input-hint">Check manufacturer website or retailer specs</div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="currentTireLoadIndex">
                    Current Tire Load Index
                    <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="number"
                    id="currentTireLoadIndex"
                    name="currentTireLoadIndex"
                    value={formData.currentTireLoadIndex}
                    onChange={handleChange}
                    step="1"
                    min="70"
                    max="130"
                    placeholder="e.g., 113"
                  />
                  <div className="input-hint">Found on tire sidewall. 113 = 2535 lbs | 117 = 2833 lbs | 121 = 3197 lbs | 126 = 3748 lbs</div>
                </div>

                <div className="form-group">
                  <label htmlFor="newTireLoadIndex">
                    New Tire Load Index
                    <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="number"
                    id="newTireLoadIndex"
                    name="newTireLoadIndex"
                    value={formData.newTireLoadIndex}
                    onChange={handleChange}
                    step="1"
                    min="70"
                    max="130"
                    placeholder="e.g., 121"
                  />
                  <div className="input-hint">Higher is better for loaded overlanding rigs</div>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Calculate Tire Impact
          </button>
          <button type="button" onClick={handleImportClick} className="btn btn-secondary">
            Import Saved Results
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </form>
    </div>
  );
};

export default CalculatorForm;
