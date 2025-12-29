import { Job } from 'pg-boss';

export function registerNotify(boss: any) {
  boss.work('task.action.notify', async (job: Job) => {
    const { message, recipients } = job.data || {};
    console.log('[worker] notify job received', { message, recipients });

    // Placeholder: send notifications (email/webhook/ui-notify)
    // For MVP, we just log and optionally write an AuditEvent via API

    await new Promise((r) => setTimeout(r, 200));

    console.log(`[worker] notified: ${message}`);
    return { ok: true };
  });
}
