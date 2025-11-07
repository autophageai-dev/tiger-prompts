/* Tiger Prompts v8.0 – TPEM-1.1 Enhanced with Tiered Constraints */
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
      vibeMode: $('tp-vibe-mode'),
      fileDefsInput: $('tp-file-defs'),
      codingContext: $('tp-coding-context'),
      ctxExisting: $('tp-ctx-existing'),
      ctxCode: $('tp-ctx-code'),
      ctxLanguage: $('tp-ctx-language'),
      ctxTests: $('tp-ctx-tests'),
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
      mode: localStorage.getItem('tp-mode') || 'lite',
      explainMode: localStorage.getItem('tp-explain') === 'true',
      showPQS: localStorage.getItem('tp-show-pqs') !== 'false',
      savedPrompts: JSON.parse(localStorage.getItem('tp-saved') || '[]'),
      codingMode: localStorage.getItem('tp-coding-mode') === 'true',
      vibeMode: localStorage.getItem('tp-vibe-mode') === 'true',
      fileDefinitions: localStorage.getItem('tp-file-defs') || '',
      codeContext: {
        existingCode: '',
        language: '',
        isNewFeature: true,
        needsTesting: false
      }
    };
    
    // Initialize
    updateStatus('ready', '✅ TPEM-1.1 Ready');
    loadSavedPrompts();
    updateModeButtons();
    updateSettingButtons();
    updateCodingModeUI();
    updateVibeModeUI();
    
    // Load file definitions
    if (elements.fileDefsInput && state.fileDefinitions) {
      elements.fileDefsInput.value = state.fileDefinitions;
    }
    
    // === INPUT HANDLERS ===
    
    // Auto-resize textarea
    elements.input.addEventListener('input', () => {
      elements.input.style.height = 'auto';
      elements.input.style.height = Math.min(elements.input.scrollHeight, 200) + 'px';
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
    
    if (localStorage.getItem('tp-dark-mode') === 'true') {
      document.body.classList.add('tp-dark');
    }
    
    // === MODE TOGGLE ===
    
    elements.modeLite?.addEventListener('click', () => {
      state.mode = 'lite';
      localStorage.setItem('tp-mode', 'lite');
      updateModeButtons();
      updateStatus('ready', '✅ TPEM-Lite Mode');
    });
    
    elements.modePro?.addEventListener('click', () => {
      state.mode = 'pro';
      localStorage.setItem('tp-mode', 'pro');
      updateModeButtons();
      updateStatus('ready', '✅ TPEM-Pro Mode');
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
      
      if (elements.codingContext) {
        elements.codingContext.style.display = state.codingMode ? 'block' : 'none';
      }
      
      if (state.codingMode) {
        elements.input.placeholder = 'Enter your coding task... (Optimized for AI-assisted development)';
        updateStatus('ready', '💻 Coding Mode Active');
      } else {
        elements.input.placeholder = 'Enter your prompt... (Press Enter to enhance)';
        updateStatus('ready', '✅ TPEM-1.1 Ready');
      }
    });
    
    // === VIBE CODING MODE ===
    
    elements.vibeMode?.addEventListener('click', () => {
      state.vibeMode = !state.vibeMode;
      localStorage.setItem('tp-vibe-mode', state.vibeMode);
      updateVibeModeUI();
      
      if (state.vibeMode) {
        updateStatus('ready', '🐯 Vibe Coding Active');
      } else {
        updateStatus('ready', '✅ TPEM-1.1 Ready');
      }
    });
    
    // === FILE DEFINITIONS ===
    
    elements.fileDefsInput?.addEventListener('input', (e) => {
      state.fileDefinitions = e.target.value;
      localStorage.setItem('tp-file-defs', state.fileDefinitions);
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
      const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
      state.codeContext.language = selected.join(', ');
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
      
      updateStatus('processing', '🔍 Validating AI Response...');
      
      await sleep(800);
      
      const validation = validateAIResponse(code);
      displayValidationResults(validation);
      
      updateStatus('ready', '✅ Validation Complete');
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
          updateStatus('ready', '✅ TPEM-1.1 Ready');
        }
      }
    });
    
    // === MICROPHONE ===
    
    elements.micBtn?.addEventListener('click', () => {
      alert('🎤 Voice input coming soon!');
    });
    
    // === MAIN ENHANCEMENT LOGIC ===
    
    async function runEnhancer() {
      const prompt = elements.input.value.trim();
      
      if (!prompt) {
        elements.input.focus();
        return;
      }
      
      updateStatus('processing', state.mode === 'pro' 
        ? '🚀 Running TPEM-Pro Deep Analysis...' 
        : '⚡ Running TPEM-Lite Pipeline...');
      
      const msgContainer = createMessageContainer();
      elements.thread.appendChild(msgContainer);
      
      const originalPrompt = prompt;
      elements.input.value = '';
      elements.input.style.height = 'auto';
      elements.input.focus();
      
      scrollToBottom();
      
      // Show thinking animation (3 seconds)
      const content = msgContainer.querySelector('.tp-msg-content');
      content.innerHTML = '<div class="tp-thinking">Thinking<span class="tp-thinking-dots"></span></div>';
      
      // Animate dots
      let dotCount = 0;
      const dotsInterval = setInterval(() => {
        const dotsEl = content.querySelector('.tp-thinking-dots');
        if (dotsEl) {
          dotCount = (dotCount + 1) % 4;
          dotsEl.textContent = '.'.repeat(dotCount);
        }
      }, 300);
      
      await sleep(3000);
      clearInterval(dotsInterval);
      
      if (state.mode === 'pro') {
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
        
        await sleep(2000);
      }
      
      const result = await enhancePromptTPEM(originalPrompt);
      
      updateMessage(msgContainer, result);
      
      updateStatus('ready', '✅ Enhancement Complete');
      
      scrollToBottom();
    }
    
    // === TPEM-1.1 PIPELINE ===
    
    async function enhancePromptTPEM(rawPrompt) {
      console.log('[TPEM-1.1] Starting enhancement pipeline...');
      
      const taskType = classifyTask(rawPrompt);
      console.log(`[TPEM-1.1] Classified as: ${taskType}`);
      
      const ambiguityScore = calculateAmbiguity(rawPrompt);
      console.log(`[TPEM-1.1] Ambiguity score: ${ambiguityScore.toFixed(2)}`);
      
      const scaffold = buildScaffold(rawPrompt, taskType, ambiguityScore);
      
      const enhanced = synthesizeContext(scaffold, taskType, rawPrompt);
      
      const final = state.mode === 'pro' 
        ? applyProEnhancements(enhanced, taskType)
        : enhanced;
      
      const pqsBefore = calculatePQS(rawPrompt);
      const pqsAfter = calculatePQS(final);
      
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
      
      if (!/(for|to|audience|users|readers|customers|people|team)/.test(lower)) {
        score += 0.1;
      }
      
      if (!/(format|structure|json|markdown|list|table|style|output)/.test(lower)) {
        score += 0.1;
      }
      
      if (/(improve|better|optimize|enhance|fix|good)/.test(lower) && !/\d+/.test(prompt)) {
        score += 0.2;
      }
      
      if (!/(must|should|tone|style|length|words|characters|require|need)/.test(lower)) {
        score += 0.1;
      }
      
      if (prompt.split(' ').length < 5) {
        score += 0.15;
      }
      
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
      
      // If Vibe Mode is active, inject the directive
      if (state.vibeMode && state.codingMode) {
        sections.push('# VIBE CODING DIRECTIVE');
        sections.push('');
        sections.push('## Core Behavior');
        sections.push('- Roleplay as a senior full-stack engineer with decades of experience');
        sections.push('- **Never truncate code** - provide every single line');
        sections.push('- Never alter visual style, layout structure, or spacing without explicit instruction');
        sections.push('- Preserve all existing colors, fonts, and design elements');
        sections.push('- Make only surgical edits - fix or enhance what\'s broken, never rebuild from scratch');
        sections.push('- Do not rewrite logic, reorganize code, or add frameworks unless explicitly directed');
        sections.push('- No confirmation or double-checking questions - execute decisively');
        sections.push('- Output clean final code only - no summaries, no readmes, no installation guides');
        sections.push('- Never rename files - maintain all filenames exactly as specified');
        sections.push('- Ensure deterministic behavior - identical prompts must produce identical output');
        sections.push('');
        
        // Add file definitions if provided
        if (state.fileDefinitions.trim()) {
          sections.push('## File Definitions');
          sections.push('**CRITICAL: Never change these filenames:**');
          const files = state.fileDefinitions.split(',').map(f => f.trim()).filter(f => f);
          files.forEach(file => {
            sections.push(`- \`${file}\` - maintain this exact filename`);
          });
          sections.push('');
        }
        
        sections.push('## Task');
        sections.push(scaffold.prompt);
        sections.push('');
        
        if (state.codeContext.existingCode) {
          sections.push('## Existing Code Context');
          sections.push('```');
          sections.push(state.codeContext.existingCode);
          sections.push('```');
          sections.push('**CRITICAL:** Study the code above. Match its style, patterns, and conventions exactly.');
          sections.push('');
        }
        
        return sections.join('\n');
      }
      
      // Standard TPEM enhancement
      sections.push('# ENHANCED PROMPT (TPEM-1.1)');
      if (state.codingMode) {
        sections.push('**🚀 CODING MODE ACTIVE** - Optimized for AI-Assisted Development');
      }
      sections.push('');
      
      sections.push('## Role & Context');
      sections.push(getRoleForTask(taskType));
      sections.push('');
      
      sections.push('## Task');
      sections.push(scaffold.prompt);
      sections.push('');
      
      // Add file definitions if provided
      if (state.fileDefinitions.trim() && state.codingMode) {
        sections.push('## File Definitions');
        sections.push('**Never change these filenames:**');
        const files = state.fileDefinitions.split(',').map(f => f.trim()).filter(f => f);
        files.forEach(file => {
          sections.push(`- \`${file}\``);
        });
        sections.push('');
      }
      
      if (state.codeContext.existingCode) {
        sections.push('## Existing Code Context');
        sections.push('```');
        sections.push(state.codeContext.existingCode);
        sections.push('```');
        sections.push('');
        sections.push('**CRITICAL:** Study the code above before making changes. Match its style, patterns, and conventions exactly.');
        sections.push('');
      }
      
      sections.push('## Constraints');
      sections.push(...getConstraintsForTask(taskType));
      sections.push('');
      
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
      
      sections.push('## Process');
      sections.push(...getProcessForTask(taskType));
      sections.push('');
      
      sections.push('## Output Format');
      sections.push(...getOutputForTask(taskType));
      sections.push('');
      
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
      
      constraints.push(...getCriticalRules());
      
      if (context.hasExistingCode) {
        constraints.push(...getChangeManagementRules());
      }
      
      if (context.isNewFeature) {
        constraints.push(...getArchitectureRules());
      }
      
      if (context.needsTesting || /test|spec|jest|pytest|unittest/i.test(context.prompt)) {
        constraints.push(...getTestingRules());
      }
      
      if (context.language) {
        constraints.push(...getLanguageSpecificRules(context.language));
      }
      
      constraints.push('',
        '## ✨ CODE QUALITY CHECKLIST',
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
    
    function getCriticalRules() {
      return [
        '## 🚨 CRITICAL REQUIREMENTS (NON-NEGOTIABLE)',
        '',
        '### 1. Complete Code - Zero Truncation',
        '**NEVER use placeholders like:**',
        '   ❌ `// ... rest of code here`',
        '   ❌ `// continuing from above`',
        '   ❌ `// same as before`',
        '',
        '**ALWAYS provide:**',
        '   ✅ Every single line of code needed',
        '   ✅ All imports and dependencies at the top',
        '   ✅ Complete function bodies (no stubs)',
        '   ✅ Full file from start to finish',
        '',
        '### 2. Radical Transparency',
        '**If you cannot do something, say so immediately:**',
        '   ✅ "I cannot access external APIs, so I\'ll show you the structure"',
        '   ✅ "This requires testing in a browser - here\'s how to test it"',
        '   ✅ "I\'m not certain about X - check the docs at [link]"',
        '',
        '### 3. Explicit Change Communication',
        '**For every code change, explain:**',
        '   1. WHAT you changed (specific lines/functions)',
        '   2. WHY you changed it (what problem it solves)',
        '   3. IMPACT (what might break, what to test)',
        ''
      ];
    }
    
    function getChangeManagementRules() {
      return [
        '## 🔧 CHANGE MANAGEMENT (Modifying Existing Code)',
        '',
        '### Gold Standard Reference',
        '**Before making ANY changes:**',
        '   1. Study the existing code patterns',
        '   2. Match naming conventions exactly',
        '   3. Preserve the same indentation/spacing style',
        '   4. Keep the same comment style',
        '',
        '### Surgical Precision',
        '**ONLY modify what was explicitly requested:**',
        '   ❌ Do NOT "improve" working code',
        '   ❌ Do NOT refactor unrelated functions',
        '   ❌ Do NOT rename variables',
        '   ❌ Do NOT change formatting/style of unchanged code',
        ''
      ];
    }
    
    function getArchitectureRules() {
      return [
        '## 🏗️ ARCHITECTURE (New Features/Components)',
        '',
        '### Modularity Principles',
        '**Single Responsibility:**',
        '   Each function/component should do ONE thing',
        '',
        '### Separation of Concerns',
        '**Organize code into clear layers:**',
        '   📁 `/api` - Data fetching logic',
        '   📁 `/components` - UI components',
        '   📁 `/hooks` - Reusable stateful logic',
        '   📁 `/utils` - Pure utility functions',
        ''
      ];
    }
    
    function getTestingRules() {
      return [
        '## 🧪 TESTING REQUIREMENTS',
        '',
        '### Test Cases Format',
        '**For each function, provide:**',
        '```javascript',
        '// Test Case 1: Happy path',
        'Input: { id: 1, name: "John" }',
        'Expected: { id: 1, name: "John", processed: true }',
        '```',
        ''
      ];
    }
    
    function getLanguageSpecificRules(language) {
      const rules = {
        'javascript': [
          '',
          '## 📘 JAVASCRIPT BEST PRACTICES',
          '- Use `const` by default, `let` only when reassigning',
          '- Prefer arrow functions for callbacks',
          '- Use destructuring: `const { name, age } = user`',
          '- Always handle Promise rejections',
          ''
        ],
        'react': [
          '',
          '## ⚛️ REACT BEST PRACTICES',
          '- Use functional components + hooks',
          '- Destructure props',
          '- Use `key` prop in lists',
          '- Memoize expensive calculations',
          ''
        ],
        'typescript': [
          '',
          '## 📘 TYPESCRIPT BEST PRACTICES',
          '- Define interfaces for all data structures',
          '- Use union types',
          '- Avoid `any`',
          ''
        ],
        'python': [
          '',
          '## 🐍 PYTHON BEST PRACTICES',
          '- Follow PEP 8',
          '- Use type hints',
          '- Use list comprehensions',
          '- Context managers for resources',
          ''
        ]
      };
      
      return rules[language] || [];
    }
    
    function detectLanguage(prompt) {
      const lower = prompt.toLowerCase();
      
      if (/\breact\b/i.test(lower)) return 'react';
      if (/\btypescript\b|\.tsx?\b/i.test(lower)) return 'typescript';
      if (/\bpython\b|\.py\b/i.test(lower)) return 'python';
      if (/\bjavascript\b|\.jsx?\b|node\.?js/i.test(lower)) return 'javascript';
      
      return null;
    }
    
    function validateAIResponse(code) {
      const issues = [];
      
      const truncationPatterns = [
        { pattern: /\/\/\s*\.\.\./, message: 'Ellipsis placeholder found' },
        { pattern: /\/\/\s*rest of/i, message: 'Truncation comment found' },
        { pattern: /\/\/\s*continued/i, message: 'Continuation placeholder found' },
        { pattern: /\/\/\s*same as (above|before)/i, message: 'Reference to previous code' }
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
      
      if (/\b(useState|useEffect|useContext)\b/.test(code) && 
          !/import\s+.*\s+from\s+['"]react['"]/.test(code)) {
        issues.push({
          type: 'CRITICAL',
          category: 'Imports',
          problem: 'React hooks used but React import is missing',
          fix: 'Add: import { useState, useEffect } from "react" at the top'
        });
      }
      
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
      
      const criticalCount = issues.filter(i => i.type === 'CRITICAL').length;
      const warningCount = issues.filter(i => i.type === 'WARNING').length;
      const score = Math.max(0, 100 - (criticalCount * 30) - (warningCount * 10));
      
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
    
    function generateFollowUpPrompt(issues) {
      if (issues.length === 0) {
        return null;
      }
      
      const critical = issues.filter(i => i.type === 'CRITICAL');
      const warnings = issues.filter(i => i.type === 'WARNING');
      
      let prompt = '## Issues Found in Your Code\n\n';
      
      if (critical.length > 0) {
        prompt += '### 🚨 CRITICAL ISSUES (Must Fix):\n\n';
        critical.forEach((issue, i) => {
          prompt += `${i + 1}. **${issue.category}:** ${issue.problem}\n`;
          prompt += `   - Fix: ${issue.fix}\n\n`;
        });
      }
      
      if (warnings.length > 0) {
        prompt += '### ⚠️ WARNINGS (Should Fix):\n\n';
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
                <div class="tp-validate-issue-fix">💡 ${issue.fix}</div>
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
                <div class="tp-validate-issue-fix">💡 ${issue.fix}</div>
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
    
    function applyProEnhancements(enhanced, taskType) {
      let sections = [];
      
      const existingSections = enhanced.split('\n## ');
      sections.push(existingSections[0]);
      
      for (let i = 1; i < existingSections.length; i++) {
        const section = existingSections[i];
        
        if (section.startsWith('Process')) {
          sections.push('Process\n' + 
            expandProcessStepsPro(taskType) + '\n\n' +
            '### Checkpoint Questions:\n' +
            getCheckpointQuestions(taskType).join('\n'));
        }
        else if (section.startsWith('Quality Bar')) {
          sections.push('Examples & Test Cases\n' + 
            getDetailedExamplesPro(taskType).join('\n\n'));
          sections.push(section);
        }
        else if (section.startsWith('Constraints')) {
          sections.push('Constraints\n' + 
            getExpandedConstraintsPro(taskType).join('\n') + '\n\n' +
            '### Additional Considerations:\n' +
            getAdditionalConsiderations(taskType).join('\n'));
        }
        else {
          sections.push(section);
        }
      }
      
      const qualityIndex = sections.findIndex(s => s.startsWith('Quality Bar'));
      if (qualityIndex > 0) {
        sections.splice(qualityIndex + 1, 0, 
          'Verification Steps\n' + getVerificationStepsPro(taskType).join('\n'),
          'Common Pitfalls to Avoid\n' + getCommonPitfallsPro(taskType).join('\n')
        );
      }
      
      return sections.join('\n## ');
    }
    
    function expandProcessStepsPro(type) {
      const base = [
        '**Stage 1: Preparation & Analysis**',
        '- Thoroughly analyze the request',
        '- Identify all explicit and implicit requirements',
        '',
        '**Stage 2: Strategic Planning**',
        '- Break down into logical sub-tasks',
        '- Determine optimal approach/methodology',
        '',
        '**Stage 3: Execution**',
        '- Follow systematic implementation process',
        '- Maintain quality standards throughout',
        '',
        '**Stage 4: Review & Refinement**',
        '- Cross-check against requirements',
        '- Test/validate all components'
      ];
      return base.join('\n');
    }
    
    function getCheckpointQuestions(type) {
      return [
        '- [ ] Have all requirements been addressed?',
        '- [ ] Is the output clear and unambiguous?',
        '- [ ] Have edge cases been considered?',
        '- [ ] Is the quality bar met?'
      ];
    }
    
    function getDetailedExamplesPro(type) {
      const examples = [
        '### Example 1: Optimal Input/Output Pattern',
        '```',
        'INPUT: [Detailed example of ideal input format]',
        'OUTPUT: [Expected output format with all requirements met]',
        '```'
      ];
      return examples;
    }
    
    function getExpandedConstraintsPro(type) {
      return [
        '**Primary Requirements:**',
        '- Accuracy: All information must be factually correct',
        '- Completeness: Address all aspects of the request',
        '- Clarity: Use clear, unambiguous language'
      ];
    }
    
    function getAdditionalConsiderations(type) {
      return [
        '- Consider performance implications at scale',
        '- Think about future extensibility needs',
        '- Account for different user skill levels'
      ];
    }
    
    function getVerificationStepsPro(type) {
      return [
        '### Pre-Delivery Checklist:',
        '',
        '**Completeness Check:**',
        '- [ ] All requirements addressed',
        '- [ ] No missing information',
        '',
        '**Quality Check:**',
        '- [ ] Clear and unambiguous language',
        '- [ ] Proper structure and formatting'
      ];
    }
    
    function getCommonPitfallsPro(type) {
      return [
        '⚠️ **Insufficient Detail:** Don\'t be vague - be specific and explicit',
        '⚠️ **Assumption Overload:** State assumptions clearly',
        '⚠️ **Ignoring Edge Cases:** Boundary conditions reveal important issues'
      ];
    }
    
    function calculatePQS(prompt) {
      const metrics = {
        clarity: calculateClarity(prompt),
        structure: calculateStructure(prompt),
        constraintDensity: calculateConstraintDensity(prompt),
        modelCompatibility: calculateModelCompatibility(prompt),
        goalAlignment: calculateGoalAlignment(prompt),
        cognitiveLoad: calculateCognitiveLoad(prompt)
      };
      
      let pqs = 0;
      for (const [metric, value] of Object.entries(metrics)) {
        pqs += value * TPEM.PQS_WEIGHTS[metric];
      }
      
      return Math.min(Math.max(pqs, 0), 1);
    }
    
    function calculateClarity(prompt) {
      let score = 0.3;
      if (prompt.length > 20) score += 0.2;
      if (/\b(objective|goal|task|need|want)\b/i.test(prompt)) score += 0.2;
      if (!/\b(something|thing|stuff|it|that)\b/i.test(prompt)) score += 0.3;
      return Math.min(score, 1);
    }
    
    function calculateStructure(prompt) {
      let score = 0.2;
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
      let score = 0.5;
      if (prompt.length < 2000) score += 0.2;
      if (!/[^\x00-\x7F]/.test(prompt)) score += 0.15;
      if (!/<script|eval\(/i.test(prompt)) score += 0.15;
      return Math.min(score, 1);
    }
    
    function calculateGoalAlignment(prompt) {
      let score = 0.4;
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
    
    function generateExplanation(original, enhanced, taskType, ambiguity, pqsBefore, pqsAfter) {
      const changes = [];
      
      if (state.codingMode) {
        changes.push(`<strong>💻 Coding Mode Active:</strong> Enhanced with tiered coding constraints.`);
      }
      
      changes.push(`<strong>Task Classification:</strong> Detected as "${taskType}" based on keyword analysis.`);
      
      changes.push(`<strong>Ambiguity Score:</strong> ${ambiguity.toFixed(2)} - ${
        ambiguity < 0.3 ? 'Low (clear prompt)' : 
        ambiguity < 0.6 ? 'Moderate (some assumptions needed)' :
        'High (significant assumptions required)'
      }`);
      
      changes.push(`<strong>PQS Improvement:</strong> ${pqsBefore.toFixed(2)} → ${pqsAfter.toFixed(2)} (+${(pqsAfter - pqsBefore).toFixed(2)})`);
      
      changes.push(`<strong>Added Structure:</strong> Organized into Role, Task, Constraints, Process, Output Format, and Quality Bar sections.`);
      
      return changes;
    }
    
    function getRoleForTask(type) {
      // If coding mode is active, always use coding-specific role
      if (state.codingMode || type === 'code') {
        const codingRoles = [
          'You are a senior software engineer with 15+ years of experience in production systems.',
          'You are a principal engineer who has architected systems serving millions of users.',
          'You are a staff engineer specializing in clean architecture and maintainable code.',
          'You are a tech lead with deep expertise in software design patterns and best practices.'
        ];
        return codingRoles[Math.floor(Math.random() * codingRoles.length)];
      }
      
      const roles = {
        'generate': 'You are an expert content creator and writer with deep knowledge of persuasive communication.',
        'transform': 'You are a professional editor and content transformer skilled in style adaptation.',
        'analyze': 'You are a senior analyst with expertise in critical thinking and evidence-based reasoning.',
        'plan': 'You are a strategic planner and consultant with experience in project management.',
        'extract': 'You are a data extraction specialist with expertise in structured data processing.',
        'math': 'You are a mathematics expert skilled in clear explanations and rigorous proofs.',
        'image': 'You are an expert prompt engineer specializing in image generation systems.'
      };
      return roles[type] || roles.generate;
    }
    
    function getConstraintsForTask(type) {
      // For coding, be specific and comprehensive
      if (state.codingMode || type === 'code') {
        return [
          '- Language: Specify version and environment',
          '- Contracts: Define input/output clearly',
          '- Testing: Include test cases',
          '- Edge Cases: Handle errors and boundaries',
          '- Performance: Consider time/space complexity'
        ];
      }
      
      // For other tasks, add variance - don't always use same generic constraints
      const baseConstraints = {
        'generate': [
          ['- Tone: Engaging and clear', '- Tone: Professional yet approachable', '- Tone: Conversational and authentic'],
          ['- Length: 300-500 words unless specified', '- Length: Concise but complete', '- Length: As needed to fully address the topic'],
          ['- Structure: Use clear headings and logical flow', '- Structure: Organize with clear sections', '- Structure: Follow narrative arc'],
          ['- Facts: Cite sources or mark as uncertain', '- Facts: Verify accuracy', '- Facts: Support claims with evidence']
        ],
        'transform': [
          ['- Fidelity: Preserve core meaning and intent', '- Fidelity: Maintain original message'],
          ['- Accuracy: Maintain factual correctness', '- Accuracy: No information loss'],
          ['- Style: Match requested tone/format exactly', '- Style: Adapt to target format seamlessly']
        ],
        'analyze': [
          ['- Methodology: Show numbered reasoning steps', '- Methodology: Clear analytical framework'],
          ['- Evidence: Present supporting data and sources', '- Evidence: Data-driven conclusions'],
          ['- Balance: Consider counterarguments', '- Balance: Multiple perspectives'],
          ['- Conclusion: Provide confidence level', '- Conclusion: Clear verdict with reasoning']
        ]
      };
      
      const options = baseConstraints[type];
      if (!options) {
        return [
          '- Clear and specific output',
          '- Address all requirements',
          '- Provide actionable results'
        ];
      }
      
      // Randomly pick one variant from each constraint category
      return options.map(variants => 
        variants[Math.floor(Math.random() * variants.length)]
      );
    }
    
    function getProcessForTask(type) {
      // For coding, keep specific and comprehensive
      if (state.codingMode || type === 'code') {
        const variants = [
          [
            '1. Understand requirements and constraints',
            '2. Design solution architecture',
            '3. Implement with tests',
            '4. Review and refactor'
          ],
          [
            '1. Clarify specification',
            '2. Outline approach and data structures',
            '3. Code with documentation',
            '4. Validate with test cases'
          ],
          [
            '1. Break down problem',
            '2. Plan implementation strategy',
            '3. Write clean, documented code',
            '4. Test edge cases'
          ]
        ];
        return variants[Math.floor(Math.random() * variants.length)];
      }
      
      // Add variance for non-coding tasks
      const processes = {
        'generate': [
          [
            '1. Identify target audience and purpose',
            '2. Outline key points and structure',
            '3. Draft with clear, engaging language',
            '4. Review for clarity and completeness'
          ],
          [
            '1. Define goals and audience',
            '2. Structure main ideas',
            '3. Write compelling content',
            '4. Polish and refine'
          ]
        ],
        'transform': [
          [
            '1. Analyze source content and intent',
            '2. Map to target format/style requirements',
            '3. Transform while preserving meaning',
            '4. Verify accuracy and completeness'
          ]
        ],
        'analyze': [
          [
            '1. List key hypotheses or claims',
            '2. Gather supporting evidence',
            '3. Consider counterarguments',
            '4. Synthesize findings'
          ],
          [
            '1. Define analytical framework',
            '2. Examine evidence systematically',
            '3. Weigh competing explanations',
            '4. Draw conclusions'
          ]
        ]
      };
      
      const variants = processes[type] || processes.generate;
      return variants[Math.floor(Math.random() * variants.length)];
    }
    
    function getOutputForTask(type) {
      const outputs = {
        'generate': [
          '- Use Markdown with clear headings',
          '- Structure: Introduction, Body, Conclusion',
          '- Include relevant examples or data'
        ],
        'transform': [
          '- Match requested output format exactly',
          '- Preserve original structure if applicable',
          '- Include change log if significant edits'
        ],
        'analyze': [
          '- **Final Answer:** [one clear sentence]',
          '- **Reasoning:** [numbered steps with evidence]',
          '- **Confidence:** [0-100% with justification]'
        ],
        'plan': [
          '- **Roadmap:** Timeline or Gantt chart',
          '- **KPIs:** Bulleted list with targets',
          '- **Risk Register:** Threats + mitigation'
        ],
        'extract': [
          '- Valid JSON matching provided schema',
          '- Include "_confidence" field per object',
          '- Use null for missing required fields'
        ],
        'code': [
          '- **Code:** Syntax-highlighted blocks',
          '- **Tests:** Cases with expected output',
          '- **Usage:** Command/function to run'
        ],
        'math': [
          '- **Given:** List knowns',
          '- **Solution:** Step-by-step with equations',
          '- **Answer:** Final result with units'
        ],
        'image': [
          '- **Main Prompt:** Single comprehensive string',
          '- **Negative Prompt:** What to exclude',
          '- **Settings:** aspect, seed, steps, cfg'
        ]
      };
      return outputs[type] || outputs.generate;
    }
    
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
      
      content.textContent = result.enhanced;
      
      if (state.showPQS) {
        footer.style.display = 'flex';
        pqsScore.textContent = `${result.pqsAfter.toFixed(2)} (+${result.deltaQ.toFixed(2)})`;
        meta.textContent = `${result.taskType.toUpperCase()} · TPEM-${state.mode.toUpperCase()} · Ambiguity: ${result.ambiguityScore.toFixed(2)}`;
      }
      
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
    
    function updateVibeModeUI() {
      elements.vibeMode?.classList.toggle('active', state.vibeMode);
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
    
    console.log('[TigerPrompts v8.0] Initialization complete ✓');
  });
})();
