# eligible-jobs

A personal pool of remote job postings that a developer outside the US and the EU can actually apply to, checked against the employer's own posting.

## The problem

Remote job boards often label a posting "Anywhere" or "Worldwide". The employer's own careers page for the same role then says "US only" or "must be authorized to work in the EU". A developer in Turkey finds this out after reading the whole posting, or after applying. Most of the filtering work is reading the fine print, and it repeats for every posting.

## How it works

```
company list ──▶ scheduled scan (Cloudflare Workers cron)
                     │  public job board APIs: Greenhouse, Lever, Ashby
                     ▼
                 rule filter (cheap: title, location fields)
                     │  survivors only
                     ▼
                 LLM check of the posting text
                 { eligible, region, evidence sentence }  ← structured output
                     │
                     ▼
                 Postgres (Neon) ──▶ pool you browse and query
```

- The first version reads only the employer's own applicant tracking system (ATS), through the public job board APIs these vendors publish for this purpose, for a hand-picked list of companies.
- A later version adds discovery from remote job boards, then verifies each lead against the employer's ATS.
- Applying stays manual.

## Roadmap

Each module ends with something that runs and can be shown.

1. **Scanner and eligibility check:** scheduled scan, rule filter, LLM check with structured output validated by a schema, cost and latency logged for every model call.
2. **Evals:** a hand-labelled set of postings, precision and recall of the eligibility check, run in CI when the prompt changes.
3. **Query UI:** ask the pool in plain language, answered with tool calling and streamed to a React UI.
4. **MCP server:** the same tools over the Model Context Protocol, so the pool can be queried from an AI assistant.
5. **Semantic matching:** rank postings against a profile with embeddings (pgvector).
6. **Later:** draft an application for a chosen posting; nothing is sent without human approval.

Status: planning. Nothing is built yet.

## Principles

**Sources**
- Official endpoints only: ATS job board APIs, RSS feeds and published APIs. No HTML scraping, no LinkedIn.
- Polite scanning: once a day, a delay between requests, a User-Agent with a contact address, and conditional requests (`ETag`, `If-Modified-Since`) so unchanged data is not downloaded again.

**Content**
- Posting text belongs to the employer. A public version shows only facts (title, company, location, date, link), a short summary of its own and a link to the original.
- The evidence for an eligibility decision is at most one quoted sentence, with a link.
- Personal data found in postings (for example a recruiter's name or email) is never published.

**Privacy**
- No personal data lives in this repository: no CV, profile, preferences or contact details. Real values go in environment variables or the database. `profile.example.json` shows the shape with fake data.

## Stack

TypeScript, Cloudflare Workers (cron and API), Neon Postgres with pgvector, React.

## License

MIT
