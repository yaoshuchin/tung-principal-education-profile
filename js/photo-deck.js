const deck$ = (selector, root = document) => root.querySelector(selector);

function renderDeck(deck) {
  const index = deck$('[data-deck-index]');
  const content = deck$('[data-deck-content]');
  deck$('[data-theme-count]').textContent = deck.length;
  deck$('[data-photo-count]').textContent = deck.reduce((sum, item) => sum + item.photoCount, 0);
  index.replaceChildren(...deck.map((item, number) => {
    const link = document.createElement('a');
    link.href = `#theme-${item.page}`;
    link.innerHTML = `<b>${String(number + 1).padStart(2, '0')}</b><span>${item.title}</span><small>原簡報第 ${item.page} 頁 · ${item.photoCount} 張</small>`;
    return link;
  }));
  content.replaceChildren(...deck.map((item, number) => {
    const section = document.createElement('article');
    section.className = 'deck-slide';
    section.id = `theme-${item.page}`;
    section.innerHTML = `
      <div class="slide-kicker"><span>${String(number + 1).padStart(2, '0')} / ${String(deck.length).padStart(2, '0')}</span><span>原簡報第 ${item.page} 頁</span></div>
      <div class="slide-heading"><div><p class="eyebrow">${item.themeCategory.replaceAll('-', ' ').toUpperCase()} / EDUCATION THEME</p><h2>${item.title}</h2><p class="slide-summary">${item.summary}</p></div><figure class="slide-overview"><img data-lightbox="true" src="${item.overviewImage}" alt="${item.title}原簡報頁概覽"><figcaption>原簡報頁概覽｜點擊可放大</figcaption></figure></div>
      <div class="analysis-grid"><div><b>主題分析</b><p>${item.analysis}</p></div><div><b>簡報說明</b><p>${item.speakerNotes}</p></div></div>
      <div class="slide-photos">${item.photos.map((photo) => `<figure><img data-lightbox="true" src="${photo.publicFile}" alt="${photo.slideCaption}" loading="lazy"><figcaption>${photo.slideCaption}</figcaption></figure>`).join('')}</div>`;
    return section;
  }));
}

fetch('data/photo-deck.json').then((response) => response.json()).then(renderDeck).catch((error) => console.error('photo deck loading failed', error));
