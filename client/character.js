const params      = new URLSearchParams(window.location.search);
const characterId = parseInt(params.get('id'), 10);

const loadingEl = document.getElementById('loading-indicator');
const errorEl   = document.getElementById('error-message');
const detailEl  = document.getElementById('detail-view');

/**
 * Takes a character object and injects the full detail layout
 * into the #detail-view container.
 *
 * @param {Object} character — one character object from the API
 */
function renderDetail(character) {
  const elementClass = character.element.toLowerCase();

  // Build the star string (★ for owned rarity, ☆ for remainder)
  const filledStars = '★'.repeat(character.rarity);
  const emptyStars  = '☆'.repeat(5 - character.rarity);

  // Inject the two-column detail layout
  detailEl.innerHTML = `
    <div class="detail-layout element-${elementClass}">

      <!-- LEFT COLUMN: character portrait art -->
      <div class="detail-portrait-wrapper img-skeleton-wrapper">
        <img
          src="${character.image}"
          alt="Full portrait of ${character.name}"
          class="detail-portrait-img"
        />
      </div>

      <!-- RIGHT COLUMN: character information -->
      <div class="detail-info">

        <h2 class="detail-name">${character.name}</h2>

        <!-- Element badge + weapon type pill -->
        <div class="detail-badges">
          <span class="element-badge element-${elementClass}">${character.element}</span>
          <span class="weapon-type">${character.weapon}</span>
        </div>

        <!-- Rarity stars -->
        <p class="rarity-stars stars-${character.rarity}" aria-label="${character.rarity} star character">
          ${filledStars}${emptyStars}
        </p>

        <!-- 2×2 grid of key stats -->
        <div class="detail-stats">
          <div class="detail-stat-item">
            <span class="stat-label">Region</span>
            <span class="stat-value">${character.region}</span>
          </div>
          <div class="detail-stat-item">
            <span class="stat-label">Role</span>
            <span class="stat-value">${character.role}</span>
          </div>
          <div class="detail-stat-item">
            <span class="stat-label">Weapon</span>
            <span class="stat-value">${character.weapon}</span>
          </div>
          <div class="detail-stat-item">
            <span class="stat-label">Rarity</span>
            <span class="stat-value">${character.rarity}-Star</span>
          </div>
        </div>

        <!-- Divider + description -->
        <div class="detail-divider"></div>
        <h3 class="detail-about-heading">About</h3>
        <p class="detail-description">${character.description}</p>

      </div><!-- /.detail-info -->

    </div><!-- /.detail-layout -->
  `;

  // Update the browser tab title with the character's name
  document.title = `${character.name} — Genshin Impact Character Guide`;

  // Wire up skeleton: fade in portrait once it finishes loading.
  // The .detail-portrait-wrapper already has img-skeleton-wrapper in its class list.
  const portraitImg     = detailEl.querySelector('.detail-portrait-img');
  const portraitWrapper = detailEl.querySelector('.detail-portrait-wrapper');

  const markLoaded = () => portraitWrapper.classList.add('loaded');
  portraitImg.addEventListener('load',  markLoaded);
  portraitImg.addEventListener('error', markLoaded); // remove shimmer even on broken images
  if (portraitImg.complete) markLoaded();
}

/**
 * Main entry point for the detail page.
 * Validates the ID, fetches data, and either renders or errors.
 */
async function loadCharacter() {
  // Guard: if no valid ID in the URL, show error immediately
  if (isNaN(characterId)) {
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    const response = await fetch('/api/characters');

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const characters = await response.json();

    // Find the character whose id matches the URL parameter
    const character = characters.find(c => c.id === characterId);

    loadingEl.classList.add('hidden');

    if (!character) {
      // ID was a valid number but no character has that id
      errorEl.classList.remove('hidden');
      return;
    }

    // Success — show the detail view
    detailEl.classList.remove('hidden');
    renderDetail(character);

  } catch (err) {
    console.error('Failed to load character:', err);
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
  }
}

// Kick off as soon as the script runs
loadCharacter();
