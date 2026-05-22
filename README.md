<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node >= 18" />
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="v1.0.0" />
  <img src="https://img.shields.io/badge/license-MIT-orange" alt="MIT" />
</p>

# Flux API

**Briefs in. Publish-ready content out.**

Flux is a content generation API that turns short briefs into structured, publish-ready content across every major format. One request, structured JSON back. Blog posts, social campaigns, email sequences, ad copy, product descriptions, landing pages, and threads -- all from a single API.

Multi-LLM under the hood: Anthropic Claude, OpenAI GPT, and Google Gemini. Pick a provider or let Flux choose the best available.

---

## Features

### 7 Content Generators

| Generator | What it produces |
|-----------|-----------------|
| **Blog** | SEO-optimized articles with meta descriptions, keywords, internal link suggestions, and CTAs |
| **Social** | Platform-specific posts for Twitter, LinkedIn, Instagram, Facebook, and Threads -- plus carousels and threads |
| **Email** | Full email sequences (welcome, launch, nurture, re-engagement) with subject lines, HTML/plain text bodies, and send timing |
| **Ads** | Ad copy with A/B variants for Google, Facebook, Instagram, LinkedIn, and TikTok -- includes targeting suggestions |
| **Product** | E-commerce product descriptions with bullet points, SEO titles, meta descriptions, and upsell suggestions |
| **Landing** | Complete landing page copy: hero, pain points, features, testimonials, pricing, FAQ, and final CTA |
| **Thread** | Viral Twitter/X threads with scroll-stopping hooks and engagement optimization |

### 4 Utilities

| Utility | What it does |
|---------|-------------|
| **Repurpose** | Transform one piece of content into multiple platform-optimized formats with a content calendar |
| **Improve** | Rewrite and score existing content with before/after quality metrics (readability, engagement, SEO, clarity) |
| **SEO** | Keyword research, content gap analysis, heading structure, and scoring with improvement roadmap |
| **Brand Voice** | Analyze content samples to extract personality traits, tone spectrum, vocabulary, and a reusable system prompt |

### Multi-LLM Support

| Provider | Fast Mode | Best Mode |
|----------|-----------|-----------|
| Anthropic | Claude Haiku 4 | Claude Sonnet 4 |
| OpenAI | GPT-4o Mini | GPT-4o |
| Google | Gemini 2.0 Flash | Gemini 2.5 Flash |

---

## Quick Start

```bash
# Clone
git clone https://github.com/sjgant80-hub/flux-api.git
cd flux-api

# Install
npm install

# Configure (set at least one LLM provider key)
cp .env.example .env
# Edit .env with your API keys

# Run
npm start
# Server starts on http://localhost:3000
```

For development with auto-reload:

```bash
npm run dev
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `3000`) |
| `ADMIN_KEY` | No | Admin API key for key management and usage stats (auto-generated if not set) |
| `ANTHROPIC_API_KEY` | * | Anthropic API key |
| `OPENAI_API_KEY` | * | OpenAI API key |
| `GOOGLE_API_KEY` | * | Google AI API key |
| `DEFAULT_PROVIDER` | No | Preferred provider: `anthropic`, `openai`, or `google` |

\* At least one LLM provider key is required.

---

## Endpoints

### Content Generation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/v1/generate/:type` | API key | Generate content (`blog`, `social`, `email`, `ads`, `product`, `landing`, `thread`) |
| `POST` | `/v1/repurpose` | API key | Repurpose content across platforms |
| `POST` | `/v1/improve` | API key | Improve existing content with before/after scoring |
| `POST` | `/v1/seo` | API key | SEO analysis and keyword research |
| `POST` | `/v1/brand-voice` | API key | Analyze brand voice from content samples |

### Info & Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/v1/types` | None | List all generators and utilities |
| `GET` | `/health` | None | Health check and available providers |
| `POST` | `/v1/keys` | Admin | Create a new API key |
| `GET` | `/v1/usage` | Admin | Usage statistics (last 24 hours) |

### Authentication

Pass your API key in the `Authorization` header or `x-api-key` header:

```
Authorization: Bearer flux_f_abc123...
```

---

## Code Examples

### Generate a Blog Post

```bash
curl -X POST http://localhost:3000/v1/generate/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "brief": "Write about the future of remote work in 2026",
    "tone": "professional but approachable",
    "audience": "HR leaders and startup founders",
    "keywords": ["remote work", "hybrid teams", "async collaboration"],
    "quality": "best"
  }'
```

**Response:**

```json
{
  "id": "a1b2c3d4-...",
  "type": "blog",
  "content": {
    "title": "The Future of Remote Work: What HR Leaders Need to Know",
    "slug": "future-of-remote-work-hr-leaders",
    "meta_description": "Discover how remote work is evolving in 2026...",
    "excerpt": "Remote work is no longer an experiment...",
    "content": "## The Shift Is Permanent\n\n...",
    "word_count": 1450,
    "reading_time_min": 6,
    "primary_keyword": "remote work",
    "secondary_keywords": ["hybrid teams", "async collaboration"],
    "internal_link_suggestions": ["team communication tools", "async standup guide"],
    "cta": "Download our free Remote Work Playbook",
    "tone": "professional",
    "seo_score": 87
  },
  "meta": {
    "provider": "anthropic",
    "model": "claude-sonnet-4-20250514",
    "quality": "best",
    "latency_ms": 4200,
    "tokens": { "in": 380, "out": 2100 }
  }
}
```

### Generate Social Media Posts

```bash
curl -X POST http://localhost:3000/v1/generate/social \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "brief": "Launch announcement for a new AI writing tool for marketers",
    "tone": "excited, confident",
    "audience": "content marketers and growth teams",
    "quality": "fast"
  }'
```

**Response:**

```json
{
  "id": "e5f6a7b8-...",
  "type": "social",
  "content": {
    "posts": [
      {
        "platform": "twitter",
        "content": "We just launched something marketers are going to love...",
        "hashtags": ["#AIwriting", "#ContentMarketing"],
        "emoji_count": 2,
        "estimated_reach": "high",
        "best_posting_time": "Tuesday 10am EST",
        "hook_type": "story",
        "cta": "Try it free"
      },
      {
        "platform": "linkedin",
        "content": "After 6 months of building in stealth...",
        "hashtags": ["#MarTech", "#ContentStrategy"],
        "emoji_count": 0,
        "estimated_reach": "medium",
        "best_posting_time": "Wednesday 8am EST",
        "hook_type": "story",
        "cta": "See it in action"
      }
    ],
    "thread": {
      "platform": "twitter",
      "tweets": ["1/ We built the AI writing tool we wished existed...", "..."],
      "hook": "1/ We built the AI writing tool we wished existed..."
    },
    "carousel": {
      "platform": "linkedin",
      "slides": [
        { "heading": "The Problem", "body": "Marketers spend 40% of their week writing...", "slide_number": 1 }
      ]
    }
  },
  "meta": {
    "provider": "anthropic",
    "model": "claude-haiku-4-20250414",
    "quality": "fast",
    "latency_ms": 1800,
    "tokens": { "in": 210, "out": 1400 }
  }
}
```

---

## Request Parameters

All generation endpoints accept these fields in the request body:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brief` | string | Yes | What you want written -- the core instruction |
| `tone` | string | No | Desired tone (e.g. `"professional"`, `"casual"`, `"witty"`) |
| `audience` | string | No | Target audience description |
| `brand_voice` | string | No | Brand voice guidelines or name |
| `keywords` | string[] | No | Keywords to include in the content |
| `length` | string | No | Target length (e.g. `"1500 words"`, `"short"`) |
| `variants` | number | No | Number of variants to generate |
| `provider` | string | No | Force a specific LLM provider (`anthropic`, `openai`, `google`) |
| `quality` | string | No | `"fast"` for speed, `"best"` for quality (default: `"best"`) |

---

## Content Types

### What Each Generator Returns

**Blog** -- Full article with SEO metadata: title, slug, meta description, Markdown content, word count, reading time, keyword analysis, internal link suggestions, CTA, and an SEO score (0-100).

**Social** -- Multi-platform content bundle: individual posts per platform (Twitter, LinkedIn, Instagram, Facebook, Threads), a Twitter thread with hook tweet, and a LinkedIn/Instagram carousel with slide-by-slide copy.

**Email** -- Complete email sequence: multiple subject line variants with predicted open rates, preview text, HTML and plain text bodies, CTA placement, send timing, and estimated conversion rate.

**Ads** -- Campaign-ready ad copy: multi-platform variants (Google, Facebook, Instagram, LinkedIn, TikTok) with A/B/C headline and description variants, targeting suggestions, estimated CTR, and landing page copy.

**Product** -- E-commerce listing copy: SEO title, tagline, short and long descriptions, benefit-driven bullet points, meta description, target customer profile, and upsell suggestions.

**Landing** -- Full-page conversion copy: hero section (headline, subheadline, CTA, social proof), pain points, solution/features section, testimonials, stats, pricing tiers, FAQ, and a closing CTA.

**Thread** -- Twitter/X thread: scroll-stopping hook tweet, numbered body tweets (each under 280 chars), closer with CTA, engagement estimate, best posting time, and a quote-tweet-bait tweet.

---

## Pricing Tiers

| Tier | Requests / Month | Best For |
|------|-------------------|----------|
| **Free** | 30 | Testing and personal projects |
| **Pro** | 500 | Freelancers and small teams |
| **Business** | 5,000 | Agencies and content operations |

---

## Deployment

### Docker

```bash
docker build -t flux-api .
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e OPENAI_API_KEY=sk-... \
  -e GOOGLE_API_KEY=AIza... \
  flux-api
```

### Heroku

```bash
heroku create your-flux-api
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
git push heroku main
```

### Railway / Render

Connect your GitHub repo. Set the environment variables in the dashboard. The `Dockerfile` and `Procfile` are included.

---

## Tech Stack

- **Runtime:** Node.js >= 18
- **Framework:** Express 4
- **Dependencies:** `express`, `cors`, `uuid` -- nothing else
- **LLM Providers:** Anthropic, OpenAI, Google (bring your own keys)

---

## Ecosystem

- [API Documentation](https://sjgant80-hub.github.io/flux-api/) -- Interactive docs and playground
- [GitHub Repository](https://github.com/sjgant80-hub/flux-api) -- Source code and issues

---

<p align="center">
  Built by <strong>Konomi</strong> + <strong>ACG</strong>
</p>
