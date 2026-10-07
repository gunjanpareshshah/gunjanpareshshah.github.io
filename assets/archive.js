/* Republic World archive: search and beat filter. */
(function () {
  var q = document.getElementById("arch-q");
  var root = document.getElementById("arch");
  if (!q || !root) return;
  var chips = document.querySelectorAll(".arch__chips .chip");
  var rows = root.querySelectorAll(".arch__row");
  var months = root.querySelectorAll("[data-month]");
  var count = document.getElementById("arch-count");
  var none = document.getElementById("arch-none");
  var cat = "all";

  function apply() {
    var term = q.value.trim().toLowerCase();
    var n = 0;
    rows.forEach(function (r) {
      var ok = (cat === "all" || r.getAttribute("data-cat") === cat) && (!term || r.getAttribute("data-text").indexOf(term) > -1);
      r.hidden = !ok;
      if (ok) n++;
    });
    months.forEach(function (m) {
      m.hidden = !m.querySelector(".arch__row:not([hidden])");
    });
    count.textContent = n + (n === 1 ? " story" : " stories");
    none.hidden = n !== 0;
  }
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      cat = c.getAttribute("data-cat");
      chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
      apply();
    });
  });
  q.addEventListener("input", apply);
})();
