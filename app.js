/* =========================================================
   Priya Dharshan A — portfolio interactions
   Vanilla JS. No dependencies. rAF-throttled, visibility-aware.
   ========================================================= */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileMQ = matchMedia('(max-width: 900px)');
  const isMobile = () => mobileMQ.matches;

  /* ---------------------------------------------------------
     Smooth scrolling — Lenis (matches the reference feel)
     --------------------------------------------------------- */
  let lenis = null;
  if (!reduced && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false, autoRaf: true });
  }
  const smoothTo = (top) => {
    if (lenis) lenis.scrollTo(top, { immediate: reduced });
    else window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  };
  const setScrollLock = (on) => {
    if (!lenis) return;
    if (on) lenis.stop(); else lenis.start();
  };

  /* ---------------------------------------------------------
     Project data — analytics and editorial collection
     --------------------------------------------------------- */
  const projects = [
  {
    "id": "freight-analytics",
    "title": "Freight & Vendor Payment Analytics",
    "tab": "Data analytics",
    "type": "Résumé project",
    "accent": "#FF3D7F",
    "light": "#F0D3DA",
    "dark": "#C3909B",
    "tabPos": 0.25,
    "left": 6,
    "right": 6,
    "img": "assets/img/analytics.svg",
    "thumb": "assets/img/analytics.svg",
    "imageAlt": "Illustrated project overview; actual dashboard screenshots are not yet available",
    "tagline": "A clearer view of billing and payments.",
    "about": "Developed a finance and operations dashboard using SQL, Power BI and Advanced Excel to analyze trip-to-invoice turnaround, overdue invoice aging and payment trends across 150+ vendors. The project supports payout visibility and highlights billing bottlenecks. This overview is based on the résumé; dashboard screenshots and a public demo have not yet been provided.",
    "stats": [
      {
        "v": "150+",
        "l": "vendors analyzed"
      },
      {
        "v": "SQL",
        "l": "record analysis"
      },
      {
        "v": "Power BI",
        "l": "KPI reporting"
      }
    ],
    "tags": [
      "SQL",
      "Power BI",
      "Advanced Excel"
    ],
    "link": "assets/docs/priyadharshan-resume.pdf",
    "linkText": "Read the résumé"
  },
  {
    "id": "magazine-collection",
    "title": "KIK Magazine Library",
    "tab": "Magazine library",
    "type": "Editorial collection",
    "accent": "#8B8DFF",
    "light": "#DEDCF4",
    "dark": "#A7A3D0",
    "tabPos": 0.72,
    "left": 3,
    "right": 3,
    "img": "assets/magazines/farina-azad-kik-magazine-celebrity-edition/cover.webp",
    "thumb": "assets/magazines/farina-azad-kik-magazine-celebrity-edition/cover.webp",
    "imageAlt": "Farina Azad KIK magazine cover, from the magazine library",
    "tagline": "Every life. A different edition.",
    "about": "Explore 28 separate magazines and one portfolio film: fashion portfolios, wedding stories, birthday keepsakes and personal editions. Each magazine has its own description and a reader for every supplied finished page. Search the collection, switch to two-page view, or zoom in to read the details.",
    "stats": [
      {
        "v": "28",
        "l": "magazines"
      },
      {
        "v": "365",
        "l": "readable pages"
      },
      {
        "v": "1",
        "l": "portfolio film"
      }
    ],
    "tags": [
      "Editorial design",
      "Magazine layouts",
      "Visual storytelling"
    ],
    "link": "magazines.html",
    "linkText": "Open the magazine library"
  }
];

  /* ---------------------------------------------------------
     Loader
     --------------------------------------------------------- */
  const loader = $('#loader');
  const html = document.documentElement;
  let loaderDone = false;
  let loaderSweep = 0;

  function finishLoader() {
    if (loaderDone) return;
    loaderDone = true;
    loader.classList.add('out');
    html.classList.remove('loading');
    html.classList.add('loaded');
    if (lenis) lenis.resize();
    setTimeout(() => { loader.style.display = 'none'; }, 700);
  }

  $('#skipIntro')?.addEventListener('click', finishLoader);
  loader?.querySelector('.intro-letter:last-of-type')?.addEventListener('animationend', () => {
    loader.classList.add('intro-ready');
  }, { once: true });

  if (loader) {
    if (reduced) {
      loader.classList.add('out');
      html.classList.remove('loading');
      html.classList.add('loaded');
      if (lenis) lenis.resize();
      setTimeout(() => { loader.style.display = 'none'; }, 100);
    } else {
      let lx = 0;
      const sweep = () => {
        if (loaderDone) return;
        lx = (Math.sin(performance.now() / 900) * 0.5 + 0.5) * 100;
        loader.style.setProperty('--lx', lx + '%');
        requestAnimationFrame(sweep);
      };
      requestAnimationFrame(sweep);
      const t = setTimeout(finishLoader, 2600);
      // Safety net for slow networks
      setTimeout(finishLoader, 4200);
      // Allow pointer to drive the light
      window.addEventListener('pointermove', (e) => {
        if (loaderDone) return;
        loader.style.setProperty('--lx', (e.clientX / window.innerWidth * 100).toFixed(1) + '%');
      }, { passive: true });
      void t;
    }
  }

  /* ---------------------------------------------------------
     Loader particle orb
     --------------------------------------------------------- */
  (function loaderOrb() {
    if (reduced) return;
    const canvas = $('#loaderCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    let W = 0, H = 0, DPR = 1;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();

    const N = 620;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * Math.PI * (3 - Math.sqrt(5));
      pts.push({ x: Math.cos(theta) * rad, y, z: Math.sin(theta) * rad });
    }
    const palette = ['255,255,255', '255,209,227', '255,77,143', '201,184,255'];
    let last = 0;
    const draw = (t) => {
      if (loaderDone) return;
      requestAnimationFrame(draw);
      if (t - last < (isMobile() ? 33 : 16)) return;
      last = t;
      ctx.clearRect(0, 0, W, H);
      const R = Math.min(W, H) * 0.36;
      const ay = t * 0.00042;
      const ax = Math.sin(t * 0.00023) * 0.3;
      const cosY = Math.cos(ay), sinY = Math.sin(ay);
      const cosX = Math.cos(ax), sinX = Math.sin(ax);
      const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, R * 1.5);
      glow.addColorStop(0, 'rgba(255,0,98,0.24)');
      glow.addColorStop(0.45, 'rgba(139,92,255,0.10)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      // Traveling light arcs give the opening a clear sense of direction.
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.globalCompositeOperation = 'lighter';
      for (let orbit = 0; orbit < 4; orbit++) {
        const radius = R * (1.04 + orbit * 0.13);
        const phase = t * (0.0011 + orbit * 0.00015) * (orbit % 2 ? -1 : 1) + orbit * 1.5;
        ctx.save();
        ctx.rotate(-0.5 + orbit * 0.58);
        ctx.scale(1, 0.44 + orbit * 0.10);
        for (let segment = 0; segment < 38; segment++) {
          const a = phase - segment * 0.019;
          ctx.strokeStyle = `rgba(${orbit % 2 ? '175,145,255' : '255,40,125'},${(0.8 * (1 - segment / 38)).toFixed(3)})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.arc(0, 0, radius, a - 0.025, a); ctx.stroke();
        }
        ctx.fillStyle = '#fff0f8';
        ctx.shadowColor = '#ff3d92'; ctx.shadowBlur = 18;
        ctx.beginPath();ctx.arc(Math.cos(phase) * radius, Math.sin(phase) * radius, 3.4, 0, Math.PI * 2);ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      for (const p of pts) {
        let x = p.x * cosY - p.z * sinY;
        let z = p.x * sinY + p.z * cosY;
        let y = p.y * cosX - z * sinX;
        z = p.y * sinX + z * cosX;
        const f = 2.25 / (2.25 + z);
        const sx = W / 2 + x * R * f;
        const sy = H / 2 + y * R * f;
        const depth = (z + 1) / 2;
        const size = (0.55 + 1.5 * (1 - depth)) * f;
        const a = 0.16 + 0.74 * (1 - depth);
        ctx.fillStyle = `rgba(${palette[(p.y > 0.35 ? 1 : p.y > -0.1 ? 0 : 3)]},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    requestAnimationFrame(draw);
    window.addEventListener('resize', resize, { passive: true });
  })();

  /* ---------------------------------------------------------
     Theme
     --------------------------------------------------------- */
  const theme = $('#theme');
  const themeBtn = $('#themeBtn');
  const savedTheme = localStorage.getItem('pd-theme');
  if (savedTheme === 'light') theme.classList.remove('dark');
  if (savedTheme === 'dark') theme.classList.add('dark');

  function syncThemeBtn() {
    const dark = theme.classList.contains('dark');
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  syncThemeBtn();

  /* ---------------------------------------------------------
     Theme + View Transitions scan wipe
     --------------------------------------------------------- */
  let themeVT = null;
  let scanGL = undefined;

  function getScanGL() {
    if (scanGL !== undefined) return scanGL;
    scanGL = null;
    const cv = document.createElement('canvas');
    const gl = cv.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!gl) return null;
    const vs = `#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.0-1.0,0.0,1.0);}`;
    const fs = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uWave, uHead, uScale, uOpacity, uLight, uTime;
uniform vec3 uC1, uC2, uC3;
out vec4 o;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float signal(vec2 p,float t){float w=sin(p.x*1.3+t*0.7);w+=sin(p.y*1.7-t*0.52)*0.8;w+=sin((p.x+p.y)*0.9+t*0.91)*0.6;w+=sin((p.x-p.y)*1.53-t*0.63)*0.42;return w*0.35;}
float smoother(float x){x=clamp(x,0.0,1.0);return x*x*x*(x*(x*6.0-15.0)+10.0);}
float coverage(float lc,float width){float fw=max(fwidth(lc),1e-5);float dist=abs(fract(lc+0.5)-0.5)/fw;float crowd=smoothstep(0.2,0.55,fw);float cover=clamp(width*0.5+0.5-dist,0.0,1.0)*min(width,1.0);return mix(cover,min(width*fw,1.0),crowd);}
void main(){
  vec2 uv=(gl_FragCoord.xy*2.0-uRes)/uRes.y;
  vec2 p=uv/uScale;
  float coord=-p.y+signal(p*2.0,uWave)*0.16;
  float dd=uHead-coord;
  float sweep=dd>=0.0?exp(-dd*4.2):exp(dd*22.0);
  float head=exp(-abs(dd)*26.0);
  float lit=clamp(sweep*0.9,0.0,1.6), hot=clamp(head,0.0,1.0);
  float lc=coord*13.0;
  float width=1.2*(1.0+lit*1.4+hot*0.9);
  float thread=0.62+0.38*hash(vec2(floor(lc+0.5),3.7));
  float split=0.7*(0.5+lit*1.3)*max(fwidth(lc),1e-5);
  float cg=coverage(lc,width), cr=coverage(lc+split,width), cb=coverage(lc-split,width);
  float fw=max(fwidth(lc),1e-5); float dist=abs(fract(lc+0.5)-0.5)/fw;
  float halo=exp(-dist/(3.0+0.6*9.0))*(1.0-smoothstep(0.2,0.55,fw))*0.6*lit*1.15;
  float level=lit*thread;
  vec3 tone=mix(uC1,uC2,smoothstep(0.05,0.75,lit)); tone=mix(tone,uC3,hot);
  vec3 haloTone=mix(uC1,uC2,0.65);
  float vx=smoother((1.0-abs(uv.x/(uRes.x/uRes.y)))/0.6);
  float vig=mix(1.0,vx,0.3);
  float scan=1.0-0.5*0.55*(0.5+0.5*cos(gl_FragCoord.y*6.2831853/3.0));
  float grain=(hash(gl_FragCoord.xy+fract(uTime)*91.7)-0.5)*0.04;
  vec3 cover3=vec3(cr,cg,cb); float aLine=max(max(cr,cg),cb)*level;
  if(uLight>0.5){
    float ink=clamp(aLine*vig*scan,0.0,1.0); float wash=clamp(halo*0.28*vig,0.0,1.0);
    float a=clamp(ink+wash*(1.0-ink)+grain*0.5*ink,0.0,1.0)*uOpacity;
    vec3 col=(tone*ink+haloTone*wash*(1.0-ink))/max(ink+wash*(1.0-ink),1e-4);
    o=vec4(col*a,a); return;
  }
  vec3 col=(tone*cover3*level+haloTone*halo)*vig*scan;
  float a=clamp(max(aLine,halo)*vig*scan+grain*max(aLine,0.04),0.0,1.0);
  col=clamp(col+grain*0.6*a,0.0,1.0); col=min(col,vec3(a));
  o=vec4(col*uOpacity,a*uOpacity);
}`;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const v = sh(gl.VERTEX_SHADER, vs);
    const f = sh(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    const u = {};
    ['uRes', 'uWave', 'uHead', 'uScale', 'uOpacity', 'uLight', 'uTime', 'uC1', 'uC2', 'uC3'].forEach(n => { u[n] = gl.getUniformLocation(prog, n); });
    scanGL = { cv, gl, prog, u, vao: gl.createVertexArray() };
    return scanGL;
  }

  function hexRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  function scanLayer(nextDark) {
    const el = document.createElement('div');
    el.className = 'tscan';
    el.setAttribute('aria-hidden', 'true');
    const g = getScanGL();
    let raf = 0;
    if (!g) return { el, play() {}, stop() {} };
    const { gl, cv, u, prog, vao } = g;
    const q = 0.62;
    const w = Math.max(1, Math.round(window.innerWidth * q));
    const h = Math.max(1, Math.round(window.innerHeight * q));
    cv.width = w; cv.height = h;
    el.appendChild(cv);
    const c1 = hexRgb('#8B5CFF');
    const c2 = hexRgb(nextDark ? '#FF4D8F' : '#FF0062');
    const c3 = hexRgb(nextDark ? '#FFFFFF' : '#C2004B');
    const scale = 1.5;
    let start = 0;
    return {
      el,
      play(anim, total) {
        const frame = (ts) => {
          if (!start) start = ts;
          const elapsed = ts - start;
          let progress = anim.effect.getComputedTiming().progress;
          if (progress == null) progress = 1;
          const head = -(1 - 2 * (-0.12 + 1.24 * progress)) / scale;
          const fade = Math.min(1, elapsed / 120) * Math.max(0, Math.min(1, (total - elapsed) / 380));
          gl.viewport(0, 0, w, h);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.useProgram(prog);
          gl.uniform2f(u.uRes, w, h);
          gl.uniform1f(u.uWave, elapsed / 1e3 * 1.4);
          gl.uniform1f(u.uHead, head);
          gl.uniform1f(u.uScale, scale);
          gl.uniform1f(u.uOpacity, fade);
          gl.uniform1f(u.uLight, +!nextDark);
          gl.uniform1f(u.uTime, elapsed / 1e3);
          gl.uniform3fv(u.uC1, c1);
          gl.uniform3fv(u.uC2, c2);
          gl.uniform3fv(u.uC3, c3);
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
          gl.bindVertexArray(vao);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          raf = elapsed < total ? requestAnimationFrame(frame) : 0;
        };
        raf = requestAnimationFrame(frame);
      },
      stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    };
  }

  function applyTheme(nextDark) {
    theme.classList.toggle('dark', nextDark);
    localStorage.setItem('pd-theme', nextDark ? 'dark' : 'light');
    syncThemeBtn();
  }

  function toggleTheme() {
    const nextDark = !theme.classList.contains('dark');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) {
      applyTheme(nextDark);
      return;
    }
    if (themeVT) themeVT.skipTransition();
    const scan = scanLayer(nextDark);
    document.documentElement.classList.add('tscan-on');
    themeVT = document.startViewTransition(() => {
      document.body.appendChild(scan.el);
      applyTheme(nextDark);
    });
    themeVT.ready.then(() => {
      const dur = 1100;
      const vh = window.innerHeight;
      const mask = document.documentElement.animate(
        { maskPosition: ['0 ' + (-1.62 * vh) + 'px', '0 ' + (-0.38 * vh) + 'px'] },
        { pseudoElement: '::view-transition-new(root)', duration: dur, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'both' }
      );
      document.documentElement.animate({ opacity: [1, 1] }, { pseudoElement: '::view-transition-group(tscan)', duration: dur + 380 });
      scan.play(mask, dur + 380);
    }).catch(() => {});
    themeVT.finished.finally(() => {
      scan.stop();
      scan.el.remove();
      document.documentElement.classList.remove('tscan-on');
      if (themeVT) themeVT = null;
    });
  }

  themeBtn?.addEventListener('click', toggleTheme);

  /* ---------------------------------------------------------
     Smooth anchors + mobile menu
     --------------------------------------------------------- */
  const mobilePanel = $('#mobileMenu');
  const mobileScrim = $('#mobileScrim');
  const burger = $('#burger');

  function openMenu() {
    mobilePanel.classList.add('open');
    mobileScrim.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    html.classList.add('menu-open');
    setScrollLock(true);
    setTimeout(() => $('#mobileClose')?.focus(), 100);
  }
  function closeMenu() {
    mobilePanel.classList.remove('open');
    mobileScrim.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    html.classList.remove('menu-open');
    setScrollLock(false);
  }
  burger?.addEventListener('click', openMenu);
  $('#mobileClose')?.addEventListener('click', closeMenu);
  mobileScrim?.addEventListener('click', closeMenu);

  function scrollToId(id) {
    if (id === '#top' || id === '#') {
      smoothTo(0);
      return;
    }
    // The two pinned scenes need a custom landing point so the actual
    // content (cabinet / tablet) is on screen, not the intro panel.
    if (id === '#work' && workScene) {
      if (isMobile()) {
        const panel = $('#work-panel');
        smoothTo(panel.getBoundingClientRect().top + window.scrollY - 90);
        return;
      }
      smoothTo(workScene.offsetTop + (workScene.offsetHeight - window.innerHeight) * 0.985);
      return;
    }
    if (id === '#process' && processScene) {
      smoothTo(processScene.offsetTop + (processScene.offsetHeight - window.innerHeight) * 0.005);
      return;
    }
    const el = document.querySelector(id);
    if (!el) return;
    smoothTo(el.getBoundingClientRect().top + window.scrollY - 80);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    if (href.startsWith('#') && document.querySelector(href)) {
      e.preventDefault();
      closeMenu();
      scrollToId(href);
      history.replaceState(null, '', href);
    }
  });

  /* ---------------------------------------------------------
     Hero
     --------------------------------------------------------- */
  const hero = $('#top');
  const frame = $('#heroFrame');
  const layerToggle = $('#layerToggle');
  const heroFloatsLeft = $('.hero-floats--left');
  const heroFloatsRight = $('.hero-floats--right');

  layerToggle?.addEventListener('click', () => {
    const on = layerToggle.getAttribute('aria-checked') !== 'true';
    layerToggle.setAttribute('aria-checked', String(on));
    layerToggle.querySelector('.switch').classList.toggle('on', on);
    hero.classList.toggle('layers-off', !on);
  });

  // Draggable hero frame
  if (frame) {
    let dragging = false, startX = 0, startY = 0, baseX = 0, baseY = 0, moved = false;
    const setPos = (x, y) => {
      frame.style.setProperty('--fx', x + 'px');
      frame.style.setProperty('--fy', y + 'px');
    };
    frame.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true; moved = false;
      startX = e.clientX; startY = e.clientY;
      baseX = parseFloat(frame.style.getPropertyValue('--fx')) || 0;
      baseY = parseFloat(frame.style.getPropertyValue('--fy')) || 0;
      frame.classList.add('dragging');
      frame.setPointerCapture(e.pointerId);
    });
    frame.addEventListener('pointermove', (e) => {
      const r = frame.getBoundingClientRect();
      if (r.width) {
        frame.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        frame.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      }
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      setPos(clamp(baseX + dx, -220, 220), clamp(baseY + dy, -120, 120));
    });
    frame.addEventListener('pointerleave', () => {
      frame.style.setProperty('--mx', '50%');
      frame.style.setProperty('--my', '50%');
    });
    const stop = () => { dragging = false; frame.classList.remove('dragging'); };
    frame.addEventListener('pointerup', stop);
    frame.addEventListener('pointercancel', stop);
    frame.addEventListener('dblclick', () => { setPos(0, 0); });
    frame.addEventListener('click', (e) => { if (moved) e.preventDefault(); });
  }

  /* ---------------------------------------------------------
     Hero tech text — per-letter solid/dashed layers, hover
     selection, drag-to-separate and spring-back.
     --------------------------------------------------------- */
  (function heroTechText() {
    const box = $('#ttBox');
    const canvas = $('#heroTextCanvas');
    const nameEl = $('#heroName');
    if (!box || !canvas || !nameEl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const text = (nameEl.textContent || '').trim();
    if (!text) return;
    const chars = Array.from(text);
    const family = "'Bricolage Grotesque', sans-serif";
    const weight = 800;
    const base = 240;
    const track = -0.03;
    const stiffness = 320;
    const bounce = 0.4;
    const damping = 2 * Math.sqrt(stiffness) * (1 - bounce * 0.96);
    let W = 0, H = 0, DPR = 1;
    let items = [];
    let hover = -1, drag = -1;
    let dragStart = null, downInfo = null;
    let colors = { ink: '#f2f1ee', accent: '#FF0062' };
    let running = false, raf = 0, last = 0;
    const selection = { alpha: 0, index: -1 };

    function readColors() {
      const themeEl = document.getElementById('theme');
      const cs = getComputedStyle(themeEl);
      colors.ink = cs.getPropertyValue('--ink').trim() || cs.color || '#f2f1ee';
      colors.accent = cs.getPropertyValue('--accent').trim() || '#FF0062';
    }

    function measureCtx(size) {
      const c = document.createElement('canvas').getContext('2d');
      c.font = `${weight} ${size}px ${family}`;
      if ('letterSpacing' in c) c.letterSpacing = `${track * size}px`;
      return c;
    }

    function charImage(ch, size, color, dashed) {
      const m = measureCtx(size);
      const cm = m.measureText(ch);
      const pad = 10;
      const w = Math.max(1, Math.ceil(cm.actualBoundingBoxLeft + cm.actualBoundingBoxRight + pad * 2));
      const h = Math.max(1, Math.ceil(cm.actualBoundingBoxAscent + cm.actualBoundingBoxDescent + pad * 2));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.ceil(w * DPR));
      c.height = Math.max(1, Math.ceil(h * DPR));
      const g = c.getContext('2d');
      g.setTransform(DPR, 0, 0, DPR, 0, 0);
      g.font = `${weight} ${size}px ${family}`;
      if ('letterSpacing' in g) g.letterSpacing = `${track * size}px`;
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      const x = pad + cm.actualBoundingBoxLeft;
      const y = pad + cm.actualBoundingBoxAscent;
      if (dashed) {
        g.strokeStyle = color;
        g.lineWidth = 1.5;
        g.lineJoin = 'round';
        g.lineCap = 'butt';
        g.setLineDash([4, 2]);
        g.strokeText(ch, x, y);
        g.setLineDash([]);
        g.globalCompositeOperation = 'destination-out';
        g.fillStyle = '#000';
        g.fillText(ch, x, y);
        g.globalCompositeOperation = 'source-over';
      } else {
        g.fillStyle = color;
        g.fillText(ch, x, y);
      }
      return { image: c, w, h, pad };
    }

    function build() {
      readColors();
      const measure = measureCtx(base);
      const mb = measure.measureText(text);
      const textW = Math.max(1, mb.actualBoundingBoxLeft + mb.actualBoundingBoxRight);
      const textH = Math.max(1, mb.actualBoundingBoxAscent + mb.actualBoundingBoxDescent);
      const scale = Math.min(1, W * 0.97 / textW, H * 0.9 / textH);
      const size = base * scale;
      const mm = measureCtx(size);
      const full = mm.measureText(text);
      const ascent = full.actualBoundingBoxAscent;
      const descent = full.actualBoundingBoxDescent;
      const baseline = (H - (ascent + descent)) / 2 + ascent;
      const startX = (W - (full.actualBoundingBoxLeft + full.actualBoundingBoxRight)) / 2 + full.actualBoundingBoxLeft;
      const prev = new Map(items.map(it => [it.index, it]));
      items = [];
      let prefix = '';
      chars.forEach((ch, i) => {
        prefix += ch;
        const cm = mm.measureText(ch);
        const pm = mm.measureText(prefix);
        const x = startX + pm.width - cm.width;
        const bx1 = x - cm.actualBoundingBoxLeft;
        const by1 = baseline - cm.actualBoundingBoxAscent;
        const bx2 = x + cm.actualBoundingBoxRight;
        const by2 = baseline + cm.actualBoundingBoxDescent;
        const color = (ch === '.' && i === chars.length - 1) ? colors.accent : colors.ink;
        const old = prev.get(i);
        items.push({
          char: ch,
          index: i,
          x,
          box: { x1: bx1, y1: by1, x2: bx2, y2: by2 },
          fill: charImage(ch, size, color, false),
          dashes: charImage(ch, size, color, true),
          offset: old ? { x: old.offset.x, y: old.offset.y } : { x: 0, y: 0 },
          velocity: old ? { x: old.velocity.x, y: old.velocity.y } : { x: 0, y: 0 },
          outline: old ? old.outline : 0,
          shown: 1
        });
      });
      selection.index = -1;
      selection.alpha = 0;
      wake();
    }

    function resize() {
      const r = box.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      build();
    }

    function findChar(px, py) {
      let best = -1, bestD = Infinity;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const x1 = it.box.x1 + it.offset.x - 5;
        const x2 = it.box.x2 + it.offset.x + 5;
        const y1 = it.box.y1 + it.offset.y - 5;
        const y2 = it.box.y2 + it.offset.y + 5;
        if (px >= x1 && px <= x2 && py >= y1 && py <= y2) return i;
        const dx = px < x1 ? x1 - px : px > x2 ? px - x2 : 0;
        const dy = py < y1 ? y1 - py : py > y2 ? py - y2 : 0;
        const d = dx * dx + dy * dy;
        if (d < bestD && d < 900) { bestD = d; best = i; }
      }
      return best;
    }

    function drawSelection() {
      if (selection.alpha < 0.01 || selection.index < 0) return;
      const it = items[selection.index];
      if (!it) return;
      const x1 = it.box.x1 + it.offset.x - 6;
      const y1 = it.box.y1 + it.offset.y - 6;
      const x2 = it.box.x2 + it.offset.x + 6;
      const y2 = it.box.y2 + it.offset.y + 6;
      const a = selection.alpha;
      ctx.save();
      ctx.globalAlpha = a;

      // Outer frame around the whole word
      let ox1 = Infinity, oy1 = Infinity, ox2 = -Infinity, oy2 = -Infinity;
      items.forEach(o => {
        ox1 = Math.min(ox1, o.box.x1 + o.offset.x);
        oy1 = Math.min(oy1, o.box.y1 + o.offset.y);
        ox2 = Math.max(ox2, o.box.x2 + o.offset.x);
        oy2 = Math.max(oy2, o.box.y2 + o.offset.y);
      });
      const pad = 14;
      ox1 -= pad; oy1 -= pad; ox2 += pad; oy2 += pad;
      ctx.globalAlpha = a * 0.9;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(ox1, oy1, ox2 - ox1, oy2 - oy1);
      const oh = 6;
      const oPts = [
        [ox1, oy1], [(ox1 + ox2) / 2, oy1], [ox2, oy1],
        [ox1, (oy1 + oy2) / 2], [ox2, (oy1 + oy2) / 2],
        [ox1, oy2], [(ox1 + ox2) / 2, oy2], [ox2, oy2]
      ];
      ctx.fillStyle = colors.accent;
      oPts.forEach(([px, py]) => {
        ctx.fillRect(px - oh / 2, py - oh / 2, oh, oh);
      });

      // Letter box
      ctx.globalAlpha = a;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      const hs = 5;
      const pts = [
        [x1, y1], [(x1 + x2) / 2, y1], [x2, y1],
        [x1, (y1 + y2) / 2], [x2, (y1 + y2) / 2],
        [x1, y2], [(x1 + x2) / 2, y2], [x2, y2]
      ];
      ctx.fillStyle = colors.accent;
      pts.forEach(([px, py]) => ctx.fillRect(px - hs / 2, py - hs / 2, hs, hs));
      ctx.font = '500 10px "Geist Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      const moved = Math.hypot(it.offset.x, it.offset.y) > 1;
      const label = moved
        ? `${it.char}  +${Math.round(it.offset.x)}, +${Math.round(-it.offset.y)}`
        : `${it.char}  ${Math.round(it.box.x2 - it.box.x1)} × ${Math.round(it.box.y2 - it.box.y1)}`;
      ctx.globalAlpha = a * 0.9;
      ctx.fillStyle = colors.accent;
      ctx.fillText(label, x1, y1 - 8);
      ctx.globalAlpha = a * 0.55;
      ctx.fillStyle = colors.ink;
      for (let i = 0; i < 10; i++) {
        const s = i % 4 === 0 ? 2 : 1;
        const sx = x1 + ((i * 47) % Math.max(1, x2 - x1));
        const sy = y1 + ((i * 67) % Math.max(1, y2 - y1));
        ctx.fillRect(sx, sy, s, s);
      }
      if (moved) {
        ctx.globalAlpha = a * 0.45;
        ctx.strokeStyle = colors.accent;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo((it.box.x1 + it.box.x2) / 2, (it.box.y1 + it.box.y2) / 2);
        ctx.lineTo((it.box.x1 + it.box.x2) / 2 + it.offset.x, (it.box.y1 + it.box.y2) / 2 + it.offset.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }

    function draw() {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      let moving = false;
      items.forEach((it, i) => {
        const target = (hover === i && drag !== i) ? 1 : 0;
        it.outline += (target - it.outline) * Math.min(1, dt * 12);
        if (Math.abs(it.outline - target) < 0.002) it.outline = target;
        if (drag === i) {
          moving = true;
        } else {
          const ox = it.offset.x, oy = it.offset.y;
          it.velocity.x += (-stiffness * ox - damping * it.velocity.x) * dt;
          it.velocity.y += (-stiffness * oy - damping * it.velocity.y) * dt;
          it.offset.x += it.velocity.x * dt;
          it.offset.y += it.velocity.y * dt;
          if (Math.abs(it.offset.x) < 0.05 && Math.abs(it.offset.y) < 0.05 && Math.hypot(it.velocity.x, it.velocity.y) < 0.5) {
            it.offset.x = 0;
            it.offset.y = 0;
            it.velocity.x = 0;
            it.velocity.y = 0;
          } else {
            moving = true;
          }
        }
        if (Math.abs(it.outline - target) > 0.002) moving = true;
      });
      selection.alpha += ((hover >= 0 ? 1 : 0) - selection.alpha) * Math.min(1, dt * 10);
      if (selection.alpha < 0.01) selection.index = -1;
      else selection.index = hover;
      ctx.clearRect(0, 0, W, H);
      items.forEach(it => {
        if (Math.hypot(it.offset.x, it.offset.y) > 1) {
          const d = it.dashes;
          ctx.globalAlpha = 0.55;
          ctx.drawImage(d.image, it.box.x1 - d.pad, it.box.y1 - d.pad, d.w, d.h);
        }
      });
      items.forEach(it => {
        const f = it.fill, d = it.dashes;
        if (it.outline < 0.999) {
          ctx.globalAlpha = 1 - it.outline;
          ctx.drawImage(f.image, it.box.x1 - f.pad + it.offset.x, it.box.y1 - f.pad + it.offset.y, f.w, f.h);
        }
        if (it.outline > 0.001) {
          ctx.globalAlpha = it.outline;
          ctx.drawImage(d.image, it.box.x1 - d.pad + it.offset.x, it.box.y1 - d.pad + it.offset.y, d.w, d.h);
        }
      });
      ctx.globalAlpha = 1;
      drawSelection();
      if (moving || selection.alpha > 0.01) raf = requestAnimationFrame(draw);
      else running = false;
    }

    function wake() {
      if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    }

    function pointerPos(e) {
      const r = canvas.getBoundingClientRect();
      const k = r.width ? canvas.clientWidth / r.width : 1;
      return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
    }

    canvas.addEventListener('pointermove', (e) => {
      if (frame && frame.classList.contains('dragging')) return;
      if (drag >= 0) {
        const it = items[drag];
        if (it && dragStart) {
          it.offset.x = dragStart.ox + (e.clientX - dragStart.px);
          it.offset.y = dragStart.oy + (e.clientY - dragStart.py);
        }
        canvas.style.cursor = 'grabbing';
        wake();
        return;
      }
      const p = pointerPos(e);
      const h = findChar(p.x, p.y);
      if (h !== hover) {
        hover = h;
        wake();
      }
      canvas.style.cursor = h >= 0 ? 'grab' : 'grab';
    }, { passive: true });

    canvas.addEventListener('pointerleave', () => {
      if (drag < 0) {
        hover = -1;
        wake();
      }
    });

    canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button > 0) return;
      const p = pointerPos(e);
      const h = findChar(p.x, p.y);
      if (h < 0) return;
      e.stopPropagation();
      e.preventDefault();
      hover = h;
      drag = h;
      const it = items[h];
      dragStart = { px: e.clientX, py: e.clientY, ox: it.offset.x, oy: it.offset.y };
      downInfo = { x: e.clientX, y: e.clientY, t: performance.now() };
      it.velocity.x = 0;
      it.velocity.y = 0;
      try { canvas.setPointerCapture(e.pointerId); } catch {}
      canvas.style.cursor = 'grabbing';
      wake();
    });

    const endDrag = (e) => {
      if (drag < 0) return;
      const idx = drag;
      const it = items[idx];
      drag = -1;
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
      if (downInfo && e.type === 'pointerup' && performance.now() - downInfo.t < 450 && Math.hypot(e.clientX - downInfo.x, e.clientY - downInfo.y) < 6) {
        const kick = 700;
        it.velocity.y -= kick;
        for (let n = 1; n < items.length; n++) {
          const v = kick * Math.pow(0.62, n);
          if (v < 30) break;
          [idx - n, idx + n].forEach(j => {
            if (items[j]) items[j].velocity.y -= v;
          });
        }
      }
      downInfo = null;
      dragStart = null;
      canvas.style.cursor = 'grab';
      wake();
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    const themeEl = document.getElementById('theme');
    if (themeEl && 'MutationObserver' in window) {
      new MutationObserver(() => build()).observe(themeEl, { attributes: true, attributeFilter: ['class'] });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize, resize);
    else resize();
    window.addEventListener('resize', resize, { passive: true });
  })();

  // Custom cursor follower (desktop / fine pointer only)
  const rcur = $('#rcur');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (rcur && finePointer && !reduced) {
    let rx = 0, ry = 0, tx = 0, ty = 0, raf = 0, active = false;
    const tick = () => {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      rcur.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      if (active) raf = requestAnimationFrame(tick);
    };
    hero.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!active) { active = true; rcur.classList.add('on'); rx = tx; ry = ty; raf = requestAnimationFrame(tick); }
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      active = false; rcur.classList.remove('on'); cancelAnimationFrame(raf);
    });
  }

  // Decorative annotations should not be announced by screen readers.
  $$('.cursor-note').forEach(n => n.setAttribute('aria-hidden', 'true'));

  // Typing chat notes
  const noteTexts = ["Validate the trip details.", "Check rates and charges.", "Match the invoice records.", "Investigate the exceptions.", "Track invoice aging.", "Make the insight clear."];
  if (!reduced) {
    $$('.cursor-note').forEach((note, i) => {
      const textEl = note.querySelector('.ctext');
      const full = noteTexts[i] || '';
      if (!textEl) return;
      let chars = 0, deleting = false;
      const tick = () => {
        if (document.hidden) { setTimeout(tick, 700); return; }
        if (!deleting) {
          chars++;
          textEl.textContent = full.slice(0, chars);
          if (chars >= full.length) { deleting = true; setTimeout(tick, 2200 + i * 160); return; }
          setTimeout(tick, 46 + (i % 3) * 8);
        } else {
          chars--;
          textEl.textContent = full.slice(0, Math.max(0, chars));
          if (chars <= 0) { deleting = false; setTimeout(tick, 500); return; }
          setTimeout(tick, 22);
        }
      };
      setTimeout(tick, 1200 + i * 900);
    });
  } else {
    $$('.cursor-note .ctext').forEach((el, i) => { el.textContent = noteTexts[i] || ''; });
  }

  /* ---------------------------------------------------------
     Cabinet folders
     --------------------------------------------------------- */
  const cabinet = $('#cabinetInner');
  const projectModal = $('#projectModal');

  function buildFolders() {
    if (!cabinet) return;
    const frag = document.createDocumentFragment();
    projects.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'folder';
      btn.dataset.index = String(i);
      btn.style.cssText = `--i:${i};--z:${i + 1};--left:${p.left}%;--right:${p.right}%;--fac:${p.accent};--fsl:${p.light};--fsd:${p.dark};--tab:${p.tabPos};--fink:#161618`;
      btn.setAttribute('aria-label', `Open ${p.title}`);
      btn.innerHTML = `
        <span class="folder-glow" aria-hidden="true"></span>
        <span class="folder-tab" aria-hidden="true"><span>${p.tab}</span></span>
        <span class="folder-paper" aria-hidden="true">
          <span class="folder-photo"><img src="${p.thumb || p.img}" alt="" loading="lazy" decoding="async" draggable="false"></span>
          <span class="folder-mini-text">
            <span class="folder-mini-title">${p.title}</span>
            <i></i><i></i>
            <span class="folder-mini-tags"><i></i><i></i><i></i></span>
          </span>
        </span>
        <span class="folder-body" aria-hidden="true">
          <span class="folder-row"><span class="folder-num">${String(i + 1).padStart(2, '0')}</span><span class="folder-name">${p.title}</span><span class="folder-type">${p.type}</span></span>
          <span class="folder-body-inner">
            <span class="folder-tagline">${p.tagline}</span>
            <span class="folder-body-tags">${p.tags.slice(0, 3).map(t => `<i>${t}</i>`).join('')}</span>
            <span class="folder-open">Open project <span>→</span></span>
          </span>
        </span>`;
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        btn.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      }, { passive: true });
      btn.addEventListener('click', () => openProject(i, btn));
      frag.appendChild(btn);
    });
    const drawer = cabinet.querySelector('.drawer-front');
    cabinet.insertBefore(frag, drawer);
  }
  buildFolders();

  /* ---------------------------------------------------------
     Project modal
     --------------------------------------------------------- */
  const modal = {
    root: projectModal,
    card: $('#projectCard'),
    image: $('#projectImage'),
    badge: $('#projectBadge'),
    eyebrow: $('#projectEyebrow'),
    title: $('#projectTitle'),
    tagline: $('#projectTagline'),
    about: $('#projectAbout'),
    stats: $('#projectStats'),
    tags: $('#projectTags'),
    link: $('#projectLink'),
    linkText: $('#projectLinkText'),
    linkText2: $('#projectLinkText2'),
    close: $('#projectClose'),
    scrim: $('#projectScrim'),
    next: $('#projectNext')
  };
  let activeProject = 0;
  let lastFocus = null;

  function lockScroll(on) {
    html.classList.toggle('modal-open', on);
    setScrollLock(on);
  }

  function openProject(index, folderEl) {
    activeProject = index;
    const p = projects[index];
    if (!p) return;
    modal.image.src = p.img;
    modal.image.alt = p.imageAlt || p.title;
    modal.badge.textContent = String(index + 1).padStart(2, '0');
    modal.eyebrow.textContent = `${String(index + 1).padStart(2, '0')} / ${p.type}`;
    modal.title.textContent = p.title;
    modal.tagline.textContent = p.tagline;
    modal.about.textContent = p.about;
    modal.stats.innerHTML = p.stats.map(s => `<span><b>${s.v}</b>${s.l}</span>`).join('');
    modal.tags.innerHTML = p.tags.map(t => `<span>${t}</span>`).join('');
    modal.link.href = p.link;
    modal.linkText.textContent = p.linkText;
    modal.linkText2.textContent = p.linkText;
    modal.link.target = p.link.startsWith('http') ? '_blank' : '_self';
    modal.link.rel = p.link.startsWith('http') ? 'noopener noreferrer' : '';
    lastFocus = document.activeElement;
    modal.root.classList.add('in');
    modal.root.setAttribute('aria-hidden', 'false');
    lockScroll(true);

    // FLIP: pull the project out of its folder and into the modal.
    if (!reduced && folderEl && modal.card) {
      const source = folderEl.querySelector('.folder-paper') || folderEl;
      const from = source.getBoundingClientRect();
      const to = modal.card.getBoundingClientRect();
      if (from.width && to.width) {
        const scale = clamp(from.width / to.width, 0.06, 1);
        const dx = (from.left + from.width / 2) - (to.left + to.width / 2);
        const dy = (from.top + from.height / 2) - (to.top + to.height / 2);
        modal.card.animate([
          { transform: `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(${scale.toFixed(3)})`, opacity: 0.2, borderRadius: '10px' },
          { transform: 'translate(0,0) scale(1)', opacity: 1, borderRadius: '20px' }
        ], { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)' });
        modal.image.animate([
          { opacity: 0, transform: 'scale(1.08)' },
          { opacity: 1, transform: 'scale(1)' }
        ], { duration: 700, delay: 110, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
      }
    }
    setTimeout(() => modal.close.focus(), 120);
  }

  function closeProject() {
    modal.root.classList.remove('in');
    modal.root.setAttribute('aria-hidden', 'true');
    lockScroll(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  modal.close?.addEventListener('click', closeProject);
  modal.scrim?.addEventListener('click', closeProject);
  modal.next?.addEventListener('click', () => openProject((activeProject + 1) % projects.length));
  modal.link?.addEventListener('click', () => { if (modal.link.getAttribute('href') === '#contact') closeProject(); });

  /* ---------------------------------------------------------
     Scroll-driven scenes
     --------------------------------------------------------- */
  const workScene = $('#workScene');
  const workTrack = $('#workTrack');
  const revealWords = $('.reveal-words');
  const processScene = $('#processScene');
  const flowCanvas = $('#flowCanvas');
  const flowView = $('#flowView');
  const flowScroll = $('#flowScroll');
  const scrollBar = $('#tabletScrollBar');
  const toolItems = $$('.tool');
  const toolStage = $('#toolStage');
  const flowNodes = $$('.flow-node', flowCanvas || document);
  const timeline = $('#timeline');
  const timelineFill = $('#timelineFill');
  const timelineComet = $('#timelineComet');

  let lastWorkP = -1, lastWorkR = -1, lastProcessP = -1, lastTimelineP = -1;

  function updateHeroParallax() {
    if (!heroFloatsLeft || !heroFloatsRight) return;
    if (isMobile() || reduced) {
      heroFloatsLeft.style.transform = '';
      heroFloatsRight.style.transform = '';
      return;
    }
    const p = clamp(window.scrollY / Math.max(1, window.innerHeight), 0, 1);
    heroFloatsLeft.style.transform = `translateY(calc(-46% + ${(p * 46).toFixed(1)}px))`;
    heroFloatsRight.style.transform = `translateY(calc(-46% - ${(p * 32).toFixed(1)}px))`;
  }

  function updateWork() {
    if (!workScene || !workTrack) return;
    if (isMobile()) {
      if (workTrack.style.transform) workTrack.style.transform = '';
      if (revealWords) revealWords.style.setProperty('--rv', '1');
      return;
    }
    const rect = workScene.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const pin = workScene.querySelector('.hx-pin');
    const space = Math.max(1, workScene.offsetHeight - (pin ? pin.offsetHeight : vh));
    const a = -rect.top;
    const reveal = clamp((a + vh * 0.45) / (space * 0.6 + vh * 0.45), 0, 1);
    let s = clamp((a / space - 0.62) / 0.38, 0, 1);
    s = s < 0.5 ? 2 * s * s : 1 - Math.pow(-2 * s + 2, 2) / 2;
    if (Math.abs(s - lastWorkP) < 0.0008 && Math.abs(reveal - (lastWorkR || 0)) < 0.002) return;
    lastWorkP = s;
    lastWorkR = reveal;
    workTrack.style.transform = `translate3d(${(-50 * s).toFixed(3)}%,0,0)`;
    if (revealWords) revealWords.style.setProperty('--rv', reveal.toFixed(4));
  }

  function updateProcess() {
    if (!processScene || !flowCanvas || !flowView) return;
    const rect = processScene.getBoundingClientRect();
    const total = processScene.offsetHeight - window.innerHeight;
    const p = clamp(-rect.top / Math.max(1, total), 0, 1);

    if (isMobile()) {
      // native horizontal scroll on mobile
      if (scrollBar) { scrollBar.style.width = '35%'; scrollBar.style.marginLeft = '0'; }
      return;
    }
    if (Math.abs(p - lastProcessP) < 0.0008) return;
    lastProcessP = p;

    const maxX = Math.max(0, 3820 - flowView.clientWidth + 40);
    const x = p * maxX;
    flowCanvas.style.setProperty('--flow-x', x.toFixed(1));

    const thumbPct = clamp(flowView.clientWidth / 3820 * 100, 8, 100);
    if (scrollBar) {
      scrollBar.style.width = thumbPct + '%';
      scrollBar.style.marginLeft = (p * (100 - thumbPct)) + '%';
    }

    // highlight the node nearest the viewport centre
    if (flowNodes.length) {
      const centre = x + flowView.clientWidth / 2;
      let best = null, bestD = Infinity;
      flowNodes.forEach(n => {
        const d = Math.abs((n.offsetLeft + n.offsetWidth / 2) - centre);
        if (d < bestD) { bestD = d; best = n; }
      });
      if (best) {
        const tools = (best.dataset.tools || '').split(/\s+/);
        toolItems.forEach(t => t.classList.toggle('on', tools.includes(t.dataset.tool)));
        if (toolStage) toolStage.textContent = best.dataset.stage || '';
        flowNodes.forEach(n => n.classList.toggle('active', n === best));
      }
    }
  }

  function updateTimeline() {
    if (!timeline) return;
    const rect = timeline.getBoundingClientRect();
    const p = clamp((window.innerHeight * 0.68 - rect.top) / Math.max(1, rect.height), 0, 1);
    if (Math.abs(p - lastTimelineP) < 0.001) return;
    lastTimelineP = p;
    if (timelineFill) timelineFill.style.height = (p * 100).toFixed(2) + '%';
    if (timelineComet) {
      timelineComet.style.setProperty('--comet-y', (p * rect.height).toFixed(1) + 'px');
      timelineComet.style.setProperty('--comet-o', p > 0.01 && p < 0.995 ? '1' : '0');
    }
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateHeroParallax();
      updateWork();
      updateProcess();
      updateTimeline();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    lastWorkP = lastProcessP = lastTimelineP = -1;
    onScroll();
  }, { passive: true });

  // reveal timeline cards
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
        }
      });
    }, { rootMargin: '-12% 0px -12% 0px', threshold: 0.12 });
    $$('[data-reveal]').forEach(el => io.observe(el));
  } else {
    $$('[data-reveal]').forEach(el => el.classList.add('on'));
  }

  // Scroll reveals for section headings, contact copy and footer columns.
  if (!reduced && 'IntersectionObserver' in window) {
    const revealTargets = $$('.section-head, .process-heading, .exp-head, .contact-inner > *, .footer-grid > *, .lanyard-wrap');
    revealTargets.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--rd', `${(i % 6) * 55}ms`);
    });
    const revealIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealIo.unobserve(entry.target);
        }
      });
    }, { rootMargin: '-8% 0px -8% 0px', threshold: 0.08 });
    revealTargets.forEach(el => revealIo.observe(el));
  }

  // Process tablet: reveal nodes and wires when the scene is live.
  if (processScene && 'IntersectionObserver' in window) {
    const processIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) processScene.classList.add('live');
      });
    }, { threshold: 0.12 });
    processIo.observe(processScene);
  }

  // Pen sketches draw themselves in when the statement panel appears.
  const penSketches = $$('.pen-sketch');
  penSketches.forEach(svg => {
    $$('.seg', svg).forEach(path => path.setAttribute('pathLength', '1'));
  });
  if (penSketches.length && 'IntersectionObserver' in window) {
    const penIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('draw');
          penIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    penSketches.forEach(svg => penIo.observe(svg));
  } else {
    penSketches.forEach(svg => svg.classList.add('draw'));
  }

  // Pointer spotlight on experience cards.
  $$('.timeline-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
  });

  // mobile process native scroll → tool highlight
  if (flowScroll) {
    flowScroll.addEventListener('scroll', () => {
      if (!isMobile() || !flowNodes.length) return;
      const centre = flowScroll.scrollLeft + flowScroll.clientWidth / 2;
      let best = null, bestD = Infinity;
      flowNodes.forEach(n => {
        const d = Math.abs((n.offsetLeft + n.offsetWidth / 2) - centre);
        if (d < bestD) { bestD = d; best = n; }
      });
      if (best) {
        const tools = (best.dataset.tools || '').split(/\s+/);
        toolItems.forEach(t => t.classList.toggle('on', tools.includes(t.dataset.tool)));
        if (toolStage) toolStage.textContent = best.dataset.stage || '';
        flowNodes.forEach(n => n.classList.toggle('active', n === best));
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Lanyard card
     --------------------------------------------------------- */
  const lanyardWrap = $('#lanyardWrap');
  const lanyard = $('#lanyardCard');
  const lanyardSvg = $('.lanyard-svg');
  const strapPath = $('#strapPath');
  const lanClip = $('#lanClip');
  const lanSheen = $('.card-sheen');
  let lanyard2DStop = null;

  if (lanyardWrap && lanyard && strapPath) {
    const A = 6, O = A + 1, N = 1 / 120;
    const s = new Array(O + 1).fill(0);
    const c = new Array(O + 1).fill(0);
    const l = new Array(O + 1).fill(0);
    const u = new Array(O + 1).fill(0);
    const mass = new Array(O + 1).fill(1);
    mass[0] = 0;
    mass[A] = 0.35;
    mass[O] = 0.35;
    const coarse = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
    let W = 0, H = 0, cardW = 0, cardH = 0, cardSeg = 0, ropeSeg = 0, fixedX = 0, fixedY = -24;
    let running = false, raf = 0, last = 0, acc = 0, idle = 0, swayClock = 0;
    let drag = null, downAt = null, moved = false, initialized = false;

    const measure = () => {
      W = lanyardWrap.offsetWidth || 1;
      H = lanyardWrap.offsetHeight || 1;
      cardW = lanyard.offsetWidth || 300;
      cardH = lanyard.offsetHeight || 500;
      cardSeg = cardH + 8;
      ropeSeg = Math.max(18, (H * 0.27 + 24) / A);
      fixedX = W / 2;
      fixedY = -24;
    };

    const reset = () => {
      measure();
      for (let i = 0; i <= A; i++) {
        s[i] = fixedX;
        c[i] = fixedY + i * ropeSeg;
      }
      s[O] = s[A];
      c[O] = c[A] + cardSeg;
      for (let i = 0; i <= O; i++) {
        l[i] = s[i];
        u[i] = c[i];
      }
      initialized = true;
      render();
    };

    const constrain = (a, b, target, rigid, stiffness) => {
      const dx = s[b] - s[a];
      const dy = c[b] - c[a];
      const len = Math.hypot(dx, dy) || 1e-4;
      if (!rigid && len <= target) return;
      const m = mass[a] + mass[b];
      if (!m) return;
      const f = (len - target) / len * stiffness;
      s[a] += dx * f * (mass[a] / m);
      c[a] += dy * f * (mass[a] / m);
      s[b] -= dx * f * (mass[b] / m);
      c[b] -= dy * f * (mass[b] / m);
    };

    const step = (dt) => {
      swayClock += dt;
      const sway = (reduced || coarse) ? 0 : 0.35 * (Math.sin(swayClock * 0.53) * 0.7 + Math.sin(swayClock * 1.31 + 1.7) * 0.3) * 260;
      for (let i = 1; i <= O; i++) {
        let dx = (s[i] - l[i]) * 0.992;
        let dy = (c[i] - u[i]) * 0.992;
        const len = Math.hypot(dx, dy);
        if (len > 60) { dx *= 60 / len; dy *= 60 / len; }
        l[i] = s[i];
        u[i] = c[i];
        s[i] += dx + (i >= A ? sway : sway * 0.3) * dt * dt;
        c[i] += dy + 2600 * dt * dt;
      }
      s[0] = fixedX;
      c[0] = fixedY;
      for (let k = 0; k < 10; k++) {
        for (let i = 0; i < A; i++) constrain(i, i + 1, ropeSeg, false, drag ? 0.55 : 0.95);
        constrain(A, O, cardSeg, true, 1);
        if (drag) {
          const hx = s[A] + (s[O] - s[A]) * drag.f;
          const hy = c[A] + (c[O] - c[A]) * drag.f;
          const dx = drag.x - hx;
          const dy = drag.y - hy;
          s[A] += dx * (1 - drag.f);
          c[A] += dy * (1 - drag.f);
          s[O] += dx * drag.f;
          c[O] += dy * drag.f;
        }
      }
      const minTop = fixedY + 12;
      if (c[A] < minTop) {
        const push = minTop - c[A];
        c[A] += push;
        c[O] += push;
        u[A] = c[A];
        u[O] = c[O];
      }
    };

    const pathD = () => {
      const pts = [];
      for (let i = 0; i <= A; i++) pts.push([s[i], c[i]]);
      let d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c1y = p1[1] + (p2[1] - p0[1]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += 'C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
      }
      return d;
    };

    const render = () => {
      const x = s[A], y = c[A], x2 = s[O], y2 = c[O];
      const dx = x2 - x, dy = y2 - y;
      const len = Math.hypot(dx, dy) || 1;
      const angle = -Math.atan2(dx, dy) * 180 / Math.PI;
      const tx = x + dx / len * 8;
      const ty = y + dy / len * 8;
      const velocity = (s[O] - l[O]) / N;
      const tilt = Math.max(-28, Math.min(28, velocity * 0.018));
      lanyard.style.transform = `translate(${(tx - cardW / 2).toFixed(1)}px,${ty.toFixed(1)}px) rotate(${angle.toFixed(2)}deg) perspective(1200px) rotateY(${tilt.toFixed(2)}deg)`;
      if (lanSheen) lanSheen.style.transform = `translateX(${(18 - (angle * 2.2 + tilt * 1.5) * 1.6 / 2.6).toFixed(2)}%)`;
      strapPath.setAttribute('d', pathD());
      if (lanClip) {
        const bx = x - s[A - 1];
        const by = y - c[A - 1];
        const ca = -Math.atan2(bx, by) * 180 / Math.PI;
        lanClip.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ca.toFixed(2)})`);
      }
    };

    const energy = () => {
      let e = 0;
      for (let i = 1; i <= O; i++) {
        const dx = s[i] - l[i];
        const dy = c[i] - u[i];
        e += dx * dx + dy * dy;
      }
      return e;
    };

    const tick = (now) => {
      if (!running) return;
      const frame = Math.min(1 / 20, Math.max(0, (now - last) / 1000));
      last = now;
      acc += frame;
      let steps = 0;
      while (acc >= N && steps < 6) {
        step(N);
        acc -= N;
        steps++;
      }
      if (steps === 6) acc = 0;
      render();
      idle = energy() < 4e-4 && !drag ? idle + frame : 0;
      if (!(idle > 0.8 && !drag && coarse)) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const start = () => {
      if (!initialized) reset();
      if (!running) {
        running = true;
        last = performance.now();
        acc = 0;
        idle = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    lanyard2DStop = stop;

    const pointerPos = (e) => {
      const r = lanyardWrap.getBoundingClientRect();
      const scale = r.width ? lanyardWrap.offsetWidth / r.width : 1;
      return { x: (e.clientX - r.left) * scale, y: (e.clientY - r.top) * scale };
    };

    const onDown = (e) => {
      if (e.button !== undefined && e.button > 0) return;
      const p = pointerPos(e);
      const dx = s[O] - s[A];
      const dy = c[O] - c[A];
      const f = Math.max(0.05, Math.min(1, ((p.x - s[A]) * dx + (p.y - c[A]) * dy) / (dx * dx + dy * dy || 1)));
      drag = { x: p.x, y: p.y, f };
      downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
      moved = false;
      lanyard.classList.add('dragging');
      try { lanyard.setPointerCapture(e.pointerId); } catch {}
      e.preventDefault();
      start();
    };

    const onMove = (e) => {
      if (!drag) return;
      const p = pointerPos(e);
      drag.x = p.x;
      drag.y = Math.max(cardH * drag.f + 12, p.y);
      if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 6) moved = true;
      start();
    };

    const onUp = (e) => {
      if (!drag) return;
      drag = null;
      lanyard.classList.remove('dragging');
      try { lanyard.releasePointerCapture(e.pointerId); } catch {}
      if (!moved && e.type === 'pointerup' && downAt && performance.now() - downAt.t < 450) {
        lanyard.classList.toggle('flipped');
        s[O] += lanyard.classList.contains('flipped') ? 6 : -6;
      }
      downAt = null;
      start();
    };

    lanyard.addEventListener('pointerdown', onDown);
    lanyard.addEventListener('pointermove', onMove);
    lanyard.addEventListener('pointerup', onUp);
    lanyard.addEventListener('pointercancel', onUp);
    lanyard.addEventListener('lostpointercapture', onUp);
    lanyard.addEventListener('dragstart', (e) => e.preventDefault());
    lanyard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        lanyard.classList.toggle('flipped');
        s[O] += lanyard.classList.contains('flipped') ? 6 : -6;
        start();
      }
    });

    lanyardWrap.classList.add('lan-live');
    reset();
    lanyard.classList.add('ready');

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        const visible = entries[entries.length - 1].isIntersecting;
        if (visible) start();
        else stop();
      }, { rootMargin: '200px' });
      io.observe(lanyardWrap);
    } else {
      start();
    }

    window.addEventListener('resize', () => {
      reset();
      if (!running) start();
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     3D lanyard — exact reference WebGL implementation
     (assets/lanyard3d.js is the reference's own chunk)
     --------------------------------------------------------- */
  (function lanyard3D() {
    const wrap = $('#lanyardWrap');
    const section = $('#about');
    if (!wrap || !section) return;
    let mounted = false, loading = false, io = null, idleTimer = 0;

    const portrait = new Image();
    portrait.decoding = 'async';
    const portraitReady = new Promise((res) => { portrait.onload = res; portrait.onerror = res; });
    portrait.src = 'assets/img/profile-studio.png';

    const accentOf = () => {
      const themeEl = $('#theme');
      return (themeEl && getComputedStyle(themeEl).getPropertyValue('--accent').trim()) || '#FF0062';
    };

    const strapCanvas = () => {
      const text = 'PRIYA DHARSHAN \u00b7 FREIGHT AUDIT \u00b7 RECONCILIATION \u00b7 DATA ANALYTICS \u00b7 ';
      const cv = document.createElement('canvas');
      const g = cv.getContext('2d');
      const font = "600 50px 'Geist Mono', monospace";
      g.font = font;
      if ('letterSpacing' in g) g.letterSpacing = '9px';
      cv.width = Math.ceil(g.measureText(text).width);
      cv.height = 128;
      g.fillStyle = accentOf();
      g.fillRect(0, 0, cv.width, cv.height);
      g.fillStyle = 'rgba(0,0,0,0.16)';
      g.fillRect(0, 0, cv.width, 9);
      g.fillRect(0, cv.height - 9, cv.width, 9);
      g.fillStyle = 'rgba(255,255,255,0.22)';
      for (let x = 0; x < cv.width; x += 22) {
        g.fillRect(x, 14, 12, 2);
        g.fillRect(x, cv.height - 16, 12, 2);
      }
      g.font = font;
      if ('letterSpacing' in g) g.letterSpacing = '9px';
      g.fillStyle = '#FFFFFF';
      g.textBaseline = 'middle';
      g.fillText(text, 0, cv.height / 2 + 2);
      return cv;
    };

    const paintFace = (ctx, w, h, side) => {
      const accent = accentOf();
      const o = w / 260;
      ctx.save();
      ctx.scale(o, h / 410);
      const txt = (str, x, y, font, color, align = 'left', ls = '0px') => {
        ctx.font = font;
        if ('letterSpacing' in ctx) ctx.letterSpacing = ls;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillText(str, x, y);
        return ctx.measureText(str).width;
      };
      const rrect = (x, y, ww, hh, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + ww, y, x + ww, y + hh, r);
        ctx.arcTo(x + ww, y + hh, x, y + hh, r);
        ctx.arcTo(x, y + hh, x, y, r);
        ctx.arcTo(x, y, x + ww, y, r);
        ctx.closePath();
      };

      if (side === 'front') {
        ctx.fillStyle = '#1c1c22';
        ctx.fillRect(0, 0, 260, 410);
        ctx.strokeStyle = '#4A3A47';
        ctx.lineWidth = 1;
        rrect(1, 1, 258, 408, 14);
        ctx.stroke();
        const wBrand = txt('dharshan', 18, 53, "700 15px 'Hanken Grotesk', sans-serif", '#F2F1EE', 'left', '-0.6px');
        txt('.', 18 + wBrand, 53, "700 15px 'Hanken Grotesk', sans-serif", accent, 'left', '-0.6px');
        txt('PROFESSIONAL', 242, 53, "600 10px 'Geist Mono', monospace", '#A7A3AE', 'right', '0.4px');
        rrect(18, 74, 224, 206, 10);
        ctx.save();
        ctx.clip();
        ctx.fillStyle = '#242129';
        ctx.fillRect(18, 74, 224, 206);
        if (portrait.naturalWidth) {
          const k = Math.max(224 / portrait.naturalWidth, 206 / portrait.naturalHeight);
          const iw = portrait.naturalWidth * k;
          const ih = portrait.naturalHeight * k;
          ctx.drawImage(portrait, 18 + (224 - iw) * 0.5, 74 + (206 - ih) * 0.3, iw, ih);
        }
        ctx.restore();
        txt('Priya Dharshan A', 18, 306, "700 20px 'Bricolage Grotesque', sans-serif", '#F2F1EE', 'left', '-0.23px');
        txt('Logistics & Data Analytics', 18, 330, "600 13px 'Hanken Grotesk', sans-serif", '#BDB8C4');
        txt('CHENNAI, INDIA', 18, 362, "600 12px 'Geist Mono', monospace", '#BDB8C4', 'left', '0.3px');
        txt('FREIGHT / BILLING', 18, 381, "600 12px 'Geist Mono', monospace", '#BDB8C4', 'left', '0.3px');
        ctx.strokeStyle = '#F2F1EE';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        [1, 4, 6, 10, 13, 17, 19, 22, 27, 29, 33, 36, 38, 43, 45, 48, 52, 55, 57, 61, 64, 68, 70, 73].forEach((x) => {
          ctx.moveTo(168 + x, 361);
          ctx.lineTo(168 + x, 385);
        });
        ctx.stroke();
      } else {
        ctx.fillStyle = '#141417';
        ctx.fillRect(0, 0, 260, 410);
        ctx.font = "700 40px 'Bricolage Grotesque', sans-serif";
        if ('letterSpacing' in ctx) ctx.letterSpacing = '-0.94px';
        const brandW = ctx.measureText('dharshan.').width;
        const startX = 130 - brandW / 2;
        const wBrand = txt('dharshan', startX, 140, "700 40px 'Bricolage Grotesque', sans-serif", '#F2F1EE', 'left', '-0.94px');
        txt('.', startX + wBrand, 140, "700 40px 'Bricolage Grotesque', sans-serif", accent, 'left', '-0.94px');
        txt('Logistics & Analytics', 130, 190, "600 17px 'Bricolage Grotesque', sans-serif", '#F2F1EE', 'center', '-0.17px');
        txt('Clarity through data', 130, 215, "500 13px 'Hanken Grotesk', sans-serif", '#B3B2AD', 'center');
        ['FREIGHT AUDIT', 'RECONCILIATION', 'SQL & EXCEL', 'POWER BI'].forEach((s, i) => {
          txt(s, 18, 316 + i * 21, "600 12px 'Geist Mono', monospace", '#C9C8C3', 'left', '0.5px');
        });
      }
      ctx.fillStyle = accent;
      ctx.fillRect(0, 405, 260, 5);
      ctx.restore();
    };

    const mount = () => {
      if (mounted || loading) return;
      loading = true;
      const fonts = document.fonts ? Promise.all([
        "700 15px 'Hanken Grotesk'", "500 12px 'Hanken Grotesk'", "700 20px 'Bricolage Grotesque'",
        "600 17px 'Bricolage Grotesque'", "500 10px 'Geist Mono'", "600 10px 'Geist Mono'"
      ].map((f) => document.fonts.load(f).catch(() => {}))) : Promise.resolve();
      const ready = Promise.race([
        Promise.all([fonts, portraitReady]),
        new Promise((r) => setTimeout(r, 2500))
      ]);
      Promise.all([import('./assets/lanyard3d.js'), ready]).then(([mod]) => {
        if (mounted) return null;
        const coarse = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
        return mod.mountLanyard(section, {
          eventTarget: section,
          aspect: 260 / 410,
          size: () => (parseFloat(getComputedStyle(wrap).getPropertyValue('--lh')) || 410) / (section.clientHeight || 1),
          anchorX: () => {
            const a = wrap.getBoundingClientRect();
            const b = section.getBoundingClientRect();
            return (a.left + a.width / 2 - b.left) / (b.width || 1);
          },
          cardTop: () => {
            const a = wrap.getBoundingClientRect();
            const b = section.getBoundingClientRect();
            return (a.top - b.top + wrap.clientHeight * 0.27) / (b.height || 1);
          },
          strapWidth: 0.55,
          breeze: coarse ? 0 : 0.5,
          intro: true,
          reducedMotion: reduced,
          strapImage: strapCanvas(),
          paintFace,
          cancelled: () => false
        });
      }).then((inst) => {
        if (!inst) { loading = false; return; }
        if (lanyard2DStop) lanyard2DStop();
        wrap.classList.add('lan3d');
        wrap.setAttribute('role', 'img');
        wrap.setAttribute('aria-label', 'ID card: Priya Dharshan A, Logistics & Data Analytics, Chennai, India');
        mounted = true;
      }).catch(() => { loading = false; });
    };

    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        if (entries[entries.length - 1].isIntersecting) {
          mount();
          if (io) { io.disconnect(); io = null; }
        }
      }, { rootMargin: '1200px 0px' });
      io.observe(wrap);
      idleTimer = setTimeout(() => {
        if (window.requestIdleCallback) window.requestIdleCallback(mount, { timeout: 3000 });
        else mount();
      }, 3000);
    } else {
      mount();
    }
  })();

  /* ---------------------------------------------------------
     Stacked cards carousel
     --------------------------------------------------------- */
  const stack = $('#stack');
  const stackCards = $$('.stack-card');
  const stackIndexEl = $('#stackIndex');
  const stackPrev = $('#stackPrev');
  const stackNext = $('#stackNext');
  const stackPlay = $('#stackPlay');
  const stackRing = $('.stack-ring');
  let stackI = 0;
  let stackPaused = false;
  let stackTimer = null;
  const STACK_MS = 6500;

  function showStack(index, resetTimer = true) {
    if (!stackCards.length) return;
    stackI = (index + stackCards.length) % stackCards.length;
    stackCards.forEach((card, i) => {
      const o = (i - stackI + stackCards.length) % stackCards.length;
      card.style.setProperty('--o', String(o));
      card.setAttribute('aria-hidden', o === 0 ? 'false' : 'true');
    });
    if (stackIndexEl) stackIndexEl.textContent = String(stackI + 1).padStart(2, '0');
    if (stackRing) {
      stackRing.style.transition = 'none';
      stackRing.style.setProperty('--p', '0');
      if (!stackPaused) {
        requestAnimationFrame(() => {
          stackRing.style.transition = `stroke-dashoffset ${STACK_MS}ms linear`;
          stackRing.style.setProperty('--p', '1');
        });
      }
    }
    if (resetTimer) scheduleStack();
  }

  function scheduleStack() {
    clearTimeout(stackTimer);
    if (stackPaused || reduced) return;
    stackTimer = setTimeout(() => showStack(stackI + 1), STACK_MS);
  }

  function toggleStackPause() {
    stackPaused = !stackPaused;
    stackPlay.setAttribute('aria-pressed', String(stackPaused));
    stackPlay.setAttribute('aria-label', stackPaused ? 'Play card slideshow' : 'Pause card slideshow');
    stackPlay.innerHTML = stackPaused
      ? '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 2l7 4-7 4z" fill="currentColor"/></svg>Play'
      : '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor"/></svg>Pause';
    if (stackPaused) {
      clearTimeout(stackTimer);
      if (stackRing) { stackRing.style.transition = 'none'; stackRing.style.setProperty('--p', '0'); }
    } else {
      scheduleStack();
      showStack(stackI, false);
    }
  }

  stackPrev?.addEventListener('click', () => showStack(stackI - 1));
  stackNext?.addEventListener('click', () => showStack(stackI + 1));
  stackPlay?.addEventListener('click', toggleStackPause);
  if (stack) {
    let sx = 0, sy = 0, swiping = false;
    stack.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; swiping = true; }, { passive: true });
    stack.addEventListener('pointerup', (e) => {
      if (!swiping) return;
      swiping = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        showStack(stackI + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });
    stack.addEventListener('pointercancel', () => { swiping = false; }, { passive: true });
    stack.addEventListener('mouseenter', () => clearTimeout(stackTimer));
    stack.addEventListener('mouseleave', scheduleStack);
  }
  showStack(0);

  /* ---------------------------------------------------------
     Canvas helpers
     --------------------------------------------------------- */
  function setupCanvas(canvas, dprCap = 1.75) {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return null;
    let W = 0, H = 0, DPR = 1;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, dprCap);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    return { canvas, ctx, resize, get W() { return W; }, get H() { return H; } };
  }

  function onVisible(el, cb) {
    if (!el || !('IntersectionObserver' in window)) { cb(true); return () => {}; }
    let visible = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        visible = entry.isIntersecting;
        cb(visible);
      });
    }, { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }

  function loop(fn) {
    let running = true, raf = 0;
    const tick = (t) => {
      if (!running) return;
      if (!document.hidden) fn(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return {
      stop() { running = false; cancelAnimationFrame(raf); }
    };
  }

  /* ---------------------------------------------------------
     Hero canvas — slow drifting dust
     --------------------------------------------------------- */
  (function heroCanvas() {
    if (reduced) return;
    const c = setupCanvas($('#heroCanvas'), 1);
    if (!c) return;
    const { ctx, canvas } = c;
    let particles = [];
    const make = () => {
      const count = isMobile() ? 26 : 48;
      particles = Array.from({ length: count }, () => {
        const hue = Math.random() > 0.72 ? '255,0,98' : (Math.random() > 0.5 ? '255,255,255' : '139,92,255');
        return {
          x: Math.random() * c.W,
          y: Math.random() * c.H,
          r: Math.random() * 1.7 + 0.4,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          a: Math.random() * 0.5 + 0.1,
          css: `rgb(${hue})`
        };
      });
    };
    make();
    let visible = true;
    onVisible(canvas, v => { visible = v; });
    let last = 0;
    loop((t) => {
      if (!visible) return;
      if (t - last < 16) return;
      last = t;
      ctx.clearRect(0, 0, c.W, c.H);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = c.W + 10; if (p.x > c.W + 10) p.x = -10;
        if (p.y < -10) p.y = c.H + 10; if (p.y > c.H + 10) p.y = -10;
        const tw = 0.6 + Math.sin(t / 1400 + p.x * 0.01) * 0.4;
        ctx.globalAlpha = p.a * tw;
        ctx.fillStyle = p.css;
        ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;
    });
    window.addEventListener('resize', () => { c.resize(); make(); }, { passive: true });
  })();

  /* ---------------------------------------------------------
     Experience starfield
     --------------------------------------------------------- */
  (function expStars() {
    if (reduced) return;
    const c = setupCanvas($('#expCanvas'), 0.4);
    if (!c) return;
    const { ctx, canvas } = c;
    let stars = [];
    const make = () => {
      const count = isMobile() ? 48 : 90;
      stars = Array.from({ length: count }, () => {
        const hue = Math.random() > 0.8 ? '255,209,227' : (Math.random() > 0.8 ? '201,184,255' : '255,255,255');
        return {
          x: Math.random() * c.W,
          y: Math.random() * c.H,
          r: Math.random() * 1.4 + 0.3,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 1.2,
          css: `rgb(${hue})`
        };
      });
    };
    make();
    let visible = true;
    onVisible(canvas, v => { visible = v; });
    let last = 0;
    loop((t) => {
      if (!visible) return;
      if (t - last < 16) return;
      last = t;
      ctx.clearRect(0, 0, c.W, c.H);
      for (const s of stars) {
        ctx.globalAlpha = 0.25 + 0.75 * (Math.sin(t / 1000 * s.speed + s.phase) * 0.5 + 0.5);
        ctx.fillStyle = s.css;
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }
      ctx.globalAlpha = 1;
    });
    window.addEventListener('resize', () => { c.resize(); make(); }, { passive: true });
  })();

  /* ---------------------------------------------------------
     Contact meteor shower
     --------------------------------------------------------- */
  (function meteors() {
    if (reduced) return;
    const c = setupCanvas($('#meteorCanvas'), 1);
    if (!c) return;
    const { ctx, canvas } = c;
    let meteors = [];
    const palette = ['255,255,255', '255,0,98', '201,184,255', '158,216,255', '255,209,227'];
    const make = () => {
      const count = isMobile() ? 26 : 60;
      meteors = Array.from({ length: count }, () => spawn(true));
    };
    function spawn(initial = false) {
      const len = 70 + Math.random() * 210;
      const color = palette[(Math.random() * palette.length) | 0];
      return {
        x: Math.random() * (c.W + 320) - 160,
        y: initial ? Math.random() * c.H : -Math.random() * 200 - 40,
        len,
        speed: 2.4 + Math.random() * 5.2,
        alpha: 0.18 + Math.random() * 0.55,
        width: 0.6 + Math.random() * 1.4,
        color,
        css: `rgb(${color})`,
        drift: 0.32 + Math.random() * 0.18
      };
    }
    make();
    let visible = true;
    onVisible(canvas, v => { visible = v; });
    let last = 0;
    loop((t) => {
      if (!visible) return;
      if (t - last < 16) return;
      last = t;
      ctx.clearRect(0, 0, c.W, c.H);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < meteors.length; i++) {
        const m = meteors[i];
        m.x += m.speed * m.drift;
        m.y += m.speed;
        const tx = m.x - m.len * m.drift;
        const ty = m.y - m.len;
        // Two solid strokes instead of a per-frame gradient: far cheaper,
        // visually identical at these speeds.
        ctx.strokeStyle = m.css;
        ctx.globalAlpha = m.alpha * 0.32;
        ctx.lineWidth = m.width;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
        ctx.globalAlpha = m.alpha;
        ctx.lineWidth = Math.max(0.6, m.width * 0.75);
        ctx.beginPath();
        ctx.moveTo(m.x - m.len * 0.38 * m.drift, m.y - m.len * 0.38);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
        if (m.y - m.len > c.H + 40 || m.x - m.len * m.drift > c.W + 80 || m.x < -c.H) {
          meteors[i] = spawn(false);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    });
    window.addEventListener('resize', () => { c.resize(); make(); }, { passive: true });
  })();

  /* ---------------------------------------------------------
     Skyline generator
     --------------------------------------------------------- */
  function seeded(seed) {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  function makeSkyline(seed, W = 1200, H = 240) {
    const rnd = seeded(seed);
    const back = [], front = [], lit = [];
    let x = -30;
    while (x < W + 40) {
      const w = 22 + rnd() * 80;
      const h = 40 + rnd() * 145;
      const y = H - h;
      back.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/>`);
      if (rnd() > 0.55) back.push(`<rect x="${(x + w * 0.2).toFixed(1)}" y="${(y - 10).toFixed(1)}" width="${(w * 0.6).toFixed(1)}" height="10"/>`);
      for (let wy = y + 12; wy < H - 10; wy += 17) {
        for (let wx = x + 7; wx < x + w - 7; wx += 13) {
          if (rnd() > 0.68) {
            const isPink = rnd() > 0.9;
            const isDim = !isPink && rnd() > 0.75;
            const tw = !isPink && !isDim && rnd() > 0.72;
            const cls = isPink ? 'pink' : (isDim ? 'dim' : (tw ? 'tw' : ''));
            const delay = tw ? ` style="animation-delay:-${(rnd() * 5).toFixed(2)}s"` : '';
            lit.push(`<rect${cls ? ` class="${cls}"` : ''}${delay} x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="4" height="6"/>`);
          }
        }
      }
      x += w + 3 + rnd() * 12;
    }
    x = -40;
    const rnd2 = seeded(seed + 77);
    while (x < W + 40) {
      const w = 26 + rnd2() * 95;
      const h = 25 + rnd2() * 115;
      const y = H - h;
      front.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/>`);
      x += w + 4 + rnd2() * 18;
    }
    return { back: back.join(''), front: front.join(''), lit: lit.join(''), W, H };
  }

  // Contact skyline
  const skylineEl = $('#skyline');
  if (skylineEl) {
    const s = makeSkyline(21);
    skylineEl.innerHTML = `<svg viewBox="0 0 ${s.W} ${s.H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><g class="sky-back">${s.back}</g><g class="sky-front">${s.front}</g><g class="sky-lit">${s.lit}</g></svg>`;
  }

  // Footer skyline
  const footerSky = $('.footer-sky');
  if (footerSky) {
    const s = makeSkyline(88);
    const svg = footerSky.querySelector('svg');
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${s.W} ${s.H}`);
      const back = svg.querySelector('.sky-back');
      const front = svg.querySelector('.sky-front');
      const lit = svg.querySelector('.sky-lit');
      if (back) back.innerHTML = s.back;
      if (front) front.innerHTML = s.front;
      if (lit) lit.innerHTML = s.lit;
    }
  }

  /* ---------------------------------------------------------
     Contact CTA menu / copy email / toast
     --------------------------------------------------------- */
  const ctaBtn = $('#ctaBtn');
  const ctaMenu = $('#ctaMenu');
  const toast = $('#toast');
  let toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function closeCta() {
    if (!ctaMenu) return;
    ctaMenu.classList.remove('open');
    ctaBtn?.setAttribute('aria-expanded', 'false');
  }
  ctaBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !ctaMenu.classList.contains('open');
    ctaMenu.classList.toggle('open', open);
    ctaBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (ctaMenu && ctaMenu.classList.contains('open') && !ctaMenu.contains(e.target) && e.target !== ctaBtn) closeCta();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCta();
      if (modal.root.classList.contains('in')) closeProject();
      if (privacy.root.classList.contains('in')) closePrivacy();
      if (mobilePanel.classList.contains('open')) closeMenu();
    }
  });

  $('#copyEmail')?.addEventListener('click', async () => {
    const email = 'dharshan2103@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied to clipboard');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = email;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('Email copied to clipboard'); }
      catch { showToast(email); }
      ta.remove();
    }
    closeCta();
  });

  /* ---------------------------------------------------------
     Privacy
     --------------------------------------------------------- */
  const privacy = {
    root: $('#privacyModal'),
    scrim: $('#privacyScrim'),
    close: $('#privacyClose'),
    open: $('#privacyBtn')
  };
  function openPrivacy() {
    lastFocus = document.activeElement;
    privacy.root.classList.add('in');
    privacy.root.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    setTimeout(() => privacy.close.focus(), 120);
  }
  function closePrivacy() {
    privacy.root.classList.remove('in');
    privacy.root.setAttribute('aria-hidden', 'true');
    lockScroll(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  privacy.open?.addEventListener('click', openPrivacy);
  privacy.close?.addEventListener('click', closePrivacy);
  privacy.scrim?.addEventListener('click', closePrivacy);

  /* ---------------------------------------------------------
     Focus trap for modals
     --------------------------------------------------------- */
  function trapFocus(container) {
    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = $$('a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])', container)
        .filter(el => el.offsetParent !== null && el.tabIndex >= 0);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  if (projectModal) trapFocus(projectModal);
  if (privacy.root) trapFocus(privacy.root);
  if (mobilePanel) trapFocus(mobilePanel);

  /* ---------------------------------------------------------
     Init scroll state
     --------------------------------------------------------- */
  requestAnimationFrame(() => {
    updateWork();
    updateProcess();
    updateTimeline();
  });

  // Clean up scroll listeners on page hide? Not needed; loops check hidden.
})();
