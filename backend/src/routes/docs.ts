import { Router } from 'express';
import { COOKIEYES_DOCS } from '../constants/cookieyesDocs';

export const docsRouter = Router();

docsRouter.get('/search', (req, res) => {
  const query = String(req.query.q || '').toLowerCase().trim();

  if (!query || query.length < 3) {
    res.json({ results: [], query: '' });
    return;
  }

  const terms = query
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2)
    .slice(0, 12);

  if (terms.length === 0) {
    res.json({ results: [], query });
    return;
  }

  const scored = COOKIEYES_DOCS.map((doc) => {
    const titleLower = doc.title.toLowerCase();
    const tagsText = doc.tags.join(' ');
    const contentLower = doc.content.toLowerCase();
    let score = 0;

    for (const term of terms) {
      if (titleLower.includes(term)) score += 4;
      if (doc.tags.some((t) => t.includes(term) || term.includes(t))) score += 3;
      if (tagsText.includes(term)) score += 2;
      if (contentLower.includes(term)) score += 1;
    }

    return { doc, score };
  });

  const results = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.doc);

  res.json({ results, query });
});
