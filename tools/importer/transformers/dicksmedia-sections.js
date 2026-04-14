/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: dicksmedia sections.
 * Adds section breaks and section-metadata blocks from template sections.
 * Runs in afterTransform only.
 * Selectors from captured DOM of https://www.dicksmedia.com
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'afterTransform') {
    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element.getRootNode() };
    const template = payload && payload.template;
    if (!template || !template.sections || template.sections.length < 2) return;

    // Process sections in reverse order to avoid offset issues
    const sections = [...template.sections].reverse();

    sections.forEach((section, reverseIdx) => {
      const isFirst = reverseIdx === sections.length - 1; // First section in original order
      const selectorList = Array.isArray(section.selector) ? section.selector : [section.selector];

      let sectionEl = null;
      for (const sel of selectorList) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }

      if (!sectionEl) return;

      // Add section-metadata block if section has a style
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.append(metaBlock);
      }

      // Add <hr> before each section except the first
      if (!isFirst) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    });
  }
}
