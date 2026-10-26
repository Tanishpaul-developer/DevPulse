export interface StackTraceAnalysis {
  errorType: string;
  summary: string;
  culpritFrame: string;
  rootCause: string;
  exactLineFix: string;
  preventionTip: string;
  providerUsed?: string;
}

/**
 * Deterministic stack trace analyzer used for instant structured diagnostics
 * and as a reliable fallback if network AI calls are unavailable.
 */
export function analyzeStackTraceDeterministic(rawTrace: string): StackTraceAnalysis {
  const text = (rawTrace || '').trim();
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] || 'Unknown Runtime Error';
  const frameLine = lines.find((l) => /^at\s+/i.test(l) || /File\s+".*",\s+line\s+\d+/i.test(l)) || 'Top-level execution frame';

  const typeMatch = firstLine.match(/^([A-Za-z0-9_]+Error|Exception|Panic):/i);
  const errorType = typeMatch ? typeMatch[1] : 'RuntimeException';

  if (/Cannot read propert(?:y|ies) of (undefined|null)/i.test(text)) {
    const propMatch = text.match(/reading '([^']+)'/i);
    const prop = propMatch ? propMatch[1] : 'property';
    return {
      errorType,
      summary: firstLine,
      culpritFrame: frameLine,
      rootCause: `An object reference is undefined or null at the moment '.${prop}' is accessed—most commonly caused by rendering before an async fetch resolves or accessing an uninitialized nested field.`,
      exactLineFix: `// Replace direct property access:\nconst result = targetObject.${prop};\n\n// With optional chaining & nullish coalescing:\nconst result = (targetObject?.${prop} ?? []);`,
      preventionTip: `Enable "strictNullChecks": true in tsconfig.json and validate API payloads at the boundary or initialize state with an empty collection.`,
      providerUsed: 'Deterministic Engine + AST Heuristics',
    };
  }

  if (/Hydration failed|Text content does not match server-rendered HTML/i.test(text)) {
    return {
      errorType: 'HydrationMismatchError',
      summary: firstLine,
      culpritFrame: frameLine,
      rootCause: `The initial React render tree on the client differs from the SSR HTML snapshot (often due to window/localStorage access, Date.now(), or invalid HTML nesting like <div> inside <p>).`,
      exactLineFix: `const [mounted, setMounted] = useState(false);\nuseEffect(() => setMounted(true), []);\nif (!mounted) return <SkeletonPlaceholder />;`,
      preventionTip: `Defer browser-only values (localStorage, random seeds, locale timestamps) into a useEffect hook after hydration completes.`,
      providerUsed: 'Deterministic Engine + AST Heuristics',
    };
  }

  if (/CORS|Access-Control-Allow-Origin/i.test(text)) {
    return {
      errorType: 'CORSPolicyError',
      summary: firstLine,
      culpritFrame: frameLine,
      rootCause: `The browser blocked a cross-origin request because the target server did not include an 'Access-Control-Allow-Origin' header matching your origin.`,
      exactLineFix: `// Route the request through your backend Express proxy:\nconst res = await fetch('/api/proxy-rest', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ url: targetUrl, method: 'GET' })\n});`,
      preventionTip: `Proxy third-party API calls through a server-side route or configure explicit CORS middleware on the upstream API.`,
      providerUsed: 'Deterministic Engine + AST Heuristics',
    };
  }

  return {
    errorType,
    summary: firstLine,
    culpritFrame: frameLine,
    rootCause: `Unhandled ${errorType} thrown at (${frameLine}). Execution halted when an unexpected runtime invariant or input type violated the function contract.`,
    exactLineFix: `try {\n  // Guard the failing operation at ${frameLine}\n  await executeOperation(validatedInput);\n} catch (err) {\n  console.error('[Handled ${errorType}]:', err);\n  return fallbackState;\n}`,
    preventionTip: `Add runtime schema validation and defensive input guards prior to invoking the failing call site.`,
    providerUsed: 'Deterministic Engine + AST Heuristics',
  };
}
