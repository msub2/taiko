// node_modules/osu-classes/lib/esm/index.js
var ControlPoint = class {
  constructor(group) {
    this.group = group || null;
  }
  attachGroup(group) {
    this.group = group;
  }
  dettachGroup() {
    this.group = null;
  }
  get startTime() {
    if (this.group) {
      return this.group.startTime;
    }
    return 0;
  }
};
var ControlPointGroup = class {
  constructor(time) {
    this.controlPoints = [];
    this.startTime = time;
  }
  add(point) {
    const existing = this.controlPoints.find((p) => {
      return p.pointType === point.pointType;
    });
    if (existing) {
      this.remove(existing);
    }
    point.attachGroup(this);
    this.controlPoints.push(point);
  }
  remove(point) {
    const index = this.controlPoints.findIndex((p) => {
      return p.pointType === point.pointType;
    });
    if (index !== -1) {
      this.controlPoints.splice(index, 1);
      point.dettachGroup();
    }
  }
};
var BinarySearch = class {
  static findNumber(arr, x) {
    let start = 0, mid, end = arr.length - 1;
    while (start <= end) {
      mid = start + (end - start >> 1);
      if (arr[mid] === x) {
        return mid;
      }
      if (arr[mid] < x) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }
    return ~start;
  }
  static findControlPointIndex(arr, time) {
    if (!arr.length) {
      return -1;
    }
    if (time < arr[0].startTime) {
      return -1;
    }
    if (time >= arr[arr.length - 1].startTime) {
      return arr.length - 1;
    }
    let l = 0;
    let r = arr.length - 2;
    while (l <= r) {
      const pivot = l + (r - l >> 1);
      if (arr[pivot].startTime < time) {
        l = pivot + 1;
      } else if (arr[pivot].startTime > time) {
        r = pivot - 1;
      } else {
        return pivot;
      }
    }
    return l - 1;
  }
  static findControlPoint(arr, time) {
    const index = this.findControlPointIndex(arr, time);
    if (index === -1) {
      return null;
    }
    return arr[index];
  }
};
var Colour = class {
  constructor(red, green, blue) {
    this.red = red || 0;
    this.green = green || 0;
    this.blue = blue || 0;
  }
  get hex() {
    return "#" + this.red.toString(16).padStart(2, "0") + this.green.toString(16).padStart(2, "0") + this.blue.toString(16).padStart(2, "0");
  }
  equals(colour) {
    return this.red === colour.red && this.green === colour.green && this.blue === colour.blue;
  }
  clone() {
    return new Colour(this.red, this.green, this.blue);
  }
  toString() {
    return `${this.red},${this.green},${this.blue}`;
  }
};
var FastRandom = class {
  constructor(seed) {
    this._y = 842502087 >>> 0;
    this._z = 3579807591 >>> 0;
    this._w = 273326509 >>> 0;
    this._x = 0;
    this._bitBuffer = 0;
    this._bitIndex = 32;
    this._x = seed;
  }
  _next() {
    const t = (this._x ^ this._x << 11 >>> 0) >>> 0;
    this._x = this._y >>> 0;
    this._y = this._z >>> 0;
    this._z = this._w >>> 0;
    this._w = (this._w ^ this._w >>> 19) >>> 0;
    this._w = (this._w ^ t) >>> 0;
    this._w = (this._w ^ t >>> 8) >>> 0;
    return this._w;
  }
  next() {
    return (FastRandom.INT_MASK & this._next()) >> 0;
  }
  nextUInt(lowerBound = 0, upperBound = FastRandom.MAX_INT32) {
    if (lowerBound === 0 && upperBound === FastRandom.MAX_INT32) {
      return this._next();
    }
    return lowerBound + this.nextDouble() * (upperBound - lowerBound) >>> 0;
  }
  nextInt(lowerBound = 0, upperBound = FastRandom.MAX_INT32) {
    return lowerBound + this.nextDouble() * (upperBound - lowerBound) >> 0;
  }
  nextDouble() {
    return FastRandom.INT_TO_REAL * this.next();
  }
  nextBool() {
    if (this._bitIndex === 32) {
      this._bitBuffer = this.nextUInt();
      this._bitIndex = 1;
      return (this._bitBuffer & 1) === 1;
    }
    this._bitIndex = this._bitIndex + 1 >> 0;
    return ((this._bitBuffer >>= 1) & 1) === 1;
  }
};
FastRandom.MAX_INT32 = 2147483647;
FastRandom.MAX_UINT32 = 4294967295;
FastRandom.INT_MASK = 2147483647 >> 0;
FastRandom.INT_TO_REAL = 1 / (FastRandom.MAX_INT32 + 1);
var Interpolation = class {
  static barycentricWeights(points) {
    const n = points.length;
    const w = [];
    for (let i = 0; i < n; i++) {
      w[i] = 1;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          w[i] *= points[i].x - points[j].x;
        }
      }
      w[i] = 1 / w[i];
    }
    return w;
  }
  static barycentricLagrange(points, weights, time) {
    if (points === null || points.length === 0) {
      throw new Error("points must contain at least one point");
    }
    if (points.length !== weights.length) {
      throw new Error("points must contain exactly as many items as weights");
    }
    let numerator = 0;
    let denominator = 0;
    for (let i = 0, len = points.length; i < len; ++i) {
      if (time === points[i].x) {
        return points[i].y;
      }
      const li = weights[i] / (time - points[i].x);
      numerator += li * points[i].y;
      denominator += li;
    }
    return numerator / denominator;
  }
};
var RoundHelper = class {
  static round(x, mode = 1) {
    return mode ? this.roundToEven(x) : this.roundAwayFromZero(x);
  }
  static roundToEven(x) {
    return this.isAtMidPoint(x) ? 2 * Math.round(x / 2) : Math.round(x);
  }
  static roundAwayFromZero(x) {
    return this.isAtMidPoint(x) ? x > 0 ? Math.ceil(x) : Math.floor(x) : Math.round(x);
  }
  static isAtMidPoint(x) {
    return Math.abs(0.5 - Math.abs(x - (x >> 0))) <= this.PRECISION_ERROR;
  }
};
RoundHelper.PRECISION_ERROR = 1e-15;
var SortHelper = class {
  static depthSort(keys, comparerFn) {
    if (!keys || keys.length === 0) {
      return keys;
    }
    comparerFn !== null && comparerFn !== void 0 ? comparerFn : comparerFn = this.defaultCompare;
    this._depthLimitedQuickSort(keys, 0, keys.length - 1, comparerFn, this._QUICK_SORT_DEPTH_THRESHOLD);
    return keys;
  }
  static introSort(keys, comparerFn) {
    if (!keys || keys.length < 2) {
      return keys;
    }
    comparerFn !== null && comparerFn !== void 0 ? comparerFn : comparerFn = this.defaultCompare;
    this._introSort(keys, 0, keys.length - 1, comparerFn, 2 * this._floorLog2(keys.length));
    return keys;
  }
  static _depthLimitedQuickSort(keys, left, right, comparerFn, depthLimit) {
    do {
      if (depthLimit === 0) {
        return this._heapsort(keys, left, right, comparerFn);
      }
      let i = left;
      let j = right;
      const middle = i + (j - i >> 1);
      this._swapIfGreater(keys, comparerFn, i, middle);
      this._swapIfGreater(keys, comparerFn, i, j);
      this._swapIfGreater(keys, comparerFn, middle, j);
      const x = keys[middle];
      do {
        while (comparerFn(keys[i], x) < 0) {
          i++;
        }
        while (comparerFn(x, keys[j]) < 0) {
          j--;
        }
        if (i > j) {
          break;
        }
        if (i < j) {
          [keys[i], keys[j]] = [keys[j], keys[i]];
        }
        i++;
        j--;
      } while (i <= j);
      depthLimit--;
      if (j - left <= right - i) {
        if (left < j) {
          this._depthLimitedQuickSort(keys, left, j, comparerFn, depthLimit);
        }
        left = i;
        continue;
      }
      if (i < right) {
        this._depthLimitedQuickSort(keys, i, right, comparerFn, depthLimit);
      }
      right = j;
    } while (left < right);
  }
  static _introSort(keys, left, right, comparerFn, depthLimit) {
    while (right > left) {
      const partitionSize = right - left + 1;
      if (partitionSize <= this._INTRO_SORT_SIZE_THRESHOLD) {
        if (partitionSize === 1) {
          return;
        }
        if (partitionSize === 2) {
          this._swapIfGreater(keys, comparerFn, left, right);
          return;
        }
        if (partitionSize === 3) {
          this._swapIfGreater(keys, comparerFn, left, right - 1);
          this._swapIfGreater(keys, comparerFn, left, right);
          this._swapIfGreater(keys, comparerFn, right - 1, right);
          return;
        }
        this._insertionSort(keys, left, right, comparerFn);
        return;
      }
      if (depthLimit === 0) {
        this._heapsort(keys, left, right, comparerFn);
        return;
      }
      depthLimit--;
      const p = this._pickPivotAndPartition(keys, left, right, comparerFn);
      this._introSort(keys, p + 1, right, comparerFn, depthLimit);
      right = p - 1;
    }
  }
  static _insertionSort(keys, lo, hi, comparerFn) {
    for (let i = lo; i < hi; ++i) {
      let j = i;
      const t = keys[i + 1];
      while (j >= lo && comparerFn(t, keys[j]) < 0) {
        keys[j + 1] = keys[j];
        j--;
      }
      keys[j + 1] = t;
    }
  }
  static _pickPivotAndPartition(keys, lo, hi, comparerFn) {
    const middle = lo + (hi - lo) / 2 >> 0;
    this._swapIfGreater(keys, comparerFn, lo, middle);
    this._swapIfGreater(keys, comparerFn, lo, hi);
    this._swapIfGreater(keys, comparerFn, middle, hi);
    const pivot = keys[middle];
    this._swap(keys, middle, hi - 1);
    let left = lo;
    let right = hi - 1;
    while (left < right) {
      while (comparerFn(keys[++left], pivot) < 0)
        ;
      while (comparerFn(pivot, keys[--right]) < 0)
        ;
      if (left >= right) {
        break;
      }
      this._swap(keys, left, right);
    }
    this._swap(keys, left, hi - 1);
    return left;
  }
  static _heapsort(keys, lo, hi, comparerFn) {
    const n = hi - lo + 1;
    for (let i = n / 2; i >= 1; --i) {
      this._downHeap(keys, i, n, lo, comparerFn);
    }
    for (let i = n; i > 1; --i) {
      this._swap(keys, lo, lo + i - 1);
      this._downHeap(keys, 1, i - 1, lo, comparerFn);
    }
  }
  static _downHeap(keys, i, n, lo, comparerFn) {
    const d = keys[lo + i - 1];
    while (i <= n / 2) {
      let child = 2 * i;
      if (child < n && comparerFn(keys[lo + child - 1], keys[lo + child]) < 0) {
        child++;
      }
      if (comparerFn(d, keys[lo + child - 1]) >= 0) {
        break;
      }
      keys[lo + i - 1] = keys[lo + child - 1];
      i = child;
    }
    keys[lo + i - 1] = d;
  }
  static _swap(keys, i, j) {
    if (i !== j) {
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
  }
  static _swapIfGreater(keys, comparerFn, a, b) {
    if (a !== b && comparerFn(keys[a], keys[b]) > 0) {
      [keys[a], keys[b]] = [keys[b], keys[a]];
    }
  }
  static _floorLog2(n) {
    let result = 0;
    while (n >= 1) {
      result++;
      n /= 2;
    }
    return result;
  }
};
SortHelper._QUICK_SORT_DEPTH_THRESHOLD = 32;
SortHelper._INTRO_SORT_SIZE_THRESHOLD = 16;
SortHelper.defaultCompare = (x, y) => {
  if (x === void 0 && y === void 0) {
    return 0;
  }
  if (x === void 0) {
    return 1;
  }
  if (y === void 0) {
    return -1;
  }
  const xString = SortHelper.toString(x);
  const yString = SortHelper.toString(y);
  if (xString < yString) {
    return -1;
  }
  if (xString > yString) {
    return 1;
  }
  return 0;
};
SortHelper.toString = (obj) => {
  if (obj === null) {
    return "null";
  }
  if (typeof obj === "boolean" || typeof obj === "number") {
    return obj.toString();
  }
  if (typeof obj === "string") {
    return obj;
  }
  if (typeof obj === "symbol") {
    throw new TypeError();
  }
  return JSON.stringify(obj);
};
var Vector2 = class {
  constructor(x, y) {
    this.x = x;
    this.y = isFinite(y) ? y : x;
  }
  get floatX() {
    return Math.fround(this.x);
  }
  get floatY() {
    return Math.fround(this.y);
  }
  add(vec) {
    return new Vector2(this.x + vec.x, this.y + vec.y);
  }
  fadd(vec) {
    return new Vector2(this.floatX + vec.floatX, this.floatY + vec.floatY);
  }
  subtract(vec) {
    return new Vector2(this.x - vec.x, this.y - vec.y);
  }
  fsubtract(vec) {
    return new Vector2(this.floatX - vec.floatX, this.floatY - vec.floatY);
  }
  scale(multiplier) {
    return new Vector2(this.x * multiplier, this.y * multiplier);
  }
  fscale(multiplier) {
    const floatMultiplier = Math.fround(multiplier);
    return new Vector2(this.floatX * floatMultiplier, this.floatY * floatMultiplier);
  }
  divide(divisor) {
    return new Vector2(this.x / divisor, this.y / divisor);
  }
  fdivide(divisor) {
    const floatDivisor = Math.fround(divisor);
    return new Vector2(this.floatX / floatDivisor, this.floatY / floatDivisor);
  }
  dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }
  fdot(vec) {
    return this.floatX * vec.floatX + this.floatY * vec.floatY;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  flength() {
    return Math.fround(Math.sqrt(this.floatX * this.floatX + this.floatY * this.floatY));
  }
  distance(vec) {
    const x = this.x - vec.x;
    const y = this.y - vec.y;
    return Math.sqrt(x * x + y * y);
  }
  fdistance(vec) {
    const x = this.floatX - vec.floatX;
    const y = this.floatY - vec.floatY;
    return Math.fround(Math.sqrt(x * x + y * y));
  }
  normalize() {
    const scale = 1 / this.length();
    return new Vector2(this.x * scale, this.y * scale);
  }
  fnormalize() {
    const scale = Math.fround(1 / this.flength());
    return new Vector2(this.floatX * scale, this.floatY * scale);
  }
  equals(vec) {
    return this.x === vec.x && this.y === vec.y;
  }
  clone() {
    return new Vector2(this.x, this.y);
  }
  toString() {
    return `${this.x},${this.y}`;
  }
};
var ControlPointType;
(function(ControlPointType2) {
  ControlPointType2[ControlPointType2["TimingPoint"] = 0] = "TimingPoint";
  ControlPointType2[ControlPointType2["DifficultyPoint"] = 1] = "DifficultyPoint";
  ControlPointType2[ControlPointType2["EffectPoint"] = 2] = "EffectPoint";
  ControlPointType2[ControlPointType2["SamplePoint"] = 3] = "SamplePoint";
})(ControlPointType || (ControlPointType = {}));
var DifficultyPoint = class extends ControlPoint {
  constructor() {
    super(...arguments);
    this.pointType = ControlPointType.DifficultyPoint;
    this._speedMultiplier = 1;
    this.bpmMultiplier = 1;
  }
  get speedMultiplier() {
    return Math.max(0.1, Math.min(this._speedMultiplier, 10));
  }
  set speedMultiplier(value) {
    this._speedMultiplier = value;
  }
  isRedundant(existing) {
    return existing !== null && existing.speedMultiplier === this.speedMultiplier;
  }
};
DifficultyPoint.default = new DifficultyPoint();
var EffectPoint = class extends ControlPoint {
  constructor() {
    super(...arguments);
    this.pointType = ControlPointType.EffectPoint;
    this.kiai = false;
    this.omitFirstBarLine = false;
    this._scrollSpeed = 1;
  }
  get scrollSpeed() {
    return Math.max(0.1, Math.min(this._scrollSpeed, 10));
  }
  set scrollSpeed(value) {
    this._scrollSpeed = value;
  }
  isRedundant(existing) {
    return !this.omitFirstBarLine && existing !== null && this.kiai === existing.kiai && this.omitFirstBarLine === existing.omitFirstBarLine && this.scrollSpeed === existing.scrollSpeed;
  }
};
EffectPoint.default = new EffectPoint();
var SampleSet;
(function(SampleSet2) {
  SampleSet2[SampleSet2["None"] = 0] = "None";
  SampleSet2[SampleSet2["Normal"] = 1] = "Normal";
  SampleSet2[SampleSet2["Soft"] = 2] = "Soft";
  SampleSet2[SampleSet2["Drum"] = 3] = "Drum";
})(SampleSet || (SampleSet = {}));
var SamplePoint = class extends ControlPoint {
  constructor() {
    super(...arguments);
    this.pointType = ControlPointType.SamplePoint;
    this.sampleSet = SampleSet[SampleSet.Normal];
    this.customIndex = 0;
    this.volume = 100;
  }
  isRedundant(existing) {
    return existing !== null && this.volume === existing.volume && this.customIndex === existing.customIndex && this.sampleSet === existing.sampleSet;
  }
};
SamplePoint.default = new SamplePoint();
var TimeSignature;
(function(TimeSignature2) {
  TimeSignature2[TimeSignature2["SimpleTriple"] = 3] = "SimpleTriple";
  TimeSignature2[TimeSignature2["SimpleQuadruple"] = 4] = "SimpleQuadruple";
})(TimeSignature || (TimeSignature = {}));
var TimingPoint = class extends ControlPoint {
  constructor() {
    super(...arguments);
    this.pointType = ControlPointType.TimingPoint;
    this._beatLength = 1e3;
    this.timeSignature = TimeSignature.SimpleQuadruple;
  }
  get beatLength() {
    return Math.max(6, Math.min(this._beatLength, 6e4));
  }
  set beatLength(value) {
    this._beatLength = value;
  }
  get bpm() {
    return 6e4 / this.beatLength;
  }
  isRedundant() {
    return false;
  }
};
TimingPoint.default = new TimingPoint();
var ControlPointInfo = class {
  constructor() {
    this.groups = [];
    this.difficultyPoints = [];
    this.effectPoints = [];
    this.samplePoints = [];
    this.timingPoints = [];
  }
  get allPoints() {
    const points = [];
    this.groups.forEach((g) => points.push(...g.controlPoints));
    return points;
  }
  groupAt(time) {
    let group = this.groups.find((g) => g.startTime === time);
    if (!group) {
      group = new ControlPointGroup(time);
      this.groups.push(group);
      this.groups.sort((a, b) => a.startTime - b.startTime);
    }
    return group;
  }
  difficultyPointAt(time) {
    const point = BinarySearch.findControlPoint(this.difficultyPoints, time);
    const fallback = DifficultyPoint.default;
    return point || fallback;
  }
  effectPointAt(time) {
    const point = BinarySearch.findControlPoint(this.effectPoints, time);
    const fallback = EffectPoint.default;
    return point || fallback;
  }
  samplePointAt(time) {
    const point = BinarySearch.findControlPoint(this.samplePoints, time);
    const fallback = SamplePoint.default;
    return point || fallback;
  }
  timingPointAt(time) {
    const point = BinarySearch.findControlPoint(this.timingPoints, time);
    const fallback = this.timingPoints[0] || TimingPoint.default;
    return point || fallback;
  }
  add(point, time) {
    if (this.checkAlreadyExisting(time, point)) {
      return false;
    }
    const list = this.getCurrentList(point);
    const index = BinarySearch.findControlPointIndex(list, time);
    list.splice(index + 1, 0, point);
    this.groupAt(time).add(point);
    return true;
  }
  getCurrentList(newPoint) {
    switch (newPoint.pointType) {
      case ControlPointType.DifficultyPoint:
        return this.difficultyPoints;
      case ControlPointType.EffectPoint:
        return this.effectPoints;
      case ControlPointType.SamplePoint:
        return this.samplePoints;
      case ControlPointType.TimingPoint:
        return this.timingPoints;
    }
    throw new TypeError(`Unknown control point type: ${newPoint.pointType}!`);
  }
  checkAlreadyExisting(time, newPoint) {
    let existing = null;
    switch (newPoint.pointType) {
      case ControlPointType.DifficultyPoint:
        existing = this.difficultyPointAt(time);
        break;
      case ControlPointType.EffectPoint:
        existing = this.effectPointAt(time);
        break;
      case ControlPointType.SamplePoint:
        existing = BinarySearch.findControlPoint(this.samplePoints, time);
        break;
      case ControlPointType.TimingPoint:
        existing = BinarySearch.findControlPoint(this.timingPoints, time);
    }
    return newPoint === null || newPoint === void 0 ? void 0 : newPoint.isRedundant(existing);
  }
  remove(point, time) {
    let list;
    switch (point.pointType) {
      case ControlPointType.DifficultyPoint:
        list = this.difficultyPoints;
        break;
      case ControlPointType.EffectPoint:
        list = this.effectPoints;
        break;
      case ControlPointType.SamplePoint:
        list = this.samplePoints;
        break;
      default:
        list = this.timingPoints;
    }
    const index = list.findIndex((p) => {
      return p.startTime === point.startTime;
    });
    if (index === -1) {
      return false;
    }
    list.splice(index, 1);
    this.groupAt(time).remove(point);
    return true;
  }
  clear() {
    this.groups.length = 0;
    this.difficultyPoints.length = 0;
    this.effectPoints.length = 0;
    this.samplePoints.length = 0;
    this.timingPoints.length = 0;
  }
  clone() {
    const cloned = new ControlPointInfo();
    cloned.groups = this.groups;
    cloned.difficultyPoints = this.difficultyPoints;
    cloned.effectPoints = this.effectPoints;
    cloned.samplePoints = this.samplePoints;
    cloned.timingPoints = this.timingPoints;
    return cloned;
  }
};
var EffectType;
(function(EffectType2) {
  EffectType2[EffectType2["None"] = 0] = "None";
  EffectType2[EffectType2["Kiai"] = 1] = "Kiai";
  EffectType2[EffectType2["OmitFirstBarLine"] = 8] = "OmitFirstBarLine";
})(EffectType || (EffectType = {}));
var BeatmapBreakEvent = class {
  constructor(startTime, endTime) {
    this.startTime = startTime;
    this.endTime = endTime;
  }
  get duration() {
    return this.endTime - this.startTime;
  }
  get hasEffect() {
    return this.duration >= 650;
  }
  contains(time) {
    return this.startTime <= time && time <= this.endTime;
  }
};
var BeatmapGeneralSection = class {
  constructor() {
    this.audioFilename = "";
    this.overlayPosition = "NoChange";
    this.skinPreference = "";
    this.audioLeadIn = 0;
    this.previewTime = -1;
    this.countdown = 1;
    this.stackLeniency = 0.7;
    this.countdownOffset = 0;
    this.sampleSet = SampleSet.Normal;
    this.letterboxInBreaks = false;
    this.useSkinSprites = false;
    this.epilepsyWarning = false;
    this.specialStyle = false;
    this.widescreenStoryboard = false;
    this.samplesMatchPlaybackRate = false;
  }
  clone() {
    const cloned = new BeatmapGeneralSection();
    cloned.audioFilename = this.audioFilename;
    if (this.audioHash) {
      cloned.audioHash = this.audioHash;
    }
    cloned.overlayPosition = this.overlayPosition;
    cloned.skinPreference = this.skinPreference;
    cloned.audioLeadIn = this.audioLeadIn;
    cloned.previewTime = this.previewTime;
    cloned.countdown = this.countdown;
    cloned.stackLeniency = this.stackLeniency;
    cloned.countdownOffset = this.countdownOffset;
    cloned.sampleSet = this.sampleSet;
    cloned.letterboxInBreaks = this.letterboxInBreaks;
    if (this.storyFireInFront) {
      cloned.storyFireInFront = this.storyFireInFront;
    }
    cloned.useSkinSprites = this.useSkinSprites;
    if (this.alwaysShowPlayfield) {
      cloned.alwaysShowPlayfield = this.alwaysShowPlayfield;
    }
    cloned.epilepsyWarning = this.epilepsyWarning;
    cloned.specialStyle = this.specialStyle;
    cloned.widescreenStoryboard = this.widescreenStoryboard;
    cloned.samplesMatchPlaybackRate = this.samplesMatchPlaybackRate;
    return cloned;
  }
};
var BeatmapEditorSection = class {
  constructor() {
    this.bookmarks = [];
    this.distanceSpacing = 1;
    this.beatDivisor = 4;
    this.gridSize = 1;
    this.timelineZoom = 2;
  }
  clone() {
    const cloned = new BeatmapEditorSection();
    cloned.bookmarks = this.bookmarks.slice();
    cloned.distanceSpacing = this.distanceSpacing;
    cloned.beatDivisor = this.beatDivisor;
    cloned.gridSize = this.gridSize;
    cloned.timelineZoom = this.timelineZoom;
    return cloned;
  }
};
var BeatmapDifficultySection = class {
  constructor() {
    this._CS = BeatmapDifficultySection.BASE_DIFFICULTY;
    this._HP = BeatmapDifficultySection.BASE_DIFFICULTY;
    this._OD = BeatmapDifficultySection.BASE_DIFFICULTY;
    this._multiplier = 1;
    this._tickRate = 1;
    this._rate = 1;
  }
  get circleSize() {
    return Math.fround(this._CS);
  }
  set circleSize(value) {
    this._CS = value;
  }
  get drainRate() {
    return Math.fround(this._HP);
  }
  set drainRate(value) {
    this._HP = value;
  }
  get overallDifficulty() {
    return Math.fround(this._OD);
  }
  set overallDifficulty(value) {
    this._OD = value;
  }
  get approachRate() {
    let _a3;
    return Math.fround((_a3 = this._AR) !== null && _a3 !== void 0 ? _a3 : this._OD);
  }
  set approachRate(value) {
    this._AR = value;
  }
  get sliderMultiplier() {
    return this._multiplier;
  }
  set sliderMultiplier(value) {
    this._multiplier = value;
  }
  get sliderTickRate() {
    return this._tickRate;
  }
  set sliderTickRate(value) {
    this._tickRate = value;
  }
  get clockRate() {
    return this._rate;
  }
  set clockRate(value) {
    this._rate = value;
  }
  clone() {
    const cloned = new BeatmapDifficultySection();
    cloned.circleSize = this._CS;
    cloned.drainRate = this._HP;
    cloned.overallDifficulty = this._OD;
    if (this._AR) {
      cloned.approachRate = this._AR;
    }
    cloned.sliderMultiplier = this._multiplier;
    cloned.sliderTickRate = this._tickRate;
    cloned.clockRate = this._rate;
    return cloned;
  }
  static range(diff, min, mid, max2) {
    if (diff > 5) {
      return mid + (max2 - mid) * (diff - 5) / 5;
    }
    if (diff < 5) {
      return mid - (mid - min) * (5 - diff) / 5;
    }
    return mid;
  }
};
BeatmapDifficultySection.BASE_DIFFICULTY = 5;
var BeatmapMetadataSection = class {
  constructor() {
    this.title = "Unknown Title";
    this.artist = "Unknown Artist";
    this.creator = "Unknown Creator";
    this.version = "Normal";
    this.source = "";
    this.tags = [];
    this.beatmapId = 0;
    this.beatmapSetId = 0;
    this._titleUnicode = "Unknown Title";
    this._artistUnicode = "Unknown Artist";
  }
  get titleUnicode() {
    return this._titleUnicode !== "Unknown Title" ? this._titleUnicode : this.title;
  }
  set titleUnicode(value) {
    this._titleUnicode = value;
  }
  get artistUnicode() {
    return this._artistUnicode !== "Unknown Artist" ? this._artistUnicode : this.artist;
  }
  set artistUnicode(value) {
    this._artistUnicode = value;
  }
  clone() {
    const cloned = new BeatmapMetadataSection();
    cloned.title = this.title;
    cloned.titleUnicode = this.titleUnicode;
    cloned.artist = this.artist;
    cloned.artistUnicode = this.artistUnicode;
    cloned.creator = this.creator;
    cloned.version = this.version;
    cloned.source = this.source;
    cloned.tags = this.tags.slice();
    cloned.beatmapId = this.beatmapId;
    cloned.beatmapSetId = this.beatmapSetId;
    return cloned;
  }
};
var BeatmapColoursSection = class {
  constructor() {
    this.comboColours = [];
  }
  clone() {
    const cloned = new BeatmapColoursSection();
    cloned.comboColours = this.comboColours.map((c) => c.clone());
    if (this.sliderTrackColor) {
      cloned.sliderTrackColor = this.sliderTrackColor;
    }
    if (this.sliderBorderColor) {
      cloned.sliderBorderColor = this.sliderBorderColor;
    }
    return cloned;
  }
};
var BeatmapEventsSection = class {
  clone() {
    const cloned = new BeatmapEventsSection();
    if (this.background) {
      cloned.background = this.background;
    }
    if (this.video) {
      cloned.video = this.video;
    }
    if (this.videoOffset) {
      cloned.videoOffset = this.videoOffset;
    }
    if (this.breaks) {
      cloned.breaks = this.breaks;
    }
    if (this.storyboard) {
      cloned.storyboard = this.storyboard;
    }
    return cloned;
  }
};
var BeatmapProcessor = class {
  preProcess(beatmap) {
    return beatmap;
  }
  postProcess(beatmap) {
    return beatmap;
  }
};
var BeatmapConverter = class {
  convertBeatmap(beatmap) {
    let _a3;
    const converted = this.createBeatmap();
    converted.general = beatmap.general.clone();
    converted.editor = beatmap.editor.clone();
    converted.difficulty = beatmap.difficulty.clone();
    converted.metadata = beatmap.metadata.clone();
    converted.colours = beatmap.colours.clone();
    converted.events = beatmap.events.clone();
    converted.controlPoints = beatmap.controlPoints.clone();
    converted.fileFormat = beatmap.fileFormat;
    converted.originalMode = beatmap.originalMode;
    converted.base = (_a3 = beatmap.base) !== null && _a3 !== void 0 ? _a3 : beatmap;
    for (const hitObject of this.convertHitObjects(converted.base)) {
      converted.hitObjects.push(hitObject);
    }
    converted.hitObjects.sort((a, b) => a.startTime - b.startTime);
    return converted;
  }
};
var ProgressiveCalculationBeatmap = class {
  constructor(baseBeatmap) {
    this.hitObjects = [];
    this._baseBeatmap = baseBeatmap;
  }
  get general() {
    return this._baseBeatmap.general;
  }
  set general(value) {
    this._baseBeatmap.general = value;
  }
  get editor() {
    return this._baseBeatmap.editor;
  }
  set editor(value) {
    this._baseBeatmap.editor = value;
  }
  get difficulty() {
    return this._baseBeatmap.difficulty;
  }
  set difficulty(value) {
    this._baseBeatmap.difficulty = value;
  }
  get metadata() {
    return this._baseBeatmap.metadata;
  }
  set metadata(value) {
    this._baseBeatmap.metadata = value;
  }
  get colours() {
    return this._baseBeatmap.colours;
  }
  set colours(value) {
    this._baseBeatmap.colours = value;
  }
  get events() {
    return this._baseBeatmap.events;
  }
  set events(value) {
    this._baseBeatmap.events = value;
  }
  get controlPoints() {
    return this._baseBeatmap.controlPoints;
  }
  set controlPoints(value) {
    this._baseBeatmap.controlPoints = value;
  }
  get mode() {
    return this._baseBeatmap.mode;
  }
  get originalMode() {
    return this._baseBeatmap.originalMode;
  }
  get fileFormat() {
    return this._baseBeatmap.fileFormat;
  }
  get length() {
    return this._baseBeatmap.length;
  }
  get bpmMin() {
    return this._baseBeatmap.bpmMin;
  }
  get bpmMax() {
    return this._baseBeatmap.bpmMax;
  }
  get bpmMode() {
    return this._baseBeatmap.bpmMode;
  }
  get totalBreakTime() {
    return this._baseBeatmap.totalBreakTime;
  }
  clone() {
    return new ProgressiveCalculationBeatmap(this._baseBeatmap);
  }
};
var Beatmap = class {
  constructor() {
    this.general = new BeatmapGeneralSection();
    this.editor = new BeatmapEditorSection();
    this.difficulty = new BeatmapDifficultySection();
    this.metadata = new BeatmapMetadataSection();
    this.colours = new BeatmapColoursSection();
    this.events = new BeatmapEventsSection();
    this.controlPoints = new ControlPointInfo();
    this.hitObjects = [];
    this.fileFormat = 14;
    this.fileUpdateDate = new Date();
    this.originalMode = 0;
  }
  get mode() {
    return this.originalMode;
  }
  get length() {
    if (!this.hitObjects.length) {
      return 0;
    }
    const first = this.hitObjects[0];
    const last = this.hitObjects[this.hitObjects.length - 1];
    const durationLast = last;
    const startTime = first.startTime;
    const endTime = durationLast.endTime || last.startTime;
    return (endTime - startTime) / this.difficulty.clockRate;
  }
  get totalLength() {
    if (!this.hitObjects.length) {
      return 0;
    }
    const last = this.hitObjects[this.hitObjects.length - 1];
    const durationObject = last;
    const endTime = durationObject.endTime || last.startTime;
    return endTime / this.difficulty.clockRate;
  }
  get bpmMin() {
    const beats = this.controlPoints.timingPoints.map((t) => t.bpm).filter((t) => t >= 0);
    if (beats.length) {
      const bpm = beats.reduce((bpm2, beat) => Math.min(bpm2, beat), Infinity);
      return bpm * this.difficulty.clockRate;
    }
    return 60;
  }
  get bpmMax() {
    const beats = this.controlPoints.timingPoints.map((t) => t.bpm).filter((t) => t >= 0);
    if (beats.length) {
      const bpm = beats.reduce((bpm2, beat) => Math.max(bpm2, beat), 0);
      return bpm * this.difficulty.clockRate;
    }
    return 60;
  }
  get bpmMode() {
    if (this.hitObjects.length === 0) {
      return this.bpmMax;
    }
    const hitObjects = this.hitObjects;
    const timingPoints = this.controlPoints.timingPoints;
    const lastObj = hitObjects[hitObjects.length - 1];
    const durationObj = lastObj;
    const lastTime = durationObj.endTime || lastObj.startTime || 0;
    let nextTime = 0;
    let nextBeat = 0;
    const groups = {};
    for (let i = 0, len = timingPoints.length; i < len; ++i) {
      if (timingPoints[i].startTime > lastTime) {
        break;
      }
      nextTime = i === len - 1 ? lastTime : timingPoints[i + 1].startTime;
      nextBeat = RoundHelper.round(timingPoints[i].beatLength * 1e3) / 1e3;
      if (!groups[nextBeat]) {
        groups[nextBeat] = 0;
      }
      groups[nextBeat] += nextTime - timingPoints[i].startTime;
    }
    const entries = Object.entries(groups).sort((a, b) => b[1] - a[1]);
    return 6e4 / Number(entries[0][0]) * this.difficulty.clockRate;
  }
  get totalBreakTime() {
    return (this.events.breaks || []).reduce((d, e) => d + e.duration, 0);
  }
  clone() {
    const Beatmap2 = this.constructor;
    const cloned = new Beatmap2();
    cloned.general = this.general.clone();
    cloned.editor = this.editor.clone();
    cloned.difficulty = this.difficulty.clone();
    cloned.metadata = this.metadata.clone();
    cloned.colours = this.colours.clone();
    cloned.events = this.events.clone();
    cloned.controlPoints = this.controlPoints.clone();
    cloned.hitObjects = this.hitObjects.map((h) => h.clone());
    cloned.originalMode = this.originalMode;
    cloned.fileFormat = this.fileFormat;
    if (this.base) {
      cloned.base = this.base;
    }
    return cloned;
  }
};
var RulesetBeatmap = class extends Beatmap {
  clone() {
    const cloned = super.clone();
    cloned.mods = this.mods.clone();
    return cloned;
  }
};
var DifficultyAttributes = class {
  constructor(mods, starRating) {
    this.maxCombo = 0;
    this.mods = mods;
    this.starRating = starRating;
  }
};
DifficultyAttributes.ATTRIB_ID_AIM = 1;
DifficultyAttributes.ATTRIB_ID_SPEED = 3;
DifficultyAttributes.ATTRIB_ID_OVERALL_DIFFICULTY = 5;
DifficultyAttributes.ATTRIB_ID_APPROACH_RATE = 7;
DifficultyAttributes.ATTRIB_ID_MAX_COMBO = 9;
DifficultyAttributes.ATTRIB_ID_STRAIN = 11;
DifficultyAttributes.ATTRIB_ID_GREAT_HIT_WINDOW = 13;
DifficultyAttributes.ATTRIB_ID_SCORE_MULTIPLIER = 15;
DifficultyAttributes.ATTRIB_ID_FLASHLIGHT = 17;
DifficultyAttributes.ATTRIB_ID_SLIDER_FACTOR = 19;
var PerformanceAttributes = class {
  constructor(mods, totalPerformance) {
    this.mods = mods;
    this.totalPerformance = totalPerformance;
  }
};
var TimedDifficultyAttributes = class {
  constructor(time, attributes) {
    this.time = time;
    this.attributes = attributes;
  }
  compareTo(other) {
    if (this.time < other.time) {
      return -1;
    }
    if (this.time > other.time) {
      return 1;
    }
    if (this.time === other.time) {
      return 0;
    }
    if (!Number.isFinite(this.time)) {
      return !Number.isFinite(other.time) ? 0 : -1;
    }
    return 1;
  }
};
var DifficultyCalculator = class {
  constructor(beatmap, ruleset) {
    this._clockRate = 1;
    this._beatmap = beatmap;
    this._ruleset = ruleset;
  }
  calculate() {
    const mods = this._beatmap.mods;
    return this.calculateWithMods(mods !== null && mods !== void 0 ? mods : this._ruleset.createModCombination());
  }
  *calculateAll() {
    for (const combination of this._createDifficultyModCombinations()) {
      yield this.calculateWithMods(combination);
    }
  }
  calculateWithMods(mods) {
    const beatmap = this._getWorkingBeatmap(mods);
    const skills = this._createSkills(beatmap, mods);
    if (!beatmap.hitObjects.length) {
      return this._createDifficultyAttributes(beatmap, mods, skills);
    }
    for (const hitObject of this._getDifficultyHitObjects(beatmap)) {
      for (const skill of skills) {
        skill.processInternal(hitObject);
      }
    }
    return this._createDifficultyAttributes(beatmap, mods, skills);
  }
  calculateTimed() {
    return this.calculateTimedWithMods(this._ruleset.createModCombination());
  }
  calculateTimedWithMods(mods) {
    const beatmap = this._getWorkingBeatmap(mods);
    const attributes = [];
    if (!beatmap.hitObjects.length) {
      return attributes;
    }
    const skills = this._createSkills(beatmap, mods);
    const progressiveBeatmap = new ProgressiveCalculationBeatmap(beatmap);
    for (const hitObject of this._getDifficultyHitObjects(beatmap)) {
      progressiveBeatmap.hitObjects.push(hitObject.baseObject);
      for (const skill of skills) {
        skill.processInternal(hitObject);
      }
      const time = hitObject.endTime * this._clockRate;
      const atts = this._createDifficultyAttributes(progressiveBeatmap, mods, skills);
      attributes.push(new TimedDifficultyAttributes(time, atts));
    }
    return attributes;
  }
  _getWorkingBeatmap(mods) {
    let _a3, _b2, _c;
    const rulesetBeatmap = this._beatmap;
    const sameRuleset = this._beatmap.mode === this._ruleset.id;
    const sameMods = (_b2 = (_a3 = rulesetBeatmap.mods) === null || _a3 === void 0 ? void 0 : _a3.equals(mods)) !== null && _b2 !== void 0 ? _b2 : false;
    if (sameRuleset && sameMods) {
      return rulesetBeatmap;
    }
    const original = (_c = this._beatmap.base) !== null && _c !== void 0 ? _c : this._beatmap;
    return this._ruleset.applyToBeatmapWithMods(original, mods);
  }
  _getDifficultyHitObjects(beatmap) {
    return this._sortObjects(this._createDifficultyHitObjects(beatmap));
  }
  _sortObjects(input) {
    return [...input].sort((a, b) => a.startTime - b.startTime);
  }
  _createDifficultyModCombinations() {
    const ruleset = this._ruleset;
    function* createModCombinations(remainingMods, currentSet) {
      const bitwise = currentSet.reduce((p, c) => p + c.bitwise, 0);
      yield ruleset.createModCombination(bitwise);
      for (let i = 0; i < remainingMods.length; ++i) {
        const nextMod = remainingMods[i];
        if (currentSet.find((m) => m.incompatibles & nextMod.bitwise)) {
          continue;
        }
        if (currentSet.find((m) => m.bitwise & nextMod.bitwise)) {
          continue;
        }
        const nextRemaining = remainingMods.slice(i + 1);
        const nextSet = [...currentSet, nextMod];
        const combinations = createModCombinations(nextRemaining, nextSet);
        for (const combination of combinations) {
          yield combination;
        }
      }
    }
    return createModCombinations(this.difficultyMods, []);
  }
  get difficultyMods() {
    return [];
  }
};
var ModBitwise;
(function(ModBitwise2) {
  ModBitwise2[ModBitwise2["None"] = 0] = "None";
  ModBitwise2[ModBitwise2["NoFail"] = 1] = "NoFail";
  ModBitwise2[ModBitwise2["Easy"] = 2] = "Easy";
  ModBitwise2[ModBitwise2["TouchDevice"] = 4] = "TouchDevice";
  ModBitwise2[ModBitwise2["Hidden"] = 8] = "Hidden";
  ModBitwise2[ModBitwise2["HardRock"] = 16] = "HardRock";
  ModBitwise2[ModBitwise2["SuddenDeath"] = 32] = "SuddenDeath";
  ModBitwise2[ModBitwise2["DoubleTime"] = 64] = "DoubleTime";
  ModBitwise2[ModBitwise2["Relax"] = 128] = "Relax";
  ModBitwise2[ModBitwise2["HalfTime"] = 256] = "HalfTime";
  ModBitwise2[ModBitwise2["Nightcore"] = 512] = "Nightcore";
  ModBitwise2[ModBitwise2["Flashlight"] = 1024] = "Flashlight";
  ModBitwise2[ModBitwise2["Autoplay"] = 2048] = "Autoplay";
  ModBitwise2[ModBitwise2["SpunOut"] = 4096] = "SpunOut";
  ModBitwise2[ModBitwise2["Relax2"] = 8192] = "Relax2";
  ModBitwise2[ModBitwise2["Perfect"] = 16384] = "Perfect";
  ModBitwise2[ModBitwise2["Key4"] = 32768] = "Key4";
  ModBitwise2[ModBitwise2["Key5"] = 65536] = "Key5";
  ModBitwise2[ModBitwise2["Key6"] = 131072] = "Key6";
  ModBitwise2[ModBitwise2["Key7"] = 262144] = "Key7";
  ModBitwise2[ModBitwise2["Key8"] = 524288] = "Key8";
  ModBitwise2[ModBitwise2["FadeIn"] = 1048576] = "FadeIn";
  ModBitwise2[ModBitwise2["Random"] = 2097152] = "Random";
  ModBitwise2[ModBitwise2["Cinema"] = 4194304] = "Cinema";
  ModBitwise2[ModBitwise2["Target"] = 8388608] = "Target";
  ModBitwise2[ModBitwise2["Key9"] = 16777216] = "Key9";
  ModBitwise2[ModBitwise2["KeyCoop"] = 33554432] = "KeyCoop";
  ModBitwise2[ModBitwise2["Key1"] = 67108864] = "Key1";
  ModBitwise2[ModBitwise2["Key3"] = 134217728] = "Key3";
  ModBitwise2[ModBitwise2["Key2"] = 268435456] = "Key2";
  ModBitwise2[ModBitwise2["ScoreV2"] = 536870912] = "ScoreV2";
  ModBitwise2[ModBitwise2["Mirror"] = 1073741824] = "Mirror";
  ModBitwise2[ModBitwise2["KeyMod"] = 487555072] = "KeyMod";
  ModBitwise2[ModBitwise2["DifficultyDecrease"] = 258] = "DifficultyDecrease";
  ModBitwise2[ModBitwise2["DifficultyIncrease"] = 1616] = "DifficultyIncrease";
})(ModBitwise || (ModBitwise = {}));
var ModType;
(function(ModType2) {
  ModType2[ModType2["DifficultyReduction"] = 0] = "DifficultyReduction";
  ModType2[ModType2["DifficultyIncrease"] = 1] = "DifficultyIncrease";
  ModType2[ModType2["Conversion"] = 2] = "Conversion";
  ModType2[ModType2["Automation"] = 3] = "Automation";
  ModType2[ModType2["Fun"] = 4] = "Fun";
  ModType2[ModType2["System"] = 5] = "System";
})(ModType || (ModType = {}));
var Autoplay = class {
  constructor() {
    this.name = "Autoplay";
    this.acronym = "AT";
    this.bitwise = ModBitwise.Autoplay;
    this.type = ModType.Automation;
    this.multiplier = 1;
    this.isRanked = false;
    this.incompatibles = ModBitwise.NoFail | ModBitwise.SuddenDeath | ModBitwise.Perfect | ModBitwise.Relax | ModBitwise.Relax2 | ModBitwise.SpunOut | ModBitwise.Cinema;
  }
};
var Cinema = class {
  constructor() {
    this.name = "Cinema";
    this.acronym = "CN";
    this.bitwise = ModBitwise.Cinema;
    this.type = ModType.Fun;
    this.multiplier = 1;
    this.isRanked = false;
    this.incompatibles = ModBitwise.NoFail | ModBitwise.SuddenDeath | ModBitwise.Perfect | ModBitwise.Relax | ModBitwise.Relax2 | ModBitwise.SpunOut | ModBitwise.Autoplay;
  }
};
var DoubleTime = class {
  constructor() {
    this.name = "Double Time";
    this.acronym = "DT";
    this.bitwise = ModBitwise.DoubleTime;
    this.type = ModType.DifficultyIncrease;
    this.multiplier = 1.12;
    this.isRanked = true;
    this.incompatibles = ModBitwise.HalfTime | ModBitwise.Nightcore;
  }
  applyToDifficulty(difficulty) {
    difficulty.clockRate = 1.5;
  }
};
var Easy = class {
  constructor() {
    this.name = "Easy";
    this.acronym = "EZ";
    this.bitwise = ModBitwise.Easy;
    this.type = ModType.DifficultyReduction;
    this.multiplier = 0.5;
    this.isRanked = true;
    this.incompatibles = ModBitwise.HardRock;
  }
  applyToDifficulty(difficulty) {
    difficulty.circleSize /= 2;
    difficulty.approachRate /= 2;
    difficulty.drainRate /= 2;
    difficulty.overallDifficulty /= 2;
  }
};
var Flashlight = class {
  constructor() {
    this.name = "Flashlight";
    this.acronym = "FL";
    this.bitwise = ModBitwise.Flashlight;
    this.type = ModType.DifficultyIncrease;
    this.multiplier = 1.12;
    this.isRanked = true;
    this.incompatibles = ModBitwise.None;
  }
};
var HalfTime = class {
  constructor() {
    this.name = "Half Time";
    this.acronym = "HT";
    this.bitwise = ModBitwise.HalfTime;
    this.type = ModType.DifficultyReduction;
    this.multiplier = 0.3;
    this.isRanked = true;
    this.incompatibles = ModBitwise.DoubleTime | ModBitwise.Nightcore;
  }
  applyToDifficulty(difficulty) {
    difficulty.clockRate = 0.75;
  }
};
var HardRock = class {
  constructor() {
    this.name = "Hard Rock";
    this.acronym = "HR";
    this.bitwise = ModBitwise.HardRock;
    this.type = ModType.DifficultyIncrease;
    this.multiplier = 1.06;
    this.isRanked = true;
    this.incompatibles = ModBitwise.Easy;
  }
  applyToDifficulty(difficulty) {
    difficulty.circleSize = Math.min(difficulty.circleSize * 1.3, 10);
    difficulty.approachRate = Math.min(difficulty.approachRate * 1.4, 10);
    difficulty.drainRate = Math.min(difficulty.drainRate * 1.4, 10);
    difficulty.overallDifficulty = Math.min(difficulty.overallDifficulty * 1.4, 10);
  }
};
var Hidden = class {
  constructor() {
    this.name = "Hidden";
    this.acronym = "HD";
    this.bitwise = ModBitwise.Hidden;
    this.type = ModType.DifficultyIncrease;
    this.multiplier = 1.06;
    this.isRanked = true;
    this.incompatibles = ModBitwise.None;
  }
};
var Nightcore = class extends DoubleTime {
  constructor() {
    super(...arguments);
    this.name = "Nightcore";
    this.acronym = "NC";
    this.bitwise = ModBitwise.Nightcore;
    this.incompatibles = ModBitwise.HalfTime | ModBitwise.DoubleTime;
  }
};
var NoFail = class {
  constructor() {
    this.name = "No Fail";
    this.acronym = "NF";
    this.bitwise = ModBitwise.NoFail;
    this.type = ModType.DifficultyReduction;
    this.multiplier = 0.5;
    this.isRanked = true;
    this.incompatibles = ModBitwise.SuddenDeath | ModBitwise.Perfect | ModBitwise.Autoplay | ModBitwise.Cinema | ModBitwise.Relax | ModBitwise.Relax2;
  }
};
var NoMod = class {
  constructor() {
    this.name = "No Mod";
    this.acronym = "NM";
    this.bitwise = ModBitwise.None;
    this.type = ModType.System;
    this.multiplier = 1;
    this.isRanked = true;
    this.incompatibles = ModBitwise.None;
  }
};
var Perfect = class {
  constructor() {
    this.name = "Perfect";
    this.acronym = "PF";
    this.bitwise = ModBitwise.Perfect;
    this.type = ModType.DifficultyIncrease;
    this.multiplier = 1;
    this.isRanked = true;
    this.incompatibles = ModBitwise.NoFail | ModBitwise.SuddenDeath | ModBitwise.Autoplay | ModBitwise.Cinema | ModBitwise.Relax | ModBitwise.Relax2;
  }
};
var Relax = class {
  constructor() {
    this.name = "Relax";
    this.acronym = "RX";
    this.bitwise = ModBitwise.Relax;
    this.type = ModType.Automation;
    this.multiplier = 1;
    this.isRanked = false;
    this.incompatibles = ModBitwise.NoFail | ModBitwise.SuddenDeath | ModBitwise.Perfect | ModBitwise.Autoplay | ModBitwise.Cinema | ModBitwise.Relax2;
  }
};
var SuddenDeath = class {
  constructor() {
    this.name = "Sudden Death";
    this.acronym = "SD";
    this.bitwise = ModBitwise.SuddenDeath;
    this.type = ModType.DifficultyIncrease;
    this.multiplier = 1;
    this.isRanked = true;
    this.incompatibles = ModBitwise.NoFail | ModBitwise.Perfect | ModBitwise.Autoplay | ModBitwise.Cinema | ModBitwise.Relax | ModBitwise.Relax2;
  }
};
var ModCombination = class {
  constructor(input) {
    this._mods = [];
    const available = this._availableMods;
    if (typeof input === "number" || typeof input === "string") {
      let bitwise = this.toBitwise(input);
      let mask = 1 << 30;
      while (mask > 0) {
        const found = available.find((m) => m.bitwise & bitwise & mask);
        if (found && !(this.bitwise & found.incompatibles)) {
          this._mods.push(found);
        }
        bitwise &= ~mask;
        mask >>= 1;
      }
    }
    if (!this._mods.length) {
      const noMod = available.find((m) => m.bitwise === 0);
      if (noMod) {
        this._mods.push(noMod);
      }
    }
    this._mods.sort((a, b) => a.bitwise - b.bitwise);
  }
  get all() {
    return this._mods;
  }
  get beatmapMods() {
    const mods = this.all;
    return mods.filter((m) => m.applyToBeatmap);
  }
  get hitObjectMods() {
    const mods = this.all;
    return mods.filter((m) => m.applyToHitObjects);
  }
  get difficultyMods() {
    const mods = this.all;
    return mods.filter((m) => m.applyToDifficulty);
  }
  get converterMods() {
    const mods = this.all;
    return mods.filter((m) => m.applyToConverter);
  }
  get names() {
    return this.all.map((m) => m.name);
  }
  get acronyms() {
    return this.all.map((m) => m.acronym);
  }
  get bitwise() {
    return this.all.reduce((b, m) => b | m.bitwise, 0);
  }
  get multiplier() {
    return this.all.reduce((mp, m) => mp * m.multiplier, 1);
  }
  get isRanked() {
    return this.all.reduce((r, m) => r && m.isRanked, true);
  }
  get incompatibles() {
    return this.all.reduce((b, m) => b | m.incompatibles, 0);
  }
  has(input) {
    const bitwise = this.toBitwise(input);
    return (this.bitwise & bitwise) === bitwise || this.bitwise === bitwise;
  }
  beatmapModsAt(input) {
    const bitwise = this.toBitwise(input);
    const mods = this.all;
    return mods.filter((m) => m.bitwise & bitwise && m.applyToBeatmap);
  }
  beatmapModAt(input) {
    const bitwise = this.toBitwise(input);
    return this.beatmapModsAt(bitwise)[0] || null;
  }
  hitObjectModsAt(input) {
    const bitwise = this.toBitwise(input);
    const mods = this.all;
    return mods.filter((m) => m.bitwise & bitwise && m.applyToHitObjects);
  }
  hitObjectModAt(input) {
    const bitwise = this.toBitwise(input);
    return this.hitObjectModsAt(bitwise)[0] || null;
  }
  difficultyModsAt(input) {
    const bitwise = this.toBitwise(input);
    const mods = this.all;
    return mods.filter((m) => m.bitwise & bitwise && m.applyToDifficulty);
  }
  difficultyModAt(input) {
    const bitwise = this.toBitwise(input);
    return this.difficultyModsAt(bitwise)[0] || null;
  }
  converterModsAt(input) {
    const bitwise = this.toBitwise(input);
    const mods = this.all;
    return mods.filter((m) => m.bitwise & bitwise && m.applyToConverter);
  }
  converterModAt(input) {
    const bitwise = this.toBitwise(input);
    return this.converterModsAt(bitwise)[0] || null;
  }
  modsAt(input) {
    const bitwise = this.toBitwise(input);
    return this.all.filter((m) => m.bitwise & bitwise);
  }
  modAt(input) {
    const bitwise = this.toBitwise(input);
    return this.modsAt(bitwise)[0] || null;
  }
  toString() {
    return this.acronyms.join("");
  }
  toBitwise(input) {
    let _a3, _b2;
    if (typeof input === "number") {
      return Math.max(0, input);
    }
    if (typeof input !== "string" || !input) {
      return 0;
    }
    if (input.length % 2) {
      return 0;
    }
    const acronyms = (_b2 = (_a3 = input.match(/.{1,2}/g)) === null || _a3 === void 0 ? void 0 : _a3.map((a) => a.toUpperCase())) !== null && _b2 !== void 0 ? _b2 : [];
    return acronyms.reduce((bitwise, acronym) => {
      let _a4;
      const found = this._availableMods.find((m) => m.acronym === acronym);
      return bitwise | ((_a4 = found === null || found === void 0 ? void 0 : found.bitwise) !== null && _a4 !== void 0 ? _a4 : 0);
    }, 0);
  }
  clone() {
    const ModCombination2 = this.constructor;
    return new ModCombination2(this.bitwise);
  }
  equals(other) {
    return this.bitwise === other.bitwise && this.mode === other.mode;
  }
  get _availableMods() {
    return [];
  }
};
var PerformanceCalculator = class {
  constructor(ruleset, attributes, score) {
    let _a3, _b2;
    this._clockRate = 1;
    this._ruleset = ruleset;
    this._score = score;
    if (!attributes) {
      throw new Error("Attributes are null!");
    }
    this.attributes = attributes;
    if ((_a3 = score.mods) === null || _a3 === void 0 ? void 0 : _a3.has(ModBitwise.DoubleTime || ModBitwise.Nightcore)) {
      this._clockRate = 1.5;
    }
    if ((_b2 = score.mods) === null || _b2 === void 0 ? void 0 : _b2.has(ModBitwise.HalfTime)) {
      this._clockRate = 0.75;
    }
  }
  calculate() {
    return this.calculateAttributes().totalPerformance;
  }
};
var DifficultyHitObject = class {
  constructor(hitObject, lastObject, clockRate) {
    let _a3;
    this.baseObject = hitObject;
    this.lastObject = lastObject;
    this.deltaTime = (hitObject.startTime - lastObject.startTime) / clockRate;
    this.startTime = hitObject.startTime / clockRate;
    const durationObj = hitObject;
    this.endTime = ((_a3 = durationObj === null || durationObj === void 0 ? void 0 : durationObj.endTime) !== null && _a3 !== void 0 ? _a3 : hitObject.startTime) / clockRate;
  }
};
var ReverseQueue = class {
  constructor(initialCapacity) {
    this.count = 0;
    if (initialCapacity <= 0) {
      throw new Error("Capacity of the reverse queue must be greater than 0!");
    }
    this._items = [];
    this._capacity = initialCapacity;
    this._start = 0;
  }
  get(index) {
    if (index < 0 || index > this.count - 1) {
      throw new Error("Index is out of range!");
    }
    const reverseIndex = this.count - 1 - index;
    return this._items[(this._start + reverseIndex) % this._capacity];
  }
  enqueue(item) {
    if (this.count === this._capacity) {
      this._capacity *= 2;
      this._start = 0;
    }
    this._items[(this._start + this.count) % this._capacity] = item;
    this.count++;
  }
  dequeue() {
    const item = this._items[this._start];
    this._start = (this._start + 1) % this._capacity;
    this.count--;
    return item;
  }
  clear() {
    this._start = 0;
    this.count = 0;
  }
  *enumerate() {
    if (this.count === 0) {
      return;
    }
    for (let i = this.count; i >= this._start; --i) {
      yield this._items[i];
    }
  }
};
var Skill = class {
  constructor(mods) {
    this._mods = mods;
    this._previous = new ReverseQueue(this._historyLength + 1);
  }
  get _historyLength() {
    return 1;
  }
  processInternal(current) {
    while (this._previous.count > this._historyLength) {
      this._previous.dequeue();
    }
    this._process(current);
    this._previous.enqueue(current);
  }
};
var StrainSkill = class extends Skill {
  constructor() {
    super(...arguments);
    this._decayWeight = 0.9;
    this._sectionLength = 400;
    this._currentSectionPeak = 0;
    this._currentSectionEnd = 0;
    this._strainPeaks = [];
  }
  _process(current) {
    if (this._previous.count === 0) {
      this._currentSectionEnd = Math.ceil(current.startTime / this._sectionLength);
      this._currentSectionEnd *= this._sectionLength;
    }
    while (current.startTime > this._currentSectionEnd) {
      this._saveCurrentPeak();
      this._startNewSectionFrom(this._currentSectionEnd);
      this._currentSectionEnd += this._sectionLength;
    }
    this._currentSectionPeak = Math.max(this._strainValueAt(current), this._currentSectionPeak);
  }
  _saveCurrentPeak() {
    this._strainPeaks.push(this._currentSectionPeak);
  }
  _startNewSectionFrom(time) {
    this._currentSectionPeak = this._calculateInitialStrain(time);
  }
  *getCurrentStrainPeaks() {
    for (const peak of this._strainPeaks) {
      yield peak;
    }
    yield this._currentSectionPeak;
  }
  get difficultyValue() {
    let difficulty = 0;
    let weight = 1;
    const peaks = [...this.getCurrentStrainPeaks()];
    peaks.sort((a, b) => b - a);
    for (const strain of peaks) {
      difficulty += strain * weight;
      weight *= this._decayWeight;
    }
    return difficulty;
  }
};
var StrainDecaySkill = class extends StrainSkill {
  constructor() {
    super(...arguments);
    this._currentStrain = 0;
  }
  _calculateInitialStrain(time) {
    const strainDecay = this._strainDecay(time - this._previous.get(0).startTime);
    return this._currentStrain * strainDecay;
  }
  _strainValueAt(current) {
    this._currentStrain *= this._strainDecay(current.deltaTime);
    this._currentStrain += this._strainValueOf(current) * this._skillMultiplier;
    return this._currentStrain;
  }
  _strainDecay(ms) {
    return Math.pow(this._strainDecayBase, ms / 1e3);
  }
};
var LimitedCapacityQueue = class {
  constructor(capacity) {
    this.count = 0;
    this._start = 0;
    this._end = -1;
    if (capacity < 0) {
      throw new Error("Capacity of the limited queue must be greater than 0!");
    }
    this._capacity = capacity;
    this._array = [];
    this.clear();
  }
  get full() {
    return this.count === this._capacity;
  }
  clear() {
    this._start = 0;
    this._end = -1;
    this.count = 0;
  }
  dequeue() {
    if (this.count === 0) {
      throw new Error("Queue is empty!");
    }
    const result = this._array[this._start];
    this._start = (this._start + 1) % this._capacity;
    this.count--;
    return result;
  }
  enqueue(item) {
    this._end = (this._end + 1) % this._capacity;
    if (this.count === this._capacity) {
      this._start = (this._start + 1) % this._capacity;
    } else {
      this.count++;
    }
    this._array[this._end] = item;
  }
  get(index) {
    if (index < 0 || index >= this.count) {
      throw new Error("Index is out of range!");
    }
    return this._array[(this._start + index) % this._capacity];
  }
  *enumerate() {
    if (this.count === 0) {
      return;
    }
    for (let i = 0; i < this.count; ++i) {
      yield this._array[(this._start + i) % this._capacity];
    }
  }
};
var HitSound;
(function(HitSound2) {
  HitSound2[HitSound2["None"] = 0] = "None";
  HitSound2[HitSound2["Normal"] = 1] = "Normal";
  HitSound2[HitSound2["Whistle"] = 2] = "Whistle";
  HitSound2[HitSound2["Finish"] = 4] = "Finish";
  HitSound2[HitSound2["Clap"] = 8] = "Clap";
})(HitSound || (HitSound = {}));
var HitType;
(function(HitType2) {
  HitType2[HitType2["Normal"] = 1] = "Normal";
  HitType2[HitType2["Slider"] = 2] = "Slider";
  HitType2[HitType2["NewCombo"] = 4] = "NewCombo";
  HitType2[HitType2["Spinner"] = 8] = "Spinner";
  HitType2[HitType2["ComboSkip1"] = 16] = "ComboSkip1";
  HitType2[HitType2["ComboSkip2"] = 32] = "ComboSkip2";
  HitType2[HitType2["ComboSkip3"] = 64] = "ComboSkip3";
  HitType2[HitType2["Hold"] = 128] = "Hold";
})(HitType || (HitType = {}));
var PathType;
(function(PathType2) {
  PathType2["Catmull"] = "C";
  PathType2["Bezier"] = "B";
  PathType2["Linear"] = "L";
  PathType2["PerfectCurve"] = "P";
})(PathType || (PathType = {}));
var SliderEventType;
(function(SliderEventType2) {
  SliderEventType2[SliderEventType2["Tick"] = 1] = "Tick";
  SliderEventType2[SliderEventType2["LegacyLastTick"] = 2] = "LegacyLastTick";
  SliderEventType2[SliderEventType2["Head"] = 4] = "Head";
  SliderEventType2[SliderEventType2["Tail"] = 8] = "Tail";
  SliderEventType2[SliderEventType2["Repeat"] = 16] = "Repeat";
})(SliderEventType || (SliderEventType = {}));
var PathApproximator = class {
  static approximateBezier(controlPoints) {
    return this.approximateBSpline(controlPoints);
  }
  static approximateBSpline(controlPoints, p = 0) {
    const output = [];
    const n = controlPoints.length - 1;
    if (n < 0) {
      return output;
    }
    const toFlatten = [];
    const freeBuffers = [];
    const points = controlPoints.slice();
    if (p > 0 && p < n) {
      for (let i = 0; i < n - p; ++i) {
        const subBezier = [points[i]];
        for (let j = 0; j < p - 1; ++j) {
          subBezier[j + 1] = points[i + 1];
          for (let k = 1; k < p - j; ++k) {
            const l = Math.min(k, n - p - i);
            points[i + k] = points[i + k].fscale(l).fadd(points[i + k + 1]).fdivide(l + 1);
          }
        }
        subBezier[p] = points[i + 1];
        toFlatten.push(subBezier);
      }
      toFlatten.push(points.slice(n - p));
      toFlatten.reverse();
    } else {
      p = n;
      toFlatten.push(points);
    }
    const subdivisionBuffer1 = [];
    const subdivisionBuffer2 = [];
    const leftChild = subdivisionBuffer2;
    while (toFlatten.length > 0) {
      const parent = toFlatten.pop() || [];
      if (this._bezierIsFlatEnough(parent)) {
        this._bezierApproximate(parent, output, subdivisionBuffer1, subdivisionBuffer2, p + 1);
        freeBuffers.push(parent);
        continue;
      }
      const rightChild = freeBuffers.pop() || [];
      this._bezierSubdivide(parent, leftChild, rightChild, subdivisionBuffer1, p + 1);
      for (let i = 0; i < p + 1; ++i) {
        parent[i] = leftChild[i];
      }
      toFlatten.push(rightChild);
      toFlatten.push(parent);
    }
    output.push(controlPoints[n]);
    return output;
  }
  static approximateCatmull(controlPoints) {
    const output = [];
    const controlPointsLength = controlPoints.length;
    for (let i = 0; i < controlPointsLength - 1; i++) {
      const v1 = i > 0 ? controlPoints[i - 1] : controlPoints[i];
      const v2 = controlPoints[i];
      const v3 = i < controlPointsLength - 1 ? controlPoints[i + 1] : v2.fadd(v2).fsubtract(v1);
      const v4 = i < controlPointsLength - 2 ? controlPoints[i + 2] : v3.fadd(v3).fsubtract(v2);
      for (let c = 0; c < PathApproximator.CATMULL_DETAIL; c++) {
        output.push(PathApproximator._catmullFindPoint(v1, v2, v3, v4, Math.fround(c) / PathApproximator.CATMULL_DETAIL));
        output.push(PathApproximator._catmullFindPoint(v1, v2, v3, v4, Math.fround(c + 1) / PathApproximator.CATMULL_DETAIL));
      }
    }
    return output;
  }
  static approximateCircularArc(controlPoints) {
    const pr = this._circularArcProperties(controlPoints);
    if (!pr.isValid) {
      return this.approximateBezier(controlPoints);
    }
    let amountPoints = 2;
    if (2 * pr.radius > PathApproximator.CIRCULAR_ARC_TOLERANCE) {
      const angle = 2 * Math.acos(1 - PathApproximator.CIRCULAR_ARC_TOLERANCE / pr.radius);
      const points = Math.trunc(Math.ceil(pr.thetaRange / angle));
      amountPoints = Math.max(2, points);
    }
    const output = [];
    for (let i = 0; i < amountPoints; ++i) {
      const fract = i / (amountPoints - 1);
      const theta = pr.thetaStart + pr.direction * fract * pr.thetaRange;
      const vector2 = new Vector2(Math.fround(Math.cos(theta)), Math.fround(Math.sin(theta)));
      output.push(vector2.fscale(pr.radius).fadd(pr.centre));
    }
    return output;
  }
  static _circularArcProperties(controlPoints) {
    const a = controlPoints[0];
    const b = controlPoints[1];
    const c = controlPoints[2];
    const sideLength = (b.floatY - a.floatY) * (c.floatX - a.floatX) - (b.floatX - a.floatX) * (c.floatY - a.floatY);
    if (Math.abs(sideLength) < Math.fround(1e-3)) {
      return new CircularArcProperties();
    }
    const d = 2 * (a.floatX * b.fsubtract(c).floatY + b.floatX * c.fsubtract(a).floatY + c.floatX * a.fsubtract(b).floatY);
    const aSq = a.flength() ** 2;
    const bSq = b.flength() ** 2;
    const cSq = c.flength() ** 2;
    const centre = new Vector2(aSq * b.fsubtract(c).floatY + bSq * c.fsubtract(a).floatY + cSq * a.fsubtract(b).floatY, aSq * c.fsubtract(b).floatX + bSq * a.fsubtract(c).floatX + cSq * b.fsubtract(a).floatX).fdivide(d);
    const dA = a.fsubtract(centre);
    const dC = c.fsubtract(centre);
    const radius = dA.flength();
    const thetaStart = Math.atan2(dA.floatY, dA.floatX);
    let thetaEnd = Math.atan2(dC.floatY, dC.floatX);
    while (thetaEnd < thetaStart) {
      thetaEnd += 2 * Math.PI;
    }
    let direction = 1;
    let thetaRange = thetaEnd - thetaStart;
    let orthoAtoC = c.fsubtract(a);
    orthoAtoC = new Vector2(orthoAtoC.floatY, -orthoAtoC.floatX);
    if (orthoAtoC.fdot(b.fsubtract(a)) < 0) {
      direction = -direction;
      thetaRange = 2 * Math.PI - thetaRange;
    }
    return new CircularArcProperties(thetaStart, thetaRange, direction, radius, centre);
  }
  static approximateLinear(controlPoints) {
    return controlPoints.slice();
  }
  static approximateLagrangePolynomial(controlPoints) {
    const NUM_STEPS = 51;
    const output = [];
    const weights = Interpolation.barycentricWeights(controlPoints);
    let minX = controlPoints[0].floatX;
    let maxX = controlPoints[0].floatX;
    for (let i = 1, len = controlPoints.length; i < len; i++) {
      minX = Math.min(minX, controlPoints[i].floatX);
      maxX = Math.max(maxX, controlPoints[i].floatX);
    }
    const dx = maxX - minX;
    for (let i = 0; i < NUM_STEPS; i++) {
      const x = minX + dx / (NUM_STEPS - 1) * i;
      const y = Math.fround(Interpolation.barycentricLagrange(controlPoints, weights, x));
      output.push(new Vector2(x, y));
    }
    return output;
  }
  static _bezierIsFlatEnough(controlPoints) {
    let vector2;
    for (let i = 1, len = controlPoints.length; i < len - 1; i++) {
      vector2 = controlPoints[i - 1].fsubtract(controlPoints[i].fscale(2)).fadd(controlPoints[i + 1]);
      if (vector2.flength() ** 2 > PathApproximator.BEZIER_TOLERANCE ** 2 * 4) {
        return false;
      }
    }
    return true;
  }
  static _bezierSubdivide(controlPoints, l, r, subdivisionBuffer, count) {
    const midpoints = subdivisionBuffer;
    for (let i = 0; i < count; ++i) {
      midpoints[i] = controlPoints[i];
    }
    for (let i = 0; i < count; ++i) {
      l[i] = midpoints[0];
      r[count - i - 1] = midpoints[count - i - 1];
      for (let j = 0; j < count - i - 1; j++) {
        midpoints[j] = midpoints[j].fadd(midpoints[j + 1]).fdivide(2);
      }
    }
  }
  static _bezierApproximate(controlPoints, output, subdivisionBuffer1, subdivisionBuffer2, count) {
    const l = subdivisionBuffer2;
    const r = subdivisionBuffer1;
    PathApproximator._bezierSubdivide(controlPoints, l, r, subdivisionBuffer1, count);
    for (let i = 0; i < count - 1; ++i) {
      l[count + i] = r[i + 1];
    }
    output.push(controlPoints[0]);
    for (let i = 1; i < count - 1; ++i) {
      const index = 2 * i;
      const p = l[index - 1].fadd(l[index].fscale(2)).fadd(l[index + 1]).fscale(Math.fround(0.25));
      output.push(p);
    }
  }
  static _catmullFindPoint(vec1, vec2, vec3, vec4, t) {
    t = Math.fround(t);
    const t2 = Math.fround(t * t);
    const t3 = Math.fround(t * t2);
    return new Vector2(Math.fround(0.5 * (2 * vec2.floatX + (-vec1.floatX + vec3.floatX) * t + (2 * vec1.floatX - 5 * vec2.floatX + 4 * vec3.floatX - vec4.floatX) * t2 + (-vec1.floatX + 3 * vec2.floatX - 3 * vec3.floatX + vec4.floatX) * t3)), Math.fround(0.5 * (2 * vec2.floatY + (-vec1.floatY + vec3.floatY) * t + (2 * vec1.floatY - 5 * vec2.floatY + 4 * vec3.floatY - vec4.floatY) * t2 + (-vec1.floatY + 3 * vec2.floatY - 3 * vec3.floatY + vec4.floatY) * t3)));
  }
};
PathApproximator.BEZIER_TOLERANCE = Math.fround(0.25);
PathApproximator.CIRCULAR_ARC_TOLERANCE = Math.fround(0.1);
PathApproximator.CATMULL_DETAIL = 50;
var CircularArcProperties = class {
  constructor(thetaStart, thetaRange, direction, radius, centre) {
    this.isValid = !!(thetaStart || thetaRange || direction || radius || centre);
    this.thetaStart = thetaStart || 0;
    this.thetaRange = thetaRange || 0;
    this.direction = direction || 0;
    this.radius = radius ? Math.fround(radius) : 0;
    this.centre = centre || new Vector2(0, 0);
  }
  get thetaEnd() {
    return this.thetaStart + this.thetaRange * this.direction;
  }
};
var PathPoint = class {
  constructor(position, type) {
    this.position = position || new Vector2(0, 0);
    this.type = type || null;
  }
};
var SliderPath = class {
  constructor(curveType, controlPoints, expectedDistance) {
    this._calculatedLength = 0;
    this._calculatedPath = [];
    this._cumulativeLength = [];
    this._isCached = false;
    this._curveType = curveType || PathType.Linear;
    this._controlPoints = controlPoints || [];
    this._expectedDistance = expectedDistance || 0;
  }
  get curveType() {
    return this._curveType;
  }
  set curveType(value) {
    this._curveType = value;
    this.invalidate();
  }
  get controlPoints() {
    return this._controlPoints;
  }
  set controlPoints(value) {
    this._controlPoints = value;
    this.invalidate();
  }
  get expectedDistance() {
    return this._expectedDistance;
  }
  set expectedDistance(value) {
    this._expectedDistance = value;
    this.invalidate();
  }
  get distance() {
    this._ensureValid();
    if (this._cumulativeLength.length) {
      return this._cumulativeLength[this._cumulativeLength.length - 1];
    }
    return 0;
  }
  set distance(value) {
    this.expectedDistance = value;
  }
  get calculatedDistance() {
    this._ensureValid();
    return this._calculatedLength;
  }
  invalidate() {
    this._calculatedLength = 0;
    this._calculatedPath = [];
    this._cumulativeLength = [];
    this._isCached = false;
  }
  calculatePathToProgress(path, p0, p1) {
    this._ensureValid();
    const d0 = this._progressToDistance(p0);
    const d1 = this._progressToDistance(p1);
    let i = 0;
    while (i < this._calculatedPath.length && this._cumulativeLength[i] < d0) {
      ++i;
    }
    path = [this._interpolateVertices(i, d0)];
    while (i < this._calculatedPath.length && this._cumulativeLength[i++] <= d1) {
      path.push(this._calculatedPath[i]);
    }
    path.push(this._interpolateVertices(i, d1));
  }
  progressAt(progress, spans) {
    const p = progress * spans % 1;
    return Math.trunc(progress * spans) % 2 ? 1 - p : p;
  }
  positionAt(progress) {
    this._ensureValid();
    const d = this._progressToDistance(progress);
    return this._interpolateVertices(this._indexOfDistance(d), d);
  }
  curvePositionAt(progress, spans) {
    return this.positionAt(this.progressAt(progress, spans));
  }
  clone() {
    const controlPoints = this._controlPoints.map((p) => {
      return new PathPoint(p.position.clone(), p.type);
    });
    return new SliderPath(this._curveType, controlPoints, this._expectedDistance);
  }
  _ensureValid() {
    if (this._isCached) {
      return;
    }
    this._calculatePath();
    this._calculateLength();
    this._isCached = true;
  }
  _calculatePath() {
    this._calculatedPath = [];
    const pathPointsLength = this.controlPoints.length;
    if (pathPointsLength === 0) {
      return;
    }
    const vertices = [];
    for (let i = 0; i < pathPointsLength; i++) {
      vertices[i] = this.controlPoints[i].position;
    }
    let start = 0;
    for (let i = 0; i < pathPointsLength; ++i) {
      if (!this.controlPoints[i].type && i < pathPointsLength - 1) {
        continue;
      }
      const segmentVertices = vertices.slice(start, i + 1);
      const segmentType = this.controlPoints[start].type || PathType.Linear;
      for (const t of this._calculateSubPath(segmentVertices, segmentType)) {
        const last = this._calculatedPath[this._calculatedPath.length - 1];
        if (this._calculatedPath.length === 0 || !last.equals(t)) {
          this._calculatedPath.push(t);
        }
      }
      start = i;
    }
  }
  _calculateSubPath(subControlPoints, type) {
    switch (type) {
      case PathType.Linear:
        return PathApproximator.approximateLinear(subControlPoints);
      case PathType.PerfectCurve: {
        if (subControlPoints.length !== 3) {
          break;
        }
        const subpath = PathApproximator.approximateCircularArc(subControlPoints);
        if (subpath.length === 0) {
          break;
        }
        return subpath;
      }
      case PathType.Catmull:
        return PathApproximator.approximateCatmull(subControlPoints);
    }
    return PathApproximator.approximateBezier(subControlPoints);
  }
  _calculateLength() {
    this._calculatedLength = 0;
    this._cumulativeLength = [0];
    for (let i = 0, l = this._calculatedPath.length - 1; i < l; ++i) {
      const diff = this._calculatedPath[i + 1].fsubtract(this._calculatedPath[i]);
      this._calculatedLength += diff.flength();
      this._cumulativeLength.push(this._calculatedLength);
    }
    if (this._calculatedLength !== this.expectedDistance) {
      const controlPoints = this.controlPoints;
      const lastPoint = controlPoints[controlPoints.length - 1];
      const preLastPoint = controlPoints[controlPoints.length - 2];
      const pointsAreEqual = controlPoints.length >= 2 && lastPoint.position.equals(preLastPoint.position);
      if (pointsAreEqual && this.expectedDistance > this._calculatedLength) {
        this._cumulativeLength.push(this._calculatedLength);
        return;
      }
      this._cumulativeLength.pop();
      let pathEndIndex = this._calculatedPath.length - 1;
      if (this._calculatedLength > this.expectedDistance) {
        while (this._cumulativeLength.length > 0 && this._cumulativeLength[this._cumulativeLength.length - 1] >= this.expectedDistance) {
          this._cumulativeLength.pop();
          this._calculatedPath.splice(pathEndIndex--, 1);
        }
      }
      if (pathEndIndex <= 0) {
        this._cumulativeLength.push(0);
        return;
      }
      const direction = this._calculatedPath[pathEndIndex].fsubtract(this._calculatedPath[pathEndIndex - 1]).fnormalize();
      const distance = Math.fround(this.expectedDistance - this._cumulativeLength[this._cumulativeLength.length - 1]);
      this._calculatedPath[pathEndIndex] = this._calculatedPath[pathEndIndex - 1].fadd(direction.fscale(distance));
      this._cumulativeLength.push(this.expectedDistance);
    }
  }
  _indexOfDistance(d) {
    let i = BinarySearch.findNumber(this._cumulativeLength, d);
    if (i < 0) {
      i = ~i;
    }
    return i;
  }
  _progressToDistance(progress) {
    return Math.min(Math.max(progress, 0), 1) * this.distance;
  }
  _interpolateVertices(i, d) {
    if (this._calculatedPath.length === 0) {
      return new Vector2(0, 0);
    }
    if (i <= 0) {
      return this._calculatedPath[0];
    }
    if (i >= this._calculatedPath.length) {
      return this._calculatedPath[this._calculatedPath.length - 1];
    }
    const p0 = this._calculatedPath[i - 1];
    const p1 = this._calculatedPath[i];
    const d0 = this._cumulativeLength[i - 1];
    const d1 = this._cumulativeLength[i];
    if (Math.abs(d0 - d1) < 1e-3) {
      return p0;
    }
    const w = (d - d0) / (d1 - d0);
    return p0.fadd(p1.fsubtract(p0).fscale(w));
  }
};
var HitSample = class {
  constructor() {
    this.sampleSet = SampleSet[SampleSet.None];
    this.hitSound = HitSound[HitSound.Normal];
    this.customIndex = 0;
    this.suffix = "";
    this.volume = 100;
    this.isLayered = false;
    this.filename = "";
  }
  clone() {
    const cloned = new HitSample();
    cloned.sampleSet = this.sampleSet;
    cloned.hitSound = this.hitSound;
    cloned.customIndex = this.customIndex;
    cloned.suffix = this.suffix;
    cloned.volume = this.volume;
    cloned.isLayered = this.isLayered;
    cloned.filename = this.filename;
    return cloned;
  }
};
var SampleBank = class {
  constructor() {
    this.filename = "";
    this.volume = 100;
    this.normalSet = SampleSet.Normal;
    this.additionSet = SampleSet.Normal;
    this.customIndex = 0;
  }
  clone() {
    const cloned = new SampleBank();
    cloned.filename = this.filename;
    cloned.volume = this.volume;
    cloned.normalSet = this.normalSet;
    cloned.additionSet = this.additionSet;
    cloned.customIndex = this.customIndex;
    return cloned;
  }
};
var EventGenerator = class {
  static *generate(slider) {
    const sliderDistance = Math.min(this.SLIDER_MAX_DISTANCE, slider.path.distance);
    const tickDistance = Math.max(0, Math.min(slider.tickDistance || 0, sliderDistance));
    const minDistanceFromEnd = slider.velocity * 10;
    let spanStartTime = slider.startTime;
    yield {
      eventType: SliderEventType.Head,
      startTime: spanStartTime,
      spanStartTime,
      spanIndex: 0,
      progress: 0
    };
    if (slider.tickDistance !== 0) {
      for (let spanIndex = 0; spanIndex < slider.spans; ++spanIndex) {
        const reversed = !!(spanIndex & 1);
        const events = [];
        let distance = tickDistance;
        while (distance < sliderDistance - minDistanceFromEnd) {
          const progress = distance / sliderDistance;
          const timeProgress = reversed ? 1 - progress : progress;
          events.push({
            eventType: SliderEventType.Tick,
            startTime: spanStartTime + timeProgress * slider.spanDuration,
            spanStartTime,
            spanIndex,
            progress
          });
          distance += tickDistance;
        }
        if (reversed) {
          events.reverse();
        }
        for (const event of events) {
          yield event;
        }
        if (spanIndex < slider.repeats) {
          yield {
            eventType: SliderEventType.Repeat,
            startTime: spanStartTime + slider.spanDuration,
            spanStartTime,
            spanIndex,
            progress: spanIndex + 1 & 1
          };
        }
        spanStartTime += slider.spanDuration;
      }
    }
    const totalDuration = slider.spans * slider.spanDuration;
    const finalSpanIndex = slider.spans - 1;
    const finalSpanStartTime = slider.startTime + finalSpanIndex * slider.spanDuration;
    const finalSpanEndTime = Math.max(slider.startTime + totalDuration / 2, finalSpanStartTime + slider.spanDuration - (slider.legacyLastTickOffset || 0));
    let finalProgress = (finalSpanEndTime - finalSpanStartTime) / slider.spanDuration;
    if ((slider.spans & 1) === 0) {
      finalProgress = 1 - finalProgress;
    }
    yield {
      eventType: SliderEventType.LegacyLastTick,
      startTime: finalSpanEndTime,
      spanStartTime: finalSpanStartTime,
      spanIndex: finalSpanIndex,
      progress: finalProgress
    };
    yield {
      eventType: SliderEventType.Tail,
      startTime: slider.startTime + totalDuration,
      spanStartTime: finalSpanStartTime,
      spanIndex: finalSpanIndex,
      progress: slider.spans % 2
    };
  }
};
EventGenerator.SLIDER_MAX_DISTANCE = 1e5;
var HitObject = class {
  constructor() {
    this.kiai = false;
    this.nestedHitObjects = [];
    this.startTime = 0;
    this.hitType = HitType.Normal;
    this.hitSound = HitSound.Normal;
    this.samples = [];
    this.startPosition = new Vector2(0, 0);
  }
  get startX() {
    return this.startPosition.x;
  }
  set startX(value) {
    this.startPosition.x = value;
  }
  get startY() {
    return this.startPosition.y;
  }
  set startY(value) {
    this.startPosition.y = value;
  }
  createNestedHitObjects() {
    this.nestedHitObjects = [];
  }
  applyDefaultsToSelf(controlPoints, difficulty) {
    this.kiai = controlPoints.effectPointAt(this.startTime + 1).kiai;
  }
  applyDefaultsToNested(controlPoints, difficulty) {
    this.nestedHitObjects.forEach((n) => {
      n.applyDefaults(controlPoints, difficulty);
    });
  }
  applyDefaults(controlPoints, difficulty) {
    this.applyDefaultsToSelf(controlPoints, difficulty);
    this.nestedHitObjects = [];
    this.createNestedHitObjects();
    this.nestedHitObjects.sort((a, b) => a.startTime - b.startTime);
    this.applyDefaultsToNested(controlPoints, difficulty);
  }
  clone() {
    const HitObject2 = this.constructor;
    const cloned = new HitObject2();
    cloned.startPosition = this.startPosition.clone();
    cloned.startTime = this.startTime;
    cloned.hitType = this.hitType;
    cloned.hitSound = this.hitSound;
    cloned.samples = this.samples.map((s) => s.clone());
    cloned.kiai = this.kiai;
    return cloned;
  }
};
var ReplayButtonState;
(function(ReplayButtonState2) {
  ReplayButtonState2[ReplayButtonState2["None"] = 0] = "None";
  ReplayButtonState2[ReplayButtonState2["Left1"] = 1] = "Left1";
  ReplayButtonState2[ReplayButtonState2["Right1"] = 2] = "Right1";
  ReplayButtonState2[ReplayButtonState2["Left2"] = 4] = "Left2";
  ReplayButtonState2[ReplayButtonState2["Right2"] = 8] = "Right2";
  ReplayButtonState2[ReplayButtonState2["Smoke"] = 16] = "Smoke";
})(ReplayButtonState || (ReplayButtonState = {}));
var Ruleset = class {
  applyToBeatmap(beatmap) {
    const originalMods = beatmap.mods;
    const bitwise = originalMods ? originalMods.bitwise : 0;
    const mods = this.createModCombination(bitwise);
    return this.applyToBeatmapWithMods(beatmap, mods);
  }
  applyToBeatmapWithMods(beatmap, mods) {
    if (!mods) {
      mods = this.createModCombination(0);
    }
    if (this.id !== mods.mode) {
      mods = this.createModCombination(mods.bitwise);
    }
    const converter = this.createBeatmapConverter();
    if (beatmap.hitObjects.length > 0 && !converter.canConvert(beatmap)) {
      throw new Error("Beatmap can not be converted!");
    }
    mods.converterMods.forEach((m) => m.applyToConverter(converter));
    const converted = converter.convertBeatmap(beatmap);
    converted.mods = mods;
    mods.difficultyMods.forEach((m) => {
      m.applyToDifficulty(converted.difficulty);
    });
    const processor = this.createBeatmapProcessor();
    processor.preProcess(converted);
    converted.hitObjects.forEach((hitObject) => {
      hitObject.applyDefaults(converted.controlPoints, converted.difficulty);
    });
    mods.hitObjectMods.forEach((m) => {
      m.applyToHitObjects(converted.hitObjects);
    });
    processor.postProcess(converted);
    mods.beatmapMods.forEach((m) => m.applyToBeatmap(converted));
    return converted;
  }
  resetMods(beatmap) {
    const mods = this.createModCombination(0);
    return this.applyToBeatmapWithMods(beatmap, mods);
  }
};
var DifficultyRange = class {
  constructor(result, min, average, max2) {
    this.result = result;
    this.min = min;
    this.average = average;
    this.max = max2;
  }
  static map(difficulty, min, mid, max2) {
    if (difficulty > 5) {
      return mid + (max2 - mid) * (difficulty - 5) / 5;
    }
    if (difficulty < 5) {
      return mid - (mid - min) * (5 - difficulty) / 5;
    }
    return mid;
  }
};
var HitResult;
(function(HitResult2) {
  HitResult2[HitResult2["None"] = 0] = "None";
  HitResult2[HitResult2["Miss"] = 1] = "Miss";
  HitResult2[HitResult2["Meh"] = 2] = "Meh";
  HitResult2[HitResult2["Ok"] = 3] = "Ok";
  HitResult2[HitResult2["Good"] = 4] = "Good";
  HitResult2[HitResult2["Great"] = 5] = "Great";
  HitResult2[HitResult2["Perfect"] = 6] = "Perfect";
  HitResult2[HitResult2["SmallTickMiss"] = 7] = "SmallTickMiss";
  HitResult2[HitResult2["SmallTickHit"] = 8] = "SmallTickHit";
  HitResult2[HitResult2["LargeTickMiss"] = 9] = "LargeTickMiss";
  HitResult2[HitResult2["LargeTickHit"] = 10] = "LargeTickHit";
  HitResult2[HitResult2["SmallBonus"] = 11] = "SmallBonus";
  HitResult2[HitResult2["LargeBonus"] = 12] = "LargeBonus";
  HitResult2[HitResult2["IgnoreMiss"] = 13] = "IgnoreMiss";
  HitResult2[HitResult2["IgnoreHit"] = 14] = "IgnoreHit";
})(HitResult || (HitResult = {}));
var ScoreRank;
(function(ScoreRank2) {
  ScoreRank2[ScoreRank2["F"] = 0] = "F";
  ScoreRank2[ScoreRank2["D"] = 1] = "D";
  ScoreRank2[ScoreRank2["C"] = 2] = "C";
  ScoreRank2[ScoreRank2["B"] = 3] = "B";
  ScoreRank2[ScoreRank2["A"] = 4] = "A";
  ScoreRank2[ScoreRank2["S"] = 5] = "S";
  ScoreRank2[ScoreRank2["SH"] = 6] = "SH";
  ScoreRank2[ScoreRank2["X"] = 7] = "X";
  ScoreRank2[ScoreRank2["XH"] = 8] = "XH";
})(ScoreRank || (ScoreRank = {}));
var _a;
var HitWindows = class {
  constructor() {
    this._perfect = 0;
    this._great = 0;
    this._good = 0;
    this._ok = 0;
    this._meh = 0;
    this._miss = 0;
  }
  _lowestSuccessfulHitResult() {
    for (let result = HitResult.Meh; result <= HitResult.Perfect; ++result) {
      if (this.isHitResultAllowed(result)) {
        return result;
      }
    }
    return HitResult.None;
  }
  *getAllAvailableWindows() {
    for (let result = HitResult.Meh; result <= HitResult.Perfect; ++result) {
      if (this.isHitResultAllowed(result)) {
        yield [result, this.windowFor(result)];
      }
    }
  }
  isHitResultAllowed(result) {
    return true;
  }
  setDifficulty(difficulty) {
    for (const range of this._getRanges()) {
      const value = DifficultyRange.map(difficulty, range.min, range.average, range.max);
      switch (range.result) {
        case HitResult.Miss:
          this._miss = value;
          break;
        case HitResult.Meh:
          this._meh = value;
          break;
        case HitResult.Ok:
          this._ok = value;
          break;
        case HitResult.Good:
          this._good = value;
          break;
        case HitResult.Great:
          this._great = value;
          break;
        case HitResult.Perfect:
          this._perfect = value;
          break;
      }
    }
  }
  resultFor(timeOffset) {
    timeOffset = Math.abs(timeOffset);
    for (let result = HitResult.Perfect; result >= HitResult.Miss; --result) {
      if (this.isHitResultAllowed(result) && timeOffset <= this.windowFor(result)) {
        return result;
      }
    }
    return HitResult.None;
  }
  windowFor(result) {
    switch (result) {
      case HitResult.Perfect:
        return this._perfect;
      case HitResult.Great:
        return this._great;
      case HitResult.Good:
        return this._good;
      case HitResult.Ok:
        return this._ok;
      case HitResult.Meh:
        return this._meh;
      case HitResult.Miss:
        return this._miss;
      default:
        throw new Error("Unknown enum member");
    }
  }
  canBeHit(timeOffset) {
    return timeOffset <= this.windowFor(this._lowestSuccessfulHitResult());
  }
  _getRanges() {
    return HitWindows._BASE_RANGES;
  }
};
HitWindows._BASE_RANGES = [
  new DifficultyRange(HitResult.Perfect, 22.4, 19.4, 13.9),
  new DifficultyRange(HitResult.Great, 64, 49, 34),
  new DifficultyRange(HitResult.Good, 97, 82, 67),
  new DifficultyRange(HitResult.Ok, 127, 112, 97),
  new DifficultyRange(HitResult.Meh, 151, 136, 121),
  new DifficultyRange(HitResult.Miss, 188, 173, 158)
];
HitWindows.EmptyHitWindows = (_a = class EmptyHitWindows extends HitWindows {
  isHitResultAllowed(result) {
    switch (result) {
      case HitResult.Perfect:
      case HitResult.Miss:
        return true;
    }
    return false;
  }
  _getRanges() {
    return EmptyHitWindows._ranges;
  }
}, _a._ranges = [
  new DifficultyRange(HitResult.Perfect, 0, 0, 0),
  new DifficultyRange(HitResult.Miss, 0, 0, 0)
], _a);
HitWindows.empty = new HitWindows.EmptyHitWindows();
var CommandType;
(function(CommandType2) {
  CommandType2["None"] = "";
  CommandType2["Movement"] = "M";
  CommandType2["MovementX"] = "MX";
  CommandType2["MovementY"] = "MY";
  CommandType2["Fade"] = "F";
  CommandType2["Scale"] = "S";
  CommandType2["VectorScale"] = "V";
  CommandType2["Rotation"] = "R";
  CommandType2["Colour"] = "C";
  CommandType2["Parameter"] = "P";
})(CommandType || (CommandType = {}));
var Easing;
(function(Easing2) {
  Easing2[Easing2["None"] = 0] = "None";
  Easing2[Easing2["Out"] = 1] = "Out";
  Easing2[Easing2["In"] = 2] = "In";
  Easing2[Easing2["InQuad"] = 3] = "InQuad";
  Easing2[Easing2["OutQuad"] = 4] = "OutQuad";
  Easing2[Easing2["InOutQuad"] = 5] = "InOutQuad";
  Easing2[Easing2["InCubic"] = 6] = "InCubic";
  Easing2[Easing2["OutCubic"] = 7] = "OutCubic";
  Easing2[Easing2["InOutCubic"] = 8] = "InOutCubic";
  Easing2[Easing2["InQuart"] = 9] = "InQuart";
  Easing2[Easing2["OutQuart"] = 10] = "OutQuart";
  Easing2[Easing2["InOutQuart"] = 11] = "InOutQuart";
  Easing2[Easing2["InQuint"] = 12] = "InQuint";
  Easing2[Easing2["OutQuint"] = 13] = "OutQuint";
  Easing2[Easing2["InOutQuint"] = 14] = "InOutQuint";
  Easing2[Easing2["InSine"] = 15] = "InSine";
  Easing2[Easing2["OutSine"] = 16] = "OutSine";
  Easing2[Easing2["InOutSine"] = 17] = "InOutSine";
  Easing2[Easing2["InExpo"] = 18] = "InExpo";
  Easing2[Easing2["OutExpo"] = 19] = "OutExpo";
  Easing2[Easing2["InOutExpo"] = 20] = "InOutExpo";
  Easing2[Easing2["InCirc"] = 21] = "InCirc";
  Easing2[Easing2["OutCirc"] = 22] = "OutCirc";
  Easing2[Easing2["InOutCirc"] = 23] = "InOutCirc";
  Easing2[Easing2["InElastic"] = 24] = "InElastic";
  Easing2[Easing2["OutElastic"] = 25] = "OutElastic";
  Easing2[Easing2["OutElasticHalf"] = 26] = "OutElasticHalf";
  Easing2[Easing2["OutElasticQuarter"] = 27] = "OutElasticQuarter";
  Easing2[Easing2["InOutElastic"] = 28] = "InOutElastic";
  Easing2[Easing2["InBack"] = 29] = "InBack";
  Easing2[Easing2["OutBack"] = 30] = "OutBack";
  Easing2[Easing2["InOutBack"] = 31] = "InOutBack";
  Easing2[Easing2["InBounce"] = 32] = "InBounce";
  Easing2[Easing2["OutBounce"] = 33] = "OutBounce";
  Easing2[Easing2["InOutBounce"] = 34] = "InOutBounce";
})(Easing || (Easing = {}));
var Command = class {
  constructor() {
    this.type = CommandType.None;
    this.easing = Easing.None;
    this.startTime = 0;
    this._endTime = 0;
  }
  get endTime() {
    return this._endTime || this.startTime;
  }
  set endTime(value) {
    this._endTime = value;
  }
  get acronym() {
    return this.type;
  }
  get duration() {
    return this.endTime - this.startTime;
  }
};
var ParameterType;
(function(ParameterType2) {
  ParameterType2["None"] = "";
  ParameterType2["HorizontalFlip"] = "H";
  ParameterType2["VerticalFlip"] = "V";
  ParameterType2["BlendingMode"] = "A";
})(ParameterType || (ParameterType = {}));
var ParameterCommand = class extends Command {
  constructor() {
    super(...arguments);
    this.type = CommandType.Parameter;
    this.parameter = ParameterType.None;
  }
  get acronym() {
    return "P";
  }
};
var BlendingCommand = class extends ParameterCommand {
  constructor() {
    super(...arguments);
    this.parameter = ParameterType.BlendingMode;
  }
  get parameterAcronym() {
    return "A";
  }
};
var ColourCommand = class extends Command {
  constructor() {
    super(...arguments);
    this.type = CommandType.Colour;
    this._startRed = 0;
    this._startGreen = 0;
    this._startBlue = 0;
    this.endRed = 0;
    this.endGreen = 0;
    this.endBlue = 0;
    this._startColour = new Colour();
    this._endColour = new Colour();
  }
  get startRed() {
    return this._startRed;
  }
  set startRed(value) {
    this._startRed = value;
    this.endRed = value;
  }
  get startGreen() {
    return this._startGreen;
  }
  set startGreen(value) {
    this._startGreen = value;
    this.endGreen = value;
  }
  get startBlue() {
    return this._startBlue;
  }
  set startBlue(value) {
    this._startBlue = value;
    this.endBlue = value;
  }
  get startColour() {
    this._startColour.red = this.startRed;
    this._startColour.green = this.startGreen;
    this._startColour.blue = this.startBlue;
    return this._startColour;
  }
  get endColour() {
    this._endColour.red = this.endRed;
    this._endColour.green = this.endGreen;
    this._endColour.blue = this.endBlue;
    return this._endColour;
  }
  get acronym() {
    return "C";
  }
};
var FadeCommand = class extends Command {
  constructor() {
    super(...arguments);
    this.type = CommandType.Fade;
    this._startOpacity = 1;
    this.endOpacity = 1;
  }
  get startOpacity() {
    return this._startOpacity;
  }
  set startOpacity(value) {
    this._startOpacity = value;
    this.endOpacity = value;
  }
  get acronym() {
    return "F";
  }
};
var HorizontalFlipCommand = class extends ParameterCommand {
  constructor() {
    super(...arguments);
    this.parameter = ParameterType.HorizontalFlip;
  }
  get parameterAcronym() {
    return "H";
  }
};
var MoveCommand = class extends Command {
  constructor() {
    super(...arguments);
    this.type = CommandType.Movement;
    this.startPosition = new Vector2(0, 0);
    this.endPosition = new Vector2(0, 0);
  }
  get startX() {
    return this.startPosition.x;
  }
  set startX(value) {
    this.startPosition.x = value;
    this.endPosition.x = value;
  }
  get startY() {
    return this.startPosition.y;
  }
  set startY(value) {
    this.startPosition.y = value;
    this.endPosition.y = value;
  }
  get endX() {
    return this.endPosition.x;
  }
  set endX(value) {
    this.endPosition.x = value;
  }
  get endY() {
    return this.endPosition.y;
  }
  set endY(value) {
    this.endPosition.y = value;
  }
  get acronym() {
    return "M";
  }
};
var MoveXCommand = class extends Command {
  constructor() {
    super(...arguments);
    this.type = CommandType.MovementX;
    this._startX = 0;
    this.endX = 0;
  }
  get startX() {
    return this._startX;
  }
  set startX(value) {
    this._startX = value;
    this.endX = value;
  }
  get acronym() {
    return "MX";
  }
};
var MoveYCommand = class extends Command {
  constructor() {
    super(...arguments);
    this.type = CommandType.MovementY;
    this._startY = 0;
    this.endY = 0;
  }
  get startY() {
    return this._startY;
  }
  set startY(value) {
    this._startY = value;
    this.endY = value;
  }
  get acronym() {
    return "MY";
  }
};
var RotateCommand = class extends Command {
  constructor() {
    super(...arguments);
    this.type = CommandType.Rotation;
    this._startRotate = 0;
    this.endRotate = 0;
  }
  get startRotate() {
    return this._startRotate;
  }
  set startRotate(value) {
    this._startRotate = value;
    this.endRotate = value;
  }
  get acronym() {
    return "R";
  }
};
var ScaleCommand = class extends Command {
  constructor() {
    super(...arguments);
    this.type = CommandType.Scale;
    this._startScaling = 1;
    this.endScaling = 1;
    this._startScale = new Vector2(1, 1);
    this._endScale = new Vector2(1, 1);
  }
  get startScaling() {
    return this._startScaling;
  }
  set startScaling(value) {
    this._startScaling = value;
    this.endScaling = value;
  }
  get startScale() {
    this._startScale.x = this.startScaling;
    this._startScale.y = this.startScaling;
    return this._startScale;
  }
  get endScale() {
    this._endScale.x = this.endScaling;
    this._endScale.y = this.endScaling;
    return this._endScale;
  }
  get acronym() {
    return "S";
  }
};
var VectorScaleCommand = class extends Command {
  constructor() {
    super(...arguments);
    this.type = CommandType.VectorScale;
    this._startScaleX = 1;
    this._startScaleY = 1;
    this.endScaleX = 1;
    this.endScaleY = 1;
    this._startScale = new Vector2(1, 1);
    this._endScale = new Vector2(1, 1);
  }
  get startScaleX() {
    return this._startScaleX;
  }
  set startScaleX(value) {
    this._startScaleX = value;
    this.endScaleX = value;
  }
  get startScaleY() {
    return this._startScaleY;
  }
  set startScaleY(value) {
    this._startScaleY = value;
    this.endScaleY = value;
  }
  get startScale() {
    this._startScale.x = this.startScaleX;
    this._startScale.y = this.startScaleY;
    return this._startScale;
  }
  get endScale() {
    this._endScale.x = this.endScaleX;
    this._endScale.y = this.endScaleY;
    return this._endScale;
  }
  get acronym() {
    return "V";
  }
};
var VerticalFlipCommand = class extends ParameterCommand {
  constructor() {
    super(...arguments);
    this.parameter = ParameterType.VerticalFlip;
  }
  get parameterAcronym() {
    return "V";
  }
};
var CompoundType;
(function(CompoundType2) {
  CompoundType2["None"] = "";
  CompoundType2["Loop"] = "L";
  CompoundType2["Trigger"] = "T";
})(CompoundType || (CompoundType = {}));
var Compound = class {
  constructor() {
    this.type = CompoundType.None;
    this.commands = [];
  }
  get commandsStartTime() {
    const timeLine = this.commands.map((c) => c.startTime);
    timeLine.sort((a, b) => a - b);
    return timeLine[0];
  }
  get commandsEndTime() {
    const timeLine = this.commands.map((c) => c.endTime);
    timeLine.sort((a, b) => b - a);
    return timeLine[0];
  }
  get commandsDuration() {
    return this.commandsEndTime - this.commandsStartTime;
  }
};
var CommandLoop = class extends Compound {
  constructor(loopStartTime, loopCount) {
    super();
    this.type = CompoundType.Loop;
    this.loopStartTime = loopStartTime || 0;
    this.loopCount = loopCount || 0;
  }
  get startTime() {
    return this.loopStartTime + this.commandsStartTime;
  }
  get endTime() {
    return this.startTime + this.commandsDuration * this.loopCount;
  }
};
var CommandTrigger = class extends Compound {
  constructor(triggerName, startTime, endTime, groupNumber) {
    super();
    this.type = CompoundType.Trigger;
    this.triggerName = triggerName || "";
    this.startTime = startTime || 0;
    this.endTime = endTime || 0;
    this.groupNumber = groupNumber || 0;
  }
};
var Origins;
(function(Origins2) {
  Origins2[Origins2["TopLeft"] = 0] = "TopLeft";
  Origins2[Origins2["Centre"] = 1] = "Centre";
  Origins2[Origins2["CentreLeft"] = 2] = "CentreLeft";
  Origins2[Origins2["TopRight"] = 3] = "TopRight";
  Origins2[Origins2["BottomCentre"] = 4] = "BottomCentre";
  Origins2[Origins2["TopCentre"] = 5] = "TopCentre";
  Origins2[Origins2["Custom"] = 6] = "Custom";
  Origins2[Origins2["CentreRight"] = 7] = "CentreRight";
  Origins2[Origins2["BottomLeft"] = 8] = "BottomLeft";
  Origins2[Origins2["BottomRight"] = 9] = "BottomRight";
})(Origins || (Origins = {}));
var LayerType;
(function(LayerType2) {
  LayerType2[LayerType2["Background"] = 0] = "Background";
  LayerType2[LayerType2["Fail"] = 1] = "Fail";
  LayerType2[LayerType2["Pass"] = 2] = "Pass";
  LayerType2[LayerType2["Foreground"] = 3] = "Foreground";
  LayerType2[LayerType2["Overlay"] = 4] = "Overlay";
  LayerType2[LayerType2["Samples"] = 5] = "Samples";
})(LayerType || (LayerType = {}));
var StoryboardSprite = class {
  constructor() {
    this.layer = LayerType.Background;
    this.origin = Origins.Custom;
    this.startPosition = new Vector2(0, 0);
    this.filePath = "";
    this.commands = [];
    this.loops = [];
    this.triggers = [];
  }
  get startX() {
    return this.startPosition.x;
  }
  set startX(value) {
    this.startPosition.x = value;
  }
  get startY() {
    return this.startPosition.y;
  }
  set startY(value) {
    this.startPosition.y = value;
  }
  get startTime() {
    const commands = this.commands.slice();
    const loops = this.loops.filter((l) => l.commands.length);
    const commandsStart = commands.reduce((minStart, command) => {
      return minStart > command.startTime ? command.startTime : minStart;
    }, Infinity);
    const loopsStart = loops.reduce((minStart, loop) => {
      const minLoopStart = loop.commands.reduce((min, command) => {
        return min > command.startTime ? command.startTime : min;
      }, Infinity);
      return minStart > minLoopStart ? minLoopStart : minStart;
    }, Infinity);
    return Math.min(commandsStart, loopsStart);
  }
  get endTime() {
    const commands = this.commands.slice();
    const loops = this.loops.filter((l) => l.commands.length);
    const commandsStart = commands.reduce((maxStart, command) => {
      return maxStart < command.startTime ? command.startTime : maxStart;
    }, -Infinity);
    const loopsStart = loops.reduce((maxStart, loop) => {
      const maxLoopStart = loop.commands.reduce((max2, command) => {
        return max2 < command.startTime ? command.startTime : max2;
      }, -Infinity);
      return maxStart < maxLoopStart ? maxLoopStart : maxStart;
    }, -Infinity);
    return Math.max(commandsStart, loopsStart);
  }
};
var LoopType;
(function(LoopType2) {
  LoopType2[LoopType2["LoopForever"] = 0] = "LoopForever";
  LoopType2[LoopType2["LoopOnce"] = 1] = "LoopOnce";
})(LoopType || (LoopType = {}));
var StoryboardAnimation = class extends StoryboardSprite {
  constructor() {
    super(...arguments);
    this.frames = 0;
    this.frameDelay = 0;
    this.loop = LoopType.LoopForever;
  }
};
var StoryboardSample = class {
  constructor() {
    this.layer = LayerType.Samples;
    this.startTime = 0;
    this.volume = 100;
    this.filePath = "";
  }
};
var BlendingMode;
(function(BlendingMode2) {
  BlendingMode2[BlendingMode2["AdditiveBlending"] = 0] = "AdditiveBlending";
  BlendingMode2[BlendingMode2["AlphaBlending"] = 1] = "AlphaBlending";
})(BlendingMode || (BlendingMode = {}));
var EventType;
(function(EventType2) {
  EventType2[EventType2["Background"] = 0] = "Background";
  EventType2[EventType2["Video"] = 1] = "Video";
  EventType2[EventType2["Break"] = 2] = "Break";
  EventType2[EventType2["Colour"] = 3] = "Colour";
  EventType2[EventType2["Sprite"] = 4] = "Sprite";
  EventType2[EventType2["Sample"] = 5] = "Sample";
  EventType2[EventType2["Animation"] = 6] = "Animation";
  EventType2[EventType2["StoryboardCommand"] = 7] = "StoryboardCommand";
})(EventType || (EventType = {}));
var Storyboard = class {
  constructor() {
    this.background = [];
    this.fail = [];
    this.pass = [];
    this.foreground = [];
    this.overlay = [];
    this.samples = [];
    this.variables = {};
  }
  getLayer(type) {
    switch (type) {
      case LayerType.Fail:
        return this.fail;
      case LayerType.Pass:
        return this.pass;
      case LayerType.Foreground:
        return this.foreground;
      case LayerType.Overlay:
        return this.overlay;
      case LayerType.Samples:
        return this.samples;
    }
    return this.background;
  }
};

// lib/osu-parsers.js
var Parsing = class {
  static parseInt(input, parseLimit = this.MAX_PARSE_VALUE) {
    return this._getValue(parseInt(input), parseLimit);
  }
  static parseFloat(input, parseLimit = this.MAX_PARSE_VALUE) {
    return this._getValue(parseFloat(input), parseLimit);
  }
  static _getValue(value, parseLimit = this.MAX_PARSE_VALUE) {
    if (value < -parseLimit) {
      throw new Error("Value is too low!");
    }
    if (value > parseLimit) {
      throw new Error("Value is too high!");
    }
    if (Number.isNaN(value)) {
      throw new Error("Not a number");
    }
    return value;
  }
};
Parsing.MAX_COORDINATE_VALUE = 131072;
Parsing.MAX_PARSE_VALUE = 2147483647;
var ColourDecoder = class {
  static handleLine(line, beatmap) {
    const [key, ...values] = line.split(":").map((v) => v.trim());
    const value = values.join(" ").split(",").map((c) => Parsing.parseInt(c));
    const colour = new Colour(value[0], value[1], value[2]);
    switch (key) {
      case "SliderTrackOverride":
        beatmap.colours.sliderTrackColor = colour;
        break;
      case "SliderBorder":
        beatmap.colours.sliderBorderColor = colour;
        break;
      default:
        beatmap.colours.comboColours.push(colour);
    }
  }
};
var DifficultyDecoder = class {
  static handleLine(line, beatmap) {
    const [key, ...values] = line.split(":").map((v) => v.trim());
    const value = values.join(" ");
    switch (key) {
      case "CircleSize":
        beatmap.difficulty.circleSize = Parsing.parseFloat(value);
        break;
      case "HPDrainRate":
        beatmap.difficulty.drainRate = Parsing.parseFloat(value);
        break;
      case "OverallDifficulty":
        beatmap.difficulty.overallDifficulty = Parsing.parseFloat(value);
        break;
      case "ApproachRate":
        beatmap.difficulty.approachRate = Parsing.parseFloat(value);
        break;
      case "SliderMultiplier":
        beatmap.difficulty.sliderMultiplier = Parsing.parseFloat(value);
        break;
      case "SliderTickRate":
        beatmap.difficulty.sliderTickRate = Parsing.parseFloat(value);
    }
  }
};
var EditorDecoder = class {
  static handleLine(line, beatmap) {
    const [key, ...values] = line.split(":").map((v) => v.trim());
    const value = values.join(" ");
    switch (key) {
      case "Bookmarks":
        beatmap.editor.bookmarks = value.split(",").map((v) => +v);
        break;
      case "DistanceSpacing":
        beatmap.editor.distanceSpacing = Math.max(0, Parsing.parseFloat(value));
        break;
      case "BeatDivisor":
        beatmap.editor.beatDivisor = Parsing.parseInt(value);
        break;
      case "GridSize":
        beatmap.editor.gridSize = Parsing.parseInt(value);
        break;
      case "TimelineZoom":
        beatmap.editor.timelineZoom = Math.max(0, Parsing.parseFloat(value));
    }
  }
};
var GeneralDecoder = class {
  static handleLine(line, beatmap, offset) {
    const [key, ...values] = line.split(":").map((v) => v.trim());
    const value = values.join(" ");
    switch (key) {
      case "AudioFilename":
        beatmap.general.audioFilename = value;
        break;
      case "AudioHash":
        beatmap.general.audioHash = value;
        break;
      case "OverlayPosition":
        beatmap.general.overlayPosition = value;
        break;
      case "SkinPreference":
        beatmap.general.skinPreference = value;
        break;
      case "AudioLeadIn":
        beatmap.general.audioLeadIn = Parsing.parseInt(value);
        break;
      case "PreviewTime":
        beatmap.general.previewTime = Parsing.parseInt(value) + offset;
        break;
      case "Countdown":
        beatmap.general.countdown = Parsing.parseInt(value);
        break;
      case "StackLeniency":
        beatmap.general.stackLeniency = Parsing.parseFloat(value);
        break;
      case "Mode":
        beatmap.originalMode = Parsing.parseInt(value);
        break;
      case "CountdownOffset":
        beatmap.general.countdownOffset = Parsing.parseInt(value);
        break;
      case "SampleSet":
        beatmap.general.sampleSet = SampleSet[value];
        break;
      case "LetterboxInBreaks":
        beatmap.general.letterboxInBreaks = !!value;
        break;
      case "StoryFireInFront":
        beatmap.general.storyFireInFront = !!value;
        break;
      case "UseSkinSprites":
        beatmap.general.useSkinSprites = !!value;
        break;
      case "AlwaysShowPlayfield":
        beatmap.general.alwaysShowPlayfield = !!value;
        break;
      case "EpilepsyWarning":
        beatmap.general.epilepsyWarning = !!value;
        break;
      case "SpecialStyle":
        beatmap.general.specialStyle = !!value;
        break;
      case "WidescreenStoryboard":
        beatmap.general.widescreenStoryboard = !!value;
        break;
      case "SamplesMatchPlaybackRate":
        beatmap.general.samplesMatchPlaybackRate = !!value;
    }
  }
};
var HittableObject = class extends HitObject {
};
var HoldableObject = class extends HitObject {
  constructor() {
    super(...arguments);
    this.endTime = 0;
    this.nodeSamples = [];
  }
  get duration() {
    return this.endTime - this.startTime;
  }
  clone() {
    const cloned = super.clone();
    cloned.endTime = this.endTime;
    cloned.nestedHitObjects = this.nestedHitObjects.map((h) => h.clone());
    cloned.nodeSamples = this.nodeSamples.map((n) => n.map((s) => s.clone()));
    return cloned;
  }
};
var SlidableObject = class extends HitObject {
  constructor() {
    super(...arguments);
    this.repeats = 0;
    this.velocity = 1;
    this.path = new SliderPath();
    this.legacyLastTickOffset = 36;
    this.nodeSamples = [];
  }
  get duration() {
    return this.spans * this.spanDuration;
  }
  get endTime() {
    return this.startTime + this.duration;
  }
  get spans() {
    return this.repeats + 1;
  }
  set spans(value) {
    this.repeats = value - 1;
  }
  get spanDuration() {
    return this.distance / this.velocity;
  }
  get distance() {
    return this.path.distance;
  }
  set distance(value) {
    this.path.distance = value;
  }
  applyDefaultsToSelf(controlPoints, difficulty) {
    super.applyDefaultsToSelf(controlPoints, difficulty);
    const timingPoint = controlPoints.timingPointAt(this.startTime);
    const difficultyPoint = controlPoints.difficultyPointAt(this.startTime);
    const scoringDistance = SlidableObject.BASE_SCORING_DISTANCE * difficulty.sliderMultiplier * difficultyPoint.speedMultiplier;
    this.velocity = scoringDistance / timingPoint.beatLength;
  }
  clone() {
    const cloned = super.clone();
    cloned.legacyLastTickOffset = this.legacyLastTickOffset;
    cloned.nodeSamples = this.nodeSamples.map((n) => n.map((s) => s.clone()));
    cloned.velocity = this.velocity;
    cloned.repeats = this.repeats;
    cloned.path = this.path.clone();
    return cloned;
  }
};
SlidableObject.BASE_SCORING_DISTANCE = 100;
var SpinnableObject = class extends HitObject {
  constructor() {
    super(...arguments);
    this.endTime = 0;
  }
  get duration() {
    return this.endTime - this.startTime;
  }
  clone() {
    const cloned = super.clone();
    cloned.endTime = this.endTime;
    return cloned;
  }
};
var HitObjectDecoder = class {
  static handleLine(line, beatmap, offset) {
    const data = line.split(",").map((v) => v.trim());
    const hitType = Parsing.parseInt(data[3]);
    const hitObject = HitObjectDecoder.createHitObject(hitType);
    hitObject.startX = Parsing.parseInt(data[0], Parsing.MAX_COORDINATE_VALUE);
    hitObject.startY = Parsing.parseInt(data[1], Parsing.MAX_COORDINATE_VALUE);
    hitObject.startTime = Parsing.parseFloat(data[2]) + offset;
    hitObject.hitType = hitType;
    hitObject.hitSound = Parsing.parseInt(data[4]);
    const bankInfo = new SampleBank();
    HitObjectDecoder.addExtras(data.slice(5), hitObject, bankInfo, offset);
    if (hitObject.samples.length === 0) {
      hitObject.samples = this.convertSoundType(hitObject.hitSound, bankInfo);
    }
    beatmap.hitObjects.push(hitObject);
  }
  static addExtras(data, hitObject, bankInfo, offset) {
    if (hitObject.hitType & HitType.Normal && data.length > 0) {
      this.readCustomSampleBanks(data[0], bankInfo);
    }
    if (hitObject.hitType & HitType.Slider) {
      return HitObjectDecoder.addSliderExtras(data, hitObject, bankInfo);
    }
    if (hitObject.hitType & HitType.Spinner) {
      return HitObjectDecoder.addSpinnerExtras(data, hitObject, bankInfo, offset);
    }
    if (hitObject.hitType & HitType.Hold) {
      return HitObjectDecoder.addHoldExtras(data, hitObject, bankInfo, offset);
    }
  }
  static addSliderExtras(extras, slider, bankInfo) {
    const pathString = extras[0];
    const offset = slider.startPosition;
    const repeats = Parsing.parseInt(extras[1]);
    if (slider.repeats > 9e3) {
      throw new Error("Repeat count is way too high");
    }
    slider.repeats = Math.max(0, repeats - 1);
    slider.path.controlPoints = HitObjectDecoder.convertPathString(pathString, offset);
    slider.path.curveType = slider.path.controlPoints[0].type;
    if (extras.length > 2) {
      const length = Parsing.parseFloat(extras[2], Parsing.MAX_COORDINATE_VALUE);
      slider.path.expectedDistance = Math.max(0, length);
    }
    if (extras.length > 5) {
      this.readCustomSampleBanks(extras[5], bankInfo);
    }
    slider.samples = this.convertSoundType(slider.hitSound, bankInfo);
    slider.nodeSamples = this.getSliderNodeSamples(extras, slider, bankInfo);
  }
  static addSpinnerExtras(extras, spinner, bankInfo, offset) {
    spinner.endTime = Parsing.parseInt(extras[0]) + offset;
    if (extras.length > 1) {
      this.readCustomSampleBanks(extras[1], bankInfo);
    }
  }
  static addHoldExtras(extras, hold, bankInfo, offset) {
    hold.endTime = hold.startTime;
    if (extras.length > 0 && extras[0]) {
      const ss = extras[0].split(":");
      hold.endTime = Math.max(hold.endTime, Parsing.parseFloat(ss[0])) + offset;
      this.readCustomSampleBanks(ss.slice(1).join(":"), bankInfo);
    }
  }
  static getSliderNodeSamples(extras, slider, bankInfo) {
    const nodes = slider.repeats + 2;
    const nodeBankInfos = [];
    for (let i = 0; i < nodes; ++i) {
      nodeBankInfos.push(bankInfo.clone());
    }
    if (extras.length > 4 && extras[4].length > 0) {
      const sets = extras[4].split("|");
      for (let i = 0; i < nodes; ++i) {
        if (i >= sets.length) {
          break;
        }
        this.readCustomSampleBanks(sets[i], nodeBankInfos[i]);
      }
    }
    const nodeSoundTypes = [];
    for (let i = 0; i < nodes; ++i) {
      nodeSoundTypes.push(slider.hitSound);
    }
    if (extras.length > 3 && extras[3].length > 0) {
      const adds = extras[3].split("|");
      for (let i = 0; i < nodes; ++i) {
        if (i >= adds.length) {
          break;
        }
        nodeSoundTypes[i] = parseInt(adds[i]) || HitSound.None;
      }
    }
    const nodeSamples = [];
    for (let i = 0; i < nodes; i++) {
      nodeSamples.push(this.convertSoundType(nodeSoundTypes[i], nodeBankInfos[i]));
    }
    return nodeSamples;
  }
  static convertPathString(pathString, offset) {
    const pathSplit = pathString.split("|").map((p) => p.trim());
    const controlPoints = [];
    let startIndex = 0;
    let endIndex = 0;
    let isFirst = true;
    while (++endIndex < pathSplit.length) {
      if (pathSplit[endIndex].length > 1) {
        continue;
      }
      const points = pathSplit.slice(startIndex, endIndex);
      const endPoint = endIndex < pathSplit.length - 1 ? pathSplit[endIndex + 1] : null;
      const convertedPoints = HitObjectDecoder.convertPoints(points, endPoint, isFirst, offset);
      for (const point of convertedPoints) {
        controlPoints.push(...point);
      }
      startIndex = endIndex;
      isFirst = false;
    }
    if (endIndex > startIndex) {
      const points = pathSplit.slice(startIndex, endIndex);
      const convertedPoints = HitObjectDecoder.convertPoints(points, null, isFirst, offset);
      for (const point of convertedPoints) {
        controlPoints.push(...point);
      }
    }
    return controlPoints;
  }
  static *convertPoints(points, endPoint, isFirst, offset) {
    const readOffset = isFirst ? 1 : 0;
    const endPointLength = endPoint !== null ? 1 : 0;
    const vertices = [];
    if (readOffset === 1) {
      vertices[0] = new PathPoint();
    }
    for (let i = 1; i < points.length; ++i) {
      vertices[readOffset + i - 1] = readPoint(points[i], offset);
    }
    if (endPoint !== null) {
      vertices[vertices.length - 1] = readPoint(endPoint, offset);
    }
    let type = HitObjectDecoder.convertPathType(points[0]);
    if (type === PathType.PerfectCurve) {
      if (vertices.length !== 3) {
        type = PathType.Bezier;
      } else if (isLinear(vertices)) {
        type = PathType.Linear;
      }
    }
    vertices[0].type = type;
    let startIndex = 0;
    let endIndex = 0;
    while (++endIndex < vertices.length - endPointLength) {
      if (!vertices[endIndex].position.equals(vertices[endIndex - 1].position)) {
        continue;
      }
      if (endIndex === vertices.length - endPointLength - 1) {
        continue;
      }
      vertices[endIndex - 1].type = type;
      yield vertices.slice(startIndex, endIndex);
      startIndex = endIndex + 1;
    }
    if (endIndex > startIndex) {
      yield vertices.slice(startIndex, endIndex);
    }
    function readPoint(point, offset2) {
      const coords = point.split(":").map((v) => {
        return Parsing.parseFloat(v, Parsing.MAX_COORDINATE_VALUE);
      });
      const pos = new Vector2(coords[0], coords[1]).subtract(offset2);
      return new PathPoint(pos);
    }
    function isLinear(p) {
      const yx = (p[1].position.y - p[0].position.y) * (p[2].position.x - p[0].position.x);
      const xy = (p[1].position.x - p[0].position.x) * (p[2].position.y - p[0].position.y);
      const acceptableDifference = 1e-3;
      return Math.abs(yx - xy) < acceptableDifference;
    }
  }
  static convertPathType(type) {
    switch (type) {
      default:
      case "C":
        return PathType.Catmull;
      case "B":
        return PathType.Bezier;
      case "L":
        return PathType.Linear;
      case "P":
        return PathType.PerfectCurve;
    }
  }
  static readCustomSampleBanks(hitSample, bankInfo) {
    if (!hitSample) {
      return;
    }
    const split = hitSample.split(":");
    bankInfo.normalSet = Parsing.parseInt(split[0]);
    bankInfo.additionSet = Parsing.parseInt(split[1]);
    if (bankInfo.additionSet === SampleSet.None) {
      bankInfo.additionSet = bankInfo.normalSet;
    }
    if (split.length > 2) {
      bankInfo.customIndex = Parsing.parseInt(split[2]);
    }
    if (split.length > 3) {
      bankInfo.volume = Math.max(0, Parsing.parseInt(split[3]));
    }
    bankInfo.filename = split.length > 4 ? split[4] : "";
  }
  static convertSoundType(type, bankInfo) {
    if (bankInfo.filename) {
      const sample = new HitSample();
      sample.filename = bankInfo.filename;
      sample.volume = bankInfo.volume;
      return [sample];
    }
    const soundTypes = [new HitSample()];
    soundTypes[0].hitSound = HitSound[HitSound.Normal];
    soundTypes[0].sampleSet = SampleSet[bankInfo.normalSet];
    soundTypes[0].isLayered = type !== HitSound.None && !(type & HitSound.Normal);
    if (type & HitSound.Finish) {
      const sample = new HitSample();
      sample.hitSound = HitSound[HitSound.Finish];
      soundTypes.push(sample);
    }
    if (type & HitSound.Whistle) {
      const sample = new HitSample();
      sample.hitSound = HitSound[HitSound.Whistle];
      soundTypes.push(sample);
    }
    if (type & HitSound.Clap) {
      const sample = new HitSample();
      sample.hitSound = HitSound[HitSound.Clap];
      soundTypes.push(sample);
    }
    soundTypes.forEach((sound, i) => {
      sound.sampleSet = i !== 0 ? SampleSet[bankInfo.additionSet] : SampleSet[bankInfo.normalSet];
      sound.volume = bankInfo.volume;
      sound.customIndex = 0;
      if (bankInfo.customIndex >= 2) {
        sound.customIndex = bankInfo.customIndex;
      }
    });
    return soundTypes;
  }
  static createHitObject(hitType) {
    if (hitType & HitType.Normal) {
      return new HittableObject();
    }
    if (hitType & HitType.Slider) {
      return new SlidableObject();
    }
    if (hitType & HitType.Spinner) {
      return new SpinnableObject();
    }
    if (hitType & HitType.Hold) {
      return new HoldableObject();
    }
    throw new Error(`Unknown hit object type: ${hitType}!`);
  }
};
var MetadataDecoder = class {
  static handleLine(line, beatmap) {
    const [key, ...values] = line.split(":").map((v) => v.trim());
    const value = values.join(" ");
    switch (key) {
      case "Title":
        beatmap.metadata.title = value;
        break;
      case "TitleUnicode":
        beatmap.metadata.titleUnicode = value;
        break;
      case "Artist":
        beatmap.metadata.artist = value;
        break;
      case "ArtistUnicode":
        beatmap.metadata.artistUnicode = value;
        break;
      case "Creator":
        beatmap.metadata.creator = value;
        break;
      case "Version":
        beatmap.metadata.version = value;
        break;
      case "Source":
        beatmap.metadata.source = value;
        break;
      case "Tags":
        beatmap.metadata.tags = value.split(" ");
        break;
      case "BeatmapID":
        beatmap.metadata.beatmapId = Parsing.parseInt(value);
        break;
      case "BeatmapSetID":
        beatmap.metadata.beatmapSetId = Parsing.parseInt(value);
    }
  }
};
var TimingPointDecoder = class {
  static handleLine(line, beatmap, offset) {
    TimingPointDecoder.controlPoints = beatmap.controlPoints;
    const data = line.split(",");
    let timeSignature = TimeSignature.SimpleQuadruple;
    let sampleSet = SampleSet[SampleSet.None];
    let customIndex = 0;
    let volume = 100;
    let timingChange = true;
    let effects = EffectType.None;
    if (data.length > 2) {
      switch (data.length) {
        default:
        case 8:
          effects = Parsing.parseInt(data[7]);
        case 7:
          timingChange = data[6] === "1";
        case 6:
          volume = Parsing.parseInt(data[5]);
        case 5:
          customIndex = Parsing.parseInt(data[4]);
        case 4:
          sampleSet = SampleSet[Parsing.parseInt(data[3])];
        case 3:
          timeSignature = Parsing.parseInt(data[2]);
      }
    }
    if (timeSignature < 1) {
      throw new Error("The numerator of a time signature must be positive.");
    }
    const beatLength = Parsing.parseFloat(data[1]);
    const startTime = Parsing.parseFloat(data[0]) + offset;
    let bpmMultiplier = 1;
    let speedMultiplier = 1;
    if (beatLength < 0) {
      speedMultiplier = 100 / -beatLength;
      bpmMultiplier = Math.min(Math.fround(-beatLength), 1e4);
      bpmMultiplier = Math.max(10, bpmMultiplier) / 100;
    }
    if (timingChange) {
      const timingPoint = new TimingPoint();
      timingPoint.beatLength = beatLength;
      timingPoint.timeSignature = timeSignature;
      TimingPointDecoder.addControlPoint(timingPoint, startTime, true);
    }
    const difficultyPoint = new DifficultyPoint();
    difficultyPoint.bpmMultiplier = bpmMultiplier;
    difficultyPoint.speedMultiplier = speedMultiplier;
    TimingPointDecoder.addControlPoint(difficultyPoint, startTime, timingChange);
    const effectPoint = new EffectPoint();
    effectPoint.kiai = (effects & EffectType.Kiai) > 0;
    effectPoint.omitFirstBarLine = (effects & EffectType.OmitFirstBarLine) > 0;
    if (beatmap.originalMode !== 0) {
      effectPoint.scrollSpeed = speedMultiplier;
    }
    TimingPointDecoder.addControlPoint(effectPoint, startTime, timingChange);
    const samplePoint = new SamplePoint();
    samplePoint.sampleSet = sampleSet;
    samplePoint.customIndex = customIndex;
    samplePoint.volume = volume;
    TimingPointDecoder.addControlPoint(samplePoint, startTime, timingChange);
  }
  static addControlPoint(point, time, timingChange) {
    if (time !== TimingPointDecoder.pendingTime) {
      TimingPointDecoder.flushPendingPoints();
    }
    timingChange ? TimingPointDecoder.pendingPoints.unshift(point) : TimingPointDecoder.pendingPoints.push(point);
    TimingPointDecoder.pendingTime = time;
  }
  static flushPendingPoints() {
    const pendingTime = TimingPointDecoder.pendingTime;
    const pendingPoints = TimingPointDecoder.pendingPoints;
    const controlPoints = TimingPointDecoder.controlPoints;
    const pendingTypes = TimingPointDecoder.pendingTypes;
    let i = pendingPoints.length;
    while (--i >= 0) {
      if (pendingTypes.includes(pendingPoints[i].pointType)) {
        continue;
      }
      pendingTypes.push(pendingPoints[i].pointType);
      controlPoints.add(pendingPoints[i], pendingTime);
    }
    TimingPointDecoder.pendingPoints = [];
    TimingPointDecoder.pendingTypes = [];
  }
};
TimingPointDecoder.pendingTime = 0;
TimingPointDecoder.pendingTypes = [];
TimingPointDecoder.pendingPoints = [];
var EventDecoder = class {
  static handleLine(line, beatmap, sbLines, offset) {
    const data = line.split(",").map((v, i) => i ? v.trim() : v);
    const eventType = this._getEventType(data[0]);
    switch (eventType) {
      case EventType.Background:
        beatmap.events.background = data[2].replace(/"/g, "");
        break;
      case EventType.Video:
        beatmap.events.videoOffset = Parsing.parseInt(data[1]);
        beatmap.events.video = data[2].replace(/"/g, "");
        break;
      case EventType.Break: {
        const start = Parsing.parseFloat(data[1]) + offset;
        const end = Math.max(start, Parsing.parseFloat(data[2]) + offset);
        const breakEvent = new BeatmapBreakEvent(start, end);
        if (!beatmap.events.breaks) {
          beatmap.events.breaks = [];
        }
        beatmap.events.breaks.push(breakEvent);
        break;
      }
      case EventType.Sample:
      case EventType.Sprite:
      case EventType.Animation:
      case EventType.StoryboardCommand:
        if (sbLines) {
          sbLines.push(line);
        }
    }
  }
  static _getEventType(input) {
    if (input.startsWith(" ") || input.startsWith("_")) {
      return EventType.StoryboardCommand;
    }
    input = input.trim();
    let eventType = parseInt(input);
    eventType = isFinite(eventType) ? eventType : EventType[input];
    if (EventType[eventType]) {
      return eventType;
    }
    throw new Error(`Unknown event type: ${input}!`);
  }
};
var StoryboardDataDecoder = class {
  static handleElement(line) {
    const data = line.split(",");
    let eventType = parseInt(data[0]);
    eventType = isFinite(eventType) ? eventType : EventType[data[0]];
    const index = eventType === EventType.Sample ? 2 : 1;
    let layerType = parseInt(data[index]);
    layerType = isFinite(layerType) ? layerType : LayerType[data[index]];
    switch (eventType) {
      case EventType.Sprite: {
        const element = new StoryboardSprite();
        element.layer = layerType;
        element.filePath = data[3].replace(/"/g, "");
        element.startX = Parsing.parseInt(data[4]);
        element.startY = Parsing.parseInt(data[5]);
        element.origin = parseInt(data[2]);
        element.origin = isFinite(element.origin) ? element.origin : Origins[data[2]];
        return element;
      }
      case EventType.Animation: {
        const element = new StoryboardAnimation();
        element.layer = layerType;
        element.origin = parseInt(data[2]);
        element.origin = isFinite(element.origin) ? element.origin : Origins[data[2]];
        element.filePath = data[3].replace(/"/g, "");
        element.startX = Parsing.parseInt(data[4]);
        element.startY = Parsing.parseInt(data[5]);
        element.frames = Parsing.parseInt(data[6]);
        element.frameDelay = Parsing.parseInt(data[7]);
        element.loop = parseInt(data[8]);
        element.loop = isFinite(element.loop) ? element.loop : LoopType[data[8]];
        return element;
      }
      case EventType.Sample: {
        const element = new StoryboardSample();
        element.layer = layerType;
        element.startTime = Parsing.parseInt(data[1]);
        element.filePath = data[3].replace(/"/g, "");
        element.volume = data.length > 4 ? Parsing.parseInt(data[4]) : 100;
        return element;
      }
    }
    return new StoryboardSprite();
  }
  static handleLoop(line) {
    const data = line.split(",");
    const loop = new CommandLoop();
    loop.loopStartTime = Parsing.parseInt(data[1]);
    loop.loopCount = Parsing.parseInt(data[2]);
    return loop;
  }
  static handleTrigger(line) {
    const data = line.split(",");
    const trigger = new CommandTrigger();
    trigger.triggerName = data[1];
    trigger.startTime = Parsing.parseInt(data[2]) || 0;
    trigger.endTime = Parsing.parseInt(data[3]) || 0;
    trigger.groupNumber = Parsing.parseInt(data[4]) || 0;
    return trigger;
  }
  static handleCommand(line) {
    const data = line.split(",");
    const commandType = data[0];
    let command;
    switch (commandType) {
      case CommandType.Fade:
        command = new FadeCommand();
        command.startOpacity = Parsing.parseFloat(data[4]);
        if (data.length > 5) {
          command.endOpacity = Parsing.parseFloat(data[5]);
        }
        break;
      case CommandType.Movement:
        command = new MoveCommand();
        command.startX = Parsing.parseFloat(data[4]);
        command.startY = Parsing.parseFloat(data[5]);
        if (data.length > 6) {
          command.endX = Parsing.parseFloat(data[6]);
          command.endY = Parsing.parseFloat(data[7]);
        }
        break;
      case CommandType.MovementX:
        command = new MoveXCommand();
        command.startX = Parsing.parseFloat(data[4]);
        if (data.length > 5) {
          command.endX = Parsing.parseFloat(data[5]);
        }
        break;
      case CommandType.MovementY:
        command = new MoveYCommand();
        command.startY = Parsing.parseFloat(data[4]);
        if (data.length > 5) {
          command.endY = Parsing.parseFloat(data[5]);
        }
        break;
      case CommandType.Scale:
        command = new ScaleCommand();
        command.startScaling = Parsing.parseFloat(data[4]);
        if (data.length > 5) {
          command.endScaling = Parsing.parseFloat(data[5]);
        }
        break;
      case CommandType.VectorScale:
        command = new VectorScaleCommand();
        command.startScaleX = Parsing.parseFloat(data[4]);
        command.startScaleY = Parsing.parseFloat(data[5]);
        if (data.length > 6) {
          command.endScaleX = Parsing.parseFloat(data[6]);
          command.endScaleY = Parsing.parseFloat(data[7]);
        }
        break;
      case CommandType.Rotation:
        command = new RotateCommand();
        command.startRotate = Parsing.parseFloat(data[4]);
        if (data.length > 5) {
          command.endRotate = Parsing.parseFloat(data[5]);
        }
        break;
      case CommandType.Colour:
        command = new ColourCommand();
        command.startRed = Parsing.parseInt(data[4]);
        command.startGreen = Parsing.parseInt(data[5]);
        command.startBlue = Parsing.parseInt(data[6]);
        if (data.length > 7) {
          command.endRed = Parsing.parseInt(data[7]);
          command.endGreen = Parsing.parseInt(data[8]);
          command.endBlue = Parsing.parseInt(data[9]);
        }
        break;
      default:
        command = StoryboardDataDecoder.handleParameterCommand(data);
    }
    command.easing = Parsing.parseInt(data[1]);
    command.startTime = Parsing.parseInt(data[2]);
    command.endTime = Parsing.parseInt(data[3]);
    return command;
  }
  static handleParameterCommand(data) {
    const parameterType = data[4];
    let command;
    switch (parameterType) {
      case ParameterType.HorizontalFlip:
        command = new HorizontalFlipCommand();
        break;
      case ParameterType.VerticalFlip:
        command = new VerticalFlipCommand();
        break;
      default:
        command = new BlendingCommand();
    }
    command.easing = Parsing.parseInt(data[1]);
    command.startTime = Parsing.parseInt(data[2]);
    command.endTime = Parsing.parseInt(data[3]);
    return command;
  }
};
var VariableDecoder = class {
  static getVariables(lines) {
    const variables = {};
    const startIndex = lines.findIndex((l) => l.includes("[Variables]"));
    if (startIndex !== -1) {
      let endIndex = startIndex + 1;
      while (endIndex < lines.length && !lines[endIndex].startsWith("[")) {
        if (lines[endIndex].startsWith("$")) {
          const pair = lines[endIndex].substring(1).split("=");
          if (pair.length === 2) {
            variables[pair[0]] = pair[1];
          }
        }
        ++endIndex;
      }
      lines.splice(startIndex, endIndex - startIndex);
    }
    return variables;
  }
  static preProcess(line, variables) {
    const keys = Object.keys(variables);
    if (!line.includes("$") || !keys.length) {
      return line;
    }
    keys.forEach((key) => {
      line = line.replace("$" + key, variables[key]);
    });
    return line;
  }
};
var StoryboardDecoder = class {
  constructor() {
    this._element = null;
    this._compound = null;
    this._command = null;
    this._lines = null;
  }
  decodeFromString(str) {
    const data = str.toString().replace(/\r/g, "").split("\n");
    return this.decodeFromLines(data);
  }
  decodeFromLines(data) {
    const storyboard = new Storyboard();
    this._lines = null;
    if (data.constructor === Array) {
      this._lines = data.map((l) => l.toString().trimEnd());
    }
    if (!this._lines || !this._lines.length) {
      throw new Error("Storyboard data not found!");
    }
    this._element = null;
    this._compound = null;
    this._command = null;
    storyboard.variables = VariableDecoder.getVariables(this._lines);
    this._lines.forEach((line) => this._parseLine(line, storyboard));
    return storyboard;
  }
  _parseLine(line, storyboard) {
    if (!line || line.startsWith("//")) {
      return;
    }
    if (line.startsWith("[") && line.endsWith("]")) {
      return;
    }
    line = VariableDecoder.preProcess(line, storyboard.variables);
    let depth = 0;
    while (line.startsWith(" ") || line.startsWith("_")) {
      line = line.substring(1);
      ++depth;
    }
    try {
      this._parseStoryboardData(line, storyboard, depth);
    } catch {
      return;
    }
  }
  _parseStoryboardData(line, storyboard, depth) {
    switch (depth) {
      case 0:
        return this._parseDepth0(line, storyboard);
      case 1:
        return this._parseDepth1(line);
      case 2:
        return this._parseDepth2(line);
    }
  }
  _parseDepth0(line, storyboard) {
    this._element = StoryboardDataDecoder.handleElement(line);
    if (this._element instanceof StoryboardSample) {
      storyboard.getLayer(LayerType.Samples).push(this._element);
      return;
    }
    storyboard.getLayer(this._element.layer).push(this._element);
  }
  _parseDepth1(line) {
    switch (line[0]) {
      case CompoundType.Loop:
        this._compound = StoryboardDataDecoder.handleLoop(line);
        this._element.loops.push(this._compound);
        break;
      case CompoundType.Trigger:
        this._compound = StoryboardDataDecoder.handleTrigger(line);
        this._element.triggers.push(this._compound);
        break;
      default:
        this._command = StoryboardDataDecoder.handleCommand(line);
        this._element.commands.push(this._command);
    }
  }
  _parseDepth2(line) {
    this._command = StoryboardDataDecoder.handleCommand(line);
    this._compound.commands.push(this._command);
  }
};
var BeatmapDecoder = class {
  constructor() {
    this._sectionName = "";
    this._offset = 0;
    this._lines = null;
    this._sbLines = null;
  }
  decodeFromString(str, parseSb = true) {
    const data = str.toString().replace(/\r/g, "").split("\n");
    return this.decodeFromLines(data, parseSb);
  }
  decodeFromLines(data, parseSb = true) {
    const beatmap = new Beatmap();
    this._lines = null;
    this._sbLines = null;
    if (parseSb) {
      this._sbLines = [];
    }
    if (data.constructor === Array) {
      this._lines = data.filter((l) => typeof l === "string");
    }
    if (!this._lines || !this._lines.length) {
      throw new Error("Beatmap data not found!");
    }
    const fileFormatLine = this._lines[0].toString().trim();
    if (!fileFormatLine.startsWith("osu file format v")) {
      throw new Error("Not a valid beatmap!");
    }
    this._offset = 0;
    this._sectionName = "";
    this._lines.forEach((line) => this._parseLine(line, beatmap));
    TimingPointDecoder.flushPendingPoints();
    beatmap.hitObjects.forEach((h) => {
      h.applyDefaults(beatmap.controlPoints, beatmap.difficulty);
    });
    beatmap.hitObjects.sort((a, b) => a.startTime - b.startTime);
    if (parseSb && this._sbLines && this._sbLines.length) {
      const storyboardDecoder = new StoryboardDecoder();
      beatmap.events.storyboard = storyboardDecoder.decodeFromLines(this._sbLines);
    }
    return beatmap;
  }
  _parseLine(line, beatmap) {
    if (!line || line.startsWith("//")) {
      return;
    }
    if (line.includes("osu file format v")) {
      beatmap.fileFormat = Parsing.parseInt(line.split("v")[1]);
      this._offset = beatmap.fileFormat <= 4 ? 24 : 0;
      return;
    }
    if (line.startsWith("[") && line.endsWith("]")) {
      this._sectionName = line.slice(1, -1);
      return;
    }
    try {
      this._parseSectionData(line, beatmap);
    } catch {
      return;
    }
  }
  _parseSectionData(line, beatmap) {
    switch (this._sectionName) {
      case "General":
        GeneralDecoder.handleLine(line, beatmap, this._offset);
        break;
      case "Editor":
        EditorDecoder.handleLine(line, beatmap);
        break;
      case "Metadata":
        MetadataDecoder.handleLine(line, beatmap);
        break;
      case "Difficulty":
        DifficultyDecoder.handleLine(line, beatmap);
        break;
      case "Colours":
        ColourDecoder.handleLine(line, beatmap);
        break;
      case "Events":
        EventDecoder.handleLine(line, beatmap, this._sbLines, this._offset);
        break;
      case "TimingPoints":
        TimingPointDecoder.handleLine(line, beatmap, this._offset);
        break;
      case "HitObjects":
        HitObjectDecoder.handleLine(line, beatmap, this._offset);
    }
  }
};
var TimingPointEncoder = class {
  static encodeControlPoints(beatmap) {
    const encoded = ["[TimingPoints]"];
    beatmap.controlPoints.groups.forEach((group) => {
      const points = group.controlPoints;
      const timing = points.find((c) => c.beatLength);
      if (timing) {
        encoded.push(TimingPointEncoder.encodeGroup(group, true));
      }
      encoded.push(TimingPointEncoder.encodeGroup(group));
    });
    return encoded.join("\n");
  }
  static encodeGroup(group, useTiming = false) {
    const { difficultyPoint, effectPoint, samplePoint, timingPoint } = TimingPointEncoder.updateActualPoints(group);
    const startTime = group.startTime;
    let beatLength = -100;
    if (difficultyPoint !== null) {
      beatLength /= difficultyPoint.speedMultiplier;
    }
    let sampleSet = SampleSet.None;
    let customIndex = 0;
    let volume = 100;
    if (samplePoint !== null) {
      sampleSet = SampleSet[samplePoint.sampleSet];
      customIndex = samplePoint.customIndex;
      volume = samplePoint.volume;
    }
    let effects = EffectType.None;
    if (effectPoint !== null) {
      const kiai = effectPoint.kiai ? EffectType.Kiai : EffectType.None;
      const omitFirstBarLine = effectPoint.omitFirstBarLine ? EffectType.OmitFirstBarLine : EffectType.None;
      effects |= kiai | omitFirstBarLine;
    }
    let timeSignature = TimeSignature.SimpleQuadruple;
    let uninherited = 0;
    if (useTiming && timingPoint !== null) {
      beatLength = timingPoint.beatLength;
      timeSignature = timingPoint.timeSignature;
      uninherited = 1;
    }
    return [
      startTime,
      beatLength,
      timeSignature,
      sampleSet,
      customIndex,
      volume,
      uninherited,
      effects
    ].join(",");
  }
  static updateActualPoints(group) {
    let timingPoint = null;
    group.controlPoints.forEach((point) => {
      if (point.pointType === ControlPointType.DifficultyPoint && !point.isRedundant(TimingPointEncoder.lastDifficultyPoint)) {
        TimingPointEncoder.lastDifficultyPoint = point;
      }
      if (point.pointType === ControlPointType.EffectPoint && !point.isRedundant(TimingPointEncoder.lastEffectPoint)) {
        TimingPointEncoder.lastEffectPoint = point;
      }
      if (point.pointType === ControlPointType.SamplePoint && !point.isRedundant(TimingPointEncoder.lastSamplePoint)) {
        TimingPointEncoder.lastSamplePoint = point;
      }
      if (point.pointType === ControlPointType.TimingPoint) {
        timingPoint = point;
      }
    });
    return {
      timingPoint,
      difficultyPoint: TimingPointEncoder.lastDifficultyPoint,
      effectPoint: TimingPointEncoder.lastEffectPoint,
      samplePoint: TimingPointEncoder.lastSamplePoint
    };
  }
};
TimingPointEncoder.lastDifficultyPoint = null;
TimingPointEncoder.lastEffectPoint = null;
TimingPointEncoder.lastSamplePoint = null;

// node_modules/osu-taiko-stable/lib/esm/index.js
var TaikoNoMod = class extends NoMod {
};
var TaikoNoFail = class extends NoFail {
};
var TaikoEasy = class extends Easy {
  applyToDifficulty(difficulty) {
    super.applyToDifficulty(difficulty);
    difficulty.sliderMultiplier *= 0.8;
  }
};
var TaikoHidden = class extends Hidden {
};
var TaikoHardRock = class extends HardRock {
  applyToDifficulty(difficulty) {
    super.applyToDifficulty(difficulty);
    difficulty.sliderMultiplier *= 1.4 * 4 / 3;
  }
};
var TaikoSuddenDeath = class extends SuddenDeath {
};
var TaikoDoubleTime = class extends DoubleTime {
};
var TaikoRelax = class extends Relax {
};
var TaikoHalfTime = class extends HalfTime {
};
var TaikoNightcore = class extends Nightcore {
};
var TaikoFlashlight = class extends Flashlight {
};
var TaikoAutoplay = class extends Autoplay {
};
var TaikoPerfect = class extends Perfect {
};
var TaikoCinema = class extends Cinema {
};
var TaikoModCombination = class extends ModCombination {
  get mode() {
    return 1;
  }
  get _availableMods() {
    return [
      new TaikoNoMod(),
      new TaikoNoFail(),
      new TaikoEasy(),
      new TaikoHidden(),
      new TaikoHardRock(),
      new TaikoSuddenDeath(),
      new TaikoDoubleTime(),
      new TaikoRelax(),
      new TaikoHalfTime(),
      new TaikoNightcore(),
      new TaikoFlashlight(),
      new TaikoAutoplay(),
      new TaikoPerfect(),
      new TaikoCinema()
    ];
  }
};
var TaikoBeatmap = class extends RulesetBeatmap {
  constructor() {
    super(...arguments);
    this.mods = new TaikoModCombination();
    this.hitObjects = [];
  }
  get mode() {
    return 1;
  }
  get maxCombo() {
    return this.hitObjects.reduce((combo, obj) => {
      return obj.hitType & HitType.Normal ? combo + 1 : combo;
    }, 0);
  }
  get hits() {
    return this.hitObjects.reduce((c, h) => {
      return c + (h.hitType & HitType.Normal ? 1 : 0);
    }, 0);
  }
  get drumRolls() {
    return this.hitObjects.reduce((c, h) => {
      return c + (h.hitType & HitType.Slider ? 1 : 0);
    }, 0);
  }
  get swells() {
    return this.hitObjects.reduce((c, h) => {
      return c + (h.hitType & HitType.Spinner ? 1 : 0);
    }, 0);
  }
};
var TaikoHitObject = class extends HitObject {
};
TaikoHitObject.DEFAULT_SIZE = Math.fround(0.45);
var TaikoStrongHitObject = class extends TaikoHitObject {
  get isStrong() {
    return !!this.samples.find((s) => {
      return s.hitSound === HitSound[HitSound.Finish];
    });
  }
  set isStrong(value) {
    if (this.samples.length > 0) {
      this.samples[0].hitSound = HitSound[value ? HitSound.Finish : HitSound.Normal];
    }
  }
};
TaikoStrongHitObject.STRONG_SCALE = Math.fround(1.4);
TaikoStrongHitObject.DEFAULT_STRONG_SIZE = TaikoHitObject.DEFAULT_SIZE * TaikoStrongHitObject.STRONG_SCALE;
var DrumRollTick = class extends TaikoHitObject {
  constructor() {
    super(...arguments);
    this.firstTick = false;
    this.tickInterval = 0;
  }
  get hitWindow() {
    return this.tickInterval / 2;
  }
  clone() {
    const cloned = super.clone();
    cloned.firstTick = this.firstTick;
    cloned.tickInterval = this.tickInterval;
    return cloned;
  }
};
var SwellTick = class extends TaikoHitObject {
};
var TaikoEventGenerator = class extends EventGenerator {
  static *generateDrumRollTicks(drumRoll) {
    if (drumRoll.tickInterval === 0) {
      return;
    }
    let firstTick = true;
    const tickInterval = drumRoll.tickInterval;
    let time = drumRoll.startTime;
    const endTime = drumRoll.endTime + tickInterval / 2;
    while (time < endTime) {
      const tick = new DrumRollTick();
      tick.startTime = time;
      tick.tickInterval = tickInterval;
      tick.firstTick = firstTick;
      tick.hitType = drumRoll.hitType;
      tick.hitSound = drumRoll.hitSound;
      tick.samples = drumRoll.samples.map((s) => s.clone());
      firstTick = false;
      yield tick;
      time += tickInterval;
    }
  }
  static *generateSwellTicks(swell) {
    const requiredHits = swell.requiredHits;
    for (let hit = 0; hit < requiredHits; ++hit) {
      const tick = new SwellTick();
      tick.startTime = swell.startTime;
      tick.hitType = swell.hitType;
      tick.hitSound = swell.hitSound;
      tick.samples = swell.samples.map((s) => s.clone());
      yield tick;
    }
  }
};
var DrumRoll = class extends TaikoStrongHitObject {
  constructor() {
    super(...arguments);
    this.tickInterval = 100;
    this.tickRate = 1;
    this.velocity = 1;
    this.duration = 0;
    this.requiredGoodHits = 0;
    this.requiredGreatHits = 0;
    this.overallDifficulty = 0;
    this.path = new SliderPath();
    this.nodeSamples = [];
    this.repeats = 0;
  }
  get distance() {
    return this.path.distance;
  }
  set distance(value) {
    this.path.distance = value;
  }
  get spans() {
    return this.repeats + 1;
  }
  get spanDuration() {
    return this.duration / this.spans;
  }
  get endTime() {
    return this.startTime + this.duration;
  }
  applyDefaultsToSelf(controlPoints, difficulty) {
    super.applyDefaultsToSelf(controlPoints, difficulty);
    const timingPoint = controlPoints.timingPointAt(this.startTime);
    const difficultyPoint = controlPoints.difficultyPointAt(this.startTime);
    const scoringDistance = DrumRoll.BASE_DISTANCE * difficulty.sliderMultiplier * difficultyPoint.speedMultiplier;
    this.velocity = scoringDistance / timingPoint.beatLength;
    this.tickInterval = timingPoint.beatLength / this.tickRate;
    this.overallDifficulty = difficulty.overallDifficulty;
  }
  createNestedHitObjects() {
    this.nestedHitObjects = [];
    for (const nested of TaikoEventGenerator.generateDrumRollTicks(this)) {
      this.nestedHitObjects.push(nested);
    }
    this.requiredGoodHits = this.nestedHitObjects.length * Math.min(0.15, 0.05 + 0.1 / 6 * this.overallDifficulty);
    this.requiredGreatHits = this.nestedHitObjects.length * Math.min(0.3, 0.1 + 0.2 / 6 * this.overallDifficulty);
  }
  clone() {
    const cloned = super.clone();
    cloned.nodeSamples = this.nodeSamples.map((n) => n.map((s) => s.clone()));
    cloned.velocity = this.velocity;
    cloned.repeats = this.repeats;
    cloned.path = this.path.clone();
    cloned.tickRate = this.tickRate;
    cloned.tickInterval = this.tickInterval;
    cloned.duration = this.duration;
    cloned.requiredGoodHits = this.requiredGoodHits;
    cloned.requiredGreatHits = this.requiredGreatHits;
    cloned.overallDifficulty = this.overallDifficulty;
    return cloned;
  }
};
DrumRoll.BASE_DISTANCE = 100;
var Hit = class extends TaikoStrongHitObject {
  get isRim() {
    return !!this.samples.find((s) => {
      return s.hitSound === HitSound[HitSound.Clap] || s.hitSound === HitSound[HitSound.Whistle];
    });
  }
};
var Swell = class extends TaikoHitObject {
  constructor() {
    super(...arguments);
    this.requiredHits = 10;
    this.endTime = 0;
  }
  get duration() {
    return this.endTime - this.startTime;
  }
  set duration(value) {
    this.endTime = this.startTime + value;
  }
  createNestedHitObjects() {
    this.nestedHitObjects = [];
    for (const nested of TaikoEventGenerator.generateSwellTicks(this)) {
      this.nestedHitObjects.push(nested);
    }
  }
  clone() {
    const cloned = super.clone();
    cloned.endTime = this.endTime;
    cloned.requiredHits = this.requiredHits;
    return cloned;
  }
};
var TaikoBeatmapConverter = class extends BeatmapConverter {
  constructor() {
    super(...arguments);
    this.isForCurrentRuleset = true;
    this.isForManiaRuleset = false;
    this.taikoDistance = 0;
    this.taikoDuration = 0;
    this.tickDistance = 0;
    this.tickInterval = 0;
  }
  canConvert(beatmap) {
    return true;
  }
  convertBeatmap(original) {
    this.isForCurrentRuleset = original.originalMode === 1;
    this.isForManiaRuleset = original.originalMode === 3;
    const converted = super.convertBeatmap(original);
    converted.difficulty.sliderMultiplier *= TaikoBeatmapConverter.VELOCITY_MULTIPLIER;
    if (this.isForManiaRuleset) {
      const groups = {};
      converted.hitObjects.forEach((hitObject) => {
        const key = hitObject.startTime;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(hitObject);
      });
      const grouped = Object.values(groups);
      converted.hitObjects = grouped.map((hitObjects) => {
        const first = hitObjects[0];
        if (hitObjects.length > 1 && first instanceof TaikoStrongHitObject) {
          first.isStrong = true;
        }
        return first;
      });
    }
    return converted;
  }
  *convertHitObjects(beatmap) {
    const hitObjects = beatmap.hitObjects;
    for (const hitObject of hitObjects) {
      if (hitObject instanceof TaikoHitObject) {
        yield hitObject.clone();
        continue;
      }
      for (const converted of this._convertHitObject(hitObject, beatmap)) {
        yield converted;
      }
    }
  }
  _convertHitObject(hitObject, beatmap) {
    const slidable = hitObject;
    const spinnable = hitObject;
    if (slidable.path) {
      return this._convertSlidableObject(slidable, beatmap);
    }
    if (spinnable.endTime) {
      return this._convertSpinnableObject(spinnable, beatmap);
    }
    return this._convertHittableObject(hitObject);
  }
  *_convertHittableObject(hittable) {
    const converted = new Hit();
    converted.startTime = hittable.startTime;
    converted.hitType = HitType.Normal | hittable.hitType & HitType.NewCombo;
    converted.hitSound = hittable.hitSound;
    converted.samples = hittable.samples.map((s) => s.clone());
    yield converted;
  }
  *_convertSlidableObject(slidable, beatmap) {
    if (this._shouldConvertToHits(slidable, beatmap)) {
      const allSamples = slidable.nodeSamples;
      let sampleIndex = 0;
      let time = slidable.startTime;
      const endTime = time + this.taikoDuration + this.tickInterval / 8;
      while (time <= endTime) {
        const hit = new Hit();
        hit.startTime = time;
        hit.samples = allSamples[sampleIndex];
        hit.hitType = HitType.Normal;
        hit.hitSound = hit.samples.reduce((s, h) => {
          return s + HitSound[h.hitSound];
        }, 0);
        yield hit;
        sampleIndex = (sampleIndex + 1) % allSamples.length;
        if (this.tickInterval < 1e-7) {
          break;
        }
        time += this.tickInterval;
      }
    } else {
      const sliderTickRate = beatmap.difficulty.sliderTickRate;
      const drumRoll = new DrumRoll();
      drumRoll.duration = this.taikoDuration;
      drumRoll.tickRate = sliderTickRate === 3 ? 3 : 4;
      drumRoll.startTime = slidable.startTime;
      drumRoll.hitType = HitType.Slider | slidable.hitType & HitType.NewCombo;
      drumRoll.hitSound = slidable.hitSound;
      drumRoll.samples = slidable.samples.map((s) => s.clone());
      yield drumRoll;
    }
  }
  *_convertSpinnableObject(spinnable, beatmap) {
    const baseOD = beatmap.difficulty.overallDifficulty;
    const difficultyRange = BeatmapDifficultySection.range(baseOD, 3, 5, 7.5);
    const hitMultiplier = TaikoBeatmapConverter.SWELL_HIT_MULTIPLIER * difficultyRange;
    const swell = new Swell();
    swell.startTime = spinnable.startTime;
    swell.hitType = HitType.Spinner | spinnable.hitType & HitType.NewCombo;
    swell.hitSound = spinnable.hitSound;
    swell.samples = spinnable.samples.map((s) => s.clone());
    swell.requiredHits = Math.trunc(Math.max(1, swell.duration / 1e3 * hitMultiplier));
    yield swell;
  }
  _shouldConvertToHits(slidable, beatmap) {
    const timingPoint = beatmap.controlPoints.timingPointAt(slidable.startTime);
    const difficultyPoint = beatmap.controlPoints.difficultyPointAt(slidable.startTime);
    let beatLength = timingPoint.beatLength * difficultyPoint.bpmMultiplier;
    const sliderMultiplier = beatmap.difficulty.sliderMultiplier * TaikoBeatmapConverter.VELOCITY_MULTIPLIER;
    const sliderTickRate = beatmap.difficulty.sliderTickRate;
    const sliderScoringPointDistance = sliderMultiplier / sliderTickRate * TaikoBeatmapConverter.BASE_SCORING_DISTANCE;
    const spans = slidable.repeats + 1 || 1;
    this.taikoDistance = slidable.distance * spans * TaikoBeatmapConverter.VELOCITY_MULTIPLIER;
    const taikoVelocity = sliderScoringPointDistance * sliderTickRate;
    this.taikoDuration = Math.trunc(this.taikoDistance / taikoVelocity * beatLength);
    if (this.isForCurrentRuleset) {
      this.tickInterval = 0;
      return false;
    }
    const osuVelocity = taikoVelocity * 1e3 / beatLength;
    let tickMultiplier = 1;
    if (beatmap.fileFormat >= 8) {
      beatLength = timingPoint.beatLength;
      tickMultiplier = 1 / difficultyPoint.speedMultiplier;
    }
    this.tickDistance = sliderScoringPointDistance / sliderTickRate * tickMultiplier;
    this.tickInterval = Math.min(beatLength / sliderTickRate, this.taikoDuration / spans);
    return this.tickInterval > 0 && this.taikoDistance / osuVelocity * 1e3 < 2 * beatLength;
  }
  createBeatmap() {
    return new TaikoBeatmap();
  }
};
TaikoBeatmapConverter.VELOCITY_MULTIPLIER = Math.fround(1.4);
TaikoBeatmapConverter.BASE_SCORING_DISTANCE = 100;
TaikoBeatmapConverter.SWELL_HIT_MULTIPLIER = Math.fround(1.65);
var TaikoBeatmapProcessor = class extends BeatmapProcessor {
};
var TaikoDifficultyAttributes = class extends DifficultyAttributes {
  constructor() {
    super(...arguments);
    this.staminaStrain = 0;
    this.rhythmStrain = 0;
    this.colourStrain = 0;
    this.approachRate = 0;
    this.greatHitWindow = 0;
  }
  *toDatabaseAttributes() {
    yield [DifficultyAttributes.ATTRIB_ID_MAX_COMBO, this.maxCombo];
    yield [DifficultyAttributes.ATTRIB_ID_STRAIN, this.starRating];
    yield [DifficultyAttributes.ATTRIB_ID_GREAT_HIT_WINDOW, this.greatHitWindow];
  }
  fromDatabaseAttributes(values) {
    this.maxCombo = +values[DifficultyAttributes.ATTRIB_ID_MAX_COMBO];
    this.starRating = values[DifficultyAttributes.ATTRIB_ID_STRAIN];
    this.greatHitWindow = values[DifficultyAttributes.ATTRIB_ID_GREAT_HIT_WINDOW];
  }
};
var TaikoPerformanceAttributes = class extends PerformanceAttributes {
  constructor(mods, totalPerformance) {
    super(mods, totalPerformance);
    this.strainPerformance = 0;
    this.accuracyPerformance = 0;
    this.mods = mods;
  }
};
var StaminaCheeseDetector = class {
  constructor(hitObjects) {
    this._hitObjects = hitObjects;
  }
  findCheese() {
    this._findRolls(3);
    this._findRolls(4);
    this._findTlTap(0, true);
    this._findTlTap(1, true);
    this._findTlTap(0, false);
    this._findTlTap(1, false);
  }
  _findRolls(patternLength) {
    const history = new LimitedCapacityQueue(2 * patternLength);
    let indexBeforeLastRepeat = -1;
    let lastMarkEnd = 0;
    for (let i = 0; i < this._hitObjects.length; ++i) {
      history.enqueue(this._hitObjects[i]);
      if (!history.full) {
        continue;
      }
      if (!StaminaCheeseDetector._containsPatternRepeat(history, patternLength)) {
        indexBeforeLastRepeat = i - history.count + 1;
        continue;
      }
      const repeatedLength = i - indexBeforeLastRepeat;
      if (repeatedLength < StaminaCheeseDetector.ROLL_MIN_REPETITIONS) {
        continue;
      }
      this._markObjectsAsCheese(Math.max(lastMarkEnd, i - repeatedLength + 1), i);
      lastMarkEnd = i;
    }
  }
  static _containsPatternRepeat(history, patternLength) {
    for (let j = 0; j < patternLength; ++j) {
      if (history.get(j).isRim !== history.get(j + patternLength).isRim) {
        return false;
      }
    }
    return true;
  }
  _findTlTap(parity, isRim) {
    let tlLength = -2;
    let lastMarkEnd = 0;
    for (let i = parity; i < this._hitObjects.length; i += 2) {
      tlLength = this._hitObjects[i].isRim === isRim ? tlLength + 2 : -2;
      if (tlLength < StaminaCheeseDetector.TL_MIN_REPETITIONS) {
        continue;
      }
      this._markObjectsAsCheese(Math.max(lastMarkEnd, i - tlLength + 1), i);
      lastMarkEnd = i;
    }
  }
  _markObjectsAsCheese(start, end) {
    for (let i = start; i <= end; ++i) {
      this._hitObjects[i].staminaCheese = true;
    }
  }
};
StaminaCheeseDetector.ROLL_MIN_REPETITIONS = 12;
StaminaCheeseDetector.TL_MIN_REPETITIONS = 16;
var TaikoDifficultyHitObjectRhythm = class {
  constructor(numerator, denominator, difficulty) {
    this.ratio = numerator / denominator;
    this.difficulty = difficulty;
  }
};
var TaikoDifficultyHitObject = class extends DifficultyHitObject {
  constructor(hitObject, lastObject, lastLastObject, clockRate, objectIndex) {
    let _a3;
    super(hitObject, lastObject, clockRate);
    this.staminaCheese = false;
    this.rhythm = this._getClosestRhythm(lastObject, lastLastObject, clockRate);
    this.isRim = (_a3 = hitObject) === null || _a3 === void 0 ? void 0 : _a3.isRim;
    this.objectIndex = objectIndex;
  }
  _getClosestRhythm(lastObject, lastLastObject, clockRate) {
    const prevLength = (lastObject.startTime - lastLastObject.startTime) / clockRate;
    const ratio = this.deltaTime / prevLength;
    return TaikoDifficultyHitObject._COMMON_RHYTHMS.slice().sort((a, b) => Math.abs(a.ratio - ratio) - Math.abs(b.ratio - ratio))[0];
  }
};
TaikoDifficultyHitObject._COMMON_RHYTHMS = [
  new TaikoDifficultyHitObjectRhythm(1, 1, 0),
  new TaikoDifficultyHitObjectRhythm(2, 1, 0.3),
  new TaikoDifficultyHitObjectRhythm(1, 2, 0.5),
  new TaikoDifficultyHitObjectRhythm(3, 1, 0.3),
  new TaikoDifficultyHitObjectRhythm(1, 3, 0.35),
  new TaikoDifficultyHitObjectRhythm(3, 2, 0.6),
  new TaikoDifficultyHitObjectRhythm(2, 3, 0.4),
  new TaikoDifficultyHitObjectRhythm(5, 4, 0.5),
  new TaikoDifficultyHitObjectRhythm(4, 5, 0.7)
];
var Colour2 = class extends StrainDecaySkill {
  constructor() {
    super(...arguments);
    this._skillMultiplier = 1;
    this._strainDecayBase = 0.4;
    this._monoHistory = new LimitedCapacityQueue(Colour2.MONO_HISTORY_MAX_LENGTH);
    this._currentMonoLength = 0;
  }
  _strainValueOf(current) {
    const isLastHit = current.lastObject instanceof Hit;
    const isBaseHit = current.baseObject instanceof Hit;
    if (!(isLastHit && isBaseHit && current.deltaTime < 1e3)) {
      this._monoHistory.clear();
      const currentHit = current.baseObject;
      this._currentMonoLength = currentHit ? 1 : 0;
      this._previousIsRim = currentHit === null || currentHit === void 0 ? void 0 : currentHit.isRim;
      return 0;
    }
    const taikoCurrent = current;
    let objectStrain = 0;
    if (this._previousIsRim !== void 0 && taikoCurrent.isRim !== this._previousIsRim) {
      objectStrain = 1;
      if (this._monoHistory.count < 2) {
        objectStrain = 0;
      } else if ((this._monoHistory.get(this._monoHistory.count - 1) + this._currentMonoLength) % 2 === 0) {
        objectStrain = 0;
      }
      objectStrain *= this._repetitionPenalties();
      this._currentMonoLength = 1;
    } else {
      this._currentMonoLength += 1;
    }
    this._previousIsRim = taikoCurrent.isRim;
    return objectStrain;
  }
  _repetitionPenalties() {
    const MOST_RECENT_PATTERNS_TO_COMPARE = 2;
    let penalty = 1;
    this._monoHistory.enqueue(this._currentMonoLength);
    const startIndex = this._monoHistory.count - MOST_RECENT_PATTERNS_TO_COMPARE - 1;
    for (let start = startIndex; start >= 0; start--) {
      if (!this._isSamePattern(start, MOST_RECENT_PATTERNS_TO_COMPARE)) {
        continue;
      }
      let notesSince = 0;
      for (let i = start; i < this._monoHistory.count; ++i) {
        notesSince += this._monoHistory.get(i);
      }
      penalty *= this._repetitionPenalty(notesSince);
      break;
    }
    return penalty;
  }
  _isSamePattern(start, mostRecentPatternsToCompare) {
    for (let i = 0; i < mostRecentPatternsToCompare; ++i) {
      const index = this._monoHistory.count - mostRecentPatternsToCompare + i;
      if (this._monoHistory.get(start + i) !== this._monoHistory.get(index)) {
        return false;
      }
    }
    return true;
  }
  _repetitionPenalty(notesSince) {
    return Math.min(1, 0.032 * notesSince);
  }
};
Colour2.MONO_HISTORY_MAX_LENGTH = 5;
var Rhythm = class extends StrainDecaySkill {
  constructor() {
    super(...arguments);
    this._rhythmHistory = new LimitedCapacityQueue(Rhythm._RHYTHM_HISTORY_MAX_LENGTH);
    this._currentRhythmStrain = 0;
    this._skillMultiplier = 10;
    this._strainDecayBase = 0;
    this._notesSinceRhythmChange = 0;
  }
  _strainValueOf(current) {
    if (!(current.baseObject instanceof Hit)) {
      this._resetRhythmAndStrain();
      return 0;
    }
    this._currentRhythmStrain *= Rhythm._STRAIN_DECAY;
    const hitObject = current;
    this._notesSinceRhythmChange += 1;
    if (hitObject.rhythm.difficulty === 0) {
      return 0;
    }
    let objectStrain = hitObject.rhythm.difficulty;
    objectStrain *= this._repetitionPenalties(hitObject);
    objectStrain *= Rhythm._patternLengthPenalty(this._notesSinceRhythmChange);
    objectStrain *= this._speedPenalty(hitObject.deltaTime);
    this._notesSinceRhythmChange = 0;
    this._currentRhythmStrain += objectStrain;
    return this._currentRhythmStrain;
  }
  _repetitionPenalties(hitObject) {
    let penalty = 1;
    this._rhythmHistory.enqueue(hitObject);
    const halfMaxLength = Rhythm._RHYTHM_HISTORY_MAX_LENGTH / 2;
    for (let i = 2; i <= halfMaxLength; ++i) {
      const startIndex = this._rhythmHistory.count - i - 1;
      for (let start = startIndex; start >= 0; --start) {
        if (!this._samePattern(start, i)) {
          continue;
        }
        const notesSince = hitObject.objectIndex - this._rhythmHistory.get(start).objectIndex;
        penalty *= Rhythm._repetitionPenalty(notesSince);
        break;
      }
    }
    return penalty;
  }
  _samePattern(start, mostRecentPatternsToCompare) {
    for (let i = 0; i < mostRecentPatternsToCompare; ++i) {
      const index = this._rhythmHistory.count - mostRecentPatternsToCompare + i;
      if (this._rhythmHistory.get(start + i).rhythm !== this._rhythmHistory.get(index).rhythm) {
        return false;
      }
    }
    return true;
  }
  static _repetitionPenalty(notesSince) {
    return Math.min(1, 0.032 * notesSince);
  }
  static _patternLengthPenalty(patternLength) {
    const shortPatternPenalty = Math.min(0.15 * patternLength, 1);
    const longPatternPenalty = Math.min(Math.max(0, 2.5 - 0.15 * patternLength), 1);
    return Math.min(shortPatternPenalty, longPatternPenalty);
  }
  _speedPenalty(deltaTime) {
    if (deltaTime < 80) {
      return 1;
    }
    if (deltaTime < 210) {
      return Math.max(0, 1.4 - 5e-3 * deltaTime);
    }
    this._resetRhythmAndStrain();
    return 0;
  }
  _resetRhythmAndStrain() {
    this._currentRhythmStrain = 0;
    this._notesSinceRhythmChange = 0;
  }
};
Rhythm._STRAIN_DECAY = 0.96;
Rhythm._RHYTHM_HISTORY_MAX_LENGTH = 8;
var Stamina = class extends StrainDecaySkill {
  constructor(mods, rightHand) {
    super(mods);
    this._notePairDurationHistory = new LimitedCapacityQueue(Stamina._MAX_HISTORY_LENGTH);
    this._offhandObjectDuration = 17976931348623157e292;
    this._skillMultiplier = 1;
    this._strainDecayBase = 0.4;
    this._hand = rightHand ? 1 : 0;
  }
  _strainValueOf(current) {
    if (!(current.baseObject instanceof Hit)) {
      return 0;
    }
    const hitObject = current;
    if (hitObject.objectIndex % 2 === this._hand) {
      let objectStrain = 1;
      if (hitObject.objectIndex === 1) {
        return 1;
      }
      this._notePairDurationHistory.enqueue(hitObject.deltaTime + this._offhandObjectDuration);
      const shortestRecentNote = Math.min(...this._notePairDurationHistory.enumerate());
      objectStrain += Stamina._speedBonus(shortestRecentNote);
      if (hitObject.staminaCheese) {
        objectStrain *= Stamina._cheesePenalty(hitObject.deltaTime + this._offhandObjectDuration);
      }
      return objectStrain;
    }
    this._offhandObjectDuration = hitObject.deltaTime;
    return 0;
  }
  static _cheesePenalty(notePairDuration) {
    if (notePairDuration > 125) {
      return 1;
    }
    if (notePairDuration < 100) {
      return 0.6;
    }
    return 0.6 + (notePairDuration - 100) * 0.016;
  }
  static _speedBonus(notePairDuration) {
    if (notePairDuration >= 200) {
      return 0;
    }
    return (200 - notePairDuration) ** 2 / 1e5;
  }
};
Stamina._MAX_HISTORY_LENGTH = 2;
var TaikoHitWindows = class extends HitWindows {
  isHitResultAllowed(result) {
    switch (result) {
      case HitResult.Great:
      case HitResult.Ok:
      case HitResult.Miss:
        return true;
    }
    return false;
  }
  _getRanges() {
    return TaikoHitWindows._TAIKO_RANGES;
  }
};
TaikoHitWindows._TAIKO_RANGES = [
  new DifficultyRange(HitResult.Great, 50, 35, 20),
  new DifficultyRange(HitResult.Ok, 120, 80, 50),
  new DifficultyRange(HitResult.Miss, 135, 95, 70)
];
var TaikoDifficultyCalculator = class extends DifficultyCalculator {
  calculate() {
    return super.calculate();
  }
  calculateAll() {
    return super.calculateAll();
  }
  calculateWithMods(mods) {
    return super.calculateWithMods(mods);
  }
  _createSkills(beatmap, mods) {
    return [
      new Colour2(mods),
      new Rhythm(mods),
      new Stamina(mods, true),
      new Stamina(mods, false)
    ];
  }
  get difficultyMods() {
    return [
      new TaikoDoubleTime(),
      new TaikoHalfTime(),
      new TaikoEasy(),
      new TaikoHardRock()
    ];
  }
  *_createDifficultyHitObjects(beatmap) {
    const difficultyObjects = [];
    const clockRate = beatmap.difficulty.clockRate;
    for (let i = 2; i < beatmap.hitObjects.length; ++i) {
      const hitObject = beatmap.hitObjects[i];
      const lastObject = beatmap.hitObjects[i - 1];
      const lastLastObject = beatmap.hitObjects[i - 2];
      const difficultyObject = new TaikoDifficultyHitObject(hitObject, lastObject, lastLastObject, clockRate, i);
      difficultyObjects.push(difficultyObject);
    }
    new StaminaCheeseDetector(difficultyObjects).findCheese();
    for (const difficultyObject of difficultyObjects) {
      yield difficultyObject;
    }
  }
  _createDifficultyAttributes(beatmap, mods, skills) {
    if (beatmap.hitObjects.length === 0) {
      return new TaikoDifficultyAttributes(mods, 0);
    }
    const clockRate = beatmap.difficulty.clockRate;
    const colour = skills[0];
    const rhythm = skills[1];
    const staminaRight = skills[2];
    const staminaLeft = skills[3];
    const colourMultiplier = TaikoDifficultyCalculator._COLOUR_SKILL_MULTIPLIER;
    const rhythmMultiplier = TaikoDifficultyCalculator._RHYTHM_SKILL_MULTIPLIER;
    const staminaMultiplier = TaikoDifficultyCalculator._STAMINA_SKILL_MULTIPLIER;
    const colourRating = colour.difficultyValue * colourMultiplier;
    const rhythmRating = rhythm.difficultyValue * rhythmMultiplier;
    let staminaRating = (staminaRight.difficultyValue + staminaLeft.difficultyValue) * staminaMultiplier;
    const staminaPenalty = TaikoDifficultyCalculator._simpleColourPenalty(staminaRating, colourRating);
    staminaRating *= staminaPenalty;
    const combinedRating = this._locallyCombinedDifficulty(colour, rhythm, staminaRight, staminaLeft, staminaPenalty);
    const separatedRating = TaikoDifficultyCalculator._norm(1.5, [colourRating, rhythmRating, staminaRating]);
    let starRating = 1.4 * separatedRating + 0.5 * combinedRating;
    starRating = TaikoDifficultyCalculator._rescale(starRating);
    const hitWindows = new TaikoHitWindows();
    hitWindows.setDifficulty(beatmap.difficulty.overallDifficulty);
    const attributes = new TaikoDifficultyAttributes(mods, starRating);
    attributes.staminaStrain = staminaRating;
    attributes.rhythmStrain = rhythmRating;
    attributes.colourStrain = colourRating;
    attributes.greatHitWindow = hitWindows.windowFor(HitResult.Great) / clockRate;
    attributes.maxCombo = beatmap.maxCombo;
    return attributes;
  }
  static _simpleColourPenalty(staminaDifficulty, colorDifficulty) {
    if (colorDifficulty <= 0) {
      return 0.79 - 0.25;
    }
    return 0.79 - Math.atan(staminaDifficulty / colorDifficulty - 12) / Math.PI / 2;
  }
  static _norm(p, values) {
    const map = values.map((x) => Math.pow(x, p));
    const reduce = map.reduce((p2, c) => p2 + c, 0);
    return Math.pow(reduce, 1 / p);
  }
  _locallyCombinedDifficulty(colour, rhythm, staminaRight, staminaLeft, staminaPenalty) {
    const peaks = [];
    const colourPeaks = [...colour.getCurrentStrainPeaks()];
    const rhythmPeaks = [...rhythm.getCurrentStrainPeaks()];
    const staminaRightPeaks = [...staminaRight.getCurrentStrainPeaks()];
    const staminaLeftPeaks = [...staminaLeft.getCurrentStrainPeaks()];
    const colourMultiplier = TaikoDifficultyCalculator._COLOUR_SKILL_MULTIPLIER;
    const rhythmMultiplier = TaikoDifficultyCalculator._RHYTHM_SKILL_MULTIPLIER;
    const staminaMultiplier = TaikoDifficultyCalculator._STAMINA_SKILL_MULTIPLIER * staminaPenalty;
    for (let i = 0; i < colourPeaks.length; ++i) {
      const colourPeak = colourPeaks[i] * colourMultiplier;
      const rhythmPeak = rhythmPeaks[i] * rhythmMultiplier;
      const staminaPeak = (staminaRightPeaks[i] + staminaLeftPeaks[i]) * staminaMultiplier;
      const values = [colourPeak, rhythmPeak, staminaPeak];
      peaks.push(TaikoDifficultyCalculator._norm(2, values));
    }
    let difficulty = 0;
    let weight = 1;
    for (const strain of peaks.sort((a, b) => b - a)) {
      difficulty += strain * weight;
      weight *= 0.9;
    }
    return difficulty;
  }
  static _rescale(sr) {
    if (sr < 0) {
      return sr;
    }
    return 10.43 * Math.log(sr / 8 + 1);
  }
};
TaikoDifficultyCalculator._COLOUR_SKILL_MULTIPLIER = 0.01;
TaikoDifficultyCalculator._RHYTHM_SKILL_MULTIPLIER = 0.014;
TaikoDifficultyCalculator._STAMINA_SKILL_MULTIPLIER = 0.02;
var TaikoPerformanceCalculator = class extends PerformanceCalculator {
  constructor(ruleset, attributes, score) {
    let _a3, _b2, _c, _d, _e, _f;
    super(ruleset, attributes, score);
    this.attributes = attributes;
    this._mods = (_a3 = score === null || score === void 0 ? void 0 : score.mods) !== null && _a3 !== void 0 ? _a3 : new TaikoModCombination();
    this._countGreat = (_b2 = this._score.statistics.great) !== null && _b2 !== void 0 ? _b2 : 0;
    this._countOk = (_c = this._score.statistics.ok) !== null && _c !== void 0 ? _c : 0;
    this._countMeh = (_d = this._score.statistics.meh) !== null && _d !== void 0 ? _d : 0;
    this._countMiss = (_e = this._score.statistics.miss) !== null && _e !== void 0 ? _e : 0;
    this._accuracy = (_f = this._score.accuracy) !== null && _f !== void 0 ? _f : 1;
  }
  calculateAttributes() {
    let multiplier = 1.1;
    if (this._mods.has(ModBitwise.NoFail)) {
      multiplier *= 0.9;
    }
    if (this._mods.has(ModBitwise.Hidden)) {
      multiplier *= 1.1;
    }
    const strainValue = this._computeStrainValue();
    const accuracyValue = this._computeAccuracyValue();
    const totalValue = Math.pow(Math.pow(strainValue, 1.1) + Math.pow(accuracyValue, 1.1), 1 / 1.1) * multiplier;
    const attributes = new TaikoPerformanceAttributes(this._mods, totalValue);
    attributes.strainPerformance = strainValue;
    attributes.accuracyPerformance = accuracyValue;
    return attributes;
  }
  _computeStrainValue() {
    const max2 = Math.max(1, this.attributes.starRating / 75e-4);
    let strainValue = Math.pow(5 * max2 - 4, 2) / 1e5;
    const lengthBonus = 1 + 0.1 * Math.min(1, this._totalHits / 1500);
    strainValue *= lengthBonus;
    strainValue *= Math.pow(0.985, this._countMiss);
    if (this._mods.has(ModBitwise.Hidden)) {
      strainValue *= 1.025;
    }
    if (this._mods.has(ModBitwise.Flashlight)) {
      strainValue *= 1.05 * lengthBonus;
    }
    return strainValue * this._accuracy;
  }
  _computeAccuracyValue() {
    if (this.attributes.greatHitWindow <= 0) {
      return 0;
    }
    const accValue = Math.pow(150 / this.attributes.greatHitWindow, 1.1) * Math.pow(this._score.accuracy, 15) * 22;
    return accValue * Math.min(1.15, Math.pow(this._totalHits / 1500, 0.3));
  }
  get _totalHits() {
    return this._countGreat + this._countOk + this._countMeh + this._countMiss;
  }
};
var TaikoRuleset = class extends Ruleset {
  get id() {
    return 1;
  }
  applyToBeatmap(beatmap) {
    return super.applyToBeatmap(beatmap);
  }
  applyToBeatmapWithMods(beatmap, mods) {
    return super.applyToBeatmapWithMods(beatmap, mods);
  }
  resetMods(beatmap) {
    return super.resetMods(beatmap);
  }
  createModCombination(input) {
    return new TaikoModCombination(input);
  }
  createBeatmapProcessor() {
    return new TaikoBeatmapProcessor();
  }
  createBeatmapConverter() {
    return new TaikoBeatmapConverter();
  }
  createDifficultyCalculator(beatmap) {
    return new TaikoDifficultyCalculator(beatmap, this);
  }
  createPerformanceCalculator(attributes, score) {
    return new TaikoPerformanceCalculator(this, attributes, score);
  }
};

// node_modules/fflate/esm/browser.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var u32 = Uint32Array;
var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]);
var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new u32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return [b, r];
};
var _a2 = freb(fleb, 2);
var fl = _a2[0];
var revfl = _a2[1];
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b[0];
var revfd = _b[1];
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >>> 1 | (i & 21845) << 1;
  x = (x & 52428) >>> 2 | (x & 13107) << 2;
  x = (x & 61680) >>> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >>> 8 | (x & 255) << 8) >>> 1;
}
var x;
var i;
var hMap = function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 0; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >>> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >>> 15 - cd[i];
      }
    }
  }
  return co;
};
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i = 1; i < a.length; ++i) {
    if (a[i] > m)
      m = a[i];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  var n = new (v.BYTES_PER_ELEMENT == 2 ? u16 : v.BYTES_PER_ELEMENT == 4 ? u32 : u8)(e - s);
  n.set(v.subarray(s, e));
  return n;
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, buf, st) {
  var sl = dat.length;
  if (!sl || st && st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf || st;
  var noSt = !st || st.i;
  if (!st)
    st = {};
  if (!buf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (noBuf)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i = 0; i < hcLen; ++i) {
          clt[clim[i]] = bits(dat, pos + i * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i = 0; i < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >>> 4;
          if (s < 16) {
            ldt[i++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (noBuf)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >>> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i = sym - 257, b = fleb[i];
          add = bits(dat, pos, (1 << b) - 1) + fl[i];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >>> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (noBuf)
          cbuf(bt + 131072);
        var end = bt + add;
        for (; bt < end; bt += 4) {
          buf[bt] = buf[bt - dt];
          buf[bt + 1] = buf[bt + 1 - dt];
          buf[bt + 2] = buf[bt + 2 - dt];
          buf[bt + 3] = buf[bt + 3 - dt];
        }
        bt = end;
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt == buf.length ? buf : slc(buf, 0, bt);
};
var et = /* @__PURE__ */ new u8(0);
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
function inflateSync(data, out) {
  return inflt(data, out);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i = 0; ; ) {
    var c = d[i++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i + eb > d.length)
      return [r, slc(d, i - 1)];
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
  }
};
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i = 0; i < dat.length; i += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
    return r;
  } else if (td)
    return td.decode(dat);
  else {
    var _a3 = dutf8(dat), out = _a3[0], ext = _a3[1];
    if (ext.length)
      err(8);
    return out;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl, bs = b4(d, b + 20);
  var _a3 = z && bs == 4294967295 ? z64e(d, es) : [bs, b4(d, b + 24), b4(d, b + 42)], sc = _a3[0], su = _a3[1], off = _a3[2];
  return [b2(d, b + 10), sc, su, fn, es + b2(d, b + 30) + b2(d, b + 32), off];
};
var z64e = function(d, b) {
  for (; b2(d, b) != 1; b += 4 + b2(d, b + 2))
    ;
  return [b8(d, b + 12), b8(d, b + 4), b8(d, b + 20)];
};
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  ;
  var c = b2(data, e + 8);
  if (!c)
    return {};
  var o = b4(data, e + 16);
  var z = o == 4294967295;
  if (z) {
    e = b4(data, e - 12);
    if (b4(data, e) != 101075792)
      err(13);
    c = b4(data, e + 32);
    o = b4(data, e + 48);
  }
  var fltr = opts && opts.filter;
  for (var i = 0; i < c; ++i) {
    var _a3 = zh(data, o, z), c_2 = _a3[0], sc = _a3[1], su = _a3[2], fn = _a3[3], no = _a3[4], off = _a3[5], b = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn] = slc(data, b, b + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data.subarray(b, b + sc), new u8(su));
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}

// src/taiko.js
AFRAME.registerComponent("taiko", {
  schema: {},
  init: function() {
    this.time = 0;
    this.started = false;
    this.metadata = {};
    this.hitObjects = [];
    this.activeBeats = [];
    this.currentBeat = 0;
    this.notesHit = 0;
    this.noteStreak = 0;
    this.notesHitText = document.querySelector("#notesHit");
    this.noteStreakText = document.querySelector("#noteStreak");
    const drumRimLeft = document.querySelector("#drumRimLeft");
    const drumRimRight = document.querySelector("#drumRimRight");
    const drumHeadLeft = document.querySelector("#drumHeadLeft");
    const drumHeadRight = document.querySelector("#drumHeadRight");
    this.song = document.querySelector("#song");
    const hitSound = document.querySelector("#hit").components.sound;
    const clapSound = document.querySelector("#clap").components.sound;
    const startSong = () => {
      if (this.started)
        return;
      this.song.addEventListener("play", () => this.started = true);
      this.song.play();
      this.notesHitText.setAttribute("value", `Notes hit: ${this.notesHit}/${this.hitObjects.length}`);
    };
    const checkRimHit = () => {
      clapSound.playSound();
      if (this.activeBeats.length === 0)
        return;
      if (this.activeBeats[0].isRim) {
        if (Math.abs(this.activeBeats[0].startTime - this.time) < 125) {
          this.notesHit++;
          this.noteStreak++;
          this.notesHitText.setAttribute("value", `Notes hit: ${this.notesHit}/${this.hitObjects.length}`);
          this.noteStreakText.setAttribute("value", `Streak: ${this.noteStreak}`);
          this.deleteBeat(this.activeBeats[0].beat, 0);
        }
      }
    };
    const checkHeadHit = () => {
      hitSound.playSound();
      if (this.activeBeats.length === 0)
        return;
      if (!this.activeBeats[0].isRim) {
        if (Math.abs(this.activeBeats[0].startTime - this.time) < 125) {
          this.notesHit++;
          this.noteStreak++;
          this.notesHitText.setAttribute("value", `Notes hit: ${this.notesHit}/${this.hitObjects.length}`);
          this.noteStreakText.setAttribute("value", `Streak: ${this.noteStreak}`);
          this.deleteBeat(this.activeBeats[0].beat, 0);
        }
      }
    };
    document.addEventListener("keypress", (e) => {
      if (e.key === " ") {
        startSong();
      } else if (e.key === "z" || e.key === "v") {
        checkRimHit();
      } else if (e.key === "x" || e.key === "c") {
        checkHeadHit();
      }
    });
    document.addEventListener("enter-vr", (e) => {
      this.el.sceneEl.xrSession.addEventListener("squeezestart", startSong);
    });
    drumRimLeft.addEventListener("contactbegin", checkRimHit);
    drumRimRight.addEventListener("contactbegin", checkRimHit);
    drumHeadLeft.addEventListener("contactbegin", checkHeadHit);
    drumHeadRight.addEventListener("contactbegin", checkHeadHit);
    this.loadBeatmapSet();
  },
  loadBeatmap: async function(beatmap) {
    const decoder = new BeatmapDecoder();
    const decodeString = beatmap;
    const shouldParseSb = true;
    const parsed = decoder.decodeFromString(decodeString, shouldParseSb);
    const ruleset = new TaikoRuleset();
    const taikoWithNoMod = ruleset.applyToBeatmap(parsed);
    console.log(taikoWithNoMod);
    this.metadata = taikoWithNoMod.metadata;
    this.hitObjects = taikoWithNoMod.hitObjects;
    this.activeBeats = [];
  },
  loadBeatmapSet: async function() {
    const beatmapSet = await (await fetch("https://api.chimu.moe/v1/download/359501")).arrayBuffer();
    const beatmapSetBuffers = unzipSync(new Uint8Array(beatmapSet));
    console.log(beatmapSetBuffers);
    const testBeatmapAudio = Object.values(beatmapSetBuffers)[0];
    const audioBlob = new Blob([testBeatmapAudio.buffer], { type: "audio/mp3" });
    this.song.src = URL.createObjectURL(audioBlob);
    const testBeatmap = Object.values(beatmapSetBuffers)[5];
    const dataview = new DataView(testBeatmap.buffer);
    const textDecoder = new TextDecoder("utf-8");
    const decodedBeatmap = textDecoder.decode(dataview);
    this.loadBeatmap(decodedBeatmap);
  },
  tick: function(time, timeDelta) {
    if (!this.started)
      return;
    this.time += timeDelta;
    for (; this.currentBeat < this.hitObjects.length; this.currentBeat++) {
      if (this.hitObjects[this.currentBeat].startTime - this.time > 2e3)
        break;
      const beat = document.createElement("a-box");
      const { startTime, isRim, isStrong } = this.hitObjects[this.currentBeat];
      const position = (startTime - this.time) / 100;
      const color = isRim ? "blue" : "orange";
      const scale = isStrong ? "1 1 .1" : "0.5 0.5 0.1";
      beat.setAttribute("position", `0 ${position} 0`);
      beat.setAttribute("scale", scale);
      beat.setAttribute("animation", `property: position; to: 0 -2.5 0; dur: ${(position + 1) * 100}; easing: linear`);
      beat.setAttribute("material", `color: ${color}`);
      beat.id = `${this.currentBeat}`;
      document.querySelector("#noteHighway").appendChild(beat);
      this.activeBeats.push({
        beat,
        startTime: this.hitObjects[this.currentBeat].startTime,
        isRim,
        isStrong,
        hit: false
      });
    }
    for (let i = this.activeBeats.length - 1; i >= 0; i--) {
      if (this.activeBeats[i] == null)
        continue;
      if (this.activeBeats[i].startTime - this.time < -125) {
        const oldBeat = document.getElementById(this.activeBeats[i].beat.id);
        this.deleteBeat(oldBeat, i);
        this.noteStreak = 0;
        this.noteStreakText.setAttribute("value", `Streak: ${this.noteStreak}`);
      }
    }
  },
  deleteBeat: function(beat, idx) {
    if (!beat)
      return;
    beat.remove();
    this.activeBeats.splice(idx, 1);
  }
});
