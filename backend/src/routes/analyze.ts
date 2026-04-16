import { Router } from 'express';
import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '../constants/systemPrompt';

export const analyzeRouter = Router();

analyzeRouter.post('/', async (req, res) => {
  const {
    ticket, account, stripeData, debugData,
    accountMissing, isPresales, docResults,
    tone, customTone, relatedTickets,
  } = req.body;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
    return;
  }

  const toneMap: Record<string, string> = {
    friendly:     'Use a warm, empathetic, conversational tone. Be encouraging and human.',
    professional: 'Use a formal, polished tone. Maintain professionalism throughout.',
    technical:    'Use precise technical language. Include specific steps, code, or config details where relevant.',
    concise:      'Be extremely brief. Keep the draft under 5 sentences. No filler.',
  };
  const toneInstruction = (customTone as string | undefined)?.trim()
    ? (customTone as string).trim()
    : (toneMap[tone as string] || toneMap.friendly);

  const modeNote = isPresales
    ? '\n🎯 PRESALES MODE — This is a prospect (no account). Answer their question directly. Do NOT ask for account credentials. Recommend the right plan. Mention the free trial if relevant.\n'
    : accountMissing
    ? '\n⚠️ ACCOUNT NOT FOUND — Run in INFO-GATHERING MODE. Generate a short draft asking for registered email and domain.\n'
    : '';

  const docsSection = docResults && Array.isArray(docResults) && docResults.length > 0
    ? `\nRELEVANT DOCUMENTATION (use this to inform your analysis and draft):\n${
        docResults.map((d: { title: string; category: string; content: string }) =>
          `### ${d.title} [${d.category}]\n${d.content}`
        ).join('\n\n')
      }\n`
    : '\nRELEVANT DOCUMENTATION: No matching articles found for this ticket.\n';

  // Related tickets — provides history to personalise the draft
  const relatedSection = relatedTickets && Array.isArray(relatedTickets) && relatedTickets.length > 0
    ? `\nRELATED TICKETS (actively use this context when writing the draft):\n${
        relatedTickets.map((t: {
          id: string | number;
          subject: string;
          status: string;
          tags: string[];
          match_reason: string;
        }) =>
          `- #${t.id} [${t.match_reason === 'same_customer' ? 'Same customer' : 'Similar topic'}] "${t.subject}" (${t.status}) — tags: ${(t.tags || []).join(', ')}`
        ).join('\n')
      }

RULES FOR USING RELATED TICKETS IN THE DRAFT:
- same_customer: This customer has contacted us before. Do NOT ask again for info they have already provided (email, domain, plan type). Reference their history naturally when relevant, e.g. "I can see this is related to the issue you raised in #${(relatedTickets as Array<{id: string|number; match_reason: string}>).find(t => t.match_reason === 'same_customer')?.id ?? 'a previous ticket'}…". If they had an unresolved issue, acknowledge it.
- same_topic: A similar problem has been reported before. Use the recurring pattern to give a more confident, targeted solution — avoid generic steps if the related tickets hint at a known root cause.\n`
    : '';

  const userMessage = `Process this support ticket using the real data below.${modeNote}
✍️ TONE INSTRUCTION: ${toneInstruction}

${docsSection}${relatedSection}
TICKET DATA:
${JSON.stringify(ticket, null, 2)}

ACCOUNT DATA:
${account ? JSON.stringify(account, null, 2) : 'null — account could not be found for this email'}

STRIPE DATA:
${JSON.stringify(stripeData, null, 2)}

SITE DEBUG DATA:
${JSON.stringify(debugData, null, 2)}

Run the complete 7-skill workflow. End your response with CATEGORY: and the ---DRAFT--- block as instructed.`;

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const client = new OpenAI({ apiKey });

    const stream = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2500,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? '';
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});
