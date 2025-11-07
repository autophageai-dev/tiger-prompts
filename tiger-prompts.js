/* Tiger Prompts v9.0 – LLM Agent Mode + Vibe Coding Tools */
(function() {
  'use strict';
  
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  
  // OpenAI API Configuration
  const OPENAI_CONFIG = {
    apiKey: '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',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini'  // More accessible model
  };
  
  // LLM Enhancement Prompts
  const LLM_PROMPTS = {
    light: `You are an expert prompt engineer and logic refiner.
Your task: take any user's input prompt and make it more effective, specific, and logically coherent — while keeping it concise and preserving the user's original intent.

Always:
✅ Clarify vague phrases with exact language.
✅ Add structure: organize goals, context, and output requirements in logical order.
✅ Refine logic: ensure each instruction is actionable and self-consistent.
✅ Add precision: specify tone, format, audience, and constraints where missing.
✅ Preserve brevity — improve depth without making it longer than necessary.
✅ Avoid filler or redundant rephrasing.
✅ Never change the user's intent or creativity.

Output only the enhanced prompt, formatted cleanly and ready for direct use by an AI model.`,
    
    deep: `You are a senior prompt architect specializing in complex task decomposition.

Your task: transform the user's prompt into a comprehensive, structured directive that maximizes AI effectiveness.

Structure your output as:

# ENHANCED PROMPT

## Role & Context
[Define the AI's expert role and situational context]

## Primary Objective
[Crystal-clear statement of the main goal]

## Requirements & Constraints
[Numbered list of must-haves and limitations]

## Process
[Step-by-step approach to accomplish the task]

## Output Format
[Exact specifications for deliverable format]

## Quality Criteria
[How to evaluate success]

## Examples (if applicable)
[Concrete examples that demonstrate expected output]

Make every section actionable and specific. Preserve the user's original intent while dramatically improving clarity and structure.`
  };
  
  // Vibe Coding Tool Prompts
  const VIBE_TOOL_PROMPTS = {
    explainer: `You are a senior software engineer who excels at explaining code clearly.

Analyze the provided code and explain:
1. **What it does** (high-level purpose)
2. **How it works** (step-by-step logic)
3. **Key patterns & techniques** used
4. **Potential improvements** or concerns

Be clear, thorough, and educational. Use examples where helpful.`,
    
    refactor: `You are an expert code reviewer focused on clean architecture and best practices.

Analyze the provided code and suggest improvements for:
1. **Code quality** (readability, maintainability)
2. **Performance** (efficiency, optimization opportunities)
3. **Architecture** (structure, patterns, modularity)
4. **Best practices** (language-specific conventions)
5. **Security** (potential vulnerabilities)

For each suggestion, explain WHY it's an improvement and show a concrete example.`,
    
    bugHunter: `You are a senior debugging specialist with decades of experience finding subtle bugs.

Analyze the provided code for:
1. **Logic errors** (incorrect conditions, off-by-one, etc.)
2. **Runtime issues** (null references, type errors, async problems)
3. **Edge cases** (boundary conditions, empty inputs, special values)
4. **Performance problems** (memory leaks, inefficient loops)
5. **Security vulnerabilities** (injection risks, validation gaps)

For each issue found:
- Describe the problem clearly
- Show the problematic code
- Explain the impact
- Provide a fixed version`,
    
    docGen: `You are a technical documentation expert.

Generate comprehensive documentation for the provided code:

1. **Overview** - What the code does and its purpose
2. **API/Function Documentation** - Parameters, return values, types
3. **Usage Examples** - How to use the code with real examples
4. **Dependencies** - Required libraries or modules
5. **Notes** - Important considerations, limitations, or caveats

Format as clean, readable Markdown. Include code examples in proper syntax-highlighted blocks.`,
    
    testWriter: `You are a test-driven development expert.

Generate comprehensive test cases for the provided code:

1. **Happy path tests** - Normal expected usage
2. **Edge case tests** - Boundary conditions, empty inputs, max values
3. **Error handling tests** - Invalid inputs, exceptions
4. **Integration tests** - How it works with other components (if applicable)

For each test:
- Name/description
- Input values
- Expected output
- Assertion to verify

Format tests in the appropriate testing framework style (Jest, pytest, etc.) based on the language.`
  };
  
  // TPEM-1.1 Configuration from Whitepaper
  const TPEM = {
    PQS_WEIGHTS: {
      clarity: 0.25,
      structure: 0.20,
      constraintDensity: 0.15,
      modelCompatibility: 0.15,
      goalAlignment: 0.15,
      cognitiveLoad: 0.10
    },
    
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
    console.log('[TigerPrompts v9.0] Initializing with LLM Agent Mode...');
    
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
      explainToggle: $('tp-explain-toggle'),
      pqsToggle: $('tp-pqs-toggle'),
      savedList: $('tp-saved-list'),
      vibeCodingMode: $('tp-vibe-coding-mode'),
      vibeContext: $('tp-vibe-context'),
      fileDefsInput: $('tp-file-defs'),
      ctxExisting: $('tp-ctx-existing'),
      ctxCode: $('tp-ctx-code'),
      ctxLanguage: $('tp-ctx-language'),
      ctxTests: $('tp-ctx-tests'),
      validateInput: $('tp-validate-input'),
      validateBtn: $('tp-validate-btn'),
      validateResults: $('tp-validate-results'),
      llmAgentToggle: $('tp-llm-agent-toggle'),
      llmSubmodes: $('tp-llm-submodes'),
      llmLight: $('tp-llm-light'),
      llmDeep: $('tp-llm-deep'),
      toolExplainer: $('tp-tool-explainer'),
      toolRefactor: $('tp-tool-refactor'),
      toolBugHunter: $('tp-tool-bug-hunter'),
      toolDocGen: $('tp-tool-doc-gen'),
      toolTestWriter: $('tp-tool-test-writer'),
      modal: $('tp-vibe-tool-modal'),
      modalTitle: $('tp-modal-title'),
      modalInput: $('tp-modal-input'),
      modalSubmit: $('tp-modal-submit'),
      modalResults: $('tp-modal-results'),
      modalResultsContent: $('tp-modal-results-content'),
      modalClose: $('tp-modal-close')
    };
    
    // Verify core elements
    if (!elements.sendBtn || !elements.input || !elements.thread) {
      console.error('[TigerPrompts] Missing core elements');
      return;
    }
    
    console.log('[TigerPrompts v9.0] All elements found');
    
    // State
    let state = {
      llmAgentMode: localStorage.getItem('tp-llm-agent') !== 'false', // Default ON
      llmEnhancementMode: localStorage.getItem('tp-llm-mode') || 'light',
      explainMode: localStorage.getItem('tp-explain') === 'true',
      showPQS: localStorage.getItem('tp-show-pqs') !== 'false',
      savedPrompts: JSON.parse(localStorage.getItem('tp-saved') || '[]'),
      vibeCodingMode: localStorage.getItem('tp-vibe-coding') === 'true',
      fileDefinitions: localStorage.getItem('tp-file-defs') || '',
      codeContext: {
        existingCode: '',
        language: '',
        isNewFeature: true,
        needsTesting: false
      }
    };
    
    // Initialize
    updateStatus('ready', '✅ LLM Agent Mode Ready');
    loadSavedPrompts();
    updateSettingButtons();
    updateVibeCodingUI();
    updateLLMAgentUI();
    
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
    
    // === LLM AGENT MODE TOGGLE ===
    
    elements.llmAgentToggle?.addEventListener('click', () => {
      state.llmAgentMode = !state.llmAgentMode;
      localStorage.setItem('tp-llm-agent', state.llmAgentMode);
      updateLLMAgentUI();
      
      if (state.llmAgentMode) {
        updateStatus('ready', '🤖 LLM Agent Mode Active');
      } else {
        updateStatus('ready', '⚙️ Local TPEM Mode Active');
      }
    });
    
    // === LLM ENHANCEMENT MODE TOGGLE ===
    
    elements.llmLight?.addEventListener('click', () => {
      state.llmEnhancementMode = 'light';
      localStorage.setItem('tp-llm-mode', 'light');
      updateLLMAgentUI();
      updateStatus('ready', '⚡ Light Enhancement Mode');
    });
    
    elements.llmDeep?.addEventListener('click', () => {
      state.llmEnhancementMode = 'deep';
      localStorage.setItem('tp-llm-mode', 'deep');
      updateLLMAgentUI();
      updateStatus('ready', '🚀 Deep Enhancement Mode');
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
    
    // === VIBE CODING MODE ===
    
    elements.vibeCodingMode?.addEventListener('click', () => {
      state.vibeCodingMode = !state.vibeCodingMode;
      localStorage.setItem('tp-vibe-coding', state.vibeCodingMode);
      updateVibeCodingUI();
      
      if (elements.vibeContext) {
        elements.vibeContext.style.display = state.vibeCodingMode ? 'block' : 'none';
      }
      
      if (state.vibeCodingMode) {
        elements.input.placeholder = 'Enter your coding task... (Vibe Coding Mode active)';
        updateStatus('ready', '💻 Vibe Coding Mode Active');
      } else {
        elements.input.placeholder = 'Enter your prompt... (Press Enter to enhance)';
        updateStatus('ready', '✅ LLM Agent Mode Ready');
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
    
    // === VIBE CODING TOOLS ===
    
    const vibeTools = {
      explainer: { name: 'Code Explainer', icon: '🔍', prompt: VIBE_TOOL_PROMPTS.explainer, action: 'Explain Code' },
      refactor: { name: 'Refactor Advisor', icon: '🔧', prompt: VIBE_TOOL_PROMPTS.refactor, action: 'Analyze & Suggest' },
      bugHunter: { name: 'Bug Hunter', icon: '🐛', prompt: VIBE_TOOL_PROMPTS.bugHunter, action: 'Find Bugs' },
      docGen: { name: 'Doc Generator', icon: '📝', prompt: VIBE_TOOL_PROMPTS.docGen, action: 'Generate Docs' },
      testWriter: { name: 'Test Writer', icon: '🧪', prompt: VIBE_TOOL_PROMPTS.testWriter, action: 'Write Tests' }
    };
    
    elements.toolExplainer?.addEventListener('click', () => openVibeTool('explainer'));
    elements.toolRefactor?.addEventListener('click', () => openVibeTool('refactor'));
    elements.toolBugHunter?.addEventListener('click', () => openVibeTool('bugHunter'));
    elements.toolDocGen?.addEventListener('click', () => openVibeTool('docGen'));
    elements.toolTestWriter?.addEventListener('click', () => openVibeTool('testWriter'));
    
    let currentTool = null;
    
    function openVibeTool(toolId) {
      currentTool = toolId;
      const tool = vibeTools[toolId];
      
      elements.modalTitle.textContent = tool.name;
      elements.modalInput.value = '';
      elements.modalInput.placeholder = 'Paste your code here...';
      elements.modalSubmit.innerHTML = `<i class="fa-solid fa-paper-plane"></i> ${tool.action}`;
      elements.modalResults.style.display = 'none';
      
      elements.modal.style.display = 'flex';
      setTimeout(() => elements.modalInput.focus(), 100);
    }
    
    elements.modalClose?.addEventListener('click', () => {
      elements.modal.style.display = 'none';
    });
    
    elements.modal?.addEventListener('click', (e) => {
      if (e.target === elements.modal) {
        elements.modal.style.display = 'none';
      }
    });
    
    elements.modalSubmit?.addEventListener('click', async () => {
      const code = elements.modalInput.value.trim();
      
      if (!code) {
        alert('Please paste some code first');
        return;
      }
      
      const tool = vibeTools[currentTool];
      
      elements.modalSubmit.disabled = true;
      elements.modalSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
      
      try {
        const result = await callOpenAI(tool.prompt, code);
        
        elements.modalResults.style.display = 'block';
        elements.modalResultsContent.innerHTML = `<pre>${escapeHtml(result)}</pre>`;
        elements.modalResults.scrollIntoView({ behavior: 'smooth' });
        
      } catch (error) {
        alert('Error: ' + error.message);
      } finally {
        elements.modalSubmit.disabled = false;
        elements.modalSubmit.innerHTML = `<i class="fa-solid fa-paper-plane"></i> ${tool.action}`;
      }
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
          updateStatus('ready', '✅ LLM Agent Mode Ready');
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
      
      const isLLM = state.llmAgentMode;
      
      updateStatus('processing', isLLM 
        ? `🤖 ${state.llmEnhancementMode === 'light' ? 'Light' : 'Deep'} Enhancement via OpenAI...` 
        : '⚙️ Running Local TPEM Pipeline...');
      
      const msgContainer = createMessageContainer();
      elements.thread.appendChild(msgContainer);
      
      const originalPrompt = prompt;
      elements.input.value = '';
      elements.input.style.height = 'auto';
      elements.input.focus();
      
      scrollToBottom();
      
      // Show thinking animation
      const content = msgContainer.querySelector('.tp-msg-content');
      content.innerHTML = '<div class="tp-thinking">Thinking<span class="tp-thinking-dots"></span></div>';
      
      let dotCount = 0;
      const dotsInterval = setInterval(() => {
        const dotsEl = content.querySelector('.tp-thinking-dots');
        if (dotsEl) {
          dotCount = (dotCount + 1) % 4;
          dotsEl.textContent = '.'.repeat(dotCount);
        }
      }, 300);
      
      await sleep(1500);
      clearInterval(dotsInterval);
      
      let result;
      
      try {
        if (isLLM) {
          // LLM Agent Mode
          result = await enhanceWithLLM(originalPrompt);
        } else {
          // Local TPEM Mode
          result = await enhancePromptTPEM(originalPrompt);
        }
        
        updateMessage(msgContainer, result);
        updateStatus('ready', '✅ Enhancement Complete');
        
      } catch (error) {
        console.error('Enhancement error:', error);
        content.innerHTML = `<div class="tp-error">❌ Error: ${error.message}</div>`;
        updateStatus('ready', '❌ Enhancement Failed');
      }
      
      scrollToBottom();
    }
    
    // === LLM ENHANCEMENT ===
    
    async function enhanceWithLLM(rawPrompt) {
      const systemPrompt = state.llmEnhancementMode === 'light' 
        ? LLM_PROMPTS.light 
        : LLM_PROMPTS.deep;
      
      let userPrompt = rawPrompt;
      
      // If Vibe Coding Mode is active, add context
      if (state.vibeCodingMode) {
        userPrompt = buildVibeCodingPrompt(rawPrompt);
      }
      
      const enhanced = await callOpenAI(systemPrompt, userPrompt);
      
      const pqsBefore = calculatePQS(rawPrompt);
      const pqsAfter = calculatePQS(enhanced);
      
      return {
        original: rawPrompt,
        enhanced: enhanced,
        taskType: classifyTask(rawPrompt),
        ambiguityScore: calculateAmbiguity(rawPrompt),
        pqsBefore,
        pqsAfter,
        deltaQ: pqsAfter - pqsBefore,
        explanation: state.explainMode ? generateLLMExplanation(rawPrompt, enhanced) : null,
        mode: 'llm-' + state.llmEnhancementMode
      };
    }
    
    function buildVibeCodingPrompt(rawPrompt) {
      const sections = [rawPrompt];
      
      if (state.fileDefinitions.trim()) {
        sections.push('\n\n## File Definitions');
        sections.push('**CRITICAL: Never change these filenames:**');
        const files = state.fileDefinitions.split(',').map(f => f.trim()).filter(f => f);
        files.forEach(file => {
          sections.push(`- \`${file}\``);
        });
      }
      
      if (state.codeContext.existingCode) {
        sections.push('\n\n## Existing Code Context');
        sections.push('```');
        sections.push(state.codeContext.existingCode);
        sections.push('```');
        sections.push('**CRITICAL:** Study the code above. Match its style, patterns, and conventions exactly.');
      }
      
      if (state.codeContext.language) {
        sections.push(`\n\n## Languages: ${state.codeContext.language}`);
      }
      
      if (state.codeContext.needsTesting) {
        sections.push('\n\n## Requirements: Include comprehensive test cases');
      }
      
      return sections.join('\n');
    }
    
    function generateLLMExplanation(original, enhanced) {
      const changes = [];
      
      if (state.llmAgentMode) {
        changes.push(`<strong>🤖 LLM Agent Mode:</strong> Enhanced via OpenAI ${state.llmEnhancementMode === 'light' ? '(Light)' : '(Deep)'}`);
      }
      
      if (state.vibeCodingMode) {
        changes.push(`<strong>💻 Vibe Coding Mode:</strong> Applied coding-specific optimizations`);
      }
      
      const pqsBefore = calculatePQS(original);
      const pqsAfter = calculatePQS(enhanced);
      changes.push(`<strong>PQS Improvement:</strong> ${pqsBefore.toFixed(2)} → ${pqsAfter.toFixed(2)} (+${(pqsAfter - pqsBefore).toFixed(2)})`);
      
      const lengthChange = enhanced.length - original.length;
      changes.push(`<strong>Length Change:</strong> ${lengthChange > 0 ? '+' : ''}${lengthChange} characters`);
      
      return changes;
    }
    
    async function callOpenAI(systemPrompt, userPrompt) {
      const response = await fetch(OPENAI_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: OPENAI_CONFIG.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
      }
      
      const data = await response.json();
      return data.choices[0].message.content.trim();
    }
    
    // === LOCAL TPEM PIPELINE ===
    
    async function enhancePromptTPEM(rawPrompt) {
      console.log('[TPEM-1.1] Starting local enhancement pipeline...');
      
      const taskType = classifyTask(rawPrompt);
      const ambiguityScore = calculateAmbiguity(rawPrompt);
      const scaffold = buildScaffold(rawPrompt, taskType, ambiguityScore);
      const enhanced = synthesizeContext(scaffold, taskType, rawPrompt);
      
      const pqsBefore = calculatePQS(rawPrompt);
      const pqsAfter = calculatePQS(enhanced);
      
      const explanation = state.explainMode 
        ? generateExplanation(rawPrompt, enhanced, taskType, ambiguityScore, pqsBefore, pqsAfter)
        : null;
      
      return {
        original: rawPrompt,
        enhanced: enhanced,
        taskType,
        ambiguityScore,
        pqsBefore,
        pqsAfter,
        deltaQ: pqsAfter - pqsBefore,
        explanation,
        mode: 'local-tpem'
      };
    }
    
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
    
    function calculateAmbiguity(prompt) {
      let score = 0;
      const lower = prompt.toLowerCase();
      
      if (!/(for|to|audience|users|readers|customers|people|team)/.test(lower)) score += 0.1;
      if (!/(format|structure|json|markdown|list|table|style|output)/.test(lower)) score += 0.1;
      if (/(improve|better|optimize|enhance|fix|good)/.test(lower) && !/\d+/.test(prompt)) score += 0.2;
      if (!/(must|should|tone|style|length|words|characters|require|need)/.test(lower)) score += 0.1;
      if (prompt.split(' ').length < 5) score += 0.15;
      if (!/(about|regarding|for|on|with|using|that|which)/.test(lower)) score += 0.15;
      
      return Math.min(score, 1);
    }
    
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
    
    function synthesizeContext(scaffold, taskType, rawPrompt) {
      const sections = [];
      
      sections.push('# ENHANCED PROMPT (TPEM-1.1)');
      if (state.vibeCodingMode) {
        sections.push('**💻 VIBE CODING MODE ACTIVE**');
      }
      sections.push('');
      
      sections.push('## Role & Context');
      sections.push(getRoleForTask(taskType));
      sections.push('');
      
      sections.push('## Task');
      sections.push(scaffold.prompt);
      sections.push('');
      
      if (state.fileDefinitions.trim() && state.vibeCodingMode) {
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
        sections.push('**CRITICAL:** Study the code above. Match its style, patterns, and conventions exactly.');
        sections.push('');
      }
      
      sections.push('## Constraints');
      sections.push(...getConstraintsForTask(taskType));
      sections.push('');
      
      sections.push('## Process');
      sections.push(...getProcessForTask(taskType));
      sections.push('');
      
      sections.push('## Output Format');
      sections.push(...getOutputForTask(taskType));
      sections.push('');
      
      sections.push('## Quality Bar');
      sections.push('- Meets all specified constraints');
      sections.push('- Clear, unambiguous, and directly usable');
      sections.push('- Self-check for errors before finalizing');
      
      return sections.join('\n');
    }
    
    function getRoleForTask(type) {
      if (state.vibeCodingMode || type === 'code') {
        return 'You are a senior software engineer with 15+ years of experience in production systems.';
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
      if (state.vibeCodingMode || type === 'code') {
        return [
          '- Complete code (no truncation/placeholders)',
          '- Radical transparency (explain what you can/cannot do)',
          '- Explicit change communication',
          '- Match existing code style',
          '- Include all imports and dependencies'
        ];
      }
      
      return [
        '- Clear and specific output',
        '- Address all requirements',
        '- Provide actionable results'
      ];
    }
    
    function getProcessForTask(type) {
      return [
        '1. Understand requirements',
        '2. Plan approach',
        '3. Execute systematically',
        '4. Review and verify'
      ];
    }
    
    function getOutputForTask(type) {
      if (type === 'code') {
        return [
          '- Syntax-highlighted code blocks',
          '- Inline comments explaining key logic',
          '- Usage examples'
        ];
      }
      return [
        '- Use clear Markdown formatting',
        '- Organize with logical structure',
        '- Include relevant examples'
      ];
    }
    
    function generateExplanation(original, enhanced, taskType, ambiguity, pqsBefore, pqsAfter) {
      const changes = [];
      
      if (state.vibeCodingMode) {
        changes.push(`<strong>💻 Vibe Coding Mode:</strong> Applied coding-specific constraints`);
      }
      
      changes.push(`<strong>Task Classification:</strong> ${taskType}`);
      changes.push(`<strong>Ambiguity Score:</strong> ${ambiguity.toFixed(2)}`);
      changes.push(`<strong>PQS Improvement:</strong> ${pqsBefore.toFixed(2)} → ${pqsAfter.toFixed(2)}`);
      changes.push(`<strong>Enhancement:</strong> Added structure, constraints, and process steps`);
      
      return changes;
    }
    
    // === PQS CALCULATION ===
    
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
    
    // === VALIDATOR ===
    
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
          fix: 'Add try/catch blocks or .catch() handlers'
        });
      }
      
      const criticalCount = issues.filter(i => i.type === 'CRITICAL').length;
      const warningCount = issues.filter(i => i.type === 'WARNING').length;
      const score = Math.max(0, 100 - (criticalCount * 30) - (warningCount * 10));
      
      return {
        passed: criticalCount === 0,
        score,
        issues,
        summary: {
          critical: criticalCount,
          warnings: warningCount,
          total: issues.length
        }
      };
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
    
    // === UI HELPERS ===
    
    function createMessageContainer() {
      const container = document.createElement('div');
      container.className = 'tp-msg';
      container.innerHTML = `
        <div class="tp-msg-header">
          <div class="tp-msg-label">
            <i class="fa-solid fa-sparkles"></i>
            Enhanced by ${state.llmAgentMode ? 'OpenAI' : 'TPEM'}
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
        meta.textContent = `${result.taskType.toUpperCase()} · ${result.mode.toUpperCase()}`;
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
    
    function updateSettingButtons() {
      elements.explainToggle?.classList.toggle('active', state.explainMode);
      elements.pqsToggle?.classList.toggle('active', state.showPQS);
    }
    
    function updateVibeCodingUI() {
      elements.vibeCodingMode?.classList.toggle('active', state.vibeCodingMode);
      if (elements.vibeContext) {
        elements.vibeContext.style.display = state.vibeCodingMode ? 'block' : 'none';
      }
    }
    
    function updateLLMAgentUI() {
      elements.llmAgentToggle?.classList.toggle('active', state.llmAgentMode);
      
      if (elements.llmSubmodes) {
        elements.llmSubmodes.style.display = state.llmAgentMode ? 'flex' : 'none';
      }
      
      elements.llmLight?.classList.toggle('active', state.llmEnhancementMode === 'light');
      elements.llmDeep?.classList.toggle('active', state.llmEnhancementMode === 'deep');
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
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    console.log('[TigerPrompts v9.0] Initialization complete ✓');
  });
})();
