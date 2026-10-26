export interface JsonDiagnosticReport {
  isValid: boolean;
  wasSanitized: boolean;
  syntaxErrors: number;
  rfcStandard: string;
  totalKeys: number;
  nestingDepth: number;
  byteSize: number;
  errorMessage?: string;
}

/**
 * Deterministically sanitizes common broken JSON patterns:
 * - Markdown fences (```json ... ```)
 * - Single-line (//) and multi-line (/* *\/) comments
 * - Trailing commas before } or ]
 * - Unquoted keys ({ id: 123 })
 * - Single-quoted strings ('value')
 */
export function sanitizeBrokenJson(rawInput: string): {
  formattedJson: string;
  fixed: string;
  error?: string;
  parsedObject: unknown;
  diagnostics: JsonDiagnosticReport;
} {
  const byteSize = new TextEncoder().encode(rawInput || '').byteLength;
  const trimmed = (rawInput || '').trim();

  if (!trimmed) {
    return {
      formattedJson: '{}',
      fixed: '{}',
      error: 'Empty JSON input buffer',
      parsedObject: {},
      diagnostics: {
        isValid: false,
        wasSanitized: false,
        syntaxErrors: 1,
        rfcStandard: '8259',
        totalKeys: 0,
        nestingDepth: 0,
        byteSize: 0,
        errorMessage: 'Empty JSON input buffer',
      },
    };
  }

  // First try strict JSON.parse
  try {
    const strictParsed = JSON.parse(trimmed);
    const stats = measureObjectTree(strictParsed);
    const formatted = JSON.stringify(strictParsed, null, 2);
    return {
      formattedJson: formatted,
      fixed: formatted,
      parsedObject: strictParsed,
      diagnostics: {
        isValid: true,
        wasSanitized: false,
        syntaxErrors: 0,
        rfcStandard: '8259',
        totalKeys: stats.totalKeys,
        nestingDepth: stats.maxDepth,
        byteSize,
      },
    };
  } catch {
    // Proceed to deterministic repair pipeline
  }

  let candidate = trimmed;

  // 1. Strip markdown code fences if present
  candidate = candidate.replace(/^```(?:json|javascript|js|ts)?\s*/i, '').replace(/\s*```$/i, '');

  // 2. Remove single-line and block comments outside strings
  candidate = candidate
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:\\])\/\/.*$/gm, '$1');

  // 3. Convert single-quoted strings to double-quoted strings where safe
  candidate = candidate.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, inner) => {
    const escaped = inner.replace(/"/g, '\\"');
    return `"${escaped}"`;
  });

  // 4. Quote unquoted object keys: { foo_bar: 1, $baz: true }
  candidate = candidate.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');

  // 5. Remove trailing commas before closing braces/brackets
  candidate = candidate.replace(/,\s*([}\]])/g, '$1');

  // 6. Balance missing closing brackets/braces if truncated
  candidate = balanceBrackets(candidate);

  try {
    const repairedParsed = JSON.parse(candidate);
    const stats = measureObjectTree(repairedParsed);
    const formatted = JSON.stringify(repairedParsed, null, 2);
    return {
      formattedJson: formatted,
      fixed: formatted,
      parsedObject: repairedParsed,
      diagnostics: {
        isValid: true,
        wasSanitized: true,
        syntaxErrors: 0,
        rfcStandard: '8259',
        totalKeys: stats.totalKeys,
        nestingDepth: stats.maxDepth,
        byteSize,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Malformed JSON structure';
    return {
      formattedJson: rawInput,
      fixed: rawInput,
      error: message,
      parsedObject: null,
      diagnostics: {
        isValid: false,
        wasSanitized: false,
        syntaxErrors: 1,
        rfcStandard: '8259',
        totalKeys: 0,
        nestingDepth: 0,
        byteSize,
        errorMessage: message,
      },
    };
  }
}

function balanceBrackets(input: string): string {
  const stack: string[] = [];
  let inString = false;
  let escape = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === '{') stack.push('}');
      else if (ch === '[') stack.push(']');
      else if (ch === '}' || ch === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === ch) {
          stack.pop();
        }
      }
    }
  }

  let result = input;
  if (inString) result += '"';
  // Clean trailing comma before appending closing brackets
  result = result.replace(/,\s*$/, '');
  while (stack.length > 0) {
    result += stack.pop();
  }
  return result;
}

function measureObjectTree(node: unknown, currentDepth = 0): { totalKeys: number; maxDepth: number } {
  if (node === null || typeof node !== 'object') {
    return { totalKeys: 0, maxDepth: currentDepth };
  }
  if (Array.isArray(node)) {
    let keys = 0;
    let maxD = currentDepth + 1;
    for (const item of node) {
      const sub = measureObjectTree(item, currentDepth + 1);
      keys += sub.totalKeys;
      if (sub.maxDepth > maxD) maxD = sub.maxDepth;
    }
    return { totalKeys: keys, maxDepth: maxD };
  }

  const entries = Object.entries(node as Record<string, unknown>);
  let totalKeys = entries.length;
  let maxDepth = currentDepth + 1;

  for (const [, val] of entries) {
    if (val !== null && typeof val === 'object') {
      const sub = measureObjectTree(val, currentDepth + 1);
      totalKeys += sub.totalKeys;
      if (sub.maxDepth > maxDepth) maxDepth = sub.maxDepth;
    }
  }
  return { totalKeys, maxDepth };
}

function toPascalCase(str: string): string {
  const cleaned = str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr: string) => chr.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');
  return cleaned || 'GeneratedNode';
}

/**
 * Generates clean TypeScript interfaces from any parsed JSON value.
 */
export function generateTypeScriptInterfaces(
  rootValue: unknown,
  rootInterfaceName = 'RootPayload'
): { code: string; interfaceCount: number } {
  const interfaces: string[] = [];
  const visitedNames = new Set<string>();

  function getUniqueName(base: string): string {
    let name = toPascalCase(base);
    let counter = 2;
    while (visitedNames.has(name)) {
      name = `${toPascalCase(base)}${counter++}`;
    }
    visitedNames.add(name);
    return name;
  }

  function inferType(val: unknown, keyHint: string): string {
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'string') return 'string';
    if (typeof val === 'number') return 'number';
    if (typeof val === 'boolean') return 'boolean';

    if (Array.isArray(val)) {
      if (val.length === 0) return 'unknown[]';
      const firstObj = val.find((item) => item !== null && typeof item === 'object' && !Array.isArray(item));
      if (firstObj) {
        const singularHint = keyHint.endsWith('s') && keyHint.length > 1 ? keyHint.slice(0, -1) : `${keyHint}Item`;
        const itemInterfaceName = buildInterface(firstObj as Record<string, unknown>, singularHint);
        return `${itemInterfaceName}[]`;
      }
      const elementTypes = Array.from(new Set(val.map((item) => inferType(item, keyHint))));
      return elementTypes.length === 1 ? `${elementTypes[0]}[]` : `(${elementTypes.join(' | ')})[]`;
    }

    if (typeof val === 'object') {
      return buildInterface(val as Record<string, unknown>, keyHint);
    }

    return 'unknown';
  }

  function buildInterface(obj: Record<string, unknown>, nameHint: string): string {
    const interfaceName = getUniqueName(nameHint);
    const lines: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      const propType = inferType(v, k);
      lines.push(`  ${safeKey}: ${propType};`);
    }
    const block = `export interface ${interfaceName} {\n${lines.join('\n')}\n}`;
    interfaces.push(block);
    return interfaceName;
  }

  if (rootValue !== null && typeof rootValue === 'object' && !Array.isArray(rootValue)) {
    buildInterface(rootValue as Record<string, unknown>, rootInterfaceName);
  } else if (Array.isArray(rootValue)) {
    const arrType = inferType(rootValue, rootInterfaceName);
    interfaces.push(`export type ${toPascalCase(rootInterfaceName)} = ${arrType};`);
  } else {
    interfaces.push(`export type ${toPascalCase(rootInterfaceName)} = ${typeof rootValue};`);
  }

  const header = `// DevPulse AI Generated Types • RFC 8259 Compliant\n\n`;
  return {
    code: header + interfaces.join('\n\n'),
    interfaceCount: interfaces.length,
  };
}

/**
 * Generates a Zod runtime validation schema from a parsed JSON value.
 */
export function generateZodSchema(rootValue: unknown, rootName = 'rootPayloadSchema'): string {
  function inferZod(val: unknown, indent = 0): string {
    const pad = '  '.repeat(indent);
    if (val === null || val === undefined) return 'z.null()';
    if (typeof val === 'string') return 'z.string()';
    if (typeof val === 'number') return 'z.number()';
    if (typeof val === 'boolean') return 'z.boolean()';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'z.array(z.unknown())';
      return `z.array(${inferZod(val[0], indent)})`;
    }
    if (typeof val === 'object') {
      const entries = Object.entries(val as Record<string, unknown>);
      if (entries.length === 0) return 'z.record(z.string(), z.unknown())';
      const inner = entries
        .map(([k, v]) => {
          const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
          return `${pad}  ${safeKey}: ${inferZod(v, indent + 1)},`;
        })
        .join('\n');
      return `z.object({\n${inner}\n${pad}})`;
    }
    return 'z.unknown()';
  }

  return `import { z } from 'zod';\n\nexport const ${rootName} = ${inferZod(rootValue, 0)};\n\nexport type RootPayload = z.infer<typeof ${rootName}>;`;
}

export function jsonToTypeScriptInterfaces(
  rawJson: string,
  rootInterfaceName = 'RootPayload'
): { interfaces: string; error?: string } {
  const sanitized = sanitizeBrokenJson(rawJson);
  if (!sanitized.diagnostics.isValid) {
    return {
      interfaces: '',
      error: sanitized.diagnostics.errorMessage || 'Invalid JSON structure',
    };
  }
  const generated = generateTypeScriptInterfaces(sanitized.parsedObject, rootInterfaceName);
  return {
    interfaces: generated.code,
  };
}

