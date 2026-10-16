/* ==========================================================================
   Joey Kheireddine — The Chain
   Vanilla JS, no build step. Every feature degrades to static content.
   ========================================================================== */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const raf = (fn) => requestAnimationFrame(fn);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const randomHex = (n) => Array.from({ length: n }, () => ((Math.random() * 16) | 0).toString(16)).join('');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const store = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

/* ---------- Loader ---------- */
function runLoader() {
  const finish = () => { root.classList.add('is-loaded'); store.set('jk-mined', '1'); };
  if (reduceMotion || store.get('jk-mined')) { finish(); return; }

  const hashEl = $('[data-loader-hash]');
  const nonceEl = $('[data-loader-nonce]');
  const fonts = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), wait(2400)]);
  const start = performance.now();
  let nonce = 0;
  let done = false;

  fonts.then(() => wait(Math.max(0, 1150 - (performance.now() - start)))).then(() => {
    done = true;
    hashEl.innerHTML = `0x<b>0000</b>${randomHex(12)}`;
    setTimeout(finish, 420);
  });

  const tick = () => {
    if (done) return;
    nonce += 17 + ((Math.random() * 211) | 0);
    nonceEl.textContent = nonce.toLocaleString('en-US');
    hashEl.textContent = `0x${randomHex(16)}`;
    raf(tick);
  };
  raf(tick);
}

/* ---------- Text splitting ---------- */
function splitHeroTitle() {
  const title = $('.hero__title');
  if (!title) return;
  title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
  let i = 0;
  $$('[data-split]', title).forEach((line) => {
    const text = line.textContent.trim();
    line.textContent = '';
    for (const ch of text) {
      const clip = document.createElement('span');
      clip.className = 'clip';
      clip.setAttribute('aria-hidden', 'true');
      const c = document.createElement('span');
      c.className = 'char';
      c.style.setProperty('--i', i++);
      c.textContent = ch;
      clip.append(c);
      line.append(clip);
    }
  });
}

function splitWords(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.append(document.createTextNode(' ')); return; }
      const w = document.createElement('span');
      w.className = 'word';
      w.textContent = part;
      frag.append(w);
    });
    node.replaceWith(frag);
  });
  return $$('.word', el);
}

/* ---------- Manifesto: scroll-scrubbed word reveal ---------- */
function initManifesto() {
  const el = $('[data-words]');
  if (!el || reduceMotion) return;
  const words = splitWords(el);
  let last = -1;
  const update = () => {
    const r = el.getBoundingClientRect();
    const vh = innerHeight;
    const p = clamp((vh * 0.85 - r.top) / (vh * 0.4 + r.height));
    const n = Math.round(p * words.length);
    if (n === last) return;
    last = n;
    words.forEach((w, i) => w.classList.toggle('is-on', i < n));
  };
  addEventListener('scroll', () => raf(update), { passive: true });
  addEventListener('resize', update);
  update();
}

/* ---------- Reveal on view + counters ---------- */
function initReveals() {
  const items = $$('[data-reveal]');
  if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      $$('[data-count]', e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

function countUp(el) {
  const to = Number(el.dataset.count);
  const from = Number(el.dataset.from ?? 0);
  if (reduceMotion) { el.textContent = to; return; }
  const dur = 1800;
  const t0 = performance.now();
  const ease = (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));
  const step = (now) => {
    const t = clamp((now - t0) / dur);
    el.textContent = Math.round(from + (to - from) * ease(t));
    if (t < 1) raf(step);
  };
  raf(step);
}

/* ---------- Nav, progress, clock ---------- */
function initChrome() {
  const nav = $('.nav');
  const bar = $('.progress span');
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
  };
  addEventListener('scroll', () => raf(onScroll), { passive: true });
  onScroll();

  const links = $$('.nav__links a');
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove('is-active'));
      map.get(e.target.id)?.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });

  const clock = $('[data-clock]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const tickClock = () => { clock.textContent = fmt.format(new Date()); };
    tickClock();
    setInterval(tickClock, 1000);
  }

  $('[data-print]')?.addEventListener('click', () => window.print());
}

/* ---------- Cursor + magnetic buttons ---------- */
function initCursor() {
  if (!finePointer || reduceMotion) return;
  root.classList.add('has-cursor');
  const cur = $('.cursor');
  const label = $('.cursor__label');
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;

  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  document.addEventListener('pointerleave', () => { cur.style.opacity = '0'; });
  document.addEventListener('pointerenter', () => { cur.style.opacity = '1'; });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor], a, button, [contenteditable]');
    const text = t?.dataset.cursor;
    cur.classList.toggle('is-label', !!text);
    cur.classList.toggle('is-hover', !!t && !text);
    label.textContent = text || '';
  });

  const loop = () => {
    x += (tx - x) * 0.2;
    y += (ty - y) * 0.2;
    cur.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    raf(loop);
  };
  loop();

  $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate3d(${dx * 0.22}px, ${dy * 0.32}px, 0)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ==========================================================================
   The Chain — real SHA-256 proof-of-work over the resume, in the browser
   ========================================================================== */
const DIFFICULTY = '00';
const ZERO = '0'.repeat(64);
const encoder = new TextEncoder();
const subtle = window.crypto?.subtle;

async function sha256(str) {
  if (subtle) {
    const buf = await subtle.digest('SHA-256', encoder.encode(str));
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Non-cryptographic fallback for insecure contexts (e.g. file://)
  let out = '';
  for (let k = 0; k < 8; k++) {
    let h = 0x811c9dc5 ^ (k * 0x9e3779b1);
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    out += (h >>> 0).toString(16).padStart(8, '0');
  }
  return out;
}

const short = (h) => `${h.slice(0, 10)}…${h.slice(-6)}`;

function initChain() {
  const els = $$('.block').reverse(); // genesis first
  if (!els.length) return;
  const chain = els.map((el) => ({
    el,
    content: $('[data-content]', el),
    status: $('[data-status]', el),
    prevEl: $('[data-prev]', el),
    hashEl: $('[data-hash]', el),
    nonceEl: $('[data-nonce]', el),
    prev: ZERO, hash: '', nonce: 0, shown: false,
  }));
  const payload = (b, i) => `${i}|${b.prev}|${b.el.dataset.time}|${b.content.textContent.replace(/\s+/g, ' ').trim()}`;

  async function mine(i) {
    const b = chain[i];
    b.prev = i ? chain[i - 1].hash : ZERO;
    const base = payload(b, i);
    let nonce = 0, h;
    do { h = await sha256(`${base}|${nonce}`); nonce++; } while (!h.startsWith(DIFFICULTY));
    b.nonce = nonce - 1;
    b.hash = h;
  }

  function setStatus(b, state, text) {
    b.el.classList.remove('is-mining', 'is-valid', 'is-invalid', 'is-broken-link');
    if (state) b.el.classList.add(state);
    b.status.textContent = text;
  }

  function paint(b) {
    b.prevEl.textContent = short(b.prev); b.prevEl.title = b.prev;
    b.hashEl.textContent = short(b.hash); b.hashEl.title = b.hash;
    b.nonceEl.textContent = String(b.nonce).padStart(4, '0');
  }

  async function animateMine(b) {
    setStatus(b, 'is-mining', 'Mining…');
    if (!reduceMotion) {
      const t0 = performance.now();
      const dur = 650;
      await new Promise((resolve) => {
        const step = (now) => {
          const t = clamp((now - t0) / dur);
          b.hashEl.textContent = `${randomHex(10)}…${randomHex(6)}`;
          b.nonceEl.textContent = String(Math.round(b.nonce * t)).padStart(4, '0');
          t < 1 ? raf(step) : resolve();
        };
        raf(step);
      });
    }
    paint(b);
    setStatus(b, 'is-valid', 'Verified');
    b.shown = true;
  }

  // Mine the whole chain up-front (≈256 hashes per block), reveal as blocks scroll in.
  const ready = (async () => { for (let i = 0; i < chain.length; i++) await mine(i); })();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const b = chain.find((x) => x.el === e.target);
      ready.then(() => { if (!b.shown) animateMine(b); });
    });
  }, { threshold: 0.35 });
  chain.forEach((b) => io.observe(b.el));

  /* --- Sticky aside: follow the block in view --- */
  const asideNum = $('[data-aside-num]');
  const asideTime = $('[data-aside-time]');
  const eras = $$('.chain__visual img');
  const follow = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.dataset.block;
      chain.forEach((b) => b.el.classList.toggle('is-current', b.el === e.target));
      if (asideNum) asideNum.textContent = id;
      if (asideTime) asideTime.textContent = e.target.dataset.time;
      eras.forEach((img) => img.classList.toggle('is-active', img.dataset.era === id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  chain.forEach((b) => follow.observe(b.el));

  /* --- Tamper mode: edit history, watch the chain break, re-mine it --- */
  const tamperBtn = $('[data-tamper]');
  const remineBtn = $('[data-remine]');
  const hint = $('[data-tamper-hint]');
  const editable = $$('.block__list li');
  let tampering = false;

  const setEditable = (on) => editable.forEach((li) => {
    if (!on) { li.removeAttribute('contenteditable'); li.removeAttribute('spellcheck'); return; }
    try { li.contentEditable = 'plaintext-only'; } catch { li.contentEditable = 'true'; }
    if (li.contentEditable !== 'plaintext-only') li.contentEditable = 'true';
    li.spellcheck = false;
  });

  tamperBtn?.addEventListener('click', async () => {
    await ready;
    tampering = !tampering;
    tamperBtn.setAttribute('aria-pressed', String(tampering));
    tamperBtn.textContent = tampering ? 'Stop tampering' : 'Tamper with history';
    hint.hidden = !tampering;
    setEditable(tampering);
    chain.forEach((b) => { if (!b.shown) { paint(b); setStatus(b, 'is-valid', 'Verified'); b.shown = true; } });
    if (tampering) editable[editable.length - 1]?.focus();
  });

  let pending;
  async function verify() {
    let firstBad = -1;
    for (let i = 0; i < chain.length; i++) {
      const b = chain[i];
      const linkOk = b.prev === (i ? chain[i - 1].liveHash : ZERO);
      b.liveHash = await sha256(`${payload(b, i)}|${b.nonce}`);
      const powOk = b.liveHash.startsWith(DIFFICULTY) && b.liveHash === b.hash;
      b.hashEl.textContent = short(b.liveHash);
      b.hashEl.title = b.liveHash;
      if (powOk && linkOk) setStatus(b, 'is-valid', 'Verified');
      else {
        if (firstBad < 0) firstBad = i;
        setStatus(b, 'is-invalid', linkOk ? 'Invalid hash' : 'Broken link');
        if (!linkOk) b.el.classList.add('is-broken-link');
      }
    }
    remineBtn.hidden = firstBad < 0;
    return firstBad;
  }

  editable.forEach((li) => {
    li.addEventListener('input', () => { clearTimeout(pending); pending = setTimeout(verify, 80); });
    li.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); li.blur(); } });
    li.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\s+/g, ' ');
      document.execCommand('insertText', false, text);
    });
  });

  remineBtn?.addEventListener('click', async () => {
    remineBtn.disabled = true;
    const from = await verify();
    for (let i = Math.max(0, from); i < chain.length; i++) {
      await mine(i);
      await animateMine(chain[i]);
      chain[i].liveHash = chain[i].hash;
      if (!reduceMotion) await wait(80);
    }
    remineBtn.hidden = true;
    remineBtn.disabled = false;
  });
}

/* ==========================================================================
   Portrait — ordered (Bayer 8×8) dither shader with a true-colour lens
   ========================================================================== */
const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uHover;
uniform float uPx;
uniform float uIntro;
uniform vec3 uInk;
uniform vec3 uSig;

float bayer2(vec2 a) { a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 cell = floor(gl_FragCoord.xy / uPx);
  vec2 cuv = (cell + 0.5) * uPx / uRes;
  vec3 c = texture2D(uTex, cuv).rgb;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  l = clamp((l - 0.45) * 1.45 + 0.5, 0.0, 1.0);
  float on = step(bayer8(cell), l);
  vec3 dith = mix(uInk, uSig, on);

  float r = uRes.x * 0.34;
  float d = length(gl_FragCoord.xy - uMouse);
  float lens = (1.0 - smoothstep(r * 0.5, r, d)) * uHover;
  vec3 col = mix(dith, texture2D(uTex, vUv).rgb, lens);

  col = mix(uInk, col, step(1.0 - vUv.y, uIntro));
  gl_FragColor = vec4(col, 1.0);
}`;

function initPortrait() {
  const wrap = $('.portrait');
  if (!wrap) return;
  const img = $('img', wrap);
  const canvas = $('canvas', wrap);
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
  if (!gl) return;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };

  const start = () => {
    let prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (err) { console.warn('[portrait] shader disabled:', err); return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const u = (n) => gl.getUniformLocation(prog, n);
    const U = { res: u('uRes'), mouse: u('uMouse'), hover: u('uHover'), px: u('uPx'), intro: u('uIntro'), ink: u('uInk'), sig: u('uSig') };
    gl.uniform3f(U.ink, 10 / 255, 10 / 255, 11 / 255);
    gl.uniform3f(U.sig, 1, 91 / 255, 35 / 255);

    const dpr = Math.min(devicePixelRatio || 1, 2);
    const state = { hover: 0, hoverTarget: 0, mx: 0, my: 0, px: reduceMotion ? 2.5 * dpr : 22 * dpr, intro: reduceMotion ? 1 : 0, visible: true };
    const pxTarget = 2.5 * dpr;

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    };
    addEventListener('resize', resize);
    resize();

    const host = wrap.closest('figure') || wrap;
    host.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      state.mx = (e.clientX - r.left) * dpr;
      state.my = (r.bottom - e.clientY) * dpr;
      state.hoverTarget = 1;
    });
    host.addEventListener('pointerleave', () => { state.hoverTarget = 0; });

    new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; }).observe(canvas);

    let introStarted = reduceMotion;
    const frame = () => {
      raf(frame);
      if (!state.visible) return;
      if (!introStarted && root.classList.contains('is-loaded')) introStarted = true;
      if (introStarted) {
        state.intro += (1 - state.intro) * 0.035;
        state.px += (pxTarget - state.px) * 0.045;
      }
      state.hover += (state.hoverTarget - state.hover) * 0.12;
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform2f(U.mouse, state.mx, state.my);
      gl.uniform1f(U.hover, state.hover);
      gl.uniform1f(U.px, Math.max(1, Math.round(state.px)));
      gl.uniform1f(U.intro, state.intro > 0.998 ? 1 : state.intro);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    wrap.classList.add('gl-ready');
    frame();
  };

  if (img.complete && img.naturalWidth) start();
  else img.addEventListener('load', start, { once: true });
}

/* ---------- Boot ---------- */
splitHeroTitle();
runLoader();
initChrome();
initReveals();
initManifesto();
initCursor();
initChain();
initPortrait();
