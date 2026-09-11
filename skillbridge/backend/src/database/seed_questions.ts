// ── Comprehensive Advanced CS Question Bank & Practical Coding Arena Seed ──

export interface SeedQuestion {
  aId: string;
  question: string;
  opts: string[];
  correct: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  points: number;
  explanation: string;
}

export function getSeedQuestions(aIds: Record<string, string>): SeedQuestion[] {
  const q = (
    aId: string,
    question: string,
    opts: string[],
    correct: number,
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    points: number,
    explanation: string
  ): SeedQuestion => ({ aId, question, opts, correct, difficulty, points, explanation });

  return [
    // ══════════════════════════════════════════════════════════════════════════
    // 1. PYTHON PROGRAMMING (Advanced CPython, Concurrency, Memory & Metaprogramming)
    // ══════════════════════════════════════════════════════════════════════════
    q(
      aIds.python,
      `What is the critical difference between Python's \`__new__\` and \`__init__\` methods during object instantiation?`,
      [
        "__init__ allocates the memory heap; __new__ assigns attribute values",
        "__new__ is a static method that creates and returns the new instance; __init__ initializes attributes on the created instance",
        "__new__ is called only during subclass inheritance; __init__ is called for base classes",
        "__init__ runs before __new__ to establish method resolution order (MRO)"
      ],
      1,
      'ADVANCED',
      3,
      "__new__ is the actual constructor method responsible for instantiating the object (returning an instance of cls), whereas __init__ is the initializer called after the instance has been created."
    ),

    q(
      aIds.python,
      `How does the Global Interpreter Lock (GIL) in CPython affect multi-threaded CPU-bound programs versus multi-threaded I/O-bound programs?`,
      [
        "It prevents CPU-bound threads from executing in parallel on multiple cores, but I/O-bound threads release the GIL during syscalls allowing concurrent wait",
        "It prevents both CPU-bound and I/O-bound threads from running concurrently under all operating system primitives",
        "It enforces lock-free atomic hardware transactions across CPU-bound threads",
        "It converts multi-threaded programs automatically into asynchronous asyncio event loop tasks"
      ],
      0,
      'ADVANCED',
      3,
      "The GIL prevents true multi-core parallel execution of Python bytecode for CPU-bound workloads in CPython. However, during I/O operations (like network requests or file reads), the GIL is released, allowing other threads to run."
    ),

    q(
      aIds.python,
      `What will be the output of the following Python snippet testing closure late-binding?
\`\`\`python
funcs = [lambda x: x + i for i in range(3)]
results = [f(10) for f in funcs]
print(results)
\`\`\``,
      ["[10, 11, 12]", "[12, 12, 12]", "[10, 10, 10]", "[13, 13, 13]"],
      1,
      'INTERMEDIATE',
      2,
      "In Python, closures bind variables by reference, not by value at creation time (late binding). When the lambdas execute, 'i' has finished the loop with value 2, so 10 + 2 = 12 for all three."
    ),

    q(
      aIds.python,
      `Why does defining \`__slots__ = ('name', 'id')\` in a Python class improve performance and memory usage for millions of instances?`,
      [
        "It enables JIT compilation of method calls via LLVM",
        "It prevents the automatic allocation of a per-instance __dict__ and __weakref__, storing attributes in a compact C-level array",
        "It marks the class as immutable and stores it strictly in CPU L1 cache",
        "It converts dynamic type attributes into static 64-bit integer pointers"
      ],
      1,
      'ADVANCED',
      3,
      "By default, Python instances use a dynamic dictionary (__dict__) to store attributes, which has high memory overhead. __slots__ replaces __dict__ with a fixed-size internal array of references, saving ~40-50% memory per instance."
    ),

    q(
      aIds.python,
      `In Python's Descriptor Protocol, what distinguishes a 'data descriptor' from a 'non-data descriptor', and how does it affect attribute lookup precedence?`,
      [
        "Data descriptors define __get__ and __set__ (or __delete__) and take precedence over instance __dict__; non-data descriptors only define __get__ and yield to instance __dict__",
        "Data descriptors only store primitive types; non-data descriptors store callables",
        "Non-data descriptors take precedence over both class and instance dictionaries",
        "There is no precedence difference; they are treated identically by getattr"
      ],
      0,
      'ADVANCED',
      3,
      "If an object's class defines a data descriptor (defining __set__ or __delete__ along with __get__), Python checks it BEFORE looking into the instance's __dict__. Non-data descriptors (like ordinary methods) yield to instance __dict__."
    ),

    q(
      aIds.python,
      `What happens if a custom context manager's \`__exit__(self, exc_type, exc_val, exc_tb)\` method returns \`True\` when an exception occurs inside the \`with\` block?`,
      [
        "The exception is re-raised with an augmented stack trace",
        "The exception is suppressed and program execution continues normally after the with block",
        "A RuntimeError is raised because suppressions must be explicit via warnings module",
        "The context manager restarts the with block from the beginning"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Returning True from __exit__ signals to Python that the exception has been handled and suppressed, so Python will not propagate it outward."
    ),

    q(
      aIds.python,
      `Consider the C3 Linearization algorithm used for Method Resolution Order (MRO) in Python. In a diamond inheritance hierarchy (A -> B, C; B, C -> D), what order is guaranteed?`,
      [
        "D -> C -> B -> A -> object",
        "D -> B -> C -> A -> object",
        "D -> A -> B -> C -> object",
        "B -> C -> D -> A -> object"
      ],
      1,
      'ADVANCED',
      3,
      "Python's C3 Linearization preserves local precedence order (B before C) and monotonicity, resulting in [D, B, C, A, object]."
    ),

    q(
      aIds.python,
      `What is the difference between \`asyncio.gather(*tasks)\` and \`asyncio.as_completed(tasks)\`?`,
      [
        "gather runs tasks sequentially; as_completed runs tasks in parallel threads",
        "gather waits for all tasks to complete and returns results in the original submission order; as_completed yields tasks as an iterator in the order they finish",
        "as_completed cancels remaining tasks if any task fails; gather ignores failures",
        "There is no behavioral difference; they are aliases"
      ],
      1,
      'INTERMEDIATE',
      2,
      "asyncio.gather aggregates results preserving input order. asyncio.as_completed yields futures one-by-one as soon as each finishes, allowing immediate streaming of responses."
    ),

    q(
      aIds.python,
      `What is the underlying cause and remedy for the notorious 'mutable default argument' bug shown below?
\`\`\`python
def append_to(element, target=[]):
    target.append(element)
    return target
\`\`\``,
      [
        "Default arguments are evaluated once when the function is defined, so the same list object is shared across all calls; fix by using target=None and initializing inside",
        "Lists cannot be passed as default parameters in Python 3; use tuple instead",
        "CPython garbage collects target after the first call; fix by using global keyword",
        "The append method creates a new memory pointer; fix by using target += [element]"
      ],
      0,
      'INTERMEDIATE',
      2,
      "Function default values are evaluated once when the def statement executes. Using a mutable default like [] or {} shares that single instance across all invocations that don't pass an argument."
    ),

    q(
      aIds.python,
      `How does the \`sys.intern()\` function optimize string processing in high-performance Python applications?`,
      [
        "It encrypts strings using SHA-256 for secure hashing",
        "It enters strings into an internal interned table so identical strings share the exact same memory address, enabling O(1) pointer comparison via 'is'",
        "It compresses ASCII strings to 4 bits per character",
        "It converts dynamic strings to C-style null-terminated byte arrays"
      ],
      1,
      'ADVANCED',
      3,
      "sys.intern() ensures that identical strings point to the same object in memory, replacing costly character-by-character string equality O(N) checks with instantaneous pointer comparison O(1)."
    ),

    q(
      aIds.python,
      `What is the behavior of the following generator pipeline when iterated?
\`\`\`python
gen = (x * 2 for x in [1, 2, 3])
print(list(gen))
print(list(gen))
\`\`\``,
      ["[2, 4, 6] and then [2, 4, 6]", "[2, 4, 6] and then []", "[] and then []", "Raises StopIteration on the second line"],
      1,
      'BEGINNER',
      1,
      "Generators are one-time iterators. Once exhausted by the first list(gen) call, subsequent iterations immediately yield nothing ([])."
    ),

    q(
      aIds.python,
      `When using \`multiprocessing\` in Python on Linux versus Windows/macOS, what is the key difference between the 'fork' and 'spawn' start methods?`,
      [
        "'fork' creates a fresh Python interpreter without inheriting memory; 'spawn' clones the parent memory space via copy-on-write",
        "'fork' clones the parent memory space via copy-on-write without re-importing modules, but can cause deadlocks with multi-threaded parents; 'spawn' starts a fresh Python process from scratch",
        "'spawn' is only supported on Linux kernel 6.x and higher",
        "Both methods are identical in terms of memory isolation and initialization overhead"
      ],
      1,
      'ADVANCED',
      3,
      "fork copies the parent process state via OS copy-on-write (fast, but dangerous with active threads due to inherited mutexes). spawn creates a clean process that re-imports modules (safer and standard on Windows/macOS)."
    ),

    // ══════════════════════════════════════════════════════════════════════════
    // 2. WEB DEVELOPMENT & DISTRIBUTED SYSTEMS ARCHITECTURE
    // ══════════════════════════════════════════════════════════════════════════
    q(
      aIds.webdev,
      `In the JavaScript Event Loop, what is the exact execution priority between Microtasks and Macrotasks?`,
      [
        "Macrotasks (e.g. setTimeout) execute immediately before the Microtask queue is inspected",
        "All microtasks in the microtask queue (Promise callbacks, queueMicrotask) are drained to completion after the current task and before the browser renders or processes the next macrotask",
        "Microtasks and Macrotasks are interleaved in round-robin fashion",
        "Microtasks execute in a background Web Worker thread while macrotasks run on the main thread"
      ],
      1,
      'ADVANCED',
      3,
      "The event loop executes one macrotask from the task queue, then immediately processes ALL available microtasks (including microtasks queued by other microtasks) until the microtask queue is empty, before re-rendering or picking the next macrotask."
    ),

    q(
      aIds.webdev,
      `What determines whether a browser triggers a Cross-Origin Resource Sharing (CORS) preflight \`OPTIONS\` request before making a cross-origin HTTP call?`,
      [
        "Any request with an HTTP body automatically triggers a preflight",
        "Requests that use HTTP methods other than GET, HEAD, POST, or include custom headers (e.g., Authorization, application/json), or use non-simple RequestInit options",
        "Cross-origin requests between different subdomains never require a preflight",
        "Preflight requests are triggered only when cookies or credentials are omitted"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Simple requests (GET, HEAD, POST with standard Content-Types like text/plain, multipart/form-data, application/x-www-form-urlencoded and no custom headers) skip preflight. Setting Authorization or Content-Type: application/json triggers an OPTIONS preflight."
    ),

    q(
      aIds.webdev,
      `Why is the OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange) mandatory for Single Page Applications (SPAs) and mobile apps?`,
      [
        "Because SPAs cannot securely store a client_secret, PKCE dynamically creates a cryptographic code_verifier and code_challenge to prevent authorization code interception attacks",
        "Because PKCE eliminates the need for access tokens by using asymmetric JWTs directly",
        "Because standard OAuth 2.0 only supports desktop server-to-server TLS connections",
        "Because PKCE encrypts the entire browser LocalStorage database with AES-GCM"
      ],
      0,
      'ADVANCED',
      3,
      "Public clients (SPAs, mobile apps) cannot keep a static client_secret confidential. PKCE prevents an attacker who intercepts the authorization code from exchanging it for tokens, because the attacker lacks the original high-entropy code_verifier."
    ),

    q(
      aIds.webdev,
      `Which modern browser cookie attribute configuration provides the strongest defense against Cross-Site Request Forgery (CSRF) without breaking top-level navigation?`,
      [
        "Secure; HttpOnly; SameSite=None",
        "Secure; HttpOnly; SameSite=Lax",
        "HttpOnly; SameSite=Strict; Domain=*",
        "Secure; Path=/; Priority=High"
      ],
      1,
      'INTERMEDIATE',
      2,
      "SameSite=Lax prevents the cookie from being sent on cross-site subrequests (like images, iframes, or cross-site POST forms), while still allowing the cookie when a user navigates directly to the origin via a top-level link. Secure and HttpOnly protect against sniffing and XSS extraction."
    ),

    q(
      aIds.webdev,
      `In the browser rendering pipeline, which CSS properties can be animated without triggering either a 'Layout' (Reflow) or 'Paint' step, relying solely on the GPU 'Composite' stage?`,
      [
        "width, height, and margin",
        "top, left, and border-radius",
        "transform and opacity",
        "background-color and box-shadow"
      ],
      2,
      'ADVANCED',
      3,
      "Changes to 'transform' and 'opacity' bypass both layout calculations and repaint passes, executing directly on the compositor thread via GPU layers, ensuring 60/120 FPS animations."
    ),

    q(
      aIds.webdev,
      `How does HTTP/2 eliminate the 'Head-of-Line (HoL) Blocking' issue present in HTTP/1.1 pipelining?`,
      [
        "By opening a distinct TCP socket for each asset requested by the browser",
        "By framing data into binary chunks multiplexed across a single TCP connection as independent bidirectional streams",
        "By replacing the TCP protocol entirely with UDP datagrams",
        "By caching all server assets locally in browser memory prior to handshake"
      ],
      1,
      'ADVANCED',
      3,
      "HTTP/2 introduces binary framing and stream identifiers, allowing multiple requests and responses to be in-flight concurrently over a single TCP connection without waiting for earlier requests to complete."
    ),

    q(
      aIds.webdev,
      `In distributed caching, what is the fundamental trade-off between the 'Cache-Aside' (Lazy Loading) and 'Write-Through' caching patterns?`,
      [
        "Cache-Aside guarantees zero cache misses; Write-Through causes stale reads on every write",
        "Cache-Aside only loads data upon a cache miss (reducing memory waste for unread data, but suffering latency spikes on first read); Write-Through updates cache and database synchronously (ensuring fresh data at the cost of higher write latency)",
        "Write-Through is strictly asynchronous; Cache-Aside is strictly synchronous",
        "Cache-Aside cannot be used with relational databases like PostgreSQL"
      ],
      1,
      'INTERMEDIATE',
      2,
      "In Cache-Aside, the application queries cache, on miss fetches from DB, and populates cache. In Write-Through, writes update the cache and the backing store in a single atomic transaction, reducing read misses but adding write latency."
    ),

    q(
      aIds.webdev,
      `What is the root cause of a 'detached DOM tree' memory leak in a React/Vue Single Page Application?`,
      [
        "Calling setState inside a useEffect without an empty dependency array",
        "A DOM element has been removed from the visible document tree, but JavaScript variables or event listeners still hold references to it in memory",
        "Using CSS flexbox containers with more than 1000 child elements",
        "Rendering components using server-side rendering (SSR) without hydration"
      ],
      1,
      'ADVANCED',
      3,
      "A detached DOM node occurs when an element is removed from the DOM tree, but a JavaScript closure, global variable, or un-removed event listener retains a reference to it, preventing the browser garbage collector from reclaiming it."
    ),

    q(
      aIds.webdev,
      `When implementing Content Security Policy (CSP), why is a 'nonce-based' policy superior to using \`'unsafe-inline'\`?`,
      [
        "Nonce-based policies disable JavaScript execution completely on mobile devices",
        "Nonces require every inline script to match a cryptographically random, per-request token generated on the server, neutralizing injected attacker payloads even if they manage to inject <script> tags",
        "Nonces compress JavaScript payloads by 30% over gzip",
        "Unsafe-inline requires SSL certificate validation on every DOM mutation"
      ],
      1,
      'INTERMEDIATE',
      2,
      "A cryptographic nonce (number used once) generated uniquely for each HTTP response ensures that only scripts authored by the trusted server carrying the matching nonce attribute can execute, preventing XSS injection."
    ),

    q(
      aIds.webdev,
      `What status code and header exchange occurs when upgrading an HTTP connection to a WebSocket connection?`,
      [
        "HTTP 200 OK with Transfer-Encoding: chunked",
        "HTTP 101 Switching Protocols with Connection: Upgrade and Upgrade: websocket",
        "HTTP 307 Temporary Redirect with Location: wss://...",
        "HTTP 204 No Content with Sec-WebSocket-Active: true"
      ],
      1,
      'BEGINNER',
      1,
      "The client sends an HTTP GET request with Upgrade: websocket and Connection: Upgrade. The server acknowledges by responding with HTTP 101 Switching Protocols."
    ),

    q(
      aIds.webdev,
      `In database connection management, what is 'connection pool exhaustion' and what is the standard architectural mitigation?`,
      [
        "When the database runs out of disk storage for WAL logs; mitigated by expanding partitions",
        "When all connections in the pool are actively in-use or leaked by long-running queries, blocking incoming requests; mitigated by setting acquire timeouts, leak detection thresholds, and using connection proxies like PgBouncer",
        "When the CPU frequency drops due to thermal throttling; mitigated by fan upgrades",
        "When SSL certificates expire on the database host; mitigated by certbot auto-renew"
      ],
      1,
      'INTERMEDIATE',
      2,
      "If queries take too long or code fails to release connections back to the pool, all pooled sockets become occupied. Mitigations include aggressive connection timeouts, query timeouts, and distributed connection multiplexers like PgBouncer."
    ),

    q(
      aIds.webdev,
      `What is the difference between Service Worker caching strategies: 'Cache-First' versus 'Stale-While-Revalidate'?`,
      [
        "Cache-First always verifies with the server before checking disk; Stale-While-Revalidate never uses network",
        "Cache-First serves from cache if available and only falls back to network on a miss; Stale-While-Revalidate serves the cached version immediately for speed, then asynchronously fetches an update to refresh the cache for next time",
        "Stale-While-Revalidate deletes the cache whenever a 404 response is received",
        "There is no difference; both are deprecated in favor of HTTP/3 QUIC caching"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Stale-While-Revalidate prioritizes immediate visual responsiveness (serving cached assets instantly) while guaranteeing background freshness by re-fetching and updating the cache transparently."
    ),

    // ══════════════════════════════════════════════════════════════════════════
    // 3. DATA SCIENCE & ADVANCED ANALYTICS
    // ══════════════════════════════════════════════════════════════════════════
    q(
      aIds.datascience,
      `In high-dimensional feature spaces, what is the 'Curse of Dimensionality' with respect to distance metrics like Euclidean distance?`,
      [
        "Calculated distances grow exponentially to infinity causing integer overflow",
        "The ratio of the distance to the nearest neighbor versus the farthest neighbor approaches 1, making distance-based algorithms (like KNN and K-Means) ineffective",
        "Feature correlation matrices become strictly diagonal with zero variance",
        "Eigenvalues collapse into negative numbers in Hermitian spaces"
      ],
      1,
      'ADVANCED',
      3,
      "As dimensionality increases, the volume of the space grows exponentially, causing data points to become equidistant from each other. The contrast between nearest and farthest neighbors vanishes, degrading distance metrics."
    ),

    q(
      aIds.datascience,
      `When evaluating a binary classifier on an extremely imbalanced dataset (e.g. 99.8% negative, 0.2% positive), why is the Precision-Recall (PR) AUC metric superior to the ROC-AUC metric?`,
      [
        "ROC-AUC cannot be computed when the false positive rate is less than 0.5",
        "ROC-AUC includes True Negatives in the denominator of the False Positive Rate (FP / (FP + TN)), so a large number of TNs dilutes a surge in false positives; PR-AUC focuses strictly on the minority positive class",
        "PR-AUC is mathematically bounded between 0 and 0.5 for imbalanced data",
        "ROC curves require symmetric Gaussian distributions across both classes"
      ],
      1,
      'ADVANCED',
      3,
      "On heavily skewed datasets, a model predicting huge numbers of false positives can still display an impressive ROC-AUC because TN is enormous, keeping FPR small. PR-AUC does not factor in TNs and reveals false positive surges immediately."
    ),

    q(
      aIds.datascience,
      `What is the theoretical distinction between data Missing Completely at Random (MCAR), Missing at Random (MAR), and Missing Not at Random (MNAR)?`,
      [
        "MCAR data cannot be imputed; MAR and MNAR can be safely deleted",
        "MCAR means missingness is independent of both observed and unobserved data; MAR means missingness depends only on observed data; MNAR means missingness depends on the missing value itself",
        "MAR is caused by sensor failures; MNAR is caused by user opt-outs",
        "MCAR requires deep learning imputation while MAR requires mean imputation"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Under MCAR, missingness is completely random. Under MAR, missingness can be fully accounted for by other observed variables. Under MNAR, the probability of missingness depends on the unobserved variable itself (e.g., people with high income refusing to report income)."
    ),

    q(
      aIds.datascience,
      `How does the Variance Inflation Factor (VIF) detect multicollinearity in multiple linear regression, and what value typically indicates severe multicollinearity?`,
      [
        "VIF = 1 / (1 - R_i^2); a VIF exceeding 5 to 10 indicates that the i-th feature is highly collinear with other predictors",
        "VIF measures the p-value of the F-statistic; values below 0.05 indicate multicollinearity",
        "VIF = Mean / Variance; values above 1.0 indicate severe collinearity",
        "VIF calculates Pearson correlation; values between -1 and +1 indicate collinearity"
      ],
      0,
      'INTERMEDIATE',
      2,
      "VIF quantifies how much the variance of an estimated regression coefficient increases when predictors are correlated. VIF = 1 / (1 - R_i^2). A VIF > 5-10 implies severe collinearity inflating standard errors."
    ),

    q(
      aIds.datascience,
      `Why is Bessel's correction ($N-1$ instead of $N$ in the denominator) applied when calculating the sample variance from a random sample?`,
      [
        "To compensate for rounding errors in floating-point arithmetic",
        "Because calculating deviations from the sample mean instead of the true population mean underestimates true variability; dividing by N-1 yields an unbiased estimator",
        "To satisfy the Central Limit Theorem for small sample sizes below 30",
        "Because one degree of freedom is lost due to random seed initialization"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Because the sample mean is itself calculated from the sample, sample points are on average closer to the sample mean than to the true population mean. Dividing by N - 1 corrects this downward bias, producing an unbiased estimator of population variance."
    ),

    q(
      aIds.datascience,
      `What is 'Target Encoding Data Leakage', and how does Out-of-Fold (OOF) target encoding prevent model overfitting?`,
      [
        "When test labels are exposed during feature extraction; prevented by encrypting targets",
        "When a categorical feature is replaced by the mean target value including the current row's own target, creating direct feature-label leakage; OOF computes the mean target strictly on k-1 training folds",
        "When continuous variables are scaled using standard deviation instead of variance",
        "When time-series timestamps are sorted in descending order"
      ],
      1,
      'ADVANCED',
      3,
      "Standard target encoding leaks the target of the sample into its own feature value. Out-of-Fold target encoding ensures that a sample's encoded feature is computed solely from other folds where the sample was not present, preventing catastrophic overfitting."
    ),

    q(
      aIds.datascience,
      `In Principal Component Analysis (PCA), what do the eigenvectors and eigenvalues of the data covariance matrix represent?`,
      [
        "Eigenvectors represent the directions of maximal variance (principal axes); eigenvalues represent the magnitude of variance explained along each corresponding axis",
        "Eigenvectors represent the centroid coordinates; eigenvalues represent the number of clusters",
        "Eigenvectors represent the residual error; eigenvalues represent the regression slopes",
        "Eigenvectors represent categorical features; eigenvalues represent continuous features"
      ],
      0,
      'ADVANCED',
      3,
      "The eigenvectors of the feature covariance matrix define the orthogonal axes of maximal variance, and the corresponding eigenvalues quantify the amount of variance captured along each principal component."
    ),

    q(
      aIds.datascience,
      `What is Simpson's Paradox in statistical analysis?`,
      [
        "When increasing the sample size causes the p-value to increase instead of decrease",
        "A statistical trend that appears in several different groups of data disappears or reverses when the groups are combined",
        "When standard deviations exceed the mean across all subsets",
        "When two independent variables have a correlation coefficient of exactly zero"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Simpson's Paradox occurs when an apparent association between two variables in aggregate data is reversed or erased when the data is disaggregated into subgroups due to a confounding lurking variable."
    ),

    q(
      aIds.datascience,
      `In A/B testing, how are Type I error (alpha) and Type II error (beta) related to the Statistical Power of the test?`,
      [
        "Statistical Power equals 1 - alpha; Type II error is irrelevant",
        "Statistical Power equals 1 - beta (the probability of correctly rejecting the null hypothesis when an actual effect exists); alpha is the significance level (false positive rate)",
        "Statistical Power equals alpha / beta",
        "Type I error is the probability of a false negative; Power equals beta"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Type I error (alpha) is the false positive rate (typically 0.05). Type II error (beta) is the false negative rate (failing to detect an actual effect). Statistical power is defined as 1 - beta (typically 0.80 or 80%)."
    ),

    q(
      aIds.datascience,
      `Why is Time-Series Cross Validation performed using expanding or sliding rolling-windows rather than standard randomized K-Fold?`,
      [
        "Standard K-Fold violates temporal causality, allowing future information to leak into past predictions (look-ahead bias)",
        "Time series data cannot be partitioned into more than 3 folds in scikit-learn",
        "Expanding windows eliminate autocorrelation in white noise processes",
        "Randomized K-Fold causes integer overflow on timestamp indices"
      ],
      0,
      'BEGINNER',
      1,
      "In time-series forecasting, training on future data to predict the past violates the arrow of time and creates look-ahead leakage. Expanding window cross-validation ensures the model only trains on past data to predict future intervals."
    ),

    q(
      aIds.datascience,
      `What is the difference between Gini Impurity and Entropy in decision tree classification?`,
      [
        "Gini impurity is computationally faster because it does not involve computing logarithmic functions (sum of p_i * (1 - p_i)), whereas Entropy uses -sum(p_i * log2(p_i))",
        "Entropy is bounded between 0 and 0.5; Gini impurity is bounded between 0 and 1.0",
        "Gini impurity can only be used for regression trees",
        "There is no mathematical difference; both yield identical decision boundaries on every split"
      ],
      0,
      'INTERMEDIATE',
      2,
      "Gini Impurity (1 - sum(p_i^2)) avoids costly logarithmic calculations required by Shannon Entropy (-sum(p_i * log2(p_i))). While both penalize impure nodes similarly, Gini is computationally cheaper."
    ),

    q(
      aIds.datascience,
      `How does the t-distribution differ from the standard normal (Z) distribution, and when MUST it be used?`,
      [
        "The t-distribution has lighter tails and is used when sample size exceeds 10,000",
        "The t-distribution has heavier (fatter) tails to account for extra uncertainty when the population standard deviation is unknown and sample size is small (N < 30)",
        "The t-distribution is strictly skewed to the right; Z is symmetric",
        "The t-distribution can only be used when degrees of freedom equal zero"
      ],
      1,
      'BEGINNER',
      1,
      "Student's t-distribution has thicker tails than the standard normal curve, reflecting the greater variance expected when estimating both the population mean and variance from a small sample with unknown sigma."
    ),

    // ══════════════════════════════════════════════════════════════════════════
    // 4. MACHINE LEARNING & DEEP LEARNING ARCHITECTURES
    // ══════════════════════════════════════════════════════════════════════════
    q(
      aIds.ml,
      `In the standard Transformer architecture (Vaswani et al.), why does Multi-Head Self-Attention scale quadratically $O(N^2)$ in time and memory with sequence length $N$?`,
      [
        "Because each head computes an independent convolutional kernel",
        "Because computing the attention matrix requires computing dot products between all $N$ queries and all $N$ keys, resulting in an $N \\times N$ attention weight matrix",
        "Because backpropagation through time requires unrolling across $N^2$ timesteps",
        "Because positional encodings require $O(N^2)$ trigonometric operations"
      ],
      1,
      'ADVANCED',
      3,
      "The self-attention mechanism computes Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V. The matrix multiplication Q * K^T produces an N x N matrix representing pairwise attention between every token and every other token, scaling as O(N^2)."
    ),

    q(
      aIds.ml,
      `Why is Layer Normalization (LayerNorm) predominantly used over Batch Normalization (BatchNorm) in Transformer and sequence models?`,
      [
        "BatchNorm requires training with infinite batch sizes to converge",
        "LayerNorm normalizes across the feature dimension independently for each sample, making it invariant to batch size and robust for variable sequence lengths, unlike BatchNorm which depends on batch statistics",
        "LayerNorm eliminates the need for activation functions like GELU or ReLU",
        "BatchNorm cannot be executed on modern tensor cores"
      ],
      1,
      'ADVANCED',
      3,
      "Batch Normalization computes statistics across the mini-batch dimension, which fluctuates wildly with small or variable batch sizes and padding tokens in sequence models. Layer Normalization computes mean and variance across the hidden channel dimension per token independently."
    ),

    q(
      aIds.ml,
      `How do Residual Connections ($y = x + F(x)$) in deep architectures like ResNet mitigate the Vanishing Gradient problem?`,
      [
        "By clamping all gradients to a constant value of 1.0",
        "The shortcut connection provides an uninterrupted highway during backpropagation where the gradient term includes $+ 1$ (d/dx(x + F(x)) = 1 + dF/dx), preventing gradients from vanishing to zero through deep layers",
        "By replacing matrix multiplications with scalar additions",
        "By forcing all layer weights to be orthogonal matrices"
      ],
      1,
      'ADVANCED',
      3,
      "During backpropagation, the gradient of the loss with respect to input x contains a direct addition term (+1): dL/dx = dL/dy * (1 + dF/dx). Even if dF/dx becomes very small, the gradient still flows back unimpeded via the +1 identity path."
    ),

    q(
      aIds.ml,
      `Geometrically, why does L1 (Lasso) regularization induce sparsity in model coefficients whereas L2 (Ridge) regularization only shrinks them toward zero?`,
      [
        "L1 loss has a quadratic gradient that forces weights to zero",
        "The L1 constraint region is a rhomboid/diamond with sharp corners along the coordinate axes where the loss function contours frequently touch an axis, driving coefficients exactly to zero",
        "L2 regularization is mathematically undefined for zero coefficients",
        "L1 regularization restricts the optimizer to binary integer programming"
      ],
      1,
      'ADVANCED',
      3,
      "The L1 norm constraint ||w||_1 <= C forms a diamond shape with corners located exactly on the parameter axes. When the elliptical contours of the objective function intersect the constraint region, they are far more likely to intersect at a corner where one or more weights equal zero."
    ),

    q(
      aIds.ml,
      `How does the Adam (Adaptive Moment Estimation) optimizer combine the principles of Momentum and RMSProp?`,
      [
        "It uses Momentum for the learning rate and RMSProp for the weight decay",
        "It maintains an exponentially decaying average of past gradients (first raw moment / momentum) and an exponentially decaying average of past squared gradients (second uncentered moment / RMSProp), with bias correction for initial steps",
        "It switches dynamically between SGD and L-BFGS based on Hessian curvature",
        "It computes the exact second derivative (Hessian matrix) every 10 epochs"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Adam tracks both the first moment m_t = beta1*m_{t-1} + (1-beta1)*g_t (velocity/direction) and second moment v_t = beta2*v_{t-1} + (1-beta2)*g_t^2 (variance/adaptive scaling), applying bias correction to compensate for zero initialization."
    ),

    q(
      aIds.ml,
      `What is the difference between 'Data Drift' (Covariate Shift) and 'Concept Drift' in machine learning monitoring?`,
      [
        "Data Drift affects the model weights; Concept Drift affects the training hardware",
        "Data Drift is a shift in the distribution of input features P(X) while P(Y|X) remains constant; Concept Drift is a change in the underlying relationship between inputs and targets P(Y|X)",
        "Concept Drift only occurs in unsupervised learning models",
        "Data Drift implies class labels have been renamed"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Covariate Shift (Data Drift) means the input feature distribution P(X) changes over time (e.g. users get younger), but the mapping P(Y|X) is intact. Concept Drift means the real-world relationship changes (e.g. consumer purchasing behavior changes post-pandemic, so the same X maps to different Y)."
    ),

    q(
      aIds.ml,
      `In classification, why is Cross-Entropy Loss preferred over Mean Squared Error (MSE) when training neural networks with Softmax output?`,
      [
        "Cross-Entropy Loss is linear, making computation trivial",
        "MSE combined with Softmax suffers from vanishing gradients when predictions are confidently wrong, because the sigmoid/softmax derivative approaches zero; Cross-Entropy cancels the derivative denominator yielding a linear gradient proportional to error (p - y)",
        "MSE cannot be evaluated on probabilities between 0 and 1",
        "Cross-Entropy enforces orthogonality among class weight vectors"
      ],
      1,
      'ADVANCED',
      3,
      "When using MSE with softmax, if a model outputs a probability close to 0 for the correct class, the gradient of the loss with respect to the pre-activation logits becomes tiny due to softmax's derivative, stalling learning. Cross-entropy loss cancels this out, giving a strong error signal (p_i - y_i)."
    ),

    q(
      aIds.ml,
      `What is the purpose of Quantization-Aware Training (QAT) compared to standard Post-Training Quantization (PTQ) when deploying models to edge devices?`,
      [
        "QAT models the roundoff and truncation errors of lower precision (e.g. INT8) during forward and backward passes, allowing the network to adapt its weights to preserve accuracy",
        "QAT converts all floating point operations into string lookups",
        "PTQ guarantees zero drop in top-1 accuracy without calibration data",
        "QAT eliminates all activation functions in the deployed model"
      ],
      0,
      'ADVANCED',
      3,
      "Post-Training Quantization simply rounds FP32 weights to INT8 after training, which can cause significant accuracy degradation. QAT simulates low-bit precision during training using fake quantization nodes, enabling the model to learn weights resilient to quantization noise."
    ),

    q(
      aIds.ml,
      `What is the primary objective of the InfoNCE contrastive loss function used in Self-Supervised Learning (e.g. SimCLR, CLIP)?`,
      [
        "To maximize the MSE distance between augmented views of the same image",
        "To maximize the cosine similarity between positive pairs (augmented views of the same sample) while minimizing similarity with negative pairs (different samples) scaled by a temperature parameter",
        "To enforce that all latent representations lie inside a unit hypercube",
        "To predict masked token indices using a cross-entropy objective"
      ],
      1,
      'ADVANCED',
      3,
      "InfoNCE treats augmented views of the same instance as positive pairs and other samples in the batch as negative pairs, training the encoder so positive representations pull together while negatives push apart on the unit hypersphere."
    ),

    q(
      aIds.ml,
      `How does the receptive field of a Convolutional Neural Network (CNN) grow when stacking two consecutive $3 \\times 3$ convolutional layers (stride 1) compared to a single $5 \\times 5$ layer?`,
      [
        "Two 3x3 layers have a receptive field of 6x6, which is larger than a 5x5 layer",
        "Two 3x3 layers cover the exact same 5x5 receptive field, but use fewer parameters (2 * 3^2 = 18 vs 5^2 = 25) and introduce two non-linear activation functions",
        "A single 5x5 layer has a receptive field of 9x9 due to kernel dilation",
        "Two 3x3 layers have a smaller receptive field than a single 3x3 layer"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Stacking two 3x3 conv layers results in an effective receptive field of 3 + (3 - 1) = 5x5. This achieves the same spatial coverage as a 5x5 filter while reducing parameters by 28% and adding an extra non-linear activation layer."
    ),

    q(
      aIds.ml,
      `In vector databases, what is the trade-off of using Hierarchical Navigable Small World (HNSW) graphs for Approximate Nearest Neighbor (ANN) search?`,
      [
        "HNSW provides logarithmic O(log N) search speed and high recall, at the expense of higher RAM usage and longer index build times compared to Inverted File Flat (IVFFlat)",
        "HNSW requires exact brute-force pairwise distance computation on every query",
        "HNSW only supports Hamming distance on binary vectors",
        "HNSW compresses vectors using scalar quantization resulting in zero memory footprint"
      ],
      0,
      'ADVANCED',
      3,
      "HNSW constructs a multi-layer graph where upper layers have sparse, long-range links (for fast skip-list style traversal) and bottom layers have dense local links. It yields exceptional search latency and recall, but consumes significant memory to store graph connectivity."
    ),

    q(
      aIds.ml,
      `How can you diagnose that a deep neural network is suffering from 'Severe Overfitting' by observing training and validation loss curves?`,
      [
        "Both training loss and validation loss plateau at high values without decreasing",
        "Training loss continues to steadily decrease toward zero while validation loss begins to diverge and climb upward after a certain epoch",
        "Validation loss is consistently lower than training loss across all epochs",
        "The learning rate decays to zero during the first epoch"
      ],
      1,
      'BEGINNER',
      1,
      "Overfitting is characterized by the model memorizing the training set (training loss approaches zero), while its ability to generalize to unseen data deteriorates (validation loss bottoms out and begins increasing)."
    ),

    // ══════════════════════════════════════════════════════════════════════════
    // 5. PROBLEM SOLVING & ADVANCED DATA STRUCTURES & ALGORITHMS
    // ══════════════════════════════════════════════════════════════════════════
    q(
      aIds.problemsolving,
      `What is the amortized time complexity of inserting $N$ elements into a dynamic array that doubles its capacity ($2 \\times$) whenever full, and why?`,
      [
        "O(N) per insertion because elements are constantly copied",
        "O(1) amortized per insertion; although occasional resizing takes O(K) time, copying costs sum to a geometric series (1 + 2 + 4 + ... + N = 2N - 1), distributing to O(1) per insert",
        "O(log N) per insertion due to binary tree allocation",
        "O(N^2) amortized due to memory fragmentation"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Using the aggregate method of amortized analysis, resizing costs occur at powers of 2 (1, 2, 4, 8, ..., N). The total number of element copies is sum_{i=0}^{log N} 2^i < 2N. Dividing by N insertions yields an amortized cost of O(1) per insertion."
    ),

    q(
      aIds.problemsolving,
      `Why does Dijkstra's algorithm fail to find the shortest path on graphs with negative edge weights, and which algorithm should be used instead?`,
      [
        "Dijkstra causes infinite recursion on directed acyclic graphs; use Prim's algorithm",
        "Dijkstra greedily assumes that once a vertex is extracted from the priority queue, its shortest distance is finalized; a negative edge discovered later can invalidate this assumption. Use Bellman-Ford (or SPFA) instead",
        "Dijkstra only works on complete bipartite graphs; use Floyd-Warshall",
        "Dijkstra fails because binary heaps cannot store negative keys"
      ],
      1,
      'ADVANCED',
      3,
      "Dijkstra relies on the greedy property that adding a non-negative edge will never decrease the path length to an already visited vertex. Negative edges violate this monotonic property. Bellman-Ford relaxes all edges V-1 times, correctly handling negative edges and detecting negative cycles."
    ),

    q(
      aIds.problemsolving,
      `What is the nearly-constant amortized time complexity of Disjoint Set Union (DSU / Union-Find) operations when both 'Union by Rank' and 'Path Compression' are implemented?`,
      [
        "O(log N)",
        "O(alpha(N)), where alpha is the Inverse Ackermann function which is strictly <= 4 for all practical universe sizes",
        "O(1) absolute worst-case",
        "O(sqrt(N))"
      ],
      1,
      'ADVANCED',
      3,
      "Combining path compression (flattens tree during find) with union by rank (attaches shorter tree under root of deeper tree) guarantees an amortized time of O(alpha(N)) per operation, where alpha(N) is the inverse Ackermann function, effectively constant (<= 4) for N up to 10^80."
    ),

    q(
      aIds.problemsolving,
      `How does the 'Monotonic Stack' pattern find the Next Greater Element for all elements in an array in $O(N)$ linear time?`,
      [
        "By sorting the array using quicksort and performing binary search for each element",
        "By maintaining indices of elements in decreasing order on the stack; when encountering an element greater than stack top, it pops the top and records the current element as its answer, ensuring each index is pushed and popped at most once",
        "By creating a two-dimensional lookup matrix of size N x N",
        "By recursively partitioning the array around the median"
      ],
      1,
      'ADVANCED',
      3,
      "A monotonic decreasing stack holds elements waiting for a greater successor. When a larger element arrives, it resolves all smaller elements on top of the stack. Since every element enters and leaves the stack at most once, the aggregate complexity is strictly O(N)."
    ),

    q(
      aIds.problemsolving,
      `In Floyd's Cycle-Finding Algorithm (Tortoise and Hare), if the distance from the head to the cycle entrance is $L$, and the slow and fast pointers meet at distance $k$ from the cycle entrance, why do pointers moving at speed 1 from head and meeting point intersect at the cycle entrance?`,
      [
        "Because the length of the cycle is always an even power of 2",
        "Because the distance traveled by fast is 2 * slow, yielding 2(L + k) = L + k + nC, which simplifies to L = nC - k; thus moving L steps from the meeting point completes n full loops minus k, landing exactly at the cycle entrance",
        "Because the fast pointer reverses direction upon reaching the tail",
        "Because cycle detection requires hashing memory addresses into a bucket array"
      ],
      1,
      'ADVANCED',
      3,
      "Mathematical proof: Fast travels twice as far as slow: 2(L + k) = L + k + nC => L + k = nC => L = nC - k. Starting one pointer at the list head (distance L to entrance) and one at the meeting point (k inside the cycle) causes them to meet exactly at the cycle entrance after L steps."
    ),

    q(
      aIds.problemsolving,
      `What is the optimal time complexity of finding the Longest Increasing Subsequence (LIS) of an array of $N$ integers?`,
      [
        "O(N^2) using standard bottom-up dynamic programming",
        "O(N log N) using patience sorting with binary search (bisect) over a tail array",
        "O(N) using a single-pass hash map",
        "O(2^N) using brute-force recursion"
      ],
      1,
      'INTERMEDIATE',
      2,
      "While classic DP is O(N^2), maintaining an array 'tails' where tails[i] stores the smallest tail of all increasing subsequences of length i+1 allows binary search (bisect_left) in O(log N) for each of the N numbers, giving O(N log N) total time."
    ),

    q(
      aIds.problemsolving,
      `What is the fundamental difference between an AVL Tree and a Red-Black Tree in terms of balance strictness and practical usage?`,
      [
        "AVL trees are strictly balanced (|h_left - h_right| <= 1), making lookups faster but insertions/deletions require more rotations; Red-Black trees are more loosely balanced (path length at most 2x shortest), making writes faster (used in C++ std::map and Linux CFS)",
        "Red-Black trees require 3 children per node; AVL trees require binary nodes",
        "AVL trees do not support in-order traversals in O(N) time",
        "Red-Black trees have O(N) worst-case lookup time"
      ],
      0,
      'ADVANCED',
      3,
      "AVL trees enforce strict height balance (|balance factor| <= 1), providing optimal lookup speed. Red-Black trees allow paths to differ in length by up to a factor of 2 (max height <= 2*log2(N+1)), requiring fewer rotations on write operations, making them the standard in system libraries."
    ),

    q(
      aIds.problemsolving,
      `How does Kahn's Algorithm detect whether a directed graph contains a cycle during Topological Sorting?`,
      [
        "It checks if any node has an out-degree equal to zero",
        "It initializes a queue with all nodes having in-degree 0; if the count of visited nodes processed from the queue is strictly less than the total number of nodes, a cycle exists",
        "It runs Dijkstra from node 0 and verifies that all edge weights are positive",
        "It computes the determinant of the adjacency matrix"
      ],
      1,
      'INTERMEDIATE',
      2,
      "In a directed graph, nodes participating in a cycle never reach an in-degree of zero because each node in the cycle has an incoming edge from another node in the cycle. Therefore, they are never added to the queue, and visited count < V."
    ),

    q(
      aIds.problemsolving,
      `What is the difference in capabilities between a Segment Tree and a Fenwick Tree (Binary Indexed Tree)?`,
      [
        "Fenwick Trees support non-invertible range operations (like range min/max) just as easily as range sum",
        "Fenwick Trees are simpler to implement and use less memory (O(N) array with low constant factor) but primarily support invertible associative operations (like prefix sums); Segment Trees consume O(4N) memory but natively support arbitrary range queries (Range Minimum Query, GCD) and lazy propagation",
        "Segment Trees can only handle static arrays without point updates",
        "Fenwick Trees require O(N^2) preprocessing time"
      ],
      1,
      'ADVANCED',
      3,
      "A Fenwick tree stores cumulative sums using bit manipulation (i & (-i)), using minimal memory and code, but struggles with non-invertible operations. A Segment tree can store any associative range operation (min, max, sum, GCD) and supports lazy propagation for range updates."
    ),

    q(
      aIds.problemsolving,
      `What is the average versus worst-case time complexity of Quickselect (Hoare's selection algorithm) for finding the $k$-th smallest element in an unsorted array?`,
      [
        "Average O(N), Worst-case O(N^2) if poor pivots are chosen (mitigated to worst-case O(N) using Median-of-Medians)",
        "Average O(N log N), Worst-case O(N^2)",
        "Average O(log N), Worst-case O(N)",
        "Average O(N), Worst-case O(N log N)"
      ],
      0,
      'INTERMEDIATE',
      2,
      "Quickselect partitions the array around a pivot like Quicksort, but only recurses into the partition containing index k: N + N/2 + N/4 + ... = 2N = O(N) average time. If pivots are consistently unbalanced (e.g. sorted array with first element pivot), worst case is O(N^2)."
    ),

    q(
      aIds.problemsolving,
      `Why is counting sort able to sort $N$ integers in $O(N + K)$ time, violating the theoretical comparison-based lower bound of $\\Omega(N \\log N)$?`,
      [
        "Because it utilizes multi-core SIMD instructions to compare elements in parallel",
        "Because it is not a comparison-based sort; it uses array indexing directly based on integer key values within range K",
        "Because it approximates the sorted order within an epsilon tolerance",
        "Because it only works when N equals K"
      ],
      1,
      'BEGINNER',
      1,
      "The Omega(N log N) lower bound proven by decision trees applies strictly to comparison-based sorting algorithms. Counting sort operates by treating values directly as memory indices, bypassing pairwise element comparisons."
    ),

    q(
      aIds.problemsolving,
      `In Dynamic Programming, what two fundamental properties MUST a problem exhibit for DP to be an applicable solution?`,
      [
        "Linear independence and Markov property",
        "Optimal Substructure (optimal solution contains optimal solutions to subproblems) and Overlapping Subproblems (subproblems are computed repeatedly)",
        "Convexity and monotonicity",
        "Symmetric distance metric and triangle inequality"
      ],
      1,
      'BEGINNER',
      1,
      "Dynamic programming is applicable when the overall problem exhibits optimal substructure (can be constructed from optimal subproblems) and overlapping subproblems (the recursive tree visits the exact same states multiple times, benefiting from memoization or tabulation)."
    ),

    // ══════════════════════════════════════════════════════════════════════════
    // 6. CODING CHALLENGE – PYTHON CODE ANALYSIS & DEBUGGING
    // ══════════════════════════════════════════════════════════════════════════
    q(
      aIds.coding_python,
      `What will be printed when running this Python code?
\`\`\`python
a = [1, 2, [3, 4]]
b = list(a)
b[2].append(5)
b[0] = 99
print(a)
\`\`\``,
      ["[1, 2, [3, 4]]", "[1, 2, [3, 4, 5]]", "[99, 2, [3, 4, 5]]", "[99, 2, [3, 4]]"],
      1,
      'INTERMEDIATE',
      2,
      "list(a) creates a shallow copy. Modifying a primitive at index 0 (b[0] = 99) affects only b. But nested objects (b[2]) share the same memory reference, so b[2].append(5) mutates the inner list in 'a' as well."
    ),

    q(
      aIds.coding_python,
      `What is the output of the following Python snippet?
\`\`\`python
def func(x, items=[]):
    items.append(x)
    return items

print(func(1))
print(func(2, []))
print(func(3))
\`\`\``,
      ["[1], [2], [3]", "[1], [2], [1, 3]", "[1], [2], [1, 2, 3]", "[1], [1, 2], [1, 2, 3]"],
      1,
      'INTERMEDIATE',
      2,
      "The first call func(1) mutates the default list to [1]. The second call passes an explicit empty list [], returning [2]. The third call uses the default list again, appending 3 to [1] to yield [1, 3]."
    ),

    q(
      aIds.coding_python,
      `What error occurs when executing this function, and why?
\`\`\`python
count = 10
def increment():
    count += 1
    return count

increment()
\`\`\``,
      [
        "SyntaxError: cannot modify global variables inside functions",
        "UnboundLocalError: local variable 'count' referenced before assignment",
        "TypeError: unsupported operand type for +=",
        "It successfully returns 11"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Because 'count' is assigned to on the left side of +=, Python marks it as a local variable for the entire scope of increment(). When reading it on the right side before any assignment has completed, it raises UnboundLocalError."
    ),

    q(
      aIds.coding_python,
      `What is printed by this code testing integer caching in CPython?
\`\`\`python
x = 256
y = 256
print(x is y)

p = 257
q = 257
print(p is q)
\`\`\` *(when run in interactive REPL / separate lines)*`,
      [
        "True and then True",
        "True and then False",
        "False and then False",
        "False and then True"
      ],
      1,
      'INTERMEDIATE',
      2,
      "CPython pre-allocates and caches small integer objects in the range [-5, 256]. Thus, 256 is always the exact same object in memory (x is y is True). Integers >= 257 allocated on separate lines create distinct objects (p is q is False)."
    ),

    q(
      aIds.coding_python,
      `What happens when executing this tuple modification?
\`\`\`python
t = (1, 2, [30, 40])
try:
    t[2] += [50, 60]
except Exception as e:
    print(type(e).__name__)
print(t)
\`\`\``,
      [
        "TypeError, and t is (1, 2, [30, 40])",
        "TypeError, but t is modified to (1, 2, [30, 40, 50, 60])",
        "No error, t is (1, 2, [30, 40, 50, 60])",
        "ValueError, and t is unchanged"
      ],
      1,
      'ADVANCED',
      3,
      "The += operator on lists calls __iadd__, which extends the list in-place successfully. Then, the assignment step tries to write the result back into t[2], which raises TypeError because tuples are immutable. The inner list was already mutated before the assignment failed!"
    ),

    q(
      aIds.coding_python,
      `What does this generator delegation yield?
\`\`\`python
def sub_gen():
    yield 'A'
    return 'DONE'

def main_gen():
    res = yield from sub_gen()
    yield res

print(list(main_gen()))
\`\`\``,
      ["['A']", "['A', 'DONE']", "['DONE']", "['A', None]"],
      1,
      'ADVANCED',
      3,
      "In Python, 'yield from' yields all items produced by the subgenerator ('A'). When the subgenerator terminates via 'return val', the return value becomes the result of the 'yield from' expression, which is then yielded as 'DONE'."
    ),

    // ══════════════════════════════════════════════════════════════════════════
    // 7. CODING CHALLENGE – MULTI-LANGUAGE & SYSTEMS (TypeScript, C++, Java, Go)
    // ══════════════════════════════════════════════════════════════════════════
    q(
      aIds.coding_multi,
      `[TypeScript] What does the following conditional type evaluate to?
\`\`\`typescript
type Flatten<T> = T extends (infer U)[] ? U : T;
type Result = Flatten<string[]>;
\`\`\``,
      ["string[]", "string", "Array<string>", "unknown"],
      1,
      'INTERMEDIATE',
      2,
      "The 'infer U' keyword inside conditional types allows TypeScript to deduce the element type of an array. Since string[] extends (infer U)[], U is inferred as string."
    ),

    q(
      aIds.coding_multi,
      `[C++] What is the key advantage of Move Semantics (\`std::move\`) introduced in C++11?
\`\`\`cpp
std::vector<std::string> v1 = {"alpha", "beta", "gamma"};
std::vector<std::string> v2 = std::move(v1);
\`\`\``,
      [
        "It performs a deep copy of all string buffers on a background thread",
        "It transfers ownership of the underlying heap pointer from v1 to v2 in O(1) time without allocating new memory or copying elements, leaving v1 in a valid but unspecified state",
        "It forces v2 to be allocated on the call stack instead of heap",
        "It converts dynamic vectors into fixed-size compile-time arrays"
      ],
      1,
      'ADVANCED',
      3,
      "std::move casts an lvalue to an rvalue reference, triggering the vector's move constructor. Rather than copying all elements from v1 to v2 in O(N) time, v2 simply steals v1's internal pointer, taking O(1) time."
    ),

    q(
      aIds.coding_multi,
      `[Java] What guarantee does the \`volatile\` keyword provide for shared variables across threads?
\`\`\`java
private volatile boolean running = true;
\`\`\``,
      [
        "It guarantees atomic increment operations like running++",
        "It guarantees visibility (writes by one thread are immediately flushed to main memory and visible to all other threads) and prevents instruction reordering by the JIT compiler, but does NOT provide mutual exclusion/atomicity",
        "It locks the variable using an internal reentrant monitor",
        "It prevents deadlocks across synchronized blocks"
      ],
      1,
      'INTERMEDIATE',
      2,
      "The volatile keyword ensures memory visibility across CPU caches and memory barriers, guaranteeing that any read gets the most recent write. It does not replace synchronized blocks or AtomicInteger for compound operations."
    ),

    q(
      aIds.coding_multi,
      `[Go] How does Go's \`context.Context\` prevent goroutine leaks when handling incoming HTTP requests?
\`\`\`go
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()
go doWork(ctx)
\`\`\``,
      [
        "It kills the OS process if memory consumption exceeds 1GB",
        "When the timeout expires or the client disconnects, the Done() channel closes, signaling child goroutines to cleanly abort and release memory",
        "It automatically garbage collects the goroutine call stack immediately",
        "It converts blocked network calls into asynchronous select statements"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Goroutines listening on <-ctx.Done() can gracefully detect when parent operations cancel or timeout, terminating execution and preventing background goroutines from running indefinitely in memory."
    ),

    // ══════════════════════════════════════════════════════════════════════════
    // 8. PROFESSIONAL COMMUNICATION, SOFT SKILLS & ENGINEERING LEADERSHIP
    // ══════════════════════════════════════════════════════════════════════════
    q(
      aIds.communication,
      `In modern software engineering organizations, what is the primary purpose of writing an RFC (Request for Comments) technical design document before writing code?`,
      [
        "To satisfy legal compliance for patents",
        "To build cross-functional consensus, evaluate architectural trade-offs, identify edge cases, and align teams on API contracts and security implications before investing implementation effort",
        "To assign individual lines of code to junior engineers",
        "To replace unit testing and automated QA pipelines"
      ],
      1,
      'INTERMEDIATE',
      2,
      "RFCs facilitate asynchronous engineering critique, surfacing architectural flaws, scalability constraints, and cross-team dependencies early in the design phase when changes are virtually free."
    ),

    q(
      aIds.communication,
      `What is the foundational principle of an industry-standard 'Blameless Postmortem' following a Tier-1 production outage?`,
      [
        "Identifying which developer pushed the faulty commit and assigning a formal reprimand",
        "Assuming that human errors are symptoms of deeper systemic vulnerabilities; focusing on root architectural flaws, monitoring blind spots, and automated guardrails to prevent future recurrence",
        "Keeping all outage details strictly confidential from customers and leadership",
        "Reverting the entire production codebase to the previous major release"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Blameless postmortems operate on the assumption that engineers make mistakes when systems allow those mistakes to affect production. Fixing systemic guardrails, automated test gates, and rollout canaries prevents recurrence without fostering fear."
    ),

    q(
      aIds.communication,
      `When two engineering teams have conflicting requirements on a shared microservice API contract, what is the most constructive resolution strategy?`,
      [
        "The team that writes the service forces their schema unilaterally without feedback",
        "Create an RFC document comparing both schemas against latency, payload size, backward compatibility, and consumer needs; convene a time-boxed technical review to align on a versioned schema (e.g. /v2)",
        "Escalate immediately to the VP of Engineering without discussing technical trade-offs",
        "Duplicate the microservice entirely so each team has their own private copy"
      ],
      1,
      'INTERMEDIATE',
      2,
      "Constructive engineering collaboration involves documenting technical trade-offs objectively, prioritizing backward compatibility and consumer ergonomics, and using API versioning to avoid blocking either team."
    ),

    q(
      aIds.communication,
      `During asynchronous pull request (code review) discussions, what is the most effective approach to giving actionable feedback?`,
      [
        "Vaguely remarking 'this looks messy' without suggesting alternatives",
        "Clearly differentiating between blocking concerns (correctness, security, performance) with code suggestions versus non-blocking suggestions (prefixing with 'Nit:'), while acknowledging good design choices",
        "Rejecting PRs immediately if variable naming doesn't match personal preferences",
        "Approving all PRs without reading to unblock teammates faster"
      ],
      1,
      'BEGINNER',
      1,
      "High-performing teams clearly distinguish between blocking bugs or architectural regressions and optional improvements (using conventional labels like 'Nit:'), providing code snippets and rationale to foster psychological safety."
    )
  ];
}

// ── CODING ARENA CHALLENGES ──────────────────────────────────────────────────

export interface SeedCodingChallenge {
  id: string;
  title: string;
  language: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  description: string;
  starter_code: string;
  test_cases: string;
}

export function getSeedCodingChallenges(): SeedCodingChallenge[] {
  return [
    {
      id: 'cs-two-sum',
      title: 'Two Sum & Target Pair Detection',
      language: 'python',
      difficulty: 'EASY',
      category: 'Data Structures & Hash Maps',
      description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

### Constraints:
- $2 \\le nums.length \\le 10^4$
- $-10^9 \\le nums[i] \\le 10^9$
- Exactly one valid solution exists.
- **Expected Time Complexity:** $O(N)$ using a hash table instead of $O(N^2)$ brute force.
- **Expected Space Complexity:** $O(N)$.`,
      starter_code: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Write your solution here
    # Hint: Use a dictionary to store seen values and their indices
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []
`,
      test_cases: JSON.stringify([
        { input: '[2, 7, 11, 15], target = 9', expected: '[0, 1]', hidden: false },
        { input: '[3, 2, 4], target = 6', expected: '[1, 2]', hidden: false },
        { input: '[3, 3], target = 6', expected: '[0, 1]', hidden: true },
        { input: '[-1, -2, -3, -4, -5], target = -8', expected: '[2, 4]', hidden: true }
      ])
    },
    {
      id: 'cs-lru-cache',
      title: 'LRU Cache Eviction Policy Design',
      language: 'python',
      difficulty: 'HARD',
      category: 'Systems & Memory Architecture',
      description: `Design a data structure that adheres to the **Least Recently Used (LRU)** cache eviction policy.

Implement the \`LRUCache\` class:
- \`__init__(capacity: int)\`: Initialize the LRU cache with positive size capacity.
- \`get(key: int) -> int\`: Return the value of the key if it exists, otherwise return \`-1\`.
- \`put(key: int, value: int) -> None\`: Update the value of the key if it exists. Otherwise, add the key-value pair. If keys exceed capacity, evict the least recently used key.

### Requirements:
- Both \`get\` and \`put\` must execute in strictly **$O(1)$ average time complexity** using a Hash Map + Doubly Linked List.`,
      starter_code: `class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add(self, node):
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._add(node)
            return node.val
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self._add(node)
        self.cache[key] = node
        if len(self.cache) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]
`,
      test_cases: JSON.stringify([
        { input: 'put(1, 1), put(2, 2), get(1)', expected: '1', hidden: false },
        { input: 'put(3, 3) [evicts 2], get(2)', expected: '-1', hidden: false },
        { input: 'put(4, 4) [evicts 1], get(1), get(3), get(4)', expected: '[-1, 3, 4]', hidden: true },
        { input: 'capacity=1, put(2, 1), get(2), put(3, 2), get(2), get(3)', expected: '[1, -1, 2]', hidden: true }
      ])
    },
    {
      id: 'cs-valid-parentheses',
      title: 'Valid Parentheses & Syntax Validator',
      language: 'javascript',
      difficulty: 'EASY',
      category: 'Compilers & Stacks',
      description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is syntactically valid.

### Rules:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### Complexity:
- **Expected Time:** $O(N)$
- **Expected Space:** $O(N)$ auxiliary stack memory.`,
      starter_code: `function isValid(s) {
  // Implement stack-based balance validator
  const stack = [];
  const pairs = { ')': '(', '}': '{', ']': '[' };

  for (const ch of s) {
    if (ch === '(' || ch === '{' || ch === '[') {
      stack.push(ch);
    } else if (pairs[ch]) {
      if (stack.pop() !== pairs[ch]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}
`,
      test_cases: JSON.stringify([
        { input: 's = "()[]{}"', expected: 'true', hidden: false },
        { input: 's = "(]"', expected: 'false', hidden: false },
        { input: 's = "{[()]}"', expected: 'true', hidden: true },
        { input: 's = "((("', expected: 'false', hidden: true }
      ])
    },
    {
      id: 'cs-merge-intervals',
      title: 'Merge Overlapping Intervals',
      language: 'python',
      difficulty: 'MEDIUM',
      category: 'Algorithms & Greedy Scheduling',
      description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all intervals in the input.

### Example:
- **Input:** \`[[1,3],[2,6],[8,10],[15,18]]\`
- **Output:** \`[[1,6],[8,10],[15,18]]\`

### Constraints:
- $1 \\le intervals.length \\le 10^4$
- **Expected Time:** $O(N \\log N)$ (sorting dominance)
- **Expected Space:** $O(N)$`,
      starter_code: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    if not intervals:
        return []
    # Sort intervals by starting boundary
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for current in intervals[1:]:
        prev = merged[-1]
        if current[0] <= prev[1]:
            prev[1] = max(prev[1], current[1])
        else:
            merged.append(current)
    return merged
`,
      test_cases: JSON.stringify([
        { input: '[[1,3],[2,6],[8,10],[15,18]]', expected: '[[1,6],[8,10],[15,18]]', hidden: false },
        { input: '[[1,4],[4,5]]', expected: '[[1,5]]', hidden: false },
        { input: '[[1,4],[0,4]]', expected: '[[0,4]]', hidden: true },
        { input: '[[1,4],[2,3]]', expected: '[[1,4]]', hidden: true }
      ])
    },
    {
      id: 'cs-rate-limiter',
      title: 'Token Bucket Rate Limiter Algorithm',
      language: 'javascript',
      difficulty: 'MEDIUM',
      category: 'Distributed Systems & Concurrency',
      description: `Implement an asynchronous-ready \`TokenBucket\` rate limiter that smooths burst API traffic.

### Class API:
- \`constructor(capacity, refillRate)\`: Initializes the bucket with max capacity and refill rate in tokens per second.
- \`consume(tokensRequired = 1)\`: Consumes tokens if available and returns \`true\`; otherwise returns \`false\` without negative token debt.`,
      starter_code: `class TokenBucket {
  constructor(capacity = 10, refillRate = 2) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate; // tokens added per second
    this.lastRefill = Date.now();
  }

  consume(tokensRequired = 1) {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;

    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return true;
    }
    return false;
  }
}
`,
      test_cases: JSON.stringify([
        { input: 'capacity=10, consume(5)', expected: 'true', hidden: false },
        { input: 'remaining=5, consume(6)', expected: 'false', hidden: false },
        { input: 'consume(1) with 5 tokens', expected: 'true', hidden: true },
        { input: 'refill after 2.5s -> consume(5)', expected: 'true', hidden: true }
      ])
    },
    {
      id: 'cs-graph-cycle',
      title: 'Graph Dependency Cycle Detection (Kahn\'s Algorithm)',
      language: 'python',
      difficulty: 'HARD',
      category: 'Graphs & Topological Sort',
      description: `There are a total of \`numCourses\` courses to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [ai, bi]\` indicates that course \`bi\` must be taken before course \`ai\`.

Return \`True\` if you can finish all courses (i.e. graph has no directed cycles), otherwise return \`False\`.

### Approach:
Implement **Kahn's Algorithm** (in-degree BFS) or 3-color DFS to detect cycles in $O(V + E)$ time.`,
      starter_code: `from collections import deque, defaultdict

def can_finish(numCourses: int, prerequisites: list[list[int]]) -> bool:
    in_degree = [0] * numCourses
    adj = defaultdict(list)
    for dest, src in prerequisites:
        adj[src].append(dest)
        in_degree[dest] += 1

    queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
    visited = 0
    while queue:
        node = queue.popleft()
        visited += 1
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    return visited == numCourses
`,
      test_cases: JSON.stringify([
        { input: '2, [[1, 0]]', expected: 'true', hidden: false },
        { input: '2, [[1, 0], [0, 1]]', expected: 'false', hidden: false },
        { input: '4, [[1, 0], [2, 0], [3, 1], [3, 2]]', expected: 'true', hidden: true },
        { input: '3, [[0, 1], [1, 2], [2, 0]]', expected: 'false', hidden: true }
      ])
    },
    {
      id: 'cs-longest-palindromic-substring',
      title: 'Longest Palindromic Substring',
      language: 'python',
      difficulty: 'MEDIUM',
      category: 'Dynamic Programming & Strings',
      description: `Given a string \`s\`, return the longest palindromic substring in \`s\`.

### Example:
- **Input:** \`s = "babad"\`
- **Output:** \`"bab"\` (or \`"aba"\`)

### Constraints:
- $1 \\le s.length \\le 1000$
- Optimal approach: Expand around center in $O(N^2)$ time with $O(1)$ auxiliary space.`,
      starter_code: `def longest_palindrome(s: str) -> str:
    if not s:
        return ""
    start, end = 0, 0
    def expand(left: int, right: int) -> int:
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return right - left - 1

    for i in range(len(s)):
        len1 = expand(i, i)
        len2 = expand(i, i + 1)
        max_len = max(len1, len2)
        if max_len > end - start:
            start = i - (max_len - 1) // 2
            end = i + max_len // 2
    return s[start:end + 1]
`,
      test_cases: JSON.stringify([
        { input: 's = "babad"', expected: '"bab" or "aba"', hidden: false },
        { input: 's = "cbbd"', expected: '"bb"', hidden: false },
        { input: 's = "a"', expected: '"a"', hidden: true },
        { input: 's = "racecar"', expected: '"racecar"', hidden: true }
      ])
    },
    {
      id: 'cs-debounce',
      title: 'High-Performance Debounce & Burst Shield',
      language: 'javascript',
      difficulty: 'MEDIUM',
      category: 'Frontend & Full Stack Architecture',
      description: `Implement a higher-order function \`debounce(func, wait)\` that delays invoking \`func\` until after \`wait\` milliseconds have elapsed since the last time the debounced function was invoked.

### Requirements:
- Preserves context (\`this\`) and arguments.
- Cancels previous pending timer when called before wait expires.`,
      starter_code: `function debounce(func, wait) {
  let timeoutId = null;
  return function(...args) {
    const context = this;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}
`,
      test_cases: JSON.stringify([
        { input: 'debounce(fn, 100), 5 calls in 50ms', expected: '1 invocation after 100ms', hidden: false },
        { input: 'debounce(fn, 50), 2 calls spaced by 100ms', expected: '2 invocations', hidden: false },
        { input: 'argument preservation across invocations', expected: 'passed', hidden: true }
      ])
    }
  ];
}

// ── INITIAL STUDENT BADGES ───────────────────────────────────────────────────

export interface SeedBadge {
  id: string;
  user_id: string;
  badge_id: string;
  badge_name: string;
  badge_category: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD';
  score: number;
  assessment_title: string;
  verification_hash: string;
  ledger_block_id: string;
  issuer: string;
}

export function getSeedBadges(sIds: string[]): SeedBadge[] {
  const aaravId = sIds[0];
  const anjaliId = sIds[1];

  return [
    {
      id: 'badge-1',
      user_id: aaravId,
      badge_id: 'badge-dsa-master',
      badge_name: 'Algorithmic Virtuoso & DSA Specialist',
      badge_category: 'Problem Solving',
      tier: 'GOLD',
      score: 96,
      assessment_title: 'Problem Solving & Algorithms',
      verification_hash: '0x8f7c9e12a4b56d78e901f23456789abcdef0123456789abcdef0123456789abc',
      ledger_block_id: 'BLK-7492',
      issuer: 'SkillSetu National Accreditation Council (AICTE/NCVET)'
    },
    {
      id: 'badge-2',
      user_id: aaravId,
      badge_id: 'badge-fullstack-maestro',
      badge_name: 'Full-Stack Systems & Distributed Architect',
      badge_category: 'Web Development',
      tier: 'GOLD',
      score: 92,
      assessment_title: 'Web Development Fundamentals',
      verification_hash: '0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
      ledger_block_id: 'BLK-8104',
      issuer: 'SkillSetu National Accreditation Council (AICTE/NCVET)'
    },
    {
      id: 'badge-3',
      user_id: aaravId,
      badge_id: 'badge-python-engineer',
      badge_name: 'Python Enterprise Systems Engineer',
      badge_category: 'Programming',
      tier: 'SILVER',
      score: 88,
      assessment_title: 'Python Programming',
      verification_hash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
      ledger_block_id: 'BLK-9331',
      issuer: 'SkillSetu National Accreditation Council (AICTE/NCVET)'
    },
    {
      id: 'badge-4',
      user_id: anjaliId,
      badge_id: 'badge-dsa-master',
      badge_name: 'Algorithmic Virtuoso & DSA Specialist',
      badge_category: 'Problem Solving',
      tier: 'SILVER',
      score: 85,
      assessment_title: 'Problem Solving & Algorithms',
      verification_hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
      ledger_block_id: 'BLK-6211',
      issuer: 'SkillSetu National Accreditation Council (AICTE/NCVET)'
    }
  ];
}
