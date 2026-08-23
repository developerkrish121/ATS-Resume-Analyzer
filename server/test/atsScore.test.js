const test = require("node:test");
const assert = require("node:assert/strict");

const calculateATS = require("../utils/atsScore");

const structuredResume = `
Summary
Software developer focused on reliable web products.
Skills
React.js, NodeJS, Mongo, RESTful APIs, C++, C#, dotnet, Docker
Experience
Built and optimized API services for 3+ years, improving latency by 30%.
Projects
Created a machine-learning application with continuous integration.
Education
Bachelor of Technology in Computer Science
Certifications
AWS Certified Developer
Achievements
Engineering award
GitHub LinkedIn
`;

const frontendJobDescription = `
Responsibilities:
- Develop responsive and interactive web applications using HTML, CSS, JavaScript/TypeScript, and React.js.
- Build reusable and scalable frontend components.
- Integrate REST APIs and real-time data.
- Optimize performance, accessibility, and cross-browser compatibility.

Requirements:
- Strong knowledge of JavaScript/TypeScript and React.js.
- Understanding of DOM, browser APIs, CSS, and frontend frameworks.
- Knowledge of Git, Vite/Webpack, and responsive web development.
- Ability to convert Figma designs into functional interfaces.
`;

const frontendResume = `
Summary
Frontend and full-stack developer building responsive web applications.
Skills
JavaScript, React.js, Node.js, Express.js, MongoDB, REST APIs, HTML, CSS, Git, Testing
Internship
Built reusable user interface components and integrated APIs for real-time applications.
Projects
Designed responsive frontend interfaces using React and Vite. Implemented debugging and API integration.
Education
Bachelor of Technology in Computer Science
Certifications
Web development certificate
GitHub LinkedIn
`;

const assertBounded = (result) => {
  assert.ok(Number.isInteger(result.score));
  assert.ok(result.score >= 0 && result.score <= 100);
};

test("normalizes Node.js aliases to one canonical skill", () => {
  const result = calculateATS("Node nodejs Node.js", "Node.js");
  assert.deepEqual(result.matchedKeywords, ["Node.js"]);
  assert.equal(result.matchedKeywordCount, 1);
});

test("normalizes React aliases to one canonical skill", () => {
  const result = calculateATS("React.js and ReactJS", "React");
  assert.deepEqual(result.matchedKeywords, ["React"]);
});

test("normalizes MongoDB aliases", () => {
  const result = calculateATS("Mongo", "MongoDB");
  assert.deepEqual(result.matchedKeywords, ["MongoDB"]);
});

test("preserves C++, C#, and .NET as distinct skills", () => {
  const result = calculateATS("C++ C# .NET", "C++ C# dotnet");
  assert.deepEqual(result.matchedKeywords, ["C++", "C#", ".NET"]);
});

test("detects multi-word and hyphenated skills canonically", () => {
  const result = calculateATS(
    "machine-learning, object-oriented programming, RESTful APIs and data structure",
    "Machine Learning, OOP, REST API, Data Structures"
  );
  assert.deepEqual(result.matchedKeywords, [
    "REST API",
    "Machine Learning",
    "Object-Oriented Programming",
    "Data Structures",
  ]);
});

test("detects focused development and data phrases", () => {
  const result = calculateATS(
    "Deep Learning Computer Vision Database Management SDLC CI CD NLP",
    "Deep Learning, Computer Vision, Database Management, Software Development Life Cycle, Continuous Integration, Continuous Deployment, Natural Language Processing"
  );
  assert.equal(result.missingKeywords.length, 0);
  assert.equal(result.matchedKeywordCount, 7);
});

test("filters generic job-description filler from skill output", () => {
  const result = calculateATS(
    "JavaScript developer",
    "We are looking for a strong candidate with good ability to work with a team using JavaScript."
  );
  assert.deepEqual(result.matchedKeywords, ["JavaScript"]);
  assert.equal(result.totalJobKeywords, 1);
});

test("detects required and preferred skill sections", () => {
  const result = calculateATS(
    "React and AWS",
    "Required:\nReact\nNode.js\nMongoDB\nPreferred:\nDocker\nAWS"
  );
  assert.deepEqual(result.requiredKeywords, ["React", "Node.js", "MongoDB"]);
  assert.deepEqual(result.preferredKeywords, ["Docker", "AWS"]);
});

test("detects inline required and preferred phrasing", () => {
  const result = calculateATS(
    "React Docker",
    "Must have React and Node.js.\nNice to have Docker and AWS."
  );
  assert.deepEqual(result.requiredKeywords, ["Node.js", "React"]);
  assert.deepEqual(result.preferredKeywords, ["Docker", "AWS"]);
});

test("uses standard priority when the JD provides no priority evidence", () => {
  const result = calculateATS("React", "React Node.js Docker");
  assert.deepEqual(result.requiredKeywords, []);
  assert.deepEqual(result.preferredKeywords, []);
  assert.deepEqual(result.metadata.standardKeywords, ["Node.js", "React", "Docker"]);
});

test("detects common resume sections", () => {
  const result = calculateATS(structuredResume, "React");
  assert.deepEqual(result.resumeSections, {
    summary: true,
    objective: false,
    skills: true,
    experience: true,
    projects: true,
    education: true,
    certifications: true,
    achievements: true,
  });
});

test("matches canonical aliases and reports actual gaps", () => {
  const result = calculateATS("React.js and Mongo", "ReactJS MongoDB Docker");
  assert.deepEqual(result.matchedKeywords, ["React", "MongoDB"]);
  assert.deepEqual(result.missingKeywords, ["Docker"]);
});

test("returns a transparent breakdown whose weights total 100", () => {
  const result = calculateATS(structuredResume, "Required:\nReact\nNode.js\nPreferred:\nDocker");
  assert.equal(Object.values(result.metadata.weights).reduce((sum, value) => sum + value, 0), 100);
  assert.equal(Object.values(result.breakdown).reduce((sum, value) => sum + value, 0), result.score);
  assert.deepEqual(Object.keys(result.breakdown), [
    "skillMatch",
    "keywordRelevance",
    "experienceRelevance",
    "resumeCompleteness",
    "educationMatch",
    "additionalSignals",
  ]);
});

test("required skills have greater scoring impact than preferred skills", () => {
  const job = "Required:\nReact\nPreferred:\nDocker";
  const requiredMatch = calculateATS("React", job);
  const preferredMatch = calculateATS("Docker", job);
  assert.ok(requiredMatch.breakdown.skillMatch > preferredMatch.breakdown.skillMatch);
  assert.ok(requiredMatch.score > preferredMatch.score);
});

test("missing a preferred skill has a smaller impact than missing a required skill", () => {
  const job = "Required:\nReact\nNode.js\nPreferred:\nDocker";
  const missingPreferred = calculateATS("React Node.js", job);
  const missingRequired = calculateATS("React Docker", job);
  assert.ok(missingPreferred.breakdown.skillMatch > missingRequired.breakdown.skillMatch);
});

test("strengths are emitted only for supported conditions", () => {
  const result = calculateATS(structuredResume, "Required:\nReact\nNode.js");
  assert.ok(result.strengths.includes("Strong coverage of required technical skills."));
  assert.ok(result.strengths.includes("Relevant project evidence is present."));
  assert.ok(result.strengths.includes("Resume contains most core ATS sections."));
});

test("suggestions distinguish required, standard, and preferred gaps", () => {
  const result = calculateATS("Skills\nReact", "Required:\nNode.js\nReact\nPython\nPreferred:\nDocker");
  assert.ok(result.suggestions.some((item) => item.includes("required skill Node.js")));
  assert.ok(result.suggestions.some((item) => item.includes("required skill Python")));
  assert.ok(result.suggestions.some((item) => item.includes("lists Docker as preferred")));
  assert.ok(result.suggestions.every((item) => !item.startsWith("Add ")));
});

test("an empty resume returns zero without throwing", () => {
  const result = calculateATS("", "Required: React");
  assert.equal(result.score, 0);
  assert.deepEqual(result.matchedKeywords, []);
  assert.deepEqual(result.missingKeywords, ["React"]);
});

test("an empty job description returns zero without throwing", () => {
  const result = calculateATS(structuredResume, "");
  assert.equal(result.score, 0);
  assert.equal(result.totalJobKeywords, 0);
});

test("a resume with no technical skills remains bounded and reports the gap", () => {
  const result = calculateATS("Experience\nManaged a team.\nEducation\nUniversity", "React Node.js");
  assertBounded(result);
  assert.equal(result.matchedKeywordCount, 0);
  assert.deepEqual(result.missingKeywords, ["Node.js", "React"]);
  assert.ok(result.suggestions.some((item) => item.includes("not clearly detected")));
});

test("scores always remain between zero and one hundred", () => {
  const cases = [
    ["", ""],
    ["React", "React"],
    [structuredResume, "Required:\nReact\nNode.js\nMongoDB\nREST API\nPreferred:\nDocker\nAWS"],
    ["Unrelated administrative text", "Required: Kubernetes C++ Machine Learning"],
  ];
  cases.forEach(([resume, job]) => assertBounded(calculateATS(resume, job)));
});

test("keeps all backward-compatible analysis fields", () => {
  const result = calculateATS("React", "React Node.js");
  [
    "score", "totalJobKeywords", "matchedKeywordCount", "matchedKeywords",
    "missingKeywords", "strengths", "suggestions",
  ].forEach((field) => assert.ok(Object.hasOwn(result, field)));
});

test("calibrates the controlled Frontend Developer JD with technical concepts", () => {
  const result = calculateATS(frontendResume, frontendJobDescription);
  assert.ok(result.matchedKeywordCount >= 6);
  assert.ok(result.metadata.relevantKeywords.includes("Responsive Web Development"));
  assert.ok(result.metadata.relevantKeywords.includes("Reusable Components"));
  assert.ok(result.metadata.relevantKeywords.includes("Web Accessibility"));
  assert.ok(result.metadata.matchedRelevantKeywords.includes("API Integration"));
  assertBounded(result);
});

test("does not include generic prose in additional relevant keywords", () => {
  const result = calculateATS(frontendResume, frontendJobDescription);
  ["develop", "build", "integrate", "optimize", "understanding", "convert", "into", "functional"].forEach((word) => {
    assert.ok(!result.metadata.relevantKeywords.includes(word));
  });
});

test("deduplicates repeated relevant concepts", () => {
  const result = calculateATS(
    "Responsive frontend development",
    "Responsive design, responsive development, and responsive web development are required."
  );
  assert.equal(result.metadata.relevantKeywords.filter((item) => item === "Responsive Web Development").length, 1);
});

test("keeps canonical skills out of the additional relevance denominator", () => {
  const result = calculateATS("React JavaScript REST API", "React.js JavaScript REST APIs");
  assert.deepEqual(result.metadata.relevantKeywords, []);
  assert.equal(result.breakdown.skillMatch, 40);
  assert.equal(result.breakdown.keywordRelevance, 0);
});

test("a strong frontend resume scores above a weak frontend resume", () => {
  const strong = calculateATS(frontendResume, frontendJobDescription);
  const weak = calculateATS("Education\nBachelor degree\nSkills\nJava", frontendJobDescription);
  assert.ok(strong.score > weak.score);
  assert.ok(strong.breakdown.keywordRelevance > weak.breakdown.keywordRelevance);
});

test("calibrates full-stack, Java, and Python developer JDs without special bonuses", () => {
  const cases = [
    ["Required:\nReact Node.js Express.js MongoDB REST API\nPreferred:\nDocker AWS\nBuild full-stack applications and API integrations.", ["React", "Node.js", "Express.js", "MongoDB", "REST API"]],
    ["Required:\nJava Spring Boot Hibernate SQL REST API Maven\nBuild backend microservices and perform database design.", ["Java", "Spring Boot", "Hibernate", "SQL", "REST API", "Maven"]],
    ["Required:\nPython Django FastAPI SQL\nPreferred:\nFlask Pandas NumPy\nBuild backend APIs and data applications.", ["Python", "Django", "FastAPI", "SQL"]],
  ];
  cases.forEach(([job, expectedSkills]) => {
    const result = calculateATS(frontendResume, job);
    expectedSkills.forEach((skill) => assert.ok(result.requiredKeywords.includes(skill)));
    assertBounded(result);
  });
});

test("an unrelated mechanical JD scores substantially below the frontend JD", () => {
  const related = calculateATS(frontendResume, frontendJobDescription);
  const unrelated = calculateATS(frontendResume, "We are hiring a Mechanical Engineer with experience in AutoCAD, SolidWorks, thermodynamics, manufacturing processes, CNC machining, and mechanical design.");
  assert.ok(related.score - unrelated.score >= 25);
});

test("a closely supported JD produces a high evidence-based score", () => {
  const result = calculateATS(frontendResume, `
Required:
JavaScript
React
Node.js
Express.js
MongoDB
REST API
HTML
CSS
Git
Testing

Build responsive frontend applications with reusable components, API integration, real-time data, Vite, and debugging.
  `);
  assert.ok(result.score >= 80);
  assert.equal(result.missingKeywords.length, 0);
  assertBounded(result);
});

test("recognizes internship and project evidence without requiring years", () => {
  const result = calculateATS(frontendResume, frontendJobDescription);
  assert.equal(result.metadata.experienceSignals.experienceSection, true);
  assert.equal(result.metadata.experienceSignals.projectsSection, true);
  assert.equal(result.metadata.experienceSignals.yearsEvidence, false);
  assert.ok(result.breakdown.experienceRelevance >= 12);
});

test("returns explicit additional-signal evidence", () => {
  const result = calculateATS(frontendResume, frontendJobDescription);
  assert.deepEqual(result.metadata.additionalSignals, {
    github: true,
    linkedin: true,
    certification: true,
    certificationRequired: false,
    achievements: false,
  });
  assert.equal(result.breakdown.additionalSignals, 3);
});

test("every component and total stay within the published maxima", () => {
  const maxima = { skillMatch: 40, keywordRelevance: 20, experienceRelevance: 15, resumeCompleteness: 10, educationMatch: 10, additionalSignals: 5 };
  [frontendJobDescription, "React Node.js", "Java Spring Boot", "Python Django", "Mechanical engineering AutoCAD"].forEach((job) => {
    const result = calculateATS(frontendResume, job);
    Object.entries(maxima).forEach(([key, maximum]) => assert.ok(result.breakdown[key] >= 0 && result.breakdown[key] <= maximum));
    assert.equal(Object.values(result.breakdown).reduce((sum, value) => sum + value, 0), result.score);
    assertBounded(result);
  });
});
