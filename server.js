const fs = require('fs');
const path = require('path');

// Load environment variables from local .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS and serve static files from current directory
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

// Setup Multer memory storage (file upload in memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Mock database reference for local fallbacks
const MOCK_ROLES = {
  frontend_engineer: {
    name: "Senior Frontend Engineer",
    skills: ["JavaScript", "React", "TypeScript", "Next.js", "CSS3", "HTML5", "Git", "State Management", "Webpack", "Vite", "GraphQL", "Tailwind CSS", "Jest"]
  },
  devops_engineer: {
    name: "Cloud DevOps Specialist",
    skills: ["Git", "Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Python", "Prometheus", "Grafana", "Ansible"]
  },
  fullstack_developer: {
    name: "Full Stack Engineer (Node/React)",
    skills: ["JavaScript", "React", "Node.js", "Express.js", "MongoDB", "SQL", "Git", "REST APIs", "TypeScript", "Docker", "AWS"]
  },
  data_scientist: {
    name: "AI / Data Science Engineer",
    skills: ["Python", "SQL", "Machine Learning", "Pandas", "NumPy", "Deep Learning", "Data Visualization", "Git", "PyTorch", "TensorFlow"]
  },
  product_manager: {
    name: "Technical Product Manager",
    skills: ["Agile", "Scrum", "Product Roadmap", "SQL", "Data Analytics", "UX", "User Research", "Jira", "System Design"]
  }
};

// API Endpoint to upload and analyze PDF resume
app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded." });
    }

    const targetRoleId = req.body.targetRoleId || "frontend_engineer";
    const targetRole = MOCK_ROLES[targetRoleId] || MOCK_ROLES.frontend_engineer;

    console.log(`[Resume Scorer] Parsing PDF file: ${req.file.originalname}`);
    
    // 1. Extract text from PDF buffer
    let parsedPdf;
    try {
      parsedPdf = await pdfParse(req.file.buffer);
    } catch (pdfErr) {
      console.error("[PDF Parse Error]", pdfErr);
      return res.status(400).json({ error: "Failed to parse PDF binary content. Make sure it is a valid PDF." });
    }

    const resumeText = parsedPdf.text;
    console.log(`[Resume Scorer] Text extracted successfully. Length: ${resumeText.length} characters.`);

    // 2. Call Gemini API or use fallback
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim() !== "") {
      try {
        console.log("[Resume Scorer] Querying Gemini LLM...");
        const analysis = await queryGemini(resumeText, targetRole.name, targetRole.skills);
        return res.json(analysis);
      } catch (geminiErr) {
        console.warn("[Gemini API Error] Falling back to local NLP parser...", geminiErr.message);
      }
    } else {
      console.log("[Resume Scorer] GEMINI_API_KEY missing. Using local fallback parser...");
    }

    // 3. Fallback: Parse locally using advanced regex scanning
    const localAnalysis = generateLocalAnalysis(resumeText, targetRole);
    return res.json(localAnalysis);

  } catch (err) {
    console.error("[Server Error]", err);
    res.status(500).json({ error: "Internal server error occurred." });
  }
});

// Prompts Gemini API and returns structured JSON reports
async function queryGemini(resumeText, roleName, roleSkills) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Use gemini-1.5-flash for fast, responsive text-based analysis
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" } // enforce JSON schema output
  });

  const prompt = `
    You are an expert AI Career Advisor, Recruiter, and ATS (Applicant Tracking System) Auditor.
    You will analyze the candidate's resume (provided below) against the target role: "${roleName}".
    
    Here are the core technical/non-technical skills expected for this role:
    [${roleSkills.join(', ')}]
    
    Your goal is to perform a detailed audit of their resume and output a strictly valid JSON response.
    Do NOT warp the JSON in markdown code blocks like \`\`\`json. Return ONLY the raw JSON string.

    Evaluate these categories (scores from 0 to 100):
    1. ATS Match: Keyphrase coverage against the expected role skills.
    2. Impact Metrics: Density of numbers, percentages, financial benchmarks, or scale factors.
    3. Clarity: Structural formatting, summaries, readability, length limits.
    4. Style: Tone, grammar, use of passive vs action verbs.

    Required JSON schema:
    {
      "score": <number 0-100 overall score (average of the categories)>,
      "categories": {
        "impact": <number 0-100>,
        "clarity": <number 0-100>,
        "ats": <number 0-100>,
        "style": <number 0-100>
      },
      "skills": [<array of strings of core capabilities and technologies extracted from the candidate's resume text>],
      "issues": [
        {
          "type": "danger" | "warning" | "success",
          "category": "impact" | "ats" | "style" | "clarity",
          "title": "<short title>",
          "desc": "<detailed explanation of strength or weakness>",
          "fix": "<precise, actionable replacement or format changes to improve it>"
        }
      ]
    }

    Resume Content:
    """
    ${resumeText}
    """
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text();
  
  // Enforce parsing correctness
  return JSON.parse(rawText.trim());
}

// Highly detailed rule-based analyzer simulating LLM parsing
function generateLocalAnalysis(text, role) {
  const textLower = text.toLowerCase();
  
  // 1. Core capabilities extraction
  const extractedSkills = [];
  role.skills.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (regex.test(textLower)) {
      extractedSkills.push(skill);
    }
  });

  // Calculate ATS match score
  const atsMatchRatio = role.skills.length > 0 ? (extractedSkills.length / role.skills.length) : 0.5;
  const atsScore = Math.min(Math.round(40 + atsMatchRatio * 60), 100);

  // 2. Metrics check (Impact)
  const percentMatches = text.match(/\d+%/g) || [];
  const moneyMatches = text.match(/(₹|\$)\d+/g) || [];
  const numbersCount = (text.match(/\b\d{2,}\b/g) || []).length;
  
  let impactScore = 40;
  if (percentMatches.length > 0) impactScore += 25;
  if (moneyMatches.length > 0) impactScore += 15;
  if (numbersCount > 3) impactScore += 20;
  impactScore = Math.min(impactScore, 100);

  // 3. Verbs and style checker
  const activeVerbs = ["architected", "engineered", "designed", "optimized", "managed", "spearheaded", "developed", "led", "refactored", "migrated", "implemented"];
  let matchedVerbs = 0;
  activeVerbs.forEach(v => {
    if (textLower.includes(v)) matchedVerbs++;
  });
  const styleScore = Math.min(Math.round(50 + matchedVerbs * 6), 100);

  // 4. Clarity check
  let clarityScore = 80;
  if (text.length < 200) clarityScore -= 45; // too short to read
  if (text.length > 4000) clarityScore -= 15; // too wordy
  if (textLower.includes("responsible for") || textLower.includes("helped with")) clarityScore -= 15;

  const overallScore = Math.round((atsScore + impactScore + styleScore + clarityScore) / 4);

  // Construct issues
  const issues = [];

  // ATS Gaps
  if (atsScore < 75) {
    const missing = role.skills.filter(s => !extractedSkills.includes(s));
    issues.push({
      type: "danger",
      category: "ats",
      title: "Missing Expected Role Keywords",
      desc: `Your resume misses critical tools and platforms expected of a ${role.name}. Scanners will struggle to rank you.`,
      fix: `Incorporate key terms: [ ${missing.slice(0, 3).join(', ')} ] naturally in your descriptions.`
    });
  } else {
    issues.push({
      type: "success",
      category: "ats",
      title: "Strong ATS Alignment",
      desc: `Your text contains keyword definitions matching the targets for ${role.name}.`,
      fix: "Maintain clear context around these tools in your bullet points."
    });
  }

  // Impact Gaps
  if (impactScore < 75) {
    issues.push({
      type: "danger",
      category: "impact",
      title: "Low Metric Density",
      desc: "Few action accomplishments are quantified with business scale numbers (revenue, speeds, user volumes).",
      fix: "Quantify achievements: 'Refactored code to improve speeds' -> 'Refactored state management system, accelerating page render speed by 28%'."
    });
  } else {
    issues.push({
      type: "success",
      category: "impact",
      title: "Solid Performance Metrics",
      desc: "Excellent use of quantitative measurements to indicate scale of output.",
      fix: "No major updates needed. Ensure values reflect accurate scale."
    });
  }

  // Verbs check
  if (styleScore < 75) {
    issues.push({
      type: "warning",
      category: "style",
      title: "Passive/Weak action descriptors",
      desc: "Use of generic descriptors like 'helped', 'assisted', 'participated' which minimize your authority.",
      fix: "Swap weak tags for action verbs: 'Engineered', 'Orchestrated', or 'Refactored'."
    });
  }

  // Clarity
  if (clarityScore < 75) {
    issues.push({
      type: "warning",
      category: "clarity",
      title: "Wordy or Passive Summary Section",
      desc: "Summary contains passive templates describing duties rather than career specialization.",
      fix: "Rewrite summary into 3 lines stating your title, top framework specializations, and a metric-driven outcome."
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
    skills: extractedSkills,
    issues: issues
  };
}

// Start Server listener only when run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 [Aura Backend] Server running at http://localhost:${PORT}`);
    console.log(`📡 Static files served from current folder: ${__dirname}`);
  });
}

module.exports = app;
