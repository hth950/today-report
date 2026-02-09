export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[today-report] Server starting...');

    // Dynamically import to avoid issues with edge runtime
    const { startScheduler } = await import('@/lib/scheduler');
    startScheduler();
  }
}
