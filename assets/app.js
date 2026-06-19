(function () {
  const data = window.KNOWLEDGE_DATA;
  const articleGrid = document.querySelector("#articleGrid");
  const tabs = document.querySelector("#categoryTabs");
  const searchInput = document.querySelector("#searchInput");
  const heroSearch = document.querySelector("#heroSearch");
  const heroSearchInput = document.querySelector("#heroSearchInput");
  const roleGrid = document.querySelector("#roleGrid");
  const themeToggle = document.querySelector("#themeToggle");
  const setupProgressText = document.querySelector("#setupProgressText");
  const setupProgressBar = document.querySelector("#setupProgressBar");
  const setupQuestionTitle = document.querySelector("#setupQuestionTitle");
  const setupQuestionText = document.querySelector("#setupQuestionText");
  const setupOptions = document.querySelector("#setupOptions");
  const setupResultLabel = document.querySelector("#setupResultLabel");
  const setupCommand = document.querySelector("#setupCommand");
  const setupOpenLink = document.querySelector("#setupOpenLink");
  const setupCopy = document.querySelector("#setupCopy");
  const setupPrev = document.querySelector("#setupPrev");
  const setupNext = document.querySelector("#setupNext");
  let currentCategory = "全部";
  let setupStep = 0;
  const setupAnswers = {
    system: "windows",
    auth: "chatgpt",
    network: "ok",
    goal: "cli",
  };

  const setupQuestions = [
    {
      key: "system",
      title: "你准备用什么系统？",
      text: "不同系统的安装命令不一样，先选你的使用环境。",
      options: [
        { value: "windows", label: "Windows / PowerShell", detail: "适合大多数国内用户" },
        { value: "wsl", label: "WSL2 / Linux", detail: "项目在 Linux 环境里" },
        { value: "mac", label: "macOS", detail: "Mac 终端安装" },
      ],
    },
    {
      key: "auth",
      title: "你准备用哪种登录方式？",
      text: "第一次使用建议 ChatGPT 登录；自动化和 CI/CD 再考虑 API Key。",
      options: [
        { value: "chatgpt", label: "ChatGPT 登录", detail: "日常使用推荐" },
        { value: "device", label: "设备码登录", detail: "浏览器回调失败时用" },
        { value: "api", label: "API Key", detail: "按 API 用量计费" },
      ],
    },
    {
      key: "network",
      title: "你的网络环境怎么样？",
      text: "Codex 登录和模型调用都需要能访问官方服务。",
      options: [
        { value: "ok", label: "浏览器能打开官方服务", detail: "继续正常配置" },
        { value: "callback", label: "登录跳转经常失败", detail: "推荐设备码登录" },
        { value: "corp", label: "公司网络有证书代理", detail: "可能需要 CA 证书" },
      ],
    },
    {
      key: "goal",
      title: "你最想先做什么？",
      text: "我会按你的目标生成第一条可执行命令。",
      options: [
        { value: "cli", label: "先在命令行跑起来", detail: "安装、登录、测试" },
        { value: "config", label: "先配置稳定环境", detail: "生成 config.toml" },
        { value: "test", label: "做一次最小测试", detail: "建测试目录启动 Codex" },
      ],
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

  function getSetupRecommendation() {
    if (setupStep === 0) {
      if (setupAnswers.system === "wsl" || setupAnswers.system === "mac") {
        return {
          label: "安装命令",
          code: "curl -fsSL https://chatgpt.com/codex/install.sh | sh",
          url: "https://chatgpt.com/codex/install.sh",
        };
      }
      return {
        label: "安装命令",
        code: "$env:CODEX_NON_INTERACTIVE=1; irm https://chatgpt.com/codex/install.ps1 | iex",
        url: "https://chatgpt.com/codex/install.ps1",
      };
    }

    if (setupStep === 1 || setupAnswers.network === "callback") {
      const authCommands = {
        chatgpt: "codex login",
        device: "codex login --device-auth",
        api: "codex login --api-key",
      };
      return {
        label: "登录命令",
        code: authCommands[setupAnswers.auth],
        url: setupAnswers.auth === "api" ? "https://platform.openai.com/api-keys" : "https://chatgpt.com",
      };
    }

    if (setupStep === 2 && setupAnswers.network === "corp") {
      return {
        label: "证书环境变量",
        code: 'setx CODEX_CA_CERTIFICATE "C:\\\\path\\\\to\\\\corporate-root-ca.pem"',
        url: "https://developers.openai.com/codex/codex-manual.md",
      };
    }

    if (setupAnswers.goal === "config") {
      return {
        label: "推荐配置",
        code: 'model = "gpt-5.5"\napproval_policy = "on-request"\nsandbox_mode = "workspace-write"\nweb_search = "cached"\n\n[windows]\nsandbox = "elevated"',
        url: "https://developers.openai.com/codex/codex-manual.md",
      };
    }

    if (setupAnswers.goal === "test") {
      return {
        label: "最小测试",
        code: "mkdir codex-test; cd codex-test; codex",
        url: "#starter",
      };
    }

    return {
      label: "检查命令",
      code: "codex --version\ncodex login\nmkdir codex-test; cd codex-test; codex",
      url: "#starter",
    };
  }

  function renderSetup() {
    if (!setupOptions) return;
    const question = setupQuestions[setupStep];
    const progress = ((setupStep + 1) / setupQuestions.length) * 100;
    const recommendation = getSetupRecommendation();

    setupProgressText.textContent = `${setupStep + 1} / ${setupQuestions.length}`;
    setupProgressBar.style.width = `${progress}%`;
    setupQuestionTitle.textContent = question.title;
    setupQuestionText.textContent = question.text;
    setupOptions.innerHTML = question.options
      .map(
        (option) => `
          <button class="${setupAnswers[question.key] === option.value ? "active" : ""}" data-setup-option="${option.value}">
            <strong>${option.label}</strong>
            <span>${option.detail}</span>
          </button>
        `,
      )
      .join("");

    setupResultLabel.textContent = recommendation.label;
    setupCommand.textContent = recommendation.code;
    setupOpenLink.href = recommendation.url;
    setupOpenLink.textContent = recommendation.url.startsWith("http") ? "打开相关页面" : "跳到对应教程";
    setupPrev.disabled = setupStep === 0;
    setupNext.textContent = setupStep === setupQuestions.length - 1 ? "重新开始" : "下一步";

    document.querySelector("#setupCheckSystem").classList.toggle("done", setupStep >= 0);
    document.querySelector("#setupCheckAuth").classList.toggle("done", setupStep >= 1);
    document.querySelector("#setupCheckNetwork").classList.toggle("done", setupStep >= 2);
    document.querySelector("#setupCheckGoal").classList.toggle("done", setupStep >= 3);
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

    const setupOption = event.target.closest("[data-setup-option]");
    if (setupOption) {
      const key = setupQuestions[setupStep].key;
      setupAnswers[key] = setupOption.dataset.setupOption;
      if (key === "network" && setupAnswers.network === "callback") {
        setupAnswers.auth = "device";
      }
      renderSetup();
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

  setupCopy?.addEventListener("click", () => {
    navigator.clipboard.writeText(setupCommand.textContent);
    setupCopy.textContent = "已复制";
    window.setTimeout(() => {
      setupCopy.textContent = "复制命令";
    }, 1200);
  });

  setupPrev?.addEventListener("click", () => {
    setupStep = Math.max(0, setupStep - 1);
    renderSetup();
  });

  setupNext?.addEventListener("click", () => {
    setupStep = setupStep === setupQuestions.length - 1 ? 0 : setupStep + 1;
    renderSetup();
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
  renderSetup();
})();
