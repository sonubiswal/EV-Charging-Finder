/* =================================================================
   PlugIn — landing page behaviour
   Classic script (deferred). No bundler, no module tag: the dynamic
   import() below is the only place a module is loaded, so the page
   also runs straight off file://.
   ================================================================= */
(function () {
  'use strict';

  window.__PLUGIN_READY = true;

  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ---------- repo links ---------- */
  /* Set the real repository once; every [data-repo] anchor picks it up. */
  var REPO_URL = 'https://github.com/sonubiswal/EV-Charging-Finder';

  $$('[data-repo]').forEach(function (a) {
    a.href = REPO_URL;
    if (REPO_URL.indexOf('OWNER/REPO') === -1) a.removeAttribute('data-repo');
  });

  /* ---------- scroll reveal ---------- */
  var revealables = $$('[data-reveal]');
  revealables.forEach(function (el) {
    var sibs = el.parentNode ? $$('[data-reveal]', el.parentNode) : [];
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--delay', Math.min(i, 6) * 80 + 'ms');
  });

  if ('IntersectionObserver' in window && !reduce.matches) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        revealer.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { revealer.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- sticky nav, active section, scroll progress ---------- */
  var nav = $('#nav');
  var navLinks = $$('.nav__links a[href^="#"]');
  var progress = $('.scroll-progress i');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var h = doc.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle('is-stuck', y > 12);
    if (progress) progress.style.setProperty('--progress', h > 0 ? clamp(y / h, 0, 1) : 0);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });
  onScroll();

  if ('IntersectionObserver' in window && navLinks.length) {
    var seen = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var id = en.target.id;
        if (en.isIntersecting) seen[id] = en.intersectionRatio;
        else delete seen[id];
        var best = Object.keys(seen).sort(function (a, b) { return seen[b] - seen[a]; })[0];
        navLinks.forEach(function (a) { a.classList.toggle('is-active', !!best && a.hash === '#' + best); });
      });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: [0.05, 0.25, 0.6] });

    $$('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ---------- mobile nav ---------- */
  var toggle = $('.nav__toggle');
  var panel = $('#navmenu');

  function closeMenu() {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  }

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });

    $$('a', panel).forEach(function (a) { a.addEventListener('click', closeMenu); });
    doc.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || panel.hidden) return;
      closeMenu();
      toggle.focus();
    });
  }

  /* ---------- toast ---------- */
  var toast = $('#toast');
  var toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2400);
  }

  /* ---------- copy to clipboard ---------- */

  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var ok = function () { say('Copied to clipboard'); };

      function fallback() {
        var ta = doc.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-100px;opacity:0';
        doc.body.appendChild(ta);
        ta.select();
        try { doc.execCommand('copy'); ok(); } catch (err) { say('Copy failed — select the text manually'); }
        doc.body.removeChild(ta);
      }

      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback);
      else fallback();
    });
  });

  /* ---------- hero headline rotator ---------- */
  (function rotator() {
    var host = $('.rotator');
    var el = $('.rotator__text');
    if (!host || !el) return;
    var words = [];
    try { words = JSON.parse(host.getAttribute('data-rotate') || '[]'); } catch (err) { words = []; }
    if (words.length < 2 || reduce.matches) return;

    var i = 0, j = el.textContent.length, dir = -1;
    setTimeout(function step() {
      var word = words[i];
      j += dir;
      if (dir < 0 && j <= 0) { dir = 1; i = (i + 1) % words.length; j = 0; }
      else if (dir > 0 && j >= words[i].length) { dir = -1; j = words[i].length; }
      el.textContent = words[i].slice(0, Math.max(0, j));
      setTimeout(step, dir < 0 ? 55 : 95);
    }, 2600);
  })();

  /* ---------- stat counters ---------- */
  (function counters() {
    var nums = $$('.stat__num');
    if (!nums.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      if (reduce.matches || target === 0) { el.textContent = String(target); return; }
      var t0 = performance.now(), dur = 1100;
      (function tick(now) {
        var p = clamp((now - t0) / dur, 0, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        run(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  })();

  /* ---------- terminal typer ---------- */
  (function typer() {
    var host = $('[data-typer]');
    if (!host) return;
    var nodes = $$('[data-line]', host);
    var lines = nodes.map(function (p) { return p.getAttribute('data-line') || ''; });

    if (reduce.matches) {
      nodes.forEach(function (p) { p.textContent = p.getAttribute('data-line'); });
      return;
    }

    var li = 0, ci = 0, started = false;

    function start() {
      if (started) return;
      started = true;
      (function step() {
        if (li >= lines.length) return;
        var full = lines[li];
        ci++;
        nodes[li].textContent = full.slice(0, ci);
        if (ci >= full.length) { li++; ci = 0; setTimeout(step, 420); }
        else setTimeout(step, full.charCodeAt(ci - 1) === 32 ? 26 : 17);
      })();
    }

    if (!('IntersectionObserver' in window)) { start(); return; }
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { start(); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(host);
  })();

  /* ---------- demo iframe skeleton ---------- */
  (function skeleton() {
    var frame = $('.stage__viewport iframe');
    var sk = $('.stage__viewport .skeleton');
    if (!frame || !sk) return;
    var gone = false;

    function hide() {
      if (gone) return;
      gone = true;
      sk.classList.add('is-hidden');
      setTimeout(function () { if (sk.parentNode) sk.parentNode.removeChild(sk); }, 600);
    }

    frame.addEventListener('load', hide);
    try {
      if (frame.contentDocument && frame.contentDocument.readyState === 'complete') hide();
    } catch (err) { /* cross-origin: the load event covers it */ }
    setTimeout(hide, 9000);
  })();

  /* ---------- custom cursor + cursor spotlight ---------- */
  (function pointer() {
    if (!fine.matches) return;

    var cursor = $('.cursor');
    var ring = $('.cursor__ring');
    var dot = $('.cursor__dot');
    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my, dx = mx, dy = my;
    var moved = false;

    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      root.style.setProperty('--mx', mx + 'px');
      root.style.setProperty('--my', my + 'px');
      if (moved) return;
      moved = true;
      doc.body.classList.add('pointer-active');
    }, { passive: true });

    window.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget) doc.body.classList.remove('pointer-active');
    });

    var hotSel = 'a, button, iframe, input, [data-spotlight]';
    doc.addEventListener('pointerover', function (e) {
      if (!moved || !e.target.closest) return;
      doc.body.classList.toggle('cursor-hot', !!e.target.closest(hotSel));
    });

    if (reduce.matches || !cursor || !ring || !dot) return;
    (function loop() {
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      dx = lerp(dx, mx, 0.4); dy = lerp(dy, my, 0.4);
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      dot.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  })();

  /* ---------- feature spotlight ---------- */

  $$('[data-spotlight]').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      el.style.setProperty('--fx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      el.style.setProperty('--fy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  });

  /* ---------- magnetic buttons ---------- */
  (function magnetic() {
    if (!fine.matches || reduce.matches) return;

    $$('.btn').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var x = (e.clientX - r.left - r.width / 2) / r.width;
        var y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.translate = (x * 5).toFixed(2) + 'px ' + (y * 4).toFixed(2) + 'px';
      });
      btn.addEventListener('pointerleave', function () { btn.style.translate = '0px 0px'; });
    });
  })();

  /* ---------- hero: animated electric grid ---------- */
  /* The horizontal charge grid lives on the XZ plane: a floor receding to
     the horizon, with charge pulses running along its lines toward the
     cursor. Three.js is imported by dynamic import() only once the browser
     is idle, and skipped entirely for reduced-motion or low-power clients —
     the CSS grid in .hero__fallback is the permanent backstop. */
  (function heroGrid() {
    var canvas = $('#grid-canvas');
    if (!canvas || reduce.matches) return;

    var conn = navigator.connection || {};
    /* Deliberately conservative: a single-core 1 GB device or an explicit
       data-saver connection is the only thing we skip the scene for. */
    var lowPower = (navigator.hardwareConcurrency || 4) <= 1 ||
      (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 1) ||
      !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
    if (lowPower) return;

    var SOURCES = [
      'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js',
      'https://unpkg.com/three@0.169.0/build/three.module.min.js'
    ];
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 800); };
    idle(function () { load(0); });

    function load(i) {
      if (i >= SOURCES.length) return;           /* keep the CSS hero */
      import(SOURCES[i]).then(build).catch(function () { load(i + 1); });
    }

    function build(THREE) {
      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas: canvas, alpha: true, antialias: false,
          powerPreference: 'high-performance'
        });
      } catch (err) { return; }
      if (!renderer || !renderer.getContext()) return;

      var PR = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(PR);
      renderer.setClearColor(0x000000, 0);

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 60);

      /* Grid plane: local x ∈ ±11, local z ∈ ±9.5, pushed back so the near
         edge sits just behind the camera and the far edge reaches the horizon. */
      var grid = new THREE.Group();
      grid.position.set(0, 0, -3.5);
      scene.add(grid);

      var HALF_X = 11, HALF_Z = 9.5, SEG = 44;
      var stepX = (HALF_X * 2) / SEG;
      var stepZ = (HALF_Z * 2) / SEG;

      var uniforms = {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(9999, 9999) },
        uPR: { value: PR },
        uSize: { value: 2.7 },
        uFade: { value: 34 },
        uColor: { value: new THREE.Color(0x00d4aa) }
      };

      var NOISE = [
        'float wave(vec2 p, float t){',
        '  return sin(p.x * 0.30 + t * 0.85) * 0.30',
        '       + cos(p.y * 0.26 - t * 0.62) * 0.28',
        '       + sin((p.x + p.y) * 0.15 + t * 0.45) * 0.26;',
        '}'
      ].join('\n');

      var VERT = [
        'uniform float uTime; uniform vec2 uMouse; uniform float uPR;',
        'uniform float uSize; uniform float uFade;',
        'attribute float aBright;',
        'varying float vH; varying float vGlow; varying float vFade;',
        NOISE,
        'void main(){',
        '  vec3 pos = position;',
        '  float h = wave(pos.xz, uTime);',
        '  pos.y = h;',
        '  vec4 mv = modelViewMatrix * vec4(pos, 1.0);',
        '  gl_Position = projectionMatrix * mv;',
        '  vH = h;',
        '  float d = distance(pos.xz, uMouse);',
        '  vGlow = smoothstep(3.6, 0.0, d) * 1.7 + aBright;',
        '  float depth = -mv.z;',
        '  vFade = (1.0 - smoothstep(uFade * 0.34, uFade, depth))',
        '        * (1.0 - smoothstep(6.5, HALF_MAX, abs(pos.x)));',
        '  gl_PointSize = uSize * uPR * (1.0 + vGlow * 0.7) * (8.0 / max(0.001, depth));',
        '}'
      ].join('\n').replace(/HALF_MAX/g, HALF_X.toFixed(1));

      var POINT_FRAG = [
        'uniform vec3 uColor;',
        'varying float vH; varying float vGlow; varying float vFade;',
        'void main(){',
        '  vec2 d = gl_PointCoord - 0.5;',
        '  float r = length(d);',
        '  if (r > 0.5) discard;',
        '  float a = pow(smoothstep(0.5, 0.0, r), 2.6);',
        '  vec3 col = mix(uColor, vec3(1.0), clamp(vGlow * 0.40, 0.0, 0.70));',
        '  col += max(vH, 0.0) * 0.26;',
        '  gl_FragColor = vec4(col * (0.55 + vGlow), a * (0.28 + vGlow * 0.62) * vFade);',
        '}'
      ].join('\n');

      var LINE_FRAG = [
        'uniform vec3 uColor;',
        'varying float vH; varying float vGlow; varying float vFade;',
        'void main(){',
        '  float g = clamp(vGlow, 0.0, 1.6);',
        '  float a = (0.16 + clamp(vH, 0.0, 1.0) * 0.16 + g * 0.42) * vFade;',
        '  vec3 col = mix(uColor, vec3(1.0), g * 0.20);',
        '  gl_FragColor = vec4(col * (0.66 + g * 0.5), a);',
        '}'
      ].join('\n');

      function mat(frag, sizeOverride) {
        var u = uniforms;
        if (sizeOverride) {
          u = {};
          for (var k in uniforms) u[k] = uniforms[k];
          u.uSize = { value: sizeOverride };
        }
        return new THREE.ShaderMaterial({
          uniforms: u, vertexShader: VERT, fragmentShader: frag,
          transparent: true, depthWrite: false, depthTest: false,
          blending: THREE.AdditiveBlending
        });
      }

      /* grid lines */
      var seg = [];
      for (var i = 0; i <= SEG; i++) {
        var x = -HALF_X + i * stepX;
        var z = -HALF_Z + i * stepZ;
        seg.push(-HALF_X, 0, z, HALF_X, 0, z);
        seg.push(x, 0, -HALF_Z, x, 0, HALF_Z);
      }
      var lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
      lineGeo.setAttribute('aBright', new THREE.Float32BufferAttribute(new Float32Array(seg.length / 3), 1));
      var lines = new THREE.LineSegments(lineGeo, mat(LINE_FRAG));
      grid.add(lines);

      /* intersections */
      var n = (SEG + 1) * (SEG + 1);
      var pos = new Float32Array(n * 3);
      var bright = new Float32Array(n);
      var k = 0;
      for (var a = 0; a <= SEG; a++) {
        for (var b = 0; b <= SEG; b++) {
          pos[k * 3] = -HALF_X + a * stepX;
          pos[k * 3 + 1] = 0;
          pos[k * 3 + 2] = -HALF_Z + b * stepZ;
          bright[k] = ((a * 7 + b * 13) % 11 === 0) ? 0.6 : 0.0;
          k++;
        }
      }
      var ptGeo = new THREE.BufferGeometry();
      ptGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      ptGeo.setAttribute('aBright', new THREE.BufferAttribute(bright, 1));
      var points = new THREE.Points(ptGeo, mat(POINT_FRAG));
      grid.add(points);

      /* charge pulses running along the lines toward the viewer */
      var PULSES = 7;
      var pPos = new Float32Array(PULSES * 3);
      var pBright = new Float32Array(PULSES);
      for (var p = 0; p < PULSES; p++) pBright[p] = 2.2;
      var pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute('aBright', new THREE.BufferAttribute(pBright, 1));
      var pulses = new THREE.Points(pGeo, mat(POINT_FRAG, 6.4));
      grid.add(pulses);

      var lanes = [];
      for (var q = 0; q < PULSES; q++) {
        lanes.push({
          axis: q % 3 === 0 ? 1 : 0,
          line: -HALF_Z + ((q * 7 + 3) % SEG) * stepZ,
          col: -HALF_X + ((q * 11 + 5) % SEG) * stepX,
          speed: 0.05 + (q % 4) * 0.016,
          t: (q * 0.141) % 1
        });
      }

      /* sizing */
      function resize() {
        var w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        /* wider fov on narrow screens keeps the plane from cropping */
        camera.fov = camera.aspect < 0.9 ? 72 : 55;
        camera.position.set(0, 2.25, 6.6);
        camera.lookAt(0, 0.25, -2.2);
        camera.updateProjectionMatrix();
      }
      resize();
      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
      else window.addEventListener('resize', resize);

      /* cursor → grid spotlight (ray→plane, converted to grid-local space) */
      var ray = new THREE.Raycaster();
      var ndc = new THREE.Vector2();
      var floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      var hit = new THREE.Vector3();
      var target = new THREE.Vector2(9999, 9999);
      var current = new THREE.Vector2(9999, 9999);

      window.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        if (!r.width || !r.height) return;
        ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        ray.setFromCamera(ndc, camera);
        if (ray.ray.intersectPlane(floor, hit)) {
          target.set(hit.x - grid.position.x, hit.z - grid.position.z);
        }
      }, { passive: true });

      /* run loop — pauses off-screen and on hidden tabs */
      var alive = true, visible = true, last = performance.now(), clock = 0;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { visible = !!en[0].isIntersecting; }, { threshold: 0 })
          .observe(canvas);
      }

      function frame(now) {
        if (!alive) return;
        var dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        if (doc.hidden || !visible) { requestAnimationFrame(frame); return; }

        clock += dt;
        uniforms.uTime.value = clock;
        current.lerp(target, 0.09);
        uniforms.uMouse.value.copy(current);

        var arr = pGeo.getAttribute('position');
        for (var i2 = 0; i2 < PULSES; i2++) {
          var lane = lanes[i2];
          lane.t += dt * lane.speed;
          if (lane.t > 1) lane.t -= 1;
          var along = -1 + lane.t * 2;
          if (lane.axis === 0) {
            arr.array[i2 * 3] = along * HALF_X;
            arr.array[i2 * 3 + 1] = 0;
            arr.array[i2 * 3 + 2] = lane.line;
          } else {
            arr.array[i2 * 3] = lane.col;
            arr.array[i2 * 3 + 1] = 0;
            arr.array[i2 * 3 + 2] = along * HALF_Z;
          }
        }
        arr.needsUpdate = true;

        /* drift, barely perceptible */
        grid.rotation.y = Math.sin(clock * 0.10) * 0.04;
        camera.position.x = lerp(camera.position.x, current.x * 0.055, 0.045);
        camera.position.y = 2.25 + Math.sin(clock * 0.21) * 0.05;
        camera.lookAt(0, 0.25, -2.2);

        renderer.render(scene, camera);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      canvas.classList.add('is-live');
      doc.addEventListener('visibilitychange', function () { last = performance.now(); });

      if (reduce.addEventListener) {
        reduce.addEventListener('change', function (e) {
          if (!e.matches) return;
          alive = false;
          canvas.classList.remove('is-live');
          try { renderer.dispose(); } catch (err) { /* noop */ }
        });
      }
    }
  })();
})();
