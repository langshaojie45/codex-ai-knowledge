(function () {
  const data = window.KNOWLEDGE_DATA;
  const articleGrid = document.querySelector("#articleGrid");
  const tabs = document.querySelector("#categoryTabs");
  const searchInput = document.querySelector("#searchInput");
  const heroSearch = document.querySelector("#heroSearch");
  const heroSearchInput = document.querySelector("#heroSearchInput");
  const roleGrid = document.querySelector("#roleGrid");
  const themeToggle = document.querySelector("#themeToggle");
  const terminalText = document.querySelector("#terminalText");
  const terminalStatus = document.querySelector("#terminalStatus");
  const terminalHint = document.querySelector("#terminalHint");
  const terminalButtons = document.querySelectorAll("[data-terminal-step]");
  const routeNodes = document.querySelectorAll("[data-route-node]");
  let currentCategory = "全部";
  let terminalIndex = 0;
  let terminalTimer;
  let terminalAutoTimer;

  const terminalSteps = [
    {
      status: "准备安装",
      hint: "Windows 打开 PowerShell，复制命令即可开始安装。",
      code: "$env:CODEX_NON_INTERACTIVE=1; irm https://chatgpt.com/codex/install.ps1 | iex",
    },
    {
      status: "选择登录",
      hint: "浏览器回调失败时，用设备码登录更稳。",
      code: "codex login\n# 如果跳转失败：\ncodex login --device-auth",
    },
    {
      status: "写入配置",
      hint: "把常用默认值放进 ~/.codex/config.toml。",
      code: 'model = "gpt-5.5"\napproval_policy = "on-request"\nsandbox_mode = "workspace-write"\nweb_search = "cached"\n\n[windows]\nsandbox = "elevated"',
    },
    {
      status: "验证可用",
      hint: "看到版本号并能进入 Codex，就说明基础配置完成。",
      code: "codex --version\nmkdir codex-test; cd codex-test\ncodex",
    },
  ];

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

  function setTerminalStep(index, animate = true) {
    if (!terminalText) return;
    window.clearTimeout(terminalTimer);
    terminalIndex = index;
    const step = terminalSteps[index];
    terminalStatus.textContent = step.status;
    terminalHint.textContent = step.hint;
    terminalButtons.forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.terminalStep) === index);
    });
    routeNodes.forEach((node, nodeIndex) => {
      node.classList.toggle("active", nodeIndex <= Math.min(index, routeNodes.length - 1));
    });

    if (!animate) {
      terminalText.textContent = step.code;
      return;
    }

    terminalText.textContent = "";
    let cursor = 0;
    function typeNext() {
      terminalText.textContent = `${step.code.slice(0, cursor)}${cursor < step.code.length ? "▋" : ""}`;
      cursor += 1;
      if (cursor <= step.code.length) {
        terminalTimer = window.setTimeout(typeNext, 18);
      }
    }
    typeNext();
  }

  function restartTerminalAutoPlay() {
    window.clearInterval(terminalAutoTimer);
    terminalAutoTimer = window.setInterval(() => {
      setTerminalStep((terminalIndex + 1) % terminalSteps.length);
    }, 5200);
  }

  document.addEventListener("click", (event) => {
    const copyButton = event.target.closest(".copy-button");
    if (copyButton) {
      navigator.clipboard.writeText(copyButton.dataset.copy);
      copyButton.textContent = "已复制";
      setTimeout(() => {
        copyButton.textContent = "复制";
      }, 1200);
      return;
    }

    const copyCard = event.target.closest(".code-card[data-copy]");
    if (copyCard) {
      navigator.clipboard.writeText(copyCard.dataset.copy);
      copyCard.classList.add("copied");
      window.setTimeout(() => copyCard.classList.remove("copied"), 900);
      return;
    }

    const terminalButton = event.target.closest("[data-terminal-step]");
    if (terminalButton) {
      setTerminalStep(Number(terminalButton.dataset.terminalStep));
      restartTerminalAutoPlay();
      return;
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

  document.addEventListener("keydown", (event) => {
    const copyCard = event.target.closest?.(".code-card[data-copy]");
    if (copyCard && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      navigator.clipboard.writeText(copyCard.dataset.copy);
      copyCard.classList.add("copied");
      window.setTimeout(() => copyCard.classList.remove("copied"), 900);
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
  setTerminalStep(0);
  restartTerminalAutoPlay();
})();
