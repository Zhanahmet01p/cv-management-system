const express = require('express');
const router = express.Router();

const POWER_AUTOMATE_WEBHOOK_URL = process.env.POWER_AUTOMATE_WEBHOOK_URL || '';

router.post('/ticket', async (req, res) => {
  try {
    const { reportedBy, position, link, priority, summary, adminEmails } = req.body;
    const payload = {
      reported_by: reportedBy,
      position: position,
      link: link,
      priority: priority,
      summary: summary,
      admin_emails: adminEmails,
      created_at: new Date().toISOString()
    };

    if (POWER_AUTOMATE_WEBHOOK_URL) {
      await fetch(POWER_AUTOMATE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    res.status(200).json({ success: true, message: 'Ticket processed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process support ticket' });
  }
});

module.exports = router; // <-- Вместо export default