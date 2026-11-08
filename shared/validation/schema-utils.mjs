import fs from "node:fs";

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// Bounded JSON Schema vocabulary; unsupported constraints fail closed.
const supported = new Set(["$schema", "$id", "title", "description", "$comment", "default", "examples", "type", "required", "properties", "additionalProperties", "items", "minItems", "maxItems", "uniqueItems", "enum", "const", "minLength", "maxLength", "pattern", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "allOf", "anyOf", "oneOf", "not"]);
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const hasType = (value, type) => {
  if (type === "null") return value === null;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === type;
};

export function validateRequiredShape(value, schema, path = "$") {
  if (schema === true) return [];
  if (schema === false) return [`${path} is prohibited by the schema`];
  const errors = [];
  for (const key of Object.keys(schema)) if (!supported.has(key)) errors.push(`${path}: unsupported schema keyword ${key}`);
  if (schema.type && ![schema.type].flat().some((type) => hasType(value, type))) return [...errors, `${path} must be ${[schema.type].flat().join(" or ")}`];
  if (schema.enum && !schema.enum.some((candidate) => same(candidate, value))) errors.push(`${path} must be one of ${schema.enum.join(", ")}`);
  if (Object.hasOwn(schema, "const") && !same(schema.const, value)) errors.push(`${path} must equal ${JSON.stringify(schema.const)}`);
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required || []) if (!Object.hasOwn(value, key)) errors.push(`${path}.${key} is required`);
    for (const [key, child] of Object.entries(schema.properties || {})) if (Object.hasOwn(value, key)) errors.push(...validateRequiredShape(value[key], child, `${path}.${key}`));
    for (const key of Object.keys(value)) {
      if (Object.hasOwn(schema.properties || {}, key)) continue;
      if (schema.additionalProperties === false) errors.push(`${path}.${key} is not allowed`);
      else if (schema.additionalProperties && typeof schema.additionalProperties === "object") errors.push(...validateRequiredShape(value[key], schema.additionalProperties, `${path}.${key}`));
    }
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path} requires at least ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path} permits at most ${schema.maxItems} items`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push(`${path} requires unique items`);
    if (schema.items) value.forEach((item, index) => errors.push(...validateRequiredShape(item, schema.items, `${path}[${index}]`)));
  }
  if (typeof value === "string") {
    const length = [...value].length;
    if (schema.minLength !== undefined && length < schema.minLength) errors.push(`${path} requires at least ${schema.minLength} characters`);
    if (schema.maxLength !== undefined && length > schema.maxLength) errors.push(`${path} permits at most ${schema.maxLength} characters`);
    if (schema.pattern && !new RegExp(schema.pattern, "u").test(value)) errors.push(`${path} does not match ${schema.pattern}`);
  }
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path} must be at least ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path} must be at most ${schema.maximum}`);
    if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) errors.push(`${path} must exceed ${schema.exclusiveMinimum}`);
    if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) errors.push(`${path} must be below ${schema.exclusiveMaximum}`);
  }
  for (const child of schema.allOf || []) errors.push(...validateRequiredShape(value, child, path));
  for (const keyword of ["anyOf", "oneOf"]) {
    if (!schema[keyword]) continue;
    const matches = schema[keyword].filter((child) => validateRequiredShape(value, child, path).length === 0).length;
    if (keyword === "anyOf" ? matches === 0 : matches !== 1) errors.push(`${path} must match ${keyword === "anyOf" ? "at least one" : "exactly one"} ${keyword} schema`);
  }
  if (schema.not && validateRequiredShape(value, schema.not, path).length === 0) errors.push(`${path} matches a prohibited schema`);
  return errors;
}

export function validateJsonFile(dataFile, schemaFile) {
  return validateRequiredShape(readJson(dataFile), readJson(schemaFile));
}
