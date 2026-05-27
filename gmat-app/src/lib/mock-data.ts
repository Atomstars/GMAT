import type {
  GmatSection,
  Chapter,
  StudyStats,
  ScoreDataPoint,
  DayProgress,
  DailyTime,
  TimeAnalytics,
  Question,
} from "@/types";

// ─── Full Section → Chapter → Topic → Sheet hierarchy ─────────────────────────

export const GMAT_CURRICULUM: GmatSection[] = [
  {
    id: "quantitative",
    label: "Quantitative Reasoning",
    short: "Quant",
    icon: "∑",
    color: "from-violet-500 to-purple-600",
    timedTestQuestions: 21,
    timedTestMinutes: 45,
    chapters: [
      {
        id: "algebra",
        sectionId: "quantitative",
        title: "Algebra",
        icon: "x²",
        description: "Linear equations, inequalities, functions, and systems",
        totalSheets: 6,
        topics: [
          {
            id: "linear-equations",
            chapterId: "algebra",
            title: "Linear Equations",
            description: "Single-variable and multi-variable linear equations",
            totalQuestions: 40,
            sheets: [
              { id: "le-1", topicId: "linear-equations", title: "One-Variable Equations", questionCount: 12, difficulty: "foundation", estimatedMinutes: 20 },
              { id: "le-2", topicId: "linear-equations", title: "Two-Variable Systems", questionCount: 15, difficulty: "standard", estimatedMinutes: 25 },
              { id: "le-3", topicId: "linear-equations", title: "Advanced Systems", questionCount: 13, difficulty: "advanced", estimatedMinutes: 22 },
            ],
          },
          {
            id: "inequalities",
            chapterId: "algebra",
            title: "Inequalities",
            description: "Linear, quadratic, and absolute value inequalities",
            totalQuestions: 35,
            sheets: [
              { id: "ineq-1", topicId: "inequalities", title: "Basic Inequalities", questionCount: 12, difficulty: "foundation", estimatedMinutes: 20 },
              { id: "ineq-2", topicId: "inequalities", title: "Compound Inequalities", questionCount: 12, difficulty: "standard", estimatedMinutes: 20 },
              { id: "ineq-3", topicId: "inequalities", title: "Absolute Value", questionCount: 11, difficulty: "advanced", estimatedMinutes: 18 },
            ],
          },
          {
            id: "quadratics",
            chapterId: "algebra",
            title: "Quadratic Equations",
            description: "Factoring, the quadratic formula, and applications",
            totalQuestions: 30,
            sheets: [
              { id: "q-1", topicId: "quadratics", title: "Factoring", questionCount: 10, difficulty: "standard", estimatedMinutes: 18 },
              { id: "q-2", topicId: "quadratics", title: "Quadratic Formula", questionCount: 10, difficulty: "advanced", estimatedMinutes: 18 },
              { id: "q-3", topicId: "quadratics", title: "Word Problem Applications", questionCount: 10, difficulty: "advanced", estimatedMinutes: 20 },
            ],
          },
        ],
      },
      {
        id: "arithmetic",
        sectionId: "quantitative",
        title: "Arithmetic",
        icon: "±",
        description: "Number operations, fractions, decimals, percentages",
        totalSheets: 5,
        topics: [
          {
            id: "fractions-decimals",
            chapterId: "arithmetic",
            title: "Fractions & Decimals",
            description: "Operations with fractions and decimal conversions",
            totalQuestions: 35,
            sheets: [
              { id: "fd-1", topicId: "fractions-decimals", title: "Fraction Operations", questionCount: 12, difficulty: "foundation", estimatedMinutes: 18 },
              { id: "fd-2", topicId: "fractions-decimals", title: "Decimal Conversions", questionCount: 11, difficulty: "foundation", estimatedMinutes: 16 },
              { id: "fd-3", topicId: "fractions-decimals", title: "Mixed Operations", questionCount: 12, difficulty: "standard", estimatedMinutes: 20 },
            ],
          },
          {
            id: "percentages",
            chapterId: "arithmetic",
            title: "Percentages & Ratios",
            description: "Percent change, ratios, proportions",
            totalQuestions: 40,
            sheets: [
              { id: "pct-1", topicId: "percentages", title: "Percent Basics", questionCount: 12, difficulty: "foundation", estimatedMinutes: 18 },
              { id: "pct-2", topicId: "percentages", title: "Percent Change", questionCount: 14, difficulty: "standard", estimatedMinutes: 22 },
              { id: "pct-3", topicId: "percentages", title: "Ratios & Proportions", questionCount: 14, difficulty: "standard", estimatedMinutes: 22 },
            ],
          },
        ],
      },
      {
        id: "number-properties",
        sectionId: "quantitative",
        title: "Number Properties",
        icon: "#",
        description: "Primes, divisibility, factors, multiples, remainders",
        totalSheets: 4,
        topics: [
          {
            id: "primes-divisibility",
            chapterId: "number-properties",
            title: "Primes & Divisibility",
            description: "Prime factorization, GCD, LCM, divisibility rules",
            totalQuestions: 30,
            sheets: [
              { id: "pd-1", topicId: "primes-divisibility", title: "Prime Numbers & Factorization", questionCount: 10, difficulty: "standard", estimatedMinutes: 18 },
              { id: "pd-2", topicId: "primes-divisibility", title: "GCD & LCM", questionCount: 10, difficulty: "standard", estimatedMinutes: 18 },
              { id: "pd-3", topicId: "primes-divisibility", title: "Remainders & Modular Arithmetic", questionCount: 10, difficulty: "advanced", estimatedMinutes: 20 },
            ],
          },
          {
            id: "integers-evens-odds",
            chapterId: "number-properties",
            title: "Integers, Evens & Odds",
            description: "Properties of integers, even/odd rules",
            totalQuestions: 25,
            sheets: [
              { id: "ieo-1", topicId: "integers-evens-odds", title: "Integer Properties", questionCount: 12, difficulty: "foundation", estimatedMinutes: 18 },
              { id: "ieo-2", topicId: "integers-evens-odds", title: "Even/Odd & Consecutive Integers", questionCount: 13, difficulty: "standard", estimatedMinutes: 20 },
            ],
          },
        ],
      },
      {
        id: "geometry",
        sectionId: "quantitative",
        title: "Geometry",
        icon: "△",
        description: "Lines, angles, triangles, circles, coordinate geometry",
        totalSheets: 5,
        topics: [
          {
            id: "triangles",
            chapterId: "geometry",
            title: "Triangles",
            description: "Area, perimeter, Pythagorean theorem, special triangles",
            totalQuestions: 30,
            sheets: [
              { id: "tri-1", topicId: "triangles", title: "Basic Triangle Properties", questionCount: 10, difficulty: "foundation", estimatedMinutes: 16 },
              { id: "tri-2", topicId: "triangles", title: "Pythagorean Theorem", questionCount: 10, difficulty: "standard", estimatedMinutes: 18 },
              { id: "tri-3", topicId: "triangles", title: "Special Triangles (30-60-90, 45-45-90)", questionCount: 10, difficulty: "advanced", estimatedMinutes: 20 },
            ],
          },
          {
            id: "circles-polygons",
            chapterId: "geometry",
            title: "Circles & Polygons",
            description: "Circle properties, arcs, sectors, polygons",
            totalQuestions: 25,
            sheets: [
              { id: "cp-1", topicId: "circles-polygons", title: "Circles", questionCount: 12, difficulty: "standard", estimatedMinutes: 20 },
              { id: "cp-2", topicId: "circles-polygons", title: "Polygons & Area", questionCount: 13, difficulty: "standard", estimatedMinutes: 22 },
            ],
          },
          {
            id: "coordinate-geometry",
            chapterId: "geometry",
            title: "Coordinate Geometry",
            description: "Lines in the plane, slope, distance, midpoint",
            totalQuestions: 25,
            sheets: [
              { id: "cg-1", topicId: "coordinate-geometry", title: "Slope & Lines", questionCount: 12, difficulty: "standard", estimatedMinutes: 20 },
              { id: "cg-2", topicId: "coordinate-geometry", title: "Distance & Midpoint", questionCount: 13, difficulty: "advanced", estimatedMinutes: 22 },
            ],
          },
        ],
      },
      {
        id: "word-problems",
        sectionId: "quantitative",
        title: "Word Problems",
        icon: "W",
        description: "Rate, work, mixture, statistics word problems",
        totalSheets: 5,
        topics: [
          {
            id: "rate-work",
            chapterId: "word-problems",
            title: "Rate & Work Problems",
            description: "Speed, distance, time, combined work",
            totalQuestions: 30,
            sheets: [
              { id: "rw-1", topicId: "rate-work", title: "Speed & Distance", questionCount: 10, difficulty: "standard", estimatedMinutes: 18 },
              { id: "rw-2", topicId: "rate-work", title: "Combined Work", questionCount: 10, difficulty: "advanced", estimatedMinutes: 20 },
              { id: "rw-3", topicId: "rate-work", title: "Mixed Rate Problems", questionCount: 10, difficulty: "advanced", estimatedMinutes: 20 },
            ],
          },
          {
            id: "statistics",
            chapterId: "word-problems",
            title: "Statistics",
            description: "Mean, median, mode, standard deviation",
            totalQuestions: 25,
            sheets: [
              { id: "stat-1", topicId: "statistics", title: "Mean, Median, Mode", questionCount: 12, difficulty: "standard", estimatedMinutes: 20 },
              { id: "stat-2", topicId: "statistics", title: "Standard Deviation & Range", questionCount: 13, difficulty: "advanced", estimatedMinutes: 22 },
            ],
          },
        ],
      },
      {
        id: "data-sufficiency",
        sectionId: "quantitative",
        title: "Data Sufficiency",
        icon: "DS",
        description: "GMAT-specific question format mastery",
        totalSheets: 4,
        topics: [
          {
            id: "ds-strategy",
            chapterId: "data-sufficiency",
            title: "DS Strategy & Framework",
            description: "Yes/No vs Value questions, elimination strategy",
            totalQuestions: 20,
            sheets: [
              { id: "ds-s1", topicId: "ds-strategy", title: "DS Fundamentals", questionCount: 10, difficulty: "foundation", estimatedMinutes: 18 },
              { id: "ds-s2", topicId: "ds-strategy", title: "Advanced DS Traps", questionCount: 10, difficulty: "advanced", estimatedMinutes: 20 },
            ],
          },
          {
            id: "ds-number-props",
            chapterId: "data-sufficiency",
            title: "DS with Number Properties",
            description: "Data sufficiency applied to number properties",
            totalQuestions: 25,
            sheets: [
              { id: "ds-n1", topicId: "ds-number-props", title: "Integer & Divisibility DS", questionCount: 12, difficulty: "standard", estimatedMinutes: 20 },
              { id: "ds-n2", topicId: "ds-number-props", title: "Inequality & Algebra DS", questionCount: 13, difficulty: "advanced", estimatedMinutes: 22 },
            ],
          },
        ],
      },
    ],
  },

  // ─── VERBAL ────────────────────────────────────────────────────────────────
  {
    id: "verbal",
    label: "Verbal Reasoning",
    short: "Verbal",
    icon: "V",
    color: "from-blue-500 to-cyan-500",
    timedTestQuestions: 23,
    timedTestMinutes: 45,
    chapters: [
      {
        id: "critical-reasoning",
        sectionId: "verbal",
        title: "Critical Reasoning",
        icon: "⚡",
        description: "Strengthen, weaken, assumption, inference, and more",
        totalSheets: 8,
        topics: [
          {
            id: "strengthen-weaken",
            chapterId: "critical-reasoning",
            title: "Strengthen & Weaken",
            description: "Identifying evidence that strengthens or weakens arguments",
            totalQuestions: 40,
            sheets: [
              { id: "sw-1", topicId: "strengthen-weaken", title: "Weaken Questions", questionCount: 12, difficulty: "standard", estimatedMinutes: 22 },
              { id: "sw-2", topicId: "strengthen-weaken", title: "Strengthen Questions", questionCount: 12, difficulty: "standard", estimatedMinutes: 22 },
              { id: "sw-3", topicId: "strengthen-weaken", title: "Mixed Weaken & Strengthen", questionCount: 16, difficulty: "advanced", estimatedMinutes: 28 },
            ],
          },
          {
            id: "assumption",
            chapterId: "critical-reasoning",
            title: "Assumption Questions",
            description: "Finding unstated premises that must be true",
            totalQuestions: 30,
            sheets: [
              { id: "assum-1", topicId: "assumption", title: "Assumption Basics", questionCount: 10, difficulty: "standard", estimatedMinutes: 20 },
              { id: "assum-2", topicId: "assumption", title: "Negation Test", questionCount: 10, difficulty: "advanced", estimatedMinutes: 20 },
              { id: "assum-3", topicId: "assumption", title: "Complex Arguments", questionCount: 10, difficulty: "advanced", estimatedMinutes: 22 },
            ],
          },
          {
            id: "inference",
            chapterId: "critical-reasoning",
            title: "Inference & Conclusion",
            description: "Must Be True / Most Strongly Supported",
            totalQuestions: 25,
            sheets: [
              { id: "inf-1", topicId: "inference", title: "Must Be True", questionCount: 12, difficulty: "standard", estimatedMinutes: 22 },
              { id: "inf-2", topicId: "inference", title: "Most Strongly Supported", questionCount: 13, difficulty: "advanced", estimatedMinutes: 24 },
            ],
          },
          {
            id: "boldface-paradox",
            chapterId: "critical-reasoning",
            title: "Boldface & Paradox",
            description: "Role of statements & resolving paradoxes",
            totalQuestions: 20,
            sheets: [
              { id: "bf-1", topicId: "boldface-paradox", title: "Boldface Questions", questionCount: 10, difficulty: "advanced", estimatedMinutes: 22 },
              { id: "bf-2", topicId: "boldface-paradox", title: "Resolve the Paradox", questionCount: 10, difficulty: "advanced", estimatedMinutes: 20 },
            ],
          },
        ],
      },
      {
        id: "reading-comprehension",
        sectionId: "verbal",
        title: "Reading Comprehension",
        icon: "📄",
        description: "Main idea, detail, inference, and structure questions",
        totalSheets: 6,
        topics: [
          {
            id: "rc-main-idea",
            chapterId: "reading-comprehension",
            title: "Main Idea & Primary Purpose",
            description: "Identifying central themes and author's purpose",
            totalQuestions: 25,
            sheets: [
              { id: "rc-mi-1", topicId: "rc-main-idea", title: "Main Idea — Short Passages", questionCount: 12, difficulty: "standard", estimatedMinutes: 25 },
              { id: "rc-mi-2", topicId: "rc-main-idea", title: "Primary Purpose — Long Passages", questionCount: 13, difficulty: "advanced", estimatedMinutes: 30 },
            ],
          },
          {
            id: "rc-detail",
            chapterId: "reading-comprehension",
            title: "Detail & Specific Reference",
            description: "Finding and verifying explicit information",
            totalQuestions: 25,
            sheets: [
              { id: "rc-d1", topicId: "rc-detail", title: "Detail Questions", questionCount: 12, difficulty: "standard", estimatedMinutes: 25 },
              { id: "rc-d2", topicId: "rc-detail", title: "EXCEPT & NOT Questions", questionCount: 13, difficulty: "advanced", estimatedMinutes: 28 },
            ],
          },
          {
            id: "rc-inference",
            chapterId: "reading-comprehension",
            title: "Inference & Application",
            description: "Drawing logical conclusions from passages",
            totalQuestions: 25,
            sheets: [
              { id: "rc-i1", topicId: "rc-inference", title: "Inference Questions", questionCount: 12, difficulty: "advanced", estimatedMinutes: 28 },
              { id: "rc-i2", topicId: "rc-inference", title: "Author's Tone & Attitude", questionCount: 13, difficulty: "advanced", estimatedMinutes: 28 },
            ],
          },
        ],
      },
    ],
  },

  // ─── DATA INSIGHTS ─────────────────────────────────────────────────────────
  {
    id: "data-insights",
    label: "Data Insights",
    short: "DI",
    icon: "◈",
    color: "from-emerald-500 to-teal-500",
    timedTestQuestions: 20,
    timedTestMinutes: 45,
    chapters: [
      {
        id: "multi-source-reasoning",
        sectionId: "data-insights",
        title: "Multi-Source Reasoning",
        icon: "⊞",
        description: "Synthesizing info from multiple tabs/sources",
        totalSheets: 3,
        topics: [
          {
            id: "msr-intro",
            chapterId: "multi-source-reasoning",
            title: "MSR Fundamentals",
            description: "Reading multi-tab data and answering questions",
            totalQuestions: 20,
            sheets: [
              { id: "msr-1", topicId: "msr-intro", title: "Business MSR", questionCount: 10, difficulty: "standard", estimatedMinutes: 25 },
              { id: "msr-2", topicId: "msr-intro", title: "Science & Data MSR", questionCount: 10, difficulty: "advanced", estimatedMinutes: 28 },
            ],
          },
        ],
      },
      {
        id: "table-analysis",
        sectionId: "data-insights",
        title: "Table Analysis",
        icon: "⊟",
        description: "Sorting and analyzing sortable tables",
        totalSheets: 3,
        topics: [
          {
            id: "ta-fundamentals",
            chapterId: "table-analysis",
            title: "Table Analysis Strategies",
            description: "Filtering and comparing table data efficiently",
            totalQuestions: 20,
            sheets: [
              { id: "ta-1", topicId: "ta-fundamentals", title: "Financial Tables", questionCount: 10, difficulty: "standard", estimatedMinutes: 22 },
              { id: "ta-2", topicId: "ta-fundamentals", title: "Comparison & Ranking Tables", questionCount: 10, difficulty: "advanced", estimatedMinutes: 25 },
            ],
          },
        ],
      },
      {
        id: "graphics-interpretation",
        sectionId: "data-insights",
        title: "Graphics Interpretation",
        icon: "📊",
        description: "Bar charts, line graphs, scatter plots",
        totalSheets: 3,
        topics: [
          {
            id: "gi-charts",
            chapterId: "graphics-interpretation",
            title: "Reading Charts & Graphs",
            description: "Interpreting visual data and fill-in statements",
            totalQuestions: 20,
            sheets: [
              { id: "gi-1", topicId: "gi-charts", title: "Bar & Line Charts", questionCount: 10, difficulty: "standard", estimatedMinutes: 22 },
              { id: "gi-2", topicId: "gi-charts", title: "Scatter Plots & Trends", questionCount: 10, difficulty: "advanced", estimatedMinutes: 25 },
            ],
          },
        ],
      },
      {
        id: "two-part-analysis",
        sectionId: "data-insights",
        title: "Two-Part Analysis",
        icon: "⊕",
        description: "Solving two linked answers in one question",
        totalSheets: 4,
        topics: [
          {
            id: "tpa-quant",
            chapterId: "two-part-analysis",
            title: "Quantitative Two-Part",
            description: "Math-based two-part problems",
            totalQuestions: 25,
            sheets: [
              { id: "tpa-q1", topicId: "tpa-quant", title: "Arithmetic & Algebra TPA", questionCount: 12, difficulty: "standard", estimatedMinutes: 25 },
              { id: "tpa-q2", topicId: "tpa-quant", title: "Business Math TPA", questionCount: 13, difficulty: "advanced", estimatedMinutes: 28 },
            ],
          },
          {
            id: "tpa-verbal",
            chapterId: "two-part-analysis",
            title: "Verbal Two-Part",
            description: "Reasoning-based two-part problems",
            totalQuestions: 20,
            sheets: [
              { id: "tpa-v1", topicId: "tpa-verbal", title: "Tradeoff & Reasoning TPA", questionCount: 10, difficulty: "standard", estimatedMinutes: 22 },
              { id: "tpa-v2", topicId: "tpa-verbal", title: "Advanced Verbal TPA", questionCount: 10, difficulty: "advanced", estimatedMinutes: 25 },
            ],
          },
        ],
      },
    ],
  },
];

// ─── Sample Questions ─────────────────────────────────────────────────────────

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    sectionId: "quantitative",
    chapterId: "algebra",
    topicId: "linear-equations",
    sheetId: "le-1",
    type: "problem-solving",
    difficulty: "standard",
    difficultyScore: 5,
    prompt: "If 3x + 7 = 22, what is the value of 6x − 4?",
    options: [
      { id: "A", label: "A", text: "26" },
      { id: "B", label: "B", text: "28" },
      { id: "C", label: "C", text: "30" },
      { id: "D", label: "D", text: "32" },
      { id: "E", label: "E", text: "34" },
    ],
    correctAnswer: "A",
    explanation:
      "Solve for x: 3x + 7 = 22 → 3x = 15 → x = 5. Then 6x − 4 = 30 − 4 = 26.",
    tags: ["algebra", "linear-equations"],
    estimatedTime: 120,
  },
  {
    id: "q2",
    sectionId: "quantitative",
    chapterId: "data-sufficiency",
    topicId: "ds-strategy",
    sheetId: "ds-s1",
    type: "data-sufficiency",
    difficulty: "advanced",
    difficultyScore: 7,
    prompt:
      "Is n an integer?\n\n(1) n/2 is an integer.\n(2) 2n is an integer.",
    options: [
      { id: "A", label: "A", text: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient." },
      { id: "B", label: "B", text: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient." },
      { id: "C", label: "C", text: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient." },
      { id: "D", label: "D", text: "EACH statement ALONE is sufficient." },
      { id: "E", label: "E", text: "Statements (1) and (2) TOGETHER are NOT sufficient." },
    ],
    correctAnswer: "A",
    explanation:
      "Statement (1): n/2 is an integer → n = 2k, so n is even. Sufficient.\nStatement (2): 2n is an integer → n could be 1/2. Not sufficient.\nAnswer: A.",
    tags: ["number-properties", "data-sufficiency"],
    estimatedTime: 150,
  },
  {
    id: "q3",
    sectionId: "verbal",
    chapterId: "critical-reasoning",
    topicId: "strengthen-weaken",
    sheetId: "sw-1",
    type: "critical-reasoning",
    difficulty: "standard",
    difficultyScore: 5,
    prompt:
      "A study found that students who study with background music perform better on creative tasks than those who study in silence. The researchers concluded that background music enhances creative thinking.\n\nWhich of the following, if true, most seriously weakens the researchers' conclusion?",
    options: [
      { id: "A", label: "A", text: "Students who prefer music while studying tend to self-select into creative fields." },
      { id: "B", label: "B", text: "The creative tasks used in the study were also used in previous research." },
      { id: "C", label: "C", text: "Students who score higher on creative tasks also tend to enjoy listening to music." },
      { id: "D", label: "D", text: "Background music was played at a low volume throughout the study." },
      { id: "E", label: "E", text: "The study was conducted over a period of six months." },
    ],
    correctAnswer: "C",
    explanation:
      "Option C introduces reverse causation — already-creative students prefer music. This weakens the causal claim that music causes creativity.",
    tags: ["causation", "weaken"],
    estimatedTime: 130,
  },
];

// ─── Time Analytics Mock Data ─────────────────────────────────────────────────

function generateDailyTime(): DailyTime[] {
  const days: DailyTime[] = [];
  const practiceBase = [1200, 1800, 900, 2400, 1500, 2100, 1800, 1200, 1600, 2200, 800, 1900, 2000, 1400];
  const timedBase = [0, 2700, 0, 0, 1800, 0, 0, 2700, 0, 0, 0, 1800, 0, 0];
  const mockBase = [0, 0, 0, 0, 0, 7200, 0, 0, 0, 0, 0, 0, 0, 0];
  const aiBase = [300, 120, 450, 600, 200, 400, 150, 250, 480, 100, 350, 500, 120, 280];

  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    const idx = 13 - i;
    const practiceS = practiceBase[idx];
    const timedS = timedBase[idx];
    const mockS = mockBase[idx];
    const aiS = aiBase[idx];
    days.push({
      date,
      totalSeconds: practiceS + timedS + mockS + aiS,
      byActivity: {
        practice: practiceS,
        "timed-test": timedS,
        "mock-test": mockS,
        "ai-tutor": aiS,
      },
    });
  }
  return days;
}

export const MOCK_TIME_ANALYTICS: TimeAnalytics = {
  totalAppTimeSeconds: 142320,
  todayAppTimeSeconds: 4230,
  byActivityType: {
    practice: 98400,
    "timed-test": 21600,
    "mock-test": 14400,
    "ai-tutor": 5400,
    review: 2520,
  },
  dailySessions: generateDailyTime(),
  sessionHistory: [
    { id: "s1", startTime: new Date(Date.now() - 3600000).toISOString(), endTime: new Date().toISOString(), durationSeconds: 3600, activityType: "practice" },
    { id: "s2", startTime: new Date(Date.now() - 86400000).toISOString(), endTime: new Date(Date.now() - 82800000).toISOString(), durationSeconds: 3600, activityType: "timed-test" },
  ],
  peakHours: [0, 0, 0, 0, 0, 0, 120, 480, 960, 1200, 1440, 960, 480, 360, 720, 1080, 1440, 1800, 2400, 2160, 1440, 720, 240, 60],
  avgSessionLengthSeconds: 2847,
};

// ─── Full StudyStats ──────────────────────────────────────────────────────────

export const MOCK_STATS: StudyStats = {
  totalQuestions: 347,
  correctAnswers: 263,
  accuracy: 75.8,
  totalTimeSpent: 2340,
  currentStreak: 12,
  longestStreak: 21,
  lastStudyDate: new Date().toISOString().split("T")[0],
  sectionStats: {
    quantitative: { totalQuestions: 142, correctAnswers: 109, accuracy: 76.8, averageTime: 112, estimatedScore: 79 },
    verbal: { totalQuestions: 115, correctAnswers: 84, accuracy: 73.0, averageTime: 128, estimatedScore: 76 },
    "data-insights": { totalQuestions: 90, correctAnswers: 70, accuracy: 77.8, averageTime: 145, estimatedScore: 80 },
  },
  weeklyProgress: Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const questionsAnswered = [12, 24, 8, 19, 15, 30, 22, 11, 17, 25, 6, 20, 18, 14][i];
    const minutesStudied = [32, 45, 20, 55, 38, 50, 40, 30, 35, 48, 22, 42, 44, 36][i];
    return { date: d.toISOString().split("T")[0], questionsAnswered, minutesStudied };
  }),
  scoreHistory: (() => {
    const scores = [540, 555, 570, 565, 580, 595, 590, 610, 630, 625, 640];
    return Array.from({ length: 11 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (30 - i * 3));
      return { date: d.toISOString().split("T")[0], score: scores[i] };
    });
  })(),
  timeAnalytics: MOCK_TIME_ANALYTICS,
};

export const AI_QUICK_ACTIONS = [
  { id: "explain", label: "Explain differently", icon: "💡" },
  { id: "similar", label: "Show similar", icon: "🔄" },
  { id: "wrong", label: "Why is this wrong?", icon: "❓" },
  { id: "concept", label: "Teach the concept", icon: "📖" },
  { id: "strategy", label: "Solving strategy", icon: "🎯" },
];
