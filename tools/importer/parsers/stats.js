/* eslint-disable */
/* global WebImporter */

/**
 * Parser for stats block (custom block, no library equivalent).
 * Source: https://www.dicksmedia.com section#counter
 * Structure: heading row, then one row per stat card (value + description), then CTA row
 * Selectors from captured DOM: section#counter .fluid-engine
 *
 * No model file exists for stats — this is a new custom block.
 * Table structure: 1 column
 *   Row 1: heading text
 *   Row 2: stat card 1 (value + description)
 *   Row 3: stat card 2 (value + description)
 *   Row 4: stat card 3 (value + description)
 *   Row 5: CTA link
 */
export default function parse(element, { document }) {
  // Found in DOM: .sqs-html-content h2 (first one is the main heading)
  const heading = element.querySelector('.sqs-html-content h2');

  // Found in DOM: .sqs-background-enabled contains stat cards with h1 (value) + p (description)
  const statCards = element.querySelectorAll('.sqs-background-enabled');

  // Found in DOM: a.sqs-block-button-element for CTAs
  const ctas = element.querySelectorAll('a.sqs-block-button-element');

  const cells = [];

  // Row 1: heading
  if (heading) {
    cells.push([heading.cloneNode(true)]);
  }

  // Rows 2-4: stat cards
  statCards.forEach((card) => {
    const frag = document.createDocumentFragment();
    const value = card.querySelector('h1');
    const desc = card.querySelector('p:not(:empty)');
    // Get the last non-empty paragraph as description
    const paragraphs = card.querySelectorAll('p');
    let descText = null;
    for (let i = paragraphs.length - 1; i >= 0; i--) {
      if (paragraphs[i].textContent.trim()) {
        descText = paragraphs[i];
        break;
      }
    }

    if (value) frag.appendChild(value.cloneNode(true));
    if (descText) frag.appendChild(descText.cloneNode(true));
    cells.push([frag]);
  });

  // Row 5: CTA
  if (ctas.length > 0) {
    const ctaFrag = document.createDocumentFragment();
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = ctas[0].href;
    link.textContent = ctas[0].textContent.trim();
    p.appendChild(link);
    ctaFrag.appendChild(p);
    cells.push([ctaFrag]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'stats', cells });
  element.replaceWith(block);
}
