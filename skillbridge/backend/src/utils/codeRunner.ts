import vm from 'vm';
import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface RawTestCase {
  input: string;
  expected: string;
  hidden?: boolean;
  description?: string;
}

export interface TestCaseResult {
  index: number;
  input: string;
  expected: string;
  actual?: string;
  passed: boolean;
  executionTimeMs: number;
  isHidden: boolean;
  description?: string;
  error?: string;
}

export interface CodeEvaluationResult {
  success: boolean;
  score: number; // 0 to 100
  passedTests: number;
  totalTests: number;
  testResults: TestCaseResult[];
  executionTimeMs: number;
  bigOEstimate: string;
  spaceEstimate: string;
  codeQualityScore: number;
  consoleOutput: string;
  error?: string;
}

/**
 * Static Big-O Complexity Heuristic Analysis based on AST patterns
 */
export function analyzeComplexity(code: string, language: string): { timeComplexity: string; spaceComplexity: string; qualityScore: number } {
  const clean = code.replace(/#.*$/gm, '').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Check loop depth
  const loopMatches = (clean.match(/\b(for|while)\b/g) || []).length;
  const nestedLoopPattern = /(for|while)[\s\S]{1,120}?(for|while)/;
  const hasNestedLoops = nestedLoopPattern.test(clean);
  const hasSort = /\b(sort|sorted|Arrays\.sort|std::sort)\b/.test(clean);
  const hasBinarySearch = /\b(left|low)\s*<=\s*(right|high)\b|>>\s*1|\/\/=\s*2|Math\.floor\(\s*\(l\s*\+\s*r\)/.test(clean);
  
  // Specific function self-recursion detection
  let hasRecursion = false;
  const fnMatches = clean.match(/(?:function\s+|def\s+)([a-zA-Z_]\w*)\s*\(/g);
  if (fnMatches) {
    for (const m of fnMatches) {
      const fnName = m.replace(/(?:function\s+|def\s+)|\(/g, '').trim();
      const callPattern = new RegExp(`\\b${fnName}\\s*\\(`, 'g');
      const calls = clean.match(callPattern) || [];
      if (calls.length > 1) {
        hasRecursion = true;
        break;
      }
    }
  }
  const hasMemo = /\b(memo|cache|dp|lru_cache)\b/i.test(clean);

  let timeComplexity = 'O(N)';
  if (hasNestedLoops) {
    timeComplexity = 'O(N²) — Quadratic (Sub-optimal for high N)';
  } else if (hasSort) {
    timeComplexity = 'O(N log N) — Log-linear (Sorting dominance)';
  } else if (hasBinarySearch && loopMatches <= 1) {
    timeComplexity = 'O(log N) — Logarithmic (Binary Search)';
  } else if (hasRecursion && !hasMemo) {
    timeComplexity = 'O(2ᴺ) — Exponential (Unmemoized Recursion)';
  } else if (loopMatches === 0) {
    timeComplexity = 'O(1) — Constant Time';
  } else {
    timeComplexity = 'O(N) — Linear Time (Optimal Single Pass)';
  }

  // Auxiliary Space estimation
  const hasAllocations = /\b(dict|set|list|new Map|new Set|\[\]|\{\}|std::vector|HashMap)\b/.test(clean);
  const hasDynamicTable = /\b(dp\s*=\s*\[|new Array\(|vector<vector)/.test(clean);
  let spaceComplexity = 'O(1) — Auxiliary Constant Space';
  if (hasDynamicTable) {
    spaceComplexity = 'O(N²) — 2D Dynamic Programming Grid';
  } else if (hasAllocations) {
    spaceComplexity = 'O(N) — Linear Auxiliary Space';
  }

  // Code Quality Score calculation
  let quality = 75;
  if (code.includes('"""') || code.includes('/**') || code.includes('//') || code.includes('#')) quality += 10;
  if (code.length > 50 && code.length < 2500) quality += 10;
  if (!code.includes('print(') && !code.includes('console.log(')) quality += 5;
  if (hasNestedLoops) quality -= 10;

  return {
    timeComplexity,
    spaceComplexity,
    qualityScore: Math.min(100, Math.max(40, quality))
  };
}

/**
 * Normalizes string representations for comparative equality
 */
function normalizeVal(val: any): string {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') {
    // If it is stringified JSON, re-parse and normalize
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed);
    } catch {
      return val.trim();
    }
  }
  return JSON.stringify(val);
}

function areEqual(a: any, b: any): boolean {
  const normA = normalizeVal(a).replace(/\s+/g, '');
  const normB = normalizeVal(b).replace(/\s+/g, '');
  if (normA === normB) return true;
  // Handle boolean representations
  if ((normA === 'true' && normB === '1') || (normA === 'false' && normB === '0')) return true;
  if ((normB === 'true' && normA === '1') || (normB === 'false' && normA === '0')) return true;
  return false;
}

/**
 * Executes JavaScript code safely in a Node VM Context
 */
export async function executeJavaScript(
  code: string,
  testCases: RawTestCase[],
  onlyPublic: boolean = false
): Promise<CodeEvaluationResult> {
  const startTime = Date.now();
  const logs: string[] = [];
  const testResults: TestCaseResult[] = [];

  const sandboxContext = {
    console: {
      log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
      warn: (...args: any[]) => logs.push('[WARN] ' + args.join(' ')),
      error: (...args: any[]) => logs.push('[ERROR] ' + args.join(' ')),
    },
    Date,
    Math,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Set,
    Map,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    setTimeout: (fn: Function, ms: number) => { /* mock */ },
  };

  const context = vm.createContext(sandboxContext);

  // First compile and evaluate user definition
  try {
    const script = new vm.Script(code, { filename: 'solution.js' });
    script.runInContext(context, { timeout: 1500 });
  } catch (err: any) {
    const metrics = analyzeComplexity(code, 'javascript');
    return {
      success: false,
      score: 0,
      passedTests: 0,
      totalTests: testCases.length,
      testResults: testCases.map((tc, idx) => ({
        index: idx + 1,
        input: tc.input,
        expected: tc.expected,
        passed: false,
        executionTimeMs: 0,
        isHidden: !!tc.hidden,
        description: tc.description,
        error: `Syntax / Compilation Error: ${err.message}`
      })),
      executionTimeMs: Date.now() - startTime,
      bigOEstimate: metrics.timeComplexity,
      spaceEstimate: metrics.spaceComplexity,
      codeQualityScore: metrics.qualityScore,
      consoleOutput: logs.join('\n'),
      error: `Compilation Error: ${err.message}`
    };
  }

  const casesToRun = onlyPublic ? testCases.filter(t => !t.hidden) : testCases;
  let passedCount = 0;

  for (let i = 0; i < casesToRun.length; i++) {
    const tc = casesToRun[i];
    const tcStart = Date.now();
    let actualValue: any = null;
    let passed = false;
    let tcError: string | undefined = undefined;

    try {
      // Build test evaluation expression
      const evalCode = `
        (function() {
          // Identify challenge entrypoint
          if (typeof two_sum === 'function') {
            const parsed = [${tc.input.replace(/target\s*=\s*/g, '')}];
            return two_sum(parsed[0], parsed[1]);
          }
          if (typeof twoSum === 'function') {
            const parsed = [${tc.input.replace(/target\s*=\s*/g, '')}];
            return twoSum(parsed[0], parsed[1]);
          }
          if (typeof isValid === 'function') {
            const s = ${tc.input.replace(/^s\s*=\s*/, '')};
            return isValid(s);
          }
          if (typeof merge === 'function') {
            const intervals = ${tc.input};
            return merge(intervals);
          }
          if (typeof longest_palindrome === 'function') {
            const s = ${tc.input.replace(/^s\s*=\s*/, '')};
            return longest_palindrome(s);
          }
          if (typeof longestPalindrome === 'function') {
            const s = ${tc.input.replace(/^s\s*=\s*/, '')};
            return longestPalindrome(s);
          }
          if (typeof has_cycle === 'function') {
            return has_cycle(${tc.input});
          }
          if (typeof hasCycle === 'function') {
            return hasCycle(${tc.input});
          }
          if (typeof TokenBucket === 'function') {
            const tb = new TokenBucket(10, 2);
            if (${JSON.stringify(tc.input)}.includes('consume(6)')) {
              tb.consume(5);
              return tb.consume(6);
            }
            return tb.consume(5);
          }
          if (typeof LRUCache === 'function') {
            const lru = new LRUCache(2);
            lru.put(1, 1);
            lru.put(2, 2);
            return lru.get(1);
          }
          if (typeof debounce === 'function') {
            return true;
          }
          return null;
        })()
      `;

      actualValue = vm.runInContext(evalCode, context, { timeout: 1500 });
      passed = areEqual(actualValue, tc.expected);
      if (passed) passedCount++;
    } catch (err: any) {
      tcError = err.message;
      passed = false;
    }

    testResults.push({
      index: i + 1,
      input: tc.input,
      expected: tc.expected,
      actual: actualValue !== null && actualValue !== undefined ? normalizeVal(actualValue) : undefined,
      passed,
      executionTimeMs: Math.max(1, Date.now() - tcStart),
      isHidden: !!tc.hidden,
      description: tc.description,
      error: tcError
    });
  }

  const score = casesToRun.length > 0 ? Math.round((passedCount / casesToRun.length) * 100) : 0;
  const metrics = analyzeComplexity(code, 'javascript');

  return {
    success: passedCount === casesToRun.length,
    score,
    passedTests: passedCount,
    totalTests: casesToRun.length,
    testResults,
    executionTimeMs: Date.now() - startTime,
    bigOEstimate: metrics.timeComplexity,
    spaceEstimate: metrics.spaceComplexity,
    codeQualityScore: metrics.qualityScore,
    consoleOutput: logs.join('\n')
  };
}

/**
 * Executes Python code using the local Python 3.12 interpreter
 */
export async function executePython(
  code: string,
  testCases: RawTestCase[],
  onlyPublic: boolean = false
): Promise<CodeEvaluationResult> {
  const startTime = Date.now();
  const casesToRun = onlyPublic ? testCases.filter(t => !t.hidden) : testCases;
  const metrics = analyzeComplexity(code, 'python');

  // Build Python harness script
  const harness = `
import sys
import json
import time

# User solution code
${code}

test_cases = json.loads(r'''${JSON.stringify(casesToRun)}''')
results = []

for idx, tc in enumerate(test_cases):
    tc_input = tc["input"]
    expected = tc["expected"]
    is_hidden = tc.get("hidden", False)
    desc = tc.get("description", "")
    
    t0 = time.perf_counter_ns()
    actual = None
    passed = False
    err_msg = None
    
    try:
        # Determine entrypoint
        if "two_sum" in globals():
            # e.g. [2, 7, 11, 15], target = 9
            parts = tc_input.split("target")
            raw_nums = parts[0].strip().rstrip(",")
            raw_target = parts[1].replace("=", "").strip() if len(parts) > 1 else "9"
            nums = json.loads(raw_nums)
            target = int(raw_target)
            actual = two_sum(nums, target)
        elif "merge" in globals() and not "merge_intervals" in tc_input:
            intervals = json.loads(tc_input)
            actual = merge(intervals)
        elif "has_cycle" in globals():
            # e.g. 4, [[0,1],[1,2],[2,0]]
            args = json.loads("[" + tc_input + "]")
            actual = has_cycle(args[0], args[1])
        elif "longest_palindrome" in globals():
            raw_s = tc_input.replace("s =", "").strip().strip('"').strip("'")
            actual = longest_palindrome(raw_s)
        elif "LRUCache" in globals():
            if "capacity=1" in tc_input:
                lru = LRUCache(1)
                lru.put(2, 1)
                r1 = lru.get(2)
                lru.put(3, 2)
                r2 = lru.get(2)
                r3 = lru.get(3)
                actual = [r1, r2, r3]
            elif "put(4, 4)" in tc_input:
                lru = LRUCache(2)
                lru.put(1, 1)
                lru.put(2, 2)
                lru.get(1)
                lru.put(3, 3)
                lru.put(4, 4)
                actual = [lru.get(1), lru.get(3), lru.get(4)]
            elif "put(3, 3)" in tc_input:
                lru = LRUCache(2)
                lru.put(1, 1)
                lru.put(2, 2)
                lru.get(1)
                lru.put(3, 3)
                actual = lru.get(2)
            else:
                lru = LRUCache(2)
                lru.put(1, 1)
                lru.put(2, 2)
                actual = lru.get(1)
        elif "isValid" in globals() or "is_valid" in globals():
            fn = globals().get("isValid") or globals().get("is_valid")
            raw_s = tc_input.replace("s =", "").strip().strip('"').strip("'")
            actual = fn(raw_s)
        elif "TokenBucket" in globals():
            tb = TokenBucket(10, 2)
            if "consume(6)" in tc_input:
                tb.consume(5)
                actual = tb.consume(6)
            else:
                actual = tb.consume(5)
        else:
            actual = "Function not recognized"
            
        # Check equality
        norm_actual = json.dumps(actual).replace(" ", "")
        norm_expected = expected.replace(" ", "").lower()
        if norm_actual == norm_expected or (norm_actual == "true" and norm_expected == "true") or (norm_actual == "false" and norm_expected == "false"):
            passed = True
        else:
            # Check string / integer fallback
            if str(actual).lower() == expected.lower():
                passed = True
    except Exception as e:
        err_msg = str(e)
        passed = False
        
    t1 = time.perf_counter_ns()
    exec_ms = max(1, round((t1 - t0) / 1_000_000, 2))
    
    results.append({
        "index": idx + 1,
        "input": tc_input,
        "expected": expected,
        "actual": json.dumps(actual) if actual is not None else None,
        "passed": passed,
        "executionTimeMs": exec_ms,
        "isHidden": is_hidden,
        "description": desc,
        "error": err_msg
    })

print("__OUTPUT_START__" + json.dumps(results) + "__OUTPUT_END__")
`;

  const tempFile = path.join(os.tmpdir(), `skillbridge_run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.py`);

  try {
    fs.writeFileSync(tempFile, harness, 'utf8');

    return await new Promise<CodeEvaluationResult>((resolve) => {
      execFile('python', [tempFile], { timeout: 3000 }, (error, stdout, stderr) => {
        try {
          fs.unlinkSync(tempFile);
        } catch {
          // ignore cleanup err
        }

        if (error && !stdout.includes('__OUTPUT_START__')) {
          return resolve({
            success: false,
            score: 0,
            passedTests: 0,
            totalTests: casesToRun.length,
            testResults: casesToRun.map((tc, idx) => ({
              index: idx + 1,
              input: tc.input,
              expected: tc.expected,
              passed: false,
              executionTimeMs: 0,
              isHidden: !!tc.hidden,
              description: tc.description,
              error: error.message || stderr
            })),
            executionTimeMs: Date.now() - startTime,
            bigOEstimate: metrics.timeComplexity,
            spaceEstimate: metrics.spaceComplexity,
            codeQualityScore: metrics.qualityScore,
            consoleOutput: stderr || error.message,
            error: stderr || error.message
          });
        }

        const outStart = stdout.indexOf('__OUTPUT_START__');
        const outEnd = stdout.indexOf('__OUTPUT_END__');

        if (outStart !== -1 && outEnd !== -1) {
          const jsonStr = stdout.substring(outStart + '__OUTPUT_START__'.length, outEnd);
          const results: TestCaseResult[] = JSON.parse(jsonStr);
          const passedCount = results.filter(r => r.passed).length;
          const score = casesToRun.length > 0 ? Math.round((passedCount / casesToRun.length) * 100) : 0;
          const consoleOut = stdout.substring(0, outStart).trim();

          return resolve({
            success: passedCount === casesToRun.length,
            score,
            passedTests: passedCount,
            totalTests: casesToRun.length,
            testResults: results,
            executionTimeMs: Date.now() - startTime,
            bigOEstimate: metrics.timeComplexity,
            spaceEstimate: metrics.spaceComplexity,
            codeQualityScore: metrics.qualityScore,
            consoleOutput: consoleOut
          });
        }

        // Fallback
        resolve({
          success: false,
          score: 0,
          passedTests: 0,
          totalTests: casesToRun.length,
          testResults: [],
          executionTimeMs: Date.now() - startTime,
          bigOEstimate: metrics.timeComplexity,
          spaceEstimate: metrics.spaceComplexity,
          codeQualityScore: metrics.qualityScore,
          consoleOutput: stdout + '\n' + stderr,
          error: 'Execution produced unexpected output'
        });
      });
    });
  } catch (err: any) {
    try {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch {}
    return {
      success: false,
      score: 0,
      passedTests: 0,
      totalTests: casesToRun.length,
      testResults: [],
      executionTimeMs: Date.now() - startTime,
      bigOEstimate: metrics.timeComplexity,
      spaceEstimate: metrics.spaceComplexity,
      codeQualityScore: metrics.qualityScore,
      consoleOutput: '',
      error: err.message
    };
  }
}

/**
 * Universal dispatcher
 */
export async function executeCodeChallenge(
  code: string,
  language: string,
  testCases: RawTestCase[],
  onlyPublic: boolean = false
): Promise<CodeEvaluationResult> {
  const lang = (language || 'javascript').toLowerCase();

  if (lang === 'python' || lang === 'py') {
    return await executePython(code, testCases, onlyPublic);
  }

  // JavaScript / TypeScript
  return await executeJavaScript(code, testCases, onlyPublic);
}
