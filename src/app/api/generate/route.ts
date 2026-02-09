import { NextRequest, NextResponse } from 'next/server';
import { generateBriefing, isGenerating } from '@/lib/generator/pipeline';
import { getBriefingByDate } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    const today = new Date().toISOString().split('T')[0];

    // Check if generation is already in progress
    if (isGenerating()) {
      return NextResponse.json(
        { error: 'Generation already in progress', status: 'generating' },
        { status: 429 }
      );
    }

    // Check if today's briefing already exists (unless force)
    if (!force) {
      const existing = getBriefingByDate(today);
      if (existing && existing.status === 'completed') {
        return NextResponse.json(
          { message: 'Briefing for today already exists', briefing: existing, status: 'exists' },
          { status: 409 }
        );
      }
    }

    // Trigger generation (run async, don't block the response)
    const result = await generateBriefing(today);

    if (result.success) {
      const briefing = getBriefingByDate(today);
      return NextResponse.json({ message: 'Briefing generated successfully', briefing, status: 'completed' });
    } else {
      return NextResponse.json(
        { error: result.error, status: 'failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', status: 'error' },
      { status: 500 }
    );
  }
}
