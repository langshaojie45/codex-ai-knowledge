(function () {
  const data = window.KNOWLEDGE_DATA;
  const articleGrid = document.querySelector("#articleGrid");
  const tabs = document.querySelector("#categoryTabs");
  const searchInput = document.querySelector("#searchInput");
  const heroSearch = document.querySelector("#heroSearch");
  const heroSearchInput = document.querySelector("#heroSearchInput");
  const roleGrid = document.querySelector("#roleGrid");
  const themeToggle = document.querySelector("#themeToggle");
  let currentCategory = "全部";

  function renderTabs() {
    tabs.innerHTML = data.categories
      .map(
        (category) =>
          `<button class="${category === currentCategory ? "active" : ""}" data-category="${category}">${category}</button>`,
      )
      .join("");
  }

  function renderArticles() {
    const keyword = searchInput.value.trim().toLowerCase();
    const articles = data.articles.filter((article) => {
      const matchesCategory = currentCategory === "全部" || article.category === currentCategory;
      const haystack = `${article.title} ${article.category} ${article.summary}`.toLowerCase();
      return matchesCategory && (!keyword || haystack.includes(keyword));
    });

    articleGrid.innerHTML = articles
      .map(
        (article) => `
          <article class="content-card">
            <div>
              <span class="tag">${article.category}</span>
              <h3>${article.title}</h3>
              <p>${article.summary}</p>
            </div>
            <footer>
              <span>${article.level}</span>
              <span>${article.meta}</span>
            </footer>
          </article>
        `,
      )
      .join("");
  }

  function renderRoles() {
    roleGrid.innerHTML = data.roles
      .map(
        (role) => `
          <article class="role-card">
            <h3>${role.name}</h3>
            <p>${role.capability}</p>
          </article>
        `,
      )
      .join("");
  }

  document.addEventListener("click", (event) => {
    const copyButton = event.target.closest(".copy-button");
    if (copyButton) {
      navigator.clipboard.writeText(copyButton.dataset.copy);
      copyButton.textContent = "已复制";
      setTimeout(() => {
        copyButton.textContent = "复制";
      }, 1200);
    }

    const tabButton = event.target.closest("[data-category]");
    if (tabButton) {
      currentCategory = tabButton.dataset.category;
      renderTabs();
      renderArticles();
    }

    const accordionButton = event.target.closest(".accordion button");
    if (accordionButton) {
      const expanded = accordionButton.getAttribute("aria-expanded") === "true";
      accordionButton.setAttribute("aria-expanded", String(!expanded));
    }
  });

  searchInput.addEventListener("input", renderArticles);

  heroSearch.addEventListener("submit", (event) => {
    event.preventDefault();
    searchInput.value = heroSearchInput.value;
    currentCategory = "全部";
    renderTabs();
    renderArticles();
    document.querySelector("#content").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("knowledge-theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
  });

  if (localStorage.getItem("knowledge-theme") === "dark") {
    document.documentElement.classList.add("dark");
  }

  renderTabs();
  renderArticles();
  renderRoles();
})();
