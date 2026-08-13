import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
const schema = fs.readFileSync(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');

describe('NOVIQ 6.1 prelaunch backend contracts', () => {
  it('binds authenticated records to the JWT user', () => {
    expect(source).toContain("profileId: request.user.id");
    expect(source).toContain("where: { profileId: request.user.id }");
    expect(source).toContain("where: { thesis: { profileId: request.user.id } }");
    expect(source).toContain("where: { id: input.thesisId, profileId: request.user.id }");
  });

  it('does not accept client-authored shared Match records in sync', () => {
    const syncSchema = source.slice(source.indexOf('const syncSchema'), source.indexOf('const briefingSchema'));
    expect(syncSchema).not.toContain('matches:');
    expect(source).toContain('const CURATED_MATCHES');
    expect(source).toContain("if (!curated) throw Object.assign(new Error('MATCH_NOT_FOUND')");
  });

  it('uses idempotent client identifiers for durable local-to-cloud sync', () => {
    expect(schema).toContain('clientId    String?  @unique');
    expect(schema).toContain('sourceReplayId String?  @unique');
    expect(source).toContain('where: { clientId: item.clientId }');
    expect(source).toContain("throw Object.assign(new Error('SYNC_CONFLICT')");
  });

  it('keeps sports, AI and push integrations optional for beta identity/data deployment', () => {
    expect(source).toContain("FOOTBALL_DATA_TOKEN: z.string().optional().default('')");
    expect(source).toContain("OPENAI_API_KEY: z.string().optional().default('')");
    expect(source).toContain("VAPID_PUBLIC_KEY: z.string().optional().default('')");
    expect(source).toContain("SPORTS_PROVIDER_NOT_CONFIGURED");
    expect(source).toContain("AI_NOT_CONFIGURED");
    expect(source).toContain("PUSH_NOT_CONFIGURED");
  });

  it('keeps API responses non-cacheable and validates JWT subject as UUID', () => {
    expect(source).toContain("header('cache-control', 'no-store')");
    expect(source).toContain("const id = z.string().uuid().parse(verified.payload.sub)");
  });
});