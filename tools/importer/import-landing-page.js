/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import statsParser from './parsers/stats.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/dicksmedia-cleanup.js';
import sectionsTransformer from './transformers/dicksmedia-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'stats': statsParser,
  'columns': columnsParser,
  'cards': cardsParser,
  'accordion': accordionParser,
};

// PAGE TEMPLATE CONFIGURATION (from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'landing-page',
  urls: ['https://www.dicksmedia.com'],
  description: 'Homepage landing page for DICK\'S Media Network',
  blocks: [
    {
      name: 'hero',
      instances: ['section.page-section.has-background .fluid-engine'],
    },
    {
      name: 'stats',
      instances: ['section.page-section#counter .fluid-engine'],
    },
    {
      name: 'columns',
      instances: [
        'section.page-section:has(.fe-68402248b37fc210572c9bc0) .fluid-engine',
        'section.page-section:has(.fe-6840331be7a45b676cb53898) .fluid-engine',
        'section.page-section:has(.fe-684b206b6b5d0a2feb065be3) .fluid-engine',
      ],
    },
    {
      name: 'cards',
      instances: [
        'section.page-section#solution-section .fluid-engine',
        'section.page-section#case-study-grid .user-items-list',
      ],
    },
    {
      name: 'accordion',
      instances: ['section.page-section:has(.accordion-block) .fluid-engine'],
    },
  ],
  sections: [
    { id: 'section-1-hero', name: 'Hero', selector: 'section.page-section.has-background', style: 'dark', blocks: ['hero'], defaultContent: [] },
    { id: 'section-2-stats', name: 'Stats Counter', selector: 'section.page-section#counter', style: 'dark', blocks: ['stats'], defaultContent: [] },
    { id: 'section-3-cta-image', name: 'Image + CTA Columns', selector: 'section.page-section:has(.fe-68402248b37fc210572c9bc0)', style: 'dark', blocks: ['columns'], defaultContent: [] },
    { id: 'section-4-solutions', name: 'Solutions Grid', selector: 'section.page-section#solution-section', style: 'dark', blocks: ['cards'], defaultContent: [] },
    { id: 'section-5-brand-partners', name: 'Brand Partners CTA', selector: 'section.page-section:has(.fe-6840331be7a45b676cb53898)', style: 'dark', blocks: ['columns'], defaultContent: [] },
    { id: 'section-6-insights-label', name: 'Insights Section Label', selector: 'section.page-section:has(.fe-6845d9aeeb56b5656c7b5bc7)', style: 'dark', blocks: [], defaultContent: ['p.sqsrte-small'] },
    { id: 'section-7-case-studies', name: 'Case Studies', selector: 'section.page-section#case-study-grid', style: 'dark', blocks: ['cards'], defaultContent: [] },
    { id: 'section-8-legacy-cta', name: 'Legacy CTA', selector: 'section.page-section:has(.fe-684b206b6b5d0a2feb065be3)', style: 'dark', blocks: ['columns'], defaultContent: [] },
    { id: 'section-9-faq', name: 'FAQ Accordion', selector: 'section.page-section:has(.accordion-block)', style: 'dark', blocks: ['accordion'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY (cleanup first, then sections)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform (cleanup cookie banners, overlays, etc.)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using template selectors
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform (remove header/footer, add section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
