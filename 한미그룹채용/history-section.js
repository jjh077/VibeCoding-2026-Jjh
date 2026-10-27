/* History 섹션: 펼치기 / 접기 (전체 높이의 2/3만 노출) */
(function () {
  var section = document.getElementById("history");
  var panel = document.getElementById("history-panel");
  var toggle = section && section.querySelector(".history__toggle");
  var label = toggle && toggle.querySelector(".history__toggle-label");
  if (!section || !panel || !toggle || !label) return;

  var RATIO = 2 / 3; // 접힘 상태에서 보여줄 비율
  var expanded = false;

  // 시안 대비 유동 레이아웃이라 높이를 px로 고정하지 않고, 실제 콘텐츠 높이의 2/3를 측정
  function collapsedHeight() {
    return Math.round(panel.scrollHeight * RATIO);
  }
  // prefers-reduced-motion 등으로 transition이 꺼져 있으면 transitionend가 오지 않음
  function hasMotion() {
    return parseFloat(getComputedStyle(panel).transitionDuration) > 0;
  }
  function setState(isExpanded) {
    expanded = isExpanded;
    section.classList.toggle("is-expanded", isExpanded);
    toggle.setAttribute("aria-expanded", String(isExpanded));
    label.textContent = isExpanded ? "접기" : "펼치기";
  }

  function expand() {
    setState(true);
    panel.style.maxHeight = panel.scrollHeight + "px"; // 현재(2/3) → 전체 높이로 애니메이션
    if (!hasMotion()) panel.style.maxHeight = "none";
  }

  function collapse() {
    // none → px 로는 transition 되지 않으므로 현재 전체 높이를 먼저 px 로 고정
    panel.style.maxHeight = panel.scrollHeight + "px";
    void panel.offsetHeight; // 강제 리플로우
    setState(false);
    panel.style.maxHeight = collapsedHeight() + "px";

    // 섹션 상단이 화면 위로 지나가 있을 때만 섹션 시작점으로 부드럽게 이동
    if (section.getBoundingClientRect().top < 0) {
      section.scrollIntoView({
        behavior: hasMotion() ? "smooth" : "auto",
        block: "start",
      });
    }
  }

  // 펼침이 끝나면 max-height 제한을 풀어 이후 리사이즈에도 자연스럽게 대응
  panel.addEventListener("transitionend", function (e) {
    if (e.target === panel && e.propertyName === "max-height" && expanded) {
      panel.style.maxHeight = "none";
    }
  });

  toggle.addEventListener("click", function () {
    if (expanded) collapse();
    else expand();
  });

  // 초기화: 접힘 상태로 시작 (JS 미동작 시에는 전체 노출 + 버튼 숨김 상태 유지)
  section.classList.add("is-collapsible");
  toggle.hidden = false;
  setState(false);
  panel.style.maxHeight = collapsedHeight() + "px";

  // 리사이즈 / 폰트 로딩 등으로 높이가 바뀌면 접힘 높이를 다시 계산
  function syncCollapsed() {
    if (!expanded) panel.style.maxHeight = collapsedHeight() + "px";
  }
  window.addEventListener("resize", syncCollapsed);
  if ("ResizeObserver" in window) {
    var ro = new ResizeObserver(syncCollapsed);
    Array.prototype.forEach.call(panel.children, function (child) {
      ro.observe(child); // 패널은 높이가 제한되므로 내부 블록의 높이 변화를 관찰
    });
  }
})();
