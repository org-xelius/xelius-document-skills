import test from "node:test";
import assert from "node:assert/strict";
import { validateRequiredShape } from "./schema-utils.mjs";

test("required object fields are enforced", () => {
  const schema = { type: "object", required: ["name"], properties: { name: { type: "string" } } };
  assert.deepEqual(validateRequiredShape({}, schema), ["$.name is required"]);
  assert.deepEqual(validateRequiredShape({ name: "ok" }, schema), []);
});

test("nested arrays are checked", () => {
  const schema = { type: "array", minItems: 1, items: { type: "object", required: ["id"], properties: { id: { type: "string" } } } };
  assert.equal(validateRequiredShape([], schema).length, 1);
  assert.equal(validateRequiredShape([{}], schema)[0], "$[0].id is required");
});
