import { moveInstrumentation } from '../../scripts/scripts.js';

/** True when authors already placed a FAQ line in section default content (avoid duplicate). */
function sectionHasFaqEyebrowBeforeAccordion(block) {
  const section = block.closest('.section');
  if (!section) return false;
  const wrappers = [...section.children].filter((el) => !el.classList.contains('bg-image'));
  const hostIdx = wrappers.findIndex((el) => el.contains(block));
  if (hostIdx <= 0) return false;
  const prev = wrappers[hostIdx - 1];
  if (!prev.classList.contains('default-content-wrapper')) return false;
  const p = prev.querySelector('p');
  return Boolean(p && /faq/i.test(p.textContent.trim()));
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'accordion-item';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    const [label, body] = [...li.children];
    if (label !== null && label !== undefined) {
      label.className = 'accordion-item-label';
      label.setAttribute('role', 'button');
      label.setAttribute('tabindex', '0');
      label.setAttribute('aria-expanded', 'false');
      const syncExpanded = () => {
        label.setAttribute('aria-expanded', li.classList.contains('active') ? 'true' : 'false');
      };
      label.addEventListener('click', () => {
        li.classList.toggle('active');
        syncExpanded();
      });
      label.addEventListener('keydown', (e) => {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          li.classList.toggle('active');
          syncExpanded();
        }
      });
      const icon = document.createElement('span');
      icon.className = 'accordion-icon-container';
      icon.setAttribute('aria-hidden', 'true');
      label.append(icon);
    }
    if (body !== null && body !== undefined) {
      body.className = 'accordion-item-body';
      const inner = document.createElement('div');
      inner.className = 'accordion-item-body-inner';
      inner.replaceChildren(...body.childNodes);
      body.append(inner);
    }

    ul.append(li);
  });

  block.textContent = '';
  if (!sectionHasFaqEyebrowBeforeAccordion(block)) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'accordion-eyebrow';
    /* dicksmedia.com FAQ section label (same role as cards.js “Solutions” / “Insights”) */
    eyebrow.textContent = 'FAQS';
    block.append(eyebrow);
  }
  block.append(ul);
}
