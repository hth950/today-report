import { NextResponse } from 'next/server';
import { getProfile, updateProfile } from '@/lib/db/queries';

export async function GET() {
  try {
    const profile = getProfile();
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to get profile:', error);
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Validate at least one skill or technology
    if (body.skills && body.technologies) {
      if (body.skills.length === 0 && body.technologies.length === 0) {
        return NextResponse.json(
          { error: 'At least one skill or technology is required' },
          { status: 400 }
        );
      }
    }

    const updated = updateProfile(body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
