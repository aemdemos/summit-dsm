/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion block.
 * Base: accordion. Source: https://www.dicksmedia.com
 * Model fields (accordion-item): summary (text, collapsed), text (richtext)
 * Block library: 2 columns per row. Col1=title (summary), Col2=content (text)
 * Selectors from captured DOM: .accordion-block li.accordion-item
 */
export default function parse(element, { document }) {
  // Found in DOM: li.accordion-item inside ul.accordion-items-container
  const items = element.querySelectorAll('li.accordion-item');

  const cells = [];

  items.forEach((item) => {
    // Col 1: title/summary
    // Found in DOM: .accordion-item__title (span inside button.accordion-item__click-target)
    const titleEl = item.querySelector('.accordion-item__title');

    // Col 2: content/text
    // Found in DOM: .accordion-item__description contains <p> elements
    const descEl = item.querySelector('.accordion-item__description');

    const col1 = document.createDocumentFragment();
    col1.appendChild(document.createComment(' field:summary '));
    if (titleEl) {
      col1.appendChild(document.createTextNode(titleEl.textContent.trim()));
    }

    const col2 = document.createDocumentFragment();
    col2.appendChild(document.createComment(' field:text '));
    if (descEl) {
      const paragraphs = descEl.querySelectorAll('p');
      paragraphs.forEach((p) => {
        if (p.textContent.trim()) {
          col2.appendChild(p.cloneNode(true));
        }
      });
    }

    cells.push([col1, col2]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
