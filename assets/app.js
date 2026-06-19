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
  const particleCanvas = document.querySelector("#particleCanvas");
  const codexPet = document.querySelector("#codexPet");
  const petBubble = document.querySelector("#petBubble");
  const articleDrawer = document.querySelector("#articleDrawer");
  const drawerBackdrop = document.querySelector("#drawerBackdrop");
  const drawerClose = document.querySelector("#drawerClose");
  const drawerCategory = document.querySelector("#drawerCategory");
  const drawerTitle = document.querySelector("#drawerTitle");
  const drawerSummary = document.querySelector("#drawerSummary");
  const drawerMeta = document.querySelector("#drawerMeta");
  const drawerBody = document.querySelector("#drawerBody");
  const drawerSource = document.querySelector("#drawerSource");
  const drawerCopyLink = document.querySelector("#drawerCopyLink");
  let currentCategory = "全部";
  let setupStep = 0;
  let currentArticle = null;
  const setupAnswers = {
    system: "windows",
    auth: "chatgpt",
    network: "ok",
    goal: "cli",
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

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

  function initParticleField() {
    if (!particleCanvas) return;
    const ctx = particleCanvas.getContext("2d");
    const pointer = { x: -9999, y: -9999, active: false };
    let width = 0;
    let height = 0;
    let ratio = 1;
    let particles = [];
    let hueShift = 0;

    function resize() {
      const rect = particleCanvas.getBoundingClientRect();
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      particleCanvas.width = Math.floor(width * ratio);
      particleCanvas.height = Math.floor(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(95, Math.max(42, Math.floor(width / 18)));
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        ox: Math.random() * width,
        oy: Math.random() * height,
        vx: 0,
        vy: 0,
        size: 1.4 + Math.random() * 2.8,
        phase: index * 0.37 + Math.random() * 4,
      }));
    }

    function setPointer(event) {
      const rect = particleCanvas.getBoundingClientRect();
      const source = event.touches ? event.touches[0] : event;
      pointer.x = source.clientX - rect.left;
      pointer.y = source.clientY - rect.top;
      pointer.active = true;
    }

    function clearPointer() {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    }

    function draw() {
      hueShift += 0.008;
      ctx.clearRect(0, 0, width, height);

      const glowX = pointer.active ? pointer.x : width * (0.52 + Math.sin(hueShift) * 0.22);
      const glowY = pointer.active ? pointer.y : height * (0.48 + Math.cos(hueShift * 0.8) * 0.2);
      const gradient = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(width, height) * 0.72);
      gradient.addColorStop(0, "rgba(76, 197, 172, 0.34)");
      gradient.addColorStop(0.36, "rgba(217, 129, 43, 0.15)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (const particle of particles) {
        const waveX = Math.sin(hueShift * 1.4 + particle.phase) * 0.35;
        const waveY = Math.cos(hueShift * 1.2 + particle.phase) * 0.35;
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const dist = Math.hypot(dx, dy) || 1;
        const radius = pointer.active ? 150 : 0;

        if (dist < radius) {
          const force = (1 - dist / radius) * 1.9;
          particle.vx += (dx / dist) * force;
          particle.vy += (dy / dist) * force;
        }

        particle.vx += (particle.ox - particle.x) * 0.006 + waveX;
        particle.vy += (particle.oy - particle.y) * 0.006 + waveY;
        particle.vx *= 0.9;
        particle.vy *= 0.9;
        particle.x += particle.vx;
        particle.y += particle.vy;
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 105) {
            const alpha = (1 - dist / 105) * 0.28;
            ctx.strokeStyle = `rgba(0, 121, 107, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      if (pointer.active) {
        ctx.strokeStyle = "rgba(217, 129, 43, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 34 + Math.sin(hueShift * 5) * 7, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (const particle of particles) {
        const distToPointer = Math.hypot(particle.x - pointer.x, particle.y - pointer.y);
        const hot = pointer.active && distToPointer < 140;
        ctx.fillStyle = hot ? "rgba(217, 129, 43, 0.95)" : "rgba(0, 121, 107, 0.72)";
        ctx.shadowBlur = hot ? 18 : 8;
        ctx.shadowColor = hot ? "rgba(217, 129, 43, 0.75)" : "rgba(76, 197, 172, 0.4)";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, hot ? particle.size + 1.2 : particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      window.requestAnimationFrame(draw);
    }

    particleCanvas.addEventListener("pointermove", setPointer);
    particleCanvas.addEventListener("pointerdown", setPointer);
    particleCanvas.addEventListener("pointerleave", clearPointer);
    particleCanvas.addEventListener("touchmove", setPointer, { passive: true });
    particleCanvas.addEventListener("touchend", clearPointer);
    window.addEventListener("resize", resize);
    resize();
    draw();
  }

  function initCodexPet() {
    if (!codexPet || !petBubble) return;
    const moods = [
      { name: "happy", text: "配置顺利的话，我会很开心。" },
      { name: "focus", text: "我在盯着你的下一步。" },
      { name: "spark", text: "点我会生成灵感火花。" },
      { name: "shy", text: "哎呀，别戳太快。" },
      { name: "ready", text: "准备好安装 Codex 了吗？" },
      { name: "wink", text: "这个位置不错。" },
    ];
    let moodIndex = 0;
    let lastMove = 0;
    let dragState = null;
    let didDrag = false;
    let dragEndAt = 0;

    function setMood(mood) {
      codexPet.dataset.mood = mood.name;
      petBubble.textContent = mood.text;
      codexPet.classList.add("reacting");
      window.setTimeout(() => codexPet.classList.remove("reacting"), 520);
    }

    function clampPet(left, top) {
      const rect = codexPet.getBoundingClientRect();
      const margin = 10;
      return {
        left: Math.min(Math.max(margin, left), window.innerWidth - rect.width - margin),
        top: Math.min(Math.max(margin, top), window.innerHeight - rect.height - margin),
      };
    }

    function updateBubbleSide() {
      const rect = codexPet.getBoundingClientRect();
      codexPet.dataset.side = rect.left + rect.width / 2 < window.innerWidth / 2 ? "left" : "right";
    }

    function placePet(left, top) {
      const next = clampPet(left, top);
      codexPet.style.left = `${next.left}px`;
      codexPet.style.top = `${next.top}px`;
      codexPet.style.right = "auto";
      codexPet.style.bottom = "auto";
      localStorage.setItem("codex-pet-position", JSON.stringify(next));
      updateBubbleSide();
    }

    function beginDrag(event) {
      if (dragState) return;
      if (event.button !== undefined && event.button !== 0) return;
      const point = event.touches ? event.touches[0] : event;
      if (!point) return;
      const rect = codexPet.getBoundingClientRect();
      dragState = {
        pointerId: event.pointerId,
        startX: point.clientX,
        startY: point.clientY,
        left: rect.left,
        top: rect.top,
      };
      didDrag = false;
      codexPet.setPointerCapture?.(event.pointerId);
      codexPet.classList.add("dragging");
      codexPet.style.setProperty("--pet-nudge-x", "0px");
      codexPet.style.setProperty("--pet-nudge-y", "0px");
      setMood({ name: "drag", text: "拖我去你喜欢的位置。" });
      event.preventDefault();
    }

    function moveDrag(event) {
      if (!dragState) return;
      if (event.pointerId !== undefined && dragState.pointerId !== undefined && event.pointerId !== dragState.pointerId) return;
      const point = event.touches ? event.touches[0] : event;
      if (!point) return;
      const dx = point.clientX - dragState.startX;
      const dy = point.clientY - dragState.startY;
      if (Math.hypot(dx, dy) > 4) didDrag = true;
      placePet(dragState.left + dx, dragState.top + dy);
      event.preventDefault();
    }

    function endDrag(event) {
      if (!dragState) return;
      if (event?.pointerId !== undefined && dragState.pointerId !== undefined && event.pointerId !== dragState.pointerId) return;
      codexPet.releasePointerCapture?.(dragState.pointerId);
      codexPet.classList.remove("dragging");
      dragState = null;
      if (didDrag) {
        dragEndAt = Date.now();
        setMood({ name: "settled", text: "安家成功。" });
      }
    }

    codexPet.addEventListener("mouseenter", () => {
      if (dragState) return;
      setMood({ name: "curious", text: "我看到鼠标靠近了。" });
    });

    codexPet.addEventListener("mouseleave", () => {
      if (dragState) return;
      setMood({ name: "idle", text: "我在右下角陪你。" });
      codexPet.style.setProperty("--pet-nudge-x", "0px");
      codexPet.style.setProperty("--pet-nudge-y", "0px");
    });

    codexPet.addEventListener("pointerdown", beginDrag);
    codexPet.addEventListener("mousedown", beginDrag);
    codexPet.addEventListener("touchstart", beginDrag, { passive: false });

    document.addEventListener("pointermove", moveDrag);
    document.addEventListener("mousemove", moveDrag);
    document.addEventListener("touchmove", moveDrag, { passive: false });
    document.addEventListener("pointerup", endDrag);
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);
    document.addEventListener("pointercancel", endDrag);
    document.addEventListener("touchcancel", endDrag);

    codexPet.addEventListener("click", (event) => {
      if (Date.now() - dragEndAt < 350) {
        event.preventDefault();
        didDrag = false;
        return;
      }
      moodIndex = (moodIndex + 1) % moods.length;
      setMood(moods[moodIndex]);
    });

    window.addEventListener("pointermove", (event) => {
      if (dragState) return;
      const now = Date.now();
      if (now - lastMove < 40) return;
      lastMove = now;
      const rect = codexPet.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = centerX - event.clientX;
      const dy = centerY - event.clientY;
      const dist = Math.hypot(dx, dy);
      if (dist < 170) {
        const force = (1 - dist / 170) * 22;
        const angle = Math.atan2(dy, dx);
        codexPet.style.setProperty("--pet-nudge-x", `${Math.cos(angle) * force}px`);
        codexPet.style.setProperty("--pet-nudge-y", `${Math.sin(angle) * force}px`);
        if (dist < 95) {
          setMood({ name: "surprise", text: "哇，靠太近啦。" });
        }
      } else {
        codexPet.style.setProperty("--pet-nudge-x", "0px");
        codexPet.style.setProperty("--pet-nudge-y", "0px");
      }
    });

    window.addEventListener("resize", () => {
      const rect = codexPet.getBoundingClientRect();
      placePet(rect.left, rect.top);
    });

    try {
      const saved = JSON.parse(localStorage.getItem("codex-pet-position") || "null");
      if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
        placePet(saved.left, saved.top);
      }
    } catch {
      localStorage.removeItem("codex-pet-position");
    }

    updateBubbleSide();
  }

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
      const haystack = `${article.title} ${article.category} ${article.summary} ${(article.highlights || []).join(" ")}`.toLowerCase();
      return matchesCategory && (!keyword || haystack.includes(keyword));
    });

    if (!articles.length) {
      articleGrid.innerHTML = `<div class="empty-state">没有找到匹配内容，换个关键词试试。</div>`;
      return;
    }

    articleGrid.innerHTML = articles
      .map(
        (article) => `
          <button class="content-card" type="button" data-article-slug="${article.slug}">
            <span class="tag">${article.category}</span>
            <span class="content-card-main">
              <strong>${article.title}</strong>
              <span>${article.summary}</span>
            </span>
            <span class="content-card-footer">
              <span>${article.level}</span>
              <span>${article.meta}</span>
            </span>
          </button>
        `,
      )
      .join("");
  }

  function closeArticle() {
    if (!articleDrawer) return;
    articleDrawer.classList.remove("open");
    articleDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-open");
  }

  function openArticle(slug) {
    const article = data.articles.find((item) => item.slug === slug);
    if (!article || !articleDrawer) return;
    currentArticle = article;
    drawerCategory.textContent = article.category;
    drawerTitle.textContent = article.title;
    drawerSummary.textContent = article.summary;
    drawerMeta.innerHTML = `<span>${article.level}</span><span>${article.meta}</span>`;
    drawerBody.innerHTML = `
      <section>
        <h3>核心要点</h3>
        <ul>${article.highlights.map((item) => `<li>${item}</li>`).join("")}</ul>
      </section>
      <section>
        <h3>可复制命令 / 提示词</h3>
        ${article.commands
          .map(
            (command) => `
              <div class="code-card compact" data-copy="${escapeHtml(command)}" tabindex="0" role="button" aria-label="点击复制内容">
                <button class="copy-button" data-copy="${escapeHtml(command)}">复制</button>
                <pre><code>${escapeHtml(command)}</code></pre>
              </div>
            `,
          )
          .join("")}
      </section>
      <section>
        <h3>检查清单</h3>
        <div class="drawer-checklist">${article.checklist.map((item) => `<span>${item}</span>`).join("")}</div>
      </section>
    `;
    drawerSource.href = article.source;
    articleDrawer.classList.add("open");
    articleDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    drawerClose.focus();
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

    const articleButton = event.target.closest("[data-article-slug]");
    if (articleButton) {
      openArticle(articleButton.dataset.articleSlug);
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

  drawerBackdrop?.addEventListener("click", closeArticle);
  drawerClose?.addEventListener("click", closeArticle);
  drawerCopyLink?.addEventListener("click", () => {
    if (!currentArticle) return;
    navigator.clipboard.writeText(currentArticle.title);
    drawerCopyLink.textContent = "已复制";
    window.setTimeout(() => {
      drawerCopyLink.textContent = "复制文章标题";
    }, 1200);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeArticle();
    }

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
  initParticleField();
  initCodexPet();
})();
