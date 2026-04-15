/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: dicksmedia sections.
 * Adds section breaks and section-metadata blocks from template sections.
 *
 * Two-phase approach:
 *   beforeTransform — mark each section element with data-section-id / data-section-style
 *                     while the original Squarespace selectors still match.
 *   afterTransform  — walk the marked elements and insert <hr> breaks + section-metadata.
 */
export default function transform(hookName, element, payload) {
  const { document } = element.ownerDocument
    ? { document: element.ownerDocument }
    : { document: element.getRootNode() };
  const template = payload && payload.template;
  if (!template || !template.sections || template.sections.length < 2) return;

  /* ── Phase 1: mark sections while selectors are intact ── */
  if (hookName === 'beforeTransform') {
    template.sections.forEach((section) => {
      const selectorList = Array.isArray(section.selector)
        ? section.selector
        : [section.selector];

      for (const sel of selectorList) {
        const sectionEl = element.querySelector(sel);
        if (sectionEl) {
          sectionEl.setAttribute('data-section-id', section.id);
          if (section.style) {
            sectionEl.setAttribute('data-section-style', section.style);
          }
          break;
        }
      }
    });
  }

  /* ── Phase 2: insert <hr> + section-metadata using the marks ── */
  if (hookName === 'afterTransform') {
    const marked = [...element.querySelectorAll('[data-section-id]')];

    marked.forEach((sectionEl, idx) => {
      const style = sectionEl.getAttribute('data-section-style');

      // Add section-metadata block if section has a style
      if (style) {
        const metaBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style },
        });
        sectionEl.append(metaBlock);
      }

      // Add <hr> before every section except the first
      if (idx > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }

      // Clean up marker attributes
      sectionEl.removeAttribute('data-section-id');
      sectionEl.removeAttribute('data-section-style');
    });
  }
}
