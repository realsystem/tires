import React, { useState } from 'react';
import { getAvailableGearRatios, getUseCaseProfiles } from '../engine/regearEngine';
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

  // Organize gear ratios by common vehicle platforms
  const commonTacomaRatios = [3.73, 3.909, 4.10, 4.30];
  const commonJeepRatios = [3.21, 3.73, 4.10, 4.56, 4.88, 5.13];
  const allOtherRatios = gearRatios.filter(
    r => !commonTacomaRatios.includes(r) && !commonJeepRatios.includes(r)
  );

  // Popular off-road vehicles with factory tire sizes (VERIFIED from manufacturer specs)
  const vehicleDatabase = {
    tacoma: [
      { label: '2016-2023 Tacoma SR5', tire: '245/75R16', gear: '3.73' },
      { label: '2016-2023 Tacoma TRD Sport', tire: '265/65R17', gear: '3.73' },
      { label: '2016-2023 Tacoma TRD Off-Road', tire: '265/70R16', gear: '3.909' },
      { label: '2016-2023 Tacoma TRD Pro', tire: '265/70R16', gear: '4.10' },
      { label: '2024+ Tacoma TRD Pro', tire: '265/70R18', gear: '4.30' }
    ],
    fourrunner: [
      { label: '2010-2024 4Runner SR5', tire: '265/70R17', gear: '4.10' },
      { label: '2010-2024 4Runner TRD Off-Road', tire: '265/70R17', gear: '4.10' },
      { label: '2010-2024 4Runner TRD Pro', tire: '265/70R17', gear: '4.10' },
      { label: '2010-2024 4Runner Limited', tire: '245/60R20', gear: '4.10' }
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
      { label: 'Ram 1500 TRX (2021+)', tire: '35x11.50R18', gear: '3.55' },
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
      else if (category === 'raptor') vehicleType = 'Ford F-150';
      else if (category === 'landcruiser') vehicleType = 'Toyota Land Cruiser';
      else if (category === 'ram') vehicleType = 'Ram 1500';
      else if (category === 'landrover') vehicleType = 'Land Rover';
      else if (category === 'suzuki') vehicleType = 'Suzuki';

      setFormData(prev => ({
        ...prev,
        currentTireSize: vehicle.tire,
        axleGearRatio: vehicle.gear,
        vehicleType: vehicleType
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

              <optgroup label="Jeep Wrangler">
                {vehicleDatabase.jeep.map((vehicle, i) => (
                  <option key={i} value={`jeep-${i}`}>
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

              <optgroup label="Ford Raptor">
                {vehicleDatabase.raptor.map((vehicle, i) => (
                  <option key={i} value={`raptor-${i}`}>
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

              <optgroup label="Ram Trucks">
                {vehicleDatabase.ram.map((vehicle, i) => (
                  <option key={i} value={`ram-${i}`}>
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
              <div className="input-hint">Found on differential tag or owner's manual. 3.909 is Tacoma's sweet spot ratio.</div>
            </div>

            <div className="form-group">
              <label htmlFor="suspensionType">Suspension Type</label>
              <select
                id="suspensionType"
                name="suspensionType"
                value={formData.suspensionType}
                onChange={handleChange}
              >
                <option value="ifs">IFS (Independent Front Suspension)</option>
                <option value="solid_axle">Solid Axle (Front & Rear)</option>
              </select>
              <div className="input-hint">Affects clearance and CV angle warnings</div>
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
