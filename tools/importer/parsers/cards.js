/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block.
 * Base: cards. Source: https://www.dicksmedia.com
 * Model fields (card item): image (reference), text (richtext)
 * Block library: 2 columns per row. Col1=image, Col2=text content
 * Used for:
 *   - section#solution-section: 4 numbered solution cards (image + number + title + desc + CTA)
 *   - section#case-study-grid: 3 case study cards (brand logo + metric + desc + CTA)
 * Selectors from captured DOM
 */
export default function parse(element, { document }) {
  const cells = [];

  // Detect which variant: solution-section uses .fluid-engine with .fe-block,
  // case-study-grid uses .user-items-list with li.list-item
  const listItems = element.querySelectorAll('li.list-item');

  if (listItems.length > 0) {
    // Case study cards variant (section#case-study-grid)
    // Found in DOM: li.list-item > .list-item-media img + .list-item-content
    listItems.forEach((item) => {
      const img = item.querySelector('.list-item-media img');
      const contentDiv = item.querySelector('.list-item-content__description');
      const ctaLink = item.querySelector('a.list-item-content__button');

      // Col 1: image
      const col1 = document.createDocumentFragment();
      col1.appendChild(document.createComment(' field:image '));
      if (img) {
        const imgEl = document.createElement('img');
        imgEl.src = img.src;
        imgEl.alt = img.alt || '';
        col1.appendChild(imgEl);
      }

      // Col 2: text content (metric + label + description + CTA)
      const col2 = document.createDocumentFragment();
      col2.appendChild(document.createComment(' field:text '));
      if (contentDiv) {
        const paragraphs = contentDiv.querySelectorAll('p');
        paragraphs.forEach((p) => {
          if (p.textContent.trim()) {
            col2.appendChild(p.cloneNode(true));
          }
        });
      }
      if (ctaLink) {
        const p = document.createElement('p');
        const link = document.createElement('a');
        link.href = ctaLink.href;
        link.textContent = ctaLink.textContent.trim();
        p.appendChild(link);
        col2.appendChild(p);
      }

      cells.push([col1, col2]);
    });
  } else {
    // Solutions grid variant (section#solution-section)
    // Found in DOM: groups of fe-blocks with image-block, h3 (number), h2 (title), p (desc), button
    // Each solution card has: image block, h3 (01-04), h2 (title), p (description), button (CTA)
    const imageBlocks = element.querySelectorAll('.sqs-block-image');
    const numberHeadings = element.querySelectorAll('.sqs-html-content h3');
    const titleHeadings = element.querySelectorAll('.sqs-html-content h2');
    const descriptions = element.querySelectorAll('.sqs-block-html:not(:has(h2)):not(:has(h3)):not(:has(p.sqsrte-small)) .sqs-html-content p');
    const ctaButtons = element.querySelectorAll('a.sqs-block-button-element');

    // Determine card count from number headings (01, 02, 03, 04)
    const cardCount = numberHeadings.length;

    for (let i = 0; i < cardCount; i++) {
      const img = imageBlocks[i] ? imageBlocks[i].querySelector('img') : null;
      const num = numberHeadings[i];
      const title = titleHeadings[i];
      const cta = ctaButtons[i];

      // Col 1: image
      const col1 = document.createDocumentFragment();
      col1.appendChild(document.createComment(' field:image '));
      if (img) {
        const imgEl = document.createElement('img');
        imgEl.src = img.src;
        imgEl.alt = img.alt || '';
        col1.appendChild(imgEl);
      }

      // Col 2: text content
      const col2 = document.createDocumentFragment();
      col2.appendChild(document.createComment(' field:text '));
      if (num) col2.appendChild(num.cloneNode(true));
      if (title) col2.appendChild(title.cloneNode(true));

      // Find description paragraph that follows this title's parent block
      if (descriptions[i]) {
        col2.appendChild(descriptions[i].cloneNode(true));
      }

      if (cta) {
        const p = document.createElement('p');
        const link = document.createElement('a');
        link.href = cta.href;
        link.textContent = cta.textContent.trim();
        p.appendChild(link);
        col2.appendChild(p);
      }

      cells.push([col1, col2]);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
