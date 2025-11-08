/* Tiger Prompts v12.1 – AI-SPECIFIC OPTIMIZATION TIPS
 * New: AI model-specific tips injection
 * New: Language-specific coding tips
 * Fixed: Standardized tooltip system
 */
(function() {
  'use strict';
  
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  
  const WORKER_CONFIG = {
    endpoint: 'https://tigerprompts-proxy.autophageai.workers.dev',
    model: 'gpt-4o-mini'
  };
  
  const ICON_MAP = {
    sparkles: '✨',
    copy: '📋',
    bookmark: '🔖',
    play: '▶',
    check: '✓',
    spinner: '⟳',
    robot: '🤖',
    graduationCap: '🎓',
    chartLine: '📊'
  };
  
  // CODING AI OPTIMIZATION TIPS DATABASE
  // These are tips for the AI the user will CODE WITH (not the enhancement AI)
  const CODING_AI_TIPS = {
    'claude-sonnet': {
      name: 'Claude Sonnet',
      general: [
        'Prefers conversational, natural language',
        'Use XML tags for structured sections',
        'Provide clear role context upfront',
        'Works well with explicit constraints'
      ],
      coding: {
        javascript: [
          'CRITICAL: Do not be verbose',
          'Do not create README files unless explicitly requested',
          'Do not add extensive comments - code should be self-documenting',
          'Avoid tutorial-style explanations',
          'Get straight to the implementation'
        ],
        typescript: [
          'Be concise with type definitions',
          'Avoid over-explaining TypeScript features',
          'No tutorial content',
          'Focus on practical implementation'
        ],
        python: [
          'Keep it terse and Pythonic',
          'No extensive docstrings unless requested',
          'Avoid tutorial-style code',
          'Focus on elegant solutions'
        ],
        react: [
          'No verbose component documentation',
          'Avoid explaining React basics',
          'Get to the implementation quickly',
          'No unnecessary prop documentation'
        ],
        css: [
          'Concise class names',
          'No extensive comments',
          'Modern CSS only',
          'Avoid explaining basic CSS concepts'
        ]
      }
    },
    'gpt-5': {
      name: 'GPT-5 / ChatGPT',
      general: [
        'Can handle complex, multi-step reasoning',
        'Use clear section headers for organization',
        'Be specific about output format',
        'Provide examples for best results'
      ],
      coding: {
        javascript: [
          'Specify ES6+ or CommonJS module format',
          'Request async/await over callbacks',
          'Can handle complex architecture decisions',
          'Ask for performance optimization suggestions'
        ],
        typescript: [
          'Explicitly request strict typing',
          'Ask for interface definitions',
          'Good at generic type inference',
          'Can suggest advanced TypeScript patterns'
        ],
        python: [
          'Specify Python 3.x version',
          'Request type hints for functions',
          'Strong with async patterns',
          'Good at suggesting Pythonic solutions'
        ],
        react: [
          'Request functional components with hooks',
          'Can design complex state management',
          'Ask for performance optimization (useMemo, useCallback)',
          'Understands patterns and anti-patterns'
        ],
        css: [
          'Specify vanilla CSS, SCSS, or Tailwind',
          'Can create complex animations',
          'Understands modern CSS features',
          'Ask for responsive breakpoints'
        ]
      }
    },
    'cursor': {
      name: 'Cursor',
      general: [
        'Reference existing codebase context',
        'Mention file structure and relationships',
        'Specify which files to modify vs create new',
        'Describe integration points with existing code'
      ],
      coding: {
        javascript: [
          'Reference existing functions and patterns',
          'Mention import paths and module structure',
          'Describe where code should fit in current architecture',
          'Specify existing conventions to follow'
        ],
        typescript: [
          'Reference existing types and interfaces',
          'Mention where type definitions live',
          'Describe relationships to existing code',
          'Specify config and tsconfig context'
        ],
        python: [
          'Mention existing class hierarchy',
          'Reference virtual environment setup',
          'Describe integration with existing modules',
          'Specify package dependencies'
        ],
        react: [
          'Reference existing component structure',
          'Mention state management approach',
          'Describe styling methodology in use',
          'Specify existing hooks and contexts'
        ],
        css: [
          'Reference existing class naming patterns',
          'Mention CSS methodology (BEM, CSS Modules)',
          'Describe current responsive breakpoints',
          'Specify preprocessor or framework in use'
        ]
      }
    },
    'github-copilot': {
      name: 'GitHub Copilot',
      general: [
        'Focus on immediate code context',
        'Describe expected behavior clearly',
        'Use inline comments for guidance',
        'Reference nearby functions and patterns'
      ],
      coding: {
        javascript: [
          'Mention existing file structure',
          'Include import context',
          'Specify module system (ESM/CommonJS)',
          'Reference nearby functions'
        ],
        typescript: [
          'Reference existing types nearby',
          'Mention interface locations',
          'Include import paths',
          'Specify config requirements'
        ],
        python: [
          'Include import statements context',
          'Reference existing modules',
          'Mention decorators or patterns in use',
          'Specify package versions if critical'
        ],
        react: [
          'Reference component hierarchy',
          'Mention existing hooks',
          'Include import paths',
          'Specify state management library'
        ],
        css: [
          'Reference existing class naming',
          'Mention CSS methodology',
          'Include preprocessor context',
          'Specify framework (Bootstrap, Tailwind)'
        ]
      }
    },
    'windsurf': {
      name: 'Windsurf',
      general: [
        'Provide complete project context',
        'Describe file relationships clearly',
        'Mention architectural patterns',
        'Specify integration requirements'
      ],
      coding: {
        javascript: [
          'Describe module architecture',
          'Mention build tools and bundlers',
          'Reference testing setup',
          'Specify linting rules'
        ],
        typescript: [
          'Describe type architecture',
          'Mention shared types location',
          'Reference tsconfig setup',
          'Specify strict mode requirements'
        ],
        python: [
          'Describe project structure',
          'Mention testing framework',
          'Reference requirements.txt or pyproject.toml',
          'Specify Python version'
        ],
        react: [
          'Describe component architecture',
          'Mention routing setup',
          'Reference state management',
          'Specify build configuration'
        ],
        css: [
          'Describe styling architecture',
          'Mention theme system',
          'Reference design tokens',
          'Specify CSS-in-JS if applicable'
        ]
      }
    }
  };
  
  const TEMPLATES = {
    'fresh-session': {
      name: 'Fresh Coding Session',
      icon: '🚀',
      placeholder: 'Describe the feature or component you want to build...',
      systemContext: `You are helping a developer start a fresh coding session. Their vibe coding context provides tech stack and files. Structure your response to include:
- Clear role definition for the AI
- File structure awareness
- Code that integrates with their existing patterns
- Best practices for their stack`,
      enableVibeCoding: true,
      autoOpenDrawer: true,
      depth: 'deep'
    },
    'code-feature': {
      name: 'Code Feature',
      icon: '💻',
      placeholder: 'What feature do you want to build?',
      systemContext: `Structure this as a feature request with:
- Clear requirements
- Integration points with existing code
- Error handling needs
- Documentation requirements`,
      enableVibeCoding: true,
      autoOpenDrawer: false,
      depth: 'deep'
    },
    'fix-bug': {
      name: 'Fix Bug',
      icon: '🐛',
      placeholder: 'Describe the bug or issue you\'re experiencing...',
      systemContext: `This is a debugging request. Structure to include:
- Problem description
- Expected vs actual behavior
- Error messages or symptoms
- Code context for debugging`,
      enableVibeCoding: true,
      autoOpenDrawer: false,
      depth: 'deep'
    },
    'draft-email': {
      name: 'Draft Email',
      icon: '📧',
      placeholder: 'What should this email be about?',
      systemContext: `Structure as a professional email request including:
- Recipient context
- Purpose and key points
- Appropriate tone
- Clear call to action`,
      enableVibeCoding: false,
      autoOpenDrawer: false,
      depth: 'light'
    },
    'write-content': {
      name: 'Write Content',
      icon: '✍️',
      placeholder: 'What content do you need? (blog post, article, social media, etc.)',
      systemContext: `Structure as a content creation request with:
- Content type and format
- Target audience
- Key messages
- Tone and style guidelines`,
      enableVibeCoding: false,
      autoOpenDrawer: false,
      depth: 'light'
    },
    'analyze-data': {
      name: 'Analyze Data',
      icon: '📊',
      placeholder: 'What data do you need analyzed? (paste data or describe it)',
      systemContext: `Structure as a data analysis request:
- Data description and format
- Analysis objectives
- Insights needed
- Visualization preferences`,
      enableVibeCoding: false,
      autoOpenDrawer: false,
      depth: 'deep'
    },
    'research': {
      name: 'Research Query',
      icon: '🔍',
      placeholder: 'What topic do you want to research?',
      systemContext: `Structure as a research request including:
- Specific research areas
- Depth and scope
- Desired output format
- Source credibility requirements`,
      enableVibeCoding: false,
      autoOpenDrawer: false,
      depth: 'deep'
    },
    'social-media': {
      name: 'Social Media',
      icon: '📱',
      placeholder: 'What\'s the topic or message for your social media post?',
      systemContext: `Structure as a social media content request:
- Platform (Instagram, Twitter, LinkedIn, etc.)
- Tone and voice (casual, professional, witty)
- Key message and hook
- Hashtag strategy
- Call to action`,
      enableVibeCoding: false,
      autoOpenDrawer: false,
      depth: 'light'
    },
    'brainstorm': {
      name: 'Brainstorm',
      icon: '💡',
      placeholder: 'What do you need ideas for?',
      systemContext: `Structure as a creative brainstorming session:
- Problem or opportunity to explore
- Constraints or requirements
- Target audience or use case
- Desired number of ideas
- Evaluation criteria for ideas`,
      enableVibeCoding: false,
      autoOpenDrawer: false,
      depth: 'light'
    }
  };
  
  const MODEL_HINTS = {
    'gpt-4o-mini': '⚡ Fast & efficient',
    'gpt-4o': '💎 Best quality & reasoning',
    'claude-sonnet': '🔮 Creative & thorough',
    'copilot': '⚡ Code-focused'
  };
  
  const LLM_PROMPTS = {
    light: `You are an expert prompt engineer specializing in gentle refinement.

Your task: Take the user's prompt and polish it with minimal changes. Keep their voice and intent completely intact.

What to do:
✅ Clarify any vague phrases with more specific language
✅ Fix grammar and improve sentence flow
✅ Add 1-2 sentences ONLY if critical information is missing
✅ Use more precise, concrete words where applicable
✅ Keep the same length and structure (don't reorganize)

What NOT to do:
❌ Don't restructure or reformat the prompt
❌ Don't add headers, sections, or bullet points
❌ Don't change the user's tone or style
❌ Don't make it significantly longer

Output: The polished prompt, ready to use. Keep it natural and conversational.`,
    
    deep: `You are a senior prompt architect specializing in complex task structuring.

Your task: Transform the user's prompt into a comprehensive, well-structured directive that maximizes AI effectiveness.

Structure your output as follows:

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
[Concrete examples demonstrating expected output]

Make every section actionable and specific. Preserve the user's original intent while dramatically improving clarity and structure.`
  };
  
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
      'generate': { keywords: ['write', 'create', 'generate', 'draft', 'compose', 'blog', 'email', 'ad', 'post'], icon: '✍' },
      'transform': { keywords: ['rewrite', 'translate', 'summarize', 'condense', 'expand', 'paraphrase'], icon: '↻' },
      'analyze': { keywords: ['analyze', 'explain', 'compare', 'diagnose', 'critique', 'evaluate', 'assess'], icon: '🔍' },
      'plan': { keywords: ['plan', 'strategy', 'roadmap', 'outline', 'brief', 'campaign'], icon: '📐' },
      'extract': { keywords: ['extract', 'parse', 'structure', 'table', 'json', 'list', 'entity'], icon: '⊲' },
      'code': { keywords: ['code', 'function', 'script', 'debug', 'refactor', 'test', 'program', 'algorithm'], icon: '💻' },
      'math': { keywords: ['calculate', 'solve', 'compute', 'derive', 'proof', 'formula'], icon: '🔢' },
      'image': { keywords: ['image', 'picture', 'photo', 'visual', 'illustration', 'art'], icon: '🖼' }
    }
  };
  
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[TigerPrompts v12.1] Initializing - AI-Specific Optimization Tips...');
    initializeApp();
  });
  
  function initializeApp() {
    const elements = {
      sendBtn: $('tp-send'),
      voiceBtn: $('tp-voice'),
      input: $('tp-input'),
      thread: $('tp-thread'),
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
      vibeCodingToggle: $('tp-vibe-coding-toggle'),
      fileDefsInput: $('tp-file-defs'),
      ctxExisting: $('tp-ctx-existing'),
      ctxCode: $('tp-ctx-code'),
      ctxTests: $('tp-ctx-tests'),
      llmToggle: $('tp-llm-toggle'),
      enhancementDepth: $('tp-enhancement-depth'),
      autoRunToggle: $('tp-auto-run-toggle'),
      llmSelect: $('tp-llm-select'),
      codingAISelect: $('tp-coding-ai-select'),
      logoWrap: $('tp-logo-wrap'),
      vibeDrawer: $('tp-vibe-drawer'),
      vibeDrawerToggle: $('tp-vibe-drawer-toggle'),
      drawerClose: $('tp-drawer-close'),
      drawerSave: $('tp-drawer-save'),
      emptyState: $('tp-empty-state'),
      modelGuideBtn: $('tp-model-guide-btn'),
      modelGuideModal: $('tp-model-guide-modal'),
      modelGuideClose: $('tp-model-guide-close'),
      modelHint: $('tp-model-hint'),
      pathwayBanner: $('tp-pathway-banner')
    };
    
    if (!elements.sendBtn || !elements.input || !elements.thread) {
      console.error('[TigerPrompts] CRITICAL: Missing core elements');
      alert('Tiger Prompts failed to initialize. Please check the console.');
      return;
    }
    
    console.log('[TigerPrompts v12.1] All core elements found');
    
    let state = {
      useLLM: localStorage.getItem('tp-use-llm') !== 'false',
      enhancementDepth: localStorage.getItem('tp-enhancement-depth') || 'light',
      autoRun: localStorage.getItem('tp-auto-run') === 'true',
      selectedLLM: localStorage.getItem('tp-selected-llm') || 'gpt-4o-mini',
      codingAI: localStorage.getItem('tp-coding-ai') || 'claude-sonnet',
      explainMode: localStorage.getItem('tp-explain') === 'true',
      showPQS: localStorage.getItem('tp-show-pqs') !== 'false',
      savedPrompts: JSON.parse(localStorage.getItem('tp-saved') || '[]'),
      vibeCodingMode: localStorage.getItem('tp-vibe-coding') !== 'false',
      fileDefinitions: localStorage.getItem('tp-file-defs') || '',
      logoHidden: false,
      messageCount: 0,
      activeTemplate: null,
      codeContext: {
        existingCode: '',
        languages: [],
        isNewFeature: true,
        needsTesting: false
      }
    };
    
    updateStatus('ready', state.useLLM ? '🤖 LLM Mode Active' : '⚡ Local Mode Active');
    loadSavedPrompts();
    updateSettingButtons();
    updateEmptyState();
    updateModelHint();
    
    if (elements.enhancementDepth) {
      elements.enhancementDepth.value = state.enhancementDepth;
    }
    if (elements.llmSelect) {
      elements.llmSelect.value = state.selectedLLM;
    }
    if (elements.codingAISelect) {
      elements.codingAISelect.value = state.codingAI;
    }
    
    const llmToggleItem = elements.llmToggle?.closest('.tp-toggle-item');
    if (llmToggleItem && state.useLLM) {
      llmToggleItem.classList.add('active');
    }
    
    const autoRunToggleItem = elements.autoRunToggle?.closest('.tp-toggle-item');
    if (autoRunToggleItem && state.autoRun) {
      autoRunToggleItem.classList.add('active');
    }
    
    const vibeCodingToggleItem = elements.vibeCodingToggle?.closest('.tp-toggle-item');
    if (vibeCodingToggleItem && state.vibeCodingMode) {
      vibeCodingToggleItem.classList.add('active');
    }
    
    if (state.vibeCodingMode && elements.vibeDrawerToggle) {
      elements.vibeDrawerToggle.style.display = 'flex';
    }
    
    if (state.vibeCodingMode) {
      elements.input.placeholder = 'Message Tiger Prompts... (Vibe Coding Mode active)';
    }
    
    if (localStorage.getItem('tp-dark-mode') === null) {
      document.body.classList.add('tp-dark');
      localStorage.setItem('tp-dark-mode', 'true');
    } else if (localStorage.getItem('tp-dark-mode') === 'true') {
      document.body.classList.add('tp-dark');
    }
    
    if (elements.fileDefsInput && state.fileDefinitions) {
      elements.fileDefsInput.value = state.fileDefinitions;
    }
    
    // === JS-POWERED TOOLTIP SYSTEM (STANDARDIZED) ===
    
    let activeTooltip = null;
    
    const createTooltipElement = (text) => {
      const tooltip = document.createElement('div');
      tooltip.className = 'tp-tooltip-popup';
      tooltip.textContent = text;
      tooltip.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 12px;
        line-height: 1.5;
        max-width: 260px;
        z-index: 999999;
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        text-align: left;
        white-space: normal;
        word-wrap: break-word;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-weight: 500;
      `;
      return tooltip;
    };
    
    const positionTooltip = (tooltip, trigger) => {
      const rect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      let top = rect.top - tooltipRect.height - 8;
      
      if (left < 10) left = 10;
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      
      if (top < 10) {
        top = rect.bottom + 8;
      }
      
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    };
    
    const showTooltip = (trigger, text) => {
      if (activeTooltip) {
        if (activeTooltip.element && activeTooltip.element.parentNode) {
          activeTooltip.element.parentNode.removeChild(activeTooltip.element);
        }
        activeTooltip = null;
      }
      
      const tooltip = createTooltipElement(text);
      document.body.appendChild(tooltip);
      
      positionTooltip(tooltip, trigger);
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          tooltip.style.visibility = 'visible';
          tooltip.style.opacity = '1';
        });
      });
      
      activeTooltip = { element: tooltip, trigger };
    };
    
    const hideTooltip = () => {
      if (activeTooltip) {
        activeTooltip.element.style.opacity = '0';
        activeTooltip.element.style.visibility = 'hidden';
        setTimeout(() => {
          if (activeTooltip && activeTooltip.element.parentNode) {
            activeTooltip.element.parentNode.removeChild(activeTooltip.element);
          }
          activeTooltip = null;
        }, 200);
      }
    };
    
    const initializeTooltips = () => {
      document.querySelectorAll('.tp-tooltip, .tp-tooltip-inline').forEach(trigger => {
        const tooltipText = trigger.getAttribute('data-tooltip');
        if (!tooltipText) return;
        
        let showTimeout;
        let isButton = trigger.tagName === 'BUTTON';
        
        trigger.addEventListener('mouseenter', () => {
          if (window.innerWidth > 768) {
            showTimeout = setTimeout(() => {
              showTooltip(trigger, tooltipText);
            }, 400);
          }
        });
        
        trigger.addEventListener('mouseleave', () => {
          clearTimeout(showTimeout);
          if (window.innerWidth > 768) {
            hideTooltip();
          }
        });
        
        trigger.addEventListener('click', (e) => {
          clearTimeout(showTimeout);
          
          if (window.innerWidth <= 768) {
            e.stopPropagation();
            if (activeTooltip && activeTooltip.trigger === trigger) {
              hideTooltip();
            } else {
              showTooltip(trigger, tooltipText);
            }
          } else if (!isButton) {
            e.stopPropagation();
            if (activeTooltip && activeTooltip.trigger === trigger) {
              hideTooltip();
            } else {
              showTooltip(trigger, tooltipText);
            }
          } else {
            hideTooltip();
          }
        });
      });
    };
    
    initializeTooltips();
    
    document.addEventListener('click', (e) => {
      if (activeTooltip && !e.target.closest('.tp-tooltip') && !e.target.closest('.tp-tooltip-inline')) {
        hideTooltip();
      }
    });
    
    window.addEventListener('scroll', () => {
      if (activeTooltip) {
        positionTooltip(activeTooltip.element, activeTooltip.trigger);
      }
    }, { passive: true });
    
    window.addEventListener('resize', () => {
      if (activeTooltip) {
        positionTooltip(activeTooltip.element, activeTooltip.trigger);
      }
    }, { passive: true });
    
    // === INPUT HANDLERS ===
    
    elements.input.addEventListener('input', () => {
      elements.input.style.height = 'auto';
      elements.input.style.height = Math.min(elements.input.scrollHeight, 200) + 'px';
      
      if (elements.input.value.trim() === '' && state.activeTemplate) {
        const template = TEMPLATES[state.activeTemplate];
        if (template) {
          elements.input.placeholder = template.placeholder;
        }
      }
      
      updateEmptyState();
    });
    
    elements.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        runEnhancer();
      }
    });
    
    elements.sendBtn.addEventListener('click', runEnhancer);
    
    // === LOGO CLICK ===
    
    const logoImages = document.querySelectorAll('.tp-logo, .tp-sidebar-logo');
    logoImages.forEach(logo => {
      logo.addEventListener('click', () => {
        if (state.messageCount > 0 || state.activeTemplate) {
          if (elements.thread) {
            elements.thread.innerHTML = '';
          }
          if (elements.input) {
            elements.input.value = '';
            elements.input.style.height = 'auto';
            elements.input.placeholder = state.vibeCodingMode 
              ? 'Message Tiger Prompts... (Vibe Coding Mode active)' 
              : 'Message Tiger Prompts...';
          }
          
          state.messageCount = 0;
          state.logoHidden = false;
          state.activeTemplate = null;
          
          if (elements.logoWrap) {
            elements.logoWrap.classList.remove('hidden');
          }
          
          if (elements.pathwayBanner) {
            elements.pathwayBanner.style.display = 'none';
          }
          
          if (elements.vibeDrawer) {
            elements.vibeDrawer.classList.remove('open');
          }
          
          updateEmptyState();
          updateStatus('ready', state.useLLM ? '🤖 LLM Mode Active' : '⚡ Local Mode Active');
        }
      });
      
      logo.style.cursor = 'pointer';
    });
    
    // === SIDEBAR CONTROLS ===
    
    elements.toggleSidebar?.addEventListener('click', () => {
      if (elements.sidebar && elements.layout) {
        elements.sidebar.classList.add('collapsed');
        elements.layout.classList.add('collapsed');
      }
    });
    
    elements.collapseTab?.addEventListener('click', () => {
      if (elements.sidebar && elements.layout) {
        elements.sidebar.classList.remove('collapsed');
        elements.layout.classList.remove('collapsed');
      }
    });
    
    // === THEME TOGGLE ===
    
    elements.themeToggle?.addEventListener('click', () => {
      document.body.classList.toggle('tp-dark');
      localStorage.setItem('tp-dark-mode', document.body.classList.contains('tp-dark'));
    });
    
    // === LLM TOGGLE ===
    
    elements.llmToggle?.addEventListener('click', () => {
      state.useLLM = !state.useLLM;
      localStorage.setItem('tp-use-llm', state.useLLM);
      
      const toggleItem = elements.llmToggle.closest('.tp-toggle-item');
      if (toggleItem) {
        toggleItem.classList.toggle('active', state.useLLM);
      }
      
      updateStatus('ready', state.useLLM ? '🤖 LLM Mode Active' : '⚡ Local Mode Active');
    });
    
    // === ENHANCEMENT DEPTH ===
    
    elements.enhancementDepth?.addEventListener('change', (e) => {
      state.enhancementDepth = e.target.value;
      localStorage.setItem('tp-enhancement-depth', state.enhancementDepth);
      
      if (state.enhancementDepth === 'light') {
        updateStatus('ready', '✨ Light Enhancement');
      } else {
        updateStatus('ready', '🔥 Deep Enhancement');
      }
    });
    
    // === AUTO-RUN TOGGLE ===
    
    elements.autoRunToggle?.addEventListener('click', () => {
      state.autoRun = !state.autoRun;
      localStorage.setItem('tp-auto-run', state.autoRun);
      
      const toggleItem = elements.autoRunToggle.closest('.tp-toggle-item');
      if (toggleItem) {
        toggleItem.classList.toggle('active', state.autoRun);
      }
      
      updateStatus('ready', state.autoRun ? '▶️ Auto-Run Enabled' : '⏸️ Auto-Run Disabled');
    });
    
    // === LLM SELECT ===
    
    elements.llmSelect?.addEventListener('change', (e) => {
      state.selectedLLM = e.target.value;
      localStorage.setItem('tp-selected-llm', state.selectedLLM);
      
      const modelNames = {
        'gpt-4o-mini': 'ChatGPT 4o-mini',
        'gpt-4o': 'ChatGPT 4o',
        'claude-sonnet': 'Claude Sonnet',
        'copilot': 'Copilot'
      };
      
      updateStatus('ready', `✅ Selected: ${modelNames[state.selectedLLM]}`);
      updateModelHint();
    });
    
    // === CODING AI SELECT ===
    
    elements.codingAISelect?.addEventListener('change', (e) => {
      state.codingAI = e.target.value;
      localStorage.setItem('tp-coding-ai', state.codingAI);
      
      const codingAINames = {
        'claude-sonnet': 'Claude Sonnet',
        'gpt-5': 'GPT-5 / ChatGPT',
        'cursor': 'Cursor',
        'github-copilot': 'GitHub Copilot',
        'windsurf': 'Windsurf'
      };
      
      updateStatus('ready', `💻 Coding with: ${codingAINames[state.codingAI]}`);
    });
    
    // === TEMPLATE SYSTEM ===
    
    document.querySelectorAll('.tp-template').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const templateId = btn.dataset.template;
        const template = TEMPLATES[templateId];
        
        if (!template) return;
        
        state.activeTemplate = templateId;
        
        if (elements.input) {
          elements.input.placeholder = template.placeholder;
          elements.input.focus();
        }
        
        if (elements.enhancementDepth) {
          elements.enhancementDepth.value = template.depth;
          state.enhancementDepth = template.depth;
          localStorage.setItem('tp-enhancement-depth', template.depth);
        }
        
        if (template.enableVibeCoding && !state.vibeCodingMode) {
          state.vibeCodingMode = true;
          localStorage.setItem('tp-vibe-coding', state.vibeCodingMode);
          
          const toggleItem = elements.vibeCodingToggle?.closest('.tp-toggle-item');
          if (toggleItem) {
            toggleItem.classList.add('active');
          }
          
          if (elements.vibeDrawerToggle) {
            elements.vibeDrawerToggle.style.display = 'flex';
          }
        }
        
        if (elements.emptyState) {
          elements.emptyState.classList.add('hidden');
        }
        
        showPathwayBanner(template);
        
        if (template.autoOpenDrawer && template.enableVibeCoding && elements.vibeDrawer) {
          setTimeout(() => {
            elements.vibeDrawer.classList.add('open');
          }, 100);
        }
      });
    });
    
    function showPathwayBanner(template) {
      if (!elements.pathwayBanner) return;
      
      const icon = elements.pathwayBanner.querySelector('.tp-pathway-icon');
      const text = elements.pathwayBanner.querySelector('.tp-pathway-text');
      
      if (icon) icon.textContent = template.icon;
      if (text) text.textContent = `${template.name} mode active - ${template.placeholder}`;
      
      elements.pathwayBanner.style.display = 'flex';
      
      setTimeout(() => {
        elements.pathwayBanner.style.display = 'none';
      }, 15000);
    }
    
    if (elements.pathwayBanner) {
      const closeBtn = elements.pathwayBanner.querySelector('.tp-pathway-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          elements.pathwayBanner.style.display = 'none';
        });
      }
    }
    
    // === MODEL GUIDE MODAL ===
    
    elements.modelGuideBtn?.addEventListener('click', () => {
      if (elements.modelGuideModal) {
        elements.modelGuideModal.classList.add('open');
      }
    });
    
    elements.modelGuideClose?.addEventListener('click', () => {
      if (elements.modelGuideModal) {
        elements.modelGuideModal.classList.remove('open');
      }
    });
    
    const modelModalOverlay = elements.modelGuideModal?.querySelector('.tp-modal-overlay');
    if (modelModalOverlay) {
      modelModalOverlay.addEventListener('click', () => {
        if (elements.modelGuideModal) {
          elements.modelGuideModal.classList.remove('open');
        }
      });
    }
    
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
    
    elements.vibeCodingToggle?.addEventListener('click', () => {
      state.vibeCodingMode = !state.vibeCodingMode;
      localStorage.setItem('tp-vibe-coding', state.vibeCodingMode);
      
      const toggleItem = elements.vibeCodingToggle.closest('.tp-toggle-item');
      if (toggleItem) {
        toggleItem.classList.toggle('active', state.vibeCodingMode);
      }
      
      if (elements.vibeDrawerToggle) {
        elements.vibeDrawerToggle.style.display = state.vibeCodingMode ? 'flex' : 'none';
      }
      
      if (state.vibeCodingMode) {
        elements.input.placeholder = 'Message Tiger Prompts... (Vibe Coding Mode active)';
        updateStatus('ready', '💻 Vibe Coding Mode Active');
      } else {
        elements.input.placeholder = 'Message Tiger Prompts...';
        updateStatus('ready', state.useLLM ? '🤖 LLM Mode Active' : '⚡ Local Mode Active');
      }
    });
    
    // === VIBE DRAWER ===
    
    elements.vibeDrawerToggle?.addEventListener('click', () => {
      if (elements.vibeDrawer) {
        elements.vibeDrawer.classList.add('open');
      }
    });
    
    elements.drawerClose?.addEventListener('click', () => {
      if (elements.vibeDrawer) {
        elements.vibeDrawer.classList.remove('open');
      }
    });
    
    elements.drawerSave?.addEventListener('click', () => {
      if (elements.vibeDrawer) {
        elements.vibeDrawer.classList.remove('open');
        
        updateStatus('ready', '✅ Vibe Coding settings saved!');
        
        if (elements.input) {
          elements.input.focus();
        }
        
        setTimeout(() => {
          updateStatus('ready', state.useLLM ? '🤖 LLM Mode Active' : '⚡ Local Mode Active');
        }, 2000);
      }
    });
    
    const drawerOverlay = elements.vibeDrawer?.querySelector('.tp-drawer-overlay');
    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', () => {
        if (elements.vibeDrawer) {
          elements.vibeDrawer.classList.remove('open');
        }
      });
    }
    
    // === VOICE BUTTON ===
    
    elements.voiceBtn?.addEventListener('click', () => {
      alert('🎤 Voice input coming soon!');
    });
    
    // === FILE DEFINITIONS ===
    
    elements.fileDefsInput?.addEventListener('input', (e) => {
      state.fileDefinitions = e.target.value;
      localStorage.setItem('tp-file-defs', state.fileDefinitions);
    });
    
    // === CODING CONTEXT ===
    
    elements.ctxExisting?.addEventListener('change', (e) => {
      if (elements.ctxCode) {
        elements.ctxCode.style.display = e.target.checked ? 'block' : 'none';
        state.codeContext.isNewFeature = !e.target.checked;
      }
    });
    
    elements.ctxCode?.addEventListener('input', (e) => {
      state.codeContext.existingCode = e.target.value;
    });
    
    document.querySelectorAll('.tp-language-checkbox input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        state.codeContext.languages = Array.from(document.querySelectorAll('.tp-language-checkbox input[type="checkbox"]:checked'))
          .map(cb => cb.value);
      });
    });
    
    elements.ctxTests?.addEventListener('change', (e) => {
      state.codeContext.needsTesting = e.target.checked;
    });
    
    // === RESET ===
    
    elements.resetBtn?.addEventListener('click', () => {
      if (elements.thread && elements.thread.children.length > 0) {
        if (confirm('Clear all messages?')) {
          elements.thread.innerHTML = '';
          if (elements.input) {
            elements.input.value = '';
            elements.input.style.height = 'auto';
            
            if (state.vibeCodingMode) {
              elements.input.placeholder = 'Message Tiger Prompts... (Vibe Coding Mode active)';
            } else {
              elements.input.placeholder = 'Message Tiger Prompts...';
            }
          }
          state.messageCount = 0;
          state.logoHidden = false;
          state.activeTemplate = null;
          
          if (elements.logoWrap) {
            elements.logoWrap.classList.remove('hidden');
          }
          
          if (elements.pathwayBanner) {
            elements.pathwayBanner.style.display = 'none';
          }
          
          updateEmptyState();
          updateStatus('ready', state.useLLM ? '🤖 LLM Mode Active' : '⚡ Local Mode Active');
        }
      }
    });
    
    // === CODING AI OPTIMIZATION INJECTION ===
    
    function injectCodingAITips(prompt, codingAI, languages = []) {
      const aiConfig = CODING_AI_TIPS[codingAI];
      if (!aiConfig) return prompt;
      
      let optimizationSection = '\n\n## 🎯 Coding AI Optimization Tips\n';
      optimizationSection += `**Optimized for: ${aiConfig.name}**\n\n`;
      
      // Add general tips
      optimizationSection += '**General Guidelines:**\n';
      aiConfig.general.forEach(tip => {
        optimizationSection += `- ${tip}\n`;
      });
      
      // Add language-specific coding tips
      if (languages.length > 0 && aiConfig.coding) {
        optimizationSection += '\n**Language-Specific Tips:**\n';
        languages.forEach(lang => {
          const langLower = lang.toLowerCase();
          if (aiConfig.coding[langLower]) {
            optimizationSection += `\n*${lang}:*\n`;
            aiConfig.coding[langLower].forEach(tip => {
              optimizationSection += `- ${tip}\n`;
            });
          }
        });
      }
      
      return prompt + optimizationSection;
    }
    
    // === MAIN ENHANCEMENT LOGIC ===
    
    async function runEnhancer() {
      const prompt = elements.input?.value?.trim();
      
      if (!prompt) {
        elements.input?.focus();
        return;
      }
      
      const mode = state.useLLM ? 'LLM' : 'Local';
      const depth = state.enhancementDepth === 'light' ? 'Light' : 'Deep';
      
      updateStatus('processing', `${mode === 'LLM' ? '🤖' : '⚡'} ${depth} Enhancement...`);
      
      const msgContainer = createMessageContainer();
      if (elements.thread) {
        elements.thread.appendChild(msgContainer);
      }
      
      state.messageCount++;
      if (state.messageCount === 1 && !state.logoHidden && elements.logoWrap) {
        elements.logoWrap.classList.add('hidden');
        state.logoHidden = true;
      }
      
      updateEmptyState();
      
      const originalPrompt = prompt;
      if (elements.input) {
        elements.input.value = '';
        elements.input.style.height = 'auto';
        elements.input.focus();
        
        if (state.vibeCodingMode) {
          elements.input.placeholder = 'Message Tiger Prompts... (Vibe Coding Mode active)';
        } else {
          elements.input.placeholder = 'Message Tiger Prompts...';
        }
      }
      
      scrollToBottom();
      
      const content = msgContainer.querySelector('.tp-msg-content');
      if (content) {
        content.innerHTML = `
          <div class="tp-thinking">
            <div class="tp-thinking-text">
              <span>Thinking</span>
              <span class="tp-thinking-dots">
                <span class="tp-thinking-dot"></span>
                <span class="tp-thinking-dot"></span>
                <span class="tp-thinking-dot"></span>
              </span>
            </div>
          </div>
        `;
      }
      
      await sleep(1500);
      
      let result;
      
      try {
        if (state.useLLM) {
          result = await enhanceWithLLM(originalPrompt);
          // Inject coding AI tips only if in Vibe Coding mode
          if (state.vibeCodingMode) {
            result.enhanced = injectCodingAITips(
              result.enhanced, 
              state.codingAI, 
              state.codeContext.languages
            );
          }
        } else {
          result = await enhancePromptTPEM(originalPrompt);
        }
        
        updateMessage(msgContainer, result);
        updateStatus('ready', '✅ Enhancement Complete');
        
        if (state.autoRun && state.useLLM) {
          const processingSection = document.createElement('div');
          processingSection.className = 'tp-llm-processing';
          processingSection.innerHTML = `
            <div class="tp-llm-processing-spinner">
              <span class="tp-icon">⟳</span>
              <span>Running enhanced prompt through ${state.selectedLLM}...</span>
            </div>
          `;
          
          const footer = msgContainer.querySelector('.tp-msg-footer');
          if (footer) {
            footer.parentNode.insertBefore(processingSection, footer);
          } else {
            msgContainer.appendChild(processingSection);
          }
          
          scrollToBottom();
          
          await runEnhancedPrompt(msgContainer, result.enhanced, processingSection);
        }
        
      } catch (error) {
        console.error('Enhancement error:', error);
        if (content) {
          content.innerHTML = `<div class="tp-error">❌ Error: ${error.message}</div>`;
        }
        updateStatus('ready', '❌ Enhancement Failed');
      }
      
      scrollToBottom();
    }
    
    async function runEnhancedPrompt(msgContainer, enhancedPrompt, processingSection = null) {
      const runBtn = msgContainer.querySelector('.tp-run-btn');
      
      if (runBtn) {
        runBtn.disabled = true;
        runBtn.classList.add('running');
        const icon = runBtn.querySelector('.tp-icon');
        if (icon) icon.textContent = '⟳';
        runBtn.innerHTML = '<span class="tp-icon">⟳</span> Running...';
      }
      
      if (!processingSection) {
        processingSection = document.createElement('div');
        processingSection.className = 'tp-llm-processing';
        processingSection.innerHTML = `
          <div class="tp-llm-processing-spinner">
            <span class="tp-icon">⟳</span>
            <span>Running enhanced prompt through ${state.selectedLLM}...</span>
          </div>
        `;
        
        const footer = msgContainer.querySelector('.tp-msg-footer');
        if (footer) {
          footer.parentNode.insertBefore(processingSection, footer);
        } else {
          msgContainer.appendChild(processingSection);
        }
        
        scrollToBottom();
      }
      
      updateStatus('processing', '🤖 Running enhanced prompt...');
      
      try {
        const response = await callOpenAI(
          'You are a helpful AI assistant. Respond naturally and helpfully to the user\'s request.',
          enhancedPrompt
        );
        
        if (processingSection && processingSection.parentNode) {
          processingSection.parentNode.removeChild(processingSection);
        }
        
        const llmResponseSection = document.createElement('div');
        llmResponseSection.className = 'tp-llm-response';
        llmResponseSection.innerHTML = `
          <div class="tp-llm-response-header">
            <div class="tp-llm-response-title">
              <span class="tp-icon">🤖</span>
              <span>LLM Response (${state.selectedLLM})</span>
            </div>
            <button class="tp-llm-response-copy">
              <span class="tp-icon">📋</span>
              Copy Response
            </button>
          </div>
          <div class="tp-llm-response-content">${escapeHtml(response)}</div>
        `;
        
        const footer = msgContainer.querySelector('.tp-msg-footer');
        if (footer) {
          footer.parentNode.insertBefore(llmResponseSection, footer);
        } else {
          msgContainer.appendChild(llmResponseSection);
        }
        
        const copyBtn = llmResponseSection.querySelector('.tp-llm-response-copy');
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(response).then(() => {
              copyBtn.innerHTML = '<span class="tp-icon">✓</span> Copied!';
              copyBtn.classList.add('copied');
              setTimeout(() => {
                copyBtn.innerHTML = '<span class="tp-icon">📋</span> Copy Response';
                copyBtn.classList.remove('copied');
              }, 2000);
            });
          });
        }
        
        if (runBtn) {
          runBtn.disabled = false;
          runBtn.classList.remove('running');
          runBtn.classList.add('complete');
          runBtn.innerHTML = '<span class="tp-icon">✓</span> Response Generated ✓';
        }
        
        updateStatus('ready', '✅ Execution Complete');
        scrollToBottom();
        
      } catch (error) {
        console.error('Run error:', error);
        
        if (processingSection && processingSection.parentNode) {
          processingSection.parentNode.removeChild(processingSection);
        }
        
        if (runBtn) {
          runBtn.disabled = false;
          runBtn.classList.remove('running');
          runBtn.innerHTML = '<span class="tp-icon">▶</span> Run This Prompt';
        }
        
        alert('Error running prompt: ' + error.message);
        updateStatus('ready', '❌ Execution Failed');
      }
    }
    
    async function enhanceWithLLM(rawPrompt) {
      let userPrompt = rawPrompt;
      
      if (state.activeTemplate && TEMPLATES[state.activeTemplate]) {
        const template = TEMPLATES[state.activeTemplate];
        userPrompt = `${template.systemContext}\n\n${rawPrompt}`;
      }
      
      if (state.vibeCodingMode) {
        userPrompt = buildVibeCodingPrompt(userPrompt);
      }
      
      const systemPrompt = state.enhancementDepth === 'light' 
        ? LLM_PROMPTS.light 
        : LLM_PROMPTS.deep;
      
      const enhanced = await callOpenAI(systemPrompt, userPrompt);
      
      state.activeTemplate = null;
      
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
        mode: 'llm-' + state.enhancementDepth
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
      
      if (state.codeContext.languages.length > 0) {
        sections.push(`\n\n## Languages: ${state.codeContext.languages.join(', ')}`);
      }
      
      if (state.codeContext.needsTesting) {
        sections.push('\n\n## Requirements: Include comprehensive test cases');
      }
      
      return sections.join('\n');
    }
    
    function generateLLMExplanation(original, enhanced) {
      const changes = [];
      
      changes.push(`<strong>🤖 LLM Mode:</strong> Enhanced via OpenAI (${state.enhancementDepth})`);
      
      if (state.vibeCodingMode) {
        changes.push(`<strong>💻 Vibe Coding Mode:</strong> Applied coding-specific optimizations`);
        
        const aiConfig = CODING_AI_TIPS[state.codingAI];
        if (aiConfig) {
          const tipCount = aiConfig.general.length;
          let codingTipCount = 0;
          if (state.codeContext.languages.length > 0 && aiConfig.coding) {
            state.codeContext.languages.forEach(lang => {
              const langLower = lang.toLowerCase();
              if (aiConfig.coding[langLower]) {
                codingTipCount += aiConfig.coding[langLower].length;
              }
            });
          }
          const totalTips = tipCount + codingTipCount;
          changes.push(`<strong>🎯 Optimized for ${aiConfig.name}:</strong> Injected ${totalTips} coding AI-specific tips`);
        }
      }
      
      const pqsBefore = calculatePQS(original);
      const pqsAfter = calculatePQS(enhanced);
      changes.push(`<strong>PQS Improvement:</strong> ${pqsBefore.toFixed(2)} → ${pqsAfter.toFixed(2)} (+${(pqsAfter - pqsBefore).toFixed(2)})`);
      
      const lengthChange = enhanced.length - original.length;
      changes.push(`<strong>Length Change:</strong> ${lengthChange > 0 ? '+' : ''}${lengthChange} characters`);
      
      return changes;
    }
    
    async function callOpenAI(systemPrompt, userPrompt, model = null) {
      const selectedModel = model || state.selectedLLM || 'gpt-4o-mini';
      
      const response = await fetch(WORKER_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemPrompt: systemPrompt,
          userPrompt: userPrompt,
          model: selectedModel,
          maxTokens: 2000
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }
      
      const data = await response.json();
      return data.choices[0].message.content.trim();
    }
    
    async function enhancePromptTPEM(rawPrompt) {
      console.log('[TPEM] Starting local enhancement...');
      
      let enhancedPrompt = rawPrompt;
      
      if (state.activeTemplate && TEMPLATES[state.activeTemplate]) {
        const template = TEMPLATES[state.activeTemplate];
        enhancedPrompt = `${template.systemContext}\n\n${rawPrompt}`;
      }
      
      const taskType = classifyTask(enhancedPrompt);
      const ambiguityScore = calculateAmbiguity(enhancedPrompt);
      
      let enhanced;
      if (state.enhancementDepth === 'light') {
        enhanced = synthesizeContextLight(enhancedPrompt, taskType, ambiguityScore);
      } else {
        enhanced = synthesizeContextDeep(enhancedPrompt, taskType, ambiguityScore);
      }
      
      state.activeTemplate = null;
      
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
        mode: 'local-' + state.enhancementDepth
      };
    }
    
    function synthesizeContextLight(prompt, taskType, ambiguity) {
      const sections = [];
      sections.push(getRoleForTask(taskType));
      sections.push('');
      sections.push(prompt);
      
      if (ambiguity > 0.5) {
        sections.push('');
        sections.push('Key requirements:');
        sections.push(...getConstraintsForTask(taskType).slice(0, 2));
      }
      
      return sections.join('\n');
    }
    
    function synthesizeContextDeep(prompt, taskType, ambiguity) {
      const sections = [];
      
      sections.push('# ENHANCED PROMPT (TPEM)');
      if (state.vibeCodingMode) {
        sections.push('**💻 VIBE CODING MODE ACTIVE**');
      }
      sections.push('');
      
      sections.push('## Role & Context');
      sections.push(getRoleForTask(taskType));
      sections.push('');
      
      sections.push('## Task');
      sections.push(prompt);
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
      
      changes.push(`<strong>⚡ Local Mode:</strong> Enhanced via TPEM (${state.enhancementDepth})`);
      
      if (state.vibeCodingMode) {
        changes.push(`<strong>💻 Vibe Coding Mode:</strong> Applied coding-specific constraints`);
      }
      
      changes.push(`<strong>Task Classification:</strong> ${taskType}`);
      changes.push(`<strong>Ambiguity Score:</strong> ${ambiguity.toFixed(2)}`);
      changes.push(`<strong>PQS Improvement:</strong> ${pqsBefore.toFixed(2)} → ${pqsAfter.toFixed(2)}`);
      changes.push(`<strong>Enhancement:</strong> Added structure, constraints, and process steps`);
      
      return changes;
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
    
    function createMessageContainer() {
      const container = document.createElement('div');
      container.className = 'tp-msg';
      
      const showRunBtn = !state.autoRun && state.useLLM;
      
      container.innerHTML = `
        <div class="tp-msg-header">
          <div class="tp-msg-label">
            <span class="tp-icon">✨</span>
            Enhanced by ${state.useLLM ? 'OpenAI' : 'TPEM'} (${state.enhancementDepth})
          </div>
          <div class="tp-msg-actions">
            <button class="tp-copy-btn">
              <span class="tp-icon">📋</span>
              Copy
            </button>
            <button class="tp-save-btn">
              <span class="tp-icon">🔖</span>
              Save
            </button>
            ${showRunBtn ? `
            <button class="tp-run-btn">
              <span class="tp-icon">▶</span>
              Run This Prompt
            </button>
            ` : ''}
          </div>
        </div>
        <div class="tp-msg-content">Processing...</div>
        <div class="tp-msg-footer" style="display:none;">
          <div>
            <span class="tp-pqs-badge">
              <span class="tp-icon">📊</span>
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
      
      if (content) {
        content.textContent = result.enhanced;
      }
      
      if (state.showPQS && footer && pqsScore && meta) {
        footer.style.display = 'flex';
        pqsScore.textContent = `${result.pqsAfter.toFixed(2)} (+${result.deltaQ.toFixed(2)})`;
        meta.textContent = `${result.taskType.toUpperCase()} · ${result.mode.toUpperCase()}`;
      }
      
      if (result.explanation && content) {
        const explDiv = document.createElement('div');
        explDiv.className = 'tp-explanation';
        explDiv.innerHTML = `
          <div class="tp-explanation-title">
            <span class="tp-icon">🎓</span>
            What We Enhanced
          </div>
          ${result.explanation.map(item => `<div class="tp-explanation-item">${item}</div>`).join('')}
        `;
        if (content.parentNode && footer) {
          content.parentNode.insertBefore(explDiv, footer);
        }
      }
      
      const copyBtn = container.querySelector('.tp-copy-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(result.enhanced).then(() => {
            copyBtn.innerHTML = '<span class="tp-icon">✓</span> Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
              copyBtn.innerHTML = '<span class="tp-icon">📋</span> Copy';
              copyBtn.classList.remove('copied');
            }, 2000);
          });
        });
      }
      
      const saveBtn = container.querySelector('.tp-save-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          savePrompt(result.enhanced, result.original);
          saveBtn.innerHTML = '<span class="tp-icon">✓</span> Saved!';
          setTimeout(() => {
            saveBtn.innerHTML = '<span class="tp-icon">🔖</span> Save';
          }, 2000);
        });
      }
      
      const runBtn = container.querySelector('.tp-run-btn');
      if (runBtn) {
        runBtn.addEventListener('click', () => {
          runEnhancedPrompt(container, result.enhanced);
        });
      }
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
            <span class="tp-icon">🗑</span>
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
      if (prompt && elements.input) {
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
      if (elements.explainToggle) {
        elements.explainToggle.classList.toggle('active', state.explainMode);
      }
      if (elements.pqsToggle) {
        elements.pqsToggle.classList.toggle('active', state.showPQS);
      }
    }
    
    function updateEmptyState() {
      if (elements.emptyState && elements.input) {
        const hasMessages = state.messageCount > 0;
        const hasInputText = elements.input.value.trim().length > 0;
        const hasActiveTemplate = state.activeTemplate !== null;
        
        if (hasMessages || hasInputText || hasActiveTemplate) {
          elements.emptyState.classList.add('hidden');
        } else {
          elements.emptyState.classList.remove('hidden');
        }
      }
    }
    
    function updateModelHint() {
      if (elements.modelHint) {
        const hint = MODEL_HINTS[state.selectedLLM] || '';
        elements.modelHint.textContent = hint;
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
        if (elements.thread) {
          elements.thread.scrollTop = elements.thread.scrollHeight;
        }
      }, 100);
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    console.log('[TigerPrompts v12.1] ✅ READY - AI Optimization Tips Active!');
  }
})();
