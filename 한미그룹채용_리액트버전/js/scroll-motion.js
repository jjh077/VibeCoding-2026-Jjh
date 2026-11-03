(function () {
  var root = document.documentElement;
  var toggle = document.getElementById("scroll-motion-toggle");
  var reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  var enabled = !reducedMotion.matches;
  var targetY = window.scrollY;
  var frame = 0;
  var previousTime = 0;

  if (!toggle) return;

  function setEnabled(nextEnabled) {
    enabled = nextEnabled;
    toggle.checked = !enabled;
    root.classList.toggle("scroll-motion-disabled", !enabled);

    if (!enabled && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      root.style.scrollBehavior = "";
      targetY = window.scrollY;
    }
  }

  function canScrollInside(target, deltaY) {
    var element =
      target && target.nodeType === Node.ELEMENT_NODE
        ? target
        : target && target.parentElement;

    while (element && element !== document.body) {
      var style = window.getComputedStyle(element);
      var canScroll =
        element.scrollHeight > element.clientHeight &&
        (style.overflowY === "auto" || style.overflowY === "scroll");

      if (canScroll) {
        if (
          (deltaY < 0 && element.scrollTop > 0) ||
          (deltaY > 0 &&
            element.scrollTop + element.clientHeight < element.scrollHeight)
        ) {
          return true;
        }
      }

      element = element.parentElement;
    }

    return false;
  }

  function animateScroll(time) {
    frame = 0;

    if (!enabled) return;

    var elapsed = previousTime
      ? Math.min((time - previousTime) / 1000, 0.05)
      : 0;
    previousTime = time;
    var currentY = window.scrollY;
    var distance = targetY - currentY;

    if (Math.abs(distance) < 0.75) {
      window.scrollTo(0, targetY);
      root.style.scrollBehavior = "";
      previousTime = 0;
      return;
    }

    window.scrollTo(0, currentY + distance * (1 - Math.exp(-10 * elapsed)));
    frame = requestAnimationFrame(animateScroll);
  }

  window.addEventListener(
    "wheel",
    function (event) {
      if (
        !enabled ||
        event.defaultPrevented ||
        event.ctrlKey ||
        Math.abs(event.deltaY) < Math.abs(event.deltaX) ||
        canScrollInside(event.target, event.deltaY)
      ) {
        return;
      }

      var delta = event.deltaY;
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 16;
      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        delta *= window.innerHeight;
      }

      var maxY = document.documentElement.scrollHeight - window.innerHeight;
      var startY = frame ? targetY : window.scrollY;
      var nextY = Math.max(0, Math.min(maxY, startY + delta));

      if (nextY === startY && !frame) return;

      event.preventDefault();
      targetY = nextY;
      root.style.scrollBehavior = "auto";
      if (!frame) frame = requestAnimationFrame(animateScroll);
    },
    { passive: false },
  );

  window.addEventListener("scroll", function () {
    if (!frame) targetY = window.scrollY;
  });

  window.addEventListener("keydown", function (event) {
    if (
      frame &&
      [
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        "Home",
        "End",
        " ",
      ].includes(event.key)
    ) {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      root.style.scrollBehavior = "";
      targetY = window.scrollY;
    }
  });

  toggle.addEventListener("change", function () {
    setEnabled(!toggle.checked);
  });

  setEnabled(enabled);
})();
