/**
 * Animates a number from 0 to the target value.
 * @param {Element} el The element containing the number
 * @param {number} target The target number to count to
 * @param {string} prefix Text before the number (e.g. "")
 * @param {string} suffix Text after the number (e.g. "M+")
 * @param {number} duration Animation duration in ms
 */
function animateCounter(el, target, prefix, suffix, duration = 1500) {
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - (1 - progress) ** 3;
    const current = Math.round(eased * target);
    el.textContent = `${prefix}${current}${suffix}`;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/**
 * Parses a stat value like "24M+" into { prefix, number, suffix }.
 * Returns null if no numeric part is found.
 */
function parseStatValue(text) {
  // Find the first digit sequence and split around it
  const digitIndex = text.search(/\d/);
  if (digitIndex === -1) return null;
  const prefix = text.slice(0, digitIndex);
  const rest = text.slice(digitIndex);
  const digitEnd = rest.search(/\D/);
  const numStr = digitEnd === -1 ? rest : rest.slice(0, digitEnd);
  const suffix = digitEnd === -1 ? '' : rest.slice(digitEnd);
  return { prefix, number: parseInt(numStr, 10), suffix };
}

/**
 * Stats block — displays stat cards with large numbers, counter animation, and CTA.
 * @param {Element} block The stats block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 3) return;

  // Row 0: heading (h2)
  // Rows 1..n-1: stat cards (h1 + p)
  // Last row: CTA link
  const headingRow = rows[0];
  const ctaRow = rows[rows.length - 1];
  const statRows = rows.slice(1, rows.length - 1);

  // Build header area: heading + CTA side by side
  const header = document.createElement('div');
  header.className = 'stats-header';

  const h2 = headingRow.querySelector('h2');
  if (h2) header.appendChild(h2);

  const ctaLink = ctaRow.querySelector('a');
  if (ctaLink) {
    // Remove any button class so we style it ourselves
    ctaLink.classList.remove('button', 'primary', 'secondary');
    header.appendChild(ctaLink);
  }

  // Build stat cards container
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'stats-cards';

  const counterTargets = [];

  statRows.forEach((row) => {
    const card = document.createElement('div');
    const h1 = row.querySelector('h1');
    const p = row.querySelector('p');
    if (h1) {
      card.appendChild(h1);
      // Check if value is animatable
      const parsed = parseStatValue(h1.textContent.trim());
      if (parsed) {
        // Set initial display to 0
        h1.textContent = `${parsed.prefix}0${parsed.suffix}`;
        counterTargets.push({
          el: h1,
          prefix: parsed.prefix,
          number: parsed.number,
          suffix: parsed.suffix,
        });
      }
    }
    if (p) card.appendChild(p);
    cardsContainer.appendChild(card);
  });

  // Clear block and rebuild
  block.textContent = '';
  block.appendChild(header);
  block.appendChild(cardsContainer);

  // Observe for viewport entry to trigger counter animation
  if (counterTargets.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          counterTargets.forEach(({ el, prefix, number, suffix }) => {
            animateCounter(el, number, prefix, suffix);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(cardsContainer);
  }
}
