// Time + place triggers for the auto-print Daily Road Card.
const cron = require('node-cron');

function startScheduler(config, onCard) {
  const cards = (config.schedule && config.schedule.cards) || [];
  const jobs = [];
  for (const c of cards) {
    if (!cron.validate(c.cron)) { console.warn('bad cron for', c.state, c.cron); continue; }
    jobs.push(cron.schedule(c.cron, () => {
      console.log('[scheduler] firing card for', c.state, 'at', new Date().toISOString());
      Promise.resolve(onCard(c.state)).catch(err => console.error('card error', err));
    }));
  }
  console.log('[scheduler] armed', jobs.length, 'card job(s)');
  return jobs;
}

module.exports = { startScheduler };
