import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchMock = vi.fn();

vi.mock('@sanity/client', () => ({
  createClient: () => ({ fetch: fetchMock }),
}));

beforeEach(() => {
  fetchMock.mockReset();
  delete process.env.SANITY_PROJECT_ID;
  delete process.env.SANITY_DATASET;
  delete process.env.SANITY_READ_TOKEN;
});

async function loadSchedule() {
  // Re-import each call so module-level state isn't cached across tests
  vi.resetModules();
  const mod = await import('../src/_data/schedule.js');
  return mod.default();
}

describe('schedule data file', () => {
  it('returns rounds when Sanity responds successfully', async () => {
    process.env.SANITY_PROJECT_ID = 'pipebandpredictor';
    process.env.SANITY_DATASET = 'production';
    fetchMock.mockResolvedValue([
      { _id: '1', name: 'British Championships', eventDate: '2026-05-17', roundType: 'band', season: '2026' },
      { _id: '2', name: 'World Pipe Band Championships', eventDate: '2026-08-15', roundType: 'band', season: '2026' },
    ]);
    const result = await loadSchedule();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('British Championships');
    expect(result[1].name).toBe('World Pipe Band Championships');
  });

  it('uses the built-in project defaults when env vars are unset', async () => {
    fetchMock.mockResolvedValue([
      { _id: '1', name: 'British Championships', eventDate: '2026-05-17', roundType: 'band' },
    ]);
    const result = await loadSchedule();
    expect(fetchMock).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('British Championships');
  });

  it('returns [] and does not throw when Sanity fetch fails', async () => {
    process.env.SANITY_PROJECT_ID = 'pipebandpredictor';
    process.env.SANITY_DATASET = 'production';
    fetchMock.mockRejectedValue(new Error('network down'));
    const result = await loadSchedule();
    expect(result).toEqual([]);
  });

  it('flags the Worlds as flagship and a normal major as not', async () => {
    process.env.SANITY_PROJECT_ID = 'pipebandpredictor';
    process.env.SANITY_DATASET = 'production';
    fetchMock.mockResolvedValue([
      { _id: '1', name: 'British Championships' },
      { _id: '2', name: 'World Pipe Band Championships' },
    ]);
    const result = await loadSchedule();
    expect(result[0].flagship).toBe(false);
    expect(result[1].flagship).toBe(true);
  });

  it('derives status soon / open / locked / done from the prediction window', async () => {
    process.env.SANITY_PROJECT_ID = 'pipebandpredictor';
    process.env.SANITY_DATASET = 'production';

    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const isoDate = timestamp => new Date(timestamp).toISOString().slice(0, 10);

    fetchMock.mockResolvedValue([
      {
        _id: 'soon',
        name: 'Soon round',
        eventDate: isoDate(now + 7 * oneDay),
        predictionsOpenAt: new Date(now + oneDay).toISOString(),
        predictionsCloseAt: new Date(now + 5 * oneDay).toISOString(),
      },
      {
        _id: 'open',
        name: 'Open round',
        eventDate: isoDate(now + 7 * oneDay),
        predictionsOpenAt: new Date(now - oneDay).toISOString(),
        predictionsCloseAt: new Date(now + oneDay).toISOString(),
      },
      {
        _id: 'locked',
        name: 'Locked round',
        eventDate: isoDate(now + 7 * oneDay),
        predictionsOpenAt: new Date(now - 5 * oneDay).toISOString(),
        predictionsCloseAt: new Date(now - oneDay).toISOString(),
      },
      {
        _id: 'done',
        name: 'Done round',
        eventDate: isoDate(now - 2 * oneDay),
        predictionsOpenAt: new Date(now - 7 * oneDay).toISOString(),
        predictionsCloseAt: new Date(now - 5 * oneDay).toISOString(),
      },
    ]);

    const result = await loadSchedule();
    const statusById = Object.fromEntries(result.map(round => [round._id, round.status]));
    expect(statusById.soon).toBe('soon');
    expect(statusById.open).toBe('open');
    expect(statusById.locked).toBe('locked');
    expect(statusById.done).toBe('done');
  });

  it('hides older past rounds but keeps the most recent past round visible', async () => {
    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const isoDate = timestamp => new Date(timestamp).toISOString().slice(0, 10);

    fetchMock.mockResolvedValue([
      { _id: 'old', name: 'Old major', eventDate: isoDate(now - 10 * oneDay) },
      { _id: 'recent', name: 'Recent major', eventDate: isoDate(now - 2 * oneDay) },
      { _id: 'next', name: 'Next major', eventDate: isoDate(now + 5 * oneDay) },
    ]);

    const result = await loadSchedule();
    const hiddenById = Object.fromEntries(result.map(round => [round._id, round.hiddenPast]));
    expect(hiddenById.old).toBe(true);
    expect(hiddenById.recent).toBe(false);
    expect(hiddenById.next).toBe(false);
  });

});
