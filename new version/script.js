// API configuration
const API_KEY = "12ed4b19a1b9415990b04f50fd4c31ab"; // Replace with your actual key

// DOM Elements
const searchInput = document.getElementById("search-input");
const searchResultsModal = document.getElementById("search-results-modal");
const searchResultsContainer = document.getElementById("search-results");
const recipeDetailsModal = document.getElementById("recipe-details-modal");
const recipeDetailsContainer = document.getElementById("recipe-details");
const closeSearchBtn = document.querySelector(".close");
const closeDetailsBtn = document.querySelector(".close-details");
const featuredRecipes = document.querySelectorAll(".featured-recipe");
const categoryLinks = document.querySelectorAll(".category-link");

// Event Listeners
searchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) {
      searchRecipes(query);
    }
  }
});

closeSearchBtn.addEventListener("click", () => (searchResultsModal.style.display = "none"));
closeDetailsBtn.addEventListener("click", () => (recipeDetailsModal.style.display = "none"));

window.addEventListener("click", function (event) {
  if (event.target === searchResultsModal) searchResultsModal.style.display = "none";
  if (event.target === recipeDetailsModal) recipeDetailsModal.style.display = "none";
});

featuredRecipes.forEach((recipe) => {
  recipe.addEventListener("click", function (e) {
    e.preventDefault();
    const query = this.getAttribute("data-recipe");
    searchRecipes(query, true);
  });
});

categoryLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const category = this.getAttribute("data-category");
    searchRecipes(category);
  });
});

// Functions
async function searchRecipes(query, selectFirst = false) {
  try {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=10&addRecipeInformation=true&apiKey=${API_KEY}`;
    searchResultsContainer.innerHTML = ""; // Clear previous results
    searchResultsContainer.innerHTML = '<p class="text-center">Loading recipes...</p>';
    searchResultsModal.style.display = "block";

    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      if (selectFirst) {
        displayRecipeDetails(data.results[0]);
        searchResultsModal.style.display = "none";
      } else {
        displaySearchResults(data.results);
      }
    } else {
      searchResultsContainer.innerHTML = '<p class="text-center">No recipes found. Try another search term.</p>';
    }
  } catch (error) {
    console.error("Error fetching recipes:", error);
    searchResultsContainer.innerHTML = '<p class="text-center">Error fetching recipes. Please try again later.</p>';
  }
}

function displaySearchResults(results) {
  searchResultsContainer.innerHTML = "";
  results.forEach((recipe) => {
    const resultItem = document.createElement("div");
    resultItem.className = "search-result-item";
    resultItem.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}" class="search-result-image">
      <div class="search-result-title">${recipe.title}</div>
    `;
    resultItem.addEventListener("click", () => {
      displayRecipeDetails(recipe);
      searchResultsModal.style.display = "none";
    });
    searchResultsContainer.appendChild(resultItem);
  });
}

function displayRecipeDetails(recipe) {
  const totalTime = recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : "Not specified";
  const servings = recipe.servings || "Not specified";
  const ingredientsList = recipe.extendedIngredients?.map((ing) => `<li>${ing.original}</li>`).join("") || "<li>No ingredients listed</li>";

  const healthLabelsHtml = `
    <div class="recipe-section">
      <h3 class="recipe-section-title">Dietary Info</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${recipe.vegetarian ? '<span class="label-tag">Vegetarian</span>' : ""}
        ${recipe.vegan ? '<span class="label-tag">Vegan</span>' : ""}
        ${recipe.glutenFree ? '<span class="label-tag">Gluten Free</span>' : ""}
        ${recipe.dairyFree ? '<span class="label-tag">Dairy Free</span>' : ""}
      </div>
    </div>
  `;

  const instructionsHtml = `
    <div class="recipe-section">
      <h3 class="recipe-section-title">Instructions</h3>
      <p>For steps, visit the <a href="${recipe.sourceUrl}" target="_blank" style="color: var(--primary); text-decoration: underline;">original recipe source</a>.</p>
    </div>
  `;

  const nutritionHtml = `
    <p>Nutrition info not available in this API endpoint.</p>
  `;

  recipeDetailsContainer.innerHTML = `
    <div class="recipe-header">
      <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
      <h2 class="recipe-title">${recipe.title}</h2>
      <p class="recipe-source">Source: ${recipe.sourceName || "Unknown"}</p>
      <div class="recipe-meta">
        <div class="recipe-meta-item">
          <span class="recipe-meta-value">${totalTime}</span>
          <span class="recipe-meta-label">Cook Time</span>
        </div>
        <div class="recipe-meta-item">
          <span class="recipe-meta-value">${servings}</span>
          <span class="recipe-meta-label">Servings</span>
        </div>
      </div>
    </div>
    <div class="recipe-content">
      <div>
        <div class="recipe-section">
          <h3 class="recipe-section-title">Ingredients</h3>
          <ul class="ingredients-list">${ingredientsList}</ul>
        </div>
        ${healthLabelsHtml}
      </div>
      <div>
        ${instructionsHtml}
        <div class="recipe-section">
          <h3 class="recipe-section-title">Nutrition Information</h3>
          ${nutritionHtml}
        </div>
      </div>
    </div>
  `;
  recipeDetailsModal.style.display = "block";
}
