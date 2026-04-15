export default async function decorate(block) {
  // Find the picture element (background image) and move it to be a direct child of the block
  const picture = block.querySelector('picture');
  if (picture) {
    const pictureParent = picture.closest('p') || picture.parentElement;
    picture.remove();
    if (pictureParent && pictureParent.tagName === 'P' && !pictureParent.textContent.trim()) {
      pictureParent.remove();
    }
    const img = picture.querySelector('img');
    if (img) {
      img.loading = 'eager';
    }
    block.prepend(picture);
  }

  // Ensure CTA link gets button styling
  const ctaLink = block.querySelector('a[href*="contact"]');
  if (ctaLink && !ctaLink.classList.contains('button')) {
    ctaLink.classList.add('button');
    const ctaParent = ctaLink.closest('p');
    if (ctaParent) {
      ctaParent.classList.add('button-container');
    }
  }

  // Add scroll-down icon at bottom of hero
  const contentDiv = block.querySelector(':scope > div');
  if (contentDiv) {
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'hero-scroll-icon';
    const iconImg = document.createElement('img');
    iconImg.src = '/icons/down-icon.png';
    iconImg.alt = '';
    iconImg.width = 18;
    iconImg.height = 43;
    iconImg.loading = 'lazy';
    iconWrapper.appendChild(iconImg);
    contentDiv.appendChild(iconWrapper);
  }
}
