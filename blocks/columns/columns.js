import { getBlockId } from '../../scripts/scripts.js';

/** Collapse whitespace and strip trailing periods for phrase matching */
function normalizeHeadlineMatch(text) {
  let t = text.replace(/\s+/g, ' ').trim();
  while (t.endsWith('.')) {
    t = t.slice(0, -1);
  }
  return t.toLowerCase();
}

const SHELVES_HEADLINE_KEY = 'not on our shelves? not a problem';

/** Matches `blockQualifiesForLegacyImageAspect` / stable heading id in decorate. */
const LEGACY_HEADLINE_KEY = 'your legacy starts here';

/** Known full-<em> bracketed headlines → fixed rows (CSS nowrap per row). */
const BRACKETED_HEADLINE_ROWS = [
  {
    key: 'meet athletes in the moments that move them',
    lines: ['meet athletes', 'in the', 'moments that', 'move them.'],
  },
  {
    key: SHELVES_HEADLINE_KEY,
    lines: ['not on our', 'shelves?', 'not a problem.'],
  },
  {
    key: LEGACY_HEADLINE_KEY,
    lines: ['YOUR LEGACY', 'STARTS HERE.'],
  },
];

const BRAND_PARTNERS_STAT_KEY = '200+ brand partners across every industry from sport to cpg';

/** Legacy CTA image — Squarespace 2200×2000; scope with block class `columns-legacy` (auto or author). */
function blockQualifiesForLegacyImageAspect(block) {
  return [...block.querySelectorAll('h2')].some((h2) => {
    const key = normalizeHeadlineMatch(h2.textContent);
    return key === LEGACY_HEADLINE_KEY;
  });
}

/** Brand partners split layout + image sizing — scope with block class `promo` (auto or author). */
function blockQualifiesForPromoVariant(block) {
  return [...block.querySelectorAll('h2')].some((h2) => {
    const key = normalizeHeadlineMatch(h2.textContent);
    return key === SHELVES_HEADLINE_KEY || key === BRAND_PARTNERS_STAT_KEY;
  });
}

/**
 * Brand block — comp: `200` + smaller `+`; right stack; grey pill on “ACROSS” only.
 */
function applyBrandPartnersSourceMarkup(h2) {
  if (h2.classList.contains('bracketed') || h2.classList.contains('columns-brand-headline')) return;
  if (h2.querySelector('.columns-brand-row')) return;
  const key = normalizeHeadlineMatch(h2.textContent);
  if (key !== BRAND_PARTNERS_STAT_KEY) return;

  h2.replaceChildren();
  h2.classList.add('columns-brand-headline');

  const row = document.createElement('span');
  row.className = 'columns-brand-row';

  const num = document.createElement('span');
  num.className = 'columns-brand-num sqsrte-text-color--accent';

  const figures = document.createElement('span');
  figures.className = 'columns-brand-figures';
  figures.textContent = '200';

  const plus = document.createElement('span');
  plus.className = 'columns-brand-plus';
  plus.textContent = '+';

  num.append(figures, plus);

  const lines = document.createElement('span');
  lines.className = 'columns-brand-lines';

  const lineAccent = document.createElement('span');
  lineAccent.className = 'columns-brand-line columns-brand-line-tight sqsrte-text-color--accent';
  lineAccent.textContent = 'BRAND PARTNERS';

  const lineMid = document.createElement('span');
  lineMid.className = 'columns-brand-line columns-brand-line-secondary columns-brand-line-tight columns-brand-line-mid';

  const acrossPill = document.createElement('span');
  acrossPill.className = 'columns-brand-across-pill';
  acrossPill.textContent = 'ACROSS';

  const industryRest = document.createElement('span');
  industryRest.className = 'columns-brand-mid-rest';
  industryRest.textContent = 'EVERY INDUSTRY';

  lineMid.append(acrossPill, industryRest);

  const lineBot = document.createElement('span');
  lineBot.className = 'columns-brand-line columns-brand-line-secondary columns-brand-line-tight';
  lineBot.textContent = 'FROM SPORT TO CPG';

  lines.append(lineAccent, lineMid, lineBot);
  row.append(num, lines);
  h2.appendChild(row);
}

/**
 * When the headline matches a known line, split into non-wrapping rows so words
 * are not broken mid-line. Skipped if the author already used br or spans exist.
 */
function applyKnownBracketedLineBreaks(em) {
  if (em.querySelector('br') || em.querySelector('.columns-headline-line')) return;
  const key = normalizeHeadlineMatch(em.textContent);
  const config = BRACKETED_HEADLINE_ROWS.find((row) => row.key === key);
  if (!config) return;
  em.replaceChildren();
  config.lines.forEach((line) => {
    const span = document.createElement('span');
    span.className = 'columns-headline-line';
    span.textContent = line;
    em.appendChild(span);
  });
}

const PHRASING_WRAP_TAGS = new Set(['STRONG', 'SPAN', 'B', 'I']);

/**
 * Bracket CSS requires a direct child <em> that holds the full headline (Title / RTE often omit <em>).
 * Do not wrap the brand-stat headline — promo JS replaces that node tree.
 * @param {HTMLHeadingElement} h2
 */
function ensureEmWrapForBracketedHeadline(h2) {
  if (h2.classList.contains('columns-brand-headline')) return;
  const merged = h2.textContent.replace(/\s+/g, ' ').trim();
  if (!merged) return;
  if (normalizeHeadlineMatch(merged) === BRAND_PARTNERS_STAT_KEY) return;

  const directEm = h2.querySelector(':scope > em');
  if (directEm) {
    const emText = directEm.textContent.replace(/\s+/g, ' ').trim();
    if (emText === merged) return;
    return;
  }

  const elChildren = [...h2.children];
  if (elChildren.length === 0) {
    const em = document.createElement('em');
    em.textContent = merged;
    h2.replaceChildren(em);
    return;
  }
  if (elChildren.length !== 1) return;
  const only = elChildren[0];
  if (only.tagName === 'EM' || !PHRASING_WRAP_TAGS.has(only.tagName)) return;
  const inner = only.textContent.replace(/\s+/g, ' ').trim();
  if (inner !== merged) return;
  const em = document.createElement('em');
  em.append(...only.childNodes);
  only.replaceWith(em);
}

export default function decorate(block) {
  const blockId = getBlockId('columns');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `columns-${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Columns');

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture') || col.querySelector(':scope > img');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture/image is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  if (!block.classList.contains('promo') && blockQualifiesForPromoVariant(block)) {
    block.classList.add('promo');
  }

  if (!block.classList.contains('columns-legacy') && blockQualifiesForLegacyImageAspect(block)) {
    block.classList.add('columns-legacy');
  }

  // Full-line <em> headlines → design-comp treatment (brackets + caps stack).
  // Normalize whitespace so authored line breaks / spaces still match.
  block.querySelectorAll('h2').forEach((h2) => {
    ensureEmWrapForBracketedHeadline(h2);
  });

  block.querySelectorAll('h2').forEach((h2) => {
    const em = h2.querySelector(':scope > em');
    if (!em) return;
    const h2Text = h2.textContent.replace(/\s+/g, ' ').trim();
    const emText = em.textContent.replace(/\s+/g, ' ').trim();
    if (emText !== h2Text) return;
    h2.classList.add('bracketed');
    applyKnownBracketedLineBreaks(em);
  });

  block.querySelectorAll('h2').forEach((h2) => {
    if (
      h2.classList.contains('bracketed')
      && normalizeHeadlineMatch(h2.textContent) === LEGACY_HEADLINE_KEY
      && !h2.id
    ) {
      h2.id = 'your-legacy-starts-here';
    }
  });

  if (block.classList.contains('promo')) {
    block.querySelectorAll('h2').forEach((h2) => {
      applyBrandPartnersSourceMarkup(h2);
    });
  }

  // Alternate column order: even columns blocks get image on the right
  const allColumns = [...document.querySelectorAll('.columns')];
  const index = allColumns.indexOf(block);
  if (index % 2 === 1) {
    block.classList.add('columns-reversed');
  }
}
