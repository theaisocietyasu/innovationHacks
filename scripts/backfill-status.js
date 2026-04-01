#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const [,, MONGODB_URI, COLLECTION_NAME] = process.argv;

if (!MONGODB_URI || !COLLECTION_NAME) {
  console.error('Usage: node backfill-status.js <mongodb-uri> <collection-name>');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB.');

    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'waitlisted' } }
    );

    console.log(`Updated ${result.modifiedCount} document(s). ${result.matchedCount - result.modifiedCount} already had a status field.`);
  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
