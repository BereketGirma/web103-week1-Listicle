let allCharacters = [];

const grid = document.getElementById('characters-grid');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const noResults = document.getElementById('no-results');
const resultsCount = document.getElementById('results-count');

const searchInput = document.getElementById('search-input');
const filterElement = document.getElementById('filter-element');
const filterWeapon = document.getElementById('filter-weapon');
const filterRarity = document.getElementById('filter-rarity');
const filterRegion = document.getElementById('filter-region');

async function fetchCharacters() {
  try {
    const response = await fetch('/api/characters');
    if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
    allCharacters = await response.json();
    loadingIndicator.classList.add('hidden');
    applyFiltersAndRender();
  } catch (error) {
    console.error('Failed to fetch characters:', error);
    loadingIndicator.classList.add('hidden');
    errorMessage.classList.remove('hidden');
  }
}

function getFilteredCharacters() {
  const search = searchInput.value.trim().toLowerCase();
  const element = filterElement.value;
  const weapon = filterWeapon.value;
  const rarity = filterRarity.value;
  const region = filterRegion.value;

  return allCharacters.filter(character => {
    const matchesSearch = !search || character.name.toLowerCase().includes(search);
    const matchesElement = !element || character.element === element;
    const matchesWeapon = !weapon || character.weapon === weapon;
    const matchesRarity = !rarity || character.rarity === Number(rarity);
    const matchesRegion = !region || character.region === region;
    return matchesSearch && matchesElement && matchesWeapon && matchesRarity && matchesRegion;
  });
}

function applyFiltersAndRender() {
  const filtered = getFilteredCharacters();
  resultsCount.textContent = `${filtered.length} character${filtered.length !== 1 ? 's' : ''} found`;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResults.classList.remove('hidden');
  } else {
    noResults.classList.add('hidden');
    renderCharacterGrid(filtered);
  }
}

function renderCharacterGrid(characters) {
  grid.innerHTML = '';
  characters.forEach(character => grid.appendChild(buildCharacterCard(character)));
}

function buildCharacterCard(character) {
  const card = document.createElement('article');
  card.className = `character-card element-${character.element.toLowerCase()}`;

  const filledStars = '★'.repeat(character.rarity);
  const emptyStars  = '☆'.repeat(5 - character.rarity);

  card.innerHTML = `
    <div class="img-skeleton-wrapper character-image-wrapper">
      <img
        class="character-image"
        src="${character.image}"
        alt="Portrait of ${character.name}"
        loading="lazy"
      />
    </div>

    <div class="card-body">
      <h3 class="character-name">${character.name}</h3>

      <div class="card-meta">
        <span class="element-badge element-${character.element.toLowerCase()}">${character.element}</span>
        <span class="weapon-type">${character.weapon}</span>
      </div>

      <p class="rarity-stars stars-${character.rarity}" aria-label="${character.rarity} star character">
        ${filledStars}${emptyStars}
      </p>

      <div class="card-spacer"></div>

      <a href="character.html?id=${character.id}" class="btn-details">
        View Details →
      </a>
    </div>
  `;

  const imgEl = card.querySelector('.character-image');
  const wrapperEl = card.querySelector('.img-skeleton-wrapper');
  const markLoaded = () => wrapperEl.classList.add('loaded');
  imgEl.addEventListener('load',  markLoaded);
  imgEl.addEventListener('error', markLoaded);
  if (imgEl.complete) markLoaded();

  return card;
}

searchInput.addEventListener('input', applyFiltersAndRender);
filterElement.addEventListener('change', applyFiltersAndRender);
filterWeapon.addEventListener('change', applyFiltersAndRender);
filterRarity.addEventListener('change', applyFiltersAndRender);
filterRegion.addEventListener('change', applyFiltersAndRender);

fetchCharacters();
