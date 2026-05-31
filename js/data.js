const AURA_DATA = {
  // Available target roles for calibration
  roles: [
    {
      id: "frontend_engineer",
      name: "Senior Frontend Engineer",
      icon: "✨",
      averageSalary: "$135,000",
      minSalary: 110000,
      maxSalary: 175000,
      growth: "+18% YoY",
      hiringVelocity: "High",
      requiredSkills: ["JavaScript", "React", "TypeScript", "Next.js", "CSS3/HTML5", "Git", "State Management", "Webpack/Vite"],
      secondarySkills: ["GraphQL", "Tailwind CSS", "Testing (Jest/Cypress)", "CI/CD", "Web Performance"],
      description: "Specializes in building robust, performant, and responsive client-side web applications using React and modern frontend paradigms."
    },
    {
      id: "devops_engineer",
      name: "Cloud DevOps Specialist",
      icon: "☁️",
      averageSalary: "$145,000",
      minSalary: 120000,
      maxSalary: 190000,
      growth: "+24% YoY",
      hiringVelocity: "Critical",
      requiredSkills: ["Git", "Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Python"],
      secondarySkills: ["Prometheus/Grafana", "Bash Scripting", "Azure", "Network Security", "Ansible"],
      description: "Bridges the gap between software development and IT operations, automating deployments, managing infrastructure as code, and securing container workloads."
    },
    {
      id: "fullstack_developer",
      name: "Full Stack Engineer (Node/React)",
      icon: "⚙️",
      averageSalary: "$130,000",
      minSalary: 100000,
      maxSalary: 165000,
      growth: "+15% YoY",
      hiringVelocity: "High",
      requiredSkills: ["JavaScript", "React", "Node.js", "Express.js", "MongoDB/SQL", "Git", "REST APIs", "TypeScript"],
      secondarySkills: ["Docker", "AWS", "Redis", "GraphQL", "Microservices"],
      description: "Develops both frontend user interfaces and backend server architecture, managing data persistence, API endpoints, and full integration cycles."
    },
    {
      id: "data_scientist",
      name: "AI / Data Science Engineer",
      icon: "📊",
      averageSalary: "$150,000",
      minSalary: 125000,
      maxSalary: 210000,
      growth: "+32% YoY",
      hiringVelocity: "Extreme",
      requiredSkills: ["Python", "SQL", "Machine Learning", "Pandas/NumPy", "Deep Learning", "Data Visualization", "Git", "Math & Stats"],
      secondarySkills: ["PyTorch/TensorFlow", "Docker", "AWS/GCP ML Ops", "Spark/Hadoop", "Scikit-Learn"],
      description: "Applies statistical modeling, regression pipelines, and deep neural networks to extract insights, automate decisions, and train AI endpoints."
    },
    {
      id: "product_manager",
      name: "Technical Product Manager",
      icon: "🗺️",
      averageSalary: "$140,000",
      minSalary: 115000,
      maxSalary: 180000,
      growth: "+12% YoY",
      hiringVelocity: "Moderate",
      requiredSkills: ["Agile/Scrum", "Product Roadmap", "SQL", "Data Analytics", "UX Fundamentals", "User Research", "Wireframing"],
      secondarySkills: ["System Design Basics", "Jira/Confluence", "A/B Testing", "Market Research", "Financial Modeling"],
      description: "Defines product roadmaps, gathers system requirements, parses telemetry, and collaborates with developers, design, and executive leadership."
    }
  ],

  // Mock Active Job Postings in Noida / Remote (Market calibration references)
  jobs: [
    {
      id: "job-1",
      title: "Senior React Developer",
      company: "Innovate AI",
      location: "Noida, India (Hybrid)",
      salary: "₹18L - ₹24L",
      matchScore: 88,
      posted: "2 days ago",
      skills: ["React", "TypeScript", "JavaScript", "Webpack/Vite", "State Management", "Git"]
    },
    {
      id: "job-2",
      title: "Cloud Infrastructure Engineer",
      company: "Zenith Systems",
      location: "Noida / Remote",
      salary: "₹22L - ₹30L",
      matchScore: 45,
      posted: "1 day ago",
      skills: ["AWS", "Docker", "Terraform", "Kubernetes", "CI/CD", "Linux"]
    },
    {
      id: "job-3",
      title: "Frontend Architect",
      company: "DecentPay Corp",
      location: "Noida, India",
      salary: "₹28L - ₹35L",
      matchScore: 75,
      posted: "3 days ago",
      skills: ["JavaScript", "React", "Next.js", "TypeScript", "GraphQL", "Web Performance"]
    },
    {
      id: "job-4",
      title: "Software Engineer (Full Stack)",
      company: "Krypton Labs",
      location: "Noida (Sector 62)",
      salary: "₹15L - ₹20L",
      matchScore: 82,
      posted: "Just now",
      skills: ["JavaScript", "React", "Node.js", "Express.js", "MongoDB/SQL", "Git"]
    },
    {
      id: "job-5",
      title: "ML Platform Engineer",
      company: "TensorFlow Global",
      location: "Remote (India)",
      salary: "₹30L - ₹45L",
      matchScore: 30,
      posted: "4 days ago",
      skills: ["Python", "Machine Learning", "PyTorch/TensorFlow", "Docker", "AWS/GCP ML Ops", "Git"]
    }
  ],

  // Market Trends Metrics
  trends: {
    growthSkills: [
      { name: "Kubernetes", growth: 42, demand: "Critical", salaryBoost: "+₹3.5L Avg" },
      { name: "TypeScript", growth: 38, demand: "High", salaryBoost: "+₹2.2L Avg" },
      { name: "Next.js", growth: 35, demand: "High", salaryBoost: "+₹1.8L Avg" },
      { name: "Terraform", growth: 31, demand: "High", salaryBoost: "+₹2.8L Avg" },
      { name: "PyTorch", growth: 48, demand: "Critical", salaryBoost: "+₹4.5L Avg" },
      { name: "GraphQL", growth: 22, demand: "Medium", salaryBoost: "+₹1.2L Avg" }
    ],
    salaryDistribution: [
      { role: "Frontend", entry: 600000, mid: 1400000, senior: 2600000 },
      { role: "DevOps", entry: 800000, mid: 1800000, senior: 3200000 },
      { role: "Full Stack", entry: 700000, mid: 1600000, senior: 2800000 },
      { role: "AI / Data", entry: 900000, mid: 2000000, senior: 3800000 },
      { role: "Product", entry: 800000, mid: 1700000, senior: 3000000 }
    ],
    hiringSpeeds: [
      { month: "Jan", frontEnd: 22, devOps: 15, aiMl: 12 },
      { month: "Feb", frontEnd: 20, devOps: 14, aiMl: 11 },
      { month: "Mar", frontEnd: 18, devOps: 13, aiMl: 9 },
      { month: "Apr", frontEnd: 21, devOps: 12, aiMl: 8 },
      { month: "May", frontEnd: 19, devOps: 11, aiMl: 7 }
    ]
  },

  // Learning Curriculums / Modules to fill Skill Gaps
  curriculums: {
    "TypeScript": {
      duration: "12 Hours",
      difficulty: "Intermediate",
      salaryImpact: "₹1.5L - ₹2.5L",
      courses: [
        { title: "TypeScript Deep Dive", provider: "Udemy", time: "6h", url: "https://www.typescriptlang.org/docs/" },
        { title: "Advanced TS Patterns", provider: "Frontend Masters", time: "4h", url: "https://github.com/basarat/typescript-book" }
      ],
      checklist: [
        "Master Interface vs Type declarations",
        "Understand Generics and type constraints",
        "Implement utility types (Partial, Omit, Pick, Record)",
        "Configure tsconfig.json for strict-mode compilation",
        "Refactor an existing JavaScript project to TypeScript"
      ]
    },
    "Next.js": {
      duration: "18 Hours",
      difficulty: "Advanced",
      salaryImpact: "₹2L - ₹3.5L",
      courses: [
        { title: "Next.js App Router Mastery", provider: "Next.js Learn", time: "8h", url: "https://nextjs.org/learn" },
        { title: "Production Ready SSR & SSG", provider: "Vercel", time: "6h", url: "https://nextjs.org/docs" }
      ],
      checklist: [
        "Learn App Router structure (layout, page, template, loading)",
        "Compare Server Components vs Client Components",
        "Implement Server Actions for form submissions",
        "Configure incremental static regeneration (ISR)",
        "Deploy and optimize static assets on Vercel"
      ]
    },
    "Docker": {
      duration: "10 Hours",
      difficulty: "Beginner-Intermediate",
      salaryImpact: "₹2.5L - ₹4L",
      courses: [
        { title: "Docker Technologies for Beginners", provider: "KodeKloud", time: "6h", url: "https://docs.docker.com/" },
        { title: "Container Architecture & Safety", provider: "Academind", time: "4h", url: "https://docs.docker.com/get-started/" }
      ],
      checklist: [
        "Write custom Dockerfiles for multi-stage node build",
        "Understand layers, caches, and image size optimization",
        "Configure Docker Compose for multi-service apps",
        "Manage bind mounts, named volumes, and local networks",
        "Implement non-root user safety rules inside containers"
      ]
    },
    "Kubernetes": {
      duration: "30 Hours",
      difficulty: "Advanced",
      salaryImpact: "₹4L - ₹6.5L",
      courses: [
        { title: "Certified Kubernetes Administrator (CKA)", provider: "KodeKloud", time: "20h", url: "https://kubernetes.io/docs/home/" },
        { title: "Kubernetes in Production Masterclass", provider: "Linux Academy", time: "10h", url: "https://kubernetes.io/docs/tutorials/" }
      ],
      checklist: [
        "Understand Pod lifecycle and ReplicaSets",
        "Write YAML configs for Deployments and Services (ClusterIP, NodePort, LoadBalancer)",
        "Manage persistent volumes (PV) and claims (PVC)",
        "Configure Ingress controllers and TLS certificates",
        "Perform zero-downtime rolling updates and rollbacks"
      ]
    },
    "AWS": {
      duration: "25 Hours",
      difficulty: "Intermediate",
      salaryImpact: "₹3L - ₹5L",
      courses: [
        { title: "AWS Solutions Architect Associate", provider: "Cantrill.io", time: "20h", url: "https://aws.amazon.com/training/" },
        { title: "Serverless Deployments (Lambda, Gateway)", provider: "A Cloud Guru", time: "5h", url: "https://aws.amazon.com/free/" }
      ],
      checklist: [
        "Configure VPCs, private subnets, security groups, and NACLs",
        "Spin up and balance EC2 instances via Auto-Scaling groups",
        "Setup IAM users, roles, policies, and AWS SSO",
        "Deploy static sites on S3 with CloudFront CDN distribution",
        "Write Serverless Lambda endpoints wired to API Gateway"
      ]
    },
    "Terraform": {
      duration: "15 Hours",
      difficulty: "Intermediate",
      salaryImpact: "₹3.5L - ₹5.5L",
      courses: [
        { title: "Terraform Associate Certification", provider: "HashiCorp Learn", time: "10h", url: "https://developer.hashicorp.com/terraform" },
        { title: "Infrastructure as Code at Scale", provider: "Zeal Vora", time: "5h", url: "https://github.com/hashicorp/terraform" }
      ],
      checklist: [
        "Master HashiCorp Configuration Language (HCL) syntax",
        "Configure remote state files using S3 backend and DynamoDB locking",
        "Create reusable infrastructure modules with inputs and outputs",
        "Run plans, apply configurations, and parse state drift issues",
        "Write resource blocks for provisioning networks, instances, and DBs"
      ]
    },
    "State Management": {
      duration: "8 Hours",
      difficulty: "Intermediate",
      salaryImpact: "₹1L - ₹1.8L",
      courses: [
        { title: "Redux Toolkit & Zustand Masterclass", provider: "TechSchool", time: "5h", url: "https://zustand.docs.pmnd.rs/" },
        { title: "React Context & Hooks deep dive", provider: "Epic React", time: "3h", url: "https://redux-toolkit.js.org/" }
      ],
      checklist: [
        "Compare global state managers (Redux, Zustand, Recoil, Context)",
        "Write slice patterns and actions using Redux Toolkit",
        "Build lightweight global states using Zustand stores",
        "Implement persistent storage sync adapters",
        "Optimize rerenders via selector functions"
      ]
    },
    "Python": {
      duration: "14 Hours",
      difficulty: "Beginner-Intermediate",
      salaryImpact: "₹1.5L - ₹2.5L",
      courses: [
        { title: "Python Bootcamps for Developers", provider: "Codecademy", time: "8h", url: "https://docs.python.org/3/" },
        { title: "Python for Data Analysis", provider: "O'Reilly", time: "6h", url: "https://realpython.com/" }
      ],
      checklist: [
        "Master lists, dicts, tuples, sets and comprehensions",
        "Understand decorators, generators, and context managers",
        "Write clean Object-Oriented code in Python",
        "Import, clean, and map tabular datasets using Pandas",
        "Implement unit tests using pytest or unittest frameworks"
      ]
    },
    "Node.js": {
      duration: "16 Hours",
      difficulty: "Intermediate",
      salaryImpact: "₹2L - ₹3L",
      courses: [
        { title: "Complete Node.js Developer Course", provider: "Andrew Mead", time: "10h", url: "https://nodejs.org/en/docs" },
        { title: "Express.js REST API Architecture", provider: "Traversy", time: "6h", url: "https://expressjs.com/" }
      ],
      checklist: [
        "Understand Event Loop, event emitters, and non-blocking I/O",
        "Manage file systems and network streams asynchronously",
        "Write RESTful web servers using Express.js middleware",
        "Implement JWT-based session and password hashing safety",
        "Connect, query, and migrate schemas on relational and NoSQL DBs"
      ]
    },
    "Machine Learning": {
      duration: "40 Hours",
      difficulty: "Advanced",
      salaryImpact: "₹4L - ₹8L",
      courses: [
        { title: "Machine Learning Specialization", provider: "Andrew Ng / Stanford", time: "25h", url: "https://www.coursera.org/specializations/machine-learning-introduction" },
        { title: "Practical ML with Scikit-Learn", provider: "Aurélien Géron", time: "15h", url: "https://scikit-learn.org/stable/" }
      ],
      checklist: [
        "Understand Supervised (Regression, Classification) vs Unsupervised learning",
        "Tune hyper-parameters and prevent over-fitting via cross-validation",
        "Build model pipelines using Scikit-Learn (Imputers, Scalers, Encoders)",
        "Master math foundations: Linear algebra, calculus, and matrix math",
        "Deploy model files as live endpoints behind REST APIs"
      ]
    }
  },

  // Mock Resume Optimizer templates
  resumeTemplates: {
    weakResume: {
      content: `Pankaj Verma
Email: pankaj@example.com | Noida, India
Web Developer

Summary:
Experienced programmer looking for a challenging role in frontend development where I can use my skills. Interested in React.

Experience:
Web Developer - Tech Corp (2024 - Present)
- Worked on the frontend using React and HTML/CSS.
- Created components and page layouts for clients.
- Solved bugs and did styling.
- Attended standups and worked with Git.

Software Assistant - App Ventures (2022 - 2024)
- Helped build website elements.
- Cleaned up javascript files.
- Talked to customers about requirements.

Skills:
HTML, CSS, JavaScript, React, Git.`,
      analysis: {
        score: 58,
        categories: {
          impact: 42,
          clarity: 65,
          ats: 50,
          style: 75
        },
        issues: [
          {
            type: "danger",
            category: "impact",
            title: "Lack of Quantifiable Metrics",
            desc: "Your experience bullet points describe duties rather than achievements. Resumes are 80% more effective when they quantify outcomes.",
            fix: "Change 'Worked on the frontend using React' to 'Engineered 15+ highly responsive React dashboards, accelerating frontend page loading speeds by 32%'."
          },
          {
            type: "danger",
            category: "ats",
            title: "Missing Industry Keywords",
            desc: "For senior roles, ATS scanners seek critical terms like 'TypeScript', 'Next.js', 'State Management', and 'Web Performance'. Your profile misses these entirely.",
            fix: "Add missing keywords matching your career goal in the skills and project sections."
          },
          {
            type: "warning",
            category: "style",
            title: "Weak Action Verbs",
            desc: "You have used passive verbs like 'Worked on', 'Helped build', and 'Attended'. These minimize your authority and impact.",
            fix: "Use strong verbs: 'Engineered React layouts...', 'Spearheaded codebase cleanups...', 'Architected UI structures...'"
          },
          {
            type: "warning",
            category: "clarity",
            title: "Vague Profile Summary",
            desc: "Your summary statement is generic and doesn't state your unique value proposition or specialization.",
            fix: "Rewrite summary: 'Frontend Engineer with 4+ years of experience specializing in building highly performant React architectures and interactive dashboard environments. Expert in TypeScript and state-driven SPA designs.'"
          }
        ]
      }
    },
    strongResume: {
      content: `Pankaj Verma
Email: pankaj@example.com | Phone: +91-9999999999 | Noida, India
Senior Frontend Engineer | React & TypeScript Specialist

Professional Summary:
Performance-driven Senior Frontend Engineer with 4+ years of experience architecting interactive SPA dashboards. Expert in React, TypeScript, and state management frameworks (Zustand, RTK). Proven track record of enhancing page performances, writing robust unit test coverage, and streamlining deployment pipelines.

Core Skills:
- Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3, SQL
- Frameworks & Libs: React, Next.js, Redux Toolkit, Zustand, Express.js
- Tools & DevOps: Git, Docker, Webpack, Vite, Jest, Cypress, CI/CD pipelines, AWS S3
- Methodologies: Agile/Scrum, Responsive Design, Web Performance Tuning

Professional Experience:
Senior Frontend Developer - Tech Corp (2024 - Present)
- Architected and deployed 15+ highly responsive React-TypeScript analytical dashboards, enhancing client page interaction rates by 35%.
- Spearheaded migration from legacy bundling to Webpack/Vite, cutting production build times by 40% and assets sizes by 120KB.
- Conducted regular code reviews, mentored 4 junior developers, and established ESLint/Prettier automation rules reducing syntax bugs by 25%.
- Implemented state persistence workflows using Zustand, cutting server roundtrip latency by 18%.

Software Engineer - App Ventures (2022 - 2024)
- Co-developed a SaaS onboarding portal, accelerating user sign-up progression speeds by 50%.
- Refactored legacy vanilla codebase into modular React functional components, boosting feature shipment speeds by 30%.
- Integrated AWS S3 image upload and cloud distribution systems, serving 100k+ global users with 99.9% uptime.

Education:
B.Tech in Computer Science - Amity University (GPA: 8.5/10) - Graduated 2022`,
      analysis: {
        score: 92,
        categories: {
          impact: 95,
          clarity: 90,
          ats: 94,
          style: 90
        },
        issues: [
          {
            type: "success",
            category: "impact",
            title: "Excellent Metric Density",
            desc: "Almost all your bullet points contain clear metrics (e.g. 35%, 40%, 120KB, 50%, 30%). This communicates strong business impact.",
            fix: "Great job. Keep these metrics current in your next review."
          },
          {
            type: "success",
            category: "ats",
            title: "Strong ATS Keyword Alignment",
            desc: "Your skills map closely to the requirements of Senior Frontend and Full Stack developer jobs. High compatibility detected.",
            fix: "Your profile is optimized. Ready to apply to target roles."
          },
          {
            type: "warning",
            category: "clarity",
            title: "Combine Similar Skill Subheadings",
            desc: "Your core skills section is clean, but separating tools into multiple small categories might distract human reviewers.",
            fix: "Consolidate 'Tools & DevOps' and 'Methodologies' into 'Tools & Frameworks' for a tighter layout."
          }
        ]
      }
    }
  },

  // Conversational prompts and mock interview scenarios
  coachDialogues: {
    welcome: "Hello Pankaj! I'm Nova, your Career Intelligence Coach. I analyze labor statistics, resumes, and active job postings to help you navigate your career path. How can I assist you today? You can ask me to perform a **Mock Technical Interview**, **review your resume**, or outline the path to a **salary increase**.",
    
    prompts: [
      { text: "🚀 Start a Mock Technical Interview", action: "start_mock_interview" },
      { text: "📄 How can I optimize my current resume?", action: "suggest_resume_help" },
      { text: "💰 What skills give the highest salary boosts?", action: "show_lucrative_skills" },
      { text: "📈 Tell me about the hiring market in Noida", action: "explain_market" }
    ],

    // Mock interview cycles by role
    mockInterviews: {
      "frontend_engineer": [
        {
          id: 1,
          question: "Can you explain the differences between React context and global state managers like Redux or Zustand? In what scenarios would you choose one over the other?",
          keywords: ["context", "redux", "zustand", "rerender", "performance", "store"],
          idealAnswer: "React Context is a dependency injection tool, not a state management system, and triggers rerenders on all consumers when value changes. Redux and Zustand use selector-based patterns to minimize rerenders, making them far better suited for high-frequency, complex global states."
        },
        {
          id: 2,
          question: "What is TypeScript's 'Record' type, and when would you use it instead of declaring an index signature like [key: string]: any?",
          keywords: ["record", "index signature", "strict", "type safety", "utility"],
          idealAnswer: "The Record utility type allows you to map keys of one type to another type with strict constraints, e.g., Record<'a'|'b', number>, whereas an index signature allows arbitrary string keys, bypassing strict compile-time checks."
        },
        {
          id: 3,
          question: "How does the Next.js App Router handle Server Components versus Client Components? How do they communicate?",
          keywords: ["server components", "client components", "rsc", "boundary", "props", "serialization"],
          idealAnswer: "Server Components render on the server, saving bundle size, and are the default in App Router. Client Components are marked with 'use client'. Communication happens by passing serializable props down from Server to Client components, or via Web APIs/Server Actions."
        }
      ],
      "devops_engineer": [
        {
          id: 1,
          question: "Describe the difference between Docker images and Docker containers. How do you optimize image size in your Dockerfiles?",
          keywords: ["image", "container", "multi-stage", "alpine", "layer", "run"],
          idealAnswer: "An image is a read-only template with instructions; a container is a running instance of an image. Size is optimized using multi-stage builds, choosing minimal base images like alpine, and chaining RUN commands to reduce cache layers."
        },
        {
          id: 2,
          question: "What is Terraform state, and why is it crucial to store it remotely with a state lock mechanism?",
          keywords: ["state", "remote backend", "s3", "dynamodb", "lock", "concurrency", "drift"],
          idealAnswer: "Terraform state maps configuration files to real resources. Remote storage ensures team collaboration, and lock mechanisms (like DynamoDB) prevent concurrent runs that would corrupt the state file."
        }
      ]
    }
  }
};
