(function () {
  const CONTENT_BASE = '../content/';

  const appEl = document.getElementById('app');
  let manifestCache = null;

  async function loadManifest() {
    if (manifestCache) return manifestCache;
    const res = await fetch(CONTENT_BASE + 'index.json');
    const data = await res.json();
    manifestCache = data.entries || [];
    return manifestCache;
  }

  async function loadStory(file) {
    const res = await fetch(CONTENT_BASE + file);
    return res.json();
  }

  function domainLabel(domain) {
    return domain ? domain.charAt(0).toUpperCase() + domain.slice(1) : '';
  }

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined) continue;
        if (k === 'class') node.className = v;
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v);
      }
    }
    children.flat().forEach((c) => {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function toggleReveal(node) {
    if (node.classList.contains('visible')) {
      node.classList.remove('visible');
      window.setTimeout(() => {
        if (!node.classList.contains('visible')) node.style.display = 'none';
      }, 250);
    } else {
      node.style.display = 'block';
      void node.offsetWidth;
      requestAnimationFrame(() => node.classList.add('visible'));
    }
  }

  async function renderLibrary() {
    appEl.innerHTML = '';
    const entries = await loadManifest();
    const domains = Array.from(new Set(entries.map((e) => e.domain)));

    let activeFilter = 'all';
    const filterBar = el('div', { class: 'filter-bar' });
    const cardsWrap = el('div', { class: 'card-grid' });

    function renderFilters() {
      filterBar.innerHTML = '';
      filterBar.appendChild(
        el('button', {
          class: 'filter-btn' + (activeFilter === 'all' ? ' active' : ''),
          onclick: () => { activeFilter = 'all'; renderFilters(); renderCards(); },
        }, 'All')
      );
      domains.forEach((d) => {
        filterBar.appendChild(
          el('button', {
            class: 'filter-btn' + (activeFilter === d ? ' active' : ''),
            onclick: () => { activeFilter = d; renderFilters(); renderCards(); },
          }, domainLabel(d))
        );
      });
    }

    function renderCards() {
      cardsWrap.innerHTML = '';
      const filtered = activeFilter === 'all' ? entries : entries.filter((e) => e.domain === activeFilter);
      if (filtered.length === 0) {
        cardsWrap.appendChild(el('p', { class: 'empty' }, 'No stories in this domain yet.'));
        return;
      }
      filtered.forEach((entry) => {
        cardsWrap.appendChild(
          el('a', { class: 'card', href: `#/story/${entry.file}`, 'data-domain': entry.domain },
            entry.image ? el('img', { class: 'card-thumb', src: entry.image, alt: '' }) : null,
            el('div', { class: 'card-body' },
              el('span', { class: 'chip' }, domainLabel(entry.domain)),
              el('h2', { class: 'card-title' }, entry.title),
              el('span', { class: 'card-level' }, entry.level)
            )
          )
        );
      });
    }

    renderFilters();
    renderCards();

    appEl.appendChild(
      el('div', { class: 'library' },
        el('h1', { class: 'library-title' }, 'Library'),
        filterBar,
        cardsWrap
      )
    );
  }

  function buildSentenceNode(line) {
    const sentence = el('span', { class: 'sentence' });
    line.words.forEach((word, idx) => {
      if (idx > 0) sentence.appendChild(document.createTextNode(' '));
      const display = word.leading + word.text + word.trailing;
      if (word.translation) {
        const bubble = el('span', { class: 'word-bubble' }, word.translation);
        bubble.style.display = 'none';
        const btn = el('button', {
          class: 'word',
          type: 'button',
          onclick: (evt) => { evt.stopPropagation(); toggleReveal(bubble); },
        }, display);
        sentence.appendChild(el('span', { class: 'word-wrap' }, btn, bubble));
      } else {
        sentence.appendChild(document.createTextNode(display));
      }
    });
    return sentence;
  }

  async function renderStory(file) {
    appEl.innerHTML = '';
    const [entries, story] = await Promise.all([loadManifest(), loadStory(file)]);
    const entry = entries.find((e) => e.file === file);
    const domain = story.domain || (entry && entry.domain) || '';

    const container = el('div', { class: 'story', 'data-domain': domain });
    container.appendChild(el('a', { class: 'back-link', href: '#/' }, '← Library'));
    container.appendChild(
      el('header', { class: 'story-header' },
        el('span', { class: 'chip' }, domainLabel(domain)),
        el('h1', { class: 'story-title' }, story.title),
        el('span', { class: 'story-level' }, story.level)
      )
    );
    if (story.image) {
      container.appendChild(el('img', { class: 'story-image', src: story.image, alt: '' }));
    }

    const linesWrap = el('div', { class: 'lines' });
    story.lines.forEach((line) => {
      const translation = el('div', { class: 'line-translation' }, line.translation);
      translation.style.display = 'none';

      const spanishRow = el('div', {
        class: 'line-spanish',
        onclick: () => toggleReveal(translation),
      });
      if (line.speaker) {
        spanishRow.appendChild(el('span', { class: 'speaker' }, line.speaker + ':'));
      }
      spanishRow.appendChild(buildSentenceNode(line));

      const lineEl = el('div', { class: 'line' + (line.speaker ? ' has-speaker' : '') },
        spanishRow,
        translation
      );
      linesWrap.appendChild(lineEl);
    });
    container.appendChild(linesWrap);

    appEl.appendChild(container);
  }

  function route() {
    const hash = window.location.hash || '#/';
    const storyMatch = hash.match(/^#\/story\/(.+)$/);
    if (storyMatch) {
      renderStory(decodeURIComponent(storyMatch[1]));
    } else {
      renderLibrary();
    }
  }

  window.addEventListener('hashchange', route);
  route();
})();
