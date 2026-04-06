import { Router } from 'express';
import axios from 'axios';

export const jiraRouter = Router();

jiraRouter.post('/issue', async (req, res) => {
  const { ticketId, domain, summary, description } = req.body;
  const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY } = process.env;

  // Demo mode: no Jira credentials → return a realistic mock ticket
  if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    const mockKey = `CY-${1000 + Math.floor(Math.random() * 9000)}`;
    res.json({
      id: String(Date.now()),
      key: mockKey,
      url: `https://cookieyes.atlassian.net/browse/${mockKey}`,
      status: 'created',
      summary: summary || `[Banner not loading] ${domain} — Zendesk #${ticketId}`,
      created: new Date().toISOString(),
    });
    return;
  }

  try {
    const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
    const { data } = await axios.post(
      `${JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: JIRA_PROJECT_KEY || 'CY' },
          issuetype: { name: 'Bug' },
          summary: summary || `[Banner not loading] ${domain} — Zendesk #${ticketId}`,
          description: {
            type: 'doc',
            version: 1,
            content: [{ type: 'paragraph', content: [{ type: 'text', text: description || '' }] }],
          },
          labels: ['banner', 'customer-reported', 'cx-escalation'],
        },
      },
      { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' } }
    );

    res.json({
      id: data.id,
      key: data.key,
      url: `${JIRA_BASE_URL}/browse/${data.key}`,
      status: 'created',
      summary: summary || `[Banner not loading] ${domain} — Zendesk #${ticketId}`,
      created: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Jira error';
    res.status(500).json({ error: 'Jira issue creation failed', detail: message });
  }
});
