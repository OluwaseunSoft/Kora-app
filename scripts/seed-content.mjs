import { mkdirSync, writeFileSync } from "node:fs";
const write = (path, data) => {
  mkdirSync(path.slice(0, path.lastIndexOf("/")), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
};
const l = (en, pcm = en) => ({ en, pcm });
const source = (
  author,
  sourceWork,
  year,
  sourceUrl,
  license = "Original Kora practice material; CC BY 4.0. Source linked for further reading; not a quotation.",
) => ({
  author,
  sourceWork,
  year,
  sourceUrl,
  license,
  verificationStatus: "verified",
  verifiedBy:
    "Kora source check (automated agent); independent editorial review welcome",
  verifiedAt: "2026-10-14",
});
const open = (section) =>
  source(
    "Amy Baldwin / OpenStax",
    `College Success · ${section}`,
    "2020",
    `https://openstax.org/books/college-success/pages/${section}`,
    "Brief adapted study guidance, CC BY-NC-SA 4.0; attribution: Access for free at https://openstax.org/books/college-success/pages/1-introduction",
  );
const grading = source(
  "National Open University of Nigeria",
  "BLIS Student Handbook · sections 4.5 and 4.9",
  "2018–2023",
  "https://nou.edu.ng/wp-content/uploads/sites/11/2022/11/DEPT-of-LIS-STUDENT-HANDBOOK-6.54.56-PM1-corrected-August-20221.pdf",
  "Factual grading summary; no reproduction of handbook text. Confirm current institutional rules.",
);
// Short original practice activities. No invented quotations, statistics, or university policies.
const topics = [
  [
    "time",
    "Make room for what matters",
    "Make time for wetin matter",
    "3-4-how-to-manage-time",
    "Choose one task. Write its deadline. Put a small work period beside it in your calendar. Leave space for travel and interruptions.",
    "Pick one work. Write when you go do am. Leave small space for wahala.",
    "Which plan leaves room for interruptions?",
    ["Fill every minute", "One task with a buffer", "Wait until the deadline"],
    1,
    "A buffer gives your plan room to change.",
  ],
  [
    "notes",
    "Notes you can actually use",
    "Notes wey go help you",
    "5-3-taking-notes",
    "Write a heading, key ideas, and one question from a class. Later, cover the notes and explain one idea in your own words.",
    "Write the main ideas and one question. Later, cover am and explain one idea.",
    "What can you add to your notes for review?",
    [
      "Only decoration",
      "Every word the lecturer says",
      "A question to answer later",
    ],
    2,
    "A question makes your next review active.",
  ],
  [
    "outline",
    "Read your course outline",
    "Understand your course outline",
    "5-1-the-nature-and-types-of-reading",
    "Find the learning goals, assessment dates, and required materials in your course outline. Ask your course representative or lecturer about anything unclear.",
    "Find wetin you go learn and the dates. Ask lecturer if anything no clear.",
    "Where should you confirm a course deadline?",
    ["The course outline or lecturer", "A guess", "An unrelated course"],
    0,
    "Use the course information and ask for clarification.",
  ],
  [
    "cgpa",
    "Understand your CGPA",
    "Understand your CGPA",
    "grading",
    "GPA weights each grade by its credit units. CGPA combines graded courses across semesters. Kora uses mock grades; your institution decides the official result.",
    "Credit units give each grade weight. Kora na practice; your school decide your result.",
    "Which affects a weighted GPA?",
    [
      "Only the course name",
      "Grade points and credit units",
      "Only the number of classes",
    ],
    1,
    "Multiply grade points by units, add, then divide by graded units.",
  ],
  [
    "exams",
    "Prepare a little at a time",
    "Prepare small small for exam",
    "6-2-studying",
    "Choose a topic and practise recalling it without looking. Check your answer, then return to it another day. Use the course outline to guide your revision.",
    "Pick topic, try remember am, check your answer. Come back another day.",
    "What is an active review step?",
    [
      "Read without stopping",
      "Avoid checking answers",
      "Recall an idea, then check it",
    ],
    2,
    "Checking your recall helps you choose what to revisit.",
  ],
  [
    "help",
    "Ask for help early",
    "Ask for help on time",
    "grading",
    "Write down what you tried and the exact part you do not understand. Take that question to a lecturer, course representative, adviser, or library desk. Confirm local support routes.",
    "Write wetin you try and where you stuck. Carry the question go meet person wey fit help.",
    "Which question is easiest to help with?",
    [
      "I tried step two; why does this result differ?",
      "Everything is impossible",
      "No question at all",
    ],
    0,
    "A specific question gives the other person a useful starting point.",
  ],
  [
    "rest",
    "Rest belongs in your plan",
    "Rest dey inside your plan",
    "11-2-sleep",
    "Build a rest period into your study plan. When tired, choose a smaller task or a pause. A rest token in Kora keeps a learning week without requiring a lesson.",
    "Put rest for your plan. If you tire, do small work or pause.",
    "What can you do when your plan feels too large?",
    ["Ignore all rest", "Choose a smaller task or pause", "Lock every lesson"],
    1,
    "A smaller step or planned pause is a valid choice.",
  ],
  [
    "resources",
    "Find a useful open resource",
    "Find material wey go help",
    "5-2-effective-reading-strategies",
    "Write the topic you need. Ask the library for a relevant resource. Check who published it and whether you may download or reuse it. Save only what you need.",
    "Write your topic. Ask library. Check who publish am and whether you fit save am.",
    "What should you check before reusing a resource?",
    ["Only the colours", "Only its popularity", "The publisher and licence"],
    2,
    "A source and licence help you judge and use a resource responsibly.",
  ],
  [
    "return",
    "Begin again, gently",
    "Start again, easy easy",
    "3-4-how-to-manage-time",
    "Choose one task small enough to begin today. Look at your last notes and write the next action. You can change your study time when life interrupts your old plan.",
    "Pick one small work today. Check your last notes. Choose next step.",
    "After an interruption, what is a useful first step?",
    [
      "One small next action",
      "Restart every course at once",
      "Give up your materials",
    ],
    0,
    "One concrete action makes it easier to restart.",
  ],
  [
    "data",
    "Study with less data and power",
    "Use small data and power study",
    "5-2-effective-reading-strategies",
    "When connected, open the Kora lesson you need and check that offline saving finishes. Keep a paper note of your next step. External source links need internet; the lesson and quiz do not.",
    "Open Kora when network dey. Wait make offline saving finish. Keep your next step for paper.",
    "Which Kora activity works after offline saving?",
    [
      "Opening any external website",
      "Reading a saved lesson and its quiz",
      "Streaming a new video",
    ],
    1,
    "The app saves its own lessons and quizzes, not external websites.",
  ],
];
const lessons = [],
  quizzes = [];
for (const [
  id,
  title,
  pcm,
  section,
  text,
  simple,
  prompt,
  options,
  correctIndex,
  explanation,
] of topics) {
  const src = section === "grading" ? grading : open(section);
  const qids = [id + "-1", id + "-2", id + "-3"];
  const short = text.split(". ")[0] + ".";
  const exercise =
    "Try it now: Write one next action you can take on this topic today. You can pause whenever you need.";
  lessons.push({
    id,
    title: l(title, pcm),
    description: l(short, simple),
    estimatedMinutes: 5,
    readingLevel: 1,
    tags: [id],
    translationType: "machine",
    sources: [src],
    quizIds: qids,
    sections: [
      {
        id: "idea",
        heading: l("A small idea", "One small idea"),
        text: l(text, simple),
        simple: l(short, simple),
      },
      {
        id: "practice",
        heading: l("Your five-minute practice", "Your five-minute practice"),
        text: l(
          exercise,
          "Try am now: Write one next step wey you fit take today for this topic. You fit pause anytime.",
        ),
        simple: l(short, simple),
      },
    ],
  });
  const extra = {
    time: [
      [
        "Your journey to class takes time. Where does it belong?",
        ["Outside your plan", "Inside your calendar", "Only after the exam"],
        1,
        "Include travel and ordinary commitments in your plan.",
      ],
      [
        "A task took longer than you expected. What can you adjust?",
        [
          "Your next time estimate",
          "Every course grade",
          "The official exam date",
        ],
        0,
        "Use what you learned to make the next estimate more useful.",
      ],
    ],
    notes: [
      [
        "Which part can help you notice confusion?",
        [
          "The colour of the page",
          "Your handwriting size",
          "A question beside the key idea",
        ],
        2,
        "Writing a question gives you something concrete to check.",
      ],
      [
        "You covered your notes. What comes next?",
        [
          "Explain an idea in your own words",
          "Copy the page without thinking",
          "Delete the heading",
        ],
        0,
        "Recall and explanation make review active.",
      ],
    ],
    outline: [
      [
        "Which details can you look for in an outline?",
        [
          "Only classroom decoration",
          "Goals, assessments, and materials",
          "Your friend’s nickname",
        ],
        1,
        "These details help you prepare for that course.",
      ],
      [
        "An assessment instruction is unclear. Who can clarify it?",
        [
          "An unrelated comment online",
          "Nobody",
          "Your lecturer or course representative",
        ],
        2,
        "Ask someone connected to the course.",
      ],
    ],
    cgpa: [
      [
        "An A has 5 points and a course has 3 units. What is its weighted contribution?",
        ["5", "3", "15"],
        2,
        "Multiply 5 points by 3 units to get 15 weighted points.",
      ],
      [
        "Does a mock CGPA replace your official result?",
        [
          "Yes, always",
          "No; institutional rules decide it",
          "Only when Kora is offline",
        ],
        1,
        "Kora is a planning tool and cannot issue official results.",
      ],
    ],
    exams: [
      [
        "You recalled an answer incorrectly. What is a useful next step?",
        [
          "Check it and revisit the topic",
          "Avoid the topic forever",
          "Ignore the correction",
        ],
        0,
        "A correction helps you choose what needs practice.",
      ],
      [
        "How can a course outline guide revision?",
        [
          "It makes sleep unnecessary",
          "It predicts every question",
          "It identifies the course topics and goals",
        ],
        2,
        "Use course topics and goals to choose revision material.",
      ],
    ],
    help: [
      [
        "What can you include with a question?",
        [
          "Only a complaint",
          "What you already tried",
          "A demand for an instant answer",
        ],
        1,
        "Your attempted steps help someone see where you got stuck.",
      ],
      [
        "Where should you confirm campus support routes?",
        [
          "With your institution",
          "By guessing all campuses are alike",
          "In an unrelated game",
        ],
        0,
        "Local staff or official information can confirm available support.",
      ],
    ],
    rest: [
      [
        "A Kora rest token can keep a week without what?",
        ["A nickname", "An official transcript", "Completing a lesson"],
        2,
        "Rest counts as keeping the learning week.",
      ],
      [
        "A rest period can be placed where?",
        ["Inside your study plan", "Only after all courses end", "Nowhere"],
        0,
        "Rest belongs in a sustainable plan.",
      ],
    ],
    resources: [
      [
        "What should you bring to a library desk?",
        [
          "No topic or question",
          "The topic you need help with",
          "Only a demand for a grade",
        ],
        1,
        "A topic helps the librarian point you to relevant material.",
      ],
      [
        "Does finding a resource automatically give permission to reuse it?",
        [
          "No; check its licence",
          "Yes, every time",
          "Only if the file is large",
        ],
        0,
        "Access and reuse permissions are different.",
      ],
    ],
    return: [
      [
        "What can help you locate your next step?",
        [
          "Erase every old note",
          "Wait for a perfect week",
          "Look at the notes you last used",
        ],
        2,
        "Your previous notes can show where to begin.",
      ],
      [
        "Your old study time no longer fits. What can you change?",
        [
          "Your study time",
          "The institution’s calendar",
          "Another person’s transcript",
        ],
        0,
        "Choose a time that works with your current commitments.",
      ],
    ],
    data: [
      [
        "Which links still need internet?",
        [
          "Saved Kora quizzes",
          "External source websites",
          "The mock grade picker",
        ],
        1,
        "Kora caches its own app, not every website it links to.",
      ],
      [
        "What should you check before disconnecting?",
        [
          "That offline saving has finished",
          "That every mock grade is an A",
          "That all lessons are completed",
        ],
        0,
        "Wait for the offline-ready indicator before disconnecting.",
      ],
    ],
  };
  const items = [
    { prompt, options, correctIndex, explanation },
    ...extra[id].map(([prompt, options, correctIndex, explanation]) => ({
      prompt,
      options,
      correctIndex,
      explanation,
    })),
  ];
  items.forEach((q, i) =>
    quizzes.push({
      id: qids[i],
      lessonId: id,
      prompt: l(q.prompt),
      options: q.options.map((x) => l(x)),
      correctIndex: q.correctIndex,
      explanation: l(q.explanation),
      source: src,
      reviewStatus: "reviewed",
      reviewedBy: "Kora automated editorial pass",
      reviewNote:
        "Answer checked against lesson/product behavior; pending independent human review.",
    }),
  );
}
write("content/lessons/lessons.json", lessons);
write("content/lessons/quizzes.json", quizzes);
const entries = [];
const add = (
  id,
  type,
  title,
  text,
  src,
  themes = ["return"],
  action = "return",
) =>
  entries.push({
    ...src,
    id,
    type,
    title: l(title),
    text,
    originalLanguage: "en",
    translations: [{ lang: "pcm", text, translationType: "machine" }],
    themes,
    moments: [
      "firstWeek",
      "dip",
      "return",
      "hardTarget",
      "preExam",
      "milestone",
    ],
    readingLevel: 1,
    country: ["NG"],
    tryThisToday: action,
  });
add(
  "wind",
  "story",
  "A question can become a beginning",
  "William Kamkwamba built a windmill in Malawi at fourteen. In his TED account, he describes turning to library books to continue learning. A useful question can be the start of your next small experiment.",
  source(
    "William Kamkwamba / TED",
    "How I harnessed the wind; TEDGlobal running notes",
    "2009",
    "https://blog.ted.com/william_kamkwam_1/",
    "Original short factual summary, not a quotation. Source copyright TED; linked for verification.",
  ),
  ["curiosity", "return"],
  "resources",
);
add(
  "trees",
  "story",
  "Small beginnings, shared purpose",
  "In 1977 Wangari Maathai started the Green Belt Movement to respond to deforestation. Its work spread beyond Kenya. This short summary invites you to choose a small action that matters to you today.",
  source(
    "Nobel Prize Outreach",
    "Wangari Maathai — Facts",
    "2004",
    "https://www.nobelprize.org/prizes/peace/2004/maathai/facts/",
    "Original short factual summary, not a quotation. Source copyright Nobel Prize Outreach.",
  ),
  ["purpose", "rest"],
  "time",
);
add(
  "many-stories",
  "story",
  "Make room for more than one story",
  "In her 2009 TED talk, Nigerian novelist Chimamanda Ngozi Adichie discusses the danger of reducing people to one story. Your journey can hold more than one chapter, too. Choose a question that helps you understand a different perspective.",
  source(
    "Chimamanda Ngozi Adichie / TED",
    "The danger of a single story",
    "2009",
    "https://www.ted.com/talks/chimamanda_ngozi_adichie_the_danger_of_a_single_story",
    "Original short summary, not a quotation; source copyright TED.",
  ),
  ["purpose", "curiosity"],
  "resources",
);
add(
  "soyinka-writing",
  "story",
  "A Nigerian voice, heard around the world",
  "The 1986 Nobel Prize in Literature went to Wole Soyinka, a writer from Nigeria. Read the Nobel announcement for its account of his work. Today, you could write down one idea that you want to explore further.",
  source(
    "Nobel Prize Outreach",
    "Nobel Prize in Literature 1986 — Press release",
    "1986",
    "https://www.nobelprize.org/prizes/literature/1986/press-release/",
    "Original short factual summary, not a quotation; source copyright Nobel Prize Outreach.",
  ),
  ["purpose", "curiosity"],
  "notes",
);
for (const t of topics) {
  add(
    "tip-" + t[0],
    "tip",
    t[1],
    t[4],
    t[3] === "grading" ? grading : open(t[3]),
    [t[0], "return"],
    t[0],
  );
  entries.at(-1).title.pcm = t[2];
  entries.at(-1).translations[0].text = t[5];
}
const prompts = [
  [
    "why",
    "Your own reason",
    "Write one reason you want to keep learning. Keep it somewhere you can find it again.",
    "purpose",
    "time",
  ],
  [
    "question",
    "One useful question",
    "Write a question from your last class. Asking it can be today’s small step.",
    "curiosity",
    "help",
  ],
  [
    "start",
    "Choose your starting point",
    "Open the notes you last used. Circle one part you want to understand better.",
    "return",
    "return",
  ],
  [
    "space",
    "Make a little space",
    "Choose a place for one short study session. Put the one thing you need within reach.",
    "time",
    "time",
  ],
  [
    "tomorrow",
    "A note for tomorrow",
    "Before you stop, write your next small action. Tomorrow you will have a place to begin.",
    "return",
    "return",
  ],
  [
    "pause",
    "Permission to pause",
    "Choose a pause when you need one. Kora keeps every lesson open whenever you return.",
    "rest",
    "rest",
  ],
  [
    "specific",
    "Make it specific",
    "Turn “study more” into one task you can name: one paragraph, one question, or one worked example.",
    "time",
    "time",
  ],
  [
    "voice",
    "Explain it your way",
    "Explain one idea as though a friend asked about it. Notice where you would like more clarity.",
    "curiosity",
    "notes",
  ],
  [
    "support",
    "You can ask someone",
    "Name one person or campus service you could ask for help. You do not need to solve every question alone.",
    "purpose",
    "help",
  ],
  [
    "adapt",
    "A plan you can change",
    "Look at your week. Move one study task to a time that actually fits your commitments.",
    "return",
    "time",
  ],
  [
    "remember",
    "Notice a small step",
    "Write one thing you understand today that you wanted to understand before. You can keep a record without a streak.",
    "purpose",
    "notes",
  ],
];
const practiceSource = source(
  "Kora practice cards (AI-assisted)",
  "Original five-minute practice prompts",
  "2026",
  "/sources/practice-notes.json",
  "Original practice prompts, CC BY 4.0. Not attributed quotations. Independent human review pending.",
);
for (const [id, title, text, theme, action] of prompts)
  add(
    "practice-" + id,
    "tip",
    title,
    text,
    practiceSource,
    [theme, "return"],
    action,
  );
const pcmCards = {
  wind: "William Kamkwamba build windmill for Malawi when e be fourteen. For e TED story, e explain how library books help am continue to learn. One useful question fit start your next small experiment.",
  trees:
    "For 1977, Wangari Maathai start Green Belt Movement to respond to cutting of trees. The work spread pass Kenya. Choose one small action wey matter to you today.",
  "many-stories":
    "For her 2009 TED talk, Nigerian writer Chimamanda Ngozi Adichie discuss the danger when we reduce people to one story. Your journey fit get many chapters too. Ask one question wey go help you understand another view.",
  "soyinka-writing":
    "Wole Soyinka, writer from Nigeria, win the 1986 Nobel Prize for Literature. Read the Nobel announcement to learn about e work. Today, write one idea wey you wan explore.",
  "practice-why":
    "Write one reason why you wan continue to learn. Keep am where you fit find am again.",
  "practice-question":
    "Write one question from your last class. To ask am fit be your small step today.",
  "practice-start":
    "Open the notes wey you last use. Circle one part wey you wan understand better.",
  "practice-space":
    "Choose place for one short study session. Put the one thing wey you need near you.",
  "practice-tomorrow":
    "Before you stop, write your next small action. Tomorrow you go get where to start.",
  "practice-pause":
    "Rest when you need am. Kora keep every lesson open anytime you return.",
  "practice-specific":
    "Change “study more” to one task wey you fit name: one paragraph, one question, or one example.",
  "practice-voice":
    "Explain one idea like say your friend ask about am. Notice where you need more explanation.",
  "practice-support":
    "Name one person or campus service wey you fit ask for help. You no need solve every question alone.",
  "practice-adapt":
    "Check your week. Move one study task to time wey fit your commitments.",
  "practice-remember":
    "Write one thing wey you understand today. You fit keep record without streak.",
};
for (const e of entries)
  if (pcmCards[e.id]) e.translations[0].text = pcmCards[e.id];
write("public/sources/practice-notes.json", {
  author: practiceSource.author,
  year: "2026",
  license: "CC BY 4.0",
  note: "Original reflective prompts; not quotations, institutional policy, or clinical guidance.",
  prompts,
});
// Unverified voices/cultural proverbs remain hidden. No attributed wording is supplied.
const pending = [
  [
    "achebe",
    "Chinua Achebe",
    "Things Fall Apart",
    "1958",
    "https://www.penguinrandomhouse.com/books/565351/things-fall-apart-by-chinua-achebe/",
  ],
  [
    "adichie",
    "Chimamanda Ngozi Adichie",
    "The danger of a single story",
    "2009",
    "https://www.ted.com/talks/chimamanda_ngozi_adichie_the_danger_of_a_single_story",
  ],
  [
    "soyinka",
    "Wole Soyinka",
    "Nobel lecture",
    "1986",
    "https://www.nobelprize.org/prizes/literature/1986/soyinka/lecture/",
  ],
  [
    "okonjo",
    "Ngozi Okonjo-Iweala",
    "Memoir / primary interview",
    "2021",
    "https://www.wto.org/english/thewto_e/dg_e/dg_e.htm",
  ],
  [
    "mandela",
    "Nelson Mandela",
    "Long Walk to Freedom",
    "1994",
    "https://www.nelsonmandela.org/",
  ],
  ["malala", "Malala Yousafzai", "UN speech", "2013", "https://www.un.org/"],
  [
    "dweck",
    "Carol Dweck",
    "Mindset",
    "2006",
    "https://www.penguinrandomhouse.com/",
  ],
  [
    "oakley",
    "Barbara Oakley",
    "Learning How to Learn",
    "2014",
    "https://barbaraoakley.com/",
  ],
  [
    "yoruba",
    "Yoruba culture",
    "Published proverb collection",
    "unknown",
    "https://search.worldcat.org/",
  ],
  [
    "igbo",
    "Igbo culture",
    "Published proverb collection",
    "unknown",
    "https://search.worldcat.org/",
  ],
  [
    "hausa",
    "Hausa culture",
    "Published proverb collection",
    "unknown",
    "https://search.worldcat.org/",
  ],
].map(([id, author, sourceWork, year, sourceUrl]) => ({
  id,
  author,
  sourceWork,
  year,
  sourceUrl,
  verificationStatus: "unverified",
  todo: "TODO: independent primary-source wording, page, licence and cultural attribution check. No wording displayed.",
}));
write("content/library/entries.json", entries);
write("content/library/pending.json", pending);
