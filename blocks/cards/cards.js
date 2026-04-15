import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, getBlockId } from '../../scripts/scripts.js';
import { createCard } from '../card/card.js';

export default function decorate(block) {
  const blockId = getBlockId('cards');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `Cards for ${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Cards');

  // Check if this is the Solutions cards (has h3 with numbers like "01")
  const hasNumberedCards = block.querySelector('h3')?.textContent?.trim()?.match(/^\d+$/);

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    ul.append(createCard(row));
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';

  // Add "Solutions" eyebrow label for numbered cards
  if (hasNumberedCards) {
    const label = document.createElement('p');
    label.className = 'cards-eyebrow';
    label.textContent = 'Solutions';
    block.append(label);
  }

  block.append(ul);
}
