import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, getBlockId } from '../../scripts/scripts.js';
import { createCard } from '../card/card.js';

/**
 * Dev / local preview: `loadCSS()` uses a stable href; browsers often reuse a stale cards.css.
 * Fetch the file once and inject as `<style>` so author changes always win in the cascade.
 * Set localStorage `summitCardsCssForce` to `1` to enable on non-localhost dev hosts (e.g. LAN IP).
 */
function shouldInjectFreshCardsCss() {
  if (window.localStorage?.getItem('summitCardsCssForce') === '1') return true;
  const { hostname, port } = window.location;
  if (port !== '3000') return false;
  return hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '[::1]'
    || hostname === '0.0.0.0';
}

function scheduleInjectFreshCardsCssOnce() {
  if (window.summitCardsCssInjected) return;
  if (!shouldInjectFreshCardsCss()) return;
  window.summitCardsCssInjected = true;
  const base = window.hlx?.codeBasePath ?? '';
  const url = `${base}/blocks/cards/cards.css?t=${Date.now()}`;
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.text();
    })
    .then((css) => {
      const style = document.createElement('style');
      style.dataset.summitCards = 'inlined';
      style.textContent = css;
      document.head.append(style);
    })
    .catch(() => {
      window.summitCardsCssInjected = false;
    });
}

/** Solutions strip: each card row has an h3 whose text is digits only (01, 02, …). */
function isSolutionsCardsBlock(block) {
  const rows = [...block.children].filter((el) => el.tagName === 'DIV');
  return rows.some((row) => {
    const h3 = row.querySelector('h3');
    return h3 && /^\d+$/.test(h3.textContent.trim());
  });
}

/**
 * Marks the default-content block after `.cards-wrapper` (e.g. "Explore all case studies")
 * so `cards.css` can style the pill without relying on sibling order alone.
 * @param {Element} block The `.cards` block (insights / case-study).
 */
function markInsightsSectionCta(block) {
  if (!block.classList.contains('insights') && !block.classList.contains('case-study')) return;
  const wrap = block.closest('.cards-wrapper');
  if (!wrap) return;
  const next = wrap.nextElementSibling;
  if (!next?.classList?.contains('default-content-wrapper')) return;
  const paragraphs = [...next.querySelectorAll(':scope > p')];
  if (paragraphs.length !== 1) return;
  const [p] = paragraphs;
  const links = [...p.querySelectorAll('a[href]')];
  if (links.length !== 1) return;
  const [a] = links;
  const pText = p.textContent.replace(/\s+/g, ' ').trim();
  const aText = a.textContent.replace(/\s+/g, ' ').trim();
  if (!aText || pText !== aText) return;
  next.classList.add('insights-section-cta');
  a.classList.add('insights-section-cta-link');
}

/**
 * @param {Element} cardsWrapper
 * @returns {Element | null}
 */
function findPreviousDefaultContentWrapper(cardsWrapper) {
  let el = cardsWrapper.previousElementSibling;
  while (el) {
    if (el.classList?.contains('bg-image')) {
      el = el.previousElementSibling;
    } else if (el.classList?.contains('default-content-wrapper')) {
      return el;
    } else {
      el = el.previousElementSibling;
    }
  }
  return null;
}

/**
 * First direct-child `<p>` suitable as a strip label (not a lone-link CTA).
 * A sole `<p>` in the wrapper is always hoisted; with other siblings, treat as label only if short.
 * @param {Element} wrapper
 * @returns {HTMLParagraphElement | null}
 */
function findEyebrowSourceParagraph(wrapper) {
  const children = [...wrapper.children];
  const p = children.find((n) => n.tagName === 'P');
  if (!p) return null;
  if (p.querySelector('a:only-child')) return null;
  const text = p.textContent.replace(/\s+/g, ' ').trim();
  if (!text) return null;
  const sole = children.length === 1 && children[0] === p;
  if (!sole && text.length > 160) return null;
  return /** @type {HTMLParagraphElement} */ (p);
}

/**
 * Move authored label `<p>` from the default block before `cards` into `.cards` as `.cards-eyebrow`
 * (same order as Solutions). Skips `.bg-image` siblings. Does not require `cards-container` on section.
 * @param {Element} block The `.cards` block (Insights / case-study, not Solutions).
 * @returns {HTMLParagraphElement | null}
 */
function hoistSectionEyebrowIntoCardsBlock(block) {
  const cardParent = block.parentElement;
  if (!cardParent?.classList.contains('cards-wrapper')) return null;

  const section = block.closest('.section');
  if (!section) return null;

  const prev = findPreviousDefaultContentWrapper(cardParent);
  if (!prev) return null;

  const sourceP = findEyebrowSourceParagraph(prev);
  if (!sourceP) return null;

  const text = sourceP.textContent.replace(/\s+/g, ' ').trim();
  const label = document.createElement('p');
  label.className = 'cards-eyebrow';
  label.textContent = text;
  moveInstrumentation(sourceP, label);
  sourceP.remove();
  if (prev.childElementCount === 0) {
    prev.remove();
    section.classList.add('insights-eyebrow-inline');
  }

  return label;
}

/**
 * When we synthesize a default eyebrow, remove a preceding duplicate label paragraph so it does not show twice.
 * @param {Element} block
 * @param {HTMLParagraphElement} eyebrowEl
 */
function stripRedundantExternalEyebrow(block, eyebrowEl) {
  const cardParent = block.parentElement;
  if (!cardParent?.classList.contains('cards-wrapper')) return;

  const section = block.closest('.section');
  const prev = findPreviousDefaultContentWrapper(cardParent);
  if (!prev?.classList.contains('default-content-wrapper')) return;

  const firstP = [...prev.children].find((n) => n.tagName === 'P');
  if (!firstP || firstP.querySelector('a:only-child')) return;

  const a = firstP.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
  const b = eyebrowEl.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
  if (a !== b) return;

  firstP.remove();
  if (prev.childElementCount === 0) {
    prev.remove();
    section?.classList.add('insights-eyebrow-inline');
  }
}

/**
 * Remove a stray preceding section that only contains `<p>Insights</p>` (authoring split the label
 * into its own section). The label already lives in `.cards .cards-eyebrow`.
 * @param {Element} block
 */
function removeOrphanInsightsLabelSectionIfBeforeCards(block) {
  const section = block.closest('.section');
  if (!section?.parentElement) return;

  const prevSection = section.previousElementSibling;
  if (!prevSection?.classList.contains('section')) return;

  if (prevSection.querySelector('.block, .cards-wrapper')) return;

  const contentEls = [...prevSection.children].filter(
    (n) => n.nodeType === Node.ELEMENT_NODE && !n.classList.contains('bg-image'),
  );
  if (contentEls.length !== 1) return;

  const wrapper = contentEls[0];
  if (!wrapper.classList.contains('default-content-wrapper')) return;

  const directPs = [...wrapper.children].filter((n) => n.tagName === 'P');
  if (directPs.length !== 1) return;

  const t = directPs[0].textContent.replace(/\s+/g, ' ').trim().toLowerCase();
  if (t !== 'insights') return;

  prevSection.remove();
}

export default function decorate(block) {
  scheduleInjectFreshCardsCssOnce();

  const blockId = getBlockId('cards');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `Cards for ${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Cards');

  const hasNumberedCards = isSolutionsCardsBlock(block);
  const insightsEyebrow = !hasNumberedCards ? hoistSectionEyebrowIntoCardsBlock(block) : null;

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    ul.append(createCard(row));
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';

  // Solutions: numbered h3 rows — full-bleed image cards + "Solutions" eyebrow.
  // Insights (and legacy `case-study`): horizontal case-study strip — class must not apply to Solutions.
  if (hasNumberedCards) {
    const label = document.createElement('p');
    label.className = 'cards-eyebrow';
    label.textContent = 'Solutions';
    block.append(label);
  } else {
    let eyebrow = insightsEyebrow;
    if (!eyebrow) {
      eyebrow = document.createElement('p');
      eyebrow.className = 'cards-eyebrow';
      eyebrow.textContent = 'Insights';
      stripRedundantExternalEyebrow(block, eyebrow);
    }
    block.append(eyebrow);
    if (!block.classList.contains('insights') && !block.classList.contains('case-study')) {
      block.classList.add('insights');
    }
  }

  block.append(ul);

  if (!hasNumberedCards) {
    removeOrphanInsightsLabelSectionIfBeforeCards(block);
    markInsightsSectionCta(block);
  }
}
