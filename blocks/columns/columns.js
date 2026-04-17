import { getBlockId } from '../../scripts/scripts.js';

/** Collapse whitespace and strip trailing periods for phrase matching */
function normalizeHeadlineMatch(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\.+$/u, '')
    .trim()
    .toLowerCase();
}

/**
 * When the headline matches the homepage “meet athletes…” line, split into four
 * non-wrapping rows (CSS nowrap on each line) so words are not broken mid-line.
 * Skipped if the author already used br or this transform ran before.
 */
function applyMeetAthletesLineBreaks(em) {
  if (em.querySelector('br') || em.querySelector('.columns-headline-line')) return;
  const key = normalizeHeadlineMatch(em.textContent);
  if (key !== 'meet athletes in the moments that move them') return;
  const lines = ['meet athletes', 'in the', 'moments that', 'move them.'];
  em.replaceChildren();
  lines.forEach((line) => {
    const span = document.createElement('span');
    span.className = 'columns-headline-line';
    span.textContent = line;
    em.appendChild(span);
  });
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

  // Full-line <em> headlines → design-comp treatment (brackets + caps stack).
  // Normalize whitespace so authored line breaks / spaces still match.
  block.querySelectorAll('h2').forEach((h2) => {
    const em = h2.querySelector(':scope > em');
    if (!em) return;
    const h2Text = h2.textContent.replace(/\s+/g, ' ').trim();
    const emText = em.textContent.replace(/\s+/g, ' ').trim();
    if (emText !== h2Text) return;
    h2.classList.add('bracketed');
    applyMeetAthletesLineBreaks(em);
  });

  // Alternate column order: even columns blocks get image on the right
  const allColumns = [...document.querySelectorAll('.columns')];
  const index = allColumns.indexOf(block);
  if (index % 2 === 1) {
    block.classList.add('columns-reversed');
  }
}
