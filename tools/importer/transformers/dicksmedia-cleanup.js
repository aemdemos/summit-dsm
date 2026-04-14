/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: dicksmedia cleanup.
 * Selectors from captured DOM of https://www.dicksmedia.com
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie banner (found: section.gdpr-cookie-banner inside div.cookie-banner-mount-point)
    WebImporter.DOMUtils.remove(element, [
      '.cookie-banner-mount-point',
      '.cookie-banner-manager',
    ]);

    // Remove floating cart widget (found: div#floatingCart)
    WebImporter.DOMUtils.remove(element, ['#floatingCart']);

    // Remove inline SVG symbol definitions (found: img with data:image/svg+xml base64)
    const svgImgs = element.querySelectorAll('img[src^="data:image/svg+xml"]');
    svgImgs.forEach((img) => {
      // Only remove decorative SVG symbols, not content images
      if (!img.closest('.sqs-block-content') && !img.closest('.list-item-media')) {
        img.remove();
      }
    });

    // Remove data-animation attributes (found: data-animation-state on body)
    element.querySelectorAll('[data-animation-state]').forEach((el) => {
      el.removeAttribute('data-animation-state');
    });

    // Remove YUI stamps (found: div#yui3-css-stamp)
    WebImporter.DOMUtils.remove(element, ['#yui3-css-stamp']);
  }

  if (hookName === H.after) {
    // Remove non-authorable site chrome: header and footer
    // (found: header#header, footer#footer-sections)
    WebImporter.DOMUtils.remove(element, [
      'header#header',
      'footer#footer-sections',
    ]);

    // Remove skip-to-content link (found: a.header-skip-link)
    WebImporter.DOMUtils.remove(element, ['.header-skip-link']);

    // Remove mobile menu overlay (found: div.header-menu)
    WebImporter.DOMUtils.remove(element, ['.header-menu']);

    // Remove leftover noscript, link, iframe elements
    WebImporter.DOMUtils.remove(element, ['noscript', 'link', 'iframe']);

    // Clean up empty overlay divs (found: div.fluidImageOverlay, div.imageEffectContainer)
    WebImporter.DOMUtils.remove(element, ['.fluidImageOverlay', '.imageEffectContainer']);

    // Remove section-border and section-background wrappers (found in every section)
    WebImporter.DOMUtils.remove(element, ['.section-border']);
  }
}
