import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '../constants/systemPrompt';

export const analyzeRouter = Router();

analyzeRouter.post('/', async (req, res) => {
  const { ticket, account, stripeData, debugData, accountMissing, isPresales, docResults, tone, customTone } = req.body;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    return;
  }

  const toneMap: Record<string, string> = {
    friendly:     'Use a warm, empathetic, conversational tone. Be encouraging and human.',
    professional: 'Use a formal, polished tone. Maintain professionalism throughout.',
    technical:    'Use precise technical language. Include specific steps, code, or config details where relevant.',
    concise:      'Be extremely brief. Keep the draft under 5 sentences. No filler.',
  };
  // Custom tone overrides preset when provided
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

  const userMessage = `Process this support ticket using the real data below.${modeNote}
✍️ TONE INSTRUCTION: ${toneInstruction}

${docsSection}
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
    const client = new Anthropic({ apiKey });

    const stream = await client.messages.stream({
      model: 'claude-opus-4-5',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});
