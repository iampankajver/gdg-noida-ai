class AuraApp {
  constructor() {
    this.initDOM();
    
    // Initialize components (order matters for cross-references)
    this.profileManager = new AuraProfileManager(this);
    this.advisor = new AuraCareerAdvisor(this);
    this.trendsRenderer = new AuraTrendsRenderer(this);
    this.chat = new AuraCoachChat(this);
    
    this.bindGlobalEvents();
    
    // Initial UI synchronization
    this.syncProfileName(this.profileManager.profile.name);
    this.advisor.runSkillAudit(); // trigger initial math and scoreboard sync
    this.renderDashboardJobs();
  }

  initDOM() {
    this.navItems = document.querySelectorAll('.nav-menu .nav-item');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.headerTitle = document.getElementById('header-title');
    this.headerSubtitle = document.getElementById('header-subtitle');
    this.userDisplayName = document.getElementById('user-display-name');
    
    // Dashboard widgets
    this.dashAlignmentScore = document.getElementById('dash-alignment-score');
    this.dashGapsCount = document.getElementById('dash-gaps-count');
    this.dashAcquiredCount = document.getElementById('dash-acquired-count');
    this.dashActiveOffers = document.getElementById('dash-active-offers');
    this.gaugeBar = document.getElementById('gauge-bar');
    this.dashboardJobsContainer = document.getElementById('dashboard-jobs-container');
    this.dashboardRecommendations = document.getElementById('dashboard-recommendations');
  }

  bindGlobalEvents() {
    // Tab switching event loop
    this.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = item.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    // Handle recommendations direct clicks
    if (this.dashboardRecommendations) {
      this.dashboardRecommendations.addEventListener('click', (e) => {
        const btn = e.target.closest('.rec-action-btn');
        if (!btn) return;
        
        const action = btn.getAttribute('data-action');
        const targetSkill = btn.getAttribute('data-target-skill');
        
        if (action === 'learn_skill') {
          // Switch to advisor and highlight skill
          this.switchTab('advisor');
          if (targetSkill) {
            this.advisor.selectRole(this.profileManager.profile.targetRoleId);
            const element = document.getElementById(`step-card-${targetSkill.replace(/\s+/g, '-')}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              element.style.borderColor = 'var(--secondary)';
              setTimeout(() => { element.style.borderColor = 'var(--card-border)'; }, 2000);
            }
          }
        } else if (action === 'optimize_resume') {
          this.switchTab('profile');
          const element = document.getElementById('resume-text-input');
          if (element) element.focus();
        }
      });
    }
  }

  switchTab(tabId) {
    // Update active nav items styling
    this.navItems.forEach(nav => {
      if (nav.getAttribute('data-tab') === tabId) {
        nav.classList.add('active');
      } else {
        nav.classList.remove('active');
      }
    });

    // Update visibility of content sections
    this.tabContents.forEach(tab => {
      if (tab.id === `${tabId}-tab`) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update header labels
    this.updateHeaderLabels(tabId);

    // Re-render SVG charts if resizing happened or toggled view
    if (tabId === 'trends') {
      setTimeout(() => {
        this.trendsRenderer.renderSalaryDistribution();
        this.trendsRenderer.renderHiringVelocity();
      }, 50);
    }
  }

  updateHeaderLabels(tabId) {
    const titles = {
      dashboard: { main: "Welcome Back", sub: "Here is your career alignment index & market standing." },
      profile: { main: "Resume & Profile Calibration", sub: "Analyze your resume against ATS standards and list your skill inventories." },
      trends: { main: "Noida Labor-Market Trends", sub: "Real-time insights on salaries, high-growth skills, and hiring velocities." },
      advisor: { main: "AI Career Paths & Roadmap", sub: "Select your target role and complete modules to fill identified skill gaps." },
      chat: { main: "AI Career Coach Nova", sub: "Your personalized sounding board for mock technical interviews and strategy." }
    };

    const details = titles[tabId] || { main: "Aura Intelligence", sub: "" };
    this.headerTitle.textContent = tabId === 'dashboard' ? `Welcome, ${this.profileManager.profile.name}` : details.main;
    this.headerSubtitle.textContent = details.sub;
  }

  // --- CROSS MODULE INTERACTION ROUTERS ---
  
  onSkillsChange(newSkillsList) {
    // 1. Recalculate skill gap analysis
    this.advisor.runSkillAudit();
    
    // 2. Re-render Dashboard details (gaps might be closed)
    this.renderDashboardRecommendations();
    this.renderDashboardJobs();
  }

  onTargetRoleChange(newRoleId) {
    // 1. Sync value on Advisor selection cards
    this.advisor.selectRole(newRoleId);
  }

  onTargetRoleChangeFromAdvisor(newRoleId) {
    // 1. Sync value in the Profile basic dropdown select
    if (this.profileManager.targetRoleSelect) {
      this.profileManager.targetRoleSelect.value = newRoleId;
    }
    this.profileManager.profile.targetRoleId = newRoleId;
    
    // 2. Re-render dashboard specific jobs matching new role
    this.renderDashboardJobs();
    this.renderDashboardRecommendations();
  }

  syncProfileName(newName) {
    if (this.userDisplayName) {
      this.userDisplayName.textContent = newName;
    }
    // Update dashboard header welcome text if active tab
    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav && activeNav.getAttribute('data-tab') === 'dashboard') {
      this.headerTitle.textContent = `Welcome, ${newName}`;
    }
  }

  // Receives calculated stats from Advisor module and updates Dashboard gauge
  syncMarketAlignment(matchPercent, gapsCount, acquiredCount) {
    if (this.dashAlignmentScore) this.dashAlignmentScore.textContent = matchPercent + '%';
    if (this.dashGapsCount) this.dashGapsCount.textContent = gapsCount;
    if (this.dashAcquiredCount) this.dashAcquiredCount.textContent = acquiredCount;

    // SVG Gauge DashOffset adjustment (Circumference is 439.6)
    if (this.gaugeBar) {
      const circumference = 439.6;
      const offset = circumference - (matchPercent / 100) * circumference;
      this.gaugeBar.style.strokeDashoffset = offset;
    }
  }

  // Renders dynamic recommendations on Dashboard based on missing capabilities
  renderDashboardRecommendations() {
    if (!this.dashboardRecommendations) return;
    
    const role = AURA_DATA.roles.find(r => r.id === this.profileManager.profile.targetRoleId);
    const userSkills = this.profileManager.profile.skills.map(s => s.toLowerCase());
    
    const recommendations = [];

    // 1. Suggest resume check if overall score isn't set yet
    if (!this.profileManager.activeAnalysis) {
      recommendations.push({
        type: 'resume',
        title: 'Optimize your Resume',
        desc: 'Grade your resume formatting, keywords, and action verbs against automated recruitment ATS standards.',
        actionLabel: 'Analyze Resume',
        actionType: 'optimize_resume'
      });
    }

    // 2. Scan missing skills for learning prompts
    if (role) {
      const missingRequired = role.requiredSkills.filter(s => !userSkills.includes(s.toLowerCase()));
      
      missingRequired.slice(0, 2).forEach(skill => {
        recommendations.push({
          type: 'skill',
          title: `Acquire ${skill} Competency`,
          desc: `Required skill for ${role.name}. Closing this gap adds direct value and unlocks new active applications.`,
          actionLabel: 'Start Roadmap',
          actionType: 'learn_skill',
          targetSkill: skill
        });
      });
      
      const missingSecondary = role.secondarySkills.filter(s => !userSkills.includes(s.toLowerCase()));
      if (recommendations.length < 3 && missingSecondary.length > 0) {
        recommendations.push({
          type: 'market',
          title: `Learn Nice-to-Have: ${missingSecondary[0]}`,
          desc: `Highly requested elective. Adding this to your profile distinguishes you from 60% of Noida applicants.`,
          actionLabel: 'Learn Skill',
          actionType: 'learn_skill',
          targetSkill: missingSecondary[0]
        });
      }
    }

    // Default suggestions if all skills are met
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'market',
        title: 'Calibrate a New Target Role',
        desc: 'You have fully aligned your profile to this role! Calibrate against Cloud DevOps or AI Data Engineering to expand capabilities.',
        actionLabel: 'Calibrate Role',
        actionType: 'learn_skill'
      });
    }

    this.dashboardRecommendations.innerHTML = recommendations.map(rec => `
      <div class="rec-item">
        <span class="rec-type-badge ${rec.type}">${rec.type}</span>
        <div class="rec-details">
          <h4>${rec.title}</h4>
          <p>${rec.desc}</p>
        </div>
        <button class="rec-action-btn" data-action="${rec.actionType}" ${rec.targetSkill ? `data-target-skill="${rec.targetSkill}"` : ''}>
          ${rec.actionLabel}
        </button>
      </div>
    `).join('');
  }

  // Renders jobs matching the profile on Noida
  renderDashboardJobs() {
    if (!this.dashboardJobsContainer) return;

    const userSkills = this.profileManager.profile.skills.map(s => s.toLowerCase());
    
    // Sort jobs based on matching user skills
    const evaluatedJobs = AURA_DATA.jobs.map(job => {
      let matches = 0;
      job.skills.forEach(skill => {
        if (userSkills.includes(skill.toLowerCase())) {
          matches++;
        }
      });
      
      const matchScore = Math.round((matches / job.skills.length) * 100);
      return { ...job, matchScore };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Sync active jobs count on widget
    if (this.dashActiveOffers) {
      this.dashActiveOffers.textContent = evaluatedJobs.length;
    }

    this.dashboardJobsContainer.innerHTML = evaluatedJobs.map(job => `
      <div class="rec-item" style="align-items: center;">
        <div style="font-size: 1.5rem; background: rgba(255,255,255,0.03); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); border: 1px solid var(--card-border);">
          🏢
        </div>
        <div class="rec-details">
          <h4>${job.title}</h4>
          <p style="font-size: 0.8rem; color: var(--text-secondary);">${job.company} • ${job.location}</p>
          <div class="flex-row" style="margin-top: 6px; flex-wrap: wrap; gap: 4px;">
            ${job.skills.map(s => {
              const hasIt = userSkills.includes(s.toLowerCase());
              const style = hasIt ? 'border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.05); color: var(--accent);' : 'border-color: var(--card-border); color: var(--text-muted);';
              return `<span style="font-size: 0.7rem; padding: 1px 6px; border: 1px solid; border-radius: 4px; ${style}">${s}</span>`;
            }).join('')}
          </div>
        </div>
        <div style="text-align: right; margin-left: auto; display:flex; flex-direction:column; gap:4px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">${job.salary}</span>
          <span style="font-size: 0.75rem; font-weight:600; color: ${job.matchScore >= 75 ? 'var(--accent)' : job.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)'};">
            ${job.matchScore}% Match
          </span>
        </div>
      </div>
    `).join('');
  }
}

// Global initialization on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  window.auraApp = new AuraApp();
});
