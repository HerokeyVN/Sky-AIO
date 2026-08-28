# Measuring Height Tool – notes on calculations

This file documents how the QR Height tool derives its numbers. All logic lives in `viewmodel/measuringHeight.ts`, `viewmodel/heightMath.ts`, and `viewmodel/qrDecoder.ts`.

## Data flow (inputs → outputs)
1. **Input**: a QR payload provides two raw numbers: `scale` and `height` (decoded in `qrDecoder.ts`).
2. **State**: the tool stores them as `comparisonScale` and `bodyHeightDelta` (both editable in the UI).
3. **Snapshot**: `computeHeightSnapshot(scale, heightMod)` derives:
   - `factor` (final scale factor)
   - `sizeType` (bucketed body size)
   - `displaySizeType` (size number displayed in the UI)
   - `baseHeight` (meters, before applying factor)
   - `height` (final meters)
   - `heightDelta` (final - base)

## Formula details
Constants (dual coefficient sets, chosen by `heightMod` sign):
```
ratioCoefficients (heightMod >= 0)
   A = 1.066904821
   B = 0.005692821
   C = 0.492501207
   D = 0.003192728

ratioCoefficients2 (heightMod < 0)
   A = 1.224206561
   B = 0.012636310
   C = 0.495569563
   D = 0.004517799

SKY_REFERENCE_HEIGHT_M = 1
SHORTEST_HEIGHT_M = 0.8
TALLEST_HEIGHT_M = 1.2
SIZE_TYPE_MIN = 1
SIZE_TYPE_MAX = 14
OLD_RAW_MIN = -2
OLD_RAW_MAX = 2
OLD_SCALE_BUCKETS = 13.5
RATIO_PER_STEP = (TALLEST_HEIGHT_M / SHORTEST_HEIGHT_M) ^ (1 / (SIZE_TYPE_MAX - 1))
```

The coefficients `A`, `B`, `C`, and `D` are regression results from a manually
collected dataset. Each sample was measured from an in-game screenshot and
recorded with its corresponding `scale` and `heightMod` values.

The dataset is fitted as two separate regions: `heightMod >= 0` and
`heightMod < 0`. Testing showed that coefficients fitted from the positive
region cannot be reliably applied to the negative region, and vice versa;
cross-applying either set introduces a noticeable height deviation. The model
therefore selects the coefficient set according to the sign of `heightMod`.

Steps:
1) **Scale component**
```
scaleComponent(s) = s >= 0 ? (1 + s) : 1 / (1 - s)
```

2) **Predicted ratio**
```
H = heightMod * 10            // amplify heightMod for the model
S = scaleComponent(scale)
coeffs = heightMod < 0 ? ratioCoefficients2 : ratioCoefficients
ratio = A + B*H + C*S + D*(H*S)   // A,B,C,D from coeffs
```

3) **Final scale factor**
```
baseRatio = ratio when scale=0, heightMod=0, using the same coeff set as the input heightMod
factor = ratio / baseRatio
referenceHeight = SKY_REFERENCE_HEIGHT_M * factor
```

4) **Size type bucketing**
```
raw = clamp(10 * (referenceHeight - 1), OLD_RAW_MIN, OLD_RAW_MAX)
scalar = (raw + 2) / 4
oldValue = floor((1 - scalar) * OLD_SCALE_BUCKETS)
sizeType = clamp(round(oldValue + 1), SIZE_TYPE_MIN, SIZE_TYPE_MAX) - 1
```
`sizeType` is an index-like value (0–13) used to pick a base height.

5) **Base height from size type**
```
stepsFromShortest = SIZE_TYPE_MAX - sizeType
baseHeight = SHORTEST_HEIGHT_M * (RATIO_PER_STEP ^ stepsFromShortest)
```

6) **Final height**
```
height = baseHeight * factor
heightDelta = height - baseHeight
```

7) **Displayed size type**
```
hCurve = -0.0652 * heightMod^2 + 3.0729 * heightMod + 35.4599
scaleFactor = (0.126 * scale + 0.7) / 0.7
displaySizeType = 42.7508 - hCurve * scaleFactor
```

The UI displays `displaySizeType` rounded to two decimal places. This value is
independent of the bucketed `sizeType` used by the meter-height calculation.

The displayed-size model is based on the community research article
[光遇身高机制解析](https://www.bilibili.com/opus/574075082663246054) by 小骄宝.
The article derives the scale coefficient `0.126 * scale + 0.7` and proposes the
general model `height = f(scale = 0, heightMod) * (0.126 * scale + 0.7) / 0.7`.
It is an empirical community model, not an official formula published by the
game developer.

`formatMeters` renders `height` with a fixed precision and `m` suffix.
