/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero block.
 * Base: hero. Source: https://www.dicksmedia.com
 * Library: ISE boilerplate (https://main--ise-boilerplate--aemdemos.aem.page/docs/library/blocks.json)
 * ISE hero example: 1 col, 2 rows: [name], [image + title + subheading + CTA in one cell]
 * Model fields: image (reference), imageAlt (collapsed), text (richtext)
 * Selectors from captured DOM: section.page-section.has-background .fluid-engine
 */
export default function parse(element, { document }) {
  // Background image from section-background
  // Found in DOM: section.page-section .section-background img
  const section = element.closest('section.page-section') || element.parentElement;
  const bgImg = section ? section.querySelector('.section-background img') : null;

  // Text content - heading, paragraph, CTA
  // Found in DOM: .sqs-html-content h1, .sqs-html-content p, .sqs-block-button-element
  const heading = element.querySelector('.sqs-html-content h1');
  const paragraph = element.querySelector('.sqs-html-content p');
  const cta = element.querySelector('a.sqs-block-button-element');

  // ISE boilerplate hero: single content row with image + text combined
  const contentCell = document.createDocumentFragment();

  // Image (with field hint for xwalk)
  if (bgImg) {
    contentCell.appendChild(document.createComment(' field:image '));
    const img = document.createElement('img');
    img.src = bgImg.src;
    img.alt = bgImg.alt || '';
    contentCell.appendChild(img);
  }

  // Text content: heading + paragraph + CTA (with field hint for xwalk)
  contentCell.appendChild(document.createComment(' field:text '));
  if (heading) contentCell.appendChild(heading.cloneNode(true));
  if (paragraph) contentCell.appendChild(paragraph.cloneNode(true));
  if (cta) {
    const link = document.createElement('a');
    link.href = cta.href;
    link.textContent = cta.textContent.trim();
    const p = document.createElement('p');
    p.appendChild(link);
    contentCell.appendChild(p);
  }

  const cells = [[contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
