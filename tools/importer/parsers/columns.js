/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block.
 * Base: columns. Source: https://www.dicksmedia.com
 * Model: columns (no field hints needed per hinting.md — Columns blocks exception)
 * Block library: multi-column rows. Row 1 = name, Row 2+ = content cells
 * Used for sections 3 (image+CTA), 5 (brand partners), 8 (legacy CTA)
 * Selectors from captured DOM: .fluid-engine containing image blocks + text blocks
 */
export default function parse(element, { document }) {
  // Extract image — found in DOM: .sqs-block-image img (not decorative overlays)
  const imgEl = element.querySelector('.sqs-block-image img[src*="squarespace-cdn"], .sqs-block-image img[src*="format="]');

  // Extract headings — found in DOM: .sqs-html-content h2
  const headings = element.querySelectorAll('.sqs-html-content h2');

  // Extract CTA — found in DOM: a.sqs-block-button-element
  const cta = element.querySelector('a.sqs-block-button-element');

  // Build two-column row: [image] | [text content]
  // Column 1: image
  const col1 = document.createDocumentFragment();
  if (imgEl) {
    const img = document.createElement('img');
    img.src = imgEl.src;
    img.alt = imgEl.alt || '';
    col1.appendChild(img);
  }

  // Column 2: headings + CTA
  const col2 = document.createDocumentFragment();
  headings.forEach((h) => {
    col2.appendChild(h.cloneNode(true));
  });
  if (cta) {
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = cta.href;
    link.textContent = cta.textContent.trim();
    p.appendChild(link);
    col2.appendChild(p);
  }

  const cells = [[col1, col2]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
