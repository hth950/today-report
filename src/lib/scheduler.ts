import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import { generateBriefing } from '@/lib/generator/pipeline';
import { getBriefingByDate } from '@/lib/db/queries';

let scheduledTask: ScheduledTask | null = null;

export function startScheduler(): void {
  const schedule = process.env.GENERATION_SCHEDULE || '0 7 * * *';

  if (scheduledTask) {
    console.log('[scheduler] Scheduler already running');
    return;
  }

  if (!cron.validate(schedule)) {
    console.error(`[scheduler] Invalid cron expression: ${schedule}`);
    return;
  }

  scheduledTask = cron.schedule(schedule, async () => {
    const today = new Date().toISOString().split('T')[0];
    console.log(`[scheduler] Triggered for ${today}`);

    const existing = getBriefingByDate(today);
    if (existing && existing.status === 'completed') {
      console.log(`[scheduler] Briefing for ${today} already exists, skipping`);
      return;
    }

    const result = await generateBriefing(today);
    if (result.success) {
      console.log(`[scheduler] Successfully generated briefing for ${today}`);
    } else {
      console.error(`[scheduler] Failed to generate briefing: ${result.error}`);
    }
  });

  console.log(`[scheduler] Started with schedule: ${schedule}`);

  // Catch-up: if it's past scheduled time and no briefing for today, generate now
  catchUpGeneration();
}

export function stopScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('[scheduler] Stopped');
  }
}

async function catchUpGeneration(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const existing = getBriefingByDate(today);

  if (existing && (existing.status === 'completed' || existing.status === 'generating')) {
    return; // Already done or in progress
  }

  // Check if we're past the scheduled time
  const schedule = process.env.GENERATION_SCHEDULE || '0 7 * * *';
  const parts = schedule.split(' ');
  const scheduledHour = parseInt(parts[1], 10);
  const scheduledMinute = parseInt(parts[0], 10);
  const now = new Date();

  if (now.getHours() > scheduledHour ||
      (now.getHours() === scheduledHour && now.getMinutes() >= scheduledMinute)) {
    console.log(`[scheduler] Catch-up: generating missed briefing for ${today}`);
    // Small delay to let the server fully initialize
    setTimeout(async () => {
      const result = await generateBriefing(today);
      if (result.success) {
        console.log(`[scheduler] Catch-up: successfully generated briefing for ${today}`);
      } else {
        console.error(`[scheduler] Catch-up: failed: ${result.error}`);
      }
    }, 5000);
  }
}
