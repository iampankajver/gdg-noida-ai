class AuraCoachChat {
  constructor(app) {
    this.app = app;
    
    // Interview State Machine properties
    this.isInterviewMode = false;
    this.interviewRole = null;
    this.interviewQuestions = [];
    this.currentQuestionIdx = 0;
    this.interviewAnswers = [];
    
    // Salary Negotiation State Machine properties (Hackathon addition)
    this.isNegotiationMode = false;
    this.negotiationOffer = 1400000; // 14L base
    this.negotiationLeverage = "Medium";
    this.negotiationRole = null;
    
    // Audio/Voice settings
    this.isAudioEnabled = false;
    this.waveAnimationId = null;
    this.wavePhase = 0;

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
    
    // Voice/Canvas elements
    this.btnAudioToggle = document.getElementById('btn-audio-toggle');
    this.voiceWaveCanvas = document.getElementById('voice-wave-canvas');
    if (this.voiceWaveCanvas) {
      this.canvasCtx = this.voiceWaveCanvas.getContext('2d');
    }
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

    if (this.btnAudioToggle) {
      this.btnAudioToggle.addEventListener('click', () => this.toggleAudioVoice());
    }
  }

  toggleAudioVoice() {
    this.isAudioEnabled = !this.isAudioEnabled;
    
    if (this.isAudioEnabled) {
      this.btnAudioToggle.classList.add('active');
      this.btnAudioToggle.setAttribute('title', 'Mute Nova Voice');
      if (this.voiceWaveCanvas) {
        this.voiceWaveCanvas.classList.add('active');
        this.voiceWaveCanvas.width = 100;
        this.voiceWaveCanvas.height = 30;
        this.startWaveAnimation();
      }
      this.speakLastMessage();
    } else {
      this.btnAudioToggle.classList.remove('active');
      this.btnAudioToggle.setAttribute('title', 'Toggle Nova Voice (TTS)');
      if (this.voiceWaveCanvas) {
        this.voiceWaveCanvas.classList.remove('active');
      }
      if (this.waveAnimationId) {
        cancelAnimationFrame(this.waveAnimationId);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }

  speakLastMessage() {
    const coachMessages = this.messagesContainer.querySelectorAll('.chat-msg.coach .msg-bubble');
    if (coachMessages.length > 0) {
      const lastMsg = coachMessages[coachMessages.length - 1].textContent;
      this.speakText(lastMsg);
    }
  }

  speakText(text) {
    if (!this.isAudioEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); 
    
    const cleanText = text
      .replace(/\*\*|`|_|#|-/g, '')
      .replace(/https?:\/\/[^\s]+/g, 'the link')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB'));
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    
    utterance.rate = 1.05; 
    window.speechSynthesis.speak(utterance);
  }

  startWaveAnimation() {
    const ctx = this.canvasCtx;
    const canvas = this.voiceWaveCanvas;
    if (!ctx || !canvas) return;

    const draw = () => {
      if (!this.isAudioEnabled) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const isSpeaking = window.speechSynthesis && window.speechSynthesis.speaking;
      const maxAmp = isSpeaking ? 10 : 2; 
      
      this.wavePhase += 0.15;

      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#06b6d4'; 
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#06b6d4';

      // Wave 1
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.1 + this.wavePhase) * maxAmp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Wave 2
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)'; 
      ctx.shadowColor = '#a855f7';
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.cos(x * 0.08 - this.wavePhase) * (maxAmp * 0.7);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      this.waveAnimationId = requestAnimationFrame(draw);
    };

    draw();
  }

  renderPrompts() {
    if (!this.promptsContainer) return;
    
    // Add custom negotiation simulation option to options list
    const prompts = [...AURA_DATA.coachDialogues.prompts];
    prompts.push({ text: "💰 Practice Salary Negotiation", action: "start_salary_negotiation" });

    this.promptsContainer.innerHTML = prompts.map(p => `
      <button class="prompt-suggestion-item" data-action="${p.action}">
        ${p.text}
      </button>
    `).join('');

    this.promptsContainer.querySelectorAll('.prompt-suggestion-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = e.target.textContent.trim();
        const action = e.target.getAttribute('data-action');
        this.handlePromptClick(text, action);
      });
    });
  }

  handlePromptClick(text, action) {
    this.sendUserMsg(text);
    
    setTimeout(() => {
      this.executeAction(action);
    }, 600);
  }

  executeAction(action) {
    switch (action) {
      case "start_mock_interview":
        this.startMockInterview();
        break;
      case "start_salary_negotiation":
        this.startSalaryNegotiation();
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
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    setTimeout(() => {
      if (this.isNegotiationMode) {
        this.processNegotiationResponse(query);
      } else if (this.isInterviewMode) {
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
    this.speakText(text);
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

  formatMarkdown(text) {
    let clean = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background: rgba(255,255,255,0.08); padding: 2px 4px; border-radius: 4px;">$1</code>');
    
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
    
    if (q.includes("interview") || q.includes("mock")) {
      this.executeAction("start_mock_interview");
    } else if (q.includes("negotiat") || q.includes("salary offer")) {
      this.executeAction("start_salary_negotiation");
    } else if (q.includes("resume") || q.includes("cv") || q.includes("ats")) {
      this.executeAction("suggest_resume_help");
    } else if (q.includes("salary") || q.includes("boost") || q.includes("earn")) {
      this.executeAction("show_lucrative_skills");
    } else if (q.includes("market") || q.includes("noida") || q.includes("hiring")) {
      this.executeAction("explain_market");
    } else if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      this.sendNovaReply("Hello! I'm ready. Let's calibrate your profile, start an interview prep, or chat about salary ranges.");
    } else {
      this.sendNovaReply(`
        I hear you! To give you the best career advice, I'd suggest checking out these options:
        - Type **interview** to start a mock technical interview for your active role.
        - Type **negotiate** to run an interactive salary negotiation roleplay.
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

    this.isInterviewMode = true;
    this.isNegotiationMode = false;
    this.interviewRole = currentRole;
    this.interviewQuestions = allQuestions;
    this.currentQuestionIdx = 0;
    this.interviewAnswers = [];

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
    const lowerAnswer = answerText.toLowerCase();
    let score = 30;
    const matchedKeywords = [];
    
    question.keywords.forEach(kw => {
      if (lowerAnswer.includes(kw.toLowerCase())) {
        score += 10;
        matchedKeywords.push(kw);
      }
    });

    if (answerText.length > 150) score += 10;
    score = Math.min(score, 100);

    this.interviewAnswers.push({
      question: question.question,
      userAnswer: answerText,
      score: score,
      matched: matchedKeywords,
      missing: question.keywords.filter(kw => !matchedKeywords.includes(kw))
    });

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

    if (this.currentQuestionIdx < this.interviewQuestions.length) {
      this.updateInterviewSidebar();
      
      this.sendNovaReply(`
        ${feedback}
        
        ---
        
        **Here is Question ${this.currentQuestionIdx + 1}:**
        ${this.interviewQuestions[this.currentQuestionIdx].question}
      `);
    } else {
      this.updateInterviewSidebar();
      this.finishMockInterview(feedback);
    }
  }

  finishMockInterview(lastQuestionFeedback) {
    this.isInterviewMode = false;
    
    const totalScore = this.interviewAnswers.reduce((sum, item) => sum + item.score, 0);
    const avgScore = Math.round(totalScore / this.interviewAnswers.length);
    
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

  // --- INTERACTIVE SALARY NEGOTIATION ROLEPLAY GAME ---
  startSalaryNegotiation() {
    const currentRole = AURA_DATA.roles.find(r => r.id === this.app.profileManager.profile.targetRoleId);
    
    if (!currentRole) {
      this.sendNovaReply("Please set your target career goal in the Profile section before initiating the negotiation simulator.");
      return;
    }

    this.isNegotiationMode = true;
    this.isInterviewMode = false;
    this.negotiationOffer = 1400000; // Starting offer at ₹14 Lakhs
    this.negotiationLeverage = "Medium";
    this.negotiationRole = currentRole;

    this.updateNegotiationSidebar();

    this.sendNovaReply(`
      💰 **Salary Negotiation Roleplay Activated**
      - Role: *${currentRole.name} at Innovate AI*
      - Starting Offer: *₹14,000,000 (14 Lakhs / yr)*
      
      Nova is playing the role of a hiring manager. Respond to counter-offer and defend your requested package. Nova will evaluate your leverage parameters (skills, competing offers, certifications).
      
      **Nova's Opening Statement:**
      "Hi Pankaj! The dev team was extremely impressed by your portfolio reviews. We want to extend an offer to join us in our Noida office. We have budgeted a base salary of **₹14 Lakhs per annum**. What are your thoughts on this package?"
    `);
  }

  processNegotiationResponse(responseQuery) {
    const text = responseQuery.toLowerCase();
    
    // Parse target numbers from the response text
    // Handles matches like "18", "18l", "18 lakhs", "1800000" etc
    const lakhMatches = text.match(/\b(\d{2})\b/) || text.match(/\b(\d{2})l\b/) || text.match(/\b(\d{2})\s*lakh(s)?\b/);
    const fullNumberMatches = text.match(/\b(\d{6,7})\b/);
    
    let requestedVal = null;
    
    if (lakhMatches) {
      requestedVal = parseInt(lakhMatches[1]) * 100000;
    } else if (fullNumberMatches) {
      requestedVal = parseInt(fullNumberMatches[1]);
    }

    // Check if user wants to accept the offer
    const isAccepting = text.includes("accept") || text.includes("agree") || text.includes("sign") || text.includes("sounds good");

    if (isAccepting) {
      this.isNegotiationMode = false;
      if (this.chatSidebarMetrics) this.chatSidebarMetrics.innerHTML = '';
      
      this.sendNovaReply(`
        🤝 **Negotiation Concluded: Offer Accepted!**
        - Final Settled package: **₹${(this.negotiationOffer / 100000).toFixed(1)} Lakhs / yr**
        
        "That is wonderful to hear, Pankaj! We are excited to have you on board. I will get our finance team to draw up the formal contract for **₹${(this.negotiationOffer / 100000).toFixed(1)} Lakhs** and email it to you by tomorrow. Welcome to Innovate AI!"
      `);
      return;
    }

    if (!requestedVal) {
      // Prompt user to give a specific number
      this.sendNovaReply(`
        "I hear your thoughts, but could you specify what numeric figure or compensation bracket you are aiming for? This helps me present a concrete number back to our leadership team."
      `);
      return;
    }

    // 1. Evaluate counter offer
    const delta = requestedVal - this.negotiationOffer;
    const deltaPercentage = (delta / this.negotiationOffer) * 100;

    let responseText = "";

    // Recruiter limits checks
    if (requestedVal <= this.negotiationOffer) {
      responseText = `"Well, if you are comfortable with the current number, we can proceed right away to finalize details!"`;
    } else if (requestedVal > 2500000) {
      // Too high stretch
      this.negotiationOffer = 1550000;
      this.negotiationLeverage = "Low";
      responseText = `"I'm afraid that figure (₹${(requestedVal / 100000).toFixed(1)} Lakhs) is well outside our maximum salary bands for this level. The absolute limit I can get authorized from our VP of engineering is **₹15.5 Lakhs**, otherwise we might have to consider other candidates. Let me know if that works."`;
    } else {
      // Realistic range counter (15L - 25L)
      // Check justifications keywords
      const hasCompetencyJustification = text.includes("next.js") || text.includes("typescript") || text.includes("performance") || text.includes("docker") || text.includes("aws") || text.includes("kubernetes") || text.includes("experience");
      const hasCompetingOffer = text.includes("competing") || text.includes("other offer") || text.includes("another offer") || text.includes("market rate");

      if (hasCompetingOffer && hasCompetencyJustification) {
        this.negotiationOffer = requestedVal;
        this.negotiationLeverage = "Extreme";
        responseText = `"You make a very compelling argument. Given your advanced tech certifications and the competing timelines you are managing, we really want to lock you in. I will approve your counter-offer of **₹${(requestedVal / 100000).toFixed(1)} Lakhs per annum**. Do we have a deal?"`;
      } else if (hasCompetencyJustification) {
        const counterProposal = Math.round(this.negotiationOffer + delta * 0.7);
        this.negotiationOffer = counterProposal;
        this.negotiationLeverage = "High";
        responseText = `"Since you bring hands-on experience in the specific frameworks (TypeScript/React) we are migrating to, I can justify a budget bump. We can't hit your exact figure, but I can offer a compromise of **₹${(counterProposal / 100000).toFixed(1)} Lakhs**. Will this package work for you?"`;
      } else {
        const counterProposal = Math.round(this.negotiationOffer + delta * 0.4);
        this.negotiationOffer = counterProposal;
        this.negotiationLeverage = "Medium";
        responseText = `"We see your value, but we need to balance internal equity. I can push our offer slightly to **₹${(counterProposal / 100000).toFixed(1)} Lakhs**. To help me push this higher, could you tell me more about what unique architectural contributions you would make to our team?"`;
      }
    }

    this.updateNegotiationSidebar();
    this.sendNovaReply(responseText);
  }

  updateNegotiationSidebar() {
    if (!this.chatSidebarMetrics || !this.isNegotiationMode) return;

    this.chatSidebarMetrics.innerHTML = `
      <div class="interview-metrics-panel" style="background: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.2);">
        <h4 style="color: white; margin-bottom: 8px; font-size: 0.95rem;">Salary Negotiation Simulator</h4>
        <div class="interview-metric-row">
          <span>Active Offer:</span>
          <span class="interview-metric-val" style="color: var(--warning);">₹${(this.negotiationOffer / 100000).toFixed(1)} Lakhs / yr</span>
        </div>
        <div class="interview-metric-row">
          <span>Leverage Level:</span>
          <span class="interview-metric-val" style="color: var(--accent);">${this.negotiationLeverage}</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 6px; border-top: 1px solid var(--card-border); padding-top: 6px;">
          Justify your counter-offer with skills, competing offers, or market certifications. Type "accept" to conclude.
        </div>
      </div>
    `;
  }
}
