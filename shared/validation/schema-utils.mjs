import fs from "node:fs";

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function validateRequiredShape(value, schema, path = "$") {
  const errors = [];
  if (schema.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [`${path} must be an object`];
    for (const key of schema.required || []) {
      if (!(key in value)) errors.push(`${path}.${key} is required`);
    }
    for (const [key, child] of Object.entries(schema.properties || {})) {
      if (key in value) errors.push(...validateRequiredShape(value[key], child, `${path}.${key}`));
    }
  } else if (schema.type === "array") {
    if (!Array.isArray(value)) return [`${path} must be an array`];
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path} requires at least ${schema.minItems} items`);
    value.forEach((item, index) => errors.push(...validateRequiredShape(item, schema.items || {}, `${path}[${index}]`)));
  } else if (Array.isArray(schema.type)) {
    const allowed = schema.type;
    const actual = value === null ? "null" : Array.isArray(value) ? "array" : Number.isInteger(value) ? "integer" : typeof value;
    if (!allowed.includes(actual)) errors.push(`${path} must be ${allowed.join(" or ")}`);
  } else if (schema.type === "integer") {
    if (!Number.isInteger(value)) errors.push(`${path} must be integer`);
  } else if (schema.type && typeof value !== schema.type) {
    errors.push(`${path} must be ${schema.type}`);
  }
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path} must be one of ${schema.enum.join(", ")}`);
  if (schema.const !== undefined && value !== schema.const) errors.push(`${path} must equal ${schema.const}`);
  if (typeof value === "string" && schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${path} requires at least ${schema.minLength} characters`);
  if (typeof value === "string" && schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${path} does not match ${schema.pattern}`);
  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum) errors.push(`${path} must be at least ${schema.minimum}`);
  return errors;
}

export function validateJsonFile(dataFile, schemaFile) {
  return validateRequiredShape(readJson(dataFile), readJson(schemaFile));
}
