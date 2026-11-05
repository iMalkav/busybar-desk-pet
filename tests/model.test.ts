import assert from "node:assert/strict";
import test from "node:test";
import schema from "../src/appmeta/settings.json" with { type: "json" };
import { AppModel } from "../src/model.ts";
import { schemaDefaults, type Settings } from "../src/lib.ts";
const NOW = 1700000000000;
const make = (values: Settings = {}, saved: Settings = {}, now = NOW) =>
  new AppModel({ ...schemaDefaults(schema.fields), ...values }, saved, now);

test("care persists and values remain bounded after a long absence", () => {
  const a = make();
  a.key("ok", 0, NOW);
  const b = make({}, a.save(), NOW + 30 * 86400000);
  assert.ok(b.hunger <= 100 && b.energy >= 0 && b.joy >= 0);
  assert.ok(b.save().last);
});
test("feeding and playing affect different needs", () => {
  const a = make();
  a.key("ok", 0, NOW);
  assert.equal(a.hunger, 0);
  a.key("wheel", 1, NOW);
  a.key("ok", 0, NOW);
  assert.equal(a.energy, 70);
  assert.equal(a.joy, 100);
});
