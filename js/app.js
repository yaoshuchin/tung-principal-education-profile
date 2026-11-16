const BACKUP_URL = 'https://yaoshuchin.github.io/tung-principal-education-profile/';
const PRIMARY_URL = 'https://is.gd/Htl7hl';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function loadPhotoFixes() {
  if (document.querySelector('link[data-photo-fixes]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/photo-fixes.css';
  link.dataset.photoFixes = 'true';
  document.head.append(link);
}

function applyPreferences() {
  const theme = localStorage.getItem('new2-theme') || 'light';
  const size = localStorage.getItem('new2-size') || 'medium';
  document.body.dataset.theme = theme;
  document.body.dataset.size = size;
  $$('[data-theme]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.theme === theme)));
  $$('[data-size]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.size === size)));
}

function bindPreferences() {
  $$('[data-theme]').forEach((button) => button.addEventListener('click', () => {
    localStorage.setItem('new2-theme', button.dataset.theme);
    applyPreferences();
  }));
  $$('[data-size]').forEach((button) => button.addEventListener('click', () => {
    localStorage.setItem('new2-size', button.dataset.size);
    applyPreferences();
  }));
  const menu = $('.menu');
  const nav = $('.nav');
  menu?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
}

function captionFor(record) {
  return record.caption || `教育現場照片 · PDF 第 ${record.page} 頁`;
}

function usablePhotos(records) {
  const browserFormats = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);
  return records.filter((record) => record.complete === true && record.quality === 'verified' && record.width * record.height >= 50000 && Math.max(record.width, record.height) <= 1200 && browserFormats.has(record.file.split('.').pop().toLowerCase()));
}

function makeFigure(record, loading = 'lazy') {
  const figure = document.createElement('figure');
  figure.dataset.category = record.category;
  const loadingAttribute = loading ? ` loading="${loading}"` : '';
  figure.innerHTML = `<img src="${record.file}" alt="${captionFor(record)}"${loadingAttribute}><figcaption>${captionFor(record)}</figcaption>`;
  return figure;
}

function renderStrip(records, category, target) {
  const candidates = records.filter((record) => record.category === category).slice(0, 5);
  target.replaceChildren(...candidates.map((record) => makeFigure(record, '')));
}

function renderHome(data, records) {
  const photos = usablePhotos(records);
  const portrait = photos.filter((record) => record.category === 'profile-awards' && record.page <= 5).sort((a, b) => (b.width * b.height) - (a.width * a.height))[0] || photos.find((record) => record.category === 'profile-awards');
  const portraitElement = $('[data-photo-single]');
  if (portrait && portraitElement) portraitElement.src = portrait.file;
  const stats = $('[data-stats]');
  if (stats) stats.innerHTML = data.stats.map((item) => `<div class="stat"><strong>${item.value}</strong><span>${item.label}</span></div>`).join('');
  const pillars = $('[data-pillars]');
  if (pillars) pillars.innerHTML = data.pillars.map((item, index) => `<article class="pillar"><b>0${index + 1}</b><h3>${item.label}</h3><p>${item.description}</p><a href="gallery.html#${item.category}">查看對應照片 →</a></article>`).join('');
  const stories = $('[data-stories]');
  if (stories) stories.innerHTML = data.stories.map((item, index) => `<article class="story-card"><b>0${index + 1} / EDUCATION STORY</b><h3>${item.title}</h3><p>${item.text}</p><a class="text-link" href="gallery.html#${item.category}">查看照片 →</a></article>`).join('');
  const timeline = $('[data-timeline]');
  if (timeline) timeline.innerHTML = data.timeline.map((item) => `<article class="timeline-item"><b>${item.year}</b><div><h3>${item.title}</h3><p>${item.text}</p></div></article>`).join('');
  const awards = $('[data-awards]');
  if (awards) awards.innerHTML = data.awards.map((item, index) => `<div><b>${index < 4 ? ['115','114','112','112'][index] : '歷年'}</b><span>${item}</span></div>`).join('');
  const vision = $('[data-vision]');
  if (vision) vision.innerHTML = data.vision.map((item, index) => `<article class="vision-card"><b>0${index + 1}</b><p>${item}</p></article>`).join('');
  const commitments = $('[data-commitments]');
  if (commitments) commitments.innerHTML = data.commitments.map((item) => `<li>${item}</li>`).join('');
  $$('[data-photo-strip]').forEach((target) => renderStrip(photos, target.dataset.photoStrip, target));
}

function renderRecord(records) {
  $$('[data-photo-strip]').forEach((target) => renderStrip(usablePhotos(records), target.dataset.photoStrip, target));
}

function renderGallery(records) {
  const gallery = $('[data-gallery]');
  if (!gallery) return;
  const cards = usablePhotos(records).map(makeFigure);
  cards.forEach((card) => card.classList.add('gallery-card'));
  gallery.replaceChildren(...cards);
  const buttons = $$('[data-filter]');
  const filter = (value) => {
    buttons.forEach((button) => button.classList.toggle('active', button.dataset.filter === value));
    cards.forEach((card) => card.classList.toggle('is-hidden', value !== 'all' && card.dataset.category !== value));
  };
  buttons.forEach((button) => button.addEventListener('click', () => {
    const value = button.dataset.filter;
    history.replaceState(null, '', value === 'all' ? 'gallery.html' : `gallery.html#${value}`);
    filter(value);
  }));
  const hash = window.location.hash.slice(1);
  filter(buttons.some((button) => button.dataset.filter === hash) ? hash : 'all');
}

function renderShare() {
  const primary = $('[data-primary-url]');
  const backup = $('[data-backup-url]');
  if (primary) primary.textContent = PRIMARY_URL;
  if (backup) backup.textContent = BACKUP_URL;
  $$('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
    const value = button.dataset.copy === 'primary' ? PRIMARY_URL : BACKUP_URL;
    await navigator.clipboard.writeText(value);
    button.textContent = '已複製';
    button.classList.add('copied');
    setTimeout(() => { button.textContent = button.dataset.copy === 'primary' ? '複製主要連結' : '複製備用連結'; button.classList.remove('copied'); }, 1600);
  }));
}

async function init() {
  loadPhotoFixes();
  applyPreferences();
  bindPreferences();
  const [content, photoIndex] = await Promise.all([
    fetch('data/content.json').then((response) => response.json()),
    fetch('data/photo-index.json').then((response) => response.json()),
  ]);
  renderHome(content, photoIndex);
  renderRecord(photoIndex);
  renderGallery(photoIndex);
  renderShare();
}

init().catch((error) => console.error('NEW2 site data loading failed', error));
