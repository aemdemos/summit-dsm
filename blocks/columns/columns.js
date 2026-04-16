import { getBlockId } from '../../scripts/scripts.js';

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

  // Mark headings where <em> wraps ALL the text (full-italic bracket pattern)
  block.querySelectorAll('h2').forEach((h2) => {
    const em = h2.querySelector(':scope > em');
    if (em && em.textContent.trim() === h2.textContent.trim()) {
      h2.classList.add('bracketed');
    }
  });

  // Restructure non-bracketed h2 with <em> into "big number + stacked text" layout
  // e.g. "200+ BRAND PARTNERS <em>ACROSS EVERY...</em>" → inline-flex layout
  block.querySelectorAll('h2:not(.bracketed)').forEach((h2) => {
    const em = h2.querySelector(':scope > em');
    if (!em) return;
    const beforeEm = h2.firstChild;
    if (!beforeEm || beforeEm.nodeType !== Node.TEXT_NODE) return;
    const text = beforeEm.textContent.trim();
    const spaceIdx = text.indexOf(' ');
    const match = spaceIdx > 0 ? [null, text.substring(0, spaceIdx), text.substring(spaceIdx + 1)] : null;
    if (!match) return;

    const bigNum = match[1];
    const subTitle = match[2];

    h2.textContent = '';
    h2.classList.add('stat-heading');

    const numSpan = document.createElement('span');
    numSpan.className = 'stat-number';
    numSpan.textContent = bigNum;

    const stackDiv = document.createElement('span');
    stackDiv.className = 'stat-detail';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'stat-title';
    titleSpan.textContent = subTitle;

    const subSpan = document.createElement('span');
    subSpan.className = 'stat-subtitle';
    subSpan.textContent = em.textContent;

    stackDiv.append(titleSpan, subSpan);
    h2.append(numSpan, stackDiv);
  });

  // Alternate column order: even columns blocks get image on the right
  const allColumns = [...document.querySelectorAll('.columns')];
  const index = allColumns.indexOf(block);
  if (index % 2 === 1) {
    block.classList.add('columns-reversed');
  }
}
