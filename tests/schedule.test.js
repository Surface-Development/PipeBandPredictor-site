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

  it('returns [] when env vars are missing', async () => {
    const result = await loadSchedule();
    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns [] and does not throw when Sanity fetch fails', async () => {
    process.env.SANITY_PROJECT_ID = 'pipebandpredictor';
    process.env.SANITY_DATASET = 'production';
    fetchMock.mockRejectedValue(new Error('network down'));
    const result = await loadSchedule();
    expect(result).toEqual([]);
  });

});
