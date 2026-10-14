import { matchesStory, rankStories, readCounts, countRead, validCount } from './news-core.js';
import { catalog } from './catalog.js';

const storageKey = 'equality-news:reads:v1';
const storyId = document.body.dataset.story;
if (storyId && catalog.some(story => story.id === storyId)) {
  try { countRead(window.localStorage, window.sessionStorage, storyId); } catch { /* Storage is optional. */ }
}

document.querySelectorAll('details.article-disclosure').forEach(disclosure => {
  disclosure.addEventListener('toggle', () => {
    const label = disclosure.querySelector('[data-disclosure-label]');
    if (label) label.textContent = disclosure.open ? 'Close full story' : 'Learn More';
  });
});

const search = document.getElementById('story-search');
const searchForm = document.getElementById('search-form');
const cards = [...document.querySelectorAll('[data-story-card]')];
const countLabel = document.getElementById('result-count');
const noResults = document.getElementById('no-results');
const clearButton = document.getElementById('clear-search');
const sort = document.getElementById('story-sort');
const filterButtons = [...document.querySelectorAll('[data-category-filter]')];
let selectedCategory = 'All';

function updateResults() {
  if (!search) return;
  let shown = 0;
  const ordered = [...cards].sort((a, b) => sort?.value === 'title'
    ? a.dataset.title.localeCompare(b.dataset.title)
    : b.dataset.date.localeCompare(a.dataset.date) || a.dataset.title.localeCompare(b.dataset.title));
  const grid = document.getElementById('story-grid');
  for (const card of ordered) {
    card.hidden = !matchesStory(card.dataset.search, search.value, card.dataset.category, selectedCategory);
    if (!card.hidden) shown++;
    grid.append(card);
  }
  if (countLabel) countLabel.textContent = shown + (shown === 1 ? ' story' : ' stories');
  if (noResults) noResults.hidden = shown !== 0;
  if (clearButton) clearButton.hidden = !search.value && selectedCategory === 'All';
  for (const button of filterButtons) button.setAttribute('aria-pressed', String(button.dataset.categoryFilter === selectedCategory));
  const params = new URLSearchParams();
  if (search.value.trim()) params.set('q', search.value.trim());
  if (selectedCategory !== 'All') params.set('category', selectedCategory);
  if (sort?.value === 'title') params.set('sort', 'title');
  const query = params.toString();
  history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
}

if (search) {
  const params = new URLSearchParams(location.search);
  search.value = params.get('q') || '';
  if (filterButtons.some(button => button.dataset.categoryFilter === params.get('category'))) selectedCategory = params.get('category');
  if (sort && params.get('sort') === 'title') sort.value = 'title';
  search.addEventListener('input', updateResults);
  searchForm.addEventListener('submit', event => { event.preventDefault(); updateResults(); document.getElementById('all-stories').scrollIntoView({ block: 'start' }); });
  sort?.addEventListener('change', updateResults);
  filterButtons.forEach(button => button.addEventListener('click', () => { selectedCategory = button.dataset.categoryFilter; updateResults(); }));
  clearButton?.addEventListener('click', () => { search.value = ''; selectedCategory = 'All'; updateResults(); search.focus(); });
  document.querySelectorAll('[data-reset-search]').forEach(button => button.addEventListener('click', () => { search.value = ''; selectedCategory = 'All'; updateResults(); search.focus(); }));
  updateResults();
}

function renderPopular() {
  const list = document.getElementById('popular-list');
  if (!list) return;
  let counts = {};
  try { counts = readCounts(window.localStorage, storageKey); } catch { /* Use desk picks. */ }
  const hasReads = catalog.some(story => validCount(counts[story.id]) > 0);
  const note = document.getElementById('popular-note');
  if (note) note.textContent = hasReads ? 'Your most-read stories on this device, followed by desk picks.' : 'Desk picks to start. Your reading activity on this device shapes the list.';
  const nodes = rankStories(catalog, counts).slice(0, 4).map((story, index) => {
    const item = document.createElement('li');
    const number = document.createElement('span'); number.className = 'popular-number'; number.textContent = String(index + 1).padStart(2, '0');
    const link = document.createElement('a'); link.href = 'stories/' + story.id + '.html';
    const category = document.createElement('small'); category.textContent = story.category;
    const title = document.createElement('strong'); title.textContent = story.shortTitle;
    const reads = validCount(counts[story.id]);
    const meta = document.createElement('span'); meta.className = 'popular-meta'; meta.textContent = reads ? reads + (reads === 1 ? ' read on this device' : ' reads on this device') : 'Desk pick';
    link.append(category, title, meta); item.append(number, link); return item;
  });
  list.replaceChildren(...nodes);
}
renderPopular();
window.addEventListener('pageshow', renderPopular);
window.addEventListener('storage', event => { if (event.key === storageKey) renderPopular(); });
