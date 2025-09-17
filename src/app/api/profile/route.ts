import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import { headers } from 'next/headers';

// GET user profile
export async function GET(req: NextRequest) {
  try {
    const userId = headers().get('x-user-id');
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    let profile = await db.collection('profiles').findOne({ userId: new ObjectId(userId) });

    if (!profile) {
      // Create a default profile if it doesn't exist
      const defaultProfile = {
        userId: new ObjectId(userId),
        academicInfo: '',
        financialInfo: '',
        achievementInfo: '',
        categoryInfo: '',
      };
      const result = await db.collection('profiles').insertOne(defaultProfile);
      profile = await db.collection('profiles').findOne({ _id: result.insertedId });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Get Profile Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST (update) user profile
export async function POST(req: NextRequest) {
  try {
    const userId = headers().get('x-user-id');

    if (!userId) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    const profileData = await req.json();
    
    // Basic validation
    if (!profileData || typeof profileData !== 'object') {
        return NextResponse.json({ message: 'Invalid profile data.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const { academicInfo, financialInfo, achievementInfo, categoryInfo } = profileData;

    const result = await db.collection('profiles').updateOne(
      { userId: new ObjectId(userId) },
      { $set: { academicInfo, financialInfo, achievementInfo, categoryInfo } },
      { upsert: true } // Creates the document if it doesn't exist
    );
    
    const updatedProfile = await db.collection('profiles').findOne({ userId: new ObjectId(userId) });

    return NextResponse.json(updatedProfile, { status: 200 });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
