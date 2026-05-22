# Flux API — RapidAPI Listing

## Short Description (140 chars)
Content generation API — blog posts, social media, emails, ads, landing pages. Any format, any LLM. Structured JSON output.

## Long Description

Flux is a content generation API that produces publication-ready copy across 7 content types and 4 utility endpoints. Point it at any content need — blog posts, social media, email campaigns, ad copy, product descriptions, landing pages, or Twitter/X threads — and get structured JSON back with the content, metadata, and SEO suggestions.

**7 Content Generators:**
- **Blog** — Long-form articles with titles, meta descriptions, and reading time
- **Social** — Platform-ready posts with hashtags and hooks
- **Email** — Campaign emails with subject lines and CTAs
- **Ads** — Ad copy variants for paid channels
- **Product** — Product descriptions optimized for conversion
- **Landing** — Landing page copy with headlines, subheads, and sections
- **Thread** — Multi-post Twitter/X threads with hooks and flow

**4 Utility Endpoints:**
- **Repurpose** — Turn one piece of content into multiple formats (blog to social + email + thread)
- **Improve** — Enhance existing content for clarity, SEO, engagement, or conversion
- **SEO** — Keyword research, meta descriptions, title variants, and content structure
- **Brand Voice** — Extract a reusable voice profile from writing samples

**Why Flux:**
- Structured JSON responses — no parsing HTML or markdown
- Multi-provider LLM support (OpenAI, Anthropic, Google) — pick your engine or let Flux choose
- Generate up to 5 variants per request for A/B testing
- Tone and audience targeting on every request
- Brand voice profiles for consistent output across all content types
- SEO keywords woven into content automatically

## Category
Text > Content Generation

## Code Examples

### Python — Generate a Blog Post

```python
import requests

url = "https://flux-api.p.rapidapi.com/v1/generate/blog"

payload = {
    "brief": "Write about the benefits of remote work for startups in 2026",
    "tone": "professional",
    "audience": "startup founders",
    "keywords": ["remote work", "startup culture", "distributed teams"],
    "length": "long",
    "variants": 1
}

headers = {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",
    "X-RapidAPI-Host": "flux-api.p.rapidapi.com"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

print(data["variants"][0]["title"])
print(data["variants"][0]["content"])
```

### Python — Generate Social Media Posts

```python
import requests

url = "https://flux-api.p.rapidapi.com/v1/generate/social"

payload = {
    "brief": "Announce our new AI-powered analytics dashboard",
    "tone": "excited",
    "audience": "tech professionals",
    "length": "short",
    "variants": 3
}

headers = {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",
    "X-RapidAPI-Host": "flux-api.p.rapidapi.com"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

for i, variant in enumerate(data["variants"]):
    print(f"Variant {i+1}: {variant['content']}")
```

### JavaScript — Generate a Blog Post

```javascript
const response = await fetch("https://flux-api.p.rapidapi.com/v1/generate/blog", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",
    "X-RapidAPI-Host": "flux-api.p.rapidapi.com"
  },
  body: JSON.stringify({
    brief: "Write about the benefits of remote work for startups in 2026",
    tone: "professional",
    audience: "startup founders",
    keywords: ["remote work", "startup culture", "distributed teams"],
    length: "long",
    variants: 1
  })
});

const data = await response.json();
console.log(data.variants[0].title);
console.log(data.variants[0].content);
```

### JavaScript — Generate Social Media Posts

```javascript
const response = await fetch("https://flux-api.p.rapidapi.com/v1/generate/social", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",
    "X-RapidAPI-Host": "flux-api.p.rapidapi.com"
  },
  body: JSON.stringify({
    brief: "Announce our new AI-powered analytics dashboard",
    tone: "excited",
    audience: "tech professionals",
    length: "short",
    variants: 3
  })
});

const data = await response.json();
data.variants.forEach((v, i) => console.log(`Variant ${i+1}: ${v.content}`));
```

### cURL — Generate a Blog Post

```bash
curl -X POST "https://flux-api.p.rapidapi.com/v1/generate/blog" \
  -H "Content-Type: application/json" \
  -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
  -H "X-RapidAPI-Host: flux-api.p.rapidapi.com" \
  -d '{
    "brief": "Write about the benefits of remote work for startups in 2026",
    "tone": "professional",
    "audience": "startup founders",
    "keywords": ["remote work", "startup culture", "distributed teams"],
    "length": "long",
    "variants": 1
  }'
```

### cURL — Generate Social Media Posts

```bash
curl -X POST "https://flux-api.p.rapidapi.com/v1/generate/social" \
  -H "Content-Type: application/json" \
  -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
  -H "X-RapidAPI-Host: flux-api.p.rapidapi.com" \
  -d '{
    "brief": "Announce our new AI-powered analytics dashboard",
    "tone": "excited",
    "audience": "tech professionals",
    "length": "short",
    "variants": 3
  }'
```

## Pricing Table

| Plan     | Price     | Monthly Requests | Daily Requests | Rate (per min) |
|----------|-----------|------------------|----------------|----------------|
| BASIC    | Free      | 30               | 5              | 3              |
| PRO      | $29/month | 500              | 30             | 10             |
| ULTRA    | $99/month | 5,000            | 300            | 30             |
| MEGA     | Custom    | Unlimited        | Unlimited      | 300            |

## Keywords
- content generation API
- blog post generator API
- social media content API
- email campaign generator
- AI copywriting API
- landing page copy API
- ad copy generator API
- content repurpose API
- SEO content API
- brand voice API

## Test Endpoint

**Endpoint:** `POST /v1/generate/social`

```json
{
  "brief": "Announce a product launch for a new project management tool",
  "tone": "excited",
  "audience": "product managers",
  "length": "short",
  "variants": 1
}
```

Expected response shape:
```json
{
  "success": true,
  "type": "social",
  "variants": [
    {
      "content": "...",
      "word_count": 42,
      "reading_time": "< 1 min read"
    }
  ],
  "metadata": {
    "provider": "auto",
    "tone": "excited",
    "audience": "product managers",
    "generated_at": "2026-05-22T12:00:00.000Z"
  }
}
```
