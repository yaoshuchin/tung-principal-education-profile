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
  link.onerror = () => {
    const style = document.createElement('style');
    style.dataset.photoFixesFallback = 'true';
    style.textContent = 'body[data-size="medium"]{--body:20px}body[data-size="large"]{--body:22px}body[data-size="xlarge"]{--body:25px}.hero-portrait{width:min(470px,100%)!important}.hero-portrait img{height:460px!important}.photo-strip{grid-template-columns:repeat(4,1fr)!important}.photo-strip img{height:220px!important}.record-photos{grid-template-columns:repeat(4,1fr)!important}.record-photos img{height:210px!important}.gallery-grid{grid-template-columns:repeat(3,1fr)!important}.gallery-card img{height:320px!important;cursor:zoom-in}.hero-portrait img,.photo-strip img,.record-photos img,.gallery-card img{object-fit:contain!important;object-position:center!important;background:var(--soft,#f6f3eb)}.section-tabs{position:sticky;top:78px;z-index:8;border-bottom:1px solid var(--line);background:var(--bg)}.tab-level-one,.tab-level-two{width:min(1180px,90vw);margin:auto;display:flex;gap:8px;overflow-x:auto}.tab-level-one{padding:10px 0 6px}.tab-level-two{border-top:1px solid var(--line);padding:6px 0 9px;gap:18px}.tab-level-one a,.tab-level-two a,.tab-level-two span{white-space:nowrap;font-size:14px;font-weight:800;padding:5px 11px}.lightbox-modal{position:fixed;inset:0;z-index:30;display:grid;place-items:center;padding:5vh 5vw;background:rgba(10,26,33,.9);opacity:0;pointer-events:none}.lightbox-modal.is-open{opacity:1;pointer-events:auto}.lightbox-inner{max-width:94vw;max-height:90vh;text-align:center}.lightbox-inner img{display:block;max-width:100%;max-height:78vh;width:auto;height:auto;object-fit:contain;margin:auto}.lightbox-inner p{color:#fff}.lightbox-close{position:absolute;top:18px;right:28px;border:0;background:transparent;color:#fff;font-size:42px}';
    document.head.append(style);
  };
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

function installSectionTabs() {
  if ($('.section-tabs')) return;
  const tabs = document.createElement('nav');
  tabs.className = 'section-tabs';
  tabs.setAttribute('aria-label', '網站二層導覽');
  tabs.innerHTML = `
    <div class="tab-level-one">
      <a class="tab-active" href="index.html#story">人物</a>
      <a href="index.html#flywheel">教育飛輪</a>
      <a href="index.html#journey">完整歷程</a>
      <a href="index.html#awards">教育成果</a>
      <a href="record.html">完整檔案</a>
      <a href="gallery.html">照片庫</a>
      <a href="photo-deck.html">照片主題集</a>
      <a href="share.html">QR 分享</a>
    </div>
    <div class="tab-level-two">
      <span>快速前往</span>
      <a href="index.html#story">教育信念</a>
      <a href="index.html#flywheel">四大飛輪</a>
      <a href="index.html#journey">三個故事</a>
      <a href="index.html#awards">主要獎項</a>
      <a href="record.html#career">行政歷程</a>
      <a href="gallery.html#sport-international">運動／國際照片</a>
      <a href="photo-deck.html#theme-19">冠軍與國際主題</a>
    </div>`;
  document.querySelector('header')?.after(tabs);
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
  figure.innerHTML = `<img data-lightbox="true" src="${record.file}" alt="${captionFor(record)}"${loadingAttribute}><figcaption>${captionFor(record)}</figcaption>`;
  return figure;
}

function bindLightbox() {
  if ($('[data-lightbox-modal]')) return;
  const modal = document.createElement('div');
  modal.className = 'lightbox-modal';
  modal.dataset.lightboxModal = 'true';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', '放大照片');
  modal.innerHTML = '<button class="lightbox-close" type="button" aria-label="關閉放大照片">×</button><div class="lightbox-inner"><img alt=""><p></p></div>';
  document.body.append(modal);
  const close = () => { modal.classList.remove('is-open'); document.body.classList.remove('lightbox-open'); };
  modal.querySelector('.lightbox-close').addEventListener('click', close);
  modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  document.addEventListener('click', (event) => {
    const image = event.target.closest('img[data-lightbox]');
    if (!image) return;
    event.preventDefault();
    const largeImage = modal.querySelector('img');
    largeImage.src = image.currentSrc || image.src;
    largeImage.alt = image.alt;
    modal.querySelector('p').textContent = image.alt;
    modal.classList.add('is-open');
    document.body.classList.add('lightbox-open');
  });
}

function renderStrip(records, category, target) {
  const candidates = records.filter((record) => record.category === category).slice(0, 5);
  target.replaceChildren(...candidates.map((record) => makeFigure(record, '')));
}

function renderHome(data, records) {
  const photos = usablePhotos(records);
  const portrait = photos.filter((record) => record.category === 'profile-awards' && record.page <= 5).sort((a, b) => (b.width * b.height) - (a.width * a.height))[0] || photos.find((record) => record.category === 'profile-awards');
  const portraitElement = $('[data-photo-single]');
  if (portrait && portraitElement) {
    portraitElement.src = portrait.file;
    portraitElement.dataset.lightbox = 'true';
  }
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
  installSectionTabs();
  const [content, photoIndex] = await Promise.all([
    fetch('data/content.json').then((response) => response.json()),
    fetch('data/photo-index.json').then((response) => response.json()),
  ]);
  renderHome(content, photoIndex);
  renderRecord(photoIndex);
  renderGallery(photoIndex);
  renderShare();
  bindLightbox();
}

init().catch((error) => console.error('NEW2 site data loading failed', error));
