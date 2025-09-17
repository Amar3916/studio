import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { headers } from 'next/headers';

// PUT (update) a checklist item's status
export async function PUT(req: NextRequest) {
    try {
        const userId = headers().get('x-user-id');
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
        }

        const { applicationId, checklistItemId, completed } : { applicationId: string, checklistItemId: string, completed: boolean } = await req.json();

        if (!applicationId || !checklistItemId || typeof completed !== 'boolean') {
            return NextResponse.json({ message: 'Application ID, Checklist Item ID, and completed status are required.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('applications').updateOne(
            { 
                _id: new ObjectId(applicationId), 
                userId: new ObjectId(userId),
                'checklist._id': new ObjectId(checklistItemId)
            },
            { $set: { 'checklist.$.completed': completed } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Application or checklist item not found or you do not have permission to update it.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Checklist item updated successfully.' }, { status: 200 });

    } catch (error) {
        console.error('Update Checklist Item Error:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
