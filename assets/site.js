/* Gunjan Shah portfolio: lightbox, reach chart, journalism filters, current-section nav. */

/* ---------- Lightbox for proof screenshots ---------- */
(function () {
  var dialog = document.getElementById("lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;
  var img = dialog.querySelector("img");
  var lastTrigger = null;

  document.querySelectorAll(".shot").forEach(function (btn) {
    btn.addEventListener("click", function () {
      lastTrigger = btn;
      var root = document.documentElement, th = root.getAttribute("data-theme");
      var dark = th ? th === "dark" : !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
      img.src = (!dark && btn.getAttribute("data-full-light")) || btn.getAttribute("data-full");
      img.alt = btn.getAttribute("data-alt") || "";
      dialog.showModal();
    });
  });

  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", function () {
    img.removeAttribute("src");
    if (lastTrigger) lastTrigger.focus();
  });
})();

/* ---------- Reach per post: dot plot with medians ---------- */
(function () {
  var host = document.getElementById("reach-chart");
  if (!host) return;

  var SETS = [
    { key: "early", label: "First 10 posts with insights", values: [769, 837, 915, 1124, 1396, 1430, 1491, 1550, 2113, 2867] },
    { key: "recent", label: "Latest 9 posts", values: [414, 638, 906, 1464, 1673, 1693, 1998, 2612, 2784] },
  ];
  var NAMES = { 2784: "National Cup 2026 squad announcement" };
  var MAXV = 3000, REF = 1500, R = 7;
  var NS = "http://www.w3.org/2000/svg";

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function fmt(n) { return Number(n).toLocaleString("en-GB"); }
  function median(a) {
    var s = a.slice().sort(function (x, y) { return x - y; });
    var m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  var tip = document.createElement("div");
  tip.className = "reach__tip";
  tip.hidden = true;
  tip.setAttribute("role", "status");

  function showTip(node, set, v) {
    var hr = host.getBoundingClientRect();
    var r = node.getBoundingClientRect();
    var left = r.left + r.width / 2 - hr.left;
    left = Math.max(112, Math.min(hr.width - 112, left));
    tip.innerHTML = "<strong>" + fmt(v) + " accounts reached</strong>" + set.label + (NAMES[v] ? ". " + NAMES[v] : "");
    tip.style.left = left + "px";
    tip.style.top = r.top - hr.top - 8 + "px";
    tip.hidden = false;
  }
  function hideTip() { tip.hidden = true; }

  var lastW = 0;
  function render() {
    var W = Math.max(280, Math.floor(host.clientWidth));
    if (W === lastW) return;
    lastW = W;

    var narrow = W < 520;
    var L = 10, Rt = W - 10, top = 34, BH = narrow ? 156 : 122, gap = 8;
    var axisY = top + BH * 2 + gap + 14;
    var H = axisY + 40;
    var x = function (v) { return L + (v / MAXV) * (Rt - L); };

    host.textContent = "";
    var svg = el("svg", { width: W, height: H, viewBox: "0 0 " + W + " " + H, "aria-hidden": "true", focusable: "false" }, host);

    [0, 1000, 2000, 3000].forEach(function (t) {
      el("line", { x1: x(t), x2: x(t), y1: top - 6, y2: axisY, class: "grid" }, svg);
      var tx = el("text", { x: x(t), y: axisY + 22, "text-anchor": t === 0 ? "start" : t === MAXV ? "end" : "middle", "font-size": 13 }, svg);
      tx.textContent = fmt(t);
    });
    el("line", { x1: L, x2: Rt, y1: axisY, y2: axisY, class: "axis" }, svg);
    var at = el("text", { x: L, y: axisY + 40, "font-size": 13 }, svg);
    at.textContent = "Accounts reached per post";

    el("rect", { x: x(REF), y: top - 6, width: Rt - x(REF), height: axisY - top + 6, class: "zone" }, svg);
    el("line", { x1: x(REF), x2: x(REF), y1: top - 6, y2: axisY, class: "ref" }, svg);
    var rt = el("text", { x: x(REF) - 6, y: top - 14, "text-anchor": "end", "font-size": 13, class: "t-ref" }, svg);
    rt.textContent = "1,500 benchmark";
    var zt = el("text", { x: Rt, y: top - 14, "text-anchor": "end", "font-size": 13, class: "t-zone" }, svg);
    zt.textContent = W < 520 ? "Above" : "Above 1,500";

    var hits = [];
    SETS.forEach(function (set, i) {
      var y0 = top + i * (BH + gap);
      var cy = y0 + (narrow ? 98 : 70);
      var above = set.values.filter(function (v) { return v > REF; }).length;

      el("rect", { x: L, y: y0 + 2, width: Rt - L, height: BH - 6, rx: 10, class: "lane lane--" + set.key }, svg);
      el("line", { x1: L, x2: Rt, y1: cy, y2: cy, class: "track" }, svg);
      var t1 = el("text", { x: L + 12, y: y0 + 24, "font-size": 15, class: "t-strong" }, svg);
      t1.textContent = set.label;
      var t2 = el("text", { x: L + 12, y: y0 + 43, "font-size": 13 }, svg);
      t2.textContent = above + " of " + set.values.length + " posts above 1,500";

      var m = median(set.values);
      var mx = x(m);
      if (i === 1) {
        var gm = median(SETS[0].values), gx = x(gm);
        el("line", { x1: gx, x2: gx, y1: cy - 30, y2: cy + 30, class: "median median--ghost" }, svg);
      }
      el("line", { x1: mx, x2: mx, y1: cy - 30, y2: cy + 30, class: "median" }, svg);
      var anchor = mx < 90 ? "start" : mx > W - 90 ? "end" : "middle";
      var mt = el("text", { x: mx, y: y0 + BH - 10, "text-anchor": anchor, "font-size": 13, class: "t-strong" }, svg);
      mt.textContent = "Median " + fmt(m) + (i === 1 ? "  (+18%)" : "");
      if (i === 1) {
        var gt = el("text", { x: x(median(SETS[0].values)) - 8, y: y0 + 24, "text-anchor": "end", "font-size": 12, class: "t-ghost" }, svg);
        gt.textContent = W < 520 ? "" : "first median";
      }

      var placed = [];
      var offsets = [0, -14, 14, -28, 28, -42, 42];
      set.values.slice().sort(function (a, b) { return a - b; }).forEach(function (v) {
        var px = x(v), py = cy;
        for (var k = 0; k < offsets.length; k++) {
          var cand = cy + offsets[k];
          var ok = placed.every(function (p) { return Math.hypot(p[0] - px, p[1] - cand) >= R * 2 + 1; });
          if (ok) { py = cand; break; }
        }
        placed.push([px, py]);
        el("circle", { cx: px, cy: py, r: R + 5, class: "halo halo--" + set.key }, svg);
        el("circle", { cx: px, cy: py, r: R, class: "dot dot--" + set.key }, svg);
        if (NAMES[v] && !narrow) {
          var ct = el("text", { x: px, y: py - R - 12, "text-anchor": "end", "font-size": 13, class: "t-call" }, svg);
          ct.textContent = "Best recent: " + fmt(v);
        }
        var hit = el("circle", {
          cx: px, cy: py, r: 13, class: "hit", tabindex: "0", role: "img",
          "aria-label": set.label + ": " + fmt(v) + " accounts reached" + (NAMES[v] ? ", " + NAMES[v] : ""),
        }, svg);
        hit.addEventListener("pointerenter", function () { showTip(hit, set, v); });
        hit.addEventListener("pointerleave", hideTip);
        hit.addEventListener("focus", function () { showTip(hit, set, v); });
        hit.addEventListener("blur", hideTip);
        hit.addEventListener("click", function () { showTip(hit, set, v); });
        hits.push(hit);
      });
    });

    host.appendChild(tip);
  }

  render();
  if (typeof ResizeObserver === "function") {
    var raf = 0;
    new ResizeObserver(function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    }).observe(host);
  } else {
    window.addEventListener("resize", render);
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hideTip(); });
})();

/* ---------- Journalism filters ---------- */
(function () {
  var list = document.getElementById("pieces");
  var chips = document.querySelectorAll(".chip[data-filter]");
  var count = document.getElementById("pieces-count");
  if (!list || !chips.length) return;

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
      var n = 0;
      list.querySelectorAll(".piece").forEach(function (li) {
        var show = f === "all" || li.getAttribute("data-type") === f;
        li.hidden = !show;
        if (show) n++;
      });
      if (count) count.textContent = n + (n === 1 ? " piece" : " pieces");
    });
  });
})();

/* ---------- Mark the current section in the nav ---------- */
(function () {
  if (typeof IntersectionObserver !== "function") return;
  var links = {};
  document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) {
    links[a.getAttribute("href").slice(1)] = a;
  });
  var ids = Object.keys(links);
  if (!ids.length) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      ids.forEach(function (id) {
        if (id === en.target.id) links[id].setAttribute("aria-current", "true");
        else links[id].removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-30% 0px -60% 0px" });

  ids.forEach(function (id) {
    var s = document.getElementById(id);
    if (s) io.observe(s);
  });
})();

/* ---------- Theme toggle (system default, manual override remembered) ---------- */
(function () {
  var btn = document.getElementById("theme-toggle");
  if (!btn) return;
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return !!(mq && mq.matches);
  }
  function sync() {
    var dark = isDark();
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
  }
  btn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    sync();
  });
  if (mq && mq.addEventListener) mq.addEventListener("change", sync);
  sync();
})();

/* ---------- v4: spotlight, registers, toast, copy email, palette, theme reveal ---------- */
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* spotlight */
  document.querySelectorAll(".proof__item").forEach(function (t) {
    t.addEventListener("pointermove", function (e) {
      var r = t.getBoundingClientRect();
      t.style.setProperty("--mx", e.clientX - r.left + "px");
      t.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* registers tabs */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.reg__tabs [role="tab"]'));
  document.querySelectorAll(".reg__panel").forEach(function (p) {
    var w = Array.prototype.reduce.call(p.querySelectorAll(".reg__text,.pr__head"),function(a,n){return a+n.textContent.trim().split(/\s+/).length},0);
    var s = p.querySelector("[data-words]");
    if (s) s.textContent = w;
  });
  function pick(i, focus) {
    tabs.forEach(function (t, j) {
      var on = i === j;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { pick(i); });
    t.addEventListener("keydown", function (e) {
      var n = tabs.length, k = e.key;
      if (k === "ArrowRight") { e.preventDefault(); pick((i + 1) % n, true); }
      else if (k === "ArrowLeft") { e.preventDefault(); pick((i + n - 1) % n, true); }
      else if (k === "Home") { e.preventDefault(); pick(0, true); }
      else if (k === "End") { e.preventDefault(); pick(n - 1, true); }
    });
  });

  /* toast */
  var toastEl = document.getElementById("toast"), tt = 0;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(tt);
    tt = setTimeout(function () { toastEl.hidden = true; }, 2200);
  }

  /* copy email */
  var EMAIL = "468gunjan@gmail.com";
  function copyEmail() {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = EMAIL; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) {}
      ta.remove();
      toast(ok ? "Email copied" : EMAIL);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(function () { toast("Email copied"); }, fallback);
    } else fallback();
  }
  var ce = document.getElementById("copy-email");
  if (ce) ce.addEventListener("click", copyEmail);

  /* theme toggle with circular reveal */
  var tbtn = document.getElementById("theme-toggle");
  var root = document.documentElement;
  function isDark() {
    var t = root.getAttribute("data-theme");
    return t ? t === "dark" : !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
  }
  function applyTheme(next, origin) {
    function set() {
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      if (tbtn) tbtn.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
    }
    if (!document.startViewTransition || reduce) {
      if (!reduce) { root.classList.add("theme-fade"); setTimeout(function () { root.classList.remove("theme-fade"); }, 600); }
      set(); return;
    }
    var x = origin ? origin.x : innerWidth - 40, y = origin ? origin.y : 30;
    var rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var vt = document.startViewTransition(set);
    vt.ready.then(function () {
      root.animate(
        { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + rad + "px at " + x + "px " + y + "px)"] },
        { duration: 750, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" }
      );
    }, function () {});
  }
  if (tbtn) {
    /* replace the earlier handler by cloning the node */
    var clone = tbtn.cloneNode(true);
    tbtn.parentNode.replaceChild(clone, tbtn);
    tbtn = clone;
    tbtn.addEventListener("click", function () {
      var r = tbtn.getBoundingClientRect();
      applyTheme(isDark() ? "light" : "dark", { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    });
  }

  /* command palette */
  var dlg = document.getElementById("palette");
  var input = document.getElementById("palette-input");
  var list = document.getElementById("palette-list");
  var openBtn = document.getElementById("palette-open");
  if (!dlg || typeof dlg.showModal !== "function") return;

  var mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var hint = document.getElementById("kbd-hint");
  if (hint) hint.textContent = mac ? "⌘K" : "Ctrl K";

  var ISARCH = /republic-world/.test(location.pathname);
  function go(id) { return function () { var s = document.getElementById(id); if (s) s.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); else location.href = "index.html#" + id; }; }
  function ext(url) { return function () { var a = document.createElement("a"); a.href = url; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove(); }; }

  var ITEMS = [
    { g: "Sections", t: "Top", a: go("top") },
    { g: "Sections", t: "UGCC Instagram case study", k: "ugcc instagram social", a: go("ugcc") },
    { g: "Sections", t: "Journalism clips", k: "articles writing", a: go("journalism") },
    { g: "Sections", t: "One fixture, three registers", k: "voice tone", a: go("registers") },
    { g: "Sections", t: "Republic World archive (192 stories)", k: "republic world articles entertainment tech", a: function () { location.href = ISARCH ? "#all" : "republic-world.html"; } },
    { g: "Sections", t: "Experience", k: "work roles", a: go("experience") },
    { g: "Sections", t: "References", k: "testimonials", a: go("references") },
    { g: "Sections", t: "Contact", a: go("contact") }
  ];
  document.querySelectorAll("#pieces .piece").forEach(function (li) {
    var a = li.querySelector("h3 a");
    if (!a) return;
    var title = a.cloneNode(true);
    var sr = title.querySelector(".sr"); if (sr) sr.remove();
    var meta = li.querySelector(".piece__meta");
    ITEMS.push({ g: "Clips", t: title.textContent.trim(), s: meta ? meta.textContent.split(".")[0] : "", a: ext(a.href) });
  });
  ITEMS.push(
    { g: "Actions", t: "Download CV (India)", a: ext("assets/Gunjan-Shah-CV-India.pdf") },
    { g: "Actions", t: "Download CV (Ireland)", a: ext("assets/Gunjan-Shah-CV-Ireland.pdf") },
    { g: "Actions", t: "Copy email address", k: "contact", a: copyEmail },
    { g: "Actions", t: "Switch theme", k: "dark light mode", a: function () { applyTheme(isDark() ? "light" : "dark"); } }
  );
  document.querySelectorAll('#contact a[href^="https://"]').forEach(function (a) {
    var label = a.textContent.trim();
    if (label) ITEMS.push({ g: "Links", t: label, a: ext(a.href) });
  });

  var shown = [], idx = 0;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function render() {
    var q = input.value.trim().toLowerCase();
    shown = ITEMS.filter(function (it) { return !q || (it.t + " " + (it.k || "") + " " + (it.s || "") + " " + it.g).toLowerCase().indexOf(q) > -1; });
    if (idx >= shown.length) idx = 0;
    var html = "", last = "";
    shown.forEach(function (it, i) {
      if (it.g !== last) { html += '<li class="palette__group" role="presentation">' + it.g + "</li>"; last = it.g; }
      html += '<li class="palette__item" role="option" id="po-' + i + '" data-i="' + i + '" aria-selected="' + (i === idx) + '"><span>' + esc(it.t) + "</span>" + (it.s ? "<small>" + esc(it.s) + "</small>" : "") + "</li>";
    });
    list.innerHTML = html || '<li class="palette__empty" role="presentation">Nothing matches that.</li>';
    input.setAttribute("aria-activedescendant", shown.length ? "po-" + idx : "");
  }
  function move(d) {
    if (!shown.length) return;
    idx = (idx + d + shown.length) % shown.length;
    render();
    var el = document.getElementById("po-" + idx);
    if (el) el.scrollIntoView({ block: "nearest" });
  }
  function run(i) {
    var it = shown[i];
    if (!it) return;
    dlg.close();
    setTimeout(it.a, 30);
  }
  function open() { input.value = ""; idx = 0; render(); if (!dlg.open) dlg.showModal(); input.focus(); }

  input.addEventListener("input", function () { idx = 0; render(); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") { e.preventDefault(); run(idx); }
  });
  list.addEventListener("click", function (e) {
    var li = e.target.closest(".palette__item");
    if (li) run(+li.getAttribute("data-i"));
  });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  if (openBtn) openBtn.addEventListener("click", open);
  document.addEventListener("keydown", function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ""));
    if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); dlg.open ? dlg.close() : open(); }
    else if (e.key === "/" && !typing && !dlg.open) { e.preventDefault(); open(); }
  });
})();

/* ---------- v5: scroll reveal ---------- */
(function () {
  if (typeof IntersectionObserver !== "function") return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var els = document.querySelectorAll(".section__head, .proof__item, .stats__item, .piece, .reg, .testimonial, blockquote, .shots");
  if (!els.length) return;
  document.documentElement.classList.add("js");
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  els.forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 4) * 60 + "ms";
    io.observe(el);
  });
})();

/* ---------- v11: count-up numbers ---------- */
(function () {
  if (typeof IntersectionObserver !== "function") return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var els = [];
  document.querySelectorAll(".proof dt, .stats dt:not(.stats--light dt), .rw-band__num").forEach(function (el) {
    var m = el.textContent.trim().match(/^(\+?)(\d[\d,]*(?:\.\d+)?)(\D*)$/);
    if (!m) return;
    var dec = (m[2].split(".")[1] || "").length;
    els.push({ el: el, pre: m[1], val: parseFloat(m[2].replace(/,/g, "")), dec: dec, comma: m[2].indexOf(",") > -1, post: m[3], final: el.textContent });
  });
  if (!els.length) return;
  function fmt(o, v) {
    var t = v.toFixed(o.dec);
    if (o.comma) t = Number(t).toLocaleString("en-GB", { minimumFractionDigits: o.dec, maximumFractionDigits: o.dec });
    return o.pre + t + o.post;
  }
  function run(o) {
    var t0 = performance.now(), D = 1100;
    (function tick(now) {
      var k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
      o.el.textContent = k < 1 ? fmt(o, o.val * e) : o.final;
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      els.forEach(function (o) { if (o.el === e.target) run(o); });
    });
  }, { threshold: 0.6 });
  els.forEach(function (o) { io.observe(o.el); });
})();

/* ---------- v12: portrait pointer parallax ---------- */
(function () {
  var p = document.querySelector(".portrait");
  if (!p) return;
  if (window.matchMedia && (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (pointer: fine)").matches)) return;
  var hero = document.getElementById("top") || document.body;
  hero.addEventListener("pointermove", function (e) {
    var r = p.getBoundingClientRect();
    var x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
    var y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
    p.style.setProperty("--px", Math.max(-1, Math.min(1, x * 2)).toFixed(3));
    p.style.setProperty("--py", Math.max(-1, Math.min(1, y * 2)).toFixed(3));
  });
  hero.addEventListener("pointerleave", function () { p.style.setProperty("--px", 0); p.style.setProperty("--py", 0); });
})();
