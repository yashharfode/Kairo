import { execSync } from 'child_process';

const TOKEN = execSync('C:\\Users\\Yash\\.local\\bin\\lemma.exe auth print-token', { encoding: 'utf8' }).trim();
const API   = 'https://api.lemma.work';
const POD   = '019f17f5-ea31-775f-852f-2d58417aabe3';
const H     = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

// ── Helpers ───────────────────────────────────────────────────────────────────
async function q(sql) {
  const r = await fetch(`${API}/pods/${POD}/datastore/query`, { method: 'POST', headers: H, body: JSON.stringify({ query: sql }) });
  return (await r.json()).items || [];
}

// The API requires: POST /tables/{table}/records with body { data: { ...fields } }
async function create(table, data) {
  const r = await fetch(`${API}/pods/${POD}/datastore/tables/${table}/records`, {
    method: 'POST', headers: H, body: JSON.stringify({ data })
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`create ${table} failed ${r.status}: ${txt}`);
  const j = JSON.parse(txt);
  return j.data ?? j;
}

async function del(table, id) {
  const r = await fetch(`${API}/pods/${POD}/datastore/tables/${table}/records/${id}`, { method: 'DELETE', headers: H });
  if (!r.ok && r.status !== 404 && r.status !== 409) console.warn(`  ⚠ delete ${table}/${id}: ${r.status}`);
}

async function wipe(table) {
  const rows = await q(`SELECT id FROM ${table}`);
  process.stdout.write(`  Wiping ${rows.length} rows from [${table}]...`);
  await Promise.all(rows.map(r => del(table, r.id)));
  console.log(` ✓`);
}

// ── Demo Data (schema-exact) ──────────────────────────────────────────────────

const MEMORIES = [
  { summary: 'Participating in Gappy AI Hackathon on July 2nd, 2026. Building KAIRO — an AI Executive OS for students powered by Lemma + React + Firebase.', detail: 'Demo flow: Smart Inbox → auto-plan missions → Knowledge Graph → AI Chat', tags: JSON.stringify(['hackathon', 'kairo', 'ai', 'deadline']), kind: 'note', importance: 'critical' },
  { summary: 'DSA prep using Striver A-Z sheet (450 questions). Current: Arrays. Daily goal: 5 problems. Target: complete before August campus placements.', detail: 'Platform: LeetCode + GFG. Track weekly on Notion.', tags: JSON.stringify(['dsa', 'placement', 'coding', 'leetcode']), kind: 'commitment', importance: 'high' },
  { summary: 'Building CollegeConnect — a MERN stack web forum for students. Features: auth, posts, comments, real-time notifs. Deploy on Vercel + Railway.', detail: 'Stack: MongoDB, Express, React, Node.js. Styled with TailwindCSS.', tags: JSON.stringify(['mern', 'project', 'fullstack', 'nodejs', 'react']), kind: 'project_update', importance: 'high' },
  { summary: 'Internship target: SWE intern at product company for summer 2027. Shortlisted companies: Google, Microsoft, Atlassian, Razorpay. Applying via LinkedIn + referrals.', detail: 'Deadline: applications open in August. Need referrals from senior connections.', tags: JSON.stringify(['internship', 'career', 'google', 'placement']), kind: 'commitment', importance: 'critical' },
  { summary: 'End semester exams starting July 15th. Subjects: DBMS, OS, CN, TOC, Software Engineering. Need to finish GATE-level theory for OS and TOC by July 10th.', detail: 'Hall tickets available from July 10th on college portal.', tags: JSON.stringify(['exams', 'college', 'gate', 'dbms', 'os']), kind: 'fact', importance: 'high' },
  { summary: 'Resume updated with KAIRO AI project, CollegeConnect MERN app, and LeetCode 300+ badge. Need to add research paper section. Target: 1-page ATS-friendly format.', detail: "Template: Jake's Resume. Review with senior before applying.", tags: JSON.stringify(['resume', 'career', 'ats', 'job-search']), kind: 'note', importance: 'normal' },
  { summary: 'LinkedIn profile at 70% completeness. Todo: add featured section with KAIRO demo video, request 3 professor recommendations, reach 500+ connections.', detail: 'Post 2x/week: project updates, DSA tips, hackathon experience.', tags: JSON.stringify(['linkedin', 'networking', 'career', 'personal-brand']), kind: 'commitment', importance: 'normal' },
  { summary: 'AI/ML learning: completed Andrew Ng ML course. Currently studying LangChain + RAG. Next: build personal RAG chatbot on my notes using LlamaIndex.', detail: 'Resources: DeepLearning.AI short courses, Hugging Face docs, LangChain cookbook.', tags: JSON.stringify(['ai', 'ml', 'langchain', 'rag', 'learning']), kind: 'note', importance: 'high' },
  { summary: 'KAIRO hackathon demo strategy: 1) Smart Inbox processes a chat notification, 2) auto-generates mission plan, 3) shows Knowledge Graph, 4) AI Chat with KAIRO agent.', detail: 'Keep demo under 2 minutes. Focus on WOW factor, not technical depth.', tags: JSON.stringify(['hackathon', 'demo', 'strategy', 'kairo']), kind: 'decision', importance: 'critical' },
  { summary: 'College project deadlines: DBMS mini project (ER diagram + SQL) due July 5th. SE project (SRS document) due July 8th. Both submitted on portal.', detail: 'DBMS: library management system schema. SE: KAIRO SRS document.', tags: JSON.stringify(['college', 'project', 'deadline', 'dbms', 'se']), kind: 'fact', importance: 'high' },
];

const MISSIONS = [
  {
    data: { title: 'Win the Gappy AI Hackathon 2026', objective: 'Build and demo KAIRO — an AI Executive OS for students — at the Gappy AI Hackathon on July 2nd. Win first place.', status: 'draft', deadline: '2026-07-02T23:59:00Z' },
    steps: [
      { title: 'Complete KAIRO frontend — all 10 pages', description: 'Dashboard, Inbox, Mission Planner, Calendar, Tasks, Brain, Knowledge Graph, Analytics, AI Chat, Settings', step_index: 0, status: 'done', attributes: { estimated_duration: 480, priority: 'urgent' } },
      { title: 'Integrate Lemma SDK with CORS-safe Vite proxy', description: 'Connect all services to live Lemma Pod using official proxy architecture.', step_index: 1, status: 'done', attributes: { estimated_duration: 180, priority: 'urgent' } },
      { title: 'Seed pod with realistic student demo data', description: 'Clear sample data and populate with hackathon-relevant content.', step_index: 2, status: 'done', attributes: { estimated_duration: 60, priority: 'urgent' } },
      { title: 'Record 2-minute KAIRO demo video', description: 'Walk through: Smart Inbox → Mission auto-planning → Knowledge Graph → AI Chat', step_index: 3, status: 'pending', attributes: { estimated_duration: 90, priority: 'high' } },
      { title: 'Prepare pitch deck (5 slides)', description: 'Problem, Solution, Demo Screenshot, Tech Stack, Market Opportunity', step_index: 4, status: 'pending', attributes: { estimated_duration: 120, priority: 'high' } },
      { title: 'Submit to hackathon portal', description: 'Upload GitHub repo link, demo video, and project description before deadline.', step_index: 5, status: 'pending', attributes: { estimated_duration: 30, priority: 'urgent' } },
    ]
  },
  {
    data: { title: 'Crack Campus Placements — SWE Intern 2027', objective: 'Secure a Software Engineering internship at a top product company through structured DSA prep, resume polish, and LinkedIn networking.', status: 'draft', deadline: '2026-09-30T23:59:00Z' },
    steps: [
      { title: 'Complete Striver A-Z DSA Sheet — 450 problems', description: 'Daily target: 5 questions. Sections: Arrays, LinkedList, Trees, Graphs, DP, Greedy, Backtracking.', step_index: 0, status: 'in_progress', attributes: { estimated_duration: 6000, priority: 'high' } },
      { title: 'Solve 100 Medium LeetCode problems', description: 'Patterns: sliding window, two pointers, BFS/DFS, binary search, backtracking, intervals.', step_index: 1, status: 'in_progress', attributes: { estimated_duration: 3000, priority: 'high' } },
      { title: 'Polish resume to ATS-optimised 1-page format', description: "Highlight KAIRO, CollegeConnect, DSA milestones. Use Jake's Resume template.", step_index: 2, status: 'pending', attributes: { estimated_duration: 180, priority: 'medium' } },
      { title: 'Reach 500+ LinkedIn connections', description: 'Connect with SWEs, SDEs at target companies and recruiters. Post 2x/week.', step_index: 3, status: 'pending', attributes: { estimated_duration: 300, priority: 'medium' } },
      { title: 'Apply to 50 internship listings on LinkedIn + Unstop', description: 'Easy apply + custom cover letter for top 10. Track everything in Notion.', step_index: 4, status: 'pending', attributes: { estimated_duration: 240, priority: 'high' } },
    ]
  },
  {
    data: { title: 'Clear End Semester Exams — 8.5+ CGPA', objective: 'Score above 8.5 in all 5 subjects: DBMS, OS, CN, TOC, Software Engineering.', status: 'draft', deadline: '2026-07-23T23:59:00Z' },
    steps: [
      { title: 'DBMS: ER, Normalization, SQL, Transactions', description: 'Gate Smashers playlist + 50 SQL queries on HackerRank. Focus on B+ Trees.', step_index: 0, status: 'in_progress', attributes: { estimated_duration: 600, priority: 'high' } },
      { title: 'OS: Scheduling, Deadlock, Memory Management', description: 'Galvin chapters 5–9. Solve 200 MCQs from GATE PYQs. Process sync is key.', step_index: 1, status: 'pending', attributes: { estimated_duration: 600, priority: 'high' } },
      { title: 'Computer Networks: OSI, TCP/IP, Routing, Congestion', description: 'Forouzan book + Gate Smashers CN playlist. Practice subnet numericals.', step_index: 2, status: 'pending', attributes: { estimated_duration: 480, priority: 'medium' } },
      { title: 'TOC: FA, PDA, Turing Machine, Decidability', description: 'Hardest subject — 6 hrs minimum. GATE PYQs mandatory. Focus on CFL and decidability.', step_index: 3, status: 'pending', attributes: { estimated_duration: 720, priority: 'urgent' } },
      { title: 'Submit DBMS + SE college projects', description: 'DBMS: ER diagram + SQL dump. SE: SRS document for KAIRO.', step_index: 4, status: 'pending', attributes: { estimated_duration: 240, priority: 'urgent' } },
    ]
  },
];

// Allowed: person, company, project, topic, document, event, place, concept, artifact
const KNOWLEDGE_NODES = [
  { name: 'KAIRO AI OS', kind: 'project' },
  { name: 'Lemma Pod', kind: 'artifact' },
  { name: 'Gappy Hackathon', kind: 'event' },
  { name: 'DSA Preparation', kind: 'topic' },
  { name: 'Striver A-Z Sheet', kind: 'artifact' },
  { name: 'LeetCode', kind: 'concept' },
  { name: 'MERN Stack', kind: 'topic' },
  { name: 'CollegeConnect App', kind: 'project' },
  { name: 'SWE Internship 2027', kind: 'concept' },
  { name: 'LinkedIn Profile', kind: 'artifact' },
  { name: 'End Sem Exams', kind: 'event' },
  { name: 'DBMS', kind: 'topic' },
  { name: 'Operating Systems', kind: 'topic' },
  { name: 'Resume', kind: 'document' },
  { name: 'AI/ML Learning', kind: 'topic' },
  { name: 'LangChain RAG', kind: 'concept' },
];

// Allowed relations: mentioned, owns, participates_in, relates_to, references, derives_from, contradicts, supports
const EDGES = [
  [0, 2, 'participates_in'],  // KAIRO -> Hackathon
  [0, 1, 'references'],       // KAIRO -> Lemma Pod
  [3, 4, 'references'],       // DSA Prep -> Striver
  [3, 5, 'references'],       // DSA Prep -> LeetCode
  [3, 8, 'relates_to'],       // DSA Prep -> Internship
  [6, 7, 'relates_to'],       // MERN -> CollegeConnect
  [8, 9, 'relates_to'],       // Internship -> LinkedIn
  [8, 13, 'references'],      // Internship -> Resume
  [10, 11, 'mentioned'],      // Exams -> DBMS
  [10, 12, 'mentioned'],      // Exams -> OS
  [14, 15, 'relates_to'],     // AI Learning -> LangChain
  [14, 0, 'supports'],        // AI Learning -> KAIRO
];

// inbox_log source enum: manual | email | chat | voice_note | pdf | url | calendar | task | firebase_storage | api | browser_clipboard
const INBOX_LOGS = [
  { source: 'chat', title: 'Hackathon Team Check-in — KAIRO Demo Ready?', raw_body: 'Bhai aaj raat 11 baje meeting hai. KAIRO demo ready karna hai. Lemma integration done? UI polish bhi chahiye. Submission deadline kal morning 9 AM hai.', status: 'processed', received_at: new Date().toISOString() },
  { source: 'email', title: 'Internship Application — Razorpay SWE Intern', raw_body: 'Dear Candidate, Thank you for applying to the SWE Intern position at Razorpay. We will review your application within 7 business days. Online assessment link will be shared if shortlisted. Best of luck!', status: 'processed', received_at: new Date(Date.now() - 86400000).toISOString() },
  { source: 'manual', title: 'End Semester Exam Schedule Released', raw_body: 'Exam schedule: DBMS July 15, OS July 17, CN July 19, TOC July 21, SE July 23. Hall tickets available July 10th. Practical exams: July 12-14.', status: 'processed', received_at: new Date(Date.now() - 172800000).toISOString() },
  { source: 'chat', title: 'DSA Study Group — Daily LRU Cache Challenge', raw_body: "Today's challenge: Implement LRU Cache (LeetCode 146 - Hard). Deadline: midnight. Share solution in #dsa-solutions. Winner gets featured in weekly newsletter. Prize: Striver T-shirt!", status: 'received', received_at: new Date(Date.now() - 3600000).toISOString() },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🧹 Step 1: Wiping all demo/sample data...\n');
  const WIPE_ORDER = ['mission_events', 'mission_steps', 'missions', 'plans', 'inbox_log', 'knowledge_edges', 'knowledge_nodes', 'memories'];
  for (const t of WIPE_ORDER) {
    try { await wipe(t); } catch(e) { console.warn(`  ⚠ Could not wipe ${t}: ${e.message}`); }
  }

  console.log('\n🧠 Step 2: Seeding Memories...');
  for (const m of MEMORIES) {
    await create('memories', m);
    console.log(`  ✓ [${m.tags.replace(/[\[\]"]/g,'').split(',')[0]}] ${m.summary.slice(0,60)}...`);
  }

  console.log('\n🎯 Step 3: Seeding Missions + Steps...');
  for (const mission of MISSIONS) {
    const created = await create('missions', mission.data);
    const mId = created.id;
    console.log(`  ✓ Mission: "${mission.data.title}" → ${mId}`);
    for (const step of mission.steps) {
      await create('mission_steps', { ...step, mission_id: mId });
      console.log(`    → [${step.status}] ${step.title}`);
    }
  }

  console.log('\n🕸️  Step 4: Seeding Knowledge Graph...');
  const nodeIds = [];
  for (const node of KNOWLEDGE_NODES) {
    const created = await create('knowledge_nodes', node);
    nodeIds.push(created.id);
    console.log(`  ✓ Node: ${node.name} (${node.kind})`);
  }
  let edgeCount = 0;
  for (const [si, ti, rel] of EDGES) {
    if (nodeIds[si] && nodeIds[ti]) {
      await create('knowledge_edges', { source_node_id: nodeIds[si], target_node_id: nodeIds[ti], relation: rel });
      edgeCount++;
    }
  }
  console.log(`  ✓ ${edgeCount} edges created`);

  console.log('\n📥 Step 5: Seeding Inbox Logs...');
  for (const log of INBOX_LOGS) {
    await create('inbox_log', log);
    console.log(`  ✓ [${log.source}] ${log.title}`);
  }

  console.log('\n🔍 Step 6: Verification...');
  const counts = await Promise.all([
    q('SELECT COUNT(*) as c FROM memories'),
    q('SELECT COUNT(*) as c FROM missions'),
    q('SELECT COUNT(*) as c FROM mission_steps'),
    q('SELECT COUNT(*) as c FROM knowledge_nodes'),
    q('SELECT COUNT(*) as c FROM knowledge_edges'),
    q('SELECT COUNT(*) as c FROM inbox_log'),
  ]);

  const [mems, mis, steps, nodes, edges2, inbox] = counts.map(r => r[0]?.c ?? 0);
  console.log(`
  ┌─────────────────────────────────┐
  │   KAIRO Pod — Seed Results      │
  ├─────────────────────────────────┤
  │  Memories       : ${String(mems).padEnd(13)}│
  │  Missions       : ${String(mis).padEnd(13)}│
  │  Mission Steps  : ${String(steps).padEnd(13)}│
  │  Knowledge Nodes: ${String(nodes).padEnd(13)}│
  │  Knowledge Edges: ${String(edges2).padEnd(13)}│
  │  Inbox Logs     : ${String(inbox).padEnd(13)}│
  └─────────────────────────────────┘`);

  const ok = mems >= 10 && mis >= 3 && steps >= 10 && nodes >= 10 && inbox >= 4;
  if (ok) {
    console.log('\n✅ Pod seeded successfully with KAIRO demo data!\n');
  } else {
    console.error('\n❌ Seed counts look low — check logs above for errors.\n');
    process.exit(1);
  }
}

seed().catch(e => { console.error('\n❌ Seed failed:', e.message); process.exit(1); });
