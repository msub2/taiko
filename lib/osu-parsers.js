import { Colour, SampleSet, HitObject, SliderPath, SampleBank, HitType, HitSound, PathPoint, PathType, Vector2, HitSample, TimeSignature, EffectType, TimingPoint, DifficultyPoint, EffectPoint, SamplePoint, EventType, BeatmapBreakEvent, LayerType, StoryboardSample, StoryboardAnimation, Origins, LoopType, StoryboardSprite, CommandLoop, CommandTrigger, CommandType, ColourCommand, RotateCommand, VectorScaleCommand, ScaleCommand, MoveYCommand, MoveXCommand, MoveCommand, FadeCommand, BlendingCommand, ParameterType, VerticalFlipCommand, HorizontalFlipCommand, Storyboard, CompoundType, Beatmap, ScoreInfo, Score, ControlPointType } from 'osu-classes';

class Parsing {
  static parseInt(input, parseLimit = this.MAX_PARSE_VALUE) {
    return this._getValue(parseInt(input), parseLimit);
  }
  static parseFloat(input, parseLimit = this.MAX_PARSE_VALUE) {
    return this._getValue(parseFloat(input), parseLimit);
  }
  static _getValue(value, parseLimit = this.MAX_PARSE_VALUE) {
    if (value < -parseLimit) {
      throw new Error('Value is too low!');
    }

    if (value > parseLimit) {
      throw new Error('Value is too high!');
    }

    if (Number.isNaN(value)) {
      throw new Error('Not a number');
    }

    return value;
  }
}
/**
 * Max value for slider path distance.
 */
Parsing.MAX_COORDINATE_VALUE = 131072;
/**
 * Max parse value for all properties.
 */
Parsing.MAX_PARSE_VALUE = 2147483647;

/**
 * A decoder for beatmap colours.
 */
class ColourDecoder {
  /**
   * Decodes a colour line and adds a new colour to the beatmap.
   * @param line A colour line.
   * @param beatmap A parsed beatmap.
   */
  static handleLine(line, beatmap) {
    const [key, ...values] = line.split(':').map((v) => v.trim());
    const value = values
      .join(' ')
      .split(',')
      .map((c) => Parsing.parseInt(c));
    const colour = new Colour(value[0], value[1], value[2]);

    switch (key) {
      case 'SliderTrackOverride':
        beatmap.colours.sliderTrackColor = colour;
        break;
      case 'SliderBorder':
        beatmap.colours.sliderBorderColor = colour;
        break;
      default:
        beatmap.colours.comboColours.push(colour);
    }
  }
}

/**
 * A decoder for beatmap difficulty.
 */
class DifficultyDecoder {
  /**
   * Decodes beatmap difficulty line and adds difficulty data to a beatmap.
   * @param line Difficulty section line.
   * @param beatmap A parsed beatmap.
   */
  static handleLine(line, beatmap) {
    const [key, ...values] = line.split(':').map((v) => v.trim());
    const value = values.join(' ');

    switch (key) {
      case 'CircleSize':
        beatmap.difficulty.circleSize = Parsing.parseFloat(value);
        break;
      case 'HPDrainRate':
        beatmap.difficulty.drainRate = Parsing.parseFloat(value);
        break;
      case 'OverallDifficulty':
        beatmap.difficulty.overallDifficulty = Parsing.parseFloat(value);
        break;
      case 'ApproachRate':
        beatmap.difficulty.approachRate = Parsing.parseFloat(value);
        break;
      case 'SliderMultiplier':
        beatmap.difficulty.sliderMultiplier = Parsing.parseFloat(value);
        break;
      case 'SliderTickRate':
        beatmap.difficulty.sliderTickRate = Parsing.parseFloat(value);
    }
  }
}

/**
 * A decoder for beatmap editor settings.
 */
class EditorDecoder {
  /**
   * Decodes beatmap editor line and adds editor settings data to a beatmap.
   * @param line Editor section line.
   * @param beatmap A parsed beatmap.
   */
  static handleLine(line, beatmap) {
    const [key, ...values] = line.split(':').map((v) => v.trim());
    const value = values.join(' ');

    switch (key) {
      case 'Bookmarks':
        beatmap.editor.bookmarks = value.split(',').map((v) => +v);
        break;
      case 'DistanceSpacing':
        beatmap.editor.distanceSpacing = Math.max(0, Parsing.parseFloat(value));
        break;
      case 'BeatDivisor':
        beatmap.editor.beatDivisor = Parsing.parseInt(value);
        break;
      case 'GridSize':
        beatmap.editor.gridSize = Parsing.parseInt(value);
        break;
      case 'TimelineZoom':
        beatmap.editor.timelineZoom = Math.max(0, Parsing.parseFloat(value));
    }
  }
}

/**
 * A decoder for general info of a beatmap.
 */
class GeneralDecoder {
  /**
   * Decodes beatmap general line and adds general info to a beatmap.
   * @param line General section line.
   * @param beatmap A parsed beatmap.
   * @param offset The offset to apply to all time values.
   */
  static handleLine(line, beatmap, offset) {
    const [key, ...values] = line.split(':').map((v) => v.trim());
    const value = values.join(' ');

    switch (key) {
      case 'AudioFilename':
        beatmap.general.audioFilename = value;
        break;
      case 'AudioHash':
        beatmap.general.audioHash = value;
        break;
      case 'OverlayPosition':
        beatmap.general.overlayPosition = value;
        break;
      case 'SkinPreference':
        beatmap.general.skinPreference = value;
        break;
      case 'AudioLeadIn':
        beatmap.general.audioLeadIn = Parsing.parseInt(value);
        break;
      case 'PreviewTime':
        beatmap.general.previewTime = Parsing.parseInt(value) + offset;
        break;
      case 'Countdown':
        beatmap.general.countdown = Parsing.parseInt(value);
        break;
      case 'StackLeniency':
        beatmap.general.stackLeniency = Parsing.parseFloat(value);
        break;
      case 'Mode':
        beatmap.originalMode = Parsing.parseInt(value);
        break;
      case 'CountdownOffset':
        beatmap.general.countdownOffset = Parsing.parseInt(value);
        break;
      case 'SampleSet':
        beatmap.general.sampleSet = SampleSet[value];
        break;
      case 'LetterboxInBreaks':
        beatmap.general.letterboxInBreaks = !!value;
        break;
      case 'StoryFireInFront':
        beatmap.general.storyFireInFront = !!value;
        break;
      case 'UseSkinSprites':
        beatmap.general.useSkinSprites = !!value;
        break;
      case 'AlwaysShowPlayfield':
        beatmap.general.alwaysShowPlayfield = !!value;
        break;
      case 'EpilepsyWarning':
        beatmap.general.epilepsyWarning = !!value;
        break;
      case 'SpecialStyle':
        beatmap.general.specialStyle = !!value;
        break;
      case 'WidescreenStoryboard':
        beatmap.general.widescreenStoryboard = !!value;
        break;
      case 'SamplesMatchPlaybackRate':
        beatmap.general.samplesMatchPlaybackRate = !!value;
    }
  }
}

/**
 * A hittable object.
 */
class HittableObject extends HitObject {
}

/**
 * A holdable object.
 */
class HoldableObject extends HitObject {
  constructor() {
    super(...arguments);
    /**
     * The time at which the holdable object ends.
     */
    this.endTime = 0;
    /**
     * The samples to be played when each node of the holdable object is hit.
     * 0: The first node.
     * 1: The first repeat.
     * 2: The second repeat.
     * ...
     * n-1: The last repeat.
     * n: The last node.
     */
    this.nodeSamples = [];
  }
  /**
   * The duration of the holdable object.
   */
  get duration() {
    return this.endTime - this.startTime;
  }
  /**
   * Creates a copy of this holdable object.
   * Non-primitive properties will be copied via their own clone() method.
   * @returns A copied holdable object.
   */
  clone() {
    const cloned = super.clone();

    cloned.endTime = this.endTime;
    cloned.nestedHitObjects = this.nestedHitObjects.map((h) => h.clone());
    cloned.nodeSamples = this.nodeSamples.map((n) => n.map((s) => s.clone()));

    return cloned;
  }
}

/**
 * A parsed slidable object.
 */
class SlidableObject extends HitObject {
  constructor() {
    super(...arguments);
    /**
     * The amount of times a slidable object repeats.
     */
    this.repeats = 0;
    /**
     * Velocity of this slidable object.
     */
    this.velocity = 1;
    /**
     * The curve of a slidable object.
     */
    this.path = new SliderPath();
    /**
     * The last tick offset of slidable objects in osu!stable.
     */
    this.legacyLastTickOffset = 36;
    /**
     * The samples to be played when each node of the slidable object is hit.
     * 0: The first node.
     * 1: The first repeat.
     * 2: The second repeat.
     * ...
     * n-1: The last repeat.
     * n: The last node.
     */
    this.nodeSamples = [];
  }
  /**
   * The duration of this slidable object.
   */
  get duration() {
    return this.spans * this.spanDuration;
  }
  /**
   * The time at which the slidable object ends.
   */
  get endTime() {
    return this.startTime + this.duration;
  }
  /**
   * The amount of times the length of this slidable object spans.
   */
  get spans() {
    return this.repeats + 1;
  }
  set spans(value) {
    this.repeats = value - 1;
  }
  /**
   * The duration of a single span of this slidable object.
   */
  get spanDuration() {
    return this.distance / this.velocity;
  }
  /**
   * The positional length of a slidable object.
   */
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
    const scoringDistance = SlidableObject.BASE_SCORING_DISTANCE
            * difficulty.sliderMultiplier * difficultyPoint.speedMultiplier;

    this.velocity = scoringDistance / timingPoint.beatLength;
  }
  /**
   * Creates a copy of this parsed slider.
   * Non-primitive properties will be copied via their own clone() method.
   * @returns A copied parsed slider.
   */
  clone() {
    const cloned = super.clone();

    cloned.legacyLastTickOffset = this.legacyLastTickOffset;
    cloned.nodeSamples = this.nodeSamples.map((n) => n.map((s) => s.clone()));
    cloned.velocity = this.velocity;
    cloned.repeats = this.repeats;
    cloned.path = this.path.clone();

    return cloned;
  }
}
/**
 * Scoring distance with a speed-adjusted beat length of 1 second
 * (ie. the speed slider balls move through their track).
 */
SlidableObject.BASE_SCORING_DISTANCE = 100;

/**
 * A parsed spinnable object.
 */
class SpinnableObject extends HitObject {
  constructor() {
    super(...arguments);
    /**
     * The time at which the spinnable object ends.
     */
    this.endTime = 0;
  }
  /**
   * The duration of this spinnable object.
   */
  get duration() {
    return this.endTime - this.startTime;
  }
  /**
   * Creates a copy of this parsed spinner.
   * Non-primitive properties will be copied via their own clone() method.
   * @returns A copied parsed spinner.
   */
  clone() {
    const cloned = super.clone();

    cloned.endTime = this.endTime;

    return cloned;
  }
}

/**
 * A decoder for beatmap hit objects.
 */
class HitObjectDecoder {
  /**
   * Decodes a hit object line to get a parsed hit object.
   * @param line A hit object line.
   * @param offset The offset to apply to all time values.
   * @returns A new parsed hit object.
   */
  static handleLine(line, beatmap, offset) {
    // x,y,time,type,hitSound,objectParams,hitSample
    const data = line.split(',').map((v) => v.trim());
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
  /**
   * Adds extra data to the parsed hit object.
   * @param data The data of a hit object line.
   * @param hitObject A parsed hit object.
   * @param bankInfo Sample bank.
   * @param offset The offset to apply to all time values.
   */
  static addExtras(data, hitObject, bankInfo, offset) {
    if ((hitObject.hitType & HitType.Normal) && data.length > 0) {
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
  /**
   * Adds slider extra data to a parsed slider.
   * @param extras Extra data of slidable object.
   * @param slider A parsed slider.
   * @param bankInfo Sample bank.
   */
  static addSliderExtras(extras, slider, bankInfo) {
    // curveType|curvePoints,slides,length,edgeSounds,edgeSets,hitSample
    const pathString = extras[0];
    const offset = slider.startPosition;
    const repeats = Parsing.parseInt(extras[1]);

    if (slider.repeats > 9000) {
      throw new Error('Repeat count is way too high');
    }

    /**
     * osu!stable treated the first span of the slider as a repeat,
     * but no repeats are happening.
     */
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
  /**
   * Adds spinner extra data to a parsed spinner.
   * @param extras Extra data of spinnable object.
   * @param spinner A parsed spinner.
   * @param bankInfo Sample bank.
   * @param offset The offset to apply to all time values.
   */
  static addSpinnerExtras(extras, spinner, bankInfo, offset) {
    // endTime,hitSample
    spinner.endTime = Parsing.parseInt(extras[0]) + offset;

    if (extras.length > 1) {
      this.readCustomSampleBanks(extras[1], bankInfo);
    }
  }
  /**
   * Adds hold extra data to a parsed hold.
   * @param extras Extra data of a holdable object.
   * @param hold A parsed hold.
   * @param bankInfo Sample bank.
   * @param offset The offset to apply to all time values.
   */
  static addHoldExtras(extras, hold, bankInfo, offset) {
    // endTime:hitSample
    hold.endTime = hold.startTime;

    if (extras.length > 0 && extras[0]) {
      const ss = extras[0].split(':');

      hold.endTime = Math.max(hold.endTime, Parsing.parseFloat(ss[0])) + offset;
      this.readCustomSampleBanks(ss.slice(1).join(':'), bankInfo);
    }
  }
  static getSliderNodeSamples(extras, slider, bankInfo) {
    /**
     * One node for each repeat + the start and end nodes.
     */
    const nodes = slider.repeats + 2;
    /**
     * Populate node sample bank infos with the default hit object sample bank.
     */
    const nodeBankInfos = [];

    for (let i = 0; i < nodes; ++i) {
      nodeBankInfos.push(bankInfo.clone());
    }

    /**
     * Read any per-node sample banks.
     */
    if (extras.length > 4 && extras[4].length > 0) {
      const sets = extras[4].split('|');

      for (let i = 0; i < nodes; ++i) {
        if (i >= sets.length) {
          break;
        }

        this.readCustomSampleBanks(sets[i], nodeBankInfos[i]);
      }
    }

    /**
     * Populate node sound types with the default hit object sound type.
     */
    const nodeSoundTypes = [];

    for (let i = 0; i < nodes; ++i) {
      nodeSoundTypes.push(slider.hitSound);
    }

    /**
     * Read any per-node sound types.
     */
    if (extras.length > 3 && extras[3].length > 0) {
      const adds = extras[3].split('|');

      for (let i = 0; i < nodes; ++i) {
        if (i >= adds.length) {
          break;
        }

        nodeSoundTypes[i] = parseInt(adds[i]) || HitSound.None;
      }
    }

    /**
     * Generate the final per-node samples.
     */
    const nodeSamples = [];

    for (let i = 0; i < nodes; i++) {
      nodeSamples.push(this.convertSoundType(nodeSoundTypes[i], nodeBankInfos[i]));
    }

    return nodeSamples;
  }
  /**
   * Converts a given path string into a set of path control points.
   *
   * A path string takes the form: X|1:1|2:2|2:2|3:3|Y|1:1|2:2.
   * This has three segments:
   *  X: { (1,1), (2,2) } (implicit segment)
   *  X: { (2,2), (3,3) } (implicit segment)
   *  Y: { (3,3), (1,1), (2, 2) } (explicit segment)
   *
   * @param pathString The path string.
   * @param offset The positional offset to apply to the control points.
   * @returns All control points in the resultant path.
   */
  static convertPathString(pathString, offset) {
    /**
     * This code takes on the responsibility of handling explicit segments of the path ("X" & "Y" from above).
     * Implicit segments are handled by calls to convertPoints().
     */
    const pathSplit = pathString.split('|').map((p) => p.trim());
    const controlPoints = [];
    let startIndex = 0;
    let endIndex = 0;
    let isFirst = true;

    while (++endIndex < pathSplit.length) {
      /**
       * Keep incrementing endIndex while it's not the start of a new segment
       * (indicated by having a type descriptor of length 1).
       */
      if (pathSplit[endIndex].length > 1) {
        continue;
      }

      const points = pathSplit.slice(startIndex, endIndex);
      /**
       * Multi-segmented sliders DON'T contain the end point
       * as part of the current segment as it's assumed to be the start of the next segment.
       * The start of the next segment is the index after the type descriptor.
       */
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
  /**
   * Converts a given point list into a set of path segments.
   * @param points The point list.
   * @param endPoint Any extra endpoint to consider as part of the points.
   * @param isFisrt Whether this is the first segment in the set.
   * If true the first of the returned segments will contain a zero point.
   * @param offset The positional offset to apply to the control points.
   * @returns The set of points contained by point list as one or more segments of the path,
   * prepended by an extra zero point if isFirst is true.
   */
  static *convertPoints(points, endPoint, isFirst, offset) {
    // First control point is zero for the first segment.
    const readOffset = isFirst ? 1 : 0;
    // Extra length if an endpoint is given that lies outside the base point span.
    const endPointLength = endPoint !== null ? 1 : 0;
    const vertices = [];

    // Fill any non-read points.
    if (readOffset === 1) {
      vertices[0] = new PathPoint();
    }

    // Parse into control points.
    for (let i = 1; i < points.length; ++i) {
      vertices[readOffset + i - 1] = readPoint(points[i], offset);
    }

    // If an endpoint is given, add it to the end.
    if (endPoint !== null) {
      vertices[vertices.length - 1] = readPoint(endPoint, offset);
    }

    let type = HitObjectDecoder.convertPathType(points[0]);

    // Edge-case rules (to match stable).
    if (type === PathType.PerfectCurve) {
      if (vertices.length !== 3) {
        type = PathType.Bezier;
      }
      else if (isLinear(vertices)) {
        // osu!stable special-cased colinear perfect curves to a linear path
        type = PathType.Linear;
      }
    }

    // The first control point must have a definite type.
    vertices[0].type = type;

    /**
     * A path can have multiple implicit segments of the same type
     * if there are two sequential control points with the same position.
     * To handle such cases, this code may return multiple path segments
     * with the final control point in each segment having a non-null type.
     *
     * For the point string X|1:1|2:2|2:2|3:3, this code returns the segments:
     *  X: { (1, 1), (2, 2) }
     *  X: { (3, 3) }
     *
     * Note: (2, 2) is not returned in the second segments, as it is implicit in the path.
     */
    let startIndex = 0;
    let endIndex = 0;

    while (++endIndex < vertices.length - endPointLength) {
      // Keep incrementing while an implicit segment doesn't need to be started
      if (!vertices[endIndex].position.equals(vertices[endIndex - 1].position)) {
        continue;
      }

      // The last control point of each segment is not allowed to start a new implicit segment.
      if (endIndex === vertices.length - endPointLength - 1) {
        continue;
      }

      // Force a type on the last point, and return the current control point set as a segment.
      vertices[endIndex - 1].type = type;
      yield vertices.slice(startIndex, endIndex);
      // Skip the current control point - as it's the same as the one that's just been returned.
      startIndex = endIndex + 1;
    }

    if (endIndex > startIndex) {
      yield vertices.slice(startIndex, endIndex);
    }

    function readPoint(point, offset) {
      const coords = point.split(':').map((v) => {
        return Parsing.parseFloat(v, Parsing.MAX_COORDINATE_VALUE);
      });
      const pos = new Vector2(coords[0], coords[1]).subtract(offset);

      return new PathPoint(pos);
    }

    function isLinear(p) {
      const yx = (p[1].position.y - p[0].position.y) * (p[2].position.x - p[0].position.x);
      const xy = (p[1].position.x - p[0].position.x) * (p[2].position.y - p[0].position.y);
      const acceptableDifference = 0.001;

      return Math.abs(yx - xy) < acceptableDifference;
    }
  }
  static convertPathType(type) {
    switch (type) {
      default:
      case 'C':
        return PathType.Catmull;
      case 'B':
        return PathType.Bezier;
      case 'L':
        return PathType.Linear;
      case 'P':
        return PathType.PerfectCurve;
    }
  }
  static readCustomSampleBanks(hitSample, bankInfo) {
    if (!hitSample) {
      return;
    }

    const split = hitSample.split(':');

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

    bankInfo.filename = split.length > 4 ? split[4] : '';
  }
  static convertSoundType(type, bankInfo) {
    // TODO: This should return the normal SampleInfos if the specified sample file isn't found, but that's a pretty edge-case scenario
    if (bankInfo.filename) {
      const sample = new HitSample();

      sample.filename = bankInfo.filename;
      sample.volume = bankInfo.volume;

      return [sample];
    }

    const soundTypes = [new HitSample()];

    soundTypes[0].hitSound = HitSound[HitSound.Normal];
    soundTypes[0].sampleSet = SampleSet[bankInfo.normalSet];
    /**
     * if the sound type doesn't have the Normal flag set,
     * attach it anyway as a layered sample.
     * None also counts as a normal non-layered sample.
     */
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
      sound.sampleSet = i !== 0
        ? SampleSet[bankInfo.additionSet]
        : SampleSet[bankInfo.normalSet];

      sound.volume = bankInfo.volume;
      sound.customIndex = 0;

      if (bankInfo.customIndex >= 2) {
        sound.customIndex = bankInfo.customIndex;
      }
    });

    return soundTypes;
  }
  /**
   * Creates a new parsed hit object based on hit type.
   * @param hitType Hit type data.
   * @returns A new parsed hit object.
   */
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
}

/**
 * A decoder for beatmap metadata.
 */
class MetadataDecoder {
  /**
   * Decodes beatmap metadata line and adds metadata to a beatmap.
   * @param line Metadata section line.
   * @param beatmap A parsed beatmap.
   */
  static handleLine(line, beatmap) {
    const [key, ...values] = line.split(':').map((v) => v.trim());
    const value = values.join(' ');

    switch (key) {
      case 'Title':
        beatmap.metadata.title = value;
        break;
      case 'TitleUnicode':
        beatmap.metadata.titleUnicode = value;
        break;
      case 'Artist':
        beatmap.metadata.artist = value;
        break;
      case 'ArtistUnicode':
        beatmap.metadata.artistUnicode = value;
        break;
      case 'Creator':
        beatmap.metadata.creator = value;
        break;
      case 'Version':
        beatmap.metadata.version = value;
        break;
      case 'Source':
        beatmap.metadata.source = value;
        break;
      case 'Tags':
        beatmap.metadata.tags = value.split(' ');
        break;
      case 'BeatmapID':
        beatmap.metadata.beatmapId = Parsing.parseInt(value);
        break;
      case 'BeatmapSetID':
        beatmap.metadata.beatmapSetId = Parsing.parseInt(value);
    }
  }
}

/**
 * A decoder for beatmap control points.
 */
class TimingPointDecoder {
  /**
   * Decodes timing point line and adds control points to a beatmap.
   * @param line A timing point line.
   * @param beatmap A parsed beatmap.
   * @param offset The offset to apply to all time values.
   */
  static handleLine(line, beatmap, offset) {
    // Time,beatLength,meter,sampleSet,sampleIndex,volume,uninherited,effects
    TimingPointDecoder.controlPoints = beatmap.controlPoints;

    const data = line.split(',');
    let timeSignature = TimeSignature.SimpleQuadruple;
    let sampleSet = SampleSet[SampleSet.None];
    let customIndex = 0;
    let volume = 100;
    let timingChange = true;
    let effects = EffectType.None;

    if (data.length > 2) {
      switch (data.length) {
        default:
        case 8: effects = Parsing.parseInt(data[7]);
        case 7: timingChange = data[6] === '1';
        case 6: volume = Parsing.parseInt(data[5]);
        case 5: customIndex = Parsing.parseInt(data[4]);
        case 4: sampleSet = SampleSet[Parsing.parseInt(data[3])];
        case 3: timeSignature = Parsing.parseInt(data[2]);
      }
    }

    if (timeSignature < 1) {
      throw new Error('The numerator of a time signature must be positive.');
    }

    const beatLength = Parsing.parseFloat(data[1]);
    const startTime = Parsing.parseFloat(data[0]) + offset;
    let bpmMultiplier = 1;
    let speedMultiplier = 1;

    if (beatLength < 0) {
      speedMultiplier = 100 / -beatLength;
      bpmMultiplier = Math.min(Math.fround(-beatLength), 10000);
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
  /**
   * Adds control point to the pending list
   * and flushes all stored data on time change.
   * @param point A control point
   * @param time The time at which control point starts.
   * @param timingChange
   */
  static addControlPoint(point, time, timingChange) {
    if (time !== TimingPointDecoder.pendingTime) {
      TimingPointDecoder.flushPendingPoints();
    }

    timingChange
      ? TimingPointDecoder.pendingPoints.unshift(point)
      : TimingPointDecoder.pendingPoints.push(point);

    TimingPointDecoder.pendingTime = time;
  }
  /**
   * Adds control points to their own group.
   */
  static flushPendingPoints() {
    const pendingTime = TimingPointDecoder.pendingTime;
    const pendingPoints = TimingPointDecoder.pendingPoints;
    const controlPoints = TimingPointDecoder.controlPoints;
    const pendingTypes = TimingPointDecoder.pendingTypes;
    let i = pendingPoints.length;

    while (--i >= 0) {
      /**
       * Changes from non-timing points are added to the end of the list
       * and should override any changes from timing points.
       */
      if (pendingTypes.includes(pendingPoints[i].pointType)) {
        continue;
      }

      pendingTypes.push(pendingPoints[i].pointType);
      controlPoints.add(pendingPoints[i], pendingTime);
    }

    TimingPointDecoder.pendingPoints = [];
    TimingPointDecoder.pendingTypes = [];
  }
}
/**
 * The time for the next flush of control points.
 */
TimingPointDecoder.pendingTime = 0;
/**
 * Types of control points that will be flushed.
 */
TimingPointDecoder.pendingTypes = [];
/**
 * Control points that will be flushed.
 */
TimingPointDecoder.pendingPoints = [];

class SerializationReader {
  constructor(buffer) {
    /**
     * Number of read bytes.
     */
    this._bytesRead = 0;
    this.buffer = buffer;
  }
  get bytesRead() {
    return this._bytesRead;
  }
  /**
   * Remaining bytes for reading.
   */
  get remainingBytes() {
    return this.buffer.length - this._bytesRead;
  }
  /**
   * Read single byte.
   */
  readByte() {
    return this.buffer.readUInt8(this._bytesRead++);
  }
  /**
   * Read multiple bytes
   * @param length The number of bytes to be read.
   * @returns Sliced buffer.
   */
  readBytes(length) {
    const bytes = this.buffer.subarray(this._bytesRead, this._bytesRead + length);

    this._bytesRead += length;

    return bytes;
  }
  /**
   * Read single short (uint16) value.
   */
  readShort() {
    const value = this.buffer.readUInt16LE(this._bytesRead);

    this._bytesRead += 2;

    return value;
  }
  /**
   * Read single integer (int32) value.
   */
  readInteger() {
    const value = this.buffer.readInt32LE(this._bytesRead);

    this._bytesRead += 4;

    return value;
  }
  /**
   * Read single long (int64) value.
   */
  readLong() {
    const value = this.buffer.readBigInt64LE(this._bytesRead);

    this._bytesRead += 8;

    return value;
  }
  /**
   * Read long (int64) in a form of date.
   */
  readDate() {
    // The number of .NET ticks in seconds at the unix epoch
    const epochTicks = 62135596800000;

    return new Date(Number(this.readLong() / BigInt(1e4)) - epochTicks);
  }
  /**
   * Read ULE128.
   */
  readULE128() {
    let val = 0;
    let shift = 0;
    let byte = 0;

    do {
      byte = this.readByte();
      val |= (byte & 0x7f) << shift;
      shift += 7;
    } while ((byte & 0x80) !== 0);

    return val;
  }
  /**
   * Read string.
   */
  readString() {
    // Length and string itself aren't present.
    if (this.readByte() !== 0x0b) {
      return '';
    }

    const length = this.readULE128();

    return length > 0 ? this.readBytes(length).toString() : '';
  }
}

/**
 * A decoder for beatmap events.
 */
class EventDecoder {
  /**
   * Decodes event line.
   * If line contains any beatmap events, then it is added to the beatmap.
   * Storyboard lines are added to the array and remain unchanged.
   * @param line Beatmap event line.
   * @param beatmap Beatmap to which the event data will be added.
   * @param sbLines Array for storing storyboard lines.
   * @param offset The offset to apply to all time values.
   */
  static handleLine(line, beatmap, sbLines, offset) {
    // EventType,startTime,eventParams
    const data = line.split(',').map((v, i) => i ? v.trim() : v);
    const eventType = this._getEventType(data[0]);

    switch (eventType) {
      case EventType.Background:
        beatmap.events.background = data[2].replace(/"/g, '');
        break;
      case EventType.Video:
        beatmap.events.videoOffset = Parsing.parseInt(data[1]);
        beatmap.events.video = data[2].replace(/"/g, '');
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
    if (input.startsWith(' ') || input.startsWith('_')) {
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
}

/**
 * A decoder for storyboard elements, compounds and commands.
 */
class StoryboardDataDecoder {
  /**
   * Decodes a storyboard line to get an element.
   * @param line Storyboard line.
   * @returns A new storyboard element.
   */
  static handleElement(line) {
    const data = line.split(',');
    let eventType = parseInt(data[0]);

    eventType = isFinite(eventType)
      ? eventType
      : EventType[data[0]];

    const index = eventType === EventType.Sample ? 2 : 1;
    let layerType = parseInt(data[index]);

    layerType = isFinite(layerType)
      ? layerType
      : LayerType[data[index]];

    switch (eventType) {
      case EventType.Sprite: {
        const element = new StoryboardSprite();

        element.layer = layerType;
        element.filePath = data[3].replace(/"/g, '');
        element.startX = Parsing.parseInt(data[4]);
        element.startY = Parsing.parseInt(data[5]);
        element.origin = parseInt(data[2]);
        element.origin = isFinite(element.origin)
          ? element.origin
          : Origins[data[2]];

        return element;
      }
      case EventType.Animation: {
        const element = new StoryboardAnimation();

        element.layer = layerType;
        element.origin = parseInt(data[2]);
        element.origin = isFinite(element.origin)
          ? element.origin
          : Origins[data[2]];

        element.filePath = data[3].replace(/"/g, '');
        element.startX = Parsing.parseInt(data[4]);
        element.startY = Parsing.parseInt(data[5]);
        element.frames = Parsing.parseInt(data[6]);
        element.frameDelay = Parsing.parseInt(data[7]);
        element.loop = parseInt(data[8]);
        element.loop = isFinite(element.loop)
          ? element.loop
          : LoopType[data[8]];

        return element;
      }
      case EventType.Sample: {
        const element = new StoryboardSample();

        element.layer = layerType;
        element.startTime = Parsing.parseInt(data[1]);
        element.filePath = data[3].replace(/"/g, '');
        element.volume = data.length > 4 ? Parsing.parseInt(data[4]) : 100;

        return element;
      }
    }

    // If storyboard element type is unknown.
    return new StoryboardSprite();
  }
  /**
   * Decodes a storyboard line to get a command loop.
   * @param line Storyboard line.
   * @returns A new command loop.
   */
  static handleLoop(line) {
    const data = line.split(',');
    const loop = new CommandLoop();

    loop.loopStartTime = Parsing.parseInt(data[1]);
    loop.loopCount = Parsing.parseInt(data[2]);

    return loop;
  }
  /**
   * Decodes a storyboard line to get a command trigger.
   * @param line Storyboard line.
   * @returns A new command trigger.
   */
  static handleTrigger(line) {
    const data = line.split(',');
    const trigger = new CommandTrigger();

    trigger.triggerName = data[1];
    trigger.startTime = Parsing.parseInt(data[2]) || 0;
    trigger.endTime = Parsing.parseInt(data[3]) || 0;
    trigger.groupNumber = Parsing.parseInt(data[4]) || 0;

    return trigger;
  }
  /**
   * Decodes a storyboard line to get a command.
   * @param line Storyboard line.
   * @returns A new command.
   */
  static handleCommand(line) {
    const data = line.split(',');
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
  /**
   * Creates a new parameter commands from command data.
   * @param line Command data.
   * @returns A new parameter command.
   */
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
}

/**
 * A decoder for storyboard variables.
 */
class VariableDecoder {
  /**
   * Decodes all variables from storyboard lines.
   * @param lines Storyboard lines.
   * @returns Storyboard variables.
   */
  static getVariables(lines) {
    const variables = {};
    const startIndex = lines.findIndex((l) => l.includes('[Variables]'));

    // If file contains variables.
    if (startIndex !== -1) {
      let endIndex = startIndex + 1;

      // Parse all lines until a new section is encountered.
      while (endIndex < lines.length && !lines[endIndex].startsWith('[')) {
        // All variables start with $ sign.
        if (lines[endIndex].startsWith('$')) {
          const pair = lines[endIndex].substring(1).split('=');

          // If this variable is valid.
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
  /**
   * Replaces all variable names in storyboard line with variable values.
   * @param line Storyboard line.
   * @param variables Storyboard variables.
   * @returns
   */
  static preProcess(line, variables) {
    const keys = Object.keys(variables);

    if (!line.includes('$') || !keys.length) {
      return line;
    }

    keys.forEach((key) => {
      line = line.replace('$' + key, variables[key]);
    });

    return line;
  }
}

/**
 * Storyboard decoder.
 */
class StoryboardDecoder {
  constructor() {
    /**
     * Current storyboard element.
     */
    this._element = null;
    /**
     * Current storyboard compound.
     */
    this._compound = null;
    /**
     * Current storyboard command.
     */
    this._command = null;
    /**
     * Current storyboard lines.
     */
    this._lines = null;
  }
  /**
   * Performs storyboard decoding from a string.
   * @param str String with storyboard data.
   * @returns Decoded storyboard.
   */
  decodeFromString(str) {
    const data = str.toString()
      .replace(/\r/g, '')
      .split('\n');

    return this.decodeFromLines(data);
  }
  /**
   * Performs storyboard decoding from a string array.
   * @param data Array of split lines.
   * @returns Decoded storyboard.
   */
  decodeFromLines(data) {
    const storyboard = new Storyboard();

    this._lines = null;

    if (data.constructor === Array) {
      this._lines = data.map((l) => l.toString().trimEnd());
    }

    if (!this._lines || !this._lines.length) {
      throw new Error('Storyboard data not found!');
    }

    this._element = null;
    this._compound = null;
    this._command = null;
    // Get all variables before processing.
    storyboard.variables = VariableDecoder.getVariables(this._lines);
    // Parse storyboard lines.
    this._lines.forEach((line) => this._parseLine(line, storyboard));

    return storyboard;
  }
  _parseLine(line, storyboard) {
    // Skip empty lines and comments.
    if (!line || line.startsWith('//')) {
      return;
    }

    // .osb file section
    if (line.startsWith('[') && line.endsWith(']')) {
      return;
    }

    // Preprocess variables in the current line.
    line = VariableDecoder.preProcess(line, storyboard.variables);

    let depth = 0;

    while (line.startsWith(' ') || line.startsWith('_')) {
      line = line.substring(1);
      ++depth;
    }

    try {
      // Storyboard data.
      this._parseStoryboardData(line, storyboard, depth);
    }
    catch {
      return;
    }
  }
  _parseStoryboardData(line, storyboard, depth) {
    switch (depth) {
      // Storyboard element
      case 0: return this._parseDepth0(line, storyboard);
        // Storyboard element command
      case 1: return this._parseDepth1(line);
        // Storyboard element compounded command
      case 2: return this._parseDepth2(line);
    }
  }
  _parseDepth0(line, storyboard) {
    this._element = StoryboardDataDecoder.handleElement(line);

    // Force push Samples to their own layer.
    if (this._element instanceof StoryboardSample) {
      storyboard.getLayer(LayerType.Samples).push(this._element);

      return;
    }

    storyboard.getLayer(this._element.layer).push(this._element);
  }
  _parseDepth1(line) {
    // Compound command or default command
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
}

/**
 * Beatmap decoder without fs functions
 */
class BeatmapDecoder {
  constructor() {
    /**
     * Current section name.
     */
    this._sectionName = '';
    /**
     * Current offset for all time values.
     */
    this._offset = 0;
    /**
     * Current beatmap lines.
     */
    this._lines = null;
    /**
     * Current storyboard lines.
     */
    this._sbLines = null;
  }
  /**
   * Performs beatmap decoding from a string.
   * @param str String with beatmap data.
   * @param parseSb Should a storyboard be parsed?
   * @returns Decoded beatmap.
   */
  decodeFromString(str, parseSb = true) {
    const data = str.toString()
      .replace(/\r/g, '')
      .split('\n');

    return this.decodeFromLines(data, parseSb);
  }
  /**
   * Performs beatmap decoding from a string array.
   * @param data Array of split lines.
   * @param parseSb Should a storyboard be parsed?
   * @returns Decoded beatmap.
   */
  decodeFromLines(data, parseSb = true) {
    const beatmap = new Beatmap();

    this._lines = null;
    this._sbLines = null;

    // This array isn't needed if we don't parse a storyboard. 
    if (parseSb) {
      this._sbLines = [];
    }

    if (data.constructor === Array) {
      this._lines = data.filter((l) => typeof l === 'string');
    }

    if (!this._lines || !this._lines.length) {
      throw new Error('Beatmap data not found!');
    }

    /**
     * There is one known case of .osu file starting with "\uFEFF" symbol
     * We need to use trim function to handle it.
     * Beatmap: https://osu.ppy.sh/beatmapsets/310499#osu/771496
     */
    const fileFormatLine = this._lines[0].toString().trim();

    if (!fileFormatLine.startsWith('osu file format v')) {
      throw new Error('Not a valid beatmap!');
    }

    this._offset = 0;
    this._sectionName = '';
    // Parse beatmap lines.
    this._lines.forEach((line) => this._parseLine(line, beatmap));
    // Flush last control point group.
    TimingPointDecoder.flushPendingPoints();
    // Apply default values to the all hit objects.
    beatmap.hitObjects.forEach((h) => {
      h.applyDefaults(beatmap.controlPoints, beatmap.difficulty);
    });

    // Use stable sorting to keep objects in the right order.
    beatmap.hitObjects.sort((a, b) => a.startTime - b.startTime);

    // Storyboard
    if (parseSb && this._sbLines && this._sbLines.length) {
      const storyboardDecoder = new StoryboardDecoder();

      beatmap.events.storyboard = storyboardDecoder.decodeFromLines(this._sbLines);
    }

    return beatmap;
  }
  _parseLine(line, beatmap) {
    // Skip empty lines and comments.
    if (!line || line.startsWith('//')) {
      return;
    }

    // .osu file version
    if (line.includes('osu file format v')) {
      beatmap.fileFormat = Parsing.parseInt(line.split('v')[1]);
      /**
       * Beatmaps of version 4 and lower had an incorrect offset
       * (stable has this set as 24ms off).
       */
      this._offset = beatmap.fileFormat <= 4 ? 24 : 0;

      return;
    }

    // .osu file section
    if (line.startsWith('[') && line.endsWith(']')) {
      this._sectionName = line.slice(1, -1);

      return;
    }

    try {
      // Section data
      this._parseSectionData(line, beatmap);
    }
    catch {
      return;
    }
  }
  _parseSectionData(line, beatmap) {
    switch (this._sectionName) {
      case 'General':
        GeneralDecoder.handleLine(line, beatmap, this._offset);
        break;
      case 'Editor':
        EditorDecoder.handleLine(line, beatmap);
        break;
      case 'Metadata':
        MetadataDecoder.handleLine(line, beatmap);
        break;
      case 'Difficulty':
        DifficultyDecoder.handleLine(line, beatmap);
        break;
      case 'Colours':
        ColourDecoder.handleLine(line, beatmap);
        break;
      case 'Events':
        EventDecoder.handleLine(line, beatmap, this._sbLines, this._offset);
        break;
      case 'TimingPoints':
        TimingPointDecoder.handleLine(line, beatmap, this._offset);
        break;
      case 'HitObjects':
        HitObjectDecoder.handleLine(line, beatmap, this._offset);
    }
  }
}

/**
 * Score decoder.
 */
class ScoreDecoder {
  /**
   * Performs score decoding from a buffer.
   * @param buffer Buffer with score data.
   * @param parseReplay Should replay be parsed?
   * @returns Decoded score.
   */
  async decodeFromBuffer(buffer, parseReplay = true) {
    const reader = new SerializationReader(buffer);
    const scoreInfo = new ScoreInfo();

    scoreInfo.rulesetId = reader.readByte();

    const gameVersion = reader.readInteger();

    scoreInfo.beatmapHashMD5 = reader.readString();
    scoreInfo.username = reader.readString();
    reader.readString();
    scoreInfo.count300 = reader.readShort();
    scoreInfo.count100 = reader.readShort();
    scoreInfo.count50 = reader.readShort();
    scoreInfo.countGeki = reader.readShort();
    scoreInfo.countKatu = reader.readShort();
    scoreInfo.countMiss = reader.readShort();
    scoreInfo.totalScore = reader.readInteger();
    scoreInfo.maxCombo = reader.readShort();
    scoreInfo.perfect = !!reader.readByte();
    scoreInfo.rawMods = reader.readInteger();
    /**
     * Life frames (HP graph).
     */
    reader.readString();
    scoreInfo.date = reader.readDate();
    reader.readInteger();

    let replay = null;

    /*
     * if (parseReplay && replayLength > 0) {
     *   replay = new Replay();
     *   const compressedBytes = reader.readBytes(replayLength);
     *   const replayData = await ReplayDecoder.decompressReplayFrames(compressedBytes);
     *   replay.mode = scoreInfo.rulesetId;
     *   replay.gameVersion = gameVersion;
     *   replay.hashMD5 = replayHashMD5;
     *   replay.frames = ReplayDecoder.decodeReplayFrames(replayData);
     *   replay.lifeBar = ReplayDecoder.decodeLifeBar(lifeData);
     * }
     */
    scoreInfo.id = this._parseScoreId(gameVersion, reader);

    return new Score(scoreInfo, replay);
  }
  _parseScoreId(version, reader) {
    if (version >= 20140721) {
      return Number(reader.readLong());
    }

    if (version >= 20121008) {
      return reader.readInteger();
    }

    return 0;
  }
}

/**
 * An encoder for beatmap colours.
 */
class ColourEncoder {
  /**
   * Encodes all beatmap colours.
   * @param beatmap A beatmap.
   * @returns A single string with encoded beatmap colours.
   */
  static encodeColours(beatmap) {
    const colours = beatmap.colours;

    // Skip this section if empty.
    if (Object.keys(colours).length === 1 && !colours.comboColours.length) {
      return '';
    }

    const encoded = ['[Colours]'];

    colours.comboColours.forEach((colour, i) => {
      encoded.push(`Combo${i + 1}:${colour}`);
    });

    if (colours.sliderTrackColor) {
      encoded.push(`SliderTrackOverride:${colours.sliderTrackColor}`);
    }

    if (colours.sliderBorderColor) {
      encoded.push(`SliderBorder:${colours.sliderBorderColor}`);
    }

    return encoded.join('\n');
  }
}

/**
 * An encoder for beatmap difficulty.
 */
class DifficultyEncoder {
  /**
   * Encodes the beatmap difficulty.
   * @param beatmap A beatmap.
   * @returns Encoded beatmap difficulty.
   */
  static encodeDifficultySection(beatmap) {
    const encoded = ['[Difficulty]'];
    const difficulty = beatmap.difficulty;

    encoded.push(`HPDrainRate:${difficulty.drainRate}`);
    encoded.push(`CircleSize:${difficulty.circleSize}`);
    encoded.push(`OverallDifficulty:${difficulty.overallDifficulty}`);
    encoded.push(`ApproachRate:${difficulty.approachRate}`);
    encoded.push(`SliderMultiplier:${difficulty.sliderMultiplier}`);
    encoded.push(`SliderTickRate:${difficulty.sliderTickRate}`);

    return encoded.join('\n');
  }
}

/**
 * An encoder for beatmap editor settings.
 */
class EditorEncoder {
  /**
   * Encodes beatmap editor section.
   * @param beatmap A beatmap.
   * @returns Encoded beatmap editor section.
   */
  static encodeEditorSection(beatmap) {
    const encoded = ['[Editor]'];
    const editor = beatmap.editor;

    encoded.push(`Bookmarks:${editor.bookmarks.join(',')}`);
    encoded.push(`DistanceSpacing:${editor.distanceSpacing}`);
    encoded.push(`BeatDivisor:${editor.beatDivisor}`);
    encoded.push(`GridSize:${editor.gridSize}`);
    encoded.push(`TimelineZoom:${editor.timelineZoom}`);

    return encoded.join('\n');
  }
}

/**
 * An encoder for beatmap general info.
 */
class GeneralEncoder {
  /**
   * Encodes beatmap general section.
   * @param beatmap A beatmap.
   * @returns Encoded beatmap general section.
   */
  static encodeGeneralSection(beatmap) {
    const encoded = ['[General]'];
    const general = beatmap.general;

    encoded.push(`AudioFilename:${general.audioFilename}`);
    encoded.push(`AudioLeadIn:${general.audioLeadIn}`);

    if (general.audioHash) {
      encoded.push(`AudioHash:${general.audioHash}`);
    }

    encoded.push(`PreviewTime:${general.previewTime}`);
    encoded.push(`Countdown:${general.countdown}`);
    encoded.push(`SampleSet:${SampleSet[general.sampleSet]}`);
    encoded.push(`StackLeniency:${general.stackLeniency}`);
    encoded.push(`Mode:${beatmap.mode}`);
    encoded.push(`LetterboxInBreaks:${+general.letterboxInBreaks}`);

    if (general.storyFireInFront) {
      encoded.push(`StoryFireInFront:${+general.storyFireInFront}`);
    }

    encoded.push(`UseSkinSprites:${+general.useSkinSprites}`);

    if (general.alwaysShowPlayfield) {
      encoded.push(`AlwaysShowPlayfield:${+general.alwaysShowPlayfield}`);
    }

    encoded.push(`OverlayPosition:${general.overlayPosition}`);
    encoded.push(`SkinPreference:${general.skinPreference}`);
    encoded.push(`EpilepsyWarning:${+general.epilepsyWarning}`);
    encoded.push(`CountdownOffset:${general.countdownOffset}`);
    encoded.push(`SpecialStyle:${+general.specialStyle}`);
    encoded.push(`WidescreenStoryboard:${+general.widescreenStoryboard}`);
    encoded.push(`SamplesMatchPlaybackRate:${+general.samplesMatchPlaybackRate}`);

    return encoded.join('\n');
  }
}

/**
 * An encoder for beatmap hit objects.
 */
class HitObjectEncoder {
  /**
   * Encodes all beatmap hit objects.
   * @param beatmap A beatmap.
   * @returns A single string with encoded beatmap hit objects.
   */
  static encodeHitObjects(beatmap) {
    // x,y,time,type,hitSound,objectParams,hitSample
    const encoded = ['[HitObjects]'];
    const difficulty = beatmap.difficulty;
    const hitObjects = beatmap.hitObjects;

    hitObjects.forEach((hitObject) => {
      const general = [];
      const position = hitObject.startPosition;
      /**
       * Try to get hit object position if possible.
       * Otherwise, it will be replaced with default position (256, 192).
       */
      const startPosition = new Vector2(position ? position.x : 256, position ? position.y : 192);

      if (beatmap.mode === 3) {
        const totalColumns = Math.trunc(Math.max(1, difficulty.circleSize));
        const multiplier = Math.round(512 / totalColumns * 100000) / 100000;
        const column = hitObject.startX;

        startPosition.x = Math.ceil(column * multiplier) + Math.trunc(multiplier / 2);
      }

      general.push(startPosition.toString());
      general.push(hitObject.startTime.toString());
      general.push(hitObject.hitType.toString());
      general.push(hitObject.hitSound.toString());

      const extras = [];

      if (hitObject.hitType & HitType.Slider) {
        const slider = hitObject;

        extras.push(HitObjectEncoder.encodePathData(slider, startPosition));
      }
      else if (hitObject.hitType & HitType.Spinner) {
        const spinner = hitObject;

        extras.push(HitObjectEncoder.encodeEndTimeData(spinner));
      }
      else if (hitObject.hitType & HitType.Hold) {
        const hold = hitObject;

        extras.push(HitObjectEncoder.encodeEndTimeData(hold));
      }

      // normalSet:additionSet:index:volume:filename
      const set = [];
      const normal = hitObject.samples.find((s) => s.hitSound === HitSound[HitSound.Normal]);
      const addition = hitObject.samples.find((s) => s.hitSound !== HitSound[HitSound.Normal]);
      let normalSet = SampleSet.None;
      let additionSet = SampleSet.None;

      if (normal) {
        normalSet = SampleSet[normal.sampleSet];
      }

      if (addition) {
        additionSet = SampleSet[addition.sampleSet];
      }

      set[0] = normalSet.toString();
      set[1] = additionSet.toString();
      set[2] = hitObject.samples[0].customIndex.toString();
      set[3] = hitObject.samples[0].volume.toString();
      set[4] = hitObject.samples[0].filename;
      extras.push(set.join(':'));

      const generalLine = general.join(',');
      const extrasLine = hitObject.hitType & HitType.Hold ? extras.join(':') : extras.join(',');

      encoded.push([generalLine, extrasLine].join(','));
    });

    return encoded.join('\n');
  }
  static encodePathData(slider, offset) {
    // curveType|curvePoints,slides,length,edgeSounds,edgeSets
    const path = [];
    let lastType;

    slider.path.controlPoints.forEach((point, i) => {
      if (point.type !== null) {
        /**
         * We've reached a new (explicit) segment!
         *
         * Explicit segments have a new format in which the type is injected
         * into the middle of the control point string.
         * To preserve compatibility with osu-stable as much as possible,
         * explicit segments with the same type are converted
         * to use implicit segments by duplicating the control point.
         * One exception are consecutive perfect curves, which aren't supported
         * in osu!stable and can lead to decoding issues if encoded as implicit segments
         */
        let needsExplicitSegment = point.type !== lastType
                    || point.type === PathType.PerfectCurve;

        /**
         * Another exception to this is when the last two control points
         * of the last segment were duplicated. This is not a scenario supported by osu!stable.
         * Lazer does not add implicit segments for the last two control points
         * of any explicit segment, so an explicit segment is forced
         * in order to maintain consistency with the decoder.
         */
        if (i > 1) {
          // We need to use the absolute control point position to determine equality, otherwise floating point issues may arise.
          const p1 = offset.add(slider.path.controlPoints[i - 1].position);
          const p2 = offset.add(slider.path.controlPoints[i - 2].position);

          if (~~p1.x === ~~p2.x && ~~p1.y === ~~p2.y) {
            needsExplicitSegment = true;
          }
        }

        if (needsExplicitSegment) {
          path.push(slider.path.curveType);
          lastType = point.type;
        }
        else {
          // New segment with the same type - duplicate the control point
          path.push(`${offset.x + point.position.x}:${offset.y + point.position.y}`);
        }
      }

      if (i !== 0) {
        path.push(`${offset.x + point.position.x}:${offset.y + point.position.y}`);
      }
    });

    const data = [];

    data.push(path.join('|'));
    /**
     * osu!stable treated the first span of the slider as a repeat,
     * but no repeats are happening.
     */
    data.push((slider.repeats + 1).toString());
    data.push(slider.distance.toString());

    const adds = [];
    const sets = [];

    slider.nodeSamples.forEach((node, nodeIndex) => {
      adds[nodeIndex] = HitSound.None;
      sets[nodeIndex] = [SampleSet.None, SampleSet.None];
      node.forEach((sample, sampleIndex) => {
        if (sampleIndex === 0) {
          sets[nodeIndex][0] = SampleSet[sample.sampleSet];
        }
        else {
          adds[nodeIndex] |= HitSound[sample.hitSound];
          sets[nodeIndex][1] = SampleSet[sample.sampleSet];
        }
      });
    });

    data.push(adds.join('|'));
    data.push(sets.map((set) => set.join(':')).join('|'));

    return data.join(',');
  }
  static encodeEndTimeData(hitObject) {
    // endTime
    return hitObject.endTime.toString();
  }
}

/**
 * An encoder for beatmap metadata section.
 */
class MetadataEncoder {
  /**
   * Encodes beatmap metadata section.
   * @param beatmap A beatmap.
   * @returns Encoded beatmap metadata section.
   */
  static encodeMetadataSection(beatmap) {
    const encoded = ['[Metadata]'];
    const metadata = beatmap.metadata;

    encoded.push(`Title:${metadata.title}`);
    encoded.push(`TitleUnicode:${metadata.titleUnicode}`);
    encoded.push(`Artist:${metadata.artist}`);
    encoded.push(`ArtistUnicode:${metadata.artistUnicode}`);
    encoded.push(`Creator:${metadata.creator}`);
    encoded.push(`Version:${metadata.version}`);
    encoded.push(`Source:${metadata.source}`);
    encoded.push(`Tags:${metadata.tags.join(' ')}`);
    encoded.push(`BeatmapID:${metadata.beatmapId}`);
    encoded.push(`BeatmapSetID:${metadata.beatmapSetId}`);

    return encoded.join('\n');
  }
}

/**
 * An encoder for beatmap control points.
 */
class TimingPointEncoder {
  /**
   * Encodes all beatmap control points.
   * @param beatmap A beatmap.
   * @returns A single string with encoded control points.
   */
  static encodeControlPoints(beatmap) {
    // Time,beatLength,meter,sampleSet,sampleIndex,volume,uninherited,effects
    const encoded = ['[TimingPoints]'];

    beatmap.controlPoints.groups.forEach((group) => {
      const points = group.controlPoints;
      const timing = points.find((c) => c.beatLength);

      if (timing) {
        encoded.push(TimingPointEncoder.encodeGroup(group, true));
      }

      encoded.push(TimingPointEncoder.encodeGroup(group));
    });

    return encoded.join('\n');
  }
  /**
   * Encodes control point group using only unique control points.
   * @param group A group of control points
   * @param useTiming Should we use a timing point in this group?
   * @returns Encoded group of control points.
   */
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
      const kiai = effectPoint.kiai
        ? EffectType.Kiai
        : EffectType.None;
      const omitFirstBarLine = effectPoint.omitFirstBarLine
        ? EffectType.OmitFirstBarLine
        : EffectType.None;

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
      effects,
    ].join(',');
  }
  /**
   * Updates actual control points.
   * @param group A group of control points.
   * @returns The most actual control points.
   */
  static updateActualPoints(group) {
    let timingPoint = null;

    group.controlPoints.forEach((point) => {
      if (point.pointType === ControlPointType.DifficultyPoint
                && !point.isRedundant(TimingPointEncoder.lastDifficultyPoint)) {
        TimingPointEncoder.lastDifficultyPoint = point;
      }

      if (point.pointType === ControlPointType.EffectPoint
                && !point.isRedundant(TimingPointEncoder.lastEffectPoint)) {
        TimingPointEncoder.lastEffectPoint = point;
      }

      if (point.pointType === ControlPointType.SamplePoint
                && !point.isRedundant(TimingPointEncoder.lastSamplePoint)) {
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
      samplePoint: TimingPointEncoder.lastSamplePoint,
    };
  }
}
/**
 * The last saved difficulty point.
 */
TimingPointEncoder.lastDifficultyPoint = null;
/**
 * The last saved effect point.
 */
TimingPointEncoder.lastEffectPoint = null;
/**
 * The last saved sample point.
 */
TimingPointEncoder.lastSamplePoint = null;

class SerializationWriter {
  constructor(buffer) {
    /**
     * Number of written bytes.
     */
    this._bytesWritten = 0;
    this.buffer = buffer;
  }
  get bytesWritten() {
    return this._bytesWritten;
  }
  writeByte(value) {
    this._bytesWritten = this.buffer.writeUint8(value, this._bytesWritten);

    return this._bytesWritten;
  }
  writeBytes(value) {
    this.buffer = Buffer.concat([this.buffer, value]);
    this._bytesWritten += value.byteLength;

    return this._bytesWritten;
  }
  writeShort(value) {
    this._bytesWritten = this.buffer.writeUInt16LE(value, this._bytesWritten);

    return this._bytesWritten;
  }
  writeInteger(value) {
    this._bytesWritten = this.buffer.writeInt32LE(value, this._bytesWritten);

    return this._bytesWritten;
  }
  writeLong(value) {
    this._bytesWritten = this.buffer.writeBigInt64LE(value, this._bytesWritten);

    return this._bytesWritten;
  }
  writeDate(date) {
    // The number of .NET ticks in seconds at the unix epoch
    const epochTicks = BigInt(62135596800000);
    // The number of seconds in ticks.
    const ticks = BigInt(date.getTime()) * BigInt(1e4);

    this._bytesWritten = this.writeLong(ticks + epochTicks);

    return this._bytesWritten;
  }
  writeString(value) {
    for (let i = 0; i < value.length; ++i) {
      this._bytesWritten = this.writeByte(value.charCodeAt(i));
    }

    this._bytesWritten = this.writeByte(0);

    return this._bytesWritten;
  }
}

/**
 * An encoder for beatmap events & storyboard.
 */
class EventsEncoder {
  /**
   * Encodes a beatmap's event section
   * @param beatmap A beatmap.
   * @returns A single string with encoded events.
   */
  static encodeEventsSection(beatmap) {
    const encoded = [];
    const events = beatmap.events;
    const storyboard = events.storyboard;

    encoded.push('[Events]');
    encoded.push('//Background and Video events');

    if (events.background) {
      encoded.push(`0,0,"${events.background}",0,0`);
    }

    if (events.video) {
      encoded.push(`Video,${events.videoOffset},"${events.video}"`);
    }

    encoded.push('//Break Periods');

    if (events.breaks && events.breaks.length > 0) {
      events.breaks.forEach((b) => {
        encoded.push(`2,${b.startTime},${b.endTime}`);
      });
    }

    encoded.push('//Storyboard Layer 0 (Background)');

    if (storyboard && storyboard.background.length > 0) {
      encoded.push(EventsEncoder.encodeStoryboardLayer(storyboard.background));
    }

    encoded.push('//Storyboard Layer 1 (Fail)');

    if (storyboard && storyboard.fail.length > 0) {
      encoded.push(EventsEncoder.encodeStoryboardLayer(storyboard.fail));
    }

    encoded.push('//Storyboard Layer 2 (Pass)');

    if (storyboard && storyboard.pass.length > 0) {
      encoded.push(EventsEncoder.encodeStoryboardLayer(storyboard.pass));
    }

    encoded.push('//Storyboard Layer 3 (Foreground)');

    if (storyboard && storyboard.foreground.length > 0) {
      encoded.push(EventsEncoder.encodeStoryboardLayer(storyboard.foreground));
    }

    encoded.push('//Storyboard Layer 4 (Overlay)');

    if (storyboard && storyboard.overlay.length > 0) {
      encoded.push(EventsEncoder.encodeStoryboardLayer(storyboard.overlay));
    }

    encoded.push('//Storyboard Sound Samples');

    if (storyboard && storyboard.samples.length > 0) {
      encoded.push(EventsEncoder.encodeStoryboardLayer(storyboard.samples));
    }

    return encoded.join('\n');
  }
  /**
   * Encodes a storyboard
   * @param storyboard A storyboard.
   * @returns Encoded storyboard.
   */
  static encodeStoryboard(storyboard) {
    const encoded = [];

    encoded.push('[Events]');
    encoded.push('//Background and Video events');
    encoded.push('//Storyboard Layer 0 (Background)');

    if (storyboard.background.length > 0) {
      encoded.push(EventsEncoder.encodeStoryboardLayer(storyboard.background));
    }

    encoded.push('//Storyboard Layer 1 (Fail)');

    if (storyboard.fail.length > 0) {
      encoded.push(EventsEncoder.encodeStoryboardLayer(storyboard.fail));
    }

    encoded.push('//Storyboard Layer 2 (Pass)');

    if (storyboard.pass.length > 0) {
      encoded.push(EventsEncoder.encodeStoryboardLayer(storyboard.pass));
    }

    encoded.push('//Storyboard Layer 3 (Foreground)');

    if (storyboard.foreground.length > 0) {
      encoded.push(EventsEncoder.encodeStoryboardLayer(storyboard.foreground));
    }

    encoded.push('//Storyboard Layer 4 (Overlay)');

    if (storyboard.overlay.length > 0) {
      encoded.push(EventsEncoder.encodeStoryboardLayer(storyboard.overlay));
    }

    encoded.push('//Storyboard Sound Samples');

    if (storyboard.samples.length > 0) {
      encoded.push(EventsEncoder.encodeStoryboardLayer(storyboard.samples));
    }

    const variables = Object.entries(storyboard.variables);

    for (let i = 0; i < encoded.length; ++i) {
      variables.forEach((pair) => encoded[i].replace(pair[1], pair[0]));
    }

    return encoded.join('\n');
  }
  /**
   * Encodes storyboard layer.
   * @param layer A storyboard layer.
   * @returns Encoded storyboard layer.
   */
  static encodeStoryboardLayer(layer) {
    const encoded = [];

    layer.forEach((element) => {
      encoded.push(EventsEncoder.encodeStoryboardElement(element));

      const elementWithCommands = element;

      if (!elementWithCommands.commands) {
        return;
      }

      elementWithCommands.loops.forEach((loop) => {
        encoded.push(EventsEncoder.encodeCompound(loop));
        loop.commands.forEach((command) => {
          encoded.push(EventsEncoder.encodeCommand(command, true));
        });
      });

      elementWithCommands.commands.forEach((command) => {
        encoded.push(EventsEncoder.encodeCommand(command));
      });

      elementWithCommands.triggers.forEach((trigger) => {
        encoded.push(EventsEncoder.encodeCompound(trigger));
        trigger.commands.forEach((command) => {
          encoded.push(EventsEncoder.encodeCommand(command, true));
        });
      });
    });

    return encoded.join('\n');
  }
  /**
   * Encodes storyboard element.
   * @param element A storyboard element.
   * @returns Encoded storyboard element.
   */
  static encodeStoryboardElement(element) {
    const encoded = [];

    if (element instanceof StoryboardSprite) {
      const sprite = element;

      encoded.push('Sprite');
      encoded.push(LayerType[sprite.layer]);
      encoded.push(Origins[sprite.origin]);
      encoded.push(`"${sprite.filePath}"`);
      encoded.push(`${sprite.startPosition}`);
    }
    else if (element instanceof StoryboardAnimation) {
      const animation = element;

      encoded.push('Animation');
      encoded.push(LayerType[animation.layer]);
      encoded.push(Origins[animation.origin]);
      encoded.push(`"${animation.filePath}"`);
      encoded.push(`${animation.startPosition}`);
      encoded.push(`${animation.frames}`);
      encoded.push(`${animation.frameDelay}`);
      encoded.push(`${animation.loop}`);
    }
    else if (element instanceof StoryboardSample) {
      const sample = element;

      encoded.push('Sample');
      encoded.push(`${sample.startTime}`);
      encoded.push(`${sample.layer}`);
      encoded.push(`'${sample.filePath}'`);
      encoded.push(`${sample.volume}`);
    }

    return encoded.join(',');
  }
  /**
   * Encodes storyboard compound.
   * @param compound A storyboard compound.
   * @returns Encoded storyboard compound.
   */
  static encodeCompound(compound) {
    const encoded = [];

    if (compound instanceof CommandLoop) {
      const loop = compound;

      encoded.push(`${compound.type}`);
      encoded.push(`${loop.startTime}`);
      encoded.push(`${loop.loopCount}`);
    }
    else if (compound instanceof CommandTrigger) {
      const trigger = compound;

      encoded.push(`${compound.type}`);
      encoded.push(`${trigger.triggerName}`);

      if (trigger.endTime !== 0) {
        encoded.push(`${trigger.startTime}`);
        encoded.push(`${trigger.endTime}`);
      }

      const group = trigger.groupNumber !== 0 ? -trigger.groupNumber : '';

      encoded[encoded.length - 1] += group;
    }

    return ' ' + encoded.join(',');
  }
  /**
   * Encodes storyboard command.
   * @param command A storyboard command.
   * @param nested Is it nested command?
   * @returns Encoded storyboard command.
   */
  static encodeCommand(command, nested = false) {
    const encoded = [];
    const indentation = nested ? '  ' : ' ';

    encoded.push(command.acronym);
    encoded.push(`${command.easing}`);
    encoded.push(`${command.startTime}`);

    const endTime = command.startTime !== command.endTime ? command.endTime : '';

    encoded.push(`${endTime}`);
    encoded.push(EventsEncoder.encodeCommandArguments(command));

    return indentation + encoded.join(',');
  }
  /**
   * Encodes all arguments of a command.
   * @param command A storyboard command.
   * @returns Encoded command arguments.
   */
  static encodeCommandArguments(command) {
    switch (command.type) {
      case CommandType.Scale:
      case CommandType.VectorScale: {
        const scale = command;

        if (scale.startScale.equals(scale.endScale)) {
          return scale.type === CommandType.Scale
            ? `${scale.startScale.x}`
            : `${scale.startScale}`;
        }

        return scale.type === CommandType.Scale
          ? `${scale.startScale.x},${scale.endScale.x}`
          : `${scale.startScale},${scale.endScale}`;
      }
      case CommandType.Movement:
      case CommandType.MovementX:
      case CommandType.MovementY: {
        const move = command;

        if (move.type === CommandType.Movement) {
          return !move.startPosition.equals(move.endPosition)
            ? `${move.startPosition},${move.endPosition}`
            : `${move.startPosition}`;
        }

        return (move.startX !== move.endX || move.startY !== move.endY)
          ? `${move.startX || move.startY},${move.endX || move.endY}`
          : `${move.startX || move.startY}`;
      }
      case CommandType.Fade: {
        const fade = command;

        return fade.startOpacity !== fade.endOpacity
          ? `${fade.startOpacity},${fade.endOpacity}`
          : `${fade.startOpacity}`;
      }
      case CommandType.Rotation: {
        const rotation = command;

        return rotation.startRotate !== rotation.endRotate
          ? `${rotation.startRotate},${rotation.endRotate}`
          : `${rotation.startRotate}`;
      }
      case CommandType.Colour: {
        const colour = command;

        return !colour.startColour.equals(colour.endColour)
          ? `${colour.startColour},${colour.endColour}`
          : `${colour.startColour}`;
      }
      case CommandType.Parameter: {
        const parameter = command;

        switch (parameter.parameter) {
          case ParameterType.HorizontalFlip:
            return 'H';
          case ParameterType.VerticalFlip:
            return 'V';
          case ParameterType.BlendingMode:
            return 'A';
        }
      }
    }

    return '';
  }
}

/**
 * An encoder for storyboard variables
 */
class VariablesEncoder {
  /**
   * Encodes all storyboard variables.
   * @param storyboard A storyboard.
   * @returns Encoded storyboard variables.
   */
  static encodeVariables(storyboard) {
    const encoded = [];
    const variables = Object.entries(storyboard.variables);

    if (variables.length > 0) {
      encoded.push('[Variables]');
      variables.forEach((pair) => {
        encoded.push(`${pair[0]}=${pair[1]}`);
      });
    }

    return encoded.join('\n');
  }
}

/**
 * Beatmap encoder.
 */
class BeatmapEncoder {
  /**
   * Performs beatmap encoding to a string.
   * @param beatmap Beatmap for encoding.
   * @returns A string with encoded beatmap data.
   */
  encodeToString(beatmap) {
    let _a;

    if (!(beatmap === null || beatmap === void 0 ? void 0 : beatmap.fileFormat)) {
      return '';
    }

    const encoded = [];

    encoded.push(`osu file format v${(_a = beatmap.fileFormat) !== null && _a !== void 0 ? _a : 0}`);
    encoded.push(GeneralEncoder.encodeGeneralSection(beatmap));
    encoded.push(EditorEncoder.encodeEditorSection(beatmap));
    encoded.push(MetadataEncoder.encodeMetadataSection(beatmap));
    encoded.push(DifficultyEncoder.encodeDifficultySection(beatmap));
    encoded.push(EventsEncoder.encodeEventsSection(beatmap));
    encoded.push(TimingPointEncoder.encodeControlPoints(beatmap));
    encoded.push(ColourEncoder.encodeColours(beatmap));
    encoded.push(HitObjectEncoder.encodeHitObjects(beatmap));

    return encoded.filter((x) => x).join('\n\n');
  }
}

/**
 * Storyboard encoder.
 */
class StoryboardEncoder {
  /**
   * Performs storyboard encoding to a string.
   * @param storyboard Storyboard for encoding.
   * @returns A string with encoded storyboard data.
   */
  encodeToString(storyboard) {
    if (!(storyboard instanceof Storyboard)) {
      return '';
    }

    const encoded = [];

    encoded.push(VariablesEncoder.encodeVariables(storyboard));
    encoded.push(EventsEncoder.encodeStoryboard(storyboard));

    return encoded.filter((x) => x).join('\n\n');
  }
}

/**
 * Score encoder.
 */
class ScoreEncoder {
  /**
   * Performs score encoding to a buffer.
   * @param score Score info for encoding.
   * @returns A buffer with encoded score & replay data.
   */
  async encodeToBuffer(score) {
    let _a, _b, _c, _d;
    const encoded = Buffer.from([]);

    if (typeof ((_a = score === null || score === void 0 ? void 0 : score.info) === null || _a === void 0 ? void 0 : _a.id) !== 'number') {
      return encoded;
    }

    const writer = new SerializationWriter(encoded);

    writer.writeByte(score.info.rulesetId);

    if (score.replay) {
      writer.writeInteger(score.replay.gameVersion);
    }

    writer.writeString((_b = score.info.beatmapHashMD5) !== null && _b !== void 0 ? _b : '');
    writer.writeString(score.info.username);

    if (score.replay) {
      writer.writeString(score.replay.hashMD5);
    }

    writer.writeShort(score.info.count300);
    writer.writeShort(score.info.count100);
    writer.writeShort(score.info.count50);
    writer.writeShort(score.info.countGeki);
    writer.writeShort(score.info.countKatu);
    writer.writeShort(score.info.countMiss);
    writer.writeInteger(score.info.totalScore);
    writer.writeShort(score.info.maxCombo);
    writer.writeByte(Number(score.info.perfect));
    writer.writeInteger((_d = (_c = score.info.mods) === null || _c === void 0 ? void 0 : _c.bitwise) !== null && _d !== void 0 ? _d : 0);
    /**
     * Life frames (HP graph). Not implemented.
     */
    writer.writeString('');
    writer.writeDate(score.info.date);
    writer.writeLong(BigInt(score.info.id));

    return encoded;
  }
}

export { BeatmapDecoder, BeatmapEncoder, HittableObject, HoldableObject, ScoreDecoder, ScoreEncoder, SlidableObject, SpinnableObject, StoryboardDecoder, StoryboardEncoder };
