const SKILL_VOCABULARY = [
  { name: "Node.js", aliases: ["node.js", "nodejs", "node"] },
  { name: "React", aliases: ["react", "react.js", "reactjs"] },
  { name: "MongoDB", aliases: ["mongodb", "mongo"] },
  { name: "REST API", aliases: ["rest api", "rest APIs", "restful api", "restful APIs", "rest"] },
  { name: "Machine Learning", aliases: ["machine learning", "machine-learning", "ml"] },
  { name: "Object-Oriented Programming", aliases: ["object oriented programming", "object-oriented programming", "oop", "oops"] },
  { name: "Data Structures", aliases: ["data structures", "data structure"] },
  { name: "Deep Learning", aliases: ["deep learning", "deep-learning"] },
  { name: "Computer Vision", aliases: ["computer vision", "computer-vision"] },
  { name: "Database Management", aliases: ["database management", "database-management"] },
  { name: "Software Development Life Cycle", aliases: ["software development life cycle", "software-development life-cycle", "sdlc"] },
  { name: "Continuous Integration", aliases: ["continuous integration", "ci"] },
  { name: "Continuous Deployment", aliases: ["continuous deployment", "continuous delivery", "cd"] },
  { name: "Natural Language Processing", aliases: ["natural language processing", "nlp"] },
  { name: "JavaScript", aliases: ["javascript", "ecmascript"] },
  { name: "TypeScript", aliases: ["typescript"] },
  { name: "Python", aliases: ["python"] },
  { name: "Java", aliases: ["java"] },
  { name: "C++", aliases: ["c++", "cpp"] },
  { name: "C#", aliases: ["c#", "csharp"] },
  { name: ".NET", aliases: [".net", "dotnet", "asp.net"] },
  { name: "Angular", aliases: ["angular", "angularjs"] },
  { name: "Vue.js", aliases: ["vue", "vue.js", "vuejs"] },
  { name: "Next.js", aliases: ["next", "next.js", "nextjs"] },
  { name: "Express.js", aliases: ["express", "express.js", "expressjs"] },
  { name: "HTML", aliases: ["html", "html5"] },
  { name: "CSS", aliases: ["css", "css3"] },
  { name: "SQL", aliases: ["sql"] },
  { name: "PostgreSQL", aliases: ["postgresql", "postgres"] },
  { name: "MySQL", aliases: ["mysql"] },
  { name: "Redis", aliases: ["redis"] },
  { name: "GraphQL", aliases: ["graphql"] },
  { name: "Git", aliases: ["git"] },
  { name: "Docker", aliases: ["docker"] },
  { name: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { name: "AWS", aliases: ["aws", "amazon web services"] },
  { name: "Azure", aliases: ["azure", "microsoft azure"] },
  { name: "Google Cloud Platform", aliases: ["google cloud platform", "google cloud", "gcp"] },
  { name: "Testing", aliases: ["testing", "unit testing", "integration testing"] },
  { name: "Agile", aliases: ["agile", "scrum"] },
  { name: "Linux", aliases: ["linux"] },
  { name: "Kafka", aliases: ["kafka", "apache kafka"] },
  { name: "Data Analysis", aliases: ["data analysis", "data analytics"] },
  { name: "Data Science", aliases: ["data science"] },
  { name: "Spring Boot", aliases: ["spring boot", "springboot"] },
  { name: "Hibernate", aliases: ["hibernate"] },
  { name: "Maven", aliases: ["maven", "apache maven"] },
  { name: "Django", aliases: ["django"] },
  { name: "Flask", aliases: ["flask"] },
  { name: "FastAPI", aliases: ["fastapi", "fast api"] },
  { name: "NumPy", aliases: ["numpy"] },
  { name: "Pandas", aliases: ["pandas"] },
];

const RELEVANT_KEYWORD_VOCABULARY = [
  { name: "Frontend Development", aliases: ["frontend development", "front-end development", "frontend developer", "frontend"] },
  { name: "Backend Development", aliases: ["backend development", "back-end development", "backend developer", "backend"] },
  { name: "Full-Stack Development", aliases: ["full stack development", "full-stack development", "fullstack development", "full stack developer"] },
  { name: "Responsive Web Development", aliases: ["responsive web development", "responsive development", "responsive design", "responsive"] },
  { name: "Interactive Web Applications", aliases: ["interactive web applications", "interactive applications", "interactive interfaces"] },
  { name: "Reusable Components", aliases: ["reusable components", "component reusability"], allTerms: [["reusable", "component"], ["reusable", "components"]] },
  { name: "Scalable Architecture", aliases: ["scalable architecture", "scalable applications", "scalable frontend", "scalable backend"] },
  { name: "API Integration", aliases: ["api integration", "api integrations", "integrate rest APIs", "integrating rest APIs", "third-party api integration"] },
  { name: "Real-Time Data", aliases: ["real-time data", "real time data", "real-time applications", "real-time"] },
  { name: "Performance Optimization", aliases: ["performance optimization", "optimize performance", "application performance"] },
  { name: "Web Accessibility", aliases: ["web accessibility", "accessibility", "wcag"] },
  { name: "Cross-Browser Compatibility", aliases: ["cross-browser compatibility", "cross browser compatibility"] },
  { name: "Browser APIs", aliases: ["browser APIs", "web APIs"] },
  { name: "DOM", aliases: ["dom", "document object model"] },
  { name: "Vite", aliases: ["vite"] },
  { name: "Webpack", aliases: ["webpack"] },
  { name: "Figma", aliases: ["figma"] },
  { name: "Design-to-Code", aliases: ["convert figma designs", "design to code", "design-to-code", "functional interfaces"] },
  { name: "Debugging", aliases: ["debugging", "debug", "troubleshooting"] },
  { name: "Database Design", aliases: ["database design", "data modeling", "database modeling"] },
  { name: "Microservices", aliases: ["microservices", "microservice architecture"] },
  { name: "System Design", aliases: ["system design", "systems design"] },
  { name: "Code Review", aliases: ["code review", "peer review"] },
  { name: "Version Control Workflow", aliases: ["version control", "git workflow", "branching strategy"] },
];

const REQUIRED_MARKER = /\b(required|requirements?|must[ -]?have|mandatory|essential)\b/i;
const PREFERRED_MARKER = /\b(preferred|nice[ -]?to[ -]?have|good[ -]?to[ -]?have|bonus|plus)\b/i;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const aliasPattern = (alias) => {
  const flexibleAlias = escapeRegex(alias.toLowerCase())
    .replace(/\\ /g, "[\\s-]+")
    .replace(/\\\./g, "\\s*\\.\\s*");
  return new RegExp(`(^|[^a-z0-9+#])${flexibleAlias}(?=$|[^a-z0-9+#])`, "i");
};

const normalizeText = (text) => String(text || "")
  .toLowerCase()
  .replace(/[–—]/g, "-")
  .replace(/\s+/g, " ")
  .trim();

const matchesVocabularyEntry = (normalizedText, entry) =>
  entry.aliases.some((alias) => aliasPattern(alias).test(normalizedText)) ||
  (entry.allTerms || []).some((terms) => terms.every((term) => aliasPattern(term).test(normalizedText)));

const extractSkills = (text) => {
  const normalizedText = normalizeText(text);
  if (!normalizedText) return [];

  return SKILL_VOCABULARY
    .filter((entry) => matchesVocabularyEntry(normalizedText, entry))
    .map(({ name }) => name);
};

const extractRelevantKeywords = (text) => {
  const normalizedText = normalizeText(text);
  if (!normalizedText) return [];

  return RELEVANT_KEYWORD_VOCABULARY
    .filter((entry) => matchesVocabularyEntry(normalizedText, entry))
    .map(({ name }) => name);
};

const classifyJobSkills = (jobDescription) => {
  const allSkills = extractSkills(jobDescription);
  const required = new Set();
  const preferred = new Set();
  let activePriority = "standard";

  String(jobDescription || "").split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    const hasRequiredMarker = REQUIRED_MARKER.test(trimmedLine);
    const hasPreferredMarker = PREFERRED_MARKER.test(trimmedLine);
    if (hasRequiredMarker && !hasPreferredMarker) activePriority = "required";
    if (hasPreferredMarker && !hasRequiredMarker) activePriority = "preferred";

    const lineSkills = extractSkills(trimmedLine);
    lineSkills.forEach((skill) => {
      if (hasRequiredMarker || activePriority === "required") required.add(skill);
      else if (hasPreferredMarker || activePriority === "preferred") preferred.add(skill);
    });
  });

  required.forEach((skill) => preferred.delete(skill));
  const standard = allSkills.filter((skill) => !required.has(skill) && !preferred.has(skill));

  return {
    all: allSkills,
    required: [...required],
    preferred: [...preferred],
    standard,
  };
};

const detectResumeSections = (resumeText) => {
  const lines = String(resumeText || "").split(/\r?\n/).map((line) => line.trim().toLowerCase());
  const hasHeading = (patterns) => lines.some((line) => patterns.some((pattern) => pattern.test(line)));

  return {
    summary: hasHeading([/^summary\s*:?-?$/, /^professional summary\s*:?-?$/]),
    objective: hasHeading([/^objective\s*:?-?$/, /^career objective\s*:?-?$/]),
    skills: hasHeading([/^skills?\s*:?-?$/, /^technical skills?\s*:?-?$/, /^core competencies\s*:?-?$/]),
    experience: hasHeading([/^experience\s*:?-?$/, /^work experience\s*:?-?$/, /^professional experience\s*:?-?$/, /^employment history\s*:?-?$/, /^internships?\s*:?-?$/, /^internship experience\s*:?-?$/]),
    projects: hasHeading([/^projects?\s*:?-?$/, /^personal projects?\s*:?-?$/, /^academic projects?\s*:?-?$/]),
    education: hasHeading([/^education\s*:?-?$/, /^academic background\s*:?-?$/, /^qualifications?\s*:?-?$/]),
    certifications: hasHeading([/^certifications?\s*:?-?$/, /^licenses? and certifications?\s*:?-?$/]),
    achievements: hasHeading([/^achievements?\s*:?-?$/, /^awards?( and honors?)?\s*:?-?$/]),
  };
};

const weightedSkillScore = (jobSkills, resumeSkills) => {
  const resumeSet = new Set(resumeSkills);
  const weighted = [
    ...jobSkills.required.map((skill) => ({ skill, weight: 3 })),
    ...jobSkills.standard.map((skill) => ({ skill, weight: 2 })),
    ...jobSkills.preferred.map((skill) => ({ skill, weight: 1 })),
  ];
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return 0;
  const matchedWeight = weighted
    .filter(({ skill }) => resumeSet.has(skill))
    .reduce((sum, item) => sum + item.weight, 0);
  return Math.round((matchedWeight / totalWeight) * 40);
};

const calculateATS = (resumeText, jobDescription) => {
  const cleanResume = String(resumeText || "").trim();
  const cleanJobDescription = String(jobDescription || "").trim();
  const resumeSkills = extractSkills(cleanResume);
  const jobSkills = classifyJobSkills(cleanJobDescription);
  const resumeSkillSet = new Set(resumeSkills);
  const matchedKeywords = jobSkills.all.filter((skill) => resumeSkillSet.has(skill));
  const missingKeywords = jobSkills.all.filter((skill) => !resumeSkillSet.has(skill));
  const resumeSections = detectResumeSections(cleanResume);

  const jobKeywords = extractRelevantKeywords(cleanJobDescription);
  const resumeKeywords = new Set(extractRelevantKeywords(cleanResume));
  const matchedRelevantKeywords = jobKeywords.filter((keyword) => resumeKeywords.has(keyword));

  const skillMatch = weightedSkillScore(jobSkills, resumeSkills);
  const keywordRelevance = jobKeywords.length
    ? Math.round((matchedRelevantKeywords.length / jobKeywords.length) * 20)
    : 0;

  const lowerResume = cleanResume.toLowerCase();
  const actionEvidence = /\b(built|created|designed|implemented|improved|led|managed|optimized|delivered)\b/i.test(cleanResume);
  const yearsEvidence = /\b\d+\+?\s+years?\b/i.test(cleanResume);
  const quantifiedEvidence = /\b\d+(?:\.\d+)?%|\b\d+\+\b/.test(cleanResume);
  const experienceRelevance = Math.min(15,
    (resumeSections.experience ? 6 : 0) +
    (resumeSections.projects ? 3 : 0) +
    (actionEvidence ? 3 : 0) +
    (yearsEvidence ? 2 : 0) +
    (quantifiedEvidence ? 1 : 0)
  );

  const resumeCompleteness =
    (resumeSections.skills ? 3 : 0) +
    (resumeSections.experience ? 3 : 0) +
    (resumeSections.projects ? 2 : 0) +
    (resumeSections.education ? 2 : 0);

  const educationRequired = /\b(degree|bachelor'?s?|master'?s?|b\.?tech|m\.?tech|education|computer science)\b/i.test(cleanJobDescription);
  const educationEvidence = resumeSections.education || /\b(degree|bachelor'?s?|master'?s?|b\.?tech|m\.?tech|university|college)\b/i.test(cleanResume);
  const educationMatch = educationRequired ? (educationEvidence ? 10 : 0) : (educationEvidence ? 8 : 6);

  const certificationRequired = /\b(certification|certified|certificate|license)\b/i.test(cleanJobDescription);
  const certificationEvidence = resumeSections.certifications || /\b(certified|certification|certificate)\b/i.test(cleanResume);
  const additionalSignals = Math.min(5,
    (certificationRequired && certificationEvidence ? 3 : certificationEvidence ? 1 : 0) +
    (resumeSections.achievements ? 1 : 0) +
    (/\bgithub\b/i.test(cleanResume) ? 1 : 0) +
    (/\blinkedin\b/i.test(cleanResume) ? 1 : 0)
  );

  const rawBreakdown = {
    skillMatch,
    keywordRelevance,
    experienceRelevance,
    resumeCompleteness,
    educationMatch,
    additionalSignals,
  };
  const hasComparableContent = Boolean(cleanResume && cleanJobDescription);
  const breakdown = hasComparableContent
    ? rawBreakdown
    : Object.fromEntries(Object.keys(rawBreakdown).map((key) => [key, 0]));
  const score = Math.max(0, Math.min(100, Math.round(Object.values(breakdown).reduce((sum, value) => sum + value, 0))));

  const requiredMatched = jobSkills.required.filter((skill) => resumeSkillSet.has(skill));
  const preferredMatched = jobSkills.preferred.filter((skill) => resumeSkillSet.has(skill));
  const requiredCoverage = jobSkills.required.length ? requiredMatched.length / jobSkills.required.length : null;
  const overallCoverage = jobSkills.all.length ? matchedKeywords.length / jobSkills.all.length : 0;
  const coreSectionCount = [resumeSections.skills, resumeSections.experience, resumeSections.projects, resumeSections.education].filter(Boolean).length;

  const strengths = [];
  if (requiredCoverage !== null && requiredCoverage >= 0.8) strengths.push("Strong coverage of required technical skills.");
  else if (requiredCoverage === null && overallCoverage >= 0.75 && jobSkills.all.length) strengths.push("Strong coverage of job-related technical skills.");
  if (resumeSections.projects && actionEvidence) strengths.push("Relevant project evidence is present.");
  if (coreSectionCount >= 3) strengths.push("Resume contains most core ATS sections.");
  if (educationRequired && educationEvidence) strengths.push("The stated education requirement is supported.");
  if (certificationRequired && certificationEvidence) strengths.push("The stated certification requirement is supported.");

  const suggestions = [];
  jobSkills.required.filter((skill) => !resumeSkillSet.has(skill)).forEach((skill) => {
    suggestions.push(`Your resume has limited evidence for required skill ${skill}. Add it only if you have relevant experience.`);
  });
  jobSkills.standard.filter((skill) => !resumeSkillSet.has(skill)).forEach((skill) => {
    suggestions.push(`Consider adding evidence of ${skill} experience if applicable.`);
  });
  jobSkills.preferred.filter((skill) => !resumeSkillSet.has(skill)).forEach((skill) => {
    suggestions.push(`The role lists ${skill} as preferred. Mention it only if it reflects your experience.`);
  });
  if (!resumeSections.skills) suggestions.push("Consider adding a dedicated Skills section.");
  if (!resumeSections.experience) suggestions.push("Consider adding relevant experience or a Work Experience section.");
  if (!resumeSections.projects) suggestions.push("Consider adding a Projects section.");
  if (!resumeSections.education) suggestions.push("Consider adding an Education section.");
  if (educationRequired && !educationEvidence) suggestions.push("The job description states an education requirement; clarify relevant education if applicable.");
  if (certificationRequired && !certificationEvidence) suggestions.push("The job description mentions certification; include it only if you hold it.");
  if (!resumeSkills.length && jobSkills.all.length) suggestions.push("Technical skills were not clearly detected; make relevant skills explicit where they reflect your experience.");

  return {
    score,
    totalJobKeywords: jobSkills.all.length,
    matchedKeywordCount: matchedKeywords.length,
    matchedKeywords,
    missingKeywords,
    strengths,
    suggestions,
    breakdown,
    requiredKeywords: jobSkills.required,
    preferredKeywords: jobSkills.preferred,
    resumeSections,
    metadata: {
      standardKeywords: jobSkills.standard,
      resumeSkills,
      matchedRelevantKeywordCount: matchedRelevantKeywords.length,
      totalRelevantKeywordCount: jobKeywords.length,
      relevantKeywords: jobKeywords,
      matchedRelevantKeywords,
      requiredMatchedCount: requiredMatched.length,
      preferredMatchedCount: preferredMatched.length,
      experienceSignals: {
        experienceSection: resumeSections.experience,
        projectsSection: resumeSections.projects,
        actionEvidence,
        yearsEvidence,
        quantifiedEvidence,
      },
      additionalSignals: {
        github: /\bgithub\b/i.test(cleanResume),
        linkedin: /\blinkedin\b/i.test(cleanResume),
        certification: certificationEvidence,
        certificationRequired,
        achievements: resumeSections.achievements,
      },
      weights: {
        skillMatch: 40,
        keywordRelevance: 20,
        experienceRelevance: 15,
        resumeCompleteness: 10,
        educationMatch: 10,
        additionalSignals: 5,
      },
    },
  };
};

module.exports = calculateATS;
