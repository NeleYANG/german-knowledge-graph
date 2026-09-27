(() => {
  /**
   * 有机云锥：年龄是软约束；连线在三维织网；半径软区间。
   * 离线算完再上屏，避免黑屏。
   */
  const DATA = "data";

  // 英语知识领域配色（课标2022：语音/词汇/语法/功能/话题/策略/文化） — 珠宝色调，高饱和+高亮度
  const EN_COLORS = {
    "语音": "#FFB547",  // 琥珀金 — 发声、拼读、韵律
    "词汇": "#FF7A8C",  // 珊瑚红 — 词义、词形
    "语法": "#5BC9FF",  // 青天蓝 — 时态、从句、结构
    "功能": "#4BE5B8",  // 薄荷翠 — 交际功能、对话
    "话题": "#C87CFF",  // 紫罗兰 — 主题、跨学科
    "策略": "#FF9359",  // 暖橙橘 — 学习策略、元认知
    "文化": "#9FE85A",  // 鲜嫩绿 — 文化、价值观
  };

  // 数学知识领域配色（义务教育数学课程标准）
  const MATH_COLORS = {
    "数与运算": "#6f91e8",
    "代数与方程": "#b686d9",
    "图形与几何": "#68e2cd",
    "测量": "#f0c988",
    "数据与概率": "#e98fb4",
    "数学建模与应用": "#ff9278",
    "综合与实践": "#9bd28f",
  };

  // 德语知识领域配色 — 与英语共用七领域，色调微调以示区分
  const DE_COLORS = {
    "语音": "#FFCB5E",
    "词汇": "#FF8E9D",
    "语法": "#5BD4FF",
    "功能": "#5AEBC4",
    "话题": "#D088FF",
    "策略": "#FF9F6E",
    "文化": "#A8ED6B",
  };

  // CEFR 等级标签（内部 level 1–10 → 显示标签）
  const CEFR_LABELS = ["A1.1", "A1.2", "A2.1", "A2.2", "B1.1", "B1.2", "B2.1", "B2.2", "C1.1", "C1.2"];

  // 学科配置：切换时重绑下面的 let 变量
  const SUBJECT_CONFIG = {
    english: {
      label: "英语",
      data: () => window.MARBLE_TAXONOMY_DATA,
      colors: EN_COLORS,
      subjectOrder: Object.keys(EN_COLORS),
      ageMin: 8,
      ageMax: 15,
      gradeMin: 3,
      gradeMax: 9,
      gradeParse: (s) => Number.parseInt(s, 10) || 3,
      gradeLabel: (n) => String(n),
      gradeUnit: "年级",
      gradeAxisLabel: "知识成长年级",
      gradeFilterLabel: "知识年级筛选",
      gradeSliderLabel: "选择年级",
      title: "中小学英语知识图谱",
      eyebrow: "3–9 年级 英语 · 知识图谱",
      searchPlaceholder: "搜索一个英语知识点…",
      heroCopy: (n, d, l) =>
        `${l} 个课时被拆解为 ${n} 个原子知识点。<br />让教材中的知识脉络，从此清晰可见。`,
      footer: "中小学英语知识图谱 · 依 2022 版英语课标与人教版/新目标教材结构梳理",
    },
    math: {
      label: "数学",
      data: () => window.MARBLE_DATA_MATH,
      colors: MATH_COLORS,
      subjectOrder: Object.keys(MATH_COLORS),
      ageMin: 6,
      ageMax: 15,
      gradeMin: 1,
      gradeMax: 9,
      gradeParse: (s) => Number.parseInt(s, 10) || 1,
      gradeLabel: (n) => String(n),
      gradeUnit: "年级",
      gradeAxisLabel: "知识成长年级",
      gradeFilterLabel: "知识年级筛选",
      gradeSliderLabel: "选择年级",
      title: "中小学数学知识图谱",
      eyebrow: "1–9 年级 数学 · 知识图谱",
      searchPlaceholder: "搜索一个数学知识点…",
      heroCopy: (n, d, l) =>
        `${l} 个课时被拆解为 ${n} 个原子知识点。<br />让教材中的知识脉络，从此清晰可见。`,
      footer: "中小学数学知识图谱 · 依义务教育数学课标与人教版教材结构梳理",
    },
    german: {
      label: "德语",
      data: () => window.MARBLE_DATA_GERMAN,
      colors: DE_COLORS,
      subjectOrder: Object.keys(DE_COLORS),
      ageMin: 16,
      ageMax: 25,
      gradeMin: 1,
      gradeMax: 10,
      gradeParse: (s) => {
        const i = CEFR_LABELS.indexOf(s);
        return i >= 0 ? i + 1 : 1;
      },
      gradeLabel: (n) => CEFR_LABELS[n - 1] || String(n),
      gradeUnit: "",
      gradeAxisLabel: "知识成长等级",
      gradeFilterLabel: "知识等级筛选",
      gradeSliderLabel: "选择 CEFR 等级",
      title: "德语学习知识图谱",
      eyebrow: "A1–C1 德语 · 知识图谱",
      searchPlaceholder: "搜索一个德语知识点…",
      heroCopy: (n, d, l) =>
        `${l} 个课时被拆解为 ${n} 个原子知识点。<br />让新求精中的知识脉络，从此清晰可见。`,
      footer: "德语学习知识图谱 · 依欧标 CEFR 与《新求精德语强化教程》结构梳理",
    },
  };

  let currentSubject = "german";
  let COLORS = EN_COLORS;

  function blendWithBackground(hex, amount = 0.42) {
    const value = hex.replace("#", "");
    const source = Number.parseInt(value, 16);
    const background = 0x0d1340;
    const channel = (shift) => {
      const sourceValue = (source >> shift) & 0xff;
      const backgroundValue = (background >> shift) & 0xff;
      return Math.round(backgroundValue + (sourceValue - backgroundValue) * amount);
    };
    return `#${[channel(16), channel(8), channel(0)]
      .map((part) => part.toString(16).padStart(2, "0"))
      .join("")}`;
  }

  let DIMMED_COLORS = Object.fromEntries(
    Object.entries(COLORS).map(([subject, color]) => [
      subject,
      blendWithBackground(color),
    ])
  );

  let SUBJECT_ORDER = Object.keys(EN_COLORS);

  let SUBJECT_ZH = Object.fromEntries(SUBJECT_ORDER.map((s) => [s, s]));

  let DOMAIN_ZH = Object.fromEntries(SUBJECT_ORDER.map((s) => [s, s]));

  let AGE_MIN = 8;
  let AGE_MAX = 15;
  let GRADE_MIN = 3;
  let GRADE_MAX = 9;
  let GRADE_PARSE = SUBJECT_CONFIG.english.gradeParse;
  let GRADE_LABEL = SUBJECT_CONFIG.english.gradeLabel;
  let GRADE_UNIT = SUBJECT_CONFIG.english.gradeUnit;
  const HEIGHT = 430;
  const R_BOTTOM = 48;
  const R_TOP = 308;
  const BRANCH_COUNT = 12;
  const LAYOUT_ITERS = 100;
  const FOCUS_MAX_DEPTH = 3;
  const FOCUS_MAX_NODES = 90;

  const $ = (id) => document.getElementById(id);
  const status = $("status");
  const subjectsEl = $("subjects");
  const panel = $("panel");
  const panelEmpty = $("panelEmpty");
  const panelBody = $("panelBody");

  let store = null;
  let Graph = null;
  let active = new Set(SUBJECT_ORDER);
  let gradeLimit = GRADE_MAX;
  let gradePlaying = false;
  let gradeTimer = 0;
  let gradeRefreshTimer = 0;
  let focus = new Set();
  let focusLinks = new Set();
  let revealedFocus = new Set();
  let revealedFocusLinks = new Set();
  let prereqLinks = new Set();
  let unlockLinks = new Set();
  let selected = null;
  let focusDimmed = false;
  let focusTransitionTimer = 0;
  let spinning = true;
  let spinAng = Math.atan2(520, 420);
  let spinRadius = Math.hypot(420, 520);
  let spinY = 80;
  let lookAt = { x: 0, y: 0, z: 0 };
  let refreshFrame = 0;
  let revealToken = 0;
  let focusMarker = null;
  let nodeAura = null;
  let starField = null;
  let entryRevealPoints = null;
  let entryRevealLines = null;
  let entryRevealActive = true;
  let entryRevealStarted = false;
  let entryRevealAnimating = false;
  let entryRevealStartedAt = 0;
  let entryRevealFadeAt = 0;
  let entryStatusAt = 0;
  let ambientLinks = new Set();
  let introStarted = false;
  let introFinished = false;
  let demoActive = false;
  let demoRoute = [];
  let demoIndex = 0;
  let demoTimer = 0;
  const SPIN_SPEED = 0.0042;
  const PATH_STAGE_DELAY = 230;
  const DEMO_STEP_TIME = 6800;
  const FOCUS_ORIENT_DURATION = 980;
  const FOCUS_DIM_DELAY = 680;
  const EMPTY_LINKS = new Set();

  function scheduleRefresh() {
    if (!Graph || refreshFrame) return;
    refreshFrame = requestAnimationFrame(() => {
      refreshFrame = 0;
      syncNodeAuraVisibility();
      Graph.nodeVisibility(nodeIsVisible);
      Graph.linkVisibility(graphLinkIsVisible);
      Graph.refresh();
    });
  }

  function glowTexture() {
    if (glowTexture._texture) return glowTexture._texture;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.08, "rgba(187,255,244,.95)");
    g.addColorStop(0.25, "rgba(113,229,209,.42)");
    g.addColorStop(0.58, "rgba(116,93,226,.14)");
    g.addColorStop(1, "rgba(70,50,170,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    glowTexture._texture = texture;
    return glowTexture._texture;
  }

  function initFocusMarker() {
    focusMarker = new THREE.Group();
    focusMarker.visible = false;

    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(),
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    halo.name = "halo";
    halo.scale.set(34, 34, 1);
    focusMarker.add(halo);

    const sparkPositions = new Float32Array([
      -14, 3, 1, 12, -5, 2, -4, 13, -2, 5, -12, 3,
      -9, -8, -4, 14, 7, -1, 2, 16, 2, -16, -2, 1,
    ]);
    const sparkGeometry = new THREE.BufferGeometry();
    sparkGeometry.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
    const sparks = new THREE.Points(
      sparkGeometry,
      new THREE.PointsMaterial({
        color: 0xb8fff3,
        size: 5.5,
        map: glowTexture(),
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })
    );
    sparks.name = "sparks";
    sparks.frustumCulled = false;
    focusMarker.add(sparks);
    Graph.scene().add(focusMarker);
  }

  function showFocusMarker(node) {
    if (!focusMarker || !node) return;
    focusMarker.position.set(node.x || 0, node.y || 0, node.z || 0);
    focusMarker.visible = true;
  }

  function hideFocusMarker() {
    if (focusMarker) focusMarker.visible = false;
  }

  function animateFocusMarker(now) {
    if (!focusMarker || !focusMarker.visible || !Graph) return;
    focusMarker.quaternion.copy(Graph.camera().quaternion);
    const sparks = focusMarker.getObjectByName("sparks");
    const halo = focusMarker.getObjectByName("halo");
    if (sparks) {
      sparks.rotation.z = now * 0.00042;
      sparks.rotation.y = now * 0.00025;
      const sparkPulse = 0.94 + Math.sin(now * 0.005) * 0.08;
      sparks.scale.setScalar(sparkPulse);
    }
    if (halo) {
      const pulse = 32 + Math.sin(now * 0.004) * 3;
      halo.scale.set(pulse, pulse, 1);
    }
  }

  function initCosmicScene() {
    const starCount = 680;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const angle = hash01(`star:${i}`) * Math.PI * 2;
      const radius = 430 + hash01(`star:r:${i}`) * 520;
      starPositions[i * 3] = Math.cos(angle) * radius;
      starPositions[i * 3 + 1] = (hash01(`star:y:${i}`) - 0.5) * 920;
      starPositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starField = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0xa7b8d2,
        size: 4.2,
        map: glowTexture(),
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })
    );
    starField.frustumCulled = false;
    Graph.scene().add(starField);
  }

  function rebuildNodeAura(nodes) {
    if (nodeAura) {
      Graph.scene().remove(nodeAura);
      nodeAura.geometry.dispose();
      nodeAura.material.dispose();
    }
    const positions = new Float32Array(nodes.length * 3);
    const colors = new Float32Array(nodes.length * 3);
    const ids = [];
    const grades = [];
    nodes.forEach((node, index) => {
      positions[index * 3] = node.x || 0;
      positions[index * 3 + 1] = node.y || 0;
      positions[index * 3 + 2] = node.z || 0;
      const color = new THREE.Color(COLORS[node.subject] || "#ffffff");
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
      ids.push(node.id);
      grades.push(node.gradeLevel);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    nodeAura = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: 15,
        map: glowTexture(),
        transparent: true,
        opacity: 0.48,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })
    );
    nodeAura.frustumCulled = false;
    nodeAura.userData.ids = ids;
    nodeAura.userData.grades = grades;
    nodeAura.userData.basePositions = positions;
    Graph.scene().add(nodeAura);
    syncNodeAuraVisibility();
  }

  function syncNodeAuraVisibility() {
    if (!nodeAura) return;
    const positions = nodeAura.geometry.getAttribute("position");
    const base = nodeAura.userData.basePositions;
    const ids = nodeAura.userData.ids;
    const grades = nodeAura.userData.grades;
    for (let i = 0; i < ids.length; i++) {
      const visible = selected
        ? (!focusDimmed || revealedFocus.has(ids[i])) && grades[i] <= gradeLimit
        : !entryRevealActive && grades[i] <= gradeLimit;
      const offset = i * 3;
      positions.array[offset] = visible ? base[offset] : 100000;
      positions.array[offset + 1] = visible ? base[offset + 1] : 100000;
      positions.array[offset + 2] = visible ? base[offset + 2] : 100000;
    }
    positions.needsUpdate = true;
  }

  function disposeEntryRevealObject(object) {
    if (!object) return;
    Graph.scene().remove(object);
    object.geometry.dispose();
    object.material.dispose();
  }

  function rebuildEntryRevealLayer(nodes, links) {
    disposeEntryRevealObject(entryRevealPoints);
    disposeEntryRevealObject(entryRevealLines);

    const nodePositions = new Float32Array(nodes.length * 3);
    const nodeColors = new Float32Array(nodes.length * 3);
    const nodeById = new Map();
    nodes.forEach((node, index) => {
      nodePositions[index * 3] = node.x || 0;
      nodePositions[index * 3 + 1] = node.y || 0;
      nodePositions[index * 3 + 2] = node.z || 0;
      const color = new THREE.Color(COLORS[node.subject] || "#ffffff");
      nodeColors[index * 3] = color.r;
      nodeColors[index * 3 + 1] = color.g;
      nodeColors[index * 3 + 2] = color.b;
      nodeById.set(node.id, node);
    });

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    pointGeometry.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));
    const pointUniforms = {
      uRevealY: { value: -HEIGHT / 2 - 80 },
      uOpacity: { value: 1 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uTexture: { value: glowTexture() },
    };
    entryRevealPoints = new THREE.Points(
      pointGeometry,
      new THREE.ShaderMaterial({
        uniforms: pointUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          attribute vec3 color;
          varying vec3 vColor;
          varying float vAlpha;
          varying float vWave;
          uniform float uRevealY;
          uniform float uPixelRatio;
          void main() {
            float delta = uRevealY - position.y;
            float revealed = smoothstep(-14.0, 5.0, delta);
            float wave = exp(-abs(delta) * 0.038);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = clamp((7.0 + wave * 28.0) * uPixelRatio * (270.0 / max(90.0, -mvPosition.z)), 3.0, 44.0);
            vColor = color;
            vAlpha = revealed * (0.34 + wave * 0.95);
            vWave = wave;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;
          varying float vWave;
          uniform float uOpacity;
          uniform sampler2D uTexture;
          void main() {
            vec4 glow = texture2D(uTexture, gl_PointCoord);
            float alpha = glow.a * vAlpha * uOpacity;
            if (alpha < 0.012) discard;
            gl_FragColor = vec4(vColor * (1.0 + vWave * 1.45), alpha);
          }
        `,
      })
    );
    entryRevealPoints.frustumCulled = false;
    entryRevealPoints.visible = entryRevealActive;
    Graph.scene().add(entryRevealPoints);

    const linePositions = [];
    const lineColors = [];
    for (const link of links) {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source;
      const targetId = typeof link.target === "object" ? link.target.id : link.target;
      const source = nodeById.get(sourceId);
      const target = nodeById.get(targetId);
      if (!source || !target) continue;
      linePositions.push(source.x, source.y, source.z, target.x, target.y, target.z);
      const sourceColor = new THREE.Color(COLORS[source.subject] || "#ffffff");
      const targetColor = new THREE.Color(COLORS[target.subject] || "#ffffff");
      lineColors.push(
        sourceColor.r, sourceColor.g, sourceColor.b,
        targetColor.r, targetColor.g, targetColor.b
      );
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    );
    lineGeometry.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 3));
    entryRevealLines = new THREE.LineSegments(
      lineGeometry,
      new THREE.ShaderMaterial({
        uniforms: {
          uRevealY: pointUniforms.uRevealY,
          uOpacity: pointUniforms.uOpacity,
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          attribute vec3 color;
          varying vec3 vColor;
          varying float vY;
          void main() {
            vColor = color;
            vY = position.y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vY;
          uniform float uRevealY;
          uniform float uOpacity;
          void main() {
            float delta = uRevealY - vY;
            float revealed = smoothstep(-10.0, 7.0, delta);
            float wave = exp(-abs(delta) * 0.045);
            float alpha = revealed * (0.045 + wave * 0.78) * uOpacity;
            if (alpha < 0.008) discard;
            gl_FragColor = vec4(vColor * (0.82 + wave * 1.35), alpha);
          }
        `,
      })
    );
    entryRevealLines.frustumCulled = false;
    entryRevealLines.visible = entryRevealActive;
    Graph.scene().add(entryRevealLines);
  }

  function nodeIsVisible(node) {
    if (selected) return node.gradeLevel <= gradeLimit;
    return !entryRevealActive && node.gradeLevel <= gradeLimit;
  }

  function entryLinkIsVisible(link) {
    if (entryRevealActive) return false;
    const source = typeof link.source === "object" ? link.source : store.byId.get(link.source);
    const target = typeof link.target === "object" ? link.target : store.byId.get(link.target);
    return Boolean(
      source &&
        target &&
        source.gradeLevel <= gradeLimit &&
        target.gradeLevel <= gradeLimit
    );
  }

  function graphLinkIsVisible(link) {
    return entryLinkIsVisible(link);
  }

  function animateCosmicScene(now) {
    if (starField) {
      starField.rotation.y = now * 0.000006;
      starField.rotation.x = Math.sin(now * 0.00008) * 0.025;
      starField.material.opacity = selected ? 0.12 : 0.24 + Math.sin(now * 0.001) * 0.04;
    }
    if (nodeAura) {
      nodeAura.material.opacity = selected && focusDimmed
        ? 0.62 + Math.sin(now * 0.003) * 0.12
        : 0.38 + Math.sin(now * 0.0014) * 0.1;
    }
    animateEntryReveal(now);
  }

  function playEntryReveal() {
    if (entryRevealStarted || !Graph) return;
    entryRevealStarted = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      finishEntryReveal(true);
      return;
    }

    entryRevealActive = true;
    entryRevealAnimating = true;
    entryRevealStartedAt = performance.now();
    entryRevealFadeAt = 0;
    if (entryRevealPoints) {
      entryRevealPoints.visible = true;
      entryRevealPoints.material.uniforms.uRevealY.value = -HEIGHT / 2 - 80;
      entryRevealPoints.material.uniforms.uOpacity.value = 1;
    }
    if (entryRevealLines) {
      entryRevealLines.visible = true;
      entryRevealLines.material.uniforms.uRevealY.value = -HEIGHT / 2 - 80;
      entryRevealLines.material.uniforms.uOpacity.value = 1;
    }
    pauseSpin();

    Graph.cameraPosition(orbitCameraPosition(1.13), lookAt);
    requestAnimationFrame(() => {
      if (entryRevealAnimating) {
        Graph.cameraPosition(orbitCameraPosition(), lookAt, 2500);
      }
    });
  }

  function animateEntryReveal(now) {
    if (entryRevealAnimating && entryRevealPoints) {
      const duration = 3200;
      const progress = Math.min(1, (now - entryRevealStartedAt) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      const revealY = -HEIGHT / 2 - 55 + eased * (HEIGHT + 110);
      entryRevealPoints.material.uniforms.uRevealY.value = revealY;
      if (entryRevealLines) {
        entryRevealLines.material.uniforms.uRevealY.value = revealY;
      }
      if (now - entryStatusAt > 220) {
        entryStatusAt = now;
        status.textContent = `正在唤醒知识宇宙 · ${Math.round(progress * 100)}%`;
      }
      if (progress >= 1) finishEntryReveal(false);
    }

    if (entryRevealFadeAt && entryRevealPoints) {
      const fade = Math.min(1, (now - entryRevealFadeAt) / 620);
      entryRevealPoints.material.uniforms.uOpacity.value = 1 - fade;
      if (entryRevealLines) {
        entryRevealLines.material.uniforms.uOpacity.value = 1 - fade;
      }
      if (fade >= 1) {
        entryRevealFadeAt = 0;
        entryRevealPoints.visible = false;
        if (entryRevealLines) entryRevealLines.visible = false;
      }
    }
  }

  function finishEntryReveal(instant = false) {
    entryRevealAnimating = false;
    entryRevealActive = false;
    scheduleRefresh();
    if (entryRevealPoints) {
      if (instant) {
        entryRevealPoints.material.uniforms.uOpacity.value = 0;
        entryRevealPoints.visible = false;
        if (entryRevealLines) {
          entryRevealLines.material.uniforms.uOpacity.value = 0;
          entryRevealLines.visible = false;
        }
      } else {
        entryRevealFadeAt = performance.now();
      }
    }
    status.textContent = `${Graph.graphData().nodes.length} 个知识主题已全部点亮`;
    if (!selected) resumeSpin(instant ? 160 : 720);
  }

  function updateGradeUi(updateStatus = true) {
    const progress = (gradeLimit - GRADE_MIN) / (GRADE_MAX - GRADE_MIN);
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const gradeText = GRADE_LABEL(gradeLimit);
    $("ageValue").textContent = gradeText;
    $("ageAxisValue").textContent = gradeText;
    $("ageSlider").value = gradeLimit;
    $("timelineDock").style.setProperty("--age-progress", clampedProgress);

    if (!Graph) return;
    const graphData = Graph.graphData();
    const visibleNodes = graphData.nodes.filter((node) => node.gradeLevel <= gradeLimit);
    const visibleIds = new Set(visibleNodes.map((node) => node.id));
    const visibleLinks = graphData.links.filter((link) => {
      const source = typeof link.source === "object" ? link.source.id : link.source;
      const target = typeof link.target === "object" ? link.target.id : link.target;
      return visibleIds.has(source) && visibleIds.has(target);
    });
    const visibleLearningLinks = visibleLinks.filter(
      (link) => link.kind === "prerequisite"
    );
    $("ageNodeCount").textContent = visibleNodes.length.toLocaleString("zh-CN");
    $("ageLinkCount").textContent = visibleLearningLinks.length.toLocaleString("zh-CN");
    if (updateStatus && !entryRevealActive) {
      status.textContent = `${gradeText}${GRADE_UNIT ? " " + GRADE_UNIT : ""} · ${visibleNodes.length} 个知识主题 · ${visibleLearningLinks.length} 条先修关系`;
    }
  }

  function scheduleGradeRefresh() {
    if (gradeRefreshTimer) return;
    gradeRefreshTimer = window.setTimeout(() => {
      gradeRefreshTimer = 0;
      scheduleRefresh();
    }, 55);
  }

  function setGradeLimit(value, source = "manual") {
    const nextGrade = Math.max(GRADE_MIN, Math.min(GRADE_MAX, Number(value)));
    if (source === "manual") {
      if (entryRevealActive) finishEntryReveal(true);
      if (demoActive) stopDemo(true);
      if (selected) closePanel();
    }
    gradeLimit = nextGrade;
    updateGradeUi(true);
    scheduleGradeRefresh();
  }

  function stopGradePlayback() {
    if (!gradePlaying) return;
    gradePlaying = false;
    window.clearInterval(gradeTimer);
    $("agePlay").classList.remove("on");
    $("agePlay").innerHTML = '<i aria-hidden="true">▶</i> 自动生长';
    $("agePlay").setAttribute("aria-label", `自动播放${GRADE_UNIT || "等级"}成长路径`);
  }

  function startGradePlayback() {
    if (gradePlaying) return;
    if (entryRevealActive) finishEntryReveal(true);
    if (demoActive) stopDemo(true);
    if (selected) closePanel();
    gradePlaying = true;
    $("agePlay").classList.add("on");
    $("agePlay").innerHTML = '<i aria-hidden="true">■</i> 停止生长';
    $("agePlay").setAttribute("aria-label", `停止播放${GRADE_UNIT || "等级"}成长路径`);
    if (gradeLimit >= GRADE_MAX) setGradeLimit(GRADE_MIN, "playback");
    else setGradeLimit(Math.floor(gradeLimit), "playback");
    gradeTimer = window.setInterval(() => {
      if (gradeLimit >= GRADE_MAX) {
        stopGradePlayback();
        return;
      }
      const nextGrade = Math.min(GRADE_MAX, gradeLimit + 1);
      setGradeLimit(nextGrade, "playback");
      if (nextGrade >= GRADE_MAX) stopGradePlayback();
    }, 760);
  }

  function normalize(
    topics,
    deps,
    lessonRecords,
    topicMetadata,
    lessonTopicLinks,
    curriculumSequence
  ) {
    const lessonsById = new Map(
      (lessonRecords?.lessons || []).map((lesson) => [lesson.id, lesson])
    );
    const metadataById = new Map(
      (topicMetadata?.topics || []).map((item) => [item.topicId, item])
    );
    const lessonTopicsByLesson = new Map();
    for (const link of lessonTopicLinks?.links || []) {
      if (!lessonTopicsByLesson.has(link.lessonId)) {
        lessonTopicsByLesson.set(link.lessonId, []);
      }
      lessonTopicsByLesson.get(link.lessonId).push(link);
    }
    for (const links of lessonTopicsByLesson.values()) {
      links.sort((a, b) => a.localOrder - b.localOrder);
    }
    const nodes = topics.topics.map((t) => {
      const meta = metadataById.get(t.id) || {};
      const lesson = lessonsById.get(meta.lessonId) || null;
      return {
        id: t.id,
        name: t.name,
        nameEn: t.name,
        subject: t.domain,
        domain: t.domain,
        ageStart: t.ageRangeStart,
        ageEnd: t.ageRangeEnd,
        ageMid: (t.ageRangeStart + t.ageRangeEnd) / 2,
        description: t.description,
        evidence: t.evidence || [],
        centrality: t.centrality || 0,
        type: t.type,
        lessonId: meta.lessonId || null,
        lesson,
        curriculumT: null,
        grade: meta.grade || "",
        gradeLevel: GRADE_PARSE(meta.grade) || GRADE_MIN,
        conceptKey: meta.conceptKey || "",
        conceptLabel: meta.conceptLabel || "",
        localOrder: meta.localOrder || 1,
      };
    });

    // 按所有微节点而非课时均匀分配课程进度，避免多节点课时在底部堆积。
    const orderedNodes = [...nodes].sort((a, b) => {
      const aSequence = Number(a.lesson?.sequence);
      const bSequence = Number(b.lesson?.sequence);
      const sequenceDelta =
        (Number.isFinite(aSequence) ? aSequence : Number.MAX_SAFE_INTEGER) -
        (Number.isFinite(bSequence) ? bSequence : Number.MAX_SAFE_INTEGER);
      return sequenceDelta || a.localOrder - b.localOrder || a.id.localeCompare(b.id);
    });
    const progressDenominator = Math.max(1, orderedNodes.length - 1);
    orderedNodes.forEach((node, index) => {
      node.curriculumT = index / progressDenominator;
      node.layoutOrder = index;
    });

    // 先按概念成组，再把大组优先分配到当前负载较低的分支。
    // 保留少量分支容量差异，让整体有疏密呼吸，但避免局部极端拥挤或空洞。
    const conceptGroups = new Map();
    for (const node of nodes) {
      const key = node.conceptKey || node.subject || node.id;
      if (!conceptGroups.has(key)) conceptGroups.set(key, []);
      conceptGroups.get(key).push(node);
    }
    const branchLoads = Array.from({ length: BRANCH_COUNT }, () => 0);
    const sortedConceptGroups = [...conceptGroups.entries()].sort(
      (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])
    );
    for (const [key, group] of sortedConceptGroups) {
      const startLane = Math.floor(hash01(key + ":lane") * BRANCH_COUNT);
      let bestLane = startLane;
      let bestScore = Infinity;
      for (let offset = 0; offset < BRANCH_COUNT; offset++) {
        const lane = (startLane + offset) % BRANCH_COUNT;
        const capacity = 0.94 + hash01("branch-capacity:" + lane) * 0.12;
        const score = branchLoads[lane] / capacity;
        if (score < bestScore) {
          bestScore = score;
          bestLane = lane;
        }
      }
      group.sort((a, b) => a.curriculumT - b.curriculumT || a.id.localeCompare(b.id));
      group.forEach((node, index) => {
        node.branchLane = bestLane;
        node.conceptRank = index;
        node.conceptCount = group.length;
      });
      branchLoads[bestLane] += group.length;
    }

    const byId = new Map(nodes.map((n) => [n.id, n]));
    const prereqOf = new Map();
    const unlocks = new Map();
    const links = [];
    const edgeKeys = new Set();

    for (const d of deps.dependencies) {
      if (!byId.has(d.topicId) || !byId.has(d.prerequisiteId)) continue;
      edgeKeys.add(`${d.prerequisiteId}→${d.topicId}`);
      links.push({
        source: d.prerequisiteId,
        target: d.topicId,
        strength: d.strength,
        kind: "prerequisite",
        reason: d.reason,
      });
      if (!prereqOf.has(d.topicId)) prereqOf.set(d.topicId, []);
      prereqOf.get(d.topicId).push(d.prerequisiteId);
      if (!unlocks.has(d.prerequisiteId)) unlocks.set(d.prerequisiteId, []);
      unlocks.get(d.prerequisiteId).push(d.topicId);
    }
    const dependencyLinkCount = links.length;

    // 同一课时只连接相邻微节点，保留教学语境，同时避免关系过密。
    for (const [lessonId, lessonLinks] of lessonTopicsByLesson) {
      for (let index = 1; index < lessonLinks.length; index++) {
        const source = lessonLinks[index - 1]?.topicId;
        const target = lessonLinks[index]?.topicId;
        if (!source || !target || source === target) continue;
        if (!byId.has(source) || !byId.has(target)) continue;
        const key = `${source}→${target}`;
        if (edgeKeys.has(key)) continue;
        edgeKeys.add(key);
        links.push({
          source,
          target,
          strength: "association",
          kind: "association",
          scope: "lesson",
          lessonId,
          reason: "同一课时内相邻微节点的教学语境关联",
        });
      }
    }

    for (const edge of curriculumSequence?.edges || []) {
      const fromTopics = lessonTopicsByLesson.get(edge.fromLessonId) || [];
      const toTopics = lessonTopicsByLesson.get(edge.toLessonId) || [];
      const source = fromTopics[fromTopics.length - 1]?.topicId;
      const target = toTopics[0]?.topicId;
      if (!source || !target || source === target) continue;
      if (!byId.has(source) || !byId.has(target)) continue;
      const key = `${source}→${target}`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      links.push({
        source,
        target,
        strength: "sequence",
        kind: "sequence",
        scope: edge.scope,
        reason: edge.reason,
      });
    }
    return {
      nodes,
      links,
      dependencyLinkCount,
      associationLinkCount: links.filter((link) => link.kind === "association").length,
      sequenceLinkCount: links.filter((link) => link.kind === "sequence").length,
      byId,
      prereqOf,
      unlocks,
      lessonsById,
      metadataById,
      lessonTopicsByLesson,
    };
  }

  function hash01(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  }

  function ageT(n) {
    return Math.min(1, Math.max(0, (n.ageMid - AGE_MIN) / (AGE_MAX - AGE_MIN)));
  }

  function growthT(n) {
    const curriculum = Number.isFinite(n.curriculumT) ? n.curriculumT : ageT(n);
    return Math.min(1, Math.max(0, curriculum * 0.9 + ageT(n) * 0.1));
  }

  function ageY(n) {
    return growthT(n) * HEIGHT - HEIGHT / 2;
  }

  function targetRadius(n) {
    const t = growthT(n);
    const ease = t * 0.82 + Math.sqrt(t) * 0.18;
    return R_BOTTOM + (R_TOP - R_BOTTOM) * ease;
  }

  function seedPoint(n) {
    const y0 = ageY(n);
    const ringR = targetRadius(n);
    const w = hash01(n.id + ":y");
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const conceptSeed = n.conceptKey || n.subject || n.id;
    const t = growthT(n);
    const branchLane = Number.isFinite(n.branchLane)
      ? n.branchLane
      : Math.floor(hash01(conceptSeed + ":lane") * BRANCH_COUNT);
    const laneWarp = (hash01("branch-lane:" + branchLane) - 0.5) * 0.46;
    const laneAngle = (branchLane / BRANCH_COUNT) * Math.PI * 2 + laneWarp;
    const conceptDrift = (hash01(conceptSeed + ":drift") - 0.5) * 0.34;
    const branchTwist =
      (t - 0.5) * (hash01(conceptSeed + ":twist") - 0.5) * 1.25;
    const wobbleRate = 1.5 + hash01(conceptSeed + ":rate") * 1.8;
    const wobblePhase = hash01(conceptSeed + ":phase") * Math.PI * 2;
    const wobble = Math.sin(t * Math.PI * wobbleRate + wobblePhase) * 0.14;
    const localJitter = (hash01(n.id + ":angle") - 0.5) * 0.22;
    const rankUnit = ((n.conceptRank || 0) * 0.61803398875) % 1;
    const groupSpread = 0.12 + Math.min(0.32, Math.log2((n.conceptCount || 1) + 1) * 0.055);
    const rankSpread = (rankUnit - 0.5) * groupSpread * 2;
    const scatterAngle = (n.layoutOrder || 0) * goldenAngle + localJitter;
    const branchAngle = laneAngle + conceptDrift + branchTwist + wobble + rankSpread;
    const branchWeight = 0.8;
    const angle = Math.atan2(
      Math.sin(scatterAngle) * (1 - branchWeight) + Math.sin(branchAngle) * branchWeight,
      Math.cos(scatterAngle) * (1 - branchWeight) + Math.cos(branchAngle) * branchWeight
    );
    const depthSeed = hash01(n.id + ":depth");
    const radiusSeed = hash01(n.id + ":radius");
    const centralityNorm = Math.min(
      1,
      Math.max(0, ((n.centrality || 0.08) - 0.08) / 0.12)
    );
    const innerShare = 0.11 + centralityNorm * 0.1;
    let radiusFactor;
    if (depthSeed < 0.025 && centralityNorm < 0.72) {
      // 极少数低连接叶节点游离于主轮廓之外，保留参考图中的自然毛边。
      radiusFactor = 1.04 + radiusSeed * 0.15;
    } else if (depthSeed < 0.025 + innerShare) {
      // 连接重要性越高，进入内部参与跨区域织网的概率越大。
      radiusFactor = 0.18 + 0.56 * Math.sqrt(radiusSeed);
    } else {
      // 外壁由不规则枝状簇构成：同一概念共享大致半径，节点只作局部扰动。
      const shellBand = 0.84 + hash01(conceptSeed + ":shell") * 0.1;
      radiusFactor = Math.min(
        1.03,
        Math.max(0.74, shellBand + (radiusSeed - 0.5) * 0.17)
      );
    }
    const r = ringR * radiusFactor;
    return {
      x: Math.cos(angle) * r,
      y: y0 + (w - 0.5) * 12,
      z: Math.sin(angle) * r,
    };
  }

  function weaveLayout(nodes, links) {
    const byId = new Map();
    const pts = nodes.map((n) => {
      const s = seedPoint(n);
      const p = {
        id: n.id,
        subject: n.subject,
        ageMid: n.ageMid,
        centrality: n.centrality || 0,
        x: s.x,
        y: s.y,
        z: s.z,
        vx: 0,
        vy: 0,
        vz: 0,
        yTarget: ageY(n) + (hash01(n.id + ":flow") - 0.5) * 14,
        rTarget: Math.hypot(s.x, s.z),
        xTarget: s.x,
        zTarget: s.z,
      };
      byId.set(n.id, p);
      return p;
    });

    const edges = [];
    for (const l of links) {
      const a = byId.get(l.source);
      const b = byId.get(l.target);
      if (!a || !b) continue;
      edges.push({
        a,
        b,
        w:
          l.strength === "hard"
            ? 0.027
            : l.kind === "association"
              ? 0.012
              : l.kind === "sequence"
                ? 0.007
                : 0.014,
        ideal:
          l.strength === "hard"
            ? 40
            : l.kind === "association"
              ? 38
              : l.kind === "sequence"
                ? 52
                : 48,
      });
    }

    for (let iter = 0; iter < LAYOUT_ITERS; iter++) {
      const cool = Math.pow(1 - iter / LAYOUT_ITERS, 0.7);

      for (const e of edges) {
        const dx = e.b.x - e.a.x;
        const dy = e.b.y - e.a.y;
        const dz = e.b.z - e.a.z;
        const dist = Math.hypot(dx, dy, dz) || 0.01;
        const f = ((dist - e.ideal) / dist) * e.w * cool;
        e.a.vx += dx * f;
        e.a.vy += dy * f * 0.55;
        e.a.vz += dz * f;
        e.b.vx -= dx * f;
        e.b.vy -= dy * f * 0.55;
        e.b.vz -= dz * f;
      }

      const n = pts.length;
      const step = Math.max(1, Math.floor(n / 420));
      for (let i = 0; i < n; i++) {
        const a = pts[i];
        for (let j = i + step; j < n; j += step) {
          const b = pts[j];
          if (Math.abs(a.y - b.y) > 70) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dz = b.z - a.z;
          const dist = Math.hypot(dx, dy, dz) || 0.01;
          const minD = 15.5;
          if (dist >= minD) continue;
          const push = ((minD - dist) / dist) * 0.07 * cool;
          a.vx -= dx * push;
          a.vy -= dy * push * 0.35;
          a.vz -= dz * push;
          b.vx += dx * push;
          b.vy += dy * push * 0.35;
          b.vz += dz * push;
        }
      }

      for (const p of pts) {
        // 年龄保持连续生长；领域脉络锚点让关系形成可追踪的知识流线。
        p.vy += (p.yTarget - p.y) * (0.018 + 0.018 * cool);
        p.vx += (p.xTarget - p.x) * (0.003 + 0.005 * cool);
        p.vz += (p.zTarget - p.z) * (0.003 + 0.005 * cool);

        // 保留上宽下窄轮廓，但每个节点拥有不同半径，不再形成整齐圆环。
        const r = Math.hypot(p.x, p.z) || 0.01;
        const prefer = p.rTarget;
        const radial = (prefer - r) * (0.009 + 0.019 * cool);
        p.vx += (p.x / r) * radial;
        p.vz += (p.z / r) * radial;

        // 若太贴轴心，额外强推开
        if (r < p.rTarget * 0.24) {
          const kick = (p.rTarget * 0.24 - r) * 0.06;
          p.vx += (p.x / r) * kick;
          p.vz += (p.z / r) * kick;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.vx *= 0.75;
        p.vy *= 0.75;
        p.vz *= 0.75;

        const yLo = -HEIGHT / 2 - 40;
        const yHi = HEIGHT / 2 + 40;
        if (p.y < yLo) p.y = yLo;
        if (p.y > yHi) p.y = yHi;

        if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) {
          const s = seedPoint(p);
          p.x = s.x;
          p.y = s.y;
          p.z = s.z;
          p.vx = p.vy = p.vz = 0;
        }
      }
    }

    return pts;
  }

  function filtered() {
    const nodes = store.nodes.filter((n) => active.has(n.subject));
    const ids = new Set(nodes.map((n) => n.id));
    const links = store.links.filter(
      (l) => ids.has(l.source) && ids.has(l.target)
    );
    return { nodes, links };
  }

  /** 根据图谱边界与界面浮层占位，自适应完整取景。 */
  function frameGraph(gNodes, duration = 0) {
    let minY = Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const n of gNodes) {
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.z < minZ) minZ = n.z;
      if (n.z > maxZ) maxZ = n.z;
    }
    if (!Number.isFinite(minY)) {
      lookAt = { x: 0, y: 0, z: 0 };
      return;
    }

    const center = new THREE.Vector3(
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2
    );
    const graphRect = $("graph").getBoundingClientRect();
    const viewportWidth = Math.max(1, graphRect.width || window.innerWidth);
    const viewportHeight = Math.max(1, graphRect.height || window.innerHeight);
    const desktop = viewportWidth >= 760;
    let leftReserve = 26;
    let rightReserve = 26;
    let topReserve = 24;
    let bottomReserve = 24;

    const topbarRect = document.querySelector(".topbar")?.getBoundingClientRect();
    const footerRect = document.querySelector("footer")?.getBoundingClientRect();
    if (topbarRect) topReserve = Math.max(topReserve, topbarRect.bottom - graphRect.top + 18);
    if (footerRect) bottomReserve = Math.max(bottomReserve, graphRect.bottom - footerRect.top + 12);

    if (desktop) {
      const heroRect = document.querySelector(".hero")?.getBoundingClientRect();
      const dockRect = document.querySelector(".subject-dock")?.getBoundingClientRect();
      const timelineRect = $("timelineDock")?.getBoundingClientRect();
      if (heroRect) leftReserve = Math.max(leftReserve, heroRect.right - graphRect.left + 28);
      if (dockRect) leftReserve = Math.max(leftReserve, dockRect.right - graphRect.left + 28);
      if (timelineRect) rightReserve = Math.max(rightReserve, graphRect.right - timelineRect.left + 28);
    }

    const padding = 24;
    const usableWidth = Math.max(300, viewportWidth - leftReserve - rightReserve - padding * 2);
    const usableHeight = Math.max(300, viewportHeight - topReserve - bottomReserve - padding * 2);
    const camera = Graph.camera();
    const verticalFov = THREE.MathUtils.degToRad(camera.fov || 75);
    const tanHalfVertical = Math.tan(verticalFov / 2);
    const tanEffectiveVertical = Math.max(0.18, tanHalfVertical * usableHeight / viewportHeight);
    const tanEffectiveHorizontal = Math.max(0.18, tanHalfVertical * usableWidth / viewportHeight);
    spinAng = Math.atan2(0.78, 0.62);
    const viewBack = new THREE.Vector3(
      Math.cos(spinAng),
      0.13,
      Math.sin(spinAng)
    ).normalize();
    const forward = viewBack.clone().multiplyScalar(-1);
    const cameraRight = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const cameraUp = new THREE.Vector3().crossVectors(cameraRight, forward).normalize();
    let distance = 300;
    const nodePadding = 12;
    for (const node of gNodes) {
      const delta = new THREE.Vector3(node.x, node.y, node.z).sub(center);
      const depth = delta.dot(viewBack);
      const projectedX = Math.abs(delta.dot(cameraRight)) + nodePadding;
      const projectedY = Math.abs(delta.dot(cameraUp)) + nodePadding;
      distance = Math.max(
        distance,
        depth + projectedX / tanEffectiveHorizontal,
        depth + projectedY / tanEffectiveVertical
      );
    }
    distance *= 1.055;
    // 自转轴始终锁定在图谱自身中心，避免图谱围绕偏移后的界面中心公转。
    const target = center.clone();
    const position = target.clone().addScaledVector(viewBack, distance);

    lookAt = { x: target.x, y: target.y, z: target.z };
    spinRadius = Math.hypot(position.x - target.x, position.z - target.z);
    spinY = position.y;
    Graph.cameraPosition(
      { x: position.x, y: position.y, z: position.z },
      lookAt,
      duration
    );
  }

  function orbitCameraPosition(distanceScale = 1) {
    return {
      x: lookAt.x + Math.cos(spinAng) * spinRadius * distanceScale,
      y: lookAt.y + (spinY - lookAt.y) * distanceScale,
      z: lookAt.z + Math.sin(spinAng) * spinRadius * distanceScale,
    };
  }

  function runIntro() {
    if (introStarted || !Graph || !Graph.graphData().nodes.length) return;
    introStarted = true;
    const intro = $("intro");
    intro.classList.add("ready");
    pauseSpin();
    Graph.cameraPosition(orbitCameraPosition(2.15), lookAt);
    runIntro._cameraTimer = window.setTimeout(() => {
      if (introFinished) return;
      Graph.cameraPosition(orbitCameraPosition(), lookAt, 3100);
    }, 420);
    runIntro._finishTimer = window.setTimeout(() => finishIntro(false), 5000);
  }

  function finishIntro(skipped = true) {
    if (introFinished) return;
    introFinished = true;
    window.clearTimeout(runIntro._cameraTimer);
    window.clearTimeout(runIntro._finishTimer);
    const intro = $("intro");
    intro.classList.add("hide");
    intro.setAttribute("aria-hidden", "true");
    document.body.classList.add("scene-ready");
    document.body.classList.add("interface-ready");
    if (skipped && Graph) Graph.cameraPosition(orbitCameraPosition(), lookAt, 720);
    window.setTimeout(() => playEntryReveal(), 520);
    window.setTimeout(() => {
      intro.hidden = true;
    }, 900);
  }

  function apply(onReady) {
    status.textContent = "布局中…";
    const { nodes, links } = filtered();

    requestAnimationFrame(() => {
      const woven = weaveLayout(nodes, links);
      const byPos = new Map(woven.map((p) => [p.id, p]));

      const gNodes = nodes.map((n) => {
        const p = byPos.get(n.id);
        const x = p ? p.x : 0;
        const y = p ? p.y : ageY(n);
        const z = p ? p.z : 0;
        return { ...n, x, y, z, fx: x, fy: y, fz: z };
      });

      Graph.graphData({
        nodes: gNodes,
        links: links.map((l) => ({ ...l })),
      });
      rebuildNodeAura(gNodes);
      rebuildEntryRevealLayer(gNodes, links);
      ambientLinks = new Set(
        links
          .filter((link) => link.kind === "prerequisite")
          .map((link) => {
            const source = store.byId.get(link.source);
            const target = store.byId.get(link.target);
            const score =
              ((source?.centrality || 0) + (target?.centrality || 0)) * 100 +
              hash01(linkKey(link.source, link.target));
            return { key: linkKey(link.source, link.target), score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 72)
          .map((entry) => entry.key)
      );
      Graph.cooldownTicks(0);
      Graph.d3AlphaDecay(1);
      frameGraph(gNodes);
      spinning = true;
      if (typeof Graph.resumeAnimation === "function") Graph.resumeAnimation();
      const learningLinkCount = links.filter(
        (link) => link.kind === "prerequisite"
      ).length;
      status.textContent = `${gNodes.length} 个知识主题 · ${learningLinkCount} 条先修关系`;
      updateGradeUi(false);
      if (!introStarted) window.setTimeout(runIntro, 80);
      if (typeof onReady === "function") onReady();
    });
  }

  function colorOf(n) {
    const base = COLORS[n.subject] || "#888";
    if (selected === n.id) return "#ffffff";
    if (selected && focusDimmed && !revealedFocus.has(n.id)) {
      return DIMMED_COLORS[n.subject] || "#171c25";
    }
    return base;
  }

  function nodeValue(n) {
    const base = 0.65 + (n.centrality || 0) * 9.5;
    if (selected && focusDimmed && !revealedFocus.has(n.id)) return base * 0.58;
    return base;
  }

  function activePathLinks() {
    if (!selected) return focusLinks;
    return focusDimmed ? revealedFocusLinks : EMPTY_LINKS;
  }

  function linkId(l) {
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    return linkKey(s, t);
  }

  function pathColor(l) {
    const s = typeof l.source === "object" ? l.source : store.byId.get(l.source);
    const t = typeof l.target === "object" ? l.target : store.byId.get(l.target);
    const sid = s ? s.id : null;
    const tid = t ? t.id : null;
    const k = linkKey(sid, tid);
    const paths = activePathLinks();
    // 选中态：聚焦链路用青/粉高亮，其余淡化
    if (selected && focusDimmed) {
      if (!paths.has(k)) return "rgba(138,151,176,0.10)";
      if (prereqLinks.has(k)) return "rgba(113,229,209,0.92)";
      if (unlockLinks.has(k)) return "rgba(233,143,180,0.92)";
      return "rgba(113,229,209,0.92)";
    }
    // 非选中态：按源节点 domain 颜色着色（如源不可得则回退目标色）
    const sourceNode = s || t;
    if (!sourceNode) return "rgba(190,202,224,0.30)";
    const baseHex = COLORS[sourceNode.subject] || "#b9c4d6";
    const c = new THREE.Color(baseHex);
    let alpha;
    if (l.kind === "association") alpha = 0.22;
    else if (l.kind === "sequence") alpha = 0.20;
    else if (l.strength === "soft") alpha = 0.38;
    else alpha = 0.66;
    return `rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},${alpha})`;
  }

  function linkKey(a, b) {
    return `${a}→${b}`;
  }

  function openPanel() {
    panel.classList.remove("closed");
  }

  function closePanel() {
    if (demoActive) stopDemo(false);
    window.clearTimeout(focusTransitionTimer);
    focusDimmed = false;
    panel.classList.add("closed");
    document.body.classList.remove("focus-mode");
    revealToken += 1;
    selected = null;
    focus = new Set();
    focusLinks = new Set();
    revealedFocus = new Set();
    revealedFocusLinks = new Set();
    prereqLinks = new Set();
    unlockLinks = new Set();
    hideFocusMarker();
    panelBody.hidden = true;
    panelEmpty.hidden = false;
    scheduleRefresh();
    const overviewNodes = Graph?.graphData().nodes || [];
    if (overviewNodes.length) {
      pauseSpin();
      frameGraph(overviewNodes, 820);
      resumeSpin(920);
    } else {
      resumeSpin(400);
    }
  }

  function playRevealStages(stages) {
    const token = ++revealToken;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stages.forEach((stage, index) => {
      const reveal = () => {
        if (token !== revealToken || !selected) return;
        for (const id of stage.nodes) revealedFocus.add(id);
        for (const id of stage.links) revealedFocusLinks.add(id);
        scheduleRefresh();
      };
      if (reducedMotion) reveal();
      else window.setTimeout(reveal, 170 + index * PATH_STAGE_DELAY);
    });
  }

  /**
   * 保持全图尺度不变，沿选中节点的径向方位转动镜头。
   * 这样节点所在的纵向切面会转到正面，同时为右侧详情栏预留空间。
   */
  function frameFocusView(ids, duration = 900) {
    if (!Graph || !ids?.size) return;
    const selectedNode = Graph.graphData().nodes.find((node) => node.id === selected);
    if (!selectedNode) return;

    const graphCenter = new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z);
    const radial = new THREE.Vector3(
      selectedNode.x - graphCenter.x,
      0,
      selectedNode.z - graphCenter.z
    );
    if (radial.lengthSq() < 16) {
      const camera = Graph.camera();
      radial.set(camera.position.x - graphCenter.x, 0, camera.position.z - graphCenter.z);
    }
    if (radial.lengthSq() < 16) radial.set(0.62, 0, 0.78);
    radial.normalize();

    const graphRect = $("graph").getBoundingClientRect();
    const viewportWidth = Math.max(1, graphRect.width || window.innerWidth);
    const viewportHeight = Math.max(1, graphRect.height || window.innerHeight);
    const panelReserve = viewportWidth >= 760
      ? Math.min(panel.offsetWidth + 54, viewportWidth * 0.42)
      : 0;
    const camera = Graph.camera();
    const verticalFov = THREE.MathUtils.degToRad(camera.fov || 75);
    const currentDistance = Math.max(420, camera.position.distanceTo(graphCenter));
    const pitch = THREE.MathUtils.clamp(
      (camera.position.y - graphCenter.y) / currentDistance,
      -0.22,
      0.22
    );
    const viewBack = new THREE.Vector3(radial.x, pitch, radial.z).normalize();
    const forward = viewBack.clone().multiplyScalar(-1);
    const cameraRight = new THREE.Vector3()
      .crossVectors(forward, new THREE.Vector3(0, 1, 0))
      .normalize();
    const fullAspect = viewportWidth / viewportHeight;
    const fullVisibleWidth = 2 * currentDistance * Math.tan(verticalFov / 2) * fullAspect;
    const panelShift = panelReserve
      ? fullVisibleWidth * (panelReserve / 2) / viewportWidth
      : 0;
    const target = graphCenter.clone().addScaledVector(cameraRight, panelShift);
    const position = target.clone().addScaledVector(viewBack, currentDistance);

    Graph.cameraPosition(
      { x: position.x, y: position.y, z: position.z },
      { x: target.x, y: target.y, z: target.z },
      duration
    );
  }

  function showNode(id, fromDemo = false) {
    const n = store.byId.get(id);
    if (!n) return;
    if (entryRevealActive) finishEntryReveal(true);
    if (demoActive && !fromDemo) stopDemo(false);
    window.clearTimeout(focusTransitionTimer);
    revealToken += 1;
    focusDimmed = false;
    selected = id;

    const prereqsDirect = store.prereqOf.get(id) || [];
    const unlocksDirect = store.unlocks.get(id) || [];
    const ancestors = new Set([id]);
    const revealStages = Array.from({ length: FOCUS_MAX_DEPTH + 2 }, () => ({
      nodes: new Set(),
      links: new Set(),
    }));
    const queue = prereqsDirect.map((nodeId) => ({
      nodeId,
      depth: 1,
      via: linkKey(nodeId, id),
    }));
    let queueIndex = 0;
    focusLinks = new Set();
    prereqLinks = new Set();
    unlockLinks = new Set();
    for (const p of prereqsDirect) {
      const key = linkKey(p, id);
      focusLinks.add(key);
      prereqLinks.add(key);
    }

    while (queueIndex < queue.length && ancestors.size < FOCUS_MAX_NODES) {
      const { nodeId: cur, depth, via } = queue[queueIndex++];
      if (ancestors.has(cur)) continue;
      ancestors.add(cur);
      revealStages[depth].nodes.add(cur);
      if (via) {
        focusLinks.add(via);
        revealStages[depth].links.add(via);
      }
      if (depth >= FOCUS_MAX_DEPTH) continue;
      for (const p of store.prereqOf.get(cur) || []) {
        if (!ancestors.has(p)) {
          queue.push({
            nodeId: p,
            depth: depth + 1,
            via: linkKey(p, cur),
          });
        }
      }
    }
    focus = new Set([...ancestors, ...unlocksDirect]);
    for (const u of unlocksDirect) {
      const key = linkKey(id, u);
      focusLinks.add(key);
      unlockLinks.add(key);
      revealStages[FOCUS_MAX_DEPTH + 1].nodes.add(u);
      revealStages[FOCUS_MAX_DEPTH + 1].links.add(key);
    }
    revealedFocus = new Set([id]);
    revealedFocusLinks = new Set();

    panelEmpty.hidden = true;
    panelBody.hidden = false;
    openPanel();
    document.body.classList.add("focus-mode");
    panel.style.setProperty("--panel-color", COLORS[n.subject] || "#71e5d1");
    $("meta").textContent = [n.grade, n.conceptLabel || n.domain]
      .filter(Boolean)
      .join(" · ");
    $("name").textContent = n.name;
    $("desc").textContent = n.description || "";
    fillLessonContext(n);
    fillList($("prereqs"), prereqsDirect);
    fillList($("unlocks"), unlocksDirect);
    const ev = $("evidence");
    ev.innerHTML = "";
    for (const e of n.evidence) {
      const li = document.createElement("li");
      li.textContent = e;
      ev.appendChild(li);
    }
    scheduleRefresh();

    const node = Graph.graphData().nodes.find((x) => x.id === id);
    if (node) {
      pauseSpin();
      showFocusMarker(node);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      frameFocusView(focus, reducedMotion ? 0 : FOCUS_ORIENT_DURATION);
      const enterFocus = () => {
        if (selected !== id) return;
        focusDimmed = true;
        scheduleRefresh();
        playRevealStages(revealStages.filter((stage) => stage.nodes.size || stage.links.size));
      };
      if (reducedMotion) enterFocus();
      else focusTransitionTimer = window.setTimeout(enterFocus, FOCUS_DIM_DELAY);
    }
  }

  function syncSpinFromCamera() {
    const cam = Graph.camera();
    const dx = cam.position.x - lookAt.x;
    const dz = cam.position.z - lookAt.z;
    spinRadius = Math.hypot(dx, dz) || spinRadius;
    spinY = cam.position.y;
    spinAng = Math.atan2(dz, dx);
  }

  function pauseSpin() {
    spinning = false;
    window.clearTimeout(resumeSpin._t);
  }

  function resumeSpin(delayMs = 0) {
    window.clearTimeout(resumeSpin._t);
    resumeSpin._t = window.setTimeout(() => {
      if (!Graph || selected) return;
      syncSpinFromCamera();
      spinning = true;
      if (typeof Graph.resumeAnimation === "function") Graph.resumeAnimation();
    }, delayMs);
  }

  function startSpinLoop() {
    const tick = (now = 0) => {
      requestAnimationFrame(tick);
      animateFocusMarker(now);
      animateCosmicScene(now);
      if (!Graph || !spinning || selected) return;
      spinAng += SPIN_SPEED;
      Graph.cameraPosition(
        {
          x: lookAt.x + Math.cos(spinAng) * spinRadius,
          y: spinY,
          z: lookAt.z + Math.sin(spinAng) * spinRadius,
        },
        lookAt
      );
    };
    requestAnimationFrame(tick);
  }

  function fillList(ul, ids) {
    ul.innerHTML = "";
    if (!ids.length) {
      const li = document.createElement("li");
      li.textContent = "无";
      li.style.color = "var(--mute)";
      ul.appendChild(li);
      return;
    }
    for (const id of ids) {
      const t = store.byId.get(id);
      if (!t) continue;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = t.name;
      a.href = "#";
      a.onclick = (e) => {
        e.preventDefault();
        if (!active.has(t.subject)) {
          active.add(t.subject);
          syncSubjectButtons();
          apply(() => showNode(id));
          return;
        }
        showNode(id);
      };
      li.appendChild(a);
      ul.appendChild(li);
    }
  }

  function fillLessonContext(node) {
    const lesson = node.lesson;
    const title = $("lessonTitle");
    const path = $("lessonPath");
    const topics = $("lessonTopics");

    topics.innerHTML = "";
    if (!lesson) {
      title.textContent = "未找到所属课时";
      path.textContent = "";
      return;
    }

    title.textContent = lesson.lessonTitle || lesson.section || "未命名课时";
    path.textContent = [
      [lesson.grade, lesson.semester].filter(Boolean).join(" · "),
      lesson.chapter,
      lesson.section,
    ]
      .filter(Boolean)
      .join(" / ");

    const links = store.lessonTopicsByLesson.get(node.lessonId) || [];
    for (const link of links) {
      const topic = store.byId.get(link.topicId);
      if (!topic) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = topic.name;
      button.classList.toggle("current", topic.id === node.id);
      if (topic.id === node.id) {
        button.setAttribute("aria-current", "true");
      } else {
        button.onclick = () => showNode(topic.id);
      }
      topics.appendChild(button);
    }
  }

  function syncSubjectButtons() {
    [...subjectsEl.children].forEach((b) => {
      b.classList.toggle("on", active.has(b.dataset.subject));
    });
  }

  function buildSubjects() {
    subjectsEl.innerHTML = "";
    for (const s of SUBJECT_ORDER) {
      const count = store.nodes.filter((n) => n.subject === s).length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.subject = s;
      btn.style.setProperty("--c", COLORS[s]);
      btn.classList.toggle("on", active.has(s));
      btn.innerHTML = `<span class="dot"></span>${short(s)} <em>${count}</em>`;
      btn.onclick = () => {
        if (selected) closePanel();
        if (active.has(s)) {
          if (active.size === 1) return;
          active.delete(s);
        } else {
          active.add(s);
        }
        btn.classList.toggle("on", active.has(s));
        apply();
      };
      subjectsEl.appendChild(btn);
    }
  }

  function short(s) {
    return SUBJECT_ZH[s] || s;
  }

  function initGraph() {
    Graph = ForceGraph3D()(document.getElementById("graph"))
      .backgroundColor("rgba(0,0,0,0)")
      .showNavInfo(false)
      .nodeLabel(
        (n) => {
          const context = [n.grade, n.conceptLabel || n.domain]
            .filter(Boolean)
            .join(" · ");
          return `<strong>${n.name}</strong><br/><small>${context}</small>`;
        }
      )
      .nodeRelSize(3.15)
      .nodeVal(nodeValue)
      .nodeResolution(10)
      .nodeColor(colorOf)
      .nodeVisibility(nodeIsVisible)
      .nodeOpacity(0.9)
      .linkColor(pathColor)
      .linkVisibility(graphLinkIsVisible)
      .linkWidth((l) => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        if (activePathLinks().has(linkKey(s, t))) return 0.82;
        if (l.kind === "association") return 0.22;
        if (l.kind === "sequence") return 0.18;
        return l.strength === "soft" ? 0.33 : 0.68;
      })
      .linkOpacity(1)
      .linkDirectionalParticles((l) => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        const key = linkKey(s, t);
        if (selected) {
          return revealedFocusLinks.has(key) &&
            (prereqLinks.has(key) || unlockLinks.has(key))
            ? 3
            : 0;
        }
        if (entryRevealActive) return 0;
        if (l.kind !== "prerequisite") return 0;
        // 每条先修边默认 1 颗流动光点；ambient 高亮边 2 颗
        return ambientLinks.has(key) ? 2 : 1;
      })
      .linkDirectionalParticleWidth(() => (selected ? 1.6 : 1.1))
      .linkDirectionalParticleSpeed(() => (selected ? 0.005 : 0.0034))
      .linkDirectionalParticleColor((l) => {
        if (selected) return pathColor(l);
        // 默认用源节点色（边是源色→目标色渐变，粒子也用源色保持视觉一致）
        const sid = typeof l.source === "object" ? l.source.id : l.source;
        const source = store.byId.get(sid);
        if (source?.color) return source.color;
        return pathColor(l);
      })
      .enableNodeDrag(false)
      .onNodeClick((n) => showNode(n.id))
      .onNodeHover((n) => {
        const canvas = Graph.renderer().domElement;
        canvas.style.cursor = n ? "pointer" : "grab";
        document.body.classList.toggle("node-hover", Boolean(n));
        if (n) {
          pauseSpin();
        } else if (!selected) {
          resumeSpin(650);
        }
      })
      .onBackgroundClick(closePanel);

    initFocusMarker();
    initCosmicScene();
    const controls = Graph.controls();
    controls.autoRotate = false; // 改用手动绕轴，不依赖引擎闲置后的 OrbitControls
    controls.enablePan = false; // 保留旋转和缩放，防止整张图被平移到界面浮层下方
    controls.minPolarAngle = Math.PI * 0.34;
    controls.maxPolarAngle = Math.PI * 0.64;
    const canvas = Graph.renderer().domElement;
    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", () => {
      if (demoActive) stopDemo(false);
      pauseSpin();
      syncSpinFromCamera();
    });
    canvas.addEventListener("pointerup", () => {
      resumeSpin(1600);
    });
    canvas.addEventListener(
      "wheel",
      () => {
        pauseSpin();
        syncSpinFromCamera();
        resumeSpin(1600);
      },
      { passive: true }
    );
    startSpinLoop();
  }

  function buildDemoRoute() {
    const ageTargets = [6, 7, 8, 9, 11, 13, 14];
    return SUBJECT_ORDER.map((subject, index) => {
      const targetAge = ageTargets[index];
      const candidates = store.nodes.filter((node) => {
        if (node.subject !== subject) return false;
        const degree =
          (store.prereqOf.get(node.id) || []).length +
          (store.unlocks.get(node.id) || []).length;
        return degree > 0;
      });
      candidates.sort((a, b) => {
        const degreeA =
          (store.prereqOf.get(a.id) || []).length +
          (store.unlocks.get(a.id) || []).length;
        const degreeB =
          (store.prereqOf.get(b.id) || []).length +
          (store.unlocks.get(b.id) || []).length;
        const scoreA = degreeA * 7 + (a.centrality || 0) * 120 - Math.abs(a.ageMid - targetAge) * 2;
        const scoreB = degreeB * 7 + (b.centrality || 0) * 120 - Math.abs(b.ageMid - targetAge) * 2;
        return scoreB - scoreA;
      });
      return candidates[0]?.id;
    }).filter(Boolean);
  }

  function showDemoStep() {
    if (!demoActive || !demoRoute.length) return;
    const id = demoRoute[demoIndex % demoRoute.length];
    const node = store.byId.get(id);
    if (!node) return;
    showNode(id, true);
    $("demoStep").textContent = `自动演示 ${demoIndex + 1}/${demoRoute.length}`;
    $("demoTitle").textContent = node.name;
    $("demoMeta").textContent = `${node.grade} · ${node.conceptLabel || node.domain}`;
    $("demoCaption").classList.add("show");
    demoTimer = window.setTimeout(() => {
      demoIndex = (demoIndex + 1) % demoRoute.length;
      showDemoStep();
    }, DEMO_STEP_TIME);
  }

  function startDemo() {
    if (demoActive || !store) return;
    finishIntro(true);
    if (entryRevealActive) finishEntryReveal(true);
    stopGradePlayback();
    setGradeLimit(GRADE_MAX, "demo");
    const needsAllSubjects = active.size !== SUBJECT_ORDER.length;
    if (selected) closePanel();
    if (needsAllSubjects) {
      active = new Set(SUBJECT_ORDER);
      syncSubjectButtons();
    }

    demoActive = true;
    demoIndex = 0;
    demoRoute = buildDemoRoute();
    document.body.classList.add("demo-mode");
    $("demoBtn").classList.add("on");
    $("demoBtn").innerHTML = '<span aria-hidden="true">■</span> 结束演示';
    $("demoBtn").setAttribute("aria-label", "结束自动演示");

    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    window.clearTimeout(demoTimer);
    if (needsAllSubjects) {
      apply(() => {
        if (demoActive) demoTimer = window.setTimeout(showDemoStep, 180);
      });
    } else {
      demoTimer = window.setTimeout(showDemoStep, 180);
    }
  }

  function stopDemo(closeFocus = true) {
    if (!demoActive) return;
    demoActive = false;
    window.clearTimeout(demoTimer);
    document.body.classList.remove("demo-mode");
    $("demoCaption").classList.remove("show");
    $("demoBtn").classList.remove("on");
    $("demoBtn").innerHTML = '<span aria-hidden="true">▶</span> 自动演示';
    $("demoBtn").setAttribute("aria-label", "开始自动演示");
    if (closeFocus) closePanel();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          status.textContent = "无法进入全屏模式";
        });
      } else {
        status.textContent = "当前浏览器不支持全屏";
      }
    } else {
      document.exitFullscreen?.();
    }
  }

  function syncFullscreenButton() {
    const button = $("fullscreenBtn");
    const isFullscreen = Boolean(document.fullscreenElement);
    button.textContent = isFullscreen ? "⊙" : "⛶";
    button.title = isFullscreen ? "退出全屏" : "进入全屏";
    button.setAttribute("aria-label", button.title);
  }

  function search(q) {
    if (!q) return;
    const lower = q.toLowerCase();
    const hit =
      store.nodes.find((n) => n.id === q) ||
      store.nodes.find(
        (n) =>
          n.name.toLowerCase().includes(lower) ||
          n.nameEn.toLowerCase().includes(lower)
      );
    if (!hit) {
      status.textContent = `未找到「${q}」`;
      return;
    }
    if (!active.has(hit.subject)) {
      active.add(hit.subject);
      syncSubjectButtons();
      apply(() => showNode(hit.id));
      return;
    }
    showNode(hit.id);
  }

  /** 把学科相关文案（标题/简介/统计/footer/搜索占位等）按 cfg 填充到 DOM。 */
  function applySubjectCopy(cfg, nodeCount, depCount, lessonCount) {
    document.title = cfg.title;
    $("eyebrowText").textContent = cfg.eyebrow;
    // introKicker 保持通用 — 开场页不应该学科特定
    $("search").placeholder = cfg.searchPlaceholder;
    $("footerNote").textContent = cfg.footer;
    $("heroCopy").innerHTML = cfg.heroCopy(nodeCount, depCount, lessonCount);
    $("heroStats").innerHTML =
      `<div><strong>${nodeCount}</strong><span>原子知识点</span></div>` +
      `<div><strong>${depCount}</strong><span>先修关系</span></div>` +
      `<div><strong>${lessonCount}</strong><span>课时数</span></div>`;
    $("introCounts").innerHTML =
      `<div class="stat-tile">` +
        `<span class="stat-key">ATOM NODES</span>` +
        `<strong class="stat-num v-gold">${nodeCount}</strong>` +
        `<span class="stat-zh">原子知识点</span>` +
      `</div>` +
      `<div class="stat-tile">` +
        `<span class="stat-key">PREREQ EDGES</span>` +
        `<strong class="stat-num v-teal">${depCount}</strong>` +
        `<span class="stat-zh">先修关系</span>` +
      `</div>`;
    // 等级轴动态文案
    $("timelineLabel").textContent = cfg.gradeAxisLabel;
    $("gradeUnit").textContent = cfg.gradeUnit ? " " + cfg.gradeUnit : "";
    $("timelineDock").setAttribute("aria-label", cfg.gradeFilterLabel);
    $("ageSlider").setAttribute("aria-label", cfg.gradeSliderLabel);
  }

  function switchSubject(subject) {
    if (subject === currentSubject) return;

    // 清理当前状态
    if (selected) closePanel();
    if (demoActive) stopDemo(true);
    if (gradePlaying) stopGradePlayback();
    if (entryRevealActive) finishEntryReveal(true);
    if (introStarted && !introFinished) finishIntro(true);

    currentSubject = subject;
    const cfg = SUBJECT_CONFIG[subject];

    // 重绑学科配置
    COLORS = cfg.colors;
    DIMMED_COLORS = Object.fromEntries(
      Object.entries(cfg.colors).map(([s, c]) => [s, blendWithBackground(c)])
    );
    SUBJECT_ORDER = cfg.subjectOrder;
    SUBJECT_ZH = Object.fromEntries(SUBJECT_ORDER.map((s) => [s, s]));
    DOMAIN_ZH = Object.fromEntries(SUBJECT_ORDER.map((s) => [s, s]));
    AGE_MIN = cfg.ageMin;
    AGE_MAX = cfg.ageMax;
    GRADE_MIN = cfg.gradeMin;
    GRADE_MAX = cfg.gradeMax;
    GRADE_PARSE = cfg.gradeParse;
    GRADE_LABEL = cfg.gradeLabel;
    GRADE_UNIT = cfg.gradeUnit;

    // 重置图谱状态
    active = new Set(SUBJECT_ORDER);
    gradeLimit = GRADE_MAX;
    focus = new Set();
    focusLinks = new Set();
    revealedFocus = new Set();
    revealedFocusLinks = new Set();
    prereqLinks = new Set();
    unlockLinks = new Set();
    selected = null;
    focusDimmed = false;
    ambientLinks = new Set();
    revealToken += 1;
    hideFocusMarker();

    // 加载新学科数据
    const data = cfg.data();
    store = normalize(
      data.topics,
      data.dependencies,
      data.lessonRecords,
      data.topicMetadata,
      data.lessonTopicLinks,
      data.curriculumSequence
    );

    // 文案与统计面板
    applySubjectCopy(cfg, store.nodes.length, store.dependencyLinkCount, store.lessonsById.size);

    // 年级滑块
    const slider = $("ageSlider");
    slider.min = GRADE_MIN;
    slider.max = GRADE_MAX;
    slider.value = GRADE_MAX;
    const ticks = [];
    for (let g = GRADE_MIN; g <= GRADE_MAX; g++) ticks.push(g);
    $("gradeTicks").innerHTML = ticks.map((g) => `<span>${GRADE_LABEL(g)}</span>`).join("");
    $("ageValue").textContent = GRADE_LABEL(GRADE_MAX);
    $("ageAxisValue").textContent = GRADE_LABEL(GRADE_MIN);

    // 切换按钮状态
    document.querySelectorAll(".subject-switch button").forEach((b) => {
      const isActive = b.dataset.subject === subject;
      b.classList.toggle("on", isActive);
      b.setAttribute("aria-selected", isActive);
    });

    // 重建领域面板并重新渲染
    buildSubjects();
    apply();
  }

  async function main() {
    try {
      const data = SUBJECT_CONFIG[currentSubject].data();
      if (data) {
        store = normalize(
          data.topics,
          data.dependencies,
          data.lessonRecords,
          data.topicMetadata,
          data.lessonTopicLinks,
          data.curriculumSequence
        );
      } else {
        const [tr, dr, lr, mr, ltr, csr] = await Promise.all([
          fetch(`${DATA}/topics.json`),
          fetch(`${DATA}/dependencies.json`),
          fetch(`${DATA}/lesson-records.json`),
          fetch(`${DATA}/topic-metadata.json`),
          fetch(`${DATA}/lesson-topic-links.json`),
          fetch(`${DATA}/curriculum-sequence.json`),
        ]);
        if (!tr.ok || !dr.ok || !lr.ok || !mr.ok || !ltr.ok || !csr.ok) {
          throw new Error("知识图谱数据不可用");
        }
        store = normalize(
          await tr.json(),
          await dr.json(),
          await lr.json(),
          await mr.json(),
          await ltr.json(),
          await csr.json()
        );
      }
      // 首屏就按当前学科填充文案与统计面板，避免 HTML 默认文案残留
      applySubjectCopy(
        SUBJECT_CONFIG[currentSubject],
        store.nodes.length,
        store.dependencyLinkCount,
        store.lessonsById.size
      );
      buildSubjects();
      initGraph();
      apply();

      $("closePanel").onclick = closePanel;
      $("skipIntro").onclick = () => finishIntro(true);
      $("introEnter") && ($("introEnter").onclick = () => finishIntro(true));
      $("introDemo")  && ($("introDemo").onclick  = () => { finishIntro(true); setTimeout(startDemo, 320); });
      $("demoBtn").onclick = () => {
        if (demoActive) stopDemo(true);
        else startDemo();
      };
      $("fullscreenBtn").onclick = toggleFullscreen;
      document.addEventListener("fullscreenchange", syncFullscreenButton);
      let focusResizeTimer = 0;
      window.addEventListener("resize", () => {
        window.clearTimeout(focusResizeTimer);
        focusResizeTimer = window.setTimeout(() => {
          if (selected) frameFocusView(focus, 360);
          else frameGraph(Graph.graphData().nodes, 360);
        }, 140);
      });
      $("ageSlider").oninput = (event) => {
        stopGradePlayback();
        setGradeLimit(event.target.value, "manual");
      };
      $("agePlay").onclick = () => {
        if (gradePlaying) stopGradePlayback();
        else startGradePlayback();
      };
      $("toggleAll").onclick = () => {
        if (selected) closePanel();
        active = new Set(SUBJECT_ORDER);
        syncSubjectButtons();
        apply();
      };
      document.querySelectorAll(".subject-switch button").forEach((b) => {
        b.onclick = () => switchSubject(b.dataset.subject);
      });
      let t;
      // ── 搜索自动补全：候选下拉 + 键盘导航 + 点击选中 ──
      const searchInput = $("search");
      const suggestBox = $("searchSuggest");
      const searchWrapEl = suggestBox.closest(".search-wrap");
      let suggestItems = [];
      let suggestIndex = -1;
      const escapeHtml = (s) =>
        String(s).replace(/[&<>"']/g, (c) => ({
          "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
        }[c]));

      function hideSuggest() {
        suggestBox.hidden = true;
        suggestBox.innerHTML = "";
        suggestItems = [];
        suggestIndex = -1;
      }

      function renderSuggest(q) {
        const lower = q.toLowerCase();
        if (!lower) { hideSuggest(); return; }
        const hits = [];
        for (const n of store.nodes) {
          if (
            n.name.toLowerCase().includes(lower) ||
            (n.nameEn || "").toLowerCase().includes(lower)
          ) {
            hits.push(n);
            if (hits.length >= 8) break;
          }
        }
        if (!hits.length) { hideSuggest(); return; }
        suggestItems = hits;
        suggestIndex = -1;
        suggestBox.innerHTML = hits
          .map((n) => {
            const meta = [n.grade, n.conceptLabel || n.domain].filter(Boolean).join(" · ");
            return (
              `<li role="option" aria-selected="false">` +
              `<span class="sg-name">${escapeHtml(n.name)}</span>` +
              `<span class="sg-meta">${escapeHtml(meta)}</span>` +
              `</li>`
            );
          })
          .join("");
        suggestBox.hidden = false;
      }

      function updateSuggestActive() {
        [...suggestBox.children].forEach((li, i) => {
          li.classList.toggle("active", i === suggestIndex);
          li.setAttribute("aria-selected", i === suggestIndex ? "true" : "false");
        });
      }

      function pickSuggest(i) {
        const n = suggestItems[i];
        if (!n) return;
        hideSuggest();
        searchInput.value = "";
        if (!active.has(n.subject)) {
          active.add(n.subject);
          syncSubjectButtons();
          apply(() => showNode(n.id));
        } else {
          showNode(n.id);
        }
      }

      suggestBox.addEventListener("mousedown", (e) => {
        e.preventDefault(); // 防止 input 失焦打断点击
        const li = e.target.closest("li");
        if (li) pickSuggest([...suggestBox.children].indexOf(li));
      });
      document.addEventListener("click", (e) => {
        if (searchWrapEl && !searchWrapEl.contains(e.target)) hideSuggest();
      });

      $("search").oninput = (e) => {
        clearTimeout(t);
        const v = e.target.value.trim();
        if (!v) {
          hideSuggest();
          status.textContent = `${store.nodes.length} 个主题已连接`;
          return;
        }
        t = setTimeout(() => renderSuggest(v), 120);
      };
      $("search").onkeydown = (e) => {
        if (suggestBox.hidden) {
          if (e.key === "Enter") search(e.target.value.trim());
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          suggestIndex = Math.min(suggestIndex + 1, suggestItems.length - 1);
          updateSuggestActive();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          suggestIndex = Math.max(suggestIndex - 1, 0);
          updateSuggestActive();
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (suggestIndex >= 0) pickSuggest(suggestIndex);
          else {
            hideSuggest();
            search(e.target.value.trim());
          }
        } else if (e.key === "Escape") {
          hideSuggest();
        }
      };
    } catch (e) {
      console.error(e);
      $("intro").classList.add("hide");
      document.body.classList.add("scene-ready");
      status.textContent = "加载失败";
      panelEmpty.innerHTML = `<strong>知识图谱加载失败</strong><p>${e.message}</p>`;
      openPanel();
    }
  }

  main();
})();
