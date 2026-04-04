import { MongoClient } from "mongodb";

const URI = "mongodb://localhost:27017/";
const DB_NAME = "innovation-hacks";
const TRACKS = ["Anton RX", "Google", "Amazon", "Statefarm"];
const SCHOOLS = [
  "Arizona State University", "University of Arizona", "MIT", "Stanford University",
  "Georgia Tech", "UC Berkeley", "Carnegie Mellon University", "University of Michigan",
  "Purdue University", "Texas A&M University", "University of Texas at Austin",
  "Ohio State University", "University of Washington", "UCLA", "USC",
];
const FIRST_NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn",
  "Skyler", "Dakota", "Jamie", "Reese", "Peyton", "Logan", "Drew",
  "Zoe", "Liam", "Emma", "Noah", "Olivia", "Ava", "Ethan", "Mia",
  "Mason", "Sofia", "Lucas", "Isabella", "Aiden", "Charlotte", "Jackson",
];
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson",
  "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee",
  "Patel", "Kumar", "Nguyen", "Chen", "Kim", "Wang", "Zhang", "Singh",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeTeam(index) {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const memberCount = Math.floor(Math.random() * 3) + 1; // 1–3 additional members
  const members = Array.from({ length: memberCount }, (_, i) => {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    return {
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
      discord: `${fn.toLowerCase()}${Math.floor(Math.random() * 9999)}`,
    };
  });

  const prefs = shuffle(TRACKS).slice(0, 3);

  // Spread submissions over the past 48 hours
  const submittedAt = new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000);

  return {
    teamName: `Team ${pick(["Alpha", "Beta", "Gamma", "Delta", "Sigma", "Omega", "Nova", "Apex", "Nexus", "Volt", "Flux", "Zen", "Echo", "Drift", "Spark"])} ${index + 1}`,
    leadName: `${firstName} ${lastName}`,
    leadEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@asu.edu`,
    leadDiscord: `${firstName.toLowerCase()}${index}`,
    members,
    preferences: prefs,
    assignedTrack: null,
    status: "pending",
    isLate: false,
    submittedAt,
  };
}

async function main() {
  const client = new MongoClient(URI);
  await client.connect();
  console.log("Connected to MongoDB");

  const db = client.db(DB_NAME);

  // Ensure TrackSlots exist
  const trackSlots = db.collection("trackslots");
  for (const name of TRACKS) {
    await trackSlots.updateOne(
      { name },
      { $setOnInsert: { name, maxTeams: 15, currentCount: 0 } },
      { upsert: true }
    );
  }
  console.log("TrackSlots seeded");

  // Ensure Settings singleton
  const settings = db.collection("settings");
  await settings.updateOne(
    { key: "main" },
    { $setOnInsert: { key: "main", assignmentComplete: false, tracksRevealed: false } },
    { upsert: true }
  );
  console.log("Settings seeded");

  // Insert 50 mock teams (skip if collection already has data)
  const teams = db.collection("teams");
  const existing = await teams.countDocuments();
  if (existing > 0) {
    console.log(`Teams collection already has ${existing} docs — skipping team seed.`);
    console.log("Delete the teams collection first if you want a fresh seed.");
  } else {
    const docs = Array.from({ length: 50 }, (_, i) => makeTeam(i));
    await teams.insertMany(docs);
    console.log(`Inserted 50 mock teams`);

    // Show preference distribution
    const dist = {};
    for (const t of docs) dist[t.preferences[0]] = (dist[t.preferences[0]] ?? 0) + 1;
    console.log("1st preference distribution:", dist);
  }

  await client.close();
  console.log("Done.");
}

main().catch(err => { console.error(err); process.exit(1); });
