import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { headers } from 'next/headers';
import { Application, ApplicationStatus, ChecklistItem } from '@/lib/types';
import { generateApplicationChecklist } from '@/lib/actions';

// GET all applications for a user
export async function GET(req: NextRequest) {
  try {
    const userId = headers().get('x-user-id');
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const applications = await db.collection('applications').find({ userId: new ObjectId(userId) }).toArray();

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Get Applications Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new application to track
export async function POST(req: NextRequest) {
  try {
    const userId = headers().get('x-user-id');
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    const { scholarship } = await req.json();

    if (!scholarship || !scholarship.scholarshipName) {
      return NextResponse.json({ message: 'Invalid scholarship data.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Check if application already exists
    const existingApplication = await db.collection('applications').findOne({
        userId: new ObjectId(userId),
        'scholarship.scholarshipName': scholarship.scholarshipName
    });

    if (existingApplication) {
        return NextResponse.json({ message: 'Application already tracked.' }, { status: 409 });
    }

    // Generate checklist
    const checklistResult = await generateApplicationChecklist({
      scholarshipName: scholarship.scholarshipName,
      scholarshipDescription: scholarship.description,
    });
    
    const checklist: ChecklistItem[] = checklistResult.tasks.map(task => ({
        _id: new ObjectId(),
        task: task,
        completed: false
    }));

    const newApplication: Omit<Application, '_id'> = {
      userId: new ObjectId(userId),
      scholarship: scholarship,
      status: 'Interested',
      checklist: checklist,
    };

    const result = await db.collection('applications').insertOne(newApplication);

    return NextResponse.json({ ...newApplication, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Add Application Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update) an application's status
export async function PUT(req: NextRequest) {
    try {
        const userId = headers().get('x-user-id');
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
        }

        const { applicationId, status } : { applicationId: string, status: ApplicationStatus } = await req.json();

        if (!applicationId || !status) {
            return NextResponse.json({ message: 'Application ID and status are required.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('applications').updateOne(
            { _id: new ObjectId(applicationId), userId: new ObjectId(userId) },
            { $set: { status: status } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Application not found or you do not have permission to update it.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Status updated successfully.' }, { status: 200 });

    } catch (error) {
        console.error('Update Application Error:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
