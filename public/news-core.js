export function normalize(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function matchesStory(searchText, query, category, selectedCategory) {
  if (selectedCategory !== 'All' && category !== selectedCategory) return false;
  const text = normalize(searchText);
  return normalize(query).split(/\s+/).filter(Boolean).every(word => text.includes(word));
}

export function rankStories(stories, counts = {}) {
  return [...stories].sort((a, b) => (validCount(counts[b.id]) - validCount(counts[a.id])) || a.pickRank - b.pickRank);
}

export function validCount(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function readCounts(storage, key) {
  try {
    const data = JSON.parse(storage.getItem(key) || '{}');
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    return Object.fromEntries(Object.entries(data).filter(([id, count]) => /^[a-z0-9-]+$/.test(id) && validCount(count) === count));
  } catch { return {}; }
}

export function countRead(storage, session, id) {
  const key = 'equality-news:reads:v1';
  const counts = readCounts(storage, key);
  try {
    const sessionKey = 'equality-news:read:' + id;
    if (!session.getItem(sessionKey)) {
      counts[id] = validCount(counts[id]) + 1;
      storage.setItem(key, JSON.stringify(counts));
      session.setItem(sessionKey, '1');
    }
  } catch { /* Reading and navigation still work when storage is blocked. */ }
  return counts;
}
