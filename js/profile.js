class AuraProfileManager {
  constructor(app) {
    this.app = app;
    
    // Core profile state
    this.profile = {
      name: "Pankaj Verma",
      email: "pankaj@example.com",
      targetRoleId: "frontend_engineer",
      skills: ["JavaScript", "React", "HTML5", "CSS3", "Git"] // Default starting skills
    };

    this.activeAnalysis = null;
    this.currentFixTarget = null;
    
    this.initElements();
    this.bindEvents();
    this.renderSkills();
  }

  initElements() {
    this.nameInput = document.getElementById('profile-name');
    this.emailInput = document.getElementById('profile-email');
    this.targetRoleSelect = document.getElementById('profile-target-role');
    this.skillTagContainer = document.getElementById('skill-tag-container');
    this.newSkillInput = document.getElementById('new-skill-input');
    this.addSkillBtn = document.getElementById('add-skill-btn');
    
    // Resume Elements
    this.resumeTextInput = document.getElementById('resume-text-input');
    this.resumeInteractivePreview = document.getElementById('resume-interactive-preview');
    this.resumeFileInput = document.getElementById('resume-file-input');
    this.btnUploadPdf = document.getElementById('btn-upload-pdf');
    this.analyzeResumeBtn = document.getElementById('analyze-resume-btn');
    this.loadWeakSampleBtn = document.getElementById('load-weak-sample');
    this.loadStrongSampleBtn = document.getElementById('load-strong-sample');
    
    // Tabs Elements
    this.btnEditRaw = document.getElementById('btn-edit-raw');
    this.btnEditInteractive = document.getElementById('btn-edit-interactive');
    
    // Floating Fix Card Elements
    this.floatingFixCard = document.getElementById('floating-fix-card');
    this.floatingFixTitle = document.getElementById('floating-fix-title');
    this.floatingFixDesc = document.getElementById('floating-fix-desc');
    this.btnApplyInteractiveFix = document.getElementById('btn-apply-interactive-fix');
    
    // Scoreboard Elements
    this.overallScoreVal = document.getElementById('overall-score-val');
    this.impactScoreVal = document.getElementById('impact-score-val');
    this.clarityScoreVal = document.getElementById('clarity-score-val');
    this.atsScoreVal = document.getElementById('ats-score-val');
    this.styleScoreVal = document.getElementById('style-score-val');
    this.resumeIssuesContainer = document.getElementById('resume-issues-container');

    // Populate role selectors
    if (this.targetRoleSelect) {
      this.targetRoleSelect.innerHTML = AURA_DATA.roles.map(role => 
        `<option value="${role.id}">${role.name}</option>`
      ).join('');
      this.targetRoleSelect.value = this.profile.targetRoleId;
    }
    
    if (this.nameInput) this.nameInput.value = this.profile.name;
    if (this.emailInput) this.emailInput.value = this.profile.email;
  }

  bindEvents() {
    // Sync profile basic info
    if (this.nameInput) {
      this.nameInput.addEventListener('input', (e) => {
        this.profile.name = e.target.value;
        this.app.syncProfileName(this.profile.name);
      });
    }

    if (this.emailInput) {
      this.emailInput.addEventListener('input', (e) => {
        this.profile.email = e.target.value;
      });
    }

    if (this.targetRoleSelect) {
      this.targetRoleSelect.addEventListener('change', (e) => {
        this.profile.targetRoleId = e.target.value;
        this.app.onTargetRoleChange(this.profile.targetRoleId);
      });
    }

    // Skill Tag additions
    if (this.addSkillBtn && this.newSkillInput) {
      this.addSkillBtn.addEventListener('click', () => this.handleAddSkill());
      this.newSkillInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleAddSkill();
        }
      });
    }

    // Sample Resume Buttons
    if (this.loadWeakSampleBtn) {
      this.loadWeakSampleBtn.addEventListener('click', () => {
        this.resumeTextInput.value = AURA_DATA.resumeTemplates.weakResume.content;
        this.analyzeResume(AURA_DATA.resumeTemplates.weakResume.analysis);
      });
    }

    if (this.loadStrongSampleBtn) {
      this.loadStrongSampleBtn.addEventListener('click', () => {
        this.resumeTextInput.value = AURA_DATA.resumeTemplates.strongResume.content;
        this.analyzeResume(AURA_DATA.resumeTemplates.strongResume.analysis);
      });
    }

    // PDF Upload Button
    if (this.btnUploadPdf && this.resumeFileInput) {
      this.btnUploadPdf.addEventListener('click', () => this.handlePdfUpload());
    }

    // Text analysis button
    if (this.analyzeResumeBtn) {
      this.analyzeResumeBtn.addEventListener('click', () => {
        const text = this.resumeTextInput.value.trim();
        if (!text) {
          alert("Please paste your resume text first!");
          return;
        }
        
        const analysis = this.generateDynamicAnalysis(text);
        this.analyzeResume(analysis);
      });
    }

    // Editor tab togglers
    if (this.btnEditRaw && this.btnEditInteractive) {
      this.btnEditRaw.addEventListener('click', () => this.switchEditorTab('raw'));
      this.btnEditInteractive.addEventListener('click', () => this.switchEditorTab('interactive'));
    }

    // Floating card Apply Fix click
    if (this.btnApplyInteractiveFix) {
      this.btnApplyInteractiveFix.addEventListener('click', () => this.applyInteractiveFix());
    }

    // Close floating fix tooltip on external click
    document.addEventListener('click', (e) => {
      if (this.floatingFixCard && !this.floatingFixCard.contains(e.target) && !e.target.classList.contains('highlight-item')) {
        this.floatingFixCard.style.display = 'none';
      }
    });
  }

  async handlePdfUpload() {
    const file = this.resumeFileInput.files[0];
    if (!file) {
      alert("Please select a PDF resume file first!");
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Only PDF files are supported!");
      return;
    }

    // Show loading state in elements
    this.btnUploadPdf.disabled = true;
    this.btnUploadPdf.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...`;
    
    this.overallScoreVal.textContent = "...";
    this.impactScoreVal.textContent = "...";
    this.clarityScoreVal.textContent = "...";
    this.atsScoreVal.textContent = "...";

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRoleId', this.profile.targetRoleId);

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const analysis = await response.json();
      
      if (analysis.error) {
        throw new Error(analysis.error);
      }

      this.analyzeResume(analysis);

      // Auto-populate extracted skills tags directly on candidate profile
      if (analysis.skills && Array.isArray(analysis.skills)) {
        analysis.skills.forEach(skill => {
          if (!this.profile.skills.includes(skill)) {
            this.profile.skills.push(skill);
          }
        });
        this.renderSkills();
        this.app.onSkillsChange(this.profile.skills);
      }

      // Fill text preview with mock label if empty
      if (!this.resumeTextInput.value.trim()) {
        this.resumeTextInput.value = `[PARSED RESUME PDF CONTENT - ${file.name}]\n\nSkills Found: ${analysis.skills ? analysis.skills.join(', ') : 'None'}\n\nOverall ATS Grade: ${analysis.score}%`;
      }

      if (this.floatingFixCard) this.floatingFixCard.style.display = 'none';

    } catch (err) {
      console.error("[Upload Error]", err);
      alert(`Failed to analyze PDF: ${err.message}`);
      
      this.overallScoreVal.textContent = "--%";
      this.impactScoreVal.textContent = "--%";
      this.clarityScoreVal.textContent = "--%";
      this.atsScoreVal.textContent = "--%";
    } finally {
      this.btnUploadPdf.disabled = false;
      this.btnUploadPdf.innerHTML = `<i class="fa-solid fa-file-pdf text-danger"></i> Analyze PDF`;
    }
  }

  handleAddSkill() {
    const rawVal = this.newSkillInput.value.trim();
    if (!rawVal) return;
    
    const cleanSkill = rawVal.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    if (this.profile.skills.includes(cleanSkill)) {
      this.newSkillInput.value = '';
      return;
    }

    this.profile.skills.push(cleanSkill);
    this.newSkillInput.value = '';
    this.renderSkills();
    this.app.onSkillsChange(this.profile.skills);
  }

  removeSkill(skill) {
    this.profile.skills = this.profile.skills.filter(s => s !== skill);
    this.renderSkills();
    this.app.onSkillsChange(this.profile.skills);
  }

  renderSkills() {
    if (!this.skillTagContainer) return;
    
    if (this.profile.skills.length === 0) {
      this.skillTagContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem; padding: 4px;">No skills added yet. Use the input below to start building your profile.</span>`;
      return;
    }

    this.skillTagContainer.innerHTML = this.profile.skills.map(skill => `
      <div class="skill-tag custom-added">
        <span>${skill}</span>
        <span class="skill-tag-remove" data-skill="${skill}">&times;</span>
      </div>
    `).join('');

    this.skillTagContainer.querySelectorAll('.skill-tag-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const skill = e.target.getAttribute('data-skill');
        this.removeSkill(skill);
      });
    });
  }

  addSkillDirectly(skill) {
    if (!this.profile.skills.includes(skill)) {
      this.profile.skills.push(skill);
      this.renderSkills();
      this.app.onSkillsChange(this.profile.skills);
    }
  }

  switchEditorTab(tab) {
    if (tab === 'raw') {
      this.btnEditRaw.classList.add('active');
      this.btnEditInteractive.classList.remove('active');
      this.resumeTextInput.style.display = 'block';
      this.resumeInteractivePreview.classList.remove('active');
      if (this.floatingFixCard) this.floatingFixCard.style.display = 'none';
    } else {
      const text = this.resumeTextInput.value.trim();
      if (!text) {
        alert("Please paste your resume text first before viewing highlights!");
        return;
      }
      
      this.btnEditRaw.classList.remove('active');
      this.btnEditInteractive.classList.add('active');
      this.resumeTextInput.style.display = 'none';
      this.resumeInteractivePreview.classList.add('active');
      
      // Render highlighted spans
      this.renderInteractiveHighlights(text);
    }
  }

  // Parses resume text and injects interactive span highlights (Hackathon wow feature)
  renderInteractiveHighlights(text) {
    let html = text;
    
    // List of typical weak patterns and replacement suggestions
    const fixes = [
      { find: /worked on/gi, label: "Worked on", replace: "Engineered", desc: "Use high-impact technical action verbs.", type: "weak", scoreBoost: 8 },
      { find: /helped build/gi, label: "Helped build", replace: "Co-developed & deployed", desc: "Show complete project ownership.", type: "passive", scoreBoost: 5 },
      { find: /attending standups/gi, label: "attending standups", replace: "Facilitating agile cycles", desc: "Change list of chores to leadership metrics.", type: "passive", scoreBoost: 4 },
      { find: /solved bugs/gi, label: "Solved bugs", replace: "Debugged and optimized pipelines", desc: "Quantify details to reflect precision.", type: "weak", scoreBoost: 6 }
    ];

    fixes.forEach((f, idx) => {
      // Replace matches with styled interactive spans
      html = html.replace(f.find, `<span class="highlight-item ${f.type}" data-fix-idx="${idx}">${f.label}</span>`);
    });

    this.resumeInteractivePreview.innerHTML = html;

    // Attach click events to the spans
    this.resumeInteractivePreview.querySelectorAll('.highlight-item').forEach(span => {
      span.addEventListener('click', (e) => {
        const fixIdx = parseInt(e.target.getAttribute('data-fix-idx'));
        this.showFixTooltip(e.target, fixes[fixIdx]);
      });
    });
  }

  showFixTooltip(targetSpan, fixData) {
    if (!this.floatingFixCard || !this.floatingFixTitle || !this.floatingFixDesc) return;
    
    this.currentFixTarget = { span: targetSpan, data: fixData };
    
    this.floatingFixTitle.textContent = `Nova Suggestion: Use "${fixData.replace}"`;
    this.floatingFixDesc.textContent = `${fixData.desc} (Expected Score Increase: +${fixData.scoreBoost}%)`;
    
    // Position tooltip below target
    const rect = targetSpan.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    this.floatingFixCard.style.top = `${rect.bottom + scrollY + 8}px`;
    this.floatingFixCard.style.left = `${rect.left + scrollX}px`;
    this.floatingFixCard.style.display = 'block';
  }

  applyInteractiveFix() {
    if (!this.currentFixTarget || !this.resumeTextInput) return;
    
    const { span, data } = this.currentFixTarget;
    const rawText = this.resumeTextInput.value;
    
    // Replace text in textarea
    const regex = new RegExp(data.label, 'i');
    const updatedText = rawText.replace(regex, data.replace);
    this.resumeTextInput.value = updatedText;
    
    // Update preview HTML
    span.textContent = data.replace;
    span.className = "text-accent font-bold"; // visual complete state
    
    // Recalculate analysis
    const analysis = this.generateDynamicAnalysis(updatedText);
    this.analyzeResume(analysis);
    
    // Hide floating tooltip
    this.floatingFixCard.style.display = 'none';
    this.currentFixTarget = null;
    
    // Re-render highlight references for the updated text
    setTimeout(() => {
      this.renderInteractiveHighlights(updatedText);
    }, 800);
  }

  analyzeResume(analysis) {
    this.activeAnalysis = analysis;
    
    // Populate scores
    this.animateScoreChange(this.overallScoreVal, analysis.score);
    this.animateScoreChange(this.impactScoreVal, analysis.categories.impact);
    this.animateScoreChange(this.clarityScoreVal, analysis.categories.clarity);
    this.animateScoreChange(this.atsScoreVal, analysis.categories.ats);
    this.animateScoreChange(this.styleScoreVal, analysis.categories.style);

    this.styleScoreNumber(this.overallScoreVal, analysis.score);
    this.styleScoreNumber(this.impactScoreVal, analysis.categories.impact);
    this.styleScoreNumber(this.clarityScoreVal, analysis.categories.clarity);
    this.styleScoreNumber(this.atsScoreVal, analysis.categories.ats);
    this.styleScoreNumber(this.styleScoreVal, analysis.categories.style);
    
    // Populate issues
    if (this.resumeIssuesContainer) {
      this.resumeIssuesContainer.innerHTML = analysis.issues.map(issue => `
        <div class="resume-issue-card ${issue.type}">
          <div class="issue-head">
            <span>${issue.title}</span>
            <span class="rec-type-badge ${issue.category}">${issue.category}</span>
          </div>
          <div class="issue-desc">${issue.desc}</div>
          <div class="issue-fix">
            <span class="issue-fix-tag">Recommendation:</span>${issue.fix}
          </div>
        </div>
      `).join('');
    }
  }

  styleScoreNumber(element, val) {
    element.classList.remove('high', 'mid', 'low');
    if (val >= 80) element.classList.add('high');
    else if (val >= 60) element.classList.add('mid');
    else element.classList.add('low');
  }

  animateScoreChange(element, endVal) {
    let startVal = 0;
    const duration = 800;
    const startTime = performance.now();
    
    function updateScore(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeVal = progress * (2 - progress);
      const currentVal = Math.floor(startVal + easeVal * (endVal - startVal));
      
      element.textContent = currentVal + '%';
      
      if (progress < 1) {
        requestAnimationFrame(updateScore);
      } else {
        element.textContent = endVal + '%';
      }
    }
    
    requestAnimationFrame(updateScore);
  }

  // Generates dynamic scores by scanning text content for keywords/metrics
  generateDynamicAnalysis(text) {
    const textLower = text.toLowerCase();
    
    // 1. Detect ATS keywords related to current target role
    const currentRole = AURA_DATA.roles.find(r => r.id === this.profile.targetRoleId);
    const keywords = currentRole ? currentRole.requiredSkills : [];
    
    let matchedKeywords = 0;
    keywords.forEach(kw => {
      if (textLower.includes(kw.toLowerCase())) {
        matchedKeywords++;
      }
    });

    const keywordRatio = keywords.length > 0 ? (matchedKeywords / keywords.length) : 0.5;
    const atsScore = Math.min(Math.round(40 + keywordRatio * 60), 100);

    // 2. Detect impact metrics
    const matchesMetrics = text.match(/\d+%/g) || [];
    const matchesCurrency = text.match(/(₹|\$)\d+/g) || [];
    const matchesNumbers = text.match(/\b\d+\b/g) || [];
    
    let impactScore = 40;
    if (matchesMetrics.length > 0) impactScore += 25;
    if (matchesCurrency.length > 0) impactScore += 15;
    if (matchesNumbers.length > 3) impactScore += 15;
    impactScore = Math.min(impactScore, 100);

    // 3. Detect action verbs
    const actionVerbs = ["architected", "engineered", "designed", "optimized", "managed", "spearheaded", "developed", "led", "refactored", "migrated", "implemented"];
    let matchedVerbs = 0;
    actionVerbs.forEach(v => {
      if (textLower.includes(v)) matchedVerbs++;
    });

    const styleScore = Math.min(Math.round(50 + matchedVerbs * 6), 100);

    // 4. Clarity checks
    let clarityScore = 80;
    if (text.length < 300) clarityScore -= 30;
    if (text.length > 3500) clarityScore -= 15;
    if (textLower.includes("responsible for") || textLower.includes("helped with")) clarityScore -= 15;

    const overallScore = Math.round((atsScore + impactScore + styleScore + clarityScore) / 4);

    // Build custom issues list
    const issues = [];
    
    if (impactScore < 75) {
      issues.push({
        type: "danger",
        category: "impact",
        title: "Few Quantifiable Metrics Detected",
        desc: "We found very few numbers, percentages, or savings metrics. Recruiters want to see the specific business scale of your output.",
        fix: "Quantify your achievements: 'Created landing pages' -> 'Architected 6 high-conversion landing pages, increasing customer signups by 22%'."
      });
    } else {
      issues.push({
        type: "success",
        category: "impact",
        title: "Strong Performance Metrics",
        desc: "Your resume includes clear numerical outcomes showing scalability and business results.",
        fix: "Keep measuring details like loading speedups, cost reduction percentages, and team sizes."
      });
    }

    if (atsScore < 75) {
      const missingSkills = keywords.filter(kw => !textLower.includes(kw.toLowerCase()));
      const displayMissing = missingSkills.slice(0, 3).join(', ');
      issues.push({
        type: "danger",
        category: "ats",
        title: "Low Keyword Coverage for Target Role",
        desc: `Your resume lacks matching primary skills for the ${currentRole ? currentRole.name : 'selected'} role. ATS filters may auto-reject.`,
        fix: `Integrate key skills such as [ ${displayMissing} ] naturally into your experience explanations and skills list.`
      });
    } else {
      issues.push({
        type: "success",
        category: "ats",
        title: "Excellent Keyword Calibration",
        desc: `Great match! Your descriptions leverage standard terminology required for a ${currentRole ? currentRole.name : 'role'}.`,
        fix: "Ensure these skills are supported by clear bullet point demonstrations in your job sections."
      });
    }

    if (styleScore < 75) {
      issues.push({
        type: "warning",
        category: "style",
        title: "Passive Voice & Weak Verbs",
        desc: "We noticed passive terms like 'assisted', 'handled', or 'participated' which fail to convey ownership.",
        fix: "Swap out passive phrases for strong action verbs: 'Engineered', 'Orchestrated', 'Spearheaded', or 'Refactored'."
      });
    }

    if (clarityScore < 75) {
      issues.push({
        type: "warning",
        category: "clarity",
        title: "Vague Professional Summary",
        desc: "Your profile statement appears wordy, passive, or focuses on what you want from a company rather than what you can offer.",
        fix: "Craft a 3-line statement highlighting: Years of experience, key framework specializations, and your top metric-driven achievement."
      });
    }

    return {
      score: overallScore,
      categories: {
        impact: impactScore,
        clarity: clarityScore,
        ats: atsScore,
        style: styleScore
      },
      issues: issues
    };
  }
}
