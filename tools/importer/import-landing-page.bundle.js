var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-landing-page.js
  var import_landing_page_exports = {};
  __export(import_landing_page_exports, {
    default: () => import_landing_page_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const section = element.closest("section.page-section") || element.parentElement;
    const bgImg = section ? section.querySelector(".section-background img") : null;
    const heading = element.querySelector(".sqs-html-content h1");
    const paragraph = element.querySelector(".sqs-html-content p");
    const cta = element.querySelector("a.sqs-block-button-element");
    const contentCell = document.createDocumentFragment();
    if (bgImg) {
      contentCell.appendChild(document.createComment(" field:image "));
      const img = document.createElement("img");
      img.src = bgImg.src;
      img.alt = bgImg.alt || "";
      contentCell.appendChild(img);
    }
    contentCell.appendChild(document.createComment(" field:text "));
    if (heading) contentCell.appendChild(heading.cloneNode(true));
    if (paragraph) contentCell.appendChild(paragraph.cloneNode(true));
    if (cta) {
      const link = document.createElement("a");
      link.href = cta.href;
      link.textContent = cta.textContent.trim();
      const p = document.createElement("p");
      p.appendChild(link);
      contentCell.appendChild(p);
    }
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/stats.js
  function parse2(element, { document }) {
    const heading = element.querySelector(".sqs-html-content h2");
    const statCards = element.querySelectorAll(".sqs-background-enabled");
    const ctas = element.querySelectorAll("a.sqs-block-button-element");
    const cells = [];
    if (heading) {
      cells.push([heading.cloneNode(true)]);
    }
    statCards.forEach((card) => {
      const frag = document.createDocumentFragment();
      const value = card.querySelector("h1");
      const desc = card.querySelector("p:not(:empty)");
      const paragraphs = card.querySelectorAll("p");
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
    if (ctas.length > 0) {
      const ctaFrag = document.createDocumentFragment();
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = ctas[0].href;
      link.textContent = ctas[0].textContent.trim();
      p.appendChild(link);
      ctaFrag.appendChild(p);
      cells.push([ctaFrag]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document }) {
    const imgEl = element.querySelector('.sqs-block-image img[src*="squarespace-cdn"], .sqs-block-image img[src*="format="]');
    const headings = element.querySelectorAll(".sqs-html-content h2");
    const cta = element.querySelector("a.sqs-block-button-element");
    const col1 = document.createDocumentFragment();
    if (imgEl) {
      const img = document.createElement("img");
      img.src = imgEl.src;
      img.alt = imgEl.alt || "";
      col1.appendChild(img);
    }
    const col2 = document.createDocumentFragment();
    headings.forEach((h) => {
      col2.appendChild(h.cloneNode(true));
    });
    if (cta) {
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = cta.href;
      link.textContent = cta.textContent.trim();
      p.appendChild(link);
      col2.appendChild(p);
    }
    const cells = [[col1, col2]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse4(element, { document }) {
    const cells = [];
    const listItems = element.querySelectorAll("li.list-item");
    if (listItems.length > 0) {
      listItems.forEach((item) => {
        const img = item.querySelector(".list-item-media img");
        const contentDiv = item.querySelector(".list-item-content__description");
        const ctaLink = item.querySelector("a.list-item-content__button");
        const col1 = document.createDocumentFragment();
        col1.appendChild(document.createComment(" field:image "));
        if (img) {
          const imgEl = document.createElement("img");
          imgEl.src = img.src;
          imgEl.alt = img.alt || "";
          col1.appendChild(imgEl);
        }
        const col2 = document.createDocumentFragment();
        col2.appendChild(document.createComment(" field:text "));
        if (contentDiv) {
          const paragraphs = contentDiv.querySelectorAll("p");
          paragraphs.forEach((p) => {
            if (p.textContent.trim()) {
              col2.appendChild(p.cloneNode(true));
            }
          });
        }
        if (ctaLink) {
          const p = document.createElement("p");
          const link = document.createElement("a");
          link.href = ctaLink.href;
          link.textContent = ctaLink.textContent.trim();
          p.appendChild(link);
          col2.appendChild(p);
        }
        cells.push([col1, col2]);
      });
    } else {
      const imageBlocks = element.querySelectorAll(".sqs-block-image");
      const numberHeadings = element.querySelectorAll(".sqs-html-content h3");
      const titleHeadings = element.querySelectorAll(".sqs-html-content h2");
      const descriptions = element.querySelectorAll(".sqs-block-html:not(:has(h2)):not(:has(h3)):not(:has(p.sqsrte-small)) .sqs-html-content p");
      const ctaButtons = element.querySelectorAll("a.sqs-block-button-element");
      const cardCount = numberHeadings.length;
      for (let i = 0; i < cardCount; i++) {
        const img = imageBlocks[i] ? imageBlocks[i].querySelector("img") : null;
        const num = numberHeadings[i];
        const title = titleHeadings[i];
        const cta = ctaButtons[i];
        const col1 = document.createDocumentFragment();
        col1.appendChild(document.createComment(" field:image "));
        if (img) {
          const imgEl = document.createElement("img");
          imgEl.src = img.src;
          imgEl.alt = img.alt || "";
          col1.appendChild(imgEl);
        }
        const col2 = document.createDocumentFragment();
        col2.appendChild(document.createComment(" field:text "));
        if (num) col2.appendChild(num.cloneNode(true));
        if (title) col2.appendChild(title.cloneNode(true));
        if (descriptions[i]) {
          col2.appendChild(descriptions[i].cloneNode(true));
        }
        if (cta) {
          const p = document.createElement("p");
          const link = document.createElement("a");
          link.href = cta.href;
          link.textContent = cta.textContent.trim();
          p.appendChild(link);
          col2.appendChild(p);
        }
        cells.push([col1, col2]);
      }
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion.js
  function parse5(element, { document }) {
    const items = element.querySelectorAll("li.accordion-item");
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".accordion-item__title");
      const descEl = item.querySelector(".accordion-item__description");
      const col1 = document.createDocumentFragment();
      col1.appendChild(document.createComment(" field:summary "));
      if (titleEl) {
        col1.appendChild(document.createTextNode(titleEl.textContent.trim()));
      }
      const col2 = document.createDocumentFragment();
      col2.appendChild(document.createComment(" field:text "));
      if (descEl) {
        const paragraphs = descEl.querySelectorAll("p");
        paragraphs.forEach((p) => {
          if (p.textContent.trim()) {
            col2.appendChild(p.cloneNode(true));
          }
        });
      }
      cells.push([col1, col2]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/dicksmedia-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        ".cookie-banner-mount-point",
        ".cookie-banner-manager"
      ]);
      WebImporter.DOMUtils.remove(element, ["#floatingCart"]);
      const svgImgs = element.querySelectorAll('img[src^="data:image/svg+xml"]');
      svgImgs.forEach((img) => {
        if (!img.closest(".sqs-block-content") && !img.closest(".list-item-media")) {
          img.remove();
        }
      });
      element.querySelectorAll("[data-animation-state]").forEach((el) => {
        el.removeAttribute("data-animation-state");
      });
      WebImporter.DOMUtils.remove(element, ["#yui3-css-stamp"]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "header#header",
        "footer#footer-sections"
      ]);
      WebImporter.DOMUtils.remove(element, [".header-skip-link"]);
      WebImporter.DOMUtils.remove(element, [".header-menu"]);
      WebImporter.DOMUtils.remove(element, ["noscript", "link", "iframe"]);
      WebImporter.DOMUtils.remove(element, [".fluidImageOverlay", ".imageEffectContainer"]);
      WebImporter.DOMUtils.remove(element, [".section-border"]);
    }
  }

  // tools/importer/transformers/dicksmedia-sections.js
  function transform2(hookName, element, payload) {
    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element.getRootNode() };
    const template = payload && payload.template;
    if (!template || !template.sections || template.sections.length < 2) return;
    if (hookName === "beforeTransform") {
      template.sections.forEach((section) => {
        const selectorList = Array.isArray(section.selector) ? section.selector : [section.selector];
        for (const sel of selectorList) {
          const sectionEl = element.querySelector(sel);
          if (sectionEl) {
            sectionEl.setAttribute("data-section-id", section.id);
            if (section.style) {
              sectionEl.setAttribute("data-section-style", section.style);
            }
            break;
          }
        }
      });
    }
    if (hookName === "afterTransform") {
      const marked = [...element.querySelectorAll("[data-section-id]")];
      marked.forEach((sectionEl, idx) => {
        const style = sectionEl.getAttribute("data-section-style");
        if (style) {
          const metaBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style }
          });
          sectionEl.append(metaBlock);
        }
        if (idx > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
        sectionEl.removeAttribute("data-section-id");
        sectionEl.removeAttribute("data-section-style");
      });
    }
  }

  // tools/importer/import-landing-page.js
  var parsers = {
    "hero": parse,
    "stats": parse2,
    "columns": parse3,
    "cards": parse4,
    "accordion": parse5
  };
  var PAGE_TEMPLATE = {
    name: "landing-page",
    urls: ["https://www.dicksmedia.com"],
    description: "Homepage landing page for DICK'S Media Network",
    blocks: [
      {
        name: "hero",
        instances: ["section.page-section.has-background .fluid-engine"]
      },
      {
        name: "stats",
        instances: ["section.page-section#counter .fluid-engine"]
      },
      {
        name: "columns",
        instances: [
          "section.page-section:has(.fe-68402248b37fc210572c9bc0) .fluid-engine",
          "section.page-section:has(.fe-6840331be7a45b676cb53898) .fluid-engine",
          "section.page-section:has(.fe-684b206b6b5d0a2feb065be3) .fluid-engine"
        ]
      },
      {
        name: "cards",
        instances: [
          "section.page-section#solution-section .fluid-engine",
          "section.page-section#case-study-grid .user-items-list"
        ]
      },
      {
        name: "accordion",
        instances: ["section.page-section:has(.accordion-block) .fluid-engine"]
      }
    ],
    sections: [
      { id: "section-1-hero", name: "Hero", selector: "section.page-section.has-background", style: "dark", blocks: ["hero"], defaultContent: [] },
      { id: "section-2-stats", name: "Stats Counter", selector: "section.page-section#counter", style: "dark", blocks: ["stats"], defaultContent: [] },
      { id: "section-3-cta-image", name: "Image + CTA Columns", selector: "section.page-section:has(.fe-68402248b37fc210572c9bc0)", style: "dark", blocks: ["columns"], defaultContent: [] },
      { id: "section-4-solutions", name: "Solutions Grid", selector: "section.page-section#solution-section", style: "dark", blocks: ["cards"], defaultContent: [] },
      { id: "section-5-brand-partners", name: "Brand Partners CTA", selector: "section.page-section:has(.fe-6840331be7a45b676cb53898)", style: "dark", blocks: ["columns"], defaultContent: [] },
      { id: "section-6-insights-label", name: "Insights Section Label", selector: "section.page-section:has(.fe-6845d9aeeb56b5656c7b5bc7)", style: "dark", blocks: [], defaultContent: ["p.sqsrte-small"] },
      { id: "section-7-case-studies", name: "Case Studies", selector: "section.page-section#case-study-grid", style: "dark", blocks: ["cards"], defaultContent: [] },
      { id: "section-8-legacy-cta", name: "Legacy CTA", selector: "section.page-section:has(.fe-684b206b6b5d0a2feb065be3)", style: "dark", blocks: ["columns"], defaultContent: [] },
      { id: "section-9-faq", name: "FAQ Accordion", selector: "section.page-section:has(.accordion-block)", style: "dark", blocks: ["accordion"], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_landing_page_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_landing_page_exports);
})();
