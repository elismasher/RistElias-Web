import { BODIES, TIMING } from './config.js';
import { ramp, ease } from './math.js';

// All positions are accumulated weights and normalized only once, at the end.
export function createTimeline(bodies = BODIES, timing = TIMING) {
  const hero = [timing.hero.fadeStart, timing.hero.weight];
  let cursor = timing.hero.weight + timing.prolog.lead;
  const prolog = [cursor, cursor + timing.prolog.fadeIn];
  cursor = prolog[1] + timing.prolog.hold;
  prolog.push(cursor, cursor + timing.prolog.fadeOut);
  cursor = prolog[3];
  const gaps = [{ start: cursor, end: cursor + timing.firstGap.weight,
    anchor: cursor + timing.firstGap.anchorOffset }];
  cursor = gaps[0].end;
  const anchors = { start: 0, galaxie: prolog[1] + timing.prolog.anchorInHold };
  const stations = bodies.map((body, index) => {
    const last = index === bodies.length - 1;
    const weights = { ...timing.station, ...(last ? timing.last : {}), ...body.timing };
    const rise = [cursor, cursor + weights.rise];
    const hold = [rise[1], rise[1] + weights.hold];
    const fall = last ? null : [hold[1], hold[1] + weights.fall];
    const panel = body.layout === 'center'
      ? [rise[1] - timing.outro.beforeRiseEnd, rise[1] - timing.outro.beforeRiseEnd + timing.outro.fadeIn]
      : [rise[1] + timing.panel.afterRise, rise[1] + timing.panel.afterRise + timing.panel.fadeIn,
        hold[1] - timing.panel.beforeFall - timing.panel.fadeOut, hold[1] - timing.panel.beforeFall];
    if (body.layout === 'center' && !last) {
      panel.push(hold[1] - timing.panel.beforeFall - timing.panel.fadeOut, hold[1] - timing.panel.beforeFall);
    }
    if (last && body.layout !== 'center') panel.splice(2); // A final side panel also stays to the end.
    anchors[body.id] = last ? hold[1] - timing.last.anchorFromEnd : hold[0] + weights.anchorOffset;
    cursor = last ? hold[1] : fall[1];
    if (!last) {
      const beforeLast = index === bodies.length - 2;
      gaps.push({ start: cursor, end: cursor + weights.gap,
        anchor: cursor + (beforeLast ? timing.lastGapAnchorOffset : weights.gap / 2) });
      cursor += weights.gap;
    }
    return { id: body.id, rise, hold, fall, panel };
  });
  const totalWeight = cursor;
  const normalize = values => values.map(value => value / totalWeight);
  const lastRise = stations.at(-1)?.rise[0] ?? totalWeight;
  return {
    totalWeight, trackHeight: totalWeight * timing.vhPerWeight,
    hero: normalize(hero), prolog: normalize(prolog),
    anchors: Object.fromEntries(Object.entries(anchors).map(([id, value]) => [id, value / totalWeight])),
    gaps: gaps.map(gap => Object.fromEntries(Object.entries(gap).map(([key, value]) => [key, value / totalWeight]))),
    stations: stations.map(station => ({ ...station, rise: normalize(station.rise),
      hold: normalize(station.hold), fall: station.fall && normalize(station.fall), panel: normalize(station.panel) })),
    camera: Object.fromEntries(Object.entries(timing.introCamera).map(([key, value]) => [key, normalize(value)])),
    beltWave: [normalize(timing.beltWave.beforeRise.map(offset => lastRise - offset)),
      normalize(timing.beltWave.afterRise.map(offset => lastRise + offset))],
  };
}
export function panelOpacity(p, ranges) {
  return ramp(p, ranges[0], ranges[1]) * (ranges.length > 2 ? 1 - ramp(p, ranges[2], ranges[3]) : 1);
}
export function valuesAt(timeline, progress) {
  return {
    hero: 1 - ramp(progress, ...timeline.hero),
    prolog: panelOpacity(progress, timeline.prolog),
    stations: timeline.stations.map(station => ({ id: station.id,
      focus: ease(ramp(progress, ...station.rise) * (station.fall ? 1 - ramp(progress, ...station.fall) : 1)),
      panel: panelOpacity(progress, station.panel) })),
    heroCamera: 1 - ease(ramp(progress, ...timeline.camera.hero)),
    prologCamera: ease(ramp(progress, ...timeline.camera.prologRise)) * (1 - ease(ramp(progress, ...timeline.camera.prologFall))),
    beltWave: ramp(progress, ...timeline.beltWave[0]) * (1 - ramp(progress, ...timeline.beltWave[1])),
  };
}
export function stationAt(timeline, progress) {
  if (progress < timeline.hero[1]) return 'start';
  for (let i = 0; i < timeline.gaps.length; i++) {
    if (progress < timeline.gaps[i].anchor) return i === 0 ? 'galaxie' : timeline.stations[i - 1].id;
  }
  return timeline.stations.at(-1)?.id ?? 'galaxie';
}
