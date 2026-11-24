/* Natur by ZIEGLER SCHALLSCHUTZ – Website-Skript (ohne Abhängigkeiten, ohne Cookies) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var fmt = function (n, d) { return n.toLocaleString("de-AT", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };

  /* ---------- Mobile Navigation ---------- */
  var burger = $(".site-burger"), nav = $("#site-nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burger.focus(); }
    });
  }

  /* ---------- Einblenden beim Scrollen ---------- */
  var rev = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    rev.forEach(function (el) { io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add("is-in"); }); }

  /* ---------- Lightbox ---------- */
  var lb = $(".site-lightbox");
  if (lb) {
    var lbImg = $("img", lb), lbCap = $("figcaption", lb), lbClose = $("button", lb), lastFocus = null;
    var openLb = function (src, alt, cap) {
      lastFocus = document.activeElement;
      lbImg.src = src; lbImg.alt = alt || ""; lbCap.textContent = cap || alt || "";
      lb.classList.add("is-open"); document.body.style.overflow = "hidden"; lbClose.focus();
    };
    var closeLb = function () { lb.classList.remove("is-open"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
    $$("[data-zoom]").forEach(function (el) {
      var img = el.tagName === "IMG" ? el : $("img", el);
      if (!img) return;
      el.setAttribute("tabindex", "0"); el.setAttribute("role", "button");
      el.setAttribute("aria-label", "Bild vergrößern: " + (img.alt || ""));
      var cap = el.querySelector("figcaption");
      var go = function () { openLb(img.src, img.alt, cap ? cap.textContent.trim() : img.alt); };
      el.addEventListener("click", go);
      el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    lbClose.addEventListener("click", closeLb);
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "Tab") { e.preventDefault(); lbClose.focus(); }
    });
  }

  /* ---------- Referenz-Filter ---------- */
  var filter = $(".site-filter");
  if (filter) {
    $$("button", filter).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", filter).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        var f = b.getAttribute("data-filter");
        $$(".site-ref[data-cat]").forEach(function (r) {
          r.hidden = !(f === "alle" || r.getAttribute("data-cat").indexOf(f) > -1);
        });
      });
    });
  }

  /* ---------- Nachhallzeit-Rechner (Sabine, Näherung) ---------- */
  var calc = $("#rt-calc");
  if (calc) {
    // Vorläufige Rechenwerte je Produkt: äquivalente Absorptionsfläche je m² Produktfläche (500–1000 Hz)
    var PROD = {   // Werte aus den Prospekten F2026 (αw, Standardformate)
      segel: { a: 0.95, unit: 2.91, unitName: "Deckensegel Light à 2408 × 1208 mm", replaces: false },
      wand:  { a: 0.80, unit: 2.91, unitName: "Wandabsorber Light à 2408 × 1208 mm", replaces: true },
      decke: { a: 0.70, unit: 1.2, unitName: "Akustikdecken-Platten à 1200 × 1000 mm", replaces: true }
    };
    var USE = {
      besprechung: function (V) { return Math.max(0.3, 0.32 * Math.log10(V) - 0.17); },   // DIN 18041, A3
      klasse:      function (V) { return Math.max(0.3, 0.32 * Math.log10(V) - 0.17); },   // A3
      inklusiv:    function (V) { return Math.max(0.3, 0.26 * Math.log10(V) - 0.14); },   // A4
      buero:       function () { return 0.55; },
      gastro:      function () { return 0.65; }
    };
    var el = function (id) { return document.getElementById(id); };
    var inputs = ["rt-l", "rt-b", "rt-h", "rt-use", "rt-state", "rt-prod", "rt-area"];
    var areaTouched = false;
    el("rt-area").addEventListener("input", function () { areaTouched = true; });
    ["rt-l", "rt-b", "rt-h", "rt-use", "rt-state", "rt-prod"].forEach(function (id) { el(id).addEventListener("input", function () { areaTouched = false; }); });

    var run = function () {
      var L = Math.max(2, parseFloat(el("rt-l").value) || 0), B = Math.max(2, parseFloat(el("rt-b").value) || 0), H = Math.max(2, parseFloat(el("rt-h").value) || 0);
      var V = L * B * H, S = 2 * (L * B + L * H + B * H);
      var aRoom = parseFloat(el("rt-state").value);
      var p = PROD[el("rt-prod").value];
      var target = USE[el("rt-use").value](V);
      var A0 = S * aRoom, T0 = 0.161 * V / A0;
      var perM2 = p.replaces ? (p.a - aRoom) : p.a;
      var Aneed = 0.161 * V / target - A0;
      var need = Math.max(0, Aneed / perM2);
      var maxArea = Math.round(L * B * (p.replaces ? 1 : 0.8));
      var slider = el("rt-area");
      slider.max = Math.max(5, maxArea);
      if (!areaTouched) slider.value = Math.min(slider.max, Math.ceil(need / p.unit) * p.unit).toFixed(1);
      var area = parseFloat(slider.value);
      var T1 = 0.161 * V / (A0 + area * perM2);
      el("rt-area-out").textContent = fmt(area, 1) + " m²";
      el("rt-v").textContent = fmt(V, 0) + " m³";
      el("rt-t0").innerHTML = fmt(T0, 2) + " <small>s</small>";
      el("rt-t1").innerHTML = fmt(T1, 2) + " <small>s</small>";
      el("rt-t1").classList.toggle("site-rt__value--good", T1 <= target * 1.2);
      el("rt-target").textContent = fmt(target, 2) + " s";
      el("rt-need").textContent = fmt(need, 1) + " m²";
      el("rt-units").textContent = fmt(Math.ceil(area / p.unit), 0);
      el("rt-units-name").textContent = p.unitName;
      var pos = function (t) { return Math.max(0, Math.min(100, (t / 2.5) * 100)) + "%"; };
      el("rt-mark0").style.left = pos(T0); el("rt-mark1").style.left = pos(T1); el("rt-markT").style.left = pos(target);
      var verdict = T1 <= target * 1.2 ? "Mit dieser Fläche erreichen Sie die empfohlene Nachhallzeit." :
        "Für die empfohlene Nachhallzeit fehlen noch rund " + fmt(Math.max(0, need - area), 1) + " m².";
      el("rt-verdict").textContent = verdict;
      // Ergebnis an die Anfrage übergeben (nur Raumdaten, keine persönlichen Angaben)
      var send = el("rt-send");
      if (send) {
        var useSel = el("rt-use"), stateSel = el("rt-state"), prodSel = el("rt-prod");
        var q = new URLSearchParams({
          anliegen: "beratung", produkt: el("rt-prod").value,
          rechner: [
            "Raum: " + fmt(L, 1) + " × " + fmt(B, 1) + " × " + fmt(H, 1) + " m (" + fmt(V, 0) + " m³)",
            "Nutzung: " + useSel.options[useSel.selectedIndex].text,
            "Raum heute: " + stateSel.options[stateSel.selectedIndex].text,
            "Nachhallzeit heute (Näherung): " + fmt(T0, 2) + " s, Zielwert " + fmt(target, 2) + " s",
            "Produkt: " + prodSel.options[prodSel.selectedIndex].text + ", " + fmt(area, 1) + " m² (" + fmt(Math.ceil(area / p.unit), 0) + " Stück)",
            "Nachhallzeit damit (Näherung): " + fmt(T1, 2) + " s"
          ].join("\n")
        });
        send.href = "kontakt.html?" + q.toString();
      }
    };
    inputs.forEach(function (id) { el(id).addEventListener("input", run); });
    run();
  }

  /* ---------- CO₂-Rechner (GWP total je m², Prospekte F2026) ---------- */
  var co2 = $("#co2-calc");
  if (co2) {
    var GWP = [
      { id: "segelL", name: "Natur Deckensegel Light", gwp: -0.31, prod: "segel" },
      { id: "segelR", name: "Natur Deckensegel Resistant", gwp: -0.43, prod: "segel" },
      { id: "wandL", name: "Natur Wandabsorber Light", gwp: -0.31, prod: "wand" },
      { id: "wandR", name: "Natur Wandabsorber Resistant", gwp: -0.43, prod: "wand" }
      // Natur Akustikdecke (+1,25 kg CO₂e/m², vorläufig) bis zum Marktstart nicht im Rechner
    ];
    var rows = $("#co2-rows"), n = 0;
    var sign = function (v, d) { return (v > 0 ? "+" : v < 0 ? "−" : "") + fmt(Math.abs(v), d); };
    var addRow = function (sel, area) {
      n++;
      var r = document.createElement("div");
      r.className = "site-co2-row";
      r.innerHTML = '<div class="site-field"><label for="co2-p' + n + '">Produkt</label><select id="co2-p' + n + '">' +
        GWP.map(function (g) { return '<option value="' + g.id + '">' + g.name + '</option>'; }).join("") + '</select></div>' +
        '<div class="site-field"><label for="co2-a' + n + '">Fläche in m²</label><input id="co2-a' + n + '" type="number" inputmode="decimal" min="0" max="5000" step="0.1" value="' + area + '"></div>' +
        '<button type="button" class="site-co2-del" aria-label="Zeile entfernen">×</button>';
      $("select", r).value = sel;
      rows.appendChild(r);
      $$("select, input", r).forEach(function (x) { x.addEventListener("input", runCo2); });
      $(".site-co2-del", r).addEventListener("click", function () { if ($$(".site-co2-row", rows).length > 1) { r.remove(); runCo2(); } });
    };
    var runCo2 = function () {
      var total = 0, lines = [], prods = {};
      $$(".site-co2-row", rows).forEach(function (r) {
        var g = GWP.filter(function (x) { return x.id === $("select", r).value; })[0];
        var a = Math.max(0, parseFloat($("input", r).value) || 0);
        if (!a) return;
        var v = a * g.gwp; total += v; prods[g.prod] = 1;
        lines.push({ name: g.name, a: a, v: v });
      });
      $("#co2-total").innerHTML = sign(total, 1) + " <small>kg CO₂e</small>";
      $("#co2-total").classList.toggle("site-rt__value--good", total < 0);
      $("#co2-list").innerHTML = lines.map(function (l) {
        return '<div class="site-co2-line"><span>' + l.name + ", " + fmt(l.a, 1) + ' m²</span><b>' + sign(l.v, 1) + " kg</b></div>";
      }).join("");
      $("#co2-verdict").textContent = !lines.length ? "Bitte eine Fläche eingeben." :
        total < 0 ? "Über alle gewählten Produkte ist mehr CO₂ gebunden, als bei der Herstellung entsteht." :
        "Die gewählten Produkte verursachen in Summe mehr CO₂, als in ihnen gebunden ist.";
      var q = new URLSearchParams({
        anliegen: "angebot", produkt: Object.keys(prods).length === 1 ? Object.keys(prods)[0] : "offen",
        quelle: "CO₂-Rechner",
        rechner: lines.map(function (l) { return l.name + ": " + fmt(l.a, 1) + " m² (GWP " + sign(l.v, 1) + " kg CO₂e)"; }).join("\n") +
          "\nCO₂-Bilanz gesamt: " + sign(total, 1) + " kg CO₂e (Näherung, Prospektwerte F2026)"
      });
      $("#co2-send").href = "kontakt.html?" + q.toString();
    };
    $("#co2-add").addEventListener("click", function () { addRow("wandL", 10); runCo2(); $$(".site-co2-row select", rows).pop().focus(); });
    addRow("segelL", 29);
    runCo2();
  }

  /* ---------- Deckenplatten-Rechner mit Raster-Vorschau ---------- */
  var dcalc = $("#dp-calc");
  if (dcalc) {
    var d = function (id) { return document.getElementById(id); };
    var drun = function () {
      var L = Math.min(40, Math.max(1.2, parseFloat(d("dp-l").value) || 0));
      var B = Math.min(30, Math.max(0.6, parseFloat(d("dp-b").value) || 0));
      var nx = Math.ceil(L / 1.2 - 0.001), ny = Math.ceil(B / 0.6 - 0.001);
      var full = Math.floor(L / 1.2) * Math.floor(B / 0.6);
      var plates = Math.ceil(nx * ny * 1.03);
      var battensX = (Math.floor(L / 0.6) + 1) * B;            // Traglatten quer, Achsabstand 600 mm
      var battensY = (Math.floor(B / 0.6) + 1) * L;            // Querlatten unter den Längsstößen
      var screws = plates * 6;
      d("dp-area").textContent = fmt(L * B, 1) + " m²";
      d("dp-plates").textContent = fmt(plates, 0);
      d("dp-full").textContent = fmt(full, 0);
      d("dp-battens").textContent = fmt(Math.ceil((battensX + battensY) * 1.05), 0) + " lfm";
      d("dp-screws").textContent = fmt(screws, 0);
      // Vorschau
      var svg = d("dp-svg"), W = 560, Hh = 320, pad = 16;
      var sc = Math.min((W - 2 * pad) / L, (Hh - 2 * pad) / B);
      var w = L * sc, h = B * sc, ox = (W - w) / 2, oy = (Hh - h) / 2, out = "";
      out += '<defs><pattern id="felt" width="60" height="60" patternUnits="userSpaceOnUse"><image href="assets/img/stimmung/filz-textur.jpg" width="60" height="60" opacity=".95"/></pattern></defs>';
      out += '<rect x="' + ox + '" y="' + oy + '" width="' + w + '" height="' + h + '" fill="url(#felt)"/>';
      out += '<rect x="' + ox + '" y="' + oy + '" width="' + w + '" height="' + h + '" fill="#C8B79E" opacity=".35"/>';
      for (var i = 1; i < nx; i++) { var x = ox + i * 1.2 * sc; if (x < ox + w) out += '<line x1="' + x + '" y1="' + oy + '" x2="' + x + '" y2="' + (oy + h) + '" stroke="#3b2c20" stroke-opacity=".55" stroke-width="1"/>'; }
      for (var j = 1; j < ny; j++) { var y = oy + j * 0.6 * sc; if (y < oy + h) out += '<line x1="' + ox + '" y1="' + y + '" x2="' + (ox + w) + '" y2="' + y + '" stroke="#3b2c20" stroke-opacity=".55" stroke-width="1"/>'; }
      out += '<rect x="' + ox + '" y="' + oy + '" width="' + w + '" height="' + h + '" fill="none" stroke="#F3ECDD" stroke-width="2"/>';
      out += '<text x="' + (ox + w / 2) + '" y="' + (oy - 4 < 12 ? oy + h + 14 : oy - 4) + '" fill="#F3ECDD" font-size="12" text-anchor="middle" font-family="Asap, sans-serif">' + fmt(L, 2) + ' m</text>';
      svg.innerHTML = out;
    };
    ["dp-l", "dp-b"].forEach(function (id) { d(id).addEventListener("input", drun); });
    drun();
  }

  /* ---------- Kontaktformular (Vorschau, ohne Versand) ---------- */
  var form = $("#kontakt-form");
  if (form) {
    $$("[data-required]", form).forEach(function (f, i) {
      var wrap = f.closest(".site-field") || f.closest(".site-check"), err = wrap && $(".site-field__error", wrap);
      if (err) { err.id = err.id || ("err-" + i); f.setAttribute("aria-describedby", err.id); }
      f.setAttribute("aria-required", "true");
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true, first = null;
      $$("[data-required]", form).forEach(function (f) {
        var wrap = f.closest(".site-field") || f.closest(".site-check");
        var valid = f.type === "checkbox" ? f.checked : f.value.trim() !== "" && (f.type !== "email" || /.+@.+\..+/.test(f.value));
        if (wrap) wrap.classList.toggle("site-field--error", !valid);
        f.setAttribute("aria-invalid", valid ? "false" : "true");
        if (!valid) { ok = false; if (!first) first = f; }
      });
      // Dateien: zusammen höchstens 15 MB
      var files = $("#k-dateien", form);
      if (files) {
        var total = Array.prototype.reduce.call(files.files || [], function (s, f) { return s + f.size; }, 0);
        var fWrap = files.closest(".site-field"), fOk = total <= 15 * 1024 * 1024;
        fWrap.classList.toggle("site-field--error", !fOk);
        files.setAttribute("aria-invalid", fOk ? "false" : "true");
        if (!fOk) { ok = false; if (!first) first = files; }
      }
      var msg = $(".site-form__success", form);
      if (!ok) { first.focus(); msg.classList.remove("is-visible"); return; }
      msg.classList.add("is-visible");
      msg.focus();
      form.reset();
      var rb = $("#k-rechner"); if (rb) rb.hidden = true;
      showFarben();
    });

    // Farbmuster nur beim Anliegen "Muster anfordern" zeigen
    var farben = $("#k-farben");
    var showFarben = function () {
      if (!farben) return;
      var a = form.querySelector('input[name="anliegen"]:checked');
      farben.hidden = !(a && a.value === "muster");
    };
    $$('input[name="anliegen"]', form).forEach(function (r) { r.addEventListener("change", showFarben); });

    // Dateigröße gleich beim Auswählen anzeigen
    var fileIn = $("#k-dateien", form), fileHint = $("#k-dateien-hint", form);
    if (fileIn && fileHint) {
      var hintText = fileHint.textContent;
      fileIn.addEventListener("change", function () {
        var n = fileIn.files.length, total = 0;
        for (var i = 0; i < n; i++) total += fileIn.files[i].size;
        fileHint.textContent = n ? n + (n === 1 ? " Datei" : " Dateien") + ", zusammen " + fmt(total / 1048576, 1) + " MB" : hintText;
        fileIn.closest(".site-field").classList.toggle("site-field--error", total > 15 * 1048576);
      });
    }
  }

  /* Muster-Parameter aus der URL vorauswählen (kontakt.html?anliegen=muster&produkt=segel) */
  if (form && location.search) {
    var q = new URLSearchParams(location.search);
    ["anliegen", "produkt"].forEach(function (k) {
      var v = q.get(k); if (!v) return;
      var r = form.querySelector('input[name="' + k + '"][value="' + v + '"]');
      if (r) r.checked = true;
    });
    // Ergebnis aus dem Raumakustik-Rechner übernehmen
    var rText = q.get("rechner"), rBox = $("#k-rechner");
    if (rText && rBox) {
      $("#k-rechner-text").textContent = rText.slice(0, 1200);
      $("#k-rechner-val").value = rText.slice(0, 1200);
      rBox.hidden = false;
      var quelle = q.get("quelle");
      if (quelle && /^[\wÄÖÜäöüß₂ -]{1,40}$/.test(quelle)) $("#k-rechner-label").textContent = "Aus dem " + quelle + " übernommen";
      $("#k-rechner-weg").addEventListener("click", function () { rBox.hidden = true; $("#k-rechner-val").value = ""; $("#k-text").focus(); });
      var txt = $("#k-text");
      if (txt && !txt.value) txt.placeholder = "Zum Beispiel: Möbel, Vorhänge, gewünschter Termin, Fragen zum Ergebnis";
    }
  }
  if (form) showFarbenInit();
  function showFarbenInit() {
    var farben = $("#k-farben"); if (!farben) return;
    var a = form.querySelector('input[name="anliegen"]:checked');
    farben.hidden = !(a && a.value === "muster");
  }
})();

/* 24.11.2026: schwebenden Knopf erst nach dem ersten Bildschirm zeigen (Handy) */
(function () {
  var f = document.querySelector('.site-float');
  if (!f) return;
  function check() { f.classList.toggle('site-float--wait', window.scrollY < window.innerHeight * 0.6); }
  check();
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
})();
