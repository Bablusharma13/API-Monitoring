// Shared assertion helpers used by both the API monitor worker and the
// Synthetic Transactions module. Keep exported names/signatures stable —
// other modules import these directly.

export const getByPath = (obj, path) => {
  if (!path) return undefined;

  const segments = path.split(".");
  let current = obj;

  for (const segment of segments) {
    if (current === null || current === undefined) return undefined;
    current = current[segment];
  }

  return current;
};

export const evaluateAssertions = (assertions, responseBody) => {
  if (!assertions || assertions.enabled !== true) {
    return { passed: true, failures: [] };
  }

  const failures = [];

  // ── body-contains checks ─────────────────
  if (Array.isArray(assertions.bodyContains)) {
    const stringified = JSON.stringify(responseBody);
    for (const expected of assertions.bodyContains) {
      if (!stringified || !stringified.includes(expected)) {
        failures.push(`Response body does not contain "${expected}"`);
      }
    }
  }

  // ── json-path checks ─────────────────────
  if (Array.isArray(assertions.jsonPathChecks)) {
    for (const check of assertions.jsonPathChecks) {
      const actual = getByPath(responseBody, check.path);

      switch (check.operator) {
        case "exists": {
          if (actual === undefined) {
            failures.push(`Expected "${check.path}" to exist`);
          }
          break;
        }
        case "contains": {
          if (!String(actual).includes(check.expected)) {
            failures.push(
              `Expected "${check.path}" (${actual}) to contain "${check.expected}"`,
            );
          }
          break;
        }
        case "gt": {
          if (!(Number(actual) > Number(check.expected))) {
            failures.push(
              `Expected "${check.path}" (${actual}) to be greater than ${check.expected}`,
            );
          }
          break;
        }
        case "lt": {
          if (!(Number(actual) < Number(check.expected))) {
            failures.push(
              `Expected "${check.path}" (${actual}) to be less than ${check.expected}`,
            );
          }
          break;
        }
        default: {
          // "equals" and any unrecognized operator fall back to strict equality
          if (actual !== check.expected) {
            failures.push(
              `Expected "${check.path}" to equal "${check.expected}" but got "${actual}"`,
            );
          }
          break;
        }
      }
    }
  }

  return { passed: failures.length === 0, failures };
};
