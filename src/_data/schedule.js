import { createClient } from '@sanity/client';

const QUERY = `*[_type == "round" && eventDate >= now()] | order(eventDate asc) {
  _id,
  name,
  roundType,
  eventDate,
  predictionsOpenAt,
  predictionsCloseAt,
  "season": season->name
}`;

function isMajorEvent(name) {
  return /world/i.test(name || '');
}

export default async function () {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;

  if (!projectId || !dataset) {
    return [];
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-12-01',
    useCdn: true,
    token: process.env.SANITY_READ_TOKEN || undefined,
  });

  try {
    const rounds = await client.fetch(QUERY);
    return (rounds || []).map(r => ({ ...r, isMajor: isMajorEvent(r.name) }));
  } catch (err) {
    console.warn('[schedule] Sanity fetch failed, returning empty schedule:', err.message);
    return [];
  }
}
