import { NextRequest, NextResponse } from 'next/server';
import { getBriefingByDate, getLatestBriefing, listBriefings } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const latest = searchParams.get('latest');
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get specific date's briefing
    if (date) {
      const briefing = getBriefingByDate(date);
      if (!briefing) {
        return NextResponse.json({ error: 'Briefing not found' }, { status: 404 });
      }
      return NextResponse.json(briefing);
    }

    // Get latest briefing
    if (latest === 'true') {
      const briefing = getLatestBriefing();
      if (!briefing) {
        return NextResponse.json({ error: 'No briefings found' }, { status: 404 });
      }
      return NextResponse.json(briefing);
    }

    // List all briefings (paginated)
    const briefings = listBriefings(limit, offset);
    return NextResponse.json({ briefings, limit, offset });
  } catch (error) {
    console.error('Briefings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
