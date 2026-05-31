class AuraCareerAdvisor {
  constructor(app) {
    this.app = app;
    this.selectedRoleId = "frontend_engineer";
    
    // Track checklist items state (completed courses/sub-tasks)
    this.roadmapState = {};
    this.customCalibratedRole = null; // Holds custom job details when calibrated

    this.initElements();
    this.bindEvents();
    this.renderRoles();
    this.runSkillAudit();
  }

  initElements() {
    this.roleSelectorContainer = document.getElementById('target-role-selector');
    this.auditSummaryContainer = document.getElementById('audit-summary');
    this.skillBreakdownContainer = document.getElementById('skill-breakdown-list');
    this.roadmapContainer = document.getElementById('roadmap-timeline-container');
    
    // Custom Job elements
    this.customJobTextarea = document.getElementById('custom-job-textarea');
    this.btnCustomJobCalibrate = document.getElementById('btn-custom-job-calibrate');
    
    // Modal notification elements
    this.modalOverlay = document.getElementById('completion-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalText = document.getElementById('modal-text');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
  }

  bindEvents() {
    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () => {
        if (this.modalOverlay) this.modalOverlay.classList.remove('active');
      });
    }

    if (this.btnCustomJobCalibrate && this.customJobTextarea) {
      this.btnCustomJobCalibrate.addEventListener('click', () => this.calibrateCustomJobDescription());
    }
  }

  renderRoles() {
    if (!this.roleSelectorContainer) return;
    
    this.roleSelectorContainer.innerHTML = AURA_DATA.roles.map(role => `
      <div class="role-card ${role.id === this.selectedRoleId ? 'active' : ''}" data-role-id="${role.id}">
        <div class="role-icon">${role.icon}</div>
        <div class="role-name">${role.name}</div>
        <div class="role-salary">${role.averageSalary} Avg</div>
      </div>
    `).join('');

    // Attach click events
    this.roleSelectorContainer.querySelectorAll('.role-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const cardEl = e.currentTarget;
        const roleId = cardEl.getAttribute('data-role-id');
        
        // Disable custom mode if switching standard roles
        this.customCalibratedRole = null;
        
        this.selectRole(roleId);
      });
    });
  }

  selectRole(roleId) {
    this.selectedRoleId = roleId;
    
    // Update active UI cards
    this.roleSelectorContainer.querySelectorAll('.role-card').forEach(card => {
      if (card.getAttribute('data-role-id') === roleId) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    this.app.onTargetRoleChangeFromAdvisor(roleId);
    this.runSkillAudit();
  }

  // Parses pasted job requirements and builds a custom target role context (Hackathon wow feature)
  calibrateCustomJobDescription() {
    const text = this.customJobTextarea.value.trim();
    if (!text) {
      alert("Please paste your custom Job Description text first!");
      return;
    }

    const textLower = text.toLowerCase();

    // The complete set of technologies we have structured courses for
    const techDictionary = [
      "JavaScript", "React", "TypeScript", "Next.js", "State Management", 
      "Docker", "Kubernetes", "AWS", "Terraform", "Python", "Node.js", 
      "Machine Learning", "GraphQL", "Git", "SQL"
    ];

    // Scan description for occurrences of technologies
    const parsedSkills = [];
    techDictionary.forEach(tech => {
      // Use regex to match full words
      const regex = new RegExp(`\\b${tech.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (regex.test(textLower)) {
        parsedSkills.push(tech);
      }
    });

    // Fallback if zero skills are recognized
    if (parsedSkills.length === 0) {
      alert("We couldn't identify any standard technologies in this posting. We have defaulted to standard requirements.");
      return;
    }

    // Build custom role object
    this.customCalibratedRole = {
      name: "Custom Calibrated Job Profile",
      requiredSkills: parsedSkills,
      secondarySkills: []
    };

    // Remove active styling from standard selector cards
    this.roleSelectorContainer.querySelectorAll('.role-card').forEach(card => {
      card.classList.remove('active');
    });

    // Recalculate
    this.runSkillAudit();

    // Show success dialog
    if (this.modalOverlay && this.modalTitle && this.modalText) {
      this.modalTitle.textContent = "Custom Calibration Loaded! ⚙️";
      this.modalText.innerHTML = `
        We analyzed the job requirements and extracted <strong>${parsedSkills.length} primary technologies</strong>:<br>
        [ ${parsedSkills.join(', ')} ]<br><br>
        We have updated the skill gap audit and timeline checks below to help you target this position.
      `;
      this.modalOverlay.classList.add('active');
    }
  }

  // Orchestrates profile comparison
  runSkillAudit() {
    const userSkills = this.app.profileManager.profile.skills.map(s => s.toLowerCase());
    
    // Choose active target context: custom role if loaded, else standard selectedRoleId
    let role;
    if (this.customCalibratedRole) {
      role = this.customCalibratedRole;
    } else {
      role = AURA_DATA.roles.find(r => r.id === this.selectedRoleId);
    }
    
    if (!role) return;

    const acquired = [];
    const criticalGaps = [];
    const secondaryGaps = [];

    // Check required skills (Critical)
    role.requiredSkills.forEach(skill => {
      if (userSkills.includes(skill.toLowerCase())) {
        acquired.push({ name: skill, type: 'required' });
      } else {
        criticalGaps.push(skill);
      }
    });

    // Check secondary skills (Nice to have)
    role.secondarySkills.forEach(skill => {
      if (userSkills.includes(skill.toLowerCase())) {
        acquired.push({ name: skill, type: 'secondary' });
      } else {
        secondaryGaps.push(skill);
      }
    });

    const totalSkills = role.requiredSkills.length + role.secondarySkills.length;
    const matchPercent = totalSkills > 0 ? Math.round((acquired.length / totalSkills) * 100) : 0;

    // Sync match score back to app (updates gauge index on dashboard)
    this.app.syncMarketAlignment(matchPercent, criticalGaps.length, acquired.length);

    this.renderAuditSummary(matchPercent, acquired.length, criticalGaps.length, secondaryGaps.length, role);
    this.renderSkillBreakdownList(acquired, criticalGaps, secondaryGaps);
    this.renderRoadmap(criticalGaps, secondaryGaps);
  }

  renderAuditSummary(matchPercent, acquiredCount, criticalCount, secondaryCount, role) {
    if (!this.auditSummaryContainer) return;
    
    const totalSkills = role.requiredSkills.length + role.secondarySkills.length;
    
    this.auditSummaryContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 3rem; font-weight: 800; color: var(--secondary); font-family: 'Outfit';">
          ${matchPercent}%
        </div>
        <div style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
          Profile Alignment for:
        </div>
        <div style="font-size: 0.95rem; font-weight: 700; color: white; margin-top: 4px;">
          ${role.name}
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.85rem;">
        <div class="flex-row" style="justify-content: space-between;">
          <span style="color: var(--text-secondary);">Acquired Capabilities</span>
          <span class="font-bold text-accent">${acquiredCount} Skills</span>
        </div>
        <div class="flex-row" style="justify-content: space-between;">
          <span style="color: var(--text-secondary);">Critical Competency Gaps</span>
          <span class="font-bold text-danger">${criticalCount} Gaps</span>
        </div>
        <div class="flex-row" style="justify-content: space-between;">
          <span style="color: var(--text-secondary);">Nice-to-Have Gaps</span>
          <span class="font-bold text-warning">${secondaryCount} Gaps</span>
        </div>
        <div style="height: 1px; background: var(--card-border); margin: 8px 0;"></div>
        <div class="flex-row" style="justify-content: space-between; font-size: 0.9rem;">
          <span style="color: var(--text-secondary);">Market Value Multiplier</span>
          <span class="font-bold text-accent" style="font-family: 'Outfit';">+${totalSkills > 0 ? Math.round((acquiredCount / totalSkills) * 45) : 0}% Potential</span>
        </div>
      </div>
    `;
  }

  renderSkillBreakdownList(acquired, criticalGaps, secondaryGaps) {
    if (!this.skillBreakdownContainer) return;

    let html = '';

    criticalGaps.forEach(skill => {
      html += `
        <div class="skill-breakdown-item">
          <span class="skill-breakdown-name">
            <span class="skill-status-indicator gap"></span>
            ${skill}
          </span>
          <span class="skill-breakdown-status-label gap">Critical Gap</span>
        </div>
      `;
    });

    secondaryGaps.forEach(skill => {
      html += `
        <div class="skill-breakdown-item">
          <span class="skill-breakdown-name">
            <span class="skill-status-indicator secondary-gap"></span>
            ${skill}
          </span>
          <span class="skill-breakdown-status-label secondary-gap">Nice-to-Have</span>
        </div>
      `;
    });

    acquired.forEach(item => {
      html += `
        <div class="skill-breakdown-item">
          <span class="skill-breakdown-name">
            <span class="skill-status-indicator acquired"></span>
            ${item.name}
          </span>
          <span class="skill-breakdown-status-label acquired">Acquired</span>
        </div>
      `;
    });

    this.skillBreakdownContainer.innerHTML = html || `<span style="color: var(--text-muted); font-size:0.8rem;">Add target role to audit.</span>`;
  }

  renderRoadmap(criticalGaps, secondaryGaps) {
    if (!this.roadmapContainer) return;

    const allGaps = [...criticalGaps, ...secondaryGaps];
    
    if (allGaps.length === 0) {
      this.roadmapContainer.innerHTML = `
        <div class="card text-center" style="padding: 40px 20px;">
          <div style="font-size: 3rem; margin-bottom: 16px;">🏆</div>
          <h3 style="margin-bottom: 8px;">No Skill Gaps Found!</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Your profile is fully calibrated and aligned to the requirements for this role.
            You are ready to leverage our resume optimizer or AI Coach mock interview tool to prepare.
          </p>
        </div>
      `;
      return;
    }

    this.roadmapContainer.innerHTML = allGaps.map((skill, index) => {
      const isCritical = criticalGaps.includes(skill);
      const details = AURA_DATA.curriculums[skill] || {
        duration: "6 Hours",
        difficulty: "Intermediate",
        salaryImpact: "₹1L - ₹2L",
        courses: [{ title: `Learn ${skill} Foundations`, provider: "Documentation", time: "3h", url: "https://google.com" }],
        checklist: [`Complete introductory tutorial for ${skill}`, `Build a prototype demo using ${skill}`]
      };

      if (!this.roadmapState[skill]) {
        this.roadmapState[skill] = details.checklist.map(() => false);
      }

      const activeClass = index === 0 ? 'active' : '';
      
      return `
        <div class="roadmap-step-card ${activeClass}" id="step-card-${skill.replace(/\s+/g, '-')}">
          <div class="roadmap-step-header">
            <span class="roadmap-step-title">
              <span class="rec-type-badge ${isCritical ? 'resume' : 'skill'}">
                ${isCritical ? 'Critical' : 'Elective'}
              </span>
              ${skill}
            </span>
            <span class="roadmap-step-difficulty">${details.difficulty} • ${details.duration}</span>
          </div>
          
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">
            Estimated compensation impact: <span class="text-accent font-bold">${details.salaryImpact} / year</span>
          </p>
          
          <div style="font-size: 0.85rem; font-weight:600; margin-bottom: 8px;">Curated Learning Material:</div>
          <div class="roadmap-resource-list">
            ${details.courses.map(course => `
              <a href="${course.url}" target="_blank" class="resource-card">
                <div class="resource-icon">📖</div>
                <div class="resource-info">
                  <div class="resource-title">${course.title}</div>
                  <div class="resource-meta">${course.provider} • ${course.time}</div>
                </div>
              </a>
            `).join('')}
          </div>
          
          <div style="font-size: 0.85rem; font-weight:600; margin-top: 16px; margin-bottom: 8px;">Practical checklist to acquire skill:</div>
          <ul class="step-checklist" data-skill="${skill}">
            ${details.checklist.map((item, cIdx) => `
              <li class="step-checklist-item ${this.roadmapState[skill][cIdx] ? 'completed' : ''}" data-index="${cIdx}">
                <input type="checkbox" ${this.roadmapState[skill][cIdx] ? 'checked' : ''}>
                <span>${item}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }).join('');

    this.roadmapContainer.querySelectorAll('.step-checklist-item').forEach(itemEl => {
      itemEl.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
          const cb = itemEl.querySelector('input');
          cb.checked = !cb.checked;
        }
        
        const checklistEl = itemEl.closest('.step-checklist');
        const skill = checklistEl.getAttribute('data-skill');
        const cIdx = parseInt(itemEl.getAttribute('data-index'));
        const isChecked = itemEl.querySelector('input').checked;
        
        this.updateStepChecklist(skill, cIdx, isChecked, itemEl);
      });
    });
  }

  updateStepChecklist(skill, index, isChecked, itemElement) {
    this.roadmapState[skill][index] = isChecked;
    
    if (isChecked) {
      itemElement.classList.add('completed');
    } else {
      itemElement.classList.remove('completed');
    }

    const isSkillComplete = this.roadmapState[skill].every(val => val === true);
    
    if (isSkillComplete) {
      this.celebrateSkillAcquisition(skill);
    }
  }

  celebrateSkillAcquisition(skill) {
    this.app.profileManager.addSkillDirectly(skill);
    
    if (this.modalOverlay && this.modalTitle && this.modalText) {
      this.modalTitle.textContent = `Skill Unlocked: ${skill}! 🚀`;
      this.modalText.innerHTML = `
        Congratulations! You have completed the curriculum checks for <strong>${skill}</strong>.<br><br>
        This skill has been added to your profile inventory. Your **Market Alignment Index** has been updated. Check your dashboard to view your new competitive standing!
      `;
      this.modalOverlay.classList.add('active');
    }
    
    this.runSkillAudit();
  }
}
