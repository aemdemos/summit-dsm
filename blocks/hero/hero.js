export default async function decorate(block) {
  // Find the picture element (background image) and move it to be a direct child of the block
  const picture = block.querySelector('picture');
  if (picture) {
    // Remove the picture from its current wrapper (p > picture inside a div)
    const pictureParent = picture.closest('p') || picture.parentElement;
    picture.remove();
    if (pictureParent && pictureParent.tagName === 'P' && !pictureParent.textContent.trim()) {
      pictureParent.remove();
    }
    // Prepend picture as direct child of the block for absolute positioning via CSS
    block.prepend(picture);
  }
}
