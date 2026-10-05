import assert from 'node:assert/strict';
import { BODIES, TIMING } from '../js/config.js';
import { createTimeline, valuesAt } from '../js/timeline.js';

const baseline = createTimeline();
assert.equal(baseline.trackHeight, 1100);
assert.deepEqual(baseline.anchors, { start: 0, galaxie: 0.135, spotjar: 0.38, phaseparadise: 0.72, unerforscht: 0.985 });
for (const extraCount of [0, 1, 3, 10]) {
  const extras = Array.from({ length: extraCount }, (_, i) => ({ ...BODIES[0], id: `test-${i}` }));
  const bodies = [...BODIES.slice(0, -1), ...extras, BODIES.at(-1)];
  const timeline = createTimeline(bodies);
  assert.equal(timeline.stations.length, bodies.length);
  const stationWeight = TIMING.station.rise + TIMING.station.hold + TIMING.station.fall + TIMING.station.gap;
  assert.equal(timeline.totalWeight, baseline.totalWeight + extraCount * stationWeight);
  assert.equal(timeline.stations.at(-1).fall, null);
  for (const station of timeline.stations) {
    const atAnchor = valuesAt(timeline, timeline.anchors[station.id]).stations.find(value => value.id === station.id);
    assert.equal(atAnchor.focus, 1, `${station.id} is focused at its deep link`);
    assert.equal(atAnchor.panel, 1, `${station.id} has a readable panel at its deep link`);
  }
  // Whole gap intervals must be safe, not just the one sampled jump position.
  for (const gap of timeline.gaps) {
    assert.ok(gap.start < gap.anchor && gap.anchor < gap.end);
    for (let i = 0; i <= 20; i++) {
      const progress = gap.start + (gap.end - gap.start) * i / 20;
      const values = valuesAt(timeline, progress);
      assert.equal(values.hero, 0); assert.equal(values.prolog, 0);
      for (const station of values.stations) {
        assert.ok(station.focus < 1e-12, `${station.id}: focus visible in a gap`);
        assert.ok(station.panel < 1e-12, `${station.id}: panel visible in a gap`);
      }
    }
  }
  for (let i = 0; i <= 1000; i++) {
    const values = valuesAt(timeline, i / 1000);
    assert.ok(values.stations.filter(station => station.focus > 0).length <= 1, 'No overlapping landings');
  }
}
console.log('Timeline verified: original anchors, safe gap intervals, non-overlapping focus, 1/3/10 additional apps.');
