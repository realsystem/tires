# Intended Use - How It Affects Recommendations

The **Intended Use** selection affects recommendations throughout the calculator, providing context-aware advice based on your specific use case.

## Available Use Cases

1. **Daily Driver** - Commuting and street use
2. **Weekend Trail** - Recreational off-roading
3. **Rock Crawling** - Technical terrain
4. **Overlanding** - Long-distance expedition travel
5. **Sand/Desert** - Dunes and soft terrain

## How Intended Use Affects Analysis

### 1. Weight & Unsprung Mass Recommendations

#### Daily Driver
- **More sensitive** to weight increases (25%/12% thresholds vs standard 30%/15%)
- Emphasizes fuel economy impact (1.0-2.0 MPG estimates)
- Warns about comfort and daily usability
- Recommends lighter tires when possible

**Example:**
```
Daily Driver + 21 lbs/tire increase:
- "Expect 1.0-2.0 MPG fuel economy decrease - significant for daily commuting"
- "Consider if weight penalty worth it for daily use - affects acceleration, braking, and comfort"
- "Stock shocks may wear faster - consider upgrade for better ride quality"
```

#### Rock Crawling
- **Less sensitive** to weight (40%/20% thresholds)
- Accepts weight trade-off for durability
- Recommends heavy-duty components
- Values sidewall strength over weight savings

**Example:**
```
Rock Crawling + 21 lbs/tire increase:
- "Heavy shocks essential for rock crawling - better control on technical terrain"
- "Heavier tires often more durable for rock crawling - accept weight trade-off for sidewall strength"
```

#### Overlanding
- Emphasizes fuel range planning
- Focuses on payload capacity for gear
- Moderate fuel economy estimates (0.5-1.5 MPG)

**Example:**
```
Overlanding + 21 lbs/tire increase:
- "Expect 0.5-1.5 MPG decrease - factor into fuel range planning for remote trips"
- "Lighter tires leave more payload capacity for gear and equipment" (for weight reductions)
```

#### Sand/Desert
- Warns about flotation impact
- Recommends lower air pressure to compensate

**Example:**
```
Sand/Desert + 21 lbs/tire increase:
- "Weight increase reduces flotation in sand - may need to air down more (12-15 PSI)"
```

---

### 2. Load Capacity Recommendations

#### Overlanding
- **Stricter thresholds** (capacity reduction >300 lbs = critical vs standard >200 lbs)
- Emphasizes RTT, water, gear, recovery equipment weight
- Minimum recommended: Load Index 115+
- Ideal: Load Range E (Load Index 121+)

**Example:**
```
Overlanding + Load Index 126:
- "Load Range E excellent for overlanding - handles heavy gear, water, recovery equipment"
- "Excellent for heavily loaded overland rigs with RTT, gear, armor, and extended fuel/water"
```

#### Rock Crawling
- Stricter thresholds for armor/protection weight
- Minimum recommended: Load Index 113+
- Emphasizes armor package support

**Example:**
```
Rock Crawling + Load Index 126:
- "Load Range E ideal for rock crawling - supports full armor package"
- "Excellent capacity for armor, sliders, heavy bumpers, and recovery gear"
```

#### Daily Driver
- **Lower capacity acceptable**
- More forgiving thresholds
- Emphasizes safety margin for occasional hauling

**Example:**
```
Daily Driver + Load Index 115:
- "Good capacity for daily driving and light gear"
- "Capacity increase provides safety margin - good for occasional hauling or trips"
```

---

### 3. Advisory Warnings (from Advisory Engine)

#### Low Profile Tires
- **Daily Driver**: No warning (low profile OK for street)
- **Weekend Trail / Rock Crawling**: Warning about sidewall damage risk

#### P-metric vs LT Tires
- **Daily Driver**: No warning (P-metric acceptable)
- **Weekend Trail / Rock Crawling / Overlanding**: Warns about weaker sidewalls

---

### 4. Re-Gearing Recommendations (from Regear Engine)

Each use case has different optimal RPM targets:

| Use Case | Target RPM @ 65 mph | Priority |
|----------|---------------------|----------|
| **Daily Driver** | 1800-2000 RPM | Low highway RPM, fuel economy |
| **Weekend Trail** | 1900-2100 RPM | Balanced power and economy |
| **Rock Crawling** | 2000-2200 RPM | Low-end torque, crawl ratio >50:1 |
| **Overlanding** | 1900-2100 RPM | Power band maintenance, loaded climbing |
| **Sand/Desert** | 1900-2100 RPM | Momentum-based gearing |

---

### 5. Air-Down Guidance (from Advisory Engine)

Recommended PSI varies by intended use:

| Terrain | PSI | Intended Use Impact |
|---------|-----|---------------------|
| Street | 32-35 | All use cases |
| Dirt Road | 28-30 | All use cases |
| Trail | 20-25 | General trail (Weekend Trail) |
| Rock | 12-18 | Rock Crawling (beadlocks required) |
| Sand | 12-15 | Sand/Desert (maximum flotation) |

**Overlanding specific notes:**
- "Balance traction needs with sidewall durability"
- "Higher PSI for loaded rigs"

---

## Real-World Example

**Scenario:** 265/70R17 → 35x12.50R17 (21 lbs/tire increase, +1213 lbs capacity)

### Daily Driver
```
Weight Impact:
✅ HIGH severity (more sensitive threshold)
- "Expect 1.0-2.0 MPG fuel economy decrease - significant for daily commuting"
- "Consider if weight penalty worth it for daily use"

Load Capacity:
✅ POSITIVE - adequate for daily use
- "Good capacity for daily driving and light gear"
```

### Rock Crawling
```
Weight Impact:
✅ HIGH severity (but more accepting)
- "Heavier tires often more durable for rock crawling - accept weight trade-off"
- "Heavy shocks essential for rock crawling - better control on technical terrain"

Load Capacity:
✅ POSITIVE - excellent for armor
- "Load Range E ideal for rock crawling - supports full armor package"
- "Excellent capacity for armor, sliders, heavy bumpers"
```

### Overlanding
```
Weight Impact:
✅ HIGH severity
- "Expect 0.5-1.5 MPG decrease - factor into fuel range planning for remote trips"

Load Capacity:
✅ POSITIVE - perfect for expeditions
- "Load Range E excellent for overlanding - handles heavy gear, water, recovery equipment"
- "Excellent for heavily loaded overland rigs with RTT, gear, armor"
```

---

## How It Works Technically

### Code Flow

1. User selects **Intended Use** in calculator form
2. `formData.intendedUse` passed to:
   - `calculateTireComparison()` → Weight & load analysis
   - `generateRegearRecommendations()` → Gear ratio optimization
   - `generateAdvisory()` → Warnings and build impact

3. **Weight Analysis** ([tireCalculator.js:346-436](src/engine/tireCalculator.js#L346-L436)):
   ```javascript
   // Severity thresholds vary by use case
   if (intendedUse === 'daily_driver') {
     severityThresholds = { high: 25, medium: 12 }; // More sensitive
   } else if (intendedUse === 'rock_crawling') {
     severityThresholds = { high: 40, medium: 20 }; // Less sensitive
   }
   ```

4. **Load Capacity** ([tireCalculator.js:508-629](src/engine/tireCalculator.js#L508-L629)):
   ```javascript
   if (intendedUse === 'overlanding') {
     // Higher capacity needs assessment
     if (totalCapacity >= 12000) {
       assessments.push('Excellent for heavily loaded overland rigs...');
     }
   }
   ```

---

## Best Practices

### When to Choose Each Use Case

1. **Daily Driver**:
   - Primarily commuting and highway
   - Occasional light trails
   - Fuel economy matters

2. **Weekend Trail**:
   - Regular recreational off-roading
   - Forest service roads, moderate trails
   - Balanced performance

3. **Rock Crawling**:
   - Technical terrain, obstacles
   - Low-speed control critical
   - Durability over economy

4. **Overlanding**:
   - Multi-day trips with gear
   - Roof tent, water, recovery gear
   - Remote travel, fuel range critical

5. **Sand/Desert**:
   - Dunes, soft terrain
   - Flotation important
   - Momentum-based driving

### Tips

- **Be honest** about primary use - don't select "Rock Crawling" if you do trails once a year
- **Worst case**: Use "Weekend Trail" as balanced default
- **Multiple uses**: Pick the most demanding (e.g., monthly trails + daily commute = Weekend Trail)
- **Change later**: Recalculate with different use case to compare recommendations

---

## Impact Summary Table

| Feature | Daily Driver | Weekend Trail | Rock Crawling | Overlanding | Sand/Desert |
|---------|-------------|---------------|---------------|-------------|-------------|
| **Weight Sensitivity** | High | Medium | Low | Medium | Medium |
| **Fuel Economy Emphasis** | High | Medium | Low | High | Medium |
| **Load Capacity Requirements** | Low | Medium | High | Very High | Medium |
| **Accepts Heavy Tires** | No | Yes | Yes | Yes | Cautious |
| **Min Load Index Rec.** | 100+ | 110+ | 113+ | 115+ | 110+ |
| **Ideal RPM Range** | 1800-2000 | 1900-2100 | 2000-2200 | 1900-2100 | 1900-2100 |

---

**Remember:** The calculator provides *guidance*, not absolute rules. Your specific vehicle, build, and driving style may vary. Always verify clearance, load capacity, and consult professionals for major modifications.
