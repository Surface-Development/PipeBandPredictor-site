import { createClient } from '@sanity/client';

// Public project identifiers - not secrets (they ship in any Sanity-backed
// frontend). The production dataset is public-read, so no token is needed.
// Still overridable via env vars if we ever point at a different project.
const PROJECT_ID = '5c4h9kqc';
const DATASET = 'production';

const QUERY = `*[_type == "round" && season->isActive == true] | order(eventDate asc) {
  _id,
  name,
  roundType,
  eventDate,
  predictionsOpenAt,
  predictionsCloseAt,
  "season": season->name,
  "seasonYear": season->year
}`;

// Build-time status from the prediction window; the client refines it live on load.
function computeStatus(round, now) {
  const open = round.predictionsOpenAt ? new Date(round.predictionsOpenAt).getTime() : null;
  const close = round.predictionsCloseAt ? new Date(round.predictionsCloseAt).getTime() : null;
  const eventEnd = round.eventDate ? new Date(`${round.eventDate}T23:59:59`).getTime() : null;

  if (eventEnd !== null && now > eventEnd) return 'done';
  if (open !== null && now < open) return 'soon';
  if (open !== null && close !== null && now >= open && now <= close) return 'open';
  if (close !== null && now > close) return 'locked';
  return 'soon';
}

export default async function () {
  const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID || PROJECT_ID,
    dataset: process.env.SANITY_DATASET || DATASET,
    apiVersion: '2024-12-01',
    useCdn: true,
    token: process.env.SANITY_READ_TOKEN || undefined,
  });

  try {
    const rounds = await client.fetch(QUERY);
    const now = Date.now();
    const enriched = (rounds || []).map(round => ({
      ...round,
      status: computeStatus(round, now),
      flagship: /\bworld/i.test(round.name || ''),
    }));

    // Collapse every past round except the most recent one behind a toggle.
    const lastDoneIndex = enriched.reduce(
      (latest, round, index) => (round.status === 'done' ? index : latest),
      -1,
    );
    return enriched.map((round, index) => ({
      ...round,
      hiddenPast: round.status === 'done' && index !== lastDoneIndex,
    }));
  } catch (err) {
    console.warn('[schedule] Sanity fetch failed, returning empty schedule:', err.message);
    return [];
  }
}
