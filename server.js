// ═══════════════════════════════════════════════════════════════
// FLUX API — AI Content Engine
// Briefs in. Publish-ready content out. Every format. Any LLM.
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'flux_admin_' + crypto.randomBytes(16).toString('hex');

// ─── LLM Providers ───────────────────────────────────────────
const PROVIDERS = {
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    models: { fast: 'claude-haiku-4-20250414', best: 'claude-sonnet-4-20250514' },
    key: () => process.env.ANTHROPIC_API_KEY,
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    models: { fast: 'gpt-4o-mini', best: 'gpt-4o' },
    key: () => process.env.OPENAI_API_KEY,
  },
  google: {
    urlBase: 'https://generativelanguage.googleapis.com/v1beta/models/',
    models: { fast: 'gemini-2.0-flash', best: 'gemini-2.5-flash' },
    key: () => process.env.GOOGLE_API_KEY,
  },
};

function getProvider(preferred) {
  if (preferred && PROVIDERS[preferred]?.key()) return preferred;
  for (const [id, p] of Object.entries(PROVIDERS)) { if (p.key()) return id; }
  return null;
}

async function llm(provider, model, system, user, maxTokens = 4096) {
  const p = PROVIDERS[provider];
  if (!p?.key()) throw new Error(`Provider ${provider} not available`);
  const t0 = Date.now();

  if (provider === 'anthropic') {
    const r = await fetch(p.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': p.key(), 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
    });
    if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`);
    const d = await r.json();
    return { text: d.content[0].text, tokens: { in: d.usage?.input_tokens, out: d.usage?.output_tokens }, ms: Date.now() - t0 };
  }
  if (provider === 'openai') {
    const r = await fetch(p.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${p.key()}` },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
    });
    if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text()}`);
    const d = await r.json();
    return { text: d.choices[0].message.content, tokens: { in: d.usage?.prompt_tokens, out: d.usage?.completion_tokens }, ms: Date.now() - t0 };
  }
  if (provider === 'google') {
    const url = `${p.urlBase}${model}:generateContent?key=${p.key()}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: system + '\n\n' + user }] }], generationConfig: { maxOutputTokens: maxTokens } }),
    });
    if (!r.ok) throw new Error(`Google ${r.status}: ${await r.text()}`);
    const d = await r.json();
    return { text: d.candidates[0].content.parts[0].text, tokens: { in: d.usageMetadata?.promptTokenCount, out: d.usageMetadata?.candidatesTokenCount }, ms: Date.now() - t0 };
  }
  throw new Error('Unknown provider');
}

// ─── Content Generation Prompts ──────────────────────────────
const GENERATORS = {

  blog: {
    system: `You are an elite content writer and SEO specialist. Write engaging, well-structured blog posts that rank.

Return ONLY valid JSON:
{
  "title": "string (compelling, SEO-optimized, 50-65 chars)",
  "slug": "string (url-friendly)",
  "meta_description": "string (150-160 chars, includes primary keyword)",
  "excerpt": "string (2-3 sentences for social sharing)",
  "content": "string (full article in Markdown — use ## headings, bullet points, bold for emphasis)",
  "word_count": number,
  "reading_time_min": number,
  "primary_keyword": "string",
  "secondary_keywords": ["string"],
  "internal_link_suggestions": ["string (topic to link to)"],
  "cta": "string (call-to-action for end of post)",
  "tone": "string (detected/applied tone)",
  "seo_score": 0-100
}`,
    maxTokens: 6000,
  },

  social: {
    system: `You are a viral social media content creator. Write platform-specific posts that get engagement.

Return ONLY valid JSON:
{
  "posts": [{
    "platform": "twitter|linkedin|instagram|facebook|threads",
    "content": "string (platform-appropriate length and style)",
    "hashtags": ["string"],
    "emoji_count": number,
    "estimated_reach": "low|medium|high|viral",
    "best_posting_time": "string",
    "hook_type": "question|statistic|story|controversial|how-to",
    "cta": "string"
  }],
  "thread": {
    "platform": "twitter",
    "tweets": ["string (max 280 chars each)"],
    "hook": "string (first tweet — the most important)"
  },
  "carousel": {
    "platform": "linkedin|instagram",
    "slides": [{ "heading": "string", "body": "string (30-50 words)", "slide_number": number }]
  }
}`,
    maxTokens: 4000,
  },

  email: {
    system: `You are an email marketing expert with 20% open rates minimum. Write compelling email sequences.

Return ONLY valid JSON:
{
  "subject_lines": [{ "text": "string", "type": "curiosity|benefit|urgency|personalized|question", "predicted_open_rate": "low|medium|high" }],
  "preview_text": "string (35-90 chars)",
  "emails": [{
    "position": number,
    "subject": "string",
    "body_html": "string (HTML email body — clean, mobile-friendly)",
    "body_text": "string (plain text version)",
    "cta_text": "string",
    "cta_url_placeholder": "{{cta_url}}",
    "send_delay_hours": number,
    "purpose": "welcome|nurture|convert|re-engage|announce"
  }],
  "sequence_type": "welcome|launch|nurture|abandoned_cart|re-engagement",
  "estimated_conversion_rate": "string"
}`,
    maxTokens: 5000,
  },

  ads: {
    system: `You are a performance marketing copywriter. Write ad copy that converts. A/B test variants included.

Return ONLY valid JSON:
{
  "campaign_name": "string",
  "target_audience": "string",
  "ads": [{
    "platform": "google|facebook|instagram|linkedin|tiktok",
    "format": "search|display|story|feed|carousel",
    "variants": [{
      "headline": "string (platform char limit aware)",
      "description": "string",
      "cta": "string",
      "variant_label": "A|B|C"
    }],
    "targeting_suggestions": ["string"],
    "estimated_ctr": "string"
  }],
  "landing_page_headline": "string",
  "landing_page_subheadline": "string",
  "unique_selling_points": ["string"],
  "objection_handlers": ["string"]
}`,
    maxTokens: 4000,
  },

  product: {
    system: `You are an e-commerce copywriter. Write product descriptions that sell. SEO-optimized, benefit-driven.

Return ONLY valid JSON:
{
  "products": [{
    "title": "string (SEO-optimized product title)",
    "tagline": "string (one punchy line)",
    "short_description": "string (50-80 words, for category pages)",
    "long_description": "string (150-300 words, for product page, Markdown)",
    "bullet_points": ["string (benefit-driven, 5-7 bullets)"],
    "seo_title": "string (50-65 chars)",
    "meta_description": "string (150-160 chars)",
    "keywords": ["string"],
    "target_customer": "string",
    "tone": "string",
    "upsell_suggestion": "string"
  }]
}`,
    maxTokens: 3000,
  },

  landing: {
    system: `You are a conversion-focused landing page copywriter. Write copy that converts visitors into customers.

Return ONLY valid JSON:
{
  "hero": {
    "headline": "string (max 10 words, punchy)",
    "subheadline": "string (max 25 words, benefit-driven)",
    "cta_primary": "string (button text)",
    "cta_secondary": "string (secondary action)",
    "social_proof": "string (one-liner: 'Trusted by 10,000+ teams')"
  },
  "pain_points": [{ "problem": "string", "agitation": "string" }],
  "solution": {
    "headline": "string",
    "description": "string (100-150 words)",
    "features": [{ "title": "string", "description": "string (30 words)", "icon_suggestion": "string" }]
  },
  "social_proof_section": {
    "testimonials": [{ "quote": "string", "name": "string", "title": "string", "company": "string" }],
    "stats": [{ "number": "string", "label": "string" }]
  },
  "pricing_section": {
    "headline": "string",
    "plans": [{ "name": "string", "price": "string", "features": ["string"], "cta": "string", "highlighted": boolean }]
  },
  "faq": [{ "question": "string", "answer": "string" }],
  "final_cta": { "headline": "string", "subheadline": "string", "button_text": "string" }
}`,
    maxTokens: 5000,
  },

  thread: {
    system: `You are a viral Twitter/X thread writer. Write threads that get 1000+ likes.

Return ONLY valid JSON:
{
  "hook": "string (first tweet — MUST stop the scroll, max 280 chars)",
  "tweets": ["string (each max 280 chars, numbered implicitly)"],
  "closer": "string (final tweet with CTA, max 280 chars)",
  "total_tweets": number,
  "topic": "string",
  "hook_type": "bold_claim|question|statistic|story|controversial",
  "estimated_engagement": "low|medium|high|viral",
  "best_time_to_post": "string",
  "quote_tweet_bait": "string (one tweet designed to get quote tweets)"
}`,
    maxTokens: 3000,
  },
};

// ─── API Key Store ────────────────────────────────────────────
const apiKeys = new Map();
const usageLog = [];

function createKey(name, tier = 'free') {
  const key = 'flux_' + tier[0] + '_' + crypto.randomBytes(20).toString('hex');
  apiKeys.set(key, { key, name, tier, created: new Date().toISOString(), requests: 0, active: true });
  return apiKeys.get(key);
}

const demoKey = createKey('demo', 'free');
console.log(`\n  Demo key: ${demoKey.key}\n`);

// ─── Express ──────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

function auth(req, res, next) {
  // RapidAPI proxy path — when deployed behind RapidAPI's marketplace
  const proxySecret = process.env.RAPIDAPI_PROXY_SECRET;
  const incomingSecret = req.headers['x-rapidapi-proxy-secret'] || req.headers['x-proxy-secret'];
  if (proxySecret && incomingSecret === proxySecret) {
    req.tier = 'rapidapi';
    req.rapidUser = req.headers['x-rapidapi-user'] || null;
    req.rapidSubscription = req.headers['x-rapidapi-subscription'] || null;
    return next();
  }
  // Direct / dev path — Bearer token or x-api-key header
  const key = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-api-key'];
  if (!key) return res.status(401).json({ error: 'API key required' });
  if (key === ADMIN_KEY) { req.tier = 'admin'; return next(); }
  const record = apiKeys.get(key);
  if (!record?.active) return res.status(403).json({ error: 'Invalid API key' });
  record.requests++;
  req.tier = record.tier;
  next();
}

function track(req, result, type) {
  usageLog.push({ endpoint: req.path, type, provider: result?.provider, tokens: result?.tokens, ms: result?.ms, t: new Date().toISOString() });
  if (usageLog.length > 10000) usageLog.splice(0, usageLog.length - 10000);
}

function parseJSON(text) {
  let j = text.trim();
  if (j.startsWith('```')) j = j.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(j);
}

// ─── Routes ───────────────────────────────────────────────────

app.get('/health', (req, res) => {
  const providers = Object.entries(PROVIDERS).filter(([, p]) => p.key()).map(([id]) => id);
  res.json({ status: 'ok', version: '1.0.0', providers });
});

// ═══ GENERATE — universal content generation ═══
app.post('/v1/generate/:type', auth, async (req, res) => {
  const { type } = req.params;
  const gen = GENERATORS[type];
  if (!gen) {
    return res.status(400).json({
      error: `Unknown content type: ${type}`,
      available: Object.keys(GENERATORS),
      example: 'POST /v1/generate/blog',
    });
  }

  const { brief, tone, audience, brand_voice, keywords, length, variants, provider: pref, quality } = req.body;
  if (!brief) return res.status(400).json({ error: 'brief is required — describe what you want written' });

  const provider = getProvider(pref);
  if (!provider) return res.status(503).json({ error: 'No LLM provider configured' });

  const q = quality || 'best';
  const model = PROVIDERS[provider].models[q] || PROVIDERS[provider].models.best;

  try {
    const userPrompt = [
      `Brief: ${brief}`,
      tone ? `Tone: ${tone}` : null,
      audience ? `Target audience: ${audience}` : null,
      brand_voice ? `Brand voice: ${brand_voice}` : null,
      keywords?.length ? `Keywords to include: ${keywords.join(', ')}` : null,
      length ? `Target length: ${length}` : null,
      variants ? `Generate ${variants} variants` : null,
    ].filter(Boolean).join('\n');

    const result = await llm(provider, model, gen.system, userPrompt, gen.maxTokens);

    let content;
    try { content = parseJSON(result.text); }
    catch { content = { raw: result.text, parse_note: 'Response was not structured JSON' }; }

    track(req, { provider, tokens: result.tokens, ms: result.ms }, type);

    res.json({
      id: uuidv4(),
      type,
      content,
      meta: {
        provider,
        model,
        quality: q,
        latency_ms: result.ms,
        tokens: result.tokens,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══ REPURPOSE — one piece of content → many formats ═══
app.post('/v1/repurpose', auth, async (req, res) => {
  const { content, source_type, target_types, tone, audience, provider: pref } = req.body;
  if (!content) return res.status(400).json({ error: 'content is required — paste the original content' });

  const provider = getProvider(pref);
  if (!provider) return res.status(503).json({ error: 'No LLM provider configured' });

  const targets = target_types || ['twitter', 'linkedin', 'email', 'blog_summary'];
  const model = PROVIDERS[provider].models.best;

  try {
    const result = await llm(provider, model,
      `You are a content repurposing expert. Take one piece of content and transform it into multiple formats, each optimized for its platform.

Return ONLY valid JSON:
{
  "source_summary": "string (what the original content is about, 1-2 sentences)",
  "repurposed": [{
    "format": "string (twitter_thread|linkedin_post|email|blog_summary|instagram_caption|tiktok_script|newsletter|press_release)",
    "content": "string (the repurposed content, ready to publish)",
    "platform_notes": "string (why this works for this platform)",
    "hashtags": ["string"],
    "word_count": number,
    "estimated_engagement": "low|medium|high"
  }],
  "content_calendar": [{
    "day": "string (Mon/Tue/etc)",
    "platform": "string",
    "format": "string",
    "best_time": "string"
  }]
}`,
      `Source content (${source_type || 'text'}):\n\n${content}\n\nRepurpose into these formats: ${targets.join(', ')}${tone ? '\nTone: ' + tone : ''}${audience ? '\nAudience: ' + audience : ''}`,
      5000
    );

    let parsed;
    try { parsed = parseJSON(result.text); }
    catch { parsed = { raw: result.text }; }

    track(req, { provider, tokens: result.tokens, ms: result.ms }, 'repurpose');

    res.json({ id: uuidv4(), type: 'repurpose', content: parsed, meta: { provider, model, latency_ms: result.ms, tokens: result.tokens } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══ IMPROVE — rewrite/enhance existing content ═══
app.post('/v1/improve', auth, async (req, res) => {
  const { content, goals, tone, provider: pref } = req.body;
  if (!content) return res.status(400).json({ error: 'content is required — paste what you want improved' });

  const provider = getProvider(pref);
  if (!provider) return res.status(503).json({ error: 'No LLM provider configured' });

  const model = PROVIDERS[provider].models.best;
  const improvementGoals = goals || ['clarity', 'engagement', 'seo'];

  try {
    const result = await llm(provider, model,
      `You are a content editor and optimizer. Improve the given content based on the specified goals.

Return ONLY valid JSON:
{
  "improved_content": "string (the improved version, Markdown)",
  "changes_made": [{ "type": "string (clarity|engagement|seo|grammar|structure|tone)", "description": "string", "before": "string (short excerpt)", "after": "string (short excerpt)" }],
  "scores": {
    "before": { "readability": 0-100, "engagement": 0-100, "seo": 0-100, "clarity": 0-100 },
    "after": { "readability": 0-100, "engagement": 0-100, "seo": 0-100, "clarity": 0-100 }
  },
  "word_count": { "before": number, "after": number },
  "reading_level": "string (e.g. 'Grade 8', 'Professional')",
  "suggestions": ["string (additional improvements not applied)"]
}`,
      `Content to improve:\n\n${content}\n\nGoals: ${improvementGoals.join(', ')}${tone ? '\nDesired tone: ' + tone : ''}`,
      5000
    );

    let parsed;
    try { parsed = parseJSON(result.text); }
    catch { parsed = { raw: result.text }; }

    track(req, { provider, tokens: result.tokens, ms: result.ms }, 'improve');

    res.json({ id: uuidv4(), type: 'improve', content: parsed, meta: { provider, model, latency_ms: result.ms, tokens: result.tokens } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══ SEO — keyword research + content analysis ═══
app.post('/v1/seo', auth, async (req, res) => {
  const { topic, url, content, provider: pref } = req.body;
  if (!topic && !url && !content) return res.status(400).json({ error: 'Provide topic, url, or content' });

  const provider = getProvider(pref);
  if (!provider) return res.status(503).json({ error: 'No LLM provider configured' });

  let pageContent = content || '';
  if (url && !content) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'FluxAPI/1.0' }, signal: AbortSignal.timeout(10000) });
      const html = await r.text();
      pageContent = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000);
    } catch { /* proceed with topic only */ }
  }

  const model = PROVIDERS[provider].models.best;

  try {
    const result = await llm(provider, model,
      `You are an SEO analyst. Provide keyword research and content optimization recommendations.

Return ONLY valid JSON:
{
  "primary_keyword": { "keyword": "string", "estimated_volume": "low|medium|high|very_high", "difficulty": "low|medium|high", "intent": "informational|navigational|commercial|transactional" },
  "secondary_keywords": [{ "keyword": "string", "relevance": 0.0-1.0, "estimated_volume": "string" }],
  "long_tail_keywords": [{ "keyword": "string", "intent": "string" }],
  "content_gaps": ["string (topics competitors cover that this content doesn't)"],
  "title_suggestions": [{ "title": "string (50-65 chars)", "keyword_position": "front|middle|end" }],
  "meta_description_suggestions": ["string (150-160 chars)"],
  "heading_structure": ["string (suggested H2/H3 headings)"],
  "content_recommendations": ["string"],
  "current_score": 0-100,
  "potential_score": 0-100,
  "word_count_recommendation": number,
  "competitors_to_study": ["string (search queries to analyze)"]
}`,
      `${topic ? 'Topic: ' + topic : ''}${url ? '\nURL: ' + url : ''}${pageContent ? '\nPage content:\n' + pageContent.slice(0, 5000) : ''}`,
      3000
    );

    let parsed;
    try { parsed = parseJSON(result.text); }
    catch { parsed = { raw: result.text }; }

    track(req, { provider, tokens: result.tokens, ms: result.ms }, 'seo');

    res.json({ id: uuidv4(), type: 'seo', analysis: parsed, meta: { provider, model, latency_ms: result.ms, tokens: result.tokens } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══ BRAND VOICE — analyze and codify a brand's voice ═══
app.post('/v1/brand-voice', auth, async (req, res) => {
  const { samples, brand_name, provider: pref } = req.body;
  if (!samples || !Array.isArray(samples) || samples.length === 0) {
    return res.status(400).json({ error: 'samples array required — paste 3-5 examples of existing content' });
  }

  const provider = getProvider(pref);
  if (!provider) return res.status(503).json({ error: 'No LLM provider configured' });

  try {
    const result = await llm(provider, PROVIDERS[provider].models.best,
      `You are a brand strategist. Analyze content samples to extract and codify a brand's voice and tone.

Return ONLY valid JSON:
{
  "brand_name": "string",
  "voice_profile": {
    "personality_traits": ["string (3-5 adjectives)"],
    "tone_spectrum": { "formal_casual": 0-10, "serious_playful": 0-10, "technical_simple": 0-10, "authoritative_friendly": 0-10 },
    "vocabulary_level": "basic|intermediate|advanced|expert",
    "sentence_style": "string (short/punchy, long/flowing, mixed)",
    "signature_phrases": ["string"],
    "words_to_use": ["string"],
    "words_to_avoid": ["string"],
    "emoji_usage": "never|rarely|sometimes|frequently",
    "punctuation_style": "string"
  },
  "writing_guidelines": ["string (5-8 specific do/don't rules)"],
  "example_rewrites": [{ "generic": "string", "on_brand": "string" }],
  "system_prompt": "string (a system prompt that captures this voice for AI content generation)"
}`,
      `Brand: ${brand_name || 'Unknown'}\n\nContent samples:\n${samples.map((s, i) => `--- Sample ${i + 1} ---\n${s}`).join('\n\n')}`,
      3000
    );

    let parsed;
    try { parsed = parseJSON(result.text); }
    catch { parsed = { raw: result.text }; }

    track(req, { provider, tokens: result.tokens, ms: result.ms }, 'brand-voice');

    res.json({ id: uuidv4(), type: 'brand_voice', profile: parsed, meta: { provider, latency_ms: result.ms, tokens: result.tokens } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══ TYPES — list available content types ═══
app.get('/v1/types', (req, res) => {
  res.json({
    generators: Object.keys(GENERATORS).map(t => ({
      type: t,
      endpoint: `/v1/generate/${t}`,
      description: {
        blog: 'SEO-optimized blog posts with meta descriptions, keywords, CTAs',
        social: 'Platform-specific social media posts + threads + carousels',
        email: 'Email sequences — welcome, launch, nurture, re-engagement',
        ads: 'Ad copy with A/B variants — Google, Facebook, LinkedIn, TikTok',
        product: 'E-commerce product descriptions with SEO + bullet points',
        landing: 'Full landing page copy — hero, features, pricing, FAQ, CTA',
        thread: 'Viral Twitter/X threads with hooks and engagement optimization',
      }[t],
    })),
    utilities: [
      { endpoint: '/v1/repurpose', description: 'Transform one piece of content into many formats' },
      { endpoint: '/v1/improve', description: 'Rewrite and optimize existing content' },
      { endpoint: '/v1/seo', description: 'Keyword research + content SEO analysis' },
      { endpoint: '/v1/brand-voice', description: 'Analyze content samples to codify brand voice' },
    ],
    providers: Object.entries(PROVIDERS).filter(([, p]) => p.key()).map(([id, p]) => ({ id, models: p.models })),
  });
});

// ═══ Admin ═══
app.post('/v1/keys', auth, (req, res) => {
  if (req.tier !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const record = createKey(req.body.name || 'unnamed', req.body.tier || 'free');
  res.json({ key: record.key, name: record.name, tier: record.tier });
});

app.get('/v1/usage', auth, (req, res) => {
  if (req.tier !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const last24h = usageLog.filter(u => new Date(u.t) > new Date(Date.now() - 86400000));
  const byType = {};
  for (const u of last24h) byType[u.type] = (byType[u.type] || 0) + 1;
  res.json({ period: '24h', total: last24h.length, by_type: byType, recent: usageLog.slice(-20).reverse() });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  const p = Object.entries(PROVIDERS).filter(([, v]) => v.key()).map(([k]) => k);
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║   FLUX API v1.0 — AI Content Engine                ║
  ╠═══════════════════════════════════════════════════╣
  ║   http://localhost:${PORT}                            ║
  ║   Providers: ${p.join(', ') || 'NONE — set API keys'}
  ║   Types: ${Object.keys(GENERATORS).join(', ')}
  ╚═══════════════════════════════════════════════════╝
  `);
});
