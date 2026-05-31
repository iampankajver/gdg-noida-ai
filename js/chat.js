class AuraCoachChat {
  constructor(app) {
    this.app = app;
    
    // State machine properties
    this.isInterviewMode = false;
    this.interviewRole = null;
    this.interviewQuestions = [];
    this.currentQuestionIdx = 0;
    this.interviewAnswers = [];
    
    this.initElements();
    this.bindEvents();
    this.sendSystemMsg(AURA_DATA.coachDialogues.welcome);
    this.renderPrompts();
  }

  initElements() {
    this.messagesContainer = document.getElementById('chat-messages-container');
    this.inputField = document.getElementById('chat-input-field');
    this.sendBtn = document.getElementById('chat-send-btn');
    this.promptsContainer = document.getElementById('prompt-suggestions');
    this.chatSidebarMetrics = document.getElementById('chat-sidebar-metrics');
  }

  bindEvents() {
    if (this.sendBtn && this.inputField) {
      this.sendBtn.addEventListener('click', () => this.handleUserSend());
      this.inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleUserSend();
        }
      });
    }
  }

  renderPrompts() {
    if (!this.promptsContainer) return;
    
    const prompts = AURA_DATA.coachDialogues.prompts;
    this.promptsContainer.innerHTML = prompts.map(p => `
      <button class="prompt-suggestion-item" data-action="${p.action}">
        ${p.text}
      </button>
    `).join('');

    // Attach click events
    this.promptsContainer.querySelectorAll('.prompt-suggestion-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = e.target.textContent.trim();
        const action = e.target.getAttribute('data-action');
        this.handlePromptClick(text, action);
      });
    });
  }

  handlePromptClick(text, action) {
    // 1. Add User bubble
    this.sendUserMsg(text);
    
    // 2. Perform action
    setTimeout(() => {
      this.executeAction(action);
    }, 600);
  }

  executeAction(action) {
    switch (action) {
      case "start_mock_interview":
        this.startMockInterview();
        break;
      case "suggest_resume_help":
        this.showResumeHelp();
        break;
      case "show_lucrative_skills":
        this.showLucrativeSkills();
        break;
      case "explain_market":
        this.explainMarketStats();
        break;
      default:
        this.sendNovaReply("I'm here to help. What would you like to discuss next?");
    }
  }

  handleUserSend() {
    const query = this.inputField.value.trim();
    if (!query) return;
    
    this.sendUserMsg(query);
    this.inputField.value = '';
    
    // Match against current mode
    setTimeout(() => {
      if (this.isInterviewMode) {
        this.processInterviewAnswer(query);
      } else {
        this.processGeneralQuery(query);
      }
    }, 800);
  }

  sendUserMsg(text) {
    this.appendMessageBubble(text, 'user', 'U');
  }

  sendSystemMsg(text) {
    this.appendMessageBubble(text, 'coach', 'N');
  }

  appendMessageBubble(text, sender, initial) {
    if (!this.messagesContainer) return;
    
    const msgCard = document.createElement('div');
    msgCard.className = `chat-msg ${sender}`;
    
    msgCard.innerHTML = `
      <div class="chat-msg-avatar">${initial}</div>
      <div class="msg-bubble">${this.formatMarkdown(text)}</div>
    `;
    
    this.messagesContainer.appendChild(msgCard);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'chat-msg coach typing-indicator-wrapper';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
      <div class="chat-msg-avatar">N</div>
      <div class="msg-bubble" style="padding: 8px 12px;">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    this.messagesContainer.appendChild(indicator);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  sendNovaReply(text) {
    this.showTypingIndicator();
    
    // Simulate thinking delay
    setTimeout(() => {
      this.hideTypingIndicator();
      this.sendSystemMsg(text);
    }, 1200);
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  // Very lightweight markdown formatter for list lines, bold tags and links
  formatMarkdown(text) {
    let clean = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background: rgba(255,255,255,0.08); padding: 2px 4px; border-radius: 4px;">$1</code>');
    
    // Format bullets
    if (clean.includes('\n- ')) {
      const lines = clean.split('\n');
      let inList = false;
      
      const formattedLines = lines.map(line => {
        if (line.startsWith('- ')) {
          let output = '';
          if (!inList) {
            output += '<ul style="margin-left: 20px; margin-top: 8px; margin-bottom: 8px; display: flex; flex-direction: column; gap: 4px;">';
            inList = true;
          }
          output += `<li>${line.substring(2)}</li>`;
          return output;
        } else {
          let output = '';
          if (inList) {
            output += '</ul>';
            inList = false;
          }
          output += line;
          return output;
        }
      });
      
      if (inList) {
        formattedLines.push('</ul>');
      }
      clean = formattedLines.join('<br>');
    } else {
      clean = clean.replace(/\n/g, '<br>');
    }
    
    return clean;
  }

  // --- GENERAL CONVERSATION PARSING ---
  processGeneralQuery(query) {
    const q = query.toLowerCase();
    
    // Keywords triggers
    if (q.includes("interview") || q.includes("mock")) {
      this.executeAction("start_mock_interview");
    } else if (q.includes("resume") || q.includes("cv") || q.includes("ats")) {
      this.executeAction("suggest_resume_help");
    } else if (q.includes("salary") || q.includes("boost") || q.includes("earn")) {
      this.executeAction("show_lucrative_skills");
    } else if (q.includes("market") || q.includes("noida") || q.includes("hiring")) {
      this.executeAction("explain_market");
    } else if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      this.sendNovaReply("Hello! I'm ready. Let's calibrate your profile, start an interview prep, or chat about salary ranges.");
    } else {
      // Default fallback
      this.sendNovaReply(`
        I hear you! To give you the best career advice, I'd suggest checking out these options:
        - Type **interview** to start a mock technical interview for your active role.
        - Ask about **salaries** to see the highest-value capabilities in the Noida region.
        - Head over to the **Profile** tab to upload and grade your current resume.
      `);
    }
  }

  // --- ACTIONS IMPLEMENTATION ---
  showResumeHelp() {
    this.sendNovaReply(`
      To optimize your resume and improve your interview selection rates:
      
      1. Open the **Profile & Resume Optimizer** tab from the sidebar.
      2. You can paste your resume or click **Load Weak Sample Resume** to test our grader.
      3. Focus on adding **metrics** (e.g., 'saved 15 hours/week' instead of 'saved time').
      4. Align your keywords to your target role. For example, if you want a Senior Frontend role, make sure keywords like **TypeScript**, **Vite**, and **State Management** are clearly present.
    `);
  }

  showLucrativeSkills() {
    const skillList = AURA_DATA.trends.growthSkills;
    const formatted = skillList.map(s => `- **${s.name}**: +${s.growth}% growth (boosts salary by ${s.salaryBoost})`).join('\n');
    
    this.sendNovaReply(`
      Here are the most lucrative skills in the current Noida and Remote labor-markets:
      
      ${formatted}
      
      You can add these skills directly to your roadmap by choosing your target role on the **Career Advisor** tab.
    `);
  }

  explainMarketStats() {
    const roles = AURA_DATA.roles;
    const items = roles.map(r => `- **${r.name}**: Average compensation is ${r.averageSalary} (Growth: ${r.growth})`).join('\n');
    
    this.sendNovaReply(`
      Here is the Noida market report for Q2 2026:
      
      ${items}
      
      *Trend analysis:* AI and Machine Learning Engineers lead growth at **+32%**, closely followed by Cloud DevOps at **+24%**. Hiring velocity is currently **Critical** for experienced developers skilled in container orchestration (Kubernetes) and performance tuning.
    `);
  }

  // --- MOCK INTERVIEW ENGINE ---
  startMockInterview() {
    const currentRole = AURA_DATA.roles.find(r => r.id === this.app.profileManager.profile.targetRoleId);
    
    if (!currentRole) {
      this.sendNovaReply("Please set your target career goal in the Profile section before initiating the technical interview.");
      return;
    }

    const allQuestions = AURA_DATA.coachDialogues.mockInterviews[currentRole.id];
    
    if (!allQuestions || allQuestions.length === 0) {
      this.sendNovaReply(`I apologize, I do not have a preconfigured technical syllabus for the **${currentRole.name}** role yet. Please switch to Senior Frontend or Cloud DevOps in your profile settings to run a mock session!`);
      return;
    }

    // Set interview state
    this.isInterviewMode = true;
    this.interviewRole = currentRole;
    this.interviewQuestions = allQuestions;
    this.currentQuestionIdx = 0;
    this.interviewAnswers = [];

    // Update sidebar layout
    this.updateInterviewSidebar();

    this.sendNovaReply(`
      🚀 **Mock Technical Interview Initiated**
      - Role: *${currentRole.name}*
      - Total Syllabus: *${this.interviewQuestions.length} Questions*
      
      I will present one technical question at a time. Respond as you would in a real technical round. I'll provide scoring feedback on each answer and compile a diagnostic report at the end.
      
      **Here is Question 1:**
      ${this.interviewQuestions[0].question}
    `);
  }

  processInterviewAnswer(answerText) {
    const question = this.interviewQuestions[this.currentQuestionIdx];
    
    // Evaluate answer using simple keyword density & length checks
    const lowerAnswer = answerText.toLowerCase();
    let score = 30; // base score if they wrote something
    const matchedKeywords = [];
    
    question.keywords.forEach(kw => {
      if (lowerAnswer.includes(kw.toLowerCase())) {
        score += 10;
        matchedKeywords.push(kw);
      }
    });

    if (answerText.length > 150) score += 10; // extra points for detailed description
    score = Math.min(score, 100);

    // Save answer data
    this.interviewAnswers.push({
      question: question.question,
      userAnswer: answerText,
      score: score,
      matched: matchedKeywords,
      missing: question.keywords.filter(kw => !matchedKeywords.includes(kw))
    });

    // Provide feedback response
    let feedback = `**Nova's Assessment (Question ${this.currentQuestionIdx + 1}):**\n`;
    feedback += `Score: **${score}/100**\n`;
    
    if (score >= 80) {
      feedback += `Excellent response! You demonstrated solid command of key concepts: ${matchedKeywords.join(', ')}.`;
    } else if (score >= 60) {
      feedback += `Good effort. You hit key aspects like *${matchedKeywords.join(', ')}*, but missed discussing other critical criteria such as: *${question.missing.slice(0,2).join(', ')}*.`;
    } else {
      feedback += `Your answer is a bit too brief or off-target. You should review concepts around: *${question.keywords.join(', ')}*.`;
    }

    this.currentQuestionIdx++;

    // Check if there are more questions
    if (this.currentQuestionIdx < this.interviewQuestions.length) {
      // Show feedback + next question
      this.updateInterviewSidebar();
      
      this.sendNovaReply(`
        ${feedback}
        
        ---
        
        **Here is Question ${this.currentQuestionIdx + 1}:**
        ${this.interviewQuestions[this.currentQuestionIdx].question}
      `);
    } else {
      // Wrap up interview
      this.updateInterviewSidebar();
      this.finishMockInterview(feedback);
    }
  }

  finishMockInterview(lastQuestionFeedback) {
    this.isInterviewMode = false;
    
    // Calculate overall statistics
    const totalScore = this.interviewAnswers.reduce((sum, item) => sum + item.score, 0);
    const avgScore = Math.round(totalScore / this.interviewAnswers.length);
    
    // Clear sidebar layout
    if (this.chatSidebarMetrics) {
      this.chatSidebarMetrics.innerHTML = '';
    }

    this.sendNovaReply(`
      ${lastQuestionFeedback}
      
      ---
      
      🏆 **Technical Interview Complete!**
      - Final Grade: **${avgScore}/100**
      
      **Diagnostic Report Summary:**
      ${avgScore >= 80 ? '✔️ High Competency. Ready for actual interview loops.' : '⚠️ Core Skill Gaps identified.'}
      
      *Strengths:* You articulated ideas well around: ${this.getUnionMatchedKeywords()}.
      
      *Areas of Improvement:* Focus on reinforcing knowledge for: ${this.getUnionMissingKeywords()}.
      
      Would you like to start another mock run, review your profile gaps, or chat about salary ranges?
    `);
  }

  getUnionMatchedKeywords() {
    const list = [];
    this.interviewAnswers.forEach(ans => list.push(...ans.matched));
    const unique = [...new Set(list)];
    return unique.length > 0 ? unique.join(', ') : "None";
  }

  getUnionMissingKeywords() {
    const list = [];
    this.interviewAnswers.forEach(ans => list.push(...ans.missing));
    const unique = [...new Set(list)];
    return unique.length > 0 ? unique.join(', ') : "None";
  }

  updateInterviewSidebar() {
    if (!this.chatSidebarMetrics) return;

    if (!this.isInterviewMode) {
      this.chatSidebarMetrics.innerHTML = '';
      return;
    }

    const progress = Math.round((this.currentQuestionIdx / this.interviewQuestions.length) * 100);
    
    this.chatSidebarMetrics.innerHTML = `
      <div class="interview-metrics-panel">
        <h4 style="color: white; margin-bottom: 8px; font-size: 0.95rem;">Active Interview Session</h4>
        <div class="interview-metric-row">
          <span>Target Goal:</span>
          <span class="interview-metric-val">${this.interviewRole.name}</span>
        </div>
        <div class="interview-metric-row">
          <span>Question Progress:</span>
          <span class="interview-metric-val">${this.currentQuestionIdx + 1} of ${this.interviewQuestions.length}</span>
        </div>
        <div class="interview-progress-bar-bg">
          <div class="interview-progress-bar-fill" style="width: ${progress}%;"></div>
        </div>
      </div>
    `;
  }
}
