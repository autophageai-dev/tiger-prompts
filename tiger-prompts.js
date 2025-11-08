/* Tiger Prompts v11.5 – COMPREHENSIVE FIX */
(function() {
  'use strict';
  
  // CRITICAL: Verify Font Awesome loaded
  const checkFontAwesome = () => {
    const testIcon = document.createElement('i');
    testIcon.className = 'fa-solid fa-check';
    testIcon.style.position = 'absolute';
    testIcon.style.left = '-9999px';
    document.body.appendChild(testIcon);
    
    const computed = window.getComputedStyle(testIcon);
    const fontFamily = computed.getPropertyValue('font-family');
    
    document.body.removeChild(testIcon);
    
    if (!fontFamily.includes('Font Awesome')) {
      console.error('[TigerPrompts] Font Awesome not loaded! Icons will display incorrectly.');
      return false;
    }
    
    console.log('[TigerPrompts] ✅ Font Awesome loaded successfully');
    return true;
  };
  
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  
  // Cloudflare Worker Configuration
  const WORKER_CONFIG = {
    endpoint: 'https://tigerprompts-proxy.autophageai.workers.dev',
    model: 'gpt-4o-mini'
  };
  
  // TEMPLATE DEFINITIONS
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
  
  // Model hints for different LLMs
  const MODEL_HINTS = {
    'gpt-4o-mini': '⚡ Fast & efficient',
    'gpt-4o': '💎 Best quality & reasoning',
    'claude-sonnet': '🔮 Creative & thorough',
    'copilot': '⚡ Code-focused'
  };
  
  // LLM Enhancement Prompts
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
  
  // TPEM Configuration
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
    }
  };
  
  // Wait for DOM
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[TigerPrompts v11.5] Initializing - COMPREHENSIVE FIX...');
    
    // Verify Font Awesome loaded
    setTimeout(() => {
      checkFontAwesome();
    }, 500);
    
    // Get elements
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
    
    // Verify core elements
    if (!elements.sendBtn || !elements.input || !elements.thread) {
      console.error('[TigerPrompts] CRITICAL: Missing core elements');
      alert('Tiger Prompts failed to initialize. Please check the console.');
      return;
    }
    
    console.log('[TigerPrompts v11.4] All core elements found');
    
    // State
    let state = {
      useLLM: localStorage.getItem('tp-use-llm') !== 'false',
      enhancementDepth: localStorage.getItem('tp-enhancement-depth') || 'light',
      autoRun: localStorage.getItem('tp-auto-run') === 'true',
      selectedLLM: localStorage.getItem('tp-selected-llm') || 'gpt-4o-mini',
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
        language: '',
        isNewFeature: true,
        needsTesting: false
      }
    };
    
    // Initialize UI
    updateStatus('ready', state.useLLM ? '🤖 LLM Mode Active' : '⚡ Local Mode Active');
    loadSavedPrompts();
    updateSettingButtons();
    updateEmptyState();
    updateModelHint();
    
    // Set dropdown values
    if (elements.enhancementDepth) {
      elements.enhancementDepth.value = state.enhancementDepth;
    }
    if (elements.llmSelect) {
      elements.llmSelect.value = state.selectedLLM;
    }
    
    // Set toggle states
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
    
    // Show vibe cog if vibe coding is active
    if (state.vibeCodingMode && elements.vibeDrawerToggle) {
      elements.vibeDrawerToggle.style.display = 'flex';
    }
    
    // Update placeholder
    if (state.vibeCodingMode) {
      elements.input.placeholder = 'Message Tiger Prompts... (Vibe Coding Mode active)';
    }
    
    // Enable dark mode by default
    if (localStorage.getItem('tp-dark-mode') === null) {
      document.body.classList.add('tp-dark');
      localStorage.setItem('tp-dark-mode', 'true');
    } else if (localStorage.getItem('tp-dark-mode') === 'true') {
      document.body.classList.add('tp-dark');
    }
    
    // Load file definitions
    if (elements.fileDefsInput && state.fileDefinitions) {
      elements.fileDefsInput.value = state.fileDefinitions;
    }
    
    // === INPUT HANDLERS ===
    
    elements.input.addEventListener('input', () => {
      elements.input.style.height = 'auto';
      elements.input.style.height = Math.min(elements.input.scrollHeight, 200) + 'px';
      
      // Reset placeholder if input is cleared
      if (elements.input.value.trim() === '' && state.activeTemplate) {
        const template = TEMPLATES[state.activeTemplate];
        if (template) {
          elements.input.placeholder = template.placeholder;
        }
      }
      
      // Update empty state visibility
      updateEmptyState();
    });
    
    elements.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        runEnhancer();
      }
    });
    
    elements.sendBtn.addEventListener('click', runEnhancer);
    
    // === LOGO CLICK - RETURN TO HOME ===
    
    const logoImages = document.querySelectorAll('.tp-logo, .tp-sidebar-logo');
    logoImages.forEach(logo => {
      logo.addEventListener('click', () => {
        if (state.messageCount > 0 || state.activeTemplate) {
          // Reset everything
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
          
          // Hide pathway banner
          if (elements.pathwayBanner) {
            elements.pathwayBanner.style.display = 'none';
          }
          
          // Close any open modals/drawers
          if (elements.vibeDrawer) {
            elements.vibeDrawer.classList.remove('open');
          }
          
          updateEmptyState();
          updateStatus('ready', state.useLLM ? '🤖 LLM Mode Active' : '⚡ Local Mode Active');
        }
      });
      
      // Add cursor pointer to indicate it's clickable
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
    
    // === TEMPLATE SYSTEM ===
    
    document.querySelectorAll('.tp-template').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const templateId = btn.dataset.template;
        const template = TEMPLATES[templateId];
        
        if (!template) return;
        
        // Store active template
        state.activeTemplate = templateId;
        
        // Update placeholder
        if (elements.input) {
          elements.input.placeholder = template.placeholder;
          elements.input.focus();
        }
        
        // Set enhancement depth
        if (elements.enhancementDepth) {
          elements.enhancementDepth.value = template.depth;
          state.enhancementDepth = template.depth;
          localStorage.setItem('tp-enhancement-depth', template.depth);
        }
        
        // Enable vibe coding if needed
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
        
        // Hide empty state IMMEDIATELY
        if (elements.emptyState) {
          elements.emptyState.classList.add('hidden');
        }
        
        // Show pathway confirmation banner
        showPathwayBanner(template);
        
        // Auto-open vibe drawer if specified
        if (template.autoOpenDrawer && template.enableVibeCoding && elements.vibeDrawer) {
          setTimeout(() => {
            elements.vibeDrawer.classList.add('open');
          }, 100);
        }
      });
    });
    
    // === PATHWAY CONFIRMATION BANNER ===
    
    function showPathwayBanner(template) {
      if (!elements.pathwayBanner) return;
      
      const icon = elements.pathwayBanner.querySelector('.tp-pathway-icon');
      const text = elements.pathwayBanner.querySelector('.tp-pathway-text');
      
      if (icon) icon.textContent = template.icon;
      if (text) text.textContent = `${template.name} mode active - ${template.placeholder}`;
      
      elements.pathwayBanner.style.display = 'flex';
      
      // Auto-hide after 15 seconds
      setTimeout(() => {
        elements.pathwayBanner.style.display = 'none';
      }, 15000);
    }
    
    // Close pathway banner
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
    
    // Close modal on overlay click
    const modelModalOverlay = elements.modelGuideModal?.querySelector('.tp-modal-overlay');
    if (modelModalOverlay) {
      modelModalOverlay.addEventListener('click', () => {
        if (elements.modelGuideModal) {
          elements.modelGuideModal.classList.remove('open');
        }
      });
    }
    
    // === MOBILE TOOLTIP HANDLING ===
    
    document.querySelectorAll('.tp-tooltip, .tp-tooltip-inline').forEach(tooltip => {
      tooltip.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.stopPropagation();
          tooltip.classList.toggle('active');
          
          // Close other tooltips
          document.querySelectorAll('.tp-tooltip.active, .tp-tooltip-inline.active').forEach(other => {
            if (other !== tooltip) {
              other.classList.remove('active');
            }
          });
        }
      });
    });
    
    // Close tooltips on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && !e.target.closest('.tp-tooltip') && !e.target.closest('.tp-tooltip-inline')) {
        document.querySelectorAll('.tp-tooltip.active, .tp-tooltip-inline.active').forEach(tooltip => {
          tooltip.classList.remove('active');
        });
      }
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
    
    elements.vibeCodingToggle?.addEventListener('click', () => {
      state.vibeCodingMode = !state.vibeCodingMode;
      localStorage.setItem('tp-vibe-coding', state.vibeCodingMode);
      
      const toggleItem = elements.vibeCodingToggle.closest('.tp-toggle-item');
      if (toggleItem) {
        toggleItem.classList.toggle('active', state.vibeCodingMode);
      }
      
      // Show/hide vibe cog button
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
    
    // Save & Continue button
    elements.drawerSave?.addEventListener('click', () => {
      if (elements.vibeDrawer) {
        elements.vibeDrawer.classList.remove('open');
        
        // Show confirmation
        updateStatus('ready', '✅ Vibe Coding settings saved!');
        
        // Focus input
        if (elements.input) {
          elements.input.focus();
        }
        
        setTimeout(() => {
          updateStatus('ready', state.useLLM ? '🤖 LLM Mode Active' : '⚡ Local Mode Active');
        }, 2000);
      }
    });
    
    // Close drawer on overlay click
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
        const selected = Array.from(document.querySelectorAll('.tp-language-checkbox input[type="checkbox"]:checked'))
          .map(cb => cb.value);
        state.codeContext.language = selected.join(', ');
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
            
            // Reset placeholder
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
          
          // Hide pathway banner
          if (elements.pathwayBanner) {
            elements.pathwayBanner.style.display = 'none';
          }
          
          updateEmptyState();
          updateStatus('ready', state.useLLM ? '🤖 LLM Mode Active' : '⚡ Local Mode Active');
        }
      }
    });
    
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
      
      // Hide logo after first message
      state.messageCount++;
      if (state.messageCount === 1 && !state.logoHidden && elements.logoWrap) {
        elements.logoWrap.classList.add('hidden');
        state.logoHidden = true;
      }
      
      // Hide empty state
      updateEmptyState();
      
      const originalPrompt = prompt;
      if (elements.input) {
        elements.input.value = '';
        elements.input.style.height = 'auto';
        elements.input.focus();
        
        // Reset placeholder to default
        if (state.vibeCodingMode) {
          elements.input.placeholder = 'Message Tiger Prompts... (Vibe Coding Mode active)';
        } else {
          elements.input.placeholder = 'Message Tiger Prompts...';
        }
      }
      
      scrollToBottom();
      
      // Show thinking animation
      const content = msgContainer.querySelector('.tp-msg-content');
      if (content) {
        content.innerHTML = '<div class="tp-thinking">Thinking<span class="tp-thinking-dots"></span></div>';
      }
      
      let dotCount = 0;
      const dotsInterval = setInterval(() => {
        const dotsEl = content?.querySelector('.tp-thinking-dots');
        if (dotsEl) {
          dotCount = (dotCount + 1) % 4;
          dotsEl.textContent = '.'.repeat(dotCount);
        }
      }, 300);
      
      await sleep(1500);
      clearInterval(dotsInterval);
      
      let result;
      
      try {
        if (state.useLLM) {
          result = await enhanceWithLLM(originalPrompt);
        } else {
          result = await enhancePromptTPEM(originalPrompt);
        }
        
        updateMessage(msgContainer, result);
        updateStatus('ready', '✅ Enhancement Complete');
        
        // Auto-run if enabled
        if (state.autoRun && state.useLLM) {
          const processingSection = document.createElement('div');
          processingSection.className = 'tp-llm-processing';
          processingSection.innerHTML = `
            <div class="tp-llm-processing-spinner">
              <i class="fa-solid fa-spinner"></i>
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
    
    // === RUN ENHANCED PROMPT ===
    
    async function runEnhancedPrompt(msgContainer, enhancedPrompt, processingSection = null) {
      const runBtn = msgContainer.querySelector('.tp-run-btn');
      
      if (runBtn) {
        runBtn.disabled = true;
        runBtn.classList.add('running');
        runBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running...';
      }
      
      if (!processingSection) {
        processingSection = document.createElement('div');
        processingSection.className = 'tp-llm-processing';
        processingSection.innerHTML = `
          <div class="tp-llm-processing-spinner">
            <i class="fa-solid fa-spinner"></i>
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
              <i class="fa-solid fa-robot"></i>
              <span>LLM Response (${state.selectedLLM})</span>
            </div>
            <button class="tp-llm-response-copy">
              <i class="fa-solid fa-copy"></i>
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
              copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
              copyBtn.classList.add('copied');
              setTimeout(() => {
                copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy Response';
                copyBtn.classList.remove('copied');
              }, 2000);
            });
          });
        }
        
        if (runBtn) {
          runBtn.disabled = false;
          runBtn.classList.remove('running');
          runBtn.classList.add('complete');
          runBtn.innerHTML = '<i class="fa-solid fa-check"></i> Response Generated ✓';
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
          runBtn.innerHTML = '<i class="fa-solid fa-play"></i> Run This Prompt';
        }
        
        alert('Error running prompt: ' + error.message);
        updateStatus('ready', '❌ Execution Failed');
      }
    }
    
    // === LLM ENHANCEMENT ===
    
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
      
      changes.push(`<strong>🤖 LLM Mode:</strong> Enhanced via OpenAI (${state.enhancementDepth})`);
      
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
    
    // === LOCAL TPEM PIPELINE ===
    
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
    
    // === UI HELPERS ===
    
    function createMessageContainer() {
      const container = document.createElement('div');
      container.className = 'tp-msg';
      
      const showRunBtn = !state.autoRun && state.useLLM;
      
      container.innerHTML = `
        <div class="tp-msg-header">
          <div class="tp-msg-label">
            <i class="fa-solid fa-sparkles"></i>
            Enhanced by ${state.useLLM ? 'OpenAI' : 'TPEM'} (${state.enhancementDepth})
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
            ${showRunBtn ? `
            <button class="tp-run-btn">
              <i class="fa-solid fa-play"></i>
              Run This Prompt
            </button>
            ` : ''}
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
            <i class="fa-solid fa-graduation-cap"></i>
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
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
              copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
              copyBtn.classList.remove('copied');
            }, 2000);
          });
        });
      }
      
      const saveBtn = container.querySelector('.tp-save-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          savePrompt(result.enhanced, result.original);
          saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
          setTimeout(() => {
            saveBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Save';
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
        
        // Hide if: has messages OR has input text OR template is active
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
    
    console.log('[TigerPrompts v11.5] ✅ COMPREHENSIVE FIX APPLIED!');
    console.log('🔧 Fixed: Font Awesome icons, input bar rendering, all buttons working');
  });
})();
