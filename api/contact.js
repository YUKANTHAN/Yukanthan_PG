import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Missing MONGODB_URI');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, message } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    try {
        const db = (await clientPromise).db('portfolio');
        await db.collection('contacts').insertOne({
            name,
            email,
            message: message || '',
            createdAt: new Date(),
        });

        return res.status(200).json({ message: 'Thank you! Your message has been received.' });
    } catch (error) {
        console.error('Contact API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
