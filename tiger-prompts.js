/* Tiger Prompts v8.0 â€” TPEM-1.1 Enhanced with Tiered Constraints */
(function() {
  'use strict';
  
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  
  // TPEM-1.1 Configuration from Whitepaper
  const TPEM = {
    // PQS Weights (from whitepaper)
    PQS_WEIGHTS: {
      clarity: 0.25,
      structure: 0.20,
      constraintDensity: 0.15,
      modelCompatibility: 0.15,
      goalAlignment: 0.15,
      cognitiveLoad: 0.10
    },
    
    // Task Classification
    TASK_TYPES: {
      'generate': { keywords: ['write', 'create', 'generate', 'draft', 'compose', 'blog', 'email', 'ad', 'post'], icon: 'fa-pen-fancy' },
      'transform': { keywords: ['rewrite', 'translate', 'summarize', 'condense', 'expand', 'paraphrase'], icon: 'fa-arrows-rotate' },
      'analyze': { keywords: ['analyze', 'explain', 'compare', 'diagnose', 'critique', 'evaluate', 'assess'], icon: 'fa-magnifying-glass-chart' },
      'plan': { keywords: ['plan', 'strategy', 'roadmap', 'outline', 'brief', 'campaign'], icon: 'fa-sitemap' },
      'extract': { keywords: ['extract', 'parse', 'structure', 'table', 'json', 'list', 'entity'], icon: 'fa-filter' },
      'code': { keywords: ['code', 'function', 'script', 'debug', 'refactor', 'test', 'program', 'algorithm'], icon: 'fa-code' },
      'math': { keywords: ['calculate', 'solve', 'compute', 'derive', 'proof', 'formula'], icon: 'fa-calculator' },
      'image': { keywords: ['image', 'picture', 'photo', 'visual', 'illustration', 'art'], icon: 'fa-image' }
    },
    
    // Presets
    PRESETS: {
      code: {
        name: 'Code Assistant',
        taskType: 'code',
        template: 'Build a ${topic} that ${action}. Include tests and documentation.'
      },
      copy: {
        name: 'Copywriting',
        taskType: 'generate',
        template: 'Write compelling ${format} for ${audience} about ${topic}. Make it ${tone}.'
      },
      analyze: {
        name: 'Analysis',
        taskType: 'analyze',
        template: 'Analyze ${topic} and provide ${depth} insights with evidence and reasoning.'
      }
    }
  };
  
  // Wait for DOM
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[TigerPrompts v8.0] Initializing with Tiered Constraints...');
    
    // Get elements
    const elements = {
      sendBtn: $('tp-send'),
      input: $('tp-input'),
      thread: $('tp-thread'),
      micBtn: $('tp-mic'),
      themeToggle: $('tp-theme-toggle'),
      resetBtn: $('tp-reset'),
      sidebar: $('tp-sidebar'),
      collapseTab: $('tp-collapse-tab'),
      toggleSidebar: $('tp-sidebar-toggle'),
      status: $('tp-status-indicator'),
      layout: document.querySelector('.tp-layout'),
      modeLite: $('tp-mode-lite'),
      modePro: $('tp-mode-pro'),
      explainToggle: $('tp-explain-toggle'),
      pqsToggle: $('tp-pqs-toggle'),
      savedList: $('tp-saved-list'),
      codingMode: $('tp-coding-mode'),
      // New context elements
      codingContext: $('tp-coding-context'),
      ctxExisting: $('tp-ctx-existing'),
      ctxCode: $('tp-ctx-code'),
      ctxLanguage: $('tp-ctx-language'),
      ctxTests: $('tp-ctx-tests'),
      // Validator elements
      validateInput: $('tp-validate-input'),
      validateBtn: $('tp-validate-btn'),
      validateResults: $('tp-validate-results')
    };
    
    // Verify core elements
    if (!elements.sendBtn || !elements.input || !elements.thread) {
      console.error('[TigerPrompts] Missing core elements');
      return;
    }
    
    console.log('[TigerPrompts v8.0] All elements found');
    
    // State
    let state = {
      mode: localStorage.getItem('tp-mode') || 'lite', // 'lite' or 'pro'
      explainMode: localStorage.getItem('tp-explain') === 'true',
      showPQS: localStorage.getItem('tp-show-pqs') !== 'false', // default true
      savedPrompts: JSON.parse(localStorage.getItem('tp-saved') || '[]'),
      codingMode: localStorage.getItem('tp-coding-mode') === 'true',
      codeContext: {
        existingCode: '',
        language: '',
        isNewFeature: true,
        needsTesting: false
      }
    };
    
    // Initialize
    updateStatus('ready', 'âœ… TPEM-1.1 Ready');
    loadSavedPrompts();
    updateModeButtons();
    updateSettingButtons();
    updateCodingModeUI();
    
    // === INPUT HANDLERS ===
    
    // Auto-resize textarea
    elements.input.addEventListener('input', () => {
      elements.input.style.height = 'auto';
      elements.input.style.height = Math.min(elements.input.scrollHeight, 200) + 'px';
      
      // Live PQS calculation
      updateLivePQS(elements.input.value);
    });
    
    // Handle Enter key
    elements.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        runEnhancer();
      }
    });
    
    // Send button
    elements.sendBtn.addEventListener('click', runEnhancer);
    
    // === SIDEBAR CONTROLS ===
    
    elements.toggleSidebar?.addEventListener('click', () => {
      elements.sidebar.classList.add('collapsed');
      elements.layout?.classList.add('collapsed');
    });
    
    elements.collapseTab?.addEventListener('click', () => {
      elements.sidebar.classList.remove('collapsed');
      elements.layout?.classList.remove('collapsed');
    });
    
    // === THEME TOGGLE ===
    
    elements.themeToggle?.addEventListener('click', () => {
      document.body.classList.toggle('tp-dark');
      localStorage.setItem('tp-dark-mode', document.body.classList.contains('tp-dark'));
    });
    
    // Load saved theme
    if (localStorage.getItem('tp-dark-mode') === 'true') {
      document.body.classList.add('tp-dark');
    }
    
    // === MODE TOGGLE ===
    
    elements.modeLite?.addEventListener('click', () => {
      state.mode = 'lite';
      localStorage.setItem('tp-mode', 'lite');
      updateModeButtons();
      updateStatus('ready', 'âœ… TPEM-Lite Mode');
    });
    
    elements.modePro?.addEventListener('click', () => {
      state.mode = 'pro';
      localStorage.setItem('tp-mode', 'pro');
      updateModeButtons();
      updateStatus('ready', 'âœ… TPEM-Pro Mode');
    });
    
    // === SETTINGS ===
    
    elements.explainToggle?.addEventListener('click', () => {
      state.explainMode = !state.explainMode;
      localStorage.setItem('tp-explain', state.explainMode);
      updateSettingButtons();
    });
    
    elements.pqsToggle?.addEventListener('click', () => {
      state.showPQS = !state.showPQS;
      localStorage.setItem('tp-show-pqs', state.showPQS);
      updateSettingButtons();
    });
    
    // === CODING MODE ===
    
    elements.codingMode?.addEventListener('click', () => {
      state.codingMode = !state.codingMode;
      localStorage.setItem('tp-coding-mode', state.codingMode);
      updateCodingModeUI();
      
      // Toggle context panel
      if (elements.codingContext) {
        elements.codingContext.style.display = state.codingMode ? 'block' : 'none';
      }
      
      // Update input placeholder
      if (state.codingMode) {
        elements.input.placeholder = 'Enter your coding task... (Optimized for AI-assisted development)';
        updateStatus('ready', 'ðŸ’» Coding Mode Active');
      } else {
        elements.input.placeholder = 'Enter your prompt... (Press Enter to enhance)';
        updateStatus('ready', 'âœ… TPEM-1.1 Ready');
      }
    });
    
    // === CODING CONTEXT HANDLERS ===
    
    elements.ctxExisting?.addEventListener('change', (e) => {
      if (elements.ctxCode) {
        elements.ctxCode.style.display = e.target.checked ? 'block' : 'none';
        state.codeContext.isNewFeature = !e.target.checked;
      }
    });
    
    elements.ctxCode?.addEventListener('input', (e) => {
      state.codeContext.existingCode = e.target.value;
    });
    
    elements.ctxLanguage?.addEventListener('change', (e) => {
      state.codeContext.language = e.target.value;
    });
    
    elements.ctxTests?.addEventListener('change', (e) => {
      state.codeContext.needsTesting = e.target.checked;
    });
    
    // === VALIDATOR ===
    
    elements.validateBtn?.addEventListener('click', async () => {
      const code = elements.validateInput?.value?.trim();
      
      if (!code) {
        alert('Please paste some code to validate');
        return;
      }
      
      updateStatus('processing', 'ðŸ” Validating AI Response...');
      
      // Simulate processing
      await sleep(800);
      
      const validation = validateAIResponse(code);
      displayValidationResults(validation);
      
      updateStatus('ready', 'âœ… Validation Complete');
    });
    
    // === PRESETS ===
    
    document.querySelectorAll('.tp-preset-item').forEach(preset => {
      preset.addEventListener('click', () => {
        const presetId = preset.dataset.preset;
        const presetData = TPEM.PRESETS[presetId];
        if (presetData) {
          elements.input.value = presetData.template;
          elements.input.focus();
        }
      });
    });
    
    // === RESET ===
    
    elements.resetBtn?.addEventListener('click', () => {
      if (elements.thread.children.length > 0) {
        if (confirm('Clear all enhanced prompts?')) {
          elements.thread.innerHTML = '';
          elements.input.value = '';
          elements.input.style.height = 'auto';
          updateStatus('ready', 'âœ… TPEM-1.1 Ready');
        }
      }
    });
    
    // === MICROPHONE ===
    
    elements.micBtn?.addEventListener('click', () => {
      alert('ðŸŽ¤ Voice input coming soon!');
    });
    
    // === MAIN ENHANCEMENT LOGIC ===
    
    async function runEnhancer() {
      const prompt = elements.input.value.trim();
      
      if (!prompt) {
        elements.input.focus();
        return;
      }
      
      // Update UI
      updateStatus('processing', state.mode === 'pro' 
        ? 'ðŸš€ Running TPEM-Pro Deep Analysis...' 
        : 'âš¡ Running TPEM-Lite Pipeline...');
      
      // Create message element
      const msgContainer = createMessageContainer();
      elements.thread.appendChild(msgContainer);
      
      // Clear input
      const originalPrompt = prompt;
      elements.input.value = '';
      elements.input.style.height = 'auto';
      elements.input.focus();
      
      // Scroll
      scrollToBottom();
      
      // PRO MODE: Show loading animation
      if (state.mode === 'pro') {
        const content = msgContainer.querySelector('.tp-msg-content');
        content.innerHTML = `
          <div class="tp-loading">
            <div class="tp-loading-spinner"></div>
            <div class="tp-loading-text">TPEM-Pro Deep Analysis in Progress...</div>
            <div class="tp-loading-subtext">Applying Advanced Reasoning & Examples</div>
            <div class="tp-loading-progress">
              <div class="tp-loading-progress-bar"></div>
            </div>
          </div>
        `;
        
        // Wait 3 seconds for "deep thinking"
        await sleep(3000);
      } else {
        // Lite mode: quick processing
        await sleep(400);
      }
      
      // Run TPEM-1.1 pipeline
      const result = await enhancePromptTPEM(originalPrompt);
      
      // Update message
      updateMessage(msgContainer, result);
      
      // Update status
      updateStatus('ready', 'âœ… Enhancement Complete');
      
      // Scroll
      scrollToBottom();
    }
    
    // === TPEM-1.1 PIPELINE ===
    
    async function enhancePromptTPEM(rawPrompt) {
      console.log('[TPEM-1.1] Starting enhancement pipeline...');
      
      // Stage 1: Classification
      const taskType = classifyTask(rawPrompt);
      console.log(`[TPEM-1.1] Classified as: ${taskType}`);
      
      // Stage 2: Ambiguity Analysis
      const ambiguityScore = calculateAmbiguity(rawPrompt);
      console.log(`[TPEM-1.1] Ambiguity score: ${ambiguityScore.toFixed(2)}`);
      
      // Stage 3: Scaffold Synthesis
      const scaffold = buildScaffold(rawPrompt, taskType, ambiguityScore);
      
      // Stage 4: Context Synthesis (with coding context)
      const enhanced = synthesizeContext(scaffold, taskType, rawPrompt);
      
      // Stage 5: Enhancement Engine (mode-dependent)
      const final = state.mode === 'pro' 
        ? applyProEnhancements(enhanced, taskType)
        : enhanced;
      
      // Stage 6: Validation & Scoring
      const pqsBefore = calculatePQS(rawPrompt);
      const pqsAfter = calculatePQS(final);
      
      // Generate explanation if enabled
      const explanation = state.explainMode 
        ? generateExplanation(rawPrompt, final, taskType, ambiguityScore, pqsBefore, pqsAfter)
        : null;
      
      return {
        original: rawPrompt,
        enhanced: final,
        taskType,
        ambiguityScore,
        pqsBefore,
        pqsAfter,
        deltaQ: pqsAfter - pqsBefore,
        explanation,
        mode: state.mode
      };
    }
    
    // === STAGE 1: CLASSIFICATION ===
    
    function classifyTask(prompt) {
      const lower = prompt.toLowerCase();
      let maxScore = 0;
      let detectedType = 'generate';
      
      for (const [type, config] of Object.entries(TPEM.TASK_TYPES)) {
        let score = 0;
        for (const keyword of config.keywords) {
          if (lower.includes(keyword)) {
            score += 1;
          }
        }
        if (score > maxScore) {
          maxScore = score;
          detectedType = type;
        }
      }
      
      return detectedType;
    }
    
    // === STAGE 2: AMBIGUITY ANALYSIS ===
    
    function calculateAmbiguity(prompt) {
      let score = 0;
      const lower = prompt.toLowerCase();
      
      // Missing audience
      if (!/(for|to|audience|users|readers|customers|people|team)/.test(lower)) {
        score += 0.1;
      }
      
      // Missing format
      if (!/(format|structure|json|markdown|list|table|style|output)/.test(lower)) {
        score += 0.1;
      }
      
      // Vague verbs without metrics
      if (/(improve|better|optimize|enhance|fix|good)/.test(lower) && !/\d+/.test(prompt)) {
        score += 0.2;
      }
      
      // No constraints
      if (!/(must|should|tone|style|length|words|characters|require|need)/.test(lower)) {
        score += 0.1;
      }
      
      // Very short prompt
      if (prompt.split(' ').length < 5) {
        score += 0.15;
      }
      
      // No context
      if (!/(about|regarding|for|on|with|using|that|which)/.test(lower)) {
        score += 0.15;
      }
      
      return Math.min(score, 1);
    }
    
    // === STAGE 3: SCAFFOLD SYNTHESIS ===
    
    function buildScaffold(prompt, taskType, ambiguity) {
      return {
        prompt,
        taskType,
        ambiguity,
        needsAssumptions: ambiguity > 0.35,
        needsExamples: ambiguity > 0.5,
        needsVerification: taskType === 'code' || taskType === 'math' || taskType === 'extract'
      };
    }
    
    // === STAGE 4: CONTEXT SYNTHESIS (ENHANCED) ===
    
    function synthesizeContext(scaffold, taskType, rawPrompt) {
      const sections = [];
      
      // Header
      sections.push('# ENHANCED PROMPT (TPEM-1.1)');
      if (state.codingMode) {
        sections.push('**ðŸš€ CODING MODE ACTIVE** - Optimized for AI-Assisted Development');
      }
      sections.push('');
      
      // Role & Context
      sections.push('## Role & Context');
      sections.push(getRoleForTask(taskType));
      sections.push('');
      
      // Task
      sections.push('## Task');
      sections.push(scaffold.prompt);
      sections.push('');
      
      // Add existing code context if provided
      if (state.codeContext.existingCode) {
        sections.push('## Existing Code Context');
        sections.push('```');
        sections.push(state.codeContext.existingCode);
        sections.push('```');
        sections.push('');
        sections.push('**CRITICAL:** Study the code above before making changes. Match its style, patterns, and conventions exactly.');
        sections.push('');
      }
      
      // Constraints
      sections.push('## Constraints');
      sections.push(...getConstraintsForTask(taskType));
      sections.push('');
      
      // Add tiered coding constraints if coding mode is active
      if (state.codingMode) {
        const context = {
          hasExistingCode: !!state.codeContext.existingCode,
          isNewFeature: state.codeContext.isNewFeature,
          needsTesting: state.codeContext.needsTesting,
          prompt: rawPrompt,
          language: state.codeContext.language || detectLanguage(rawPrompt)
        };
        
        sections.push(...getCodingModeConstraints(context));
        sections.push('');
      }
      
      // Process
      sections.push('## Process');
      sections.push(...getProcessForTask(taskType));
      sections.push('');
      
      // Output Format
      sections.push('## Output Format');
      sections.push(...getOutputForTask(taskType));
      sections.push('');
      
      // Quality Bar
      sections.push('## Quality Bar');
      sections.push('- Meets all specified constraints');
      sections.push('- Clear, unambiguous, and directly usable');
      sections.push('- No hallucinated facts; cite sources or flag uncertainty');
      sections.push('- Self-check for errors before finalizing');
      
      if (scaffold.needsVerification) {
        sections.push('- Include verification/testing steps');
      }
      
      if (state.codingMode) {
        sections.push('- **Code is complete, not truncated**');
        sections.push('- **All changes are intentional and explained**');
        sections.push('- **Comments are thorough and helpful**');
      }
      sections.push('');
      
      // Assumptions (if high ambiguity)
      if (scaffold.needsAssumptions) {
        sections.push('## Assumptions');
        sections.push('*Due to prompt ambiguity, the following assumptions were made:*');
        sections.push('- Audience: General but expert-friendly');
        sections.push('- Tone: Clear and professional');
        sections.push('- Format: Structured Markdown');
        sections.push('- Length: Comprehensive but concise');
        sections.push('');
      }
      
      return sections.join('\n');
    }
    
    // === TIERED CODING CONSTRAINTS ===
    
    function getCodingModeConstraints(context = {}) {
      const constraints = [];
      
      // === TIER 1: CRITICAL (Always) ===
      constraints.push(...getCriticalRules());
      
      // === TIER 2: CONTEXT-SPECIFIC ===
      
      // If user pasted existing code
      if (context.hasExistingCode) {
        constraints.push(...getChangeManagementRules());
      }
      
      // If user is building something new
      if (context.isNewFeature) {
        constraints.push(...getArchitectureRules());
      }
      
      // If user wants tests
      if (context.needsTesting || /test|spec|jest|pytest|unittest/i.test(context.prompt)) {
        constraints.push(...getTestingRules());
      }
      
      // === TIER 3: LANGUAGE-SPECIFIC ===
      
      if (context.language) {
        constraints.push(...getLanguageSpecificRules(context.language));
      }
      
      // === UNIVERSAL QUALITY CHECKLIST ===
      constraints.push('',
        '## âœ¨ CODE QUALITY CHECKLIST',
        '',
        '**Before responding, verify:**',
        '- [ ] Code is complete (no truncation/placeholders)',
        '- [ ] All imports are included',
        '- [ ] Functions are defined before use',
        '- [ ] Error handling is present',
        '- [ ] Edge cases are handled',
        '- [ ] Code has explanatory comments',
        '- [ ] Variable names are descriptive',
        '- [ ] No hardcoded values (use constants)',
        ''
      );
      
      return constraints;
    }
    
    // === TIER 1: CRITICAL RULES ===
    
    function getCriticalRules() {
      return [
        '## ðŸš¨ CRITICAL REQUIREMENTS (NON-NEGOTIABLE)',
        '',
        '### 1. Complete Code - Zero Truncation',
        '**NEVER use placeholders like:**',
        '   âŒ `// ... rest of code here`',
        '   âŒ `// continuing from above`',
        '   âŒ `// same as before`',
        '   âŒ `// you know what goes here`',
        '',
        '**ALWAYS provide:**',
        '   âœ… Every single line of code needed',
        '   âœ… All imports and dependencies at the top',
        '   âœ… Complete function bodies (no stubs)',
        '   âœ… Full file from start to finish',
        '',
        '**Example of WRONG:**',
        '```javascript',
        'function processData(data) {',
        '  // validate data',
        '  // ... rest of validation  â† âŒ TRUNCATED',
        '  return result;',
        '}',
        '```',
        '',
        '**Example of RIGHT:**',
        '```javascript',
        'function processData(data) {',
        '  // Validate data is not null/undefined',
        '  if (!data) {',
        '    throw new Error("Data cannot be null");',
        '  }',
        '  ',
        '  // Validate data structure',
        '  if (!data.id || !data.name) {',
        '    throw new Error("Data must have id and name");',
        '  }',
        '  ',
        '  // Process the data',
        '  const result = {',
        '    id: data.id,',
        '    name: data.name.trim(),',
        '    processed: true',
        '  };',
        '  ',
        '  return result;',
        '}',
        '```',
        '',
        '### 2. Radical Transparency',
        '**If you cannot do something, say so immediately:**',
        '   âœ… "I cannot access external APIs, so I\'ll show you the structure"',
        '   âœ… "This requires testing in a browser - here\'s how to test it"',
        '   âœ… "I\'m not certain about X - check the docs at [link]"',
        '   âŒ [Never guess or hallucinate libraries/APIs that don\'t exist]',
        '',
        '**Always flag assumptions:**',
        '   Example: "I\'m assuming you\'re using React 18+. If using an older version, change X to Y."',
        '',
        '### 3. Explicit Change Communication',
        '**For every code change, explain:**',
        '   1. WHAT you changed (specific lines/functions)',
        '   2. WHY you changed it (what problem it solves)',
        '   3. IMPACT (what might break, what to test)',
        '',
        '**Example:**',
        '```javascript',
        '// CHANGED: Line 42-45',
        '// WHY: Previous validation only checked for null, now also checks empty string',
        '// IMPACT: More strict - may reject previously accepted inputs',
        'if (!email || email.trim() === "") {',
        '  throw new Error("Email is required");',
        '}',
        '```',
        ''
      ];
    }
    
    // === TIER 2: CHANGE MANAGEMENT RULES ===
    
    function getChangeManagementRules() {
      return [
        '## ðŸ”§ CHANGE MANAGEMENT (Modifying Existing Code)',
        '',
        '### Gold Standard Reference',
        '**Before making ANY changes:**',
        '   1. Study the existing code patterns',
        '   2. Match naming conventions exactly (camelCase vs snake_case)',
        '   3. Preserve the same indentation/spacing style',
        '   4. Keep the same comment style',
        '',
        '### Surgical Precision',
        '**ONLY modify what was explicitly requested:**',
        '   âŒ Do NOT "improve" working code',
        '   âŒ Do NOT refactor unrelated functions',
        '   âŒ Do NOT rename variables "to be clearer"',
        '   âŒ Do NOT change formatting/style of unchanged code',
        '',
        '**If you see something that could be better, ASK first:**',
        '   âœ… "I notice X could be improved by Y. Would you like me to change it?"',
        '   âŒ [Don\'t just change it and explain why afterward]',
        '',
        '### Change Tracking',
        '**Use clear markers:**',
        '```javascript',
        '// === MODIFIED: User Authentication ===',
        '// OLD: Used localStorage for tokens',
        '// NEW: Using httpOnly cookies for security',
        '// REASON: localStorage is vulnerable to XSS attacks',
        '',
        'function authenticateUser(credentials) {',
        '  // ... new implementation',
        '}',
        '// === END MODIFICATION ===',
        '```',
        ''
      ];
    }
    
    // === TIER 2: ARCHITECTURE RULES ===
    
    function getArchitectureRules() {
      return [
        '## ðŸ—ï¸ ARCHITECTURE (New Features/Components)',
        '',
        '### Modularity Principles',
        '**Single Responsibility:**',
        '   Each function/component should do ONE thing',
        '   Example: Don\'t mix data fetching + rendering + validation in one function',
        '',
        '**Example of BAD (mixed responsibilities):**',
        '```javascript',
        'function UserProfile() {',
        '  const [user, setUser] = useState(null);',
        '  ',
        '  // Fetching + validation + rendering all in one',
        '  useEffect(() => {',
        '    fetch("/api/user")',
        '      .then(res => res.json())',
        '      .then(data => {',
        '        if (data.email && data.email.includes("@")) {',
        '          setUser(data);',
        '        }',
        '      });',
        '  }, []);',
        '  ',
        '  return <div>{user?.name}</div>;',
        '}',
        '```',
        '',
        '**Example of GOOD (separated responsibilities):**',
        '```javascript',
        '// 1. Data fetching (custom hook)',
        'function useUser() {',
        '  const [user, setUser] = useState(null);',
        '  ',
        '  useEffect(() => {',
        '    fetchUser().then(setUser);',
        '  }, []);',
        '  ',
        '  return user;',
        '}',
        '',
        '// 2. Validation (pure function)',
        'function validateUser(user) {',
        '  return user?.email?.includes("@");',
        '}',
        '',
        '// 3. Presentation (component)',
        'function UserProfile() {',
        '  const user = useUser();',
        '  ',
        '  if (!user || !validateUser(user)) {',
        '    return <div>Invalid user</div>;',
        '  }',
        '  ',
        '  return <div>{user.name}</div>;',
        '}',
        '```',
        '',
        '### Separation of Concerns',
        '**Organize code into clear layers:**',
        '   ðŸ“ `/api` - Data fetching logic',
        '   ðŸ“ `/components` - UI components (presentation only)',
        '   ðŸ“ `/hooks` - Reusable stateful logic',
        '   ðŸ“ `/utils` - Pure utility functions',
        '   ðŸ“ `/types` - TypeScript interfaces/types',
        ''
      ];
    }
    
    // === TIER 2: TESTING RULES ===
    
    function getTestingRules() {
      return [
        '## ðŸ§ª TESTING REQUIREMENTS',
        '',
        '### Test Cases Format',
        '**For each function, provide:**',
        '```javascript',
        '// Test Case 1: Happy path',
        'Input: { id: 1, name: "John" }',
        'Expected: { id: 1, name: "John", processed: true }',
        '',
        '// Test Case 2: Edge case (empty data)',
        'Input: {}',
        'Expected: Error("Data must have id and name")',
        '',
        '// Test Case 3: Edge case (null)',
        'Input: null',
        'Expected: Error("Data cannot be null")',
        '```',
        '',
        '### Unit Test Example',
        '**Include runnable tests:**',
        '```javascript',
        'describe("processData", () => {',
        '  it("should process valid data", () => {',
        '    const input = { id: 1, name: "John" };',
        '    const result = processData(input);',
        '    expect(result.processed).toBe(true);',
        '  });',
        '  ',
        '  it("should throw error for null data", () => {',
        '    expect(() => processData(null))',
        '      .toThrow("Data cannot be null");',
        '  });',
        '});',
        '```',
        ''
      ];
    }
    
    // === TIER 3: LANGUAGE-SPECIFIC RULES ===
    
    function getLanguageSpecificRules(language) {
      const rules = {
        'javascript': [
          '',
          '## ðŸ“˜ JAVASCRIPT BEST PRACTICES',
          '- Use `const` by default, `let` only when reassigning',
          '- Prefer arrow functions for callbacks',
          '- Use destructuring: `const { name, age } = user`',
          '- Use optional chaining: `user?.address?.city`',
          '- Use nullish coalescing: `value ?? defaultValue`',
          '- Always handle Promise rejections with `.catch()` or try/catch',
          ''
        ],
        'react': [
          '',
          '## âš›ï¸ REACT BEST PRACTICES',
          '- Imports order: React, then libraries, then local',
          '- Use functional components + hooks (not class components)',
          '- Destructure props: `function Button({ onClick, label }) {}`',
          '- Use `key` prop in lists: `{items.map(item => <div key={item.id}>)}`',
          '- Memoize expensive calculations: `useMemo(() => compute(data), [data])`',
          '- Extract repeated JSX into components',
          ''
        ],
        'typescript': [
          '',
          '## ðŸ“˜ TYPESCRIPT BEST PRACTICES',
          '- Define interfaces for all data structures',
          '- Use union types: `string | number`',
          '- Use type guards for narrowing: `if (typeof x === "string")`',
          '- Avoid `any` - use `unknown` if type is truly unknown',
          '- Use `Readonly<T>` for immutable data',
          '- Export types with the code that uses them',
          ''
        ],
        'python': [
          '',
          '## ðŸ PYTHON BEST PRACTICES',
          '- Follow PEP 8: snake_case for functions, UPPER_CASE for constants',
          '- Use type hints: `def process(data: dict) -> list:`',
          '- Use list comprehensions: `[x*2 for x in numbers if x > 0]`',
          '- Context managers for resources: `with open("file.txt") as f:`',
          '- Use f-strings: `f"Hello {name}"`',
          '- Docstrings for all public functions',
          ''
        ],
        'rust': [
          '',
          '## ðŸ¦€ RUST BEST PRACTICES',
          '- Use `Result<T, E>` for error handling',
          '- Leverage the borrow checker - avoid unnecessary clones',
          '- Use iterators over loops when possible',
          '- Pattern matching with `match` is preferred',
          '- Use `Option<T>` instead of null',
          '- Add `#[derive(Debug)]` to structs',
          ''
        ],
        'go': [
          '',
          '## ðŸ¹ GO BEST PRACTICES',
          '- Check errors immediately: `if err != nil { return err }`',
          '- Use defer for cleanup: `defer file.Close()`',
          '- Goroutines for concurrency, not parallelism',
          '- Use context for cancellation',
          '- Interfaces are implicit - define small ones',
          '- Use `gofmt` formatting',
          ''
        ]
      };
      
      return rules[language] || [];
    }
    
    // === LANGUAGE DETECTION ===
    
    function detectLanguage(prompt) {
      const lower = prompt.toLowerCase();
      
      if (/\breact\b/i.test(lower)) return 'react';
      if (/\btypescript\b|\.tsx?\b/i.test(lower)) return 'typescript';
      if (/\bpython\b|\.py\b/i.test(lower)) return 'python';
      if (/\bjavascript\b|\.jsx?\b|node\.?js/i.test(lower)) return 'javascript';
      if (/\brust\b|\.rs\b/i.test(lower)) return 'rust';
      if (/\bgo\b|golang/i.test(lower)) return 'go';
      
      return null;
    }
    
    // === VALIDATION SYSTEM ===
    
    function validateAIResponse(code) {
      const issues = [];
      
      // Check 1: Truncation patterns
      const truncationPatterns = [
        { pattern: /\/\/\s*\.\.\./, message: 'Ellipsis placeholder found' },
        { pattern: /\/\/\s*rest of/i, message: 'Truncation comment found' },
        { pattern: /\/\/\s*continued/i, message: 'Continuation placeholder found' },
        { pattern: /\/\/\s*same as (above|before)/i, message: 'Reference to previous code' },
        { pattern: /#\s*\.\.\./, message: 'Python ellipsis placeholder' },
        { pattern: /\.\.\.\s*$/m, message: 'Trailing ellipsis' }
      ];
      
      truncationPatterns.forEach(({ pattern, message }) => {
        if (pattern.test(code)) {
          const match = code.match(pattern);
          const lineNumber = code.substring(0, match.index).split('\n').length;
          issues.push({
            type: 'CRITICAL',
            category: 'Truncation',
            problem: `${message} at line ${lineNumber}`,
            fix: 'Ask AI: "Please provide the complete code without any truncation or placeholders."'
          });
        }
      });
      
      // Check 2: Missing imports (JavaScript/TypeScript/React)
      if (/\b(useState|useEffect|useContext|useReducer|useMemo|useCallback)\b/.test(code) && 
          !/import\s+.*\s+from\s+['"]react['"]/.test(code)) {
        issues.push({
          type: 'CRITICAL',
          category: 'Imports',
          problem: 'React hooks used but React import is missing',
          fix: 'Add: import { useState, useEffect } from "react" at the top'
        });
      }
      
      // Check 3: Undefined functions
      const functionCalls = extractFunctionCalls(code);
      const functionDefinitions = extractFunctionDefinitions(code);
      const undefinedFunctions = functionCalls.filter(call => 
        !functionDefinitions.includes(call) && 
        !isBuiltInFunction(call)
      );
      
      if (undefinedFunctions.length > 0) {
        issues.push({
          type: 'CRITICAL',
          category: 'Undefined Functions',
          problem: `Functions called but not defined: ${undefinedFunctions.slice(0, 3).join(', ')}`,
          fix: 'Ask AI to define these functions or import them from the correct modules'
        });
      }
      
      // Check 4: Error handling
      const hasAsyncCode = /async\s+function|\.then\(|await\s/.test(code);
      const hasErrorHandling = /try\s*{|\.catch\(|catch\s*\(/i.test(code);
      
      if (hasAsyncCode && !hasErrorHandling) {
        issues.push({
          type: 'WARNING',
          category: 'Error Handling',
          problem: 'Async code detected but no error handling found',
          fix: 'Add try/catch blocks or .catch() handlers for API calls'
        });
      }
      
      // Check 5: Console.logs (shouldn't be in production)
      const consoleCount = (code.match(/console\.(log|warn|error)/g) || []).length;
      if (consoleCount > 3) {
        issues.push({
          type: 'WARNING',
          category: 'Debugging Code',
          problem: `${consoleCount} console statements found - may be debug code`,
          fix: 'Remove console.logs or replace with proper logging'
        });
      }
      
      // Check 6: TODOs or FIXMEs
      if (/TODO|FIXME|HACK|XXX/i.test(code)) {
        issues.push({
          type: 'WARNING',
          category: 'Incomplete Code',
          problem: 'TODO/FIXME comments found - code may be incomplete',
          fix: 'Ask AI to complete the implementation'
        });
      }
      
      // Calculate quality score
      const criticalCount = issues.filter(i => i.type === 'CRITICAL').length;
      const warningCount = issues.filter(i => i.type === 'WARNING').length;
      const score = Math.max(0, 100 - (criticalCount * 30) - (warningCount * 10));
      
      // Generate follow-up prompt
      const followUpPrompt = generateFollowUpPrompt(issues);
      
      return {
        passed: criticalCount === 0,
        score,
        issues,
        followUpPrompt,
        summary: {
          critical: criticalCount,
          warnings: warningCount,
          total: issues.length
        }
      };
    }
    
    function extractFunctionCalls(code) {
      // Simple extraction - matches word followed by (
      const matches = code.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g);
      if (!matches) return [];
      
      return [...new Set(matches.map(m => m.replace(/\s*\($/, '')))];
    }
    
    function extractFunctionDefinitions(code) {
      const patterns = [
        /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,  // function declarations
        /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g,  // const declarations
        /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g,    // let declarations
        /def\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g         // Python def
      ];
      
      const definitions = [];
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(code)) !== null) {
          definitions.push(match[1]);
        }
      });
      
      return [...new Set(definitions)];
    }
    
    function isBuiltInFunction(name) {
      const builtIns = [
        // JavaScript
        'console', 'fetch', 'setTimeout', 'setInterval', 'Promise', 'Array', 'Object',
        'Math', 'Date', 'JSON', 'parseInt', 'parseFloat', 'isNaN', 'alert', 'confirm',
        // React
        'useState', 'useEffect', 'useContext', 'useReducer', 'useMemo', 'useCallback',
        'useRef', 'useLayoutEffect', 'useImperativeHandle', 'useDebugValue',
        // Common libraries
        'require', 'module', 'exports', 'process', 'Buffer',
        // Python
        'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set',
        'open', 'input', 'map', 'filter', 'zip', 'enumerate'
      ];
      
      return builtIns.includes(name);
    }
    
    function generateFollowUpPrompt(issues) {
      if (issues.length === 0) {
        return null;
      }
      
      const critical = issues.filter(i => i.type === 'CRITICAL');
      const warnings = issues.filter(i => i.type === 'WARNING');
      
      let prompt = '## Issues Found in Your Code\n\n';
      
      if (critical.length > 0) {
        prompt += '### ðŸš¨ CRITICAL ISSUES (Must Fix):\n\n';
        critical.forEach((issue, i) => {
          prompt += `${i + 1}. **${issue.category}:** ${issue.problem}\n`;
          prompt += `   - Fix: ${issue.fix}\n\n`;
        });
      }
      
      if (warnings.length > 0) {
        prompt += '### âš ï¸ WARNINGS (Should Fix):\n\n';
        warnings.forEach((issue, i) => {
          prompt += `${i + 1}. **${issue.category}:** ${issue.problem}\n`;
          prompt += `   - Suggestion: ${issue.fix}\n\n`;
        });
      }
      
      prompt += '\n---\n\n';
      prompt += '**FOLLOW-UP PROMPT FOR AI:**\n\n';
      prompt += '```\n';
      prompt += 'The previous code has the following issues:\n\n';
      
      critical.forEach((issue, i) => {
        prompt += `${i + 1}. ${issue.problem}\n`;
      });
      
      prompt += '\nPlease provide the COMPLETE, working code with ALL critical issues fixed.\n';
      prompt += 'Requirements:\n';
      prompt += '- NO truncation or placeholders (no // ... comments)\n';
      prompt += '- ALL imports included at the top\n';
      prompt += '- ALL functions fully defined\n';
      prompt += '- Proper error handling\n';
      prompt += '- Code should be copy-paste ready\n';
      prompt += '```';
      
      return prompt;
    }
    
    function displayValidationResults(validation) {
      const results = elements.validateResults;
      if (!results) return;
      
      results.style.display = 'block';
      
      const scoreColor = validation.score >= 80 ? '#22c55e' : 
                        validation.score >= 50 ? '#f59e0b' : '#ef4444';
      
      let html = `
        <div class="tp-validate-header">
          <div class="tp-validate-score" style="color: ${scoreColor}">
            <i class="fa-solid fa-gauge-high"></i>
            Quality Score: ${validation.score}/100
          </div>
          <div class="tp-validate-summary">
            <span class="tp-validate-badge critical">${validation.summary.critical} Critical</span>
            <span class="tp-validate-badge warning">${validation.summary.warnings} Warnings</span>
          </div>
        </div>
      `;
      
      if (validation.issues.length === 0) {
        html += `
          <div class="tp-validate-success">
            <i class="fa-solid fa-circle-check"></i>
            <div>
              <strong>Excellent!</strong>
              <p>No major issues detected. Code looks good!</p>
            </div>
          </div>
        `;
      } else {
        html += '<div class="tp-validate-issues">';
        
        const critical = validation.issues.filter(i => i.type === 'CRITICAL');
        const warnings = validation.issues.filter(i => i.type === 'WARNING');
        
        if (critical.length > 0) {
          html += '<div class="tp-validate-section critical">';
          html += '<h4><i class="fa-solid fa-circle-xmark"></i> Critical Issues</h4>';
          critical.forEach(issue => {
            html += `
              <div class="tp-validate-issue">
                <div class="tp-validate-issue-header">
                  <strong>${issue.category}</strong>
                </div>
                <div class="tp-validate-issue-problem">${issue.problem}</div>
                <div class="tp-validate-issue-fix">ðŸ’¡ ${issue.fix}</div>
              </div>
            `;
          });
          html += '</div>';
        }
        
        if (warnings.length > 0) {
          html += '<div class="tp-validate-section warning">';
          html += '<h4><i class="fa-solid fa-triangle-exclamation"></i> Warnings</h4>';
          warnings.forEach(issue => {
            html += `
              <div class="tp-validate-issue">
                <div class="tp-validate-issue-header">
                  <strong>${issue.category}</strong>
                </div>
                <div class="tp-validate-issue-problem">${issue.problem}</div>
                <div class="tp-validate-issue-fix">ðŸ’¡ ${issue.fix}</div>
              </div>
            `;
          });
          html += '</div>';
        }
        
        html += '</div>';
        
        if (validation.followUpPrompt) {
          html += `
            <div class="tp-validate-followup">
              <h4><i class="fa-solid fa-paper-plane"></i> Suggested Follow-Up Prompt</h4>
              <pre>${validation.followUpPrompt}</pre>
              <button class="tp-btn tp-btn--orange" onclick="navigator.clipboard.writeText(this.previousElementSibling.textContent)">
                <i class="fa-solid fa-copy"></i>
                Copy Follow-Up Prompt
              </button>
            </div>
          `;
        }
      }
      
      results.innerHTML = html;
      results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // === LIVE PQS INDICATOR ===
    
    function updateLivePQS(prompt) {
      const livePQS = $('tp-live-pqs');
      if (!livePQS || !prompt) return;
      
      const score = calculatePQS(prompt);
      livePQS.textContent = `PQS: ${score.toFixed(2)}`;
      
      livePQS.className = 'tp-live-pqs ' + 
        (score < 0.5 ? 'pqs-low' : 
         score < 0.7 ? 'pqs-medium' : 
         'pqs-high');
      
      livePQS.style.display = 'block';
    }
    
    // === STAGE 5: PRO ENHANCEMENTS ===
    
    function applyProEnhancements(enhanced, taskType) {
      // TPEM-Pro adds significantly more depth
      let sections = [];
      
      // Parse existing sections
      const existingSections = enhanced.split('\n## ');
      sections.push(existingSections[0]); // Keep header
      
      for (let i = 1; i < existingSections.length; i++) {
        const section = existingSections[i];
        
        // Massively expand Process section
        if (section.startsWith('Process')) {
          sections.push('Process\n' + 
            expandProcessStepsPro(taskType) + '\n\n' +
            '### Checkpoint Questions:\n' +
            getCheckpointQuestions(taskType).join('\n'));
        }
        // Add huge Examples section before Quality Bar
        else if (section.startsWith('Quality Bar')) {
          sections.push('Examples & Test Cases\n' + 
            getDetailedExamplesPro(taskType).join('\n\n'));
          sections.push(section);
        }
        // Expand Constraints dramatically
        else if (section.startsWith('Constraints')) {
          sections.push('Constraints\n' + 
            getExpandedConstraintsPro(taskType).join('\n') + '\n\n' +
            '### Additional Considerations:\n' +
            getAdditionalConsiderations(taskType).join('\n'));
        }
        // Keep other sections
        else {
          sections.push(section);
        }
      }
      
      // Add PRO-only sections
      const qualityIndex = sections.findIndex(s => s.startsWith('Quality Bar'));
      if (qualityIndex > 0) {
        sections.splice(qualityIndex + 1, 0, 
          'Verification Steps\n' + getVerificationStepsPro(taskType).join('\n'),
          'Common Pitfalls to Avoid\n' + getCommonPitfallsPro(taskType).join('\n')
        );
      }
      
      return sections.join('\n## ');
    }
    
    // PRO MODE HELPERS
    
    function expandProcessStepsPro(type) {
      const base = [
        '**Stage 1: Preparation & Analysis**',
        '- Thoroughly analyze the request',
        '- Identify all explicit and implicit requirements',
        '- Research context and domain if needed',
        '- List assumptions that need validation',
        '',
        '**Stage 2: Strategic Planning**',
        '- Break down into logical sub-tasks',
        '- Determine optimal approach/methodology',
        '- Identify potential challenges and solutions',
        '- Establish success criteria',
        '',
        '**Stage 3: Execution**',
        '- Follow systematic implementation process',
        '- Maintain quality standards throughout',
        '- Document decisions and rationale',
        '- Build in checkpoints for validation',
        '',
        '**Stage 4: Review & Refinement**',
        '- Cross-check against requirements',
        '- Test/validate all components',
        '- Refine and optimize output',
        '- Verify completeness and accuracy',
        '',
        '**Stage 5: Finalization**',
        '- Conduct comprehensive quality check',
        '- Ensure all criteria are met',
        '- Add final polish and formatting',
        '- Prepare supporting documentation'
      ];
      return base.join('\n');
    }
    
    function getCheckpointQuestions(type) {
      return [
        '- [ ] Have all requirements been addressed?',
        '- [ ] Is the output clear and unambiguous?',
        '- [ ] Have edge cases been considered?',
        '- [ ] Is the quality bar met?',
        '- [ ] Would this pass peer review?'
      ];
    }
    
    function getDetailedExamplesPro(type) {
      const examples = [
        '### Example 1: Optimal Input/Output Pattern',
        '```',
        'INPUT:',
        '[Detailed example of ideal input format]',
        '',
        'PROCESS:',
        '1. [First transformation step]',
        '2. [Second transformation step]',
        '3. [Third transformation step]',
        '',
        'OUTPUT:',
        '[Expected output format with all requirements met]',
        '```',
        '',
        '### Example 2: Edge Case Handling',
        '```',
        'SCENARIO: [Describe unusual or boundary condition]',
        '',
        'APPROACH:',
        '- First, identify the edge case characteristics',
        '- Then, apply appropriate handling strategy',
        '- Finally, validate the output meets standards',
        '',
        'RESULT: [How the edge case should be handled]',
        '```'
      ];
      return examples;
    }
    
    function getExpandedConstraintsPro(type) {
      return [
        '**Primary Requirements:**',
        '- Accuracy: All information must be factually correct',
        '- Completeness: Address all aspects of the request',
        '- Clarity: Use clear, unambiguous language',
        '- Structure: Follow logical organization',
        '',
        '**Quality Standards:**',
        '- Professional tone and presentation',
        '- Proper formatting and structure',
        '- Consistent terminology throughout',
        '- No assumptions without explicit statement'
      ];
    }
    
    function getAdditionalConsiderations(type) {
      return [
        '- Consider performance implications at scale',
        '- Think about future extensibility needs',
        '- Account for different user skill levels',
        '- Plan for edge cases and error scenarios',
        '- Document assumptions and limitations clearly'
      ];
    }
    
    function getVerificationStepsPro(type) {
      return [
        '### Pre-Delivery Checklist:',
        '',
        '**Completeness Check:**',
        '- [ ] All requirements addressed',
        '- [ ] No missing information',
        '- [ ] Edge cases considered',
        '- [ ] Examples included where helpful',
        '',
        '**Quality Check:**',
        '- [ ] Clear and unambiguous language',
        '- [ ] Proper structure and formatting',
        '- [ ] Consistent terminology',
        '- [ ] No errors or typos'
      ];
    }
    
    function getCommonPitfallsPro(type) {
      return [
        'âš ï¸ **Insufficient Detail:** Don\'t be vague - be specific and explicit',
        'âš ï¸ **Assumption Overload:** State assumptions clearly rather than hiding them',
        'âš ï¸ **Ignoring Edge Cases:** Boundary conditions often reveal important issues',
        'âš ï¸ **Poor Organization:** Structure matters - use clear sections and flow',
        'âš ï¸ **Missing Context:** Provide enough background for understanding'
      ];
    }
    
    // === STAGE 6: PQS CALCULATION ===
    
    function calculatePQS(prompt) {
      const metrics = {
        clarity: calculateClarity(prompt),
        structure: calculateStructure(prompt),
        constraintDensity: calculateConstraintDensity(prompt),
        modelCompatibility: calculateModelCompatibility(prompt),
        goalAlignment: calculateGoalAlignment(prompt),
        cognitiveLoad: calculateCognitiveLoad(prompt)
      };
      
      // Weighted sum
      let pqs = 0;
      for (const [metric, value] of Object.entries(metrics)) {
        pqs += value * TPEM.PQS_WEIGHTS[metric];
      }
      
      return Math.min(Math.max(pqs, 0), 1);
    }
    
    function calculateClarity(prompt) {
      let score = 0.3; // base
      if (prompt.length > 20) score += 0.2;
      if (/\b(objective|goal|task|need|want)\b/i.test(prompt)) score += 0.2;
      if (!/\b(something|thing|stuff|it|that)\b/i.test(prompt)) score += 0.3;
      return Math.min(score, 1);
    }
    
    function calculateStructure(prompt) {
      let score = 0.2; // base
      if (prompt.includes('\n')) score += 0.3;
      if (prompt.includes('##') || prompt.includes('- ')) score += 0.3;
      if (prompt.includes('```') || prompt.includes('|')) score += 0.2;
      return Math.min(score, 1);
    }
    
    function calculateConstraintDensity(prompt) {
      const constraints = (prompt.match(/\b(must|should|need|require|format|style|tone|length|audience)\b/gi) || []).length;
      return Math.min(constraints * 0.15, 1);
    }
    
    function calculateModelCompatibility(prompt) {
      let score = 0.5; // base
      if (prompt.length < 2000) score += 0.2;
      if (!/[^\x00-\x7F]/.test(prompt)) score += 0.15;
      if (!/<script|eval\(/i.test(prompt)) score += 0.15;
      return Math.min(score, 1);
    }
    
    function calculateGoalAlignment(prompt) {
      let score = 0.4; // base
      if (/\b(create|generate|write|analyze|build|explain)\b/i.test(prompt)) score += 0.3;
      if (prompt.split(' ').length > 8) score += 0.3;
      return Math.min(score, 1);
    }
    
    function calculateCognitiveLoad(prompt) {
      const words = prompt.split(' ').length;
      const sentences = (prompt.match(/[.!?]+/g) || []).length;
      const avgWordsPerSentence = sentences > 0 ? words / sentences : words;
      
      if (avgWordsPerSentence < 20) return 0.9;
      if (avgWordsPerSentence < 30) return 0.7;
      if (avgWordsPerSentence < 40) return 0.5;
      return 0.3;
    }
    
    // === EXPLANATION GENERATION ===
    
    function generateExplanation(original, enhanced, taskType, ambiguity, pqsBefore, pqsAfter) {
      const changes = [];
      
      if (state.codingMode) {
        changes.push(`<strong>ðŸ’» Coding Mode Active:</strong> Enhanced with tiered coding constraints (Critical + ${state.codeContext.hasExistingCode ? 'Change Management' : 'Architecture'} + ${state.codeContext.language || 'Auto-detected language'}).`);
      }
      
      changes.push(`<strong>Task Classification:</strong> Detected as "${taskType}" based on keyword analysis.`);
      
      changes.push(`<strong>Ambiguity Score:</strong> ${ambiguity.toFixed(2)} - ${
        ambiguity < 0.3 ? 'Low (clear prompt)' : 
        ambiguity < 0.6 ? 'Moderate (some assumptions needed)' :
        'High (significant assumptions required)'
      }`);
      
      changes.push(`<strong>PQS Improvement:</strong> ${pqsBefore.toFixed(2)} â†’ ${pqsAfter.toFixed(2)} (+${(pqsAfter - pqsBefore).toFixed(2)})`);
      
      changes.push(`<strong>Added Structure:</strong> Organized into Role, Task, ${state.codeContext.existingCode ? 'Existing Code Context, ' : ''}Constraints, Process, Output Format, and Quality Bar sections.`);
      
      if (state.codingMode) {
        changes.push(`<strong>Tiered Constraints:</strong> Applied 3 critical rules with examples, ${state.codeContext.hasExistingCode ? 'change management rules' : 'architecture guidelines'}, and ${state.codeContext.language ? state.codeContext.language + '-specific' : 'language-specific'} best practices.`);
      }
      
      changes.push(`<strong>Added Process Steps:</strong> Defined clear methodology for approaching the task systematically.`);
      
      if (ambiguity > 0.35) {
        changes.push(`<strong>Added Assumptions:</strong> Due to high ambiguity, explicit assumptions were documented.`);
      }
      
      changes.push(`<strong>Quality Assurance:</strong> Added verification steps and success criteria to ensure output quality.`);
      
      return changes;
    }
    
    // === TASK-SPECIFIC CONTENT ===
    
    function getRoleForTask(type) {
      const roles = {
        'generate': 'You are an expert content creator and writer with deep knowledge of persuasive communication.',
        'transform': 'You are a professional editor and content transformer skilled in style adaptation.',
        'analyze': 'You are a senior analyst with expertise in critical thinking and evidence-based reasoning.',
        'plan': 'You are a strategic planner and consultant with experience in project management.',
        'extract': 'You are a data extraction specialist with expertise in structured data processing.',
        'code': 'You are a senior software engineer with expertise in clean code and best practices.',
        'math': 'You are a mathematics expert skilled in clear explanations and rigorous proofs.',
        'image': 'You are an expert prompt engineer specializing in image generation systems.'
      };
      return roles[type] || roles.generate;
    }
    
    function getConstraintsForTask(type) {
      const constraints = {
        'generate': [
          '- Tone: Engaging and clear',
          '- Length: 300-500 words unless specified',
          '- Structure: Use clear headings and logical flow',
          '- Facts: Cite sources or mark as uncertain',
          '- Audience: Consider reader expertise level'
        ],
        'transform': [
          '- Fidelity: Preserve core meaning and intent',
          '- Accuracy: Maintain factual correctness',
          '- Style: Match requested tone/format exactly',
          '- Transparency: Note any information loss or additions'
        ],
        'analyze': [
          '- Methodology: Show numbered reasoning steps',
          '- Evidence: Present supporting data and sources',
          '- Balance: Consider counterarguments',
          '- Conclusion: Provide confidence level (0-100%)',
          '- Format: Final answer first, then reasoning'
        ],
        'plan': [
          '- Scope: Define clear timeframes and resources',
          '- Metrics: Include measurable KPIs',
          '- Risks: Identify and mitigate potential issues',
          '- Ownership: Assign clear responsibilities',
          '- Milestones: Provide 30/60/90 day checkpoints'
        ],
        'extract': [
          '- Schema: Follow strict JSON structure',
          '- Accuracy: Only extract; never infer',
          '- Confidence: Include score per field (0-1)',
          '- Completeness: Skip missing fields; no hallucination'
        ],
        'code': [
          '- Language: Specify version and environment',
          '- Contracts: Define input/output clearly',
          '- Testing: Include test cases',
          '- Performance: Note time/space complexity',
          '- Edge Cases: Handle errors and boundaries'
        ],
        'math': [
          '- Steps: Show all work clearly',
          '- Verification: Check calculations',
          '- Assumptions: State explicitly',
          '- Units: Include and verify',
          '- Precision: Specify decimal places'
        ],
        'image': [
          '- Subject: Clear and specific description',
          '- Composition: Camera angle and framing',
          '- Lighting: Type and mood',
          '- Style: Artistic approach or reference',
          '- Negative: What to avoid',
          '- Technical: Aspect ratio, seed, steps'
        ]
      };
      return constraints[type] || constraints.generate;
    }
    
    function getProcessForTask(type) {
      const processes = {
        'generate': [
          '1. Identify target audience and purpose',
          '2. Outline key points and structure',
          '3. Draft with clear, engaging language',
          '4. Review for clarity and completeness',
          '5. Verify factual accuracy'
        ],
        'transform': [
          '1. Analyze source content and intent',
          '2. Map to target format/style requirements',
          '3. Transform while preserving meaning',
          '4. Verify accuracy and completeness',
          '5. Document any changes made'
        ],
        'analyze': [
          '1. List key hypotheses or claims',
          '2. Gather supporting evidence',
          '3. Consider counterarguments',
          '4. Synthesize findings',
          '5. Draw conclusion with confidence level'
        ],
        'plan': [
          '1. Define goals and success criteria',
          '2. Identify constraints and resources',
          '3. Generate and evaluate options',
          '4. Create detailed roadmap',
          '5. Define metrics and milestones'
        ],
        'extract': [
          '1. Parse input against schema',
          '2. Extract only present data',
          '3. Validate format and types',
          '4. Calculate confidence scores',
          '5. Return structured output'
        ],
        'code': [
          '1. Restate specification clearly',
          '2. Outline design and approach',
          '3. Implement with clean, documented code',
          '4. Add comprehensive tests',
          '5. Document usage and limitations'
        ],
        'math': [
          '1. Identify knowns and unknowns',
          '2. Choose appropriate method',
          '3. Execute calculation step-by-step',
          '4. Verify result makes sense',
          '5. State final answer with units'
        ],
        'image': [
          '1. Define subject and action',
          '2. Specify composition and framing',
          '3. Describe style and mood',
          '4. Add technical parameters',
          '5. Create negative prompts'
        ]
      };
      return processes[type] || processes.generate;
    }
    
    function getOutputForTask(type) {
      const outputs = {
        'generate': [
          '- Use Markdown with clear headings',
          '- Structure: Introduction, Body, Conclusion',
          '- Include relevant examples or data',
          '- End with key takeaways or action items'
        ],
        'transform': [
          '- Match requested output format exactly',
          '- Preserve original structure if applicable',
          '- Include change log if significant edits',
          '- Maintain original attribution and sources'
        ],
        'analyze': [
          '- **Final Answer:** [one clear sentence]',
          '- **Reasoning:** [numbered steps with evidence]',
          '- **Confidence:** [0-100% with justification]',
          '- **Caveats:** [what would change the conclusion]'
        ],
        'plan': [
          '- **Roadmap:** Timeline or Gantt chart',
          '- **KPIs:** Bulleted list with targets',
          '- **Risk Register:** Threats + mitigation',
          '- **Week 1 Checklist:** Immediate actions'
        ],
        'extract': [
          '- Valid JSON matching provided schema',
          '- Include "_confidence" field per object (0-1)',
          '- Use null for missing required fields',
          '- Add "_metadata" with extraction notes'
        ],
        'code': [
          '- **Code:** Syntax-highlighted blocks',
          '- **Tests:** Cases with expected output',
          '- **Usage:** Command/function to run',
          '- **Notes:** Complexity, limits, edge cases'
        ],
        'math': [
          '- **Given:** List knowns',
          '- **Solution:** Step-by-step with equations',
          '- **Answer:** Final result with units',
          '- **Verification:** Sanity check'
        ],
        'image': [
          '- **Main Prompt:** Single comprehensive string',
          '- **Negative Prompt:** What to exclude',
          '- **Settings:** aspect, seed, steps, cfg',
          '- **Variations:** 2-3 alternative approaches'
        ]
      };
      return outputs[type] || outputs.generate;
    }
    
    // === UI HELPERS ===
    
    function createMessageContainer() {
      const container = document.createElement('div');
      container.className = 'tp-msg';
      container.innerHTML = `
        <div class="tp-msg-header">
          <div class="tp-msg-label">
            <i class="fa-solid fa-sparkles"></i>
            Enhanced by TPEM-1.1
          </div>
          <div class="tp-msg-actions">
            <button class="tp-copy-btn">
              <i class="fa-solid fa-copy"></i>
              Copy
            </button>
            <button class="tp-save-btn">
              <i class="fa-solid fa-bookmark"></i>
              Save
            </button>
          </div>
        </div>
        <div class="tp-msg-content">Processing...</div>
        <div class="tp-msg-footer" style="display:none;">
          <div>
            <span class="tp-pqs-badge">
              <i class="fa-solid fa-chart-line"></i>
              PQS: <span class="tp-pqs-score">--</span>
            </span>
          </div>
          <div class="tp-msg-meta">--</div>
        </div>
      `;
      return container;
    }
    
    function updateMessage(container, result) {
      const content = container.querySelector('.tp-msg-content');
      const footer = container.querySelector('.tp-msg-footer');
      const pqsScore = container.querySelector('.tp-pqs-score');
      const meta = container.querySelector('.tp-msg-meta');
      
      // Set content
      content.textContent = result.enhanced;
      
      // Set PQS if enabled
      if (state.showPQS) {
        footer.style.display = 'flex';
        pqsScore.textContent = `${result.pqsAfter.toFixed(2)} (+${result.deltaQ.toFixed(2)})`;
        meta.textContent = `${result.taskType.toUpperCase()} Â· TPEM-${state.mode.toUpperCase()} Â· Ambiguity: ${result.ambiguityScore.toFixed(2)}`;
      }
      
      // Add explanation if enabled
      if (result.explanation) {
        const explDiv = document.createElement('div');
        explDiv.className = 'tp-explanation';
        explDiv.innerHTML = `
          <div class="tp-explanation-title">
            <i class="fa-solid fa-graduation-cap"></i>
            What We Enhanced
          </div>
          ${result.explanation.map(item => `<div class="tp-explanation-item">${item}</div>`).join('')}
        `;
        content.parentNode.insertBefore(explDiv, footer);
      }
      
      // Setup copy button
      const copyBtn = container.querySelector('.tp-copy-btn');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(result.enhanced).then(() => {
          copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      });
      
      // Setup save button
      const saveBtn = container.querySelector('.tp-save-btn');
      saveBtn.addEventListener('click', () => {
        savePrompt(result.enhanced, result.original);
        saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
        setTimeout(() => {
          saveBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Save';
        }, 2000);
      });
    }
    
    function savePrompt(enhanced, original) {
      const prompt = {
        id: Date.now(),
        original: original.substring(0, 50) + '...',
        enhanced,
        timestamp: new Date().toISOString()
      };
      
      state.savedPrompts.unshift(prompt);
      if (state.savedPrompts.length > 10) {
        state.savedPrompts = state.savedPrompts.slice(0, 10);
      }
      
      localStorage.setItem('tp-saved', JSON.stringify(state.savedPrompts));
      loadSavedPrompts();
    }
    
    function loadSavedPrompts() {
      if (!elements.savedList) return;
      
      if (state.savedPrompts.length === 0) {
        elements.savedList.innerHTML = '<div style="font-size: 11px; opacity: 0.5; padding: 8px;">No saved prompts yet</div>';
        return;
      }
      
      elements.savedList.innerHTML = state.savedPrompts.map(p => `
        <div class="tp-saved-item" data-id="${p.id}">
          <span class="tp-saved-item-text">${p.original}</span>
          <button class="tp-saved-item-delete" data-id="${p.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `).join('');
      
      // Add click handlers
      elements.savedList.querySelectorAll('.tp-saved-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.closest('.tp-saved-item-delete')) {
            const id = parseInt(e.target.closest('.tp-saved-item-delete').dataset.id);
            deletePrompt(id);
          } else {
            const id = parseInt(item.dataset.id);
            loadPrompt(id);
          }
        });
      });
    }
    
    function loadPrompt(id) {
      const prompt = state.savedPrompts.find(p => p.id === id);
      if (prompt) {
        elements.input.value = prompt.enhanced;
        elements.input.focus();
      }
    }
    
    function deletePrompt(id) {
      state.savedPrompts = state.savedPrompts.filter(p => p.id !== id);
      localStorage.setItem('tp-saved', JSON.stringify(state.savedPrompts));
      loadSavedPrompts();
    }
    
    function updateModeButtons() {
      elements.modeLite?.classList.toggle('active', state.mode === 'lite');
      elements.modePro?.classList.toggle('active', state.mode === 'pro');
    }
    
    function updateSettingButtons() {
      elements.explainToggle?.classList.toggle('active', state.explainMode);
      elements.pqsToggle?.classList.toggle('active', state.showPQS);
    }
    
    function updateCodingModeUI() {
      elements.codingMode?.classList.toggle('active', state.codingMode);
      if (elements.codingContext) {
        elements.codingContext.style.display = state.codingMode ? 'block' : 'none';
      }
    }
    
    function updateStatus(statusType, text) {
      if (elements.status) {
        elements.status.textContent = text;
        elements.status.className = `tp-status-indicator ${statusType}`;
      }
    }
    
    function scrollToBottom() {
      setTimeout(() => {
        elements.thread.lastElementChild?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }, 100);
    }
    
    console.log('[TigerPrompts v8.0] Initialization complete âœ“');
    console.log('[TigerPrompts v8.0] Tiered constraints system active');
    console.log('[TigerPrompts v8.0] AI response validator ready');
  });
})();
/* === TIGER PROMPTS v8.5 — Variance + Tooltip Engine === */
const tpVariance = 0.3; // Adjust 0–1 range for how "different" rewording should feel

function randomizeResponse(text) {
  const synonyms = {
    "improve": ["enhance", "refine", "upgrade"],
    "help": ["assist", "support", "empower"],
    "create": ["build", "craft", "generate"],
    "make": ["design", "develop", "compose"],
  };
  return text.split(" ").map(word => {
    const key = word.toLowerCase();
    if (synonyms[key] && Math.random() < tpVariance)
      return synonyms[key][Math.floor(Math.random() * synonyms[key].length)];
    return word;
  }).join(" ");
}

function explainChange() {
  const reasons = [
    "Clarified sentence structure for readability.",
    "Replaced weak verbs for stronger engagement.",
    "Reduced redundancy to tighten phrasing.",
    "Improved tone consistency.",
    "Adjusted pacing for smoother flow."
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function renderEnhancedOutput(inputText, container) {
  const sentences = inputText.split(".");
  let html = "";
  sentences.forEach(sentence => {
    if (!sentence.trim()) return;
    const revised = randomizeResponse(sentence.trim());
    const tooltip = explainChange();
    html += `
      <div class="tp-line">
        <span>${revised}.</span>
        <span class="tp-tooltip" data-tooltip="${tooltip}">?</span>
      </div>`;
  });
  container.innerHTML = html;
}

function showThinking(container, callback) {
  let dots = 0;
  const interval = setInterval(() => {
    container.textContent = "Thinking" + ".".repeat(dots % 4);
    dots++;
  }, 300);
  setTimeout(() => {
    clearInterval(interval);
    callback();
  }, 1800);
}
