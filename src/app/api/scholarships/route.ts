import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all scholarships
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const scholarships = await db.collection('scholarships').find({}).project({_id: 0}).toArray();

    return NextResponse.json(scholarships);
  } catch (error) {
    console.error('Get Scholarships Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
