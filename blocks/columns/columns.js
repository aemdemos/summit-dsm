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

  // Alternate column order: even columns blocks get image on the right
  const allColumns = [...document.querySelectorAll('.columns')];
  const index = allColumns.indexOf(block);
  if (index % 2 === 1) {
    block.classList.add('columns-reversed');
  }
}
