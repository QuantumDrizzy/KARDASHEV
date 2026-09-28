import assert from "node:assert/strict";
import test from "node:test";
import { FACETS, LAYERS, itemsFor, layerStats } from "./research.ts";

test("six menu layers, no Scale dump", () => {
  assert.deepEqual([...LAYERS], ["Energy", "AI", "Biology", "Health", "Space", "Quantum"]);
});

for (const layer of LAYERS) {
  test(`${layer} has fields, discoveries, centers, works, media`, () => {
    const s = layerStats(layer);
    assert.ok(s.fields >= 3, `${layer} fields ${s.fields}`);
    assert.ok(s.discoveries >= 2, `${layer} discoveries ${s.discoveries}`);
    assert.ok(s.centers >= 4, `${layer} centers ${s.centers}`);
    assert.ok(s.works >= 3, `${layer} works ${s.works}`);
    assert.match(s.span, /^\d{4}–\d{4}$/);
    for (const facet of FACETS) {
      const items = itemsFor(layer, facet);
      assert.ok(items.length >= 2, `${layer} ${facet}`);
      for (const it of items) {
        assert.ok(it.media.src.startsWith("/media/"), it.key);
        assert.ok(it.datum.length > 0, it.key);
        assert.ok(it.title.length > 0, it.key);
        assert.ok(it.body.length > 20, it.key);
      }
    }
  });
}
