# 5K Decoded - Test Suite Documentation

## Overview

This comprehensive test suite validates the Garmin 5K Analysis Platform using Test-Driven Development (TDD) principles. The tests ensure accuracy, realism, and evidence-based recommendations.

## Test Coverage Goals

- **Unit Tests**: >80% code coverage
- **Integration Tests**: >75% code coverage
- **Overall**: >80% combined coverage

## Test Structure

```
tests/
├── setup.js                          # Global test configuration
├── fixtures/                         # Test data
│   ├── sample-beginner-5k.json      # Beginner runner data
│   ├── sample-advanced-5k.json      # Advanced runner data
│   └── sample-corrupted.json        # Error case data
├── unit/                            # Unit tests
│   ├── parser.test.js               # File parsing tests
│   ├── analyzer.test.js             # Analysis engine tests
│   └── recommender.test.js          # Recommendation tests
├── integration/                     # Integration tests
│   └── e2e-flow.test.js            # End-to-end flow tests
├── validation/                      # Validation tests
│   └── recommendation-accuracy.test.js  # Sports science validation
└── README.md                        # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### With Coverage Report
```bash
npm test -- --coverage
```

### CI/CD Mode
```bash
npm run test:ci
```

## Test Categories

### 1. Parser Tests (`unit/parser.test.js`)

Tests file parsing for FIT, TCX, and GPX formats:
- ✅ Format detection
- ✅ Data extraction
- ✅ Normalization
- ✅ Error handling

**Key Validations**:
- Heart rate: 60-220 bpm
- Cadence: 120-220 spm
- Pace: 3:00-15:00 per km

### 2. Analyzer Tests (`unit/analyzer.test.js`)

Tests performance analysis algorithms:
- ✅ Pace analysis (average, splits, variability)
- ✅ Heart rate analysis (zones, drift, HRR)
- ✅ Cadence analysis
- ✅ VO2max estimation
- ✅ Performance metrics

**Key Algorithms**:
- Cooper VO2max formula
- Jack Daniels VDOT
- Karvonen heart rate formula

### 3. Recommender Tests (`unit/recommender.test.js`)

Tests training recommendation engine:
- ✅ Recommendation generation
- ✅ Confidence scoring
- ✅ Research validation
- ✅ Personalization
- ✅ Training plan creation

**Critical Validations**:
- NO unrealistic pace recommendations (e.g., 9:15 runner → 4:30 workouts)
- Evidence-based recommendations >80% confidence
- Urban legends flagged with <40% confidence
- Realistic improvement: 5-10% per 12-week cycle

### 4. Integration Tests (`integration/e2e-flow.test.js`)

Tests complete user flow:
- ✅ File upload → parse → analyze → recommend
- ✅ API endpoints
- ✅ Data persistence
- ✅ Error handling
- ✅ Performance

### 5. Validation Tests (`validation/recommendation-accuracy.test.js`)

Validates against sports science research:
- ✅ Training pace formulas (Jack Daniels)
- ✅ Heart rate zones (Karvonen)
- ✅ Training volume (10% rule)
- ✅ Recovery times
- ✅ Improvement timelines
- ✅ VO2max estimation

## Custom Matchers

### `toBeWithinRange(floor, ceiling)`
```javascript
expect(value).toBeWithinRange(60, 220);
```

### `toBeValidPace()`
```javascript
expect('9:15').toBeValidPace(); // MM:SS format
```

### `toBeRealisticHeartRate()`
```javascript
expect(175).toBeRealisticHeartRate(); // 60-220 bpm
```

## Test Helpers

### `paceToSeconds(pace)`
```javascript
const seconds = global.testHelpers.paceToSeconds('9:15'); // 555 seconds
```

### `secondsToPace(seconds)`
```javascript
const pace = global.testHelpers.secondsToPace(555); // '9:15'
```

### `calculateHRZones(maxHR, restingHR)`
```javascript
const zones = global.testHelpers.calculateHRZones(185, 65);
// Returns: { zone1: {...}, zone2: {...}, ... zone5: {...} }
```

### `isRealisticImprovement(currentPace, recommendedPace)`
```javascript
const realistic = global.testHelpers.isRealisticImprovement('9:15', '8:45'); // true
const unrealistic = global.testHelpers.isRealisticImprovement('9:15', '4:30'); // false
```

## Test Data Fixtures

### Beginner Runner
- **Pace**: 9:15/km (28:43 for 5K)
- **Heart Rate**: Max 185, Avg 172
- **Cadence**: 165 spm
- **VO2max**: 42

### Advanced Runner
- **Pace**: 4:30/km (22:30 for 5K)
- **Heart Rate**: Max 189, Avg 175
- **Cadence**: 188 spm
- **VO2max**: 58

### Corrupted Data
- Missing critical fields
- Invalid values
- Malformed structure

## Evidence-Based Standards

All recommendations must align with:

### Training Paces (Jack Daniels)
- **Easy**: Race pace + 60-90 seconds
- **Tempo**: Race pace + 20-30 seconds
- **Interval**: Race pace ± 10 seconds
- **Repetition**: Race pace - 30-40 seconds

### Heart Rate Zones (Karvonen)
- **Zone 1**: 50-60% HRR
- **Zone 2**: 60-70% HRR (Easy runs)
- **Zone 3**: 70-80% HRR (Tempo)
- **Zone 4**: 80-90% HRR (Threshold)
- **Zone 5**: 90-100% HRR (VO2max)

### Training Volume
- **10% Rule**: Max 10% weekly increase
- **80/20 Principle**: 80% easy, 20% hard
- **Long Run**: 20-30% of weekly mileage

### Recovery
- **Between Hard Workouts**: 48-72 hours
- **Interval Recovery**: 1:1 to 1:3 work:rest ratio

## Confidence Scoring Guidelines

| Confidence | Evidence Quality | Examples |
|------------|-----------------|----------|
| >80% | Meta-analysis, multiple RCTs | Progressive overload, interval training |
| 60-80% | Single RCT, strong cohort studies | Specific training protocols |
| 40-60% | Observational, expert consensus | Some recovery methods |
| <40% | Anecdotal, conflicting evidence | Urban legends, unproven claims |

## Critical Test Cases

### 1. Realistic Recommendations Test
```javascript
test('should not recommend unrealistic pace improvements', () => {
  const currentPace = '9:15'; // Beginner
  const unrealisticPace = '4:30'; // Elite

  const isRealistic = global.testHelpers.isRealisticImprovement(currentPace, unrealisticPace);
  expect(isRealistic).toBe(false);
});
```

### 2. Evidence-Based Confidence Test
```javascript
test('should assign high confidence to evidence-based recommendations', () => {
  const recommendation = {
    type: 'interval_training',
    researchBacked: true,
    sources: ['Daniels Running Formula', 'Lydiard Training']
  };

  const confidence = recommender.calculateConfidence(recommendation);
  expect(confidence).toBeGreaterThan(0.8);
});
```

### 3. Urban Legend Detection Test
```javascript
test('should flag urban legends with low confidence', () => {
  const recommendation = {
    type: 'ice_bath',
    researchBacked: false,
    sources: []
  };

  const confidence = recommender.calculateConfidence(recommendation);
  expect(confidence).toBeLessThan(0.4);
});
```

## Coverage Reports

Coverage reports are generated in `coverage/` directory:
- **HTML Report**: `coverage/lcov-report/index.html`
- **JSON Report**: `coverage/coverage-final.json`
- **Text Summary**: Printed to console

### Coverage Thresholds
```javascript
{
  "branches": 75,
  "functions": 80,
  "lines": 80,
  "statements": 80
}
```

## Best Practices

1. **Test First**: Write tests before implementation (TDD)
2. **Descriptive Names**: Test names should explain what and why
3. **Arrange-Act-Assert**: Structure tests clearly
4. **One Assertion Focus**: Each test validates one behavior
5. **Use Fixtures**: Consistent test data
6. **Mock External Dependencies**: Keep tests isolated
7. **Test Edge Cases**: Validate error handling
8. **Document Assumptions**: Explain why tests expect certain values

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests
- Main branch merges
- Scheduled daily runs

### CI Commands
```bash
npm run test:ci        # Run all tests with coverage
npm run lint          # Check code style
npm run typecheck     # Type checking
```

## Troubleshooting

### Tests Failing
1. Check test setup in `tests/setup.js`
2. Verify fixtures are valid
3. Ensure dependencies are installed: `npm install`
4. Clear Jest cache: `npm test -- --clearCache`

### Coverage Below Threshold
1. Identify uncovered files: `npm test -- --coverage --verbose`
2. Add missing unit tests
3. Review edge cases

### Slow Tests
1. Use `jest.setTimeout()` for long-running tests
2. Mock external API calls
3. Use test database for integration tests

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure >80% coverage
3. Validate against sports science research
4. Document test cases in this README
5. Add test fixtures if needed

## Research References

- **Jack Daniels** - Daniels' Running Formula
- **Pete Pfitzinger** - Advanced Marathoning
- **Arthur Lydiard** - Lydiard Training System
- **Joe Friel** - The Triathlete's Training Bible
- **Matt Fitzgerald** - 80/20 Running

## Contact

For questions about the test suite:
- Review test documentation
- Check test comments for explanations
- Refer to sports science references

---

**Remember**: Tests are the safety net. Good tests enable confident refactoring and prevent regressions.
