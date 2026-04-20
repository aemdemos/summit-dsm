import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  const value = typeof expanded === 'string' ? expanded : String(expanded);
  sections.querySelectorAll(':scope > .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', value);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > :where(a,p)');
  if (menuLink) {
    return menuLink.textContent.trim();
  }
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

const MAX_BREADCRUMB_DEPTH = 20;

/* eslint-disable-next-line browser-security/no-http-urls, browser-security/detect-mixed-content -- W3C SVG namespace (not fetched) */
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * Down-arrow marker matching dicksmedia #openArrow (stroke nav color).
 * @param {Element} link Primary label link inside a folder nav item
 */
function appendNavDropIcon(link) {
  if (!link || link.querySelector('.nav-drop-icon')) return;
  const wrap = document.createElement('span');
  wrap.className = 'nav-drop-icon';
  wrap.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('viewBox', '0 0 22 22');
  svg.setAttribute('width', '1em');
  svg.setAttribute('height', '1em');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'square');
  svg.setAttribute('stroke-linejoin', 'miter');
  const p1 = document.createElementNS(SVG_NAMESPACE, 'path');
  p1.setAttribute('d', 'M11 18.3591L11 3');
  const p2 = document.createElementNS(SVG_NAMESPACE, 'path');
  p2.setAttribute('d', 'M18 11.5L11 18.5L4 11.5');
  svg.append(p1, p2);
  wrap.append(svg);
  link.append(wrap);
}

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];

  const homeUrl = document.querySelector('.nav-brand a[href]').href;

  let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
  if (menuItem) {
    let depth = 0;
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
      depth += 1;
    } while (menuItem && depth < MAX_BREADCRUMB_DEPTH);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  crumbs.unshift({ title: 'Home', url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs.at(-1).url = null;
  }
  crumbs.at(-1)['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-sections'), document.location.href);

  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));

  breadcrumbs.append(ol);
  return breadcrumbs;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope > .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) {
        navSection.classList.add('nav-drop');
        const labelLink = navSection.querySelector(':scope > a') || navSection.querySelector(':scope > p > a');
        appendNavDropIcon(labelLink);

        navSection.addEventListener('mouseenter', () => {
          if (!isDesktop.matches) return;
          toggleAllNavSections(navSections, false);
          navSection.setAttribute('aria-expanded', 'true');
        });
        navSection.addEventListener('mouseleave', () => {
          if (!isDesktop.matches) return;
          navSection.setAttribute('aria-expanded', 'false');
        });
      }
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) return;
        const expanded = navSection.getAttribute('aria-expanded') === 'true';
        toggleAllNavSections(navSections, false);
        navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });
    navSections.querySelectorAll('.button-container').forEach((buttonContainer) => {
      buttonContainer.classList.remove('button-container');
      buttonContainer.querySelector('.button').classList.remove('button');
    });
  }

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const search = navTools.querySelector('a[href*="search"]');
    if (search && search.textContent === '') {
      search.setAttribute('aria-label', 'Search');
    }
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // Transparent-to-black scroll behavior
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navWrapper.classList.add('nav-scrolled');
    } else {
      navWrapper.classList.remove('nav-scrolled');
    }
  });

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    navWrapper.append(await buildBreadcrumbs());
  }
}
