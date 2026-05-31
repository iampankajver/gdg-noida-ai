class AuraTrendsRenderer {
  constructor(app) {
    this.app = app;
    this.initElements();
    this.renderGrowthSkills();
    this.renderSalaryDistribution();
    this.renderHiringVelocity();
    
    // Global resize handler
    window.addEventListener('resize', () => {
      this.renderSalaryDistribution();
      this.renderHiringVelocity();
    });
  }

  initElements() {
    this.growthSkillsContainer = document.getElementById('growth-skills-list');
    this.salaryChartContainer = document.getElementById('salary-chart-container');
    this.velocityChartContainer = document.getElementById('velocity-chart-container');
    
    // Create tooltips if they don't exist
    this.createTooltip('salary-tooltip');
    this.createTooltip('velocity-tooltip');
  }

  createTooltip(id) {
    let tooltip = document.getElementById(id);
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = id;
      tooltip.className = 'chart-tooltip';
      document.body.appendChild(tooltip);
    }
  }

  // Renders the trending skills checklist with demand ratings
  renderGrowthSkills() {
    if (!this.growthSkillsContainer) return;
    
    const skills = AURA_DATA.trends.growthSkills;
    this.growthSkillsContainer.innerHTML = skills.map(skill => `
      <div class="rec-item">
        <div class="stat-info" style="flex-grow: 1;">
          <div class="flex-row" style="justify-content: space-between; width: 100%;">
            <span class="font-bold" style="font-size: 0.95rem;">${skill.name}</span>
            <span class="text-accent font-bold" style="font-size: 0.9rem;">${skill.growth}% Growth</span>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
            Demand Intensity: <span class="font-bold text-secondary">${skill.demand}</span> | Salary Uplift: <span class="text-accent font-bold">${skill.salaryBoost}</span>
          </p>
          <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-top: 10px; overflow:hidden;">
            <div style="width: ${skill.growth * 1.8}%; height: 100%; background: var(--secondary-gradient); border-radius:10px;"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Renders a beautiful custom SVG grouped bar chart for Salaries
  renderSalaryDistribution() {
    if (!this.salaryChartContainer) return;
    
    const containerWidth = this.salaryChartContainer.clientWidth || 400;
    const containerHeight = 220;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    
    const data = AURA_DATA.trends.salaryDistribution;
    
    // Clear previous
    this.salaryChartContainer.innerHTML = '';
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', containerHeight);
    svg.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);
    svg.style.overflow = 'visible';
    
    // Scale calculations
    const maxVal = 4000000; // 40L max
    const chartWidth = containerWidth - padding.left - padding.right;
    const chartHeight = containerHeight - padding.top - padding.bottom;
    
    // Y-Axis grid lines
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const yVal = (maxVal / ticks) * i;
      const yCo = chartHeight + padding.top - (yVal / maxVal) * chartHeight;
      
      // Grid line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.left);
      line.setAttribute('y1', yCo);
      line.setAttribute('x2', padding.left + chartWidth);
      line.setAttribute('y2', yCo);
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.04)');
      line.setAttribute('stroke-dasharray', '4');
      svg.appendChild(line);
      
      // Label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', padding.left - 10);
      label.setAttribute('y', yCo + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('fill', 'var(--text-muted)');
      label.setAttribute('font-size', '10');
      label.textContent = `₹${(yVal / 100000).toFixed(0)}L`;
      svg.appendChild(label);
    }
    
    // Bars and groups
    const groupCount = data.length;
    const groupWidth = chartWidth / groupCount;
    const barSpacing = 4;
    const subBarWidth = (groupWidth - 20) / 3; // 3 bars per group (Entry, Mid, Senior)
    
    data.forEach((group, idx) => {
      const groupX = padding.left + (idx * groupWidth);
      
      // Render Group X-Label
      const groupLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      groupLabel.setAttribute('x', groupX + (groupWidth / 2));
      groupLabel.setAttribute('y', chartHeight + padding.top + 20);
      groupLabel.setAttribute('text-anchor', 'middle');
      groupLabel.setAttribute('fill', 'var(--text-secondary)');
      groupLabel.setAttribute('font-size', '11');
      groupLabel.setAttribute('font-weight', '500');
      groupLabel.textContent = group.role;
      svg.appendChild(groupLabel);
      
      // Sub-bars
      const tiers = [
        { key: 'entry', val: group.entry, color: '#6b7280', label: 'Entry Level' },
        { key: 'mid', val: group.mid, color: '#06b6d4', label: 'Mid Level' },
        { key: 'senior', val: group.senior, color: '#6366f1', label: 'Senior Level' }
      ];
      
      tiers.forEach((tier, tIdx) => {
        const barX = groupX + 10 + (tIdx * (subBarWidth + barSpacing));
        const barH = (tier.val / maxVal) * chartHeight;
        const barY = chartHeight + padding.top - barH;
        
        // Rect element
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', barX);
        rect.setAttribute('y', chartHeight + padding.top); // Start from bottom for animation
        rect.setAttribute('width', subBarWidth);
        rect.setAttribute('height', 0);
        rect.setAttribute('rx', '3');
        rect.setAttribute('fill', tier.color);
        rect.setAttribute('opacity', '0.75');
        rect.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Hover effects
        rect.addEventListener('mouseenter', (e) => {
          rect.setAttribute('opacity', '1');
          this.showTooltip('salary-tooltip', e, `
            <div style="font-weight: 700; color: white;">${group.role} - ${tier.label}</div>
            <div style="color: var(--accent); font-weight: 600; margin-top: 4px;">
              Avg Salary: ₹${(tier.val / 100000).toFixed(1)} Lakhs / year
            </div>
          `);
        });
        
        rect.addEventListener('mouseleave', () => {
          rect.setAttribute('opacity', '0.75');
          this.hideTooltip('salary-tooltip');
        });
        
        svg.appendChild(rect);
        
        // Trigger entry animation
        setTimeout(() => {
          rect.setAttribute('y', barY);
          rect.setAttribute('height', barH);
        }, 100 + (idx * 50) + (tIdx * 30));
      });
    });
    
    this.salaryChartContainer.appendChild(svg);
  }

  // Renders a beautiful SVG line chart for Hiring Velocity
  renderHiringVelocity() {
    if (!this.velocityChartContainer) return;
    
    const containerWidth = this.velocityChartContainer.clientWidth || 400;
    const containerHeight = 220;
    const padding = { top: 20, right: 30, bottom: 40, left: 40 };
    
    const data = AURA_DATA.trends.hiringSpeeds;
    
    // Clear previous
    this.velocityChartContainer.innerHTML = '';
    
    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', containerHeight);
    svg.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);
    svg.style.overflow = 'visible';
    
    const maxVal = 25; // 25 days average to hire (lower = faster velocity)
    const chartWidth = containerWidth - padding.left - padding.right;
    const chartHeight = containerHeight - padding.top - padding.bottom;
    
    // Grid Lines (Y axis: time to hire in days)
    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      const val = Math.round((maxVal / ticks) * i);
      const yCo = chartHeight + padding.top - (val / maxVal) * chartHeight;
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.left);
      line.setAttribute('y1', yCo);
      line.setAttribute('x2', padding.left + chartWidth);
      line.setAttribute('y2', yCo);
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.04)');
      line.setAttribute('stroke-dasharray', '4');
      svg.appendChild(line);
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', padding.left - 10);
      label.setAttribute('y', yCo + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('fill', 'var(--text-muted)');
      label.setAttribute('font-size', '10');
      label.textContent = `${val}d`;
      svg.appendChild(label);
    }
    
    // Line charts specs
    const series = [
      { key: 'frontEnd', color: '#06b6d4', label: 'Frontend UI' },
      { key: 'devOps', color: '#6366f1', label: 'DevOps/Cloud' },
      { key: 'aiMl', color: '#10b981', label: 'AI/ML Engineers' }
    ];
    
    const colWidth = chartWidth / (data.length - 1);
    
    series.forEach((s) => {
      let pathD = '';
      const points = [];
      
      data.forEach((monthData, idx) => {
        const x = padding.left + (idx * colWidth);
        const y = chartHeight + padding.top - (monthData[s.key] / maxVal) * chartHeight;
        points.push({ x, y, val: monthData[s.key], month: monthData.month });
        
        if (idx === 0) {
          pathD += `M ${x} ${y}`;
        } else {
          pathD += ` L ${x} ${y}`;
        }
      });
      
      // Render line path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', s.color);
      path.setAttribute('stroke-width', '3');
      path.setAttribute('stroke-linecap', 'round');
      
      // Calculate length for path stroke dash animation
      const pathLength = 1000; 
      path.setAttribute('stroke-dasharray', pathLength);
      path.setAttribute('stroke-dashoffset', pathLength);
      path.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
      svg.appendChild(path);
      
      // Trigger animation
      setTimeout(() => {
        path.setAttribute('stroke-dashoffset', 0);
      }, 200);
      
      // Render interactive circles
      points.forEach((pt) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pt.x);
        circle.setAttribute('cy', pt.y);
        circle.setAttribute('r', '5');
        circle.setAttribute('fill', 'var(--bg-secondary)');
        circle.setAttribute('stroke', s.color);
        circle.setAttribute('stroke-width', '3');
        circle.setAttribute('cursor', 'pointer');
        circle.style.transition = 'all 0.2s ease';
        
        circle.addEventListener('mouseenter', (e) => {
          circle.setAttribute('r', '7');
          this.showTooltip('velocity-tooltip', e, `
            <div style="font-weight: 700; color: white;">${s.label} (${pt.month})</div>
            <div style="color: ${s.color}; font-weight: 600; margin-top: 4px;">
              Avg Days to Hire: ${pt.val} days
            </div>
          `);
        });
        
        circle.addEventListener('mouseleave', () => {
          circle.setAttribute('r', '5');
          this.hideTooltip('velocity-tooltip');
        });
        
        svg.appendChild(circle);
      });
    });
    
    // Draw X-Axis labels (Months)
    data.forEach((monthData, idx) => {
      const x = padding.left + (idx * colWidth);
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', chartHeight + padding.top + 20);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'var(--text-secondary)');
      label.setAttribute('font-size', '10');
      label.setAttribute('font-weight', '500');
      label.textContent = monthData.month;
      svg.appendChild(label);
    });
    
    this.velocityChartContainer.appendChild(svg);
  }

  showTooltip(id, event, content) {
    const tooltip = document.getElementById(id);
    if (!tooltip) return;
    
    tooltip.innerHTML = content;
    tooltip.style.opacity = '1';
    tooltip.style.left = `${event.pageX + 15}px`;
    tooltip.style.top = `${event.pageY - 15}px`;
  }

  hideTooltip(id) {
    const tooltip = document.getElementById(id);
    if (tooltip) {
      tooltip.style.opacity = '0';
    }
  }
}
