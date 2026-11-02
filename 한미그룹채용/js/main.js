(function () {
        var header = document.querySelector(".header");
        if (!header) return;

        var previousScrollY = window.scrollY;
        var accumulatedScrollDelta = 0;
        var ticking = false;
        var directionThreshold = 6;

        function updateHeaderOnScroll() {
          var currentScrollY = Math.max(0, window.scrollY);
          var scrollDelta = currentScrollY - previousScrollY;

          if (currentScrollY <= directionThreshold) {
            header.classList.remove("is-hidden", "is-visible");
            accumulatedScrollDelta = 0;
          } else {
            if (
              accumulatedScrollDelta === 0 ||
              Math.sign(scrollDelta) === Math.sign(accumulatedScrollDelta)
            ) {
              accumulatedScrollDelta += scrollDelta;
            } else {
              accumulatedScrollDelta = scrollDelta;
            }

            if (accumulatedScrollDelta > directionThreshold) {
              header.classList.add("is-hidden");
              header.classList.remove("is-visible");
              accumulatedScrollDelta = 0;
            } else if (accumulatedScrollDelta < -directionThreshold) {
              header.classList.remove("is-hidden");
              header.classList.add("is-visible");
              accumulatedScrollDelta = 0;
            }
          }

          previousScrollY = currentScrollY;
          ticking = false;
        }

        window.addEventListener(
          "scroll",
          function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(updateHeaderOnScroll);
          },
          { passive: true },
        );
      })();

      (function () {
        var revealSelectors = [
          ".mirae__title",
          ".mirae__char",
          ".history__head",
          ".history__block",
          ".history__goal",
          ".history__closing",
          ".job__head",
          ".job__item",
          ".innovation__head",
          ".innovation__item",
          ".welfare__head",
          ".welfare__lead",
          ".welfare__card",
          ".tasks__intro",
          ".tasks__tabs",
          ".tasks__group",
          "#requirement-title",
          ".requirement__tabs",
          ".requirement__item",
          ".requirement__notes",
          ".requirement__notice",
          ".requirement__process-group",
          ".requirement__process-notes",
          ".exposition__hero",
          ".exposition__tabs",
          ".exposition__region",
          ".exposition__week-list",
          ".con8__card",
        ];
        var revealSelector = revealSelectors.join(", ");
        if (!("IntersectionObserver" in window)) return;

        var lastScrollY = window.scrollY;
        var scrollDirection = 0;
        var revealObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-revealed");
              } else if (scrollDirection < 0) {
                entry.target.classList.remove("is-revealed");
              }
            });
          },
          {
            rootMargin: "0px 0px -45% 0px",
            threshold: 0,
          },
        );

        function observeRevealTarget(target) {
          if (target.classList.contains("scroll-reveal")) return;
          target.classList.add("scroll-reveal");
          revealObserver.observe(target);
        }

        function observeTargets(root) {
          if (root.nodeType !== Node.ELEMENT_NODE) return;
          var element = root;
          if (element.matches(revealSelector)) observeRevealTarget(element);
          element.querySelectorAll(revealSelector).forEach(observeRevealTarget);
        }

        revealSelectors.forEach(function (selector) {
          document.querySelectorAll(selector).forEach(observeRevealTarget);
        });

        var dynamicContentObserver = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(observeTargets);
          });
        });
        var dynamicContainers = [
          document.getElementById("tasks-groups"),
          document.querySelector(".welfare__scroll"),
        ];
        dynamicContainers.forEach(function (container) {
          if (container) {
            dynamicContentObserver.observe(container, {
              childList: true,
              subtree: true,
            });
          }
        });

        window.addEventListener(
          "scroll",
          function () {
            var currentScrollY = window.scrollY;
            var delta = currentScrollY - lastScrollY;
            if (Math.abs(delta) > 1) scrollDirection = Math.sign(delta);
            lastScrollY = currentScrollY;
          },
          { passive: true },
        );
      })();

      (function () {
        var countdown = document.getElementById("con9-countdown");
        var expired = document.getElementById("con9-expired");
        if (!countdown || !expired) return;

        var deadline = new Date("2026-10-18T23:59:00+09:00").getTime();
        var days = countdown.querySelector("[data-countdown-days]");
        var hours = countdown.querySelector("[data-countdown-hours]");
        var minutes = countdown.querySelector("[data-countdown-minutes]");
        var seconds = countdown.querySelector("[data-countdown-seconds]");
        var timer;

        function updateCountdown() {
          var remaining = deadline - Date.now();
          if (remaining <= 0) {
            countdown.hidden = true;
            expired.hidden = false;
            window.clearInterval(timer);
            return;
          }

          var totalSeconds = Math.floor(remaining / 1000);
          days.textContent = String(Math.floor(totalSeconds / 86400));
          hours.textContent = String(
            Math.floor((totalSeconds % 86400) / 3600),
          ).padStart(2, "0");
          minutes.textContent = String(
            Math.floor((totalSeconds % 3600) / 60),
          ).padStart(2, "0");
          seconds.textContent = String(totalSeconds % 60).padStart(2, "0");
        }

        timer = window.setInterval(updateCountdown, 1000);
        updateCountdown();
      })();

      (function () {
        var btn = document.getElementById("scrollDown");
        var hero = document.getElementById("main-visual");
        if (btn && hero) {
          btn.addEventListener("click", function () {
            window.scrollTo({ top: hero.offsetHeight, behavior: "smooth" });
          });
        }
        // 모바일 전체메뉴 (오른쪽 슬라이드)
        var html = document.documentElement;
        var gnb = document.getElementById("gnb");
        var openBtn = document.getElementById("menuOpen");
        var closeBtn = document.getElementById("menuClose");
        var mobileMq = window.matchMedia("(max-width: 390px)");

        function openMenu() {
          gnb.classList.add("is-open");
          html.classList.add("is-menu-open"); // 배경 스크롤 방지
          openBtn.setAttribute("aria-expanded", "true");
          closeBtn.focus();
        }
        function closeMenu(restoreFocus) {
          gnb.classList.remove("is-open");
          html.classList.remove("is-menu-open"); // 스크롤 복원
          openBtn.setAttribute("aria-expanded", "false");
          if (restoreFocus) openBtn.focus();
        }

        if (gnb && openBtn && closeBtn) {
          openBtn.addEventListener("click", openMenu);
          closeBtn.addEventListener("click", function () {
            closeMenu(true);
          });
          gnb.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              closeMenu(false);
            });
          });
          document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && gnb.classList.contains("is-open"))
              closeMenu(true);
          });
          // 모바일 범위를 벗어나면(회전/리사이즈) 메뉴 상태 초기화
          var onChange = function (e) {
            if (!e.matches) closeMenu(false);
          };
          if (mobileMq.addEventListener)
            mobileMq.addEventListener("change", onChange);
          else mobileMq.addListener(onChange);
        }

        // 디자인 단계: 빈 앵커(#) 클릭 시 페이지 상단 점프 방지
        document.querySelectorAll('a[href="#"]').forEach(function (a) {
          a.addEventListener("click", function (e) {
            e.preventDefault();
          });
        });
      })();

      (function () {
        var tabs = Array.from(document.querySelectorAll(".requirement__tab"));
        if (!tabs.length) return;

        function activateTab(tab, moveFocus) {
          tabs.forEach(function (item) {
            var selected = item === tab;
            item.setAttribute("aria-selected", String(selected));
            item.tabIndex = selected ? 0 : -1;
            document.getElementById(item.getAttribute("aria-controls")).hidden =
              !selected;
          });
          if (moveFocus) tab.focus();
        }

        tabs.forEach(function (tab) {
          tab.addEventListener("click", function () {
            activateTab(tab, false);
          });
          tab.addEventListener("keydown", function (event) {
            var index = tabs.indexOf(tab);
            var nextIndex = index;
            if (event.key === "ArrowRight") {
              nextIndex = (index + 1) % tabs.length;
            } else if (event.key === "ArrowLeft") {
              nextIndex = (index - 1 + tabs.length) % tabs.length;
            } else if (event.key === "Home") {
              nextIndex = 0;
            } else if (event.key === "End") {
              nextIndex = tabs.length - 1;
            } else {
              return;
            }
            event.preventDefault();
            activateTab(tabs[nextIndex], true);
          });
        });
      })();

      (function () {
        var tabs = Array.from(document.querySelectorAll(".exposition__tab"));
        var regions = Array.from(
          document.querySelectorAll(".exposition__region"),
        );
        var fairCalendar = document.getElementById("exposition-fair-calendar");
        var campusCalendar = document.getElementById(
          "exposition-campus-calendar",
        );
        if (!tabs.length || !regions.length || !fairCalendar || !campusCalendar)
          return;

        var fairWeeks = [
          [
            { date: "8월 31일 (월)", venues: ["KAIST"] },
            {
              date: "9월 1일 (화)",
              venues: ["서울대학교", "서강대학교", "연세대학교"],
            },
            { date: "9월 2일 (수)", venues: ["UNIST", "한양대학교"] },
            { date: "9월 3일 (목)", venues: ["GIST"] },
            {
              date: "9월 4일 (금)",
              venues: ["고려대학교", "성균관대학교(자연)"],
            },
          ],
          [
            { date: "9월 7일 (월)", venues: ["KIST", "동국대학교"] },
            {
              date: "9월 8일 (화)",
              venues: ["이화여자대학교", "중견기업박람회(대전)"],
            },
            { date: "9월 9일 (수)", venues: ["POSTECH"] },
            { date: "", venues: [] },
            { date: "10월 7일 (수)", venues: ["서울고용센터"] },
          ],
        ];
        var campusSchedules = [];
        var campusWeekdays = ["일", "월", "화", "수", "목", "금", "토"];

        function parseCampusDate(value) {
          var match =
            /^(\d{1,2})월\s*(\d{1,2})일\s*\(([월화수목금토일])\)$/.exec(value);
          if (!match) {
            throw new Error("캠퍼스 일정 날짜 형식이 올바르지 않습니다.");
          }

          var date = new Date(
            Date.UTC(2026, Number(match[1]) - 1, Number(match[2])),
          );
          if (
            date.getUTCMonth() !== Number(match[1]) - 1 ||
            date.getUTCDate() !== Number(match[2]) ||
            campusWeekdays[date.getUTCDay()] !== match[3]
          ) {
            throw new Error("캠퍼스 일정 날짜와 요일이 일치하지 않습니다.");
          }
          return date;
        }

        function validateCampusSchedules(data) {
          if (
            !Array.isArray(data) ||
            !data.every(function (item) {
              return (
                item &&
                typeof item.region === "string" &&
                typeof item.date === "string" &&
                typeof item.university === "string" &&
                typeof item.location === "string" &&
                typeof item.time === "string"
              );
            })
          ) {
            throw new Error("캠퍼스 일정 데이터 형식이 올바르지 않습니다.");
          }

          data.forEach(function (item) {
            parseCampusDate(item.date);
          });
          return data;
        }

        function getCampusWeeks(regionName) {
          var regionSchedule = campusSchedules
            .filter(function (item) {
              return item.region === regionName;
            })
            .map(function (item) {
              return {
                item: item,
                date: parseCampusDate(item.date),
              };
            })
            .sort(function (a, b) {
              return a.date.getTime() - b.date.getTime();
            });
          if (!regionSchedule.length) return [];

          var lastScheduleDate = regionSchedule[regionSchedule.length - 1].date;
          var weeks = new Map();
          regionSchedule.forEach(function (entry) {
            var weekStart = new Date(entry.date.getTime());
            var daysFromMonday = (weekStart.getUTCDay() + 6) % 7;
            weekStart.setUTCDate(weekStart.getUTCDate() - daysFromMonday);
            var weekKey = weekStart.getTime();
            if (!weeks.has(weekKey)) weeks.set(weekKey, []);
            weeks.get(weekKey).push(entry);
          });

          return Array.from(weeks.entries())
            .sort(function (a, b) {
              return a[0] - b[0];
            })
            .map(function (week) {
              var weekStart = new Date(week[0]);
              var finalDay = new Date(weekStart.getTime());
              finalDay.setUTCDate(finalDay.getUTCDate() + 4);
              if (lastScheduleDate < finalDay) finalDay = lastScheduleDate;

              var campusesByDate = new Map();
              week[1].forEach(function (entry) {
                var dateKey = entry.date.getTime();
                if (!campusesByDate.has(dateKey)) {
                  campusesByDate.set(dateKey, []);
                }
                campusesByDate.get(dateKey).push({
                  name: entry.item.university,
                  location: entry.item.location,
                  time: entry.item.time,
                });
              });

              var days = [];
              for (
                var date = new Date(weekStart.getTime());
                date <= finalDay;
                date.setUTCDate(date.getUTCDate() + 1)
              ) {
                var dateKey = date.getTime();
                days.push({
                  date:
                    date.getUTCMonth() +
                    1 +
                    "월 " +
                    date.getUTCDate() +
                    "일 (" +
                    campusWeekdays[date.getUTCDay()] +
                    ")",
                  campuses: campusesByDate.get(dateKey) || [],
                });
              }
              return days;
            });
        }

        function createDay(day, index) {
          var article = document.createElement("article");
          article.className = "exposition__day";
          if (!day.date) article.classList.add("exposition__day--empty");
          if (!(day.venues || []).length && !(day.campuses || []).length)
            article.classList.add("exposition__day--no-venue");

          var date = document.createElement("h3");
          date.className = "exposition__date";
          date.textContent = day.date || "\u00a0";
          article.appendChild(date);

          var venues = document.createElement("ul");
          venues.className = "exposition__venues";
          (day.venues || []).forEach(function (venue) {
            var item = document.createElement("li");
            item.textContent = venue;
            venues.appendChild(item);
          });
          (day.campuses || []).forEach(function (campus, campusIndex) {
            var item = document.createElement("li");
            item.className = "exposition__campus-entry";
            var detailId =
              "exposition-campus-detail-" +
              day.date.replace(/\D/g, "") +
              "-" +
              campusIndex;
            var button = document.createElement("button");
            button.className = "exposition__campus-name";
            button.type = "button";
            button.textContent = campus.name;
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-controls", detailId);

            var detail = document.createElement("div");
            detail.className = "exposition__campus-detail";
            detail.id = detailId;
            detail.hidden = true;
            detail.tabIndex = -1;
            detail.inert = true;
            detail.setAttribute("role", "group");
            detail.setAttribute("aria-label", campus.name + " 상세 일정");
            detail.setAttribute("aria-hidden", "true");

            [
              { label: "장소", value: campus.location, icon: "location" },
              { label: "시간", value: campus.time, icon: "time" },
            ].forEach(function (itemData) {
              var detailItem = document.createElement("div");
              detailItem.className = "exposition__campus-detail-item";
              var label = document.createElement("span");
              label.className = "exposition__campus-detail-label";
              var icon = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg",
              );
              icon.classList.add("exposition__campus-detail-icon");
              icon.setAttribute("viewBox", "0 0 24 24");
              icon.setAttribute("fill", "none");
              icon.setAttribute("aria-hidden", "true");
              icon.setAttribute("focusable", "false");
              if (itemData.icon === "location") {
                var pin = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "path",
                );
                pin.setAttribute(
                  "d",
                  "M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z",
                );
                var pinCenter = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "circle",
                );
                pinCenter.setAttribute("cx", "12");
                pinCenter.setAttribute("cy", "10");
                pinCenter.setAttribute("r", "2.5");
                icon.append(pin, pinCenter);
              } else {
                var clockFace = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "circle",
                );
                clockFace.setAttribute("cx", "12");
                clockFace.setAttribute("cy", "12");
                clockFace.setAttribute("r", "9");
                var clockHands = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "path",
                );
                clockHands.setAttribute("d", "M12 7v5l3 2");
                icon.append(clockFace, clockHands);
              }
              label.textContent = itemData.label;
              label.prepend(icon);
              var value = document.createElement("span");
              value.className = "exposition__campus-detail-value";
              value.textContent = itemData.value;
              detailItem.append(label, value);
              detail.appendChild(detailItem);
            });

            button.addEventListener("click", function () {
              button.setAttribute("aria-expanded", "true");
              detail.hidden = false;
              detail.inert = false;
              detail.setAttribute("aria-hidden", "false");
              item.classList.add("exposition__campus-entry--expanded");
              requestAnimationFrame(function () {
                detail.classList.add("is-visible");
                detail.focus();
                button.hidden = true;
              });
            });
            item.append(button, detail);
            venues.appendChild(item);
          });
          article.appendChild(venues);
          return article;
        }

        function renderWeeks(container, weeks) {
          container.replaceChildren();
          weeks.forEach(function (week) {
            var calendar = document.createElement("div");
            calendar.className = "exposition__calendar";
            week.forEach(function (day, index) {
              calendar.appendChild(createDay(day, index));
            });
            container.appendChild(calendar);
          });
        }

        function activateTab(tab, moveFocus) {
          tabs.forEach(function (item) {
            var selected = item === tab;
            item.setAttribute("aria-selected", String(selected));
            item.tabIndex = selected ? 0 : -1;
            document.getElementById(item.getAttribute("aria-controls")).hidden =
              !selected;
          });
          if (moveFocus) tab.focus();
        }

        function activateRegion(region, moveFocus) {
          regions.forEach(function (item) {
            var selected = item === region;
            item.setAttribute("aria-selected", String(selected));
            item.tabIndex = selected ? 0 : -1;
          });
          campusCalendar.setAttribute("aria-labelledby", region.id);
          var weeks = getCampusWeeks(region.textContent.trim());
          if (!weeks.length) {
            var message = document.createElement("p");
            message.className = "exposition__empty";
            message.textContent = "해당 지역의 캠퍼스 일정이 없습니다.";
            campusCalendar.replaceChildren(message);
          } else {
            renderWeeks(campusCalendar, weeks);
          }
          if (moveFocus) region.focus();
        }

        campusCalendar.addEventListener("focusout", function (event) {
          var item = event.target.closest(".exposition__campus-entry");
          if (!item || item.contains(event.relatedTarget)) return;
          var button = item.querySelector(".exposition__campus-name");
          var detail =
            button &&
            document.getElementById(button.getAttribute("aria-controls"));
          if (!button || !detail) return;
          button.hidden = false;
          button.setAttribute("aria-expanded", "false");
          detail.inert = true;
          detail.setAttribute("aria-hidden", "true");
          detail.classList.remove("is-visible");
          item.classList.remove("exposition__campus-entry--expanded");
          if (parseFloat(getComputedStyle(detail).transitionDuration) === 0) {
            detail.hidden = true;
          }
        });

        tabs.forEach(function (tab) {
          tab.addEventListener("click", function () {
            activateTab(tab, false);
          });
          tab.addEventListener("keydown", function (event) {
            var index = tabs.indexOf(tab);
            var nextIndex = index;
            if (event.key === "ArrowRight")
              nextIndex = (index + 1) % tabs.length;
            else if (event.key === "ArrowLeft")
              nextIndex = (index - 1 + tabs.length) % tabs.length;
            else if (event.key === "Home") nextIndex = 0;
            else if (event.key === "End") nextIndex = tabs.length - 1;
            else return;
            event.preventDefault();
            activateTab(tabs[nextIndex], true);
          });
        });

        regions.forEach(function (region) {
          region.addEventListener("click", function () {
            activateRegion(region, false);
          });
          region.addEventListener("keydown", function (event) {
            var index = regions.indexOf(region);
            var nextIndex = index;
            if (event.key === "ArrowRight" || event.key === "ArrowDown")
              nextIndex = (index + 1) % regions.length;
            else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
              nextIndex = (index - 1 + regions.length) % regions.length;
            else if (event.key === "Home") nextIndex = 0;
            else if (event.key === "End") nextIndex = regions.length - 1;
            else return;
            event.preventDefault();
            activateRegion(regions[nextIndex], true);
          });
        });

        campusCalendar.textContent = "캠퍼스 일정을 불러오는 중입니다.";
        fetch("./data/campus_schedule.json")
          .then(function (response) {
            if (!response.ok) {
              throw new Error("캠퍼스 일정 데이터를 불러오지 못했습니다.");
            }
            return response.json();
          })
          .then(function (data) {
            campusSchedules = validateCampusSchedules(data);
            var selectedRegion = regions.find(function (region) {
              return region.getAttribute("aria-selected") === "true";
            });
            if (selectedRegion) activateRegion(selectedRegion, false);
          })
          .catch(function (error) {
            console.error("캠퍼스 일정 렌더링 오류:", error);
            campusCalendar.textContent =
              "캠퍼스 일정을 불러오지 못했습니다. 페이지를 로컬 서버에서 열어주세요.";
          });

        renderWeeks(fairCalendar, [[].concat.apply([], fairWeeks)]);
      })();

      /* History 섹션: 펼치기 / 접기
       접힘 높이(100dvh 기준)는 CSS(--hs-collapsed-h)가 담당, JS 는 클래스 토글 + 높이 전환 보조만 수행 */
      (function () {
        var section = document.getElementById("history");
        var panel = document.getElementById("history-panel");
        var toggle = section && section.querySelector(".history__toggle");
        var label = toggle && toggle.querySelector(".history__toggle-label");
        if (!section || !panel || !toggle || !label) return;

        var expanded = false;

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
        // 펼침 완료 후: 높이 제한/잘림 모두 해제 (이후 리사이즈에도 자연스럽게 대응)
        function release() {
          panel.style.maxHeight = "none";
          panel.style.overflow = "visible";
        }

        function expand() {
          panel.style.overflow = "hidden"; // 애니메이션 중에는 잘라서 보여줌
          setState(true);
          panel.style.maxHeight = panel.scrollHeight + "px"; // CSS 접힘 높이 → 전체 높이로 애니메이션
          if (!hasMotion()) release();
        }

        function collapse() {
          // none → 값 으로는 transition 되지 않으므로 현재 전체 높이를 먼저 px 로 고정
          panel.style.overflow = "hidden";
          panel.style.maxHeight = panel.scrollHeight + "px";
          void panel.offsetHeight; // 강제 리플로우
          setState(false);
          panel.style.maxHeight = ""; // 인라인 제거 → CSS 의 접힘 높이(100dvh 기준)로 전환

          // 섹션 상단이 화면 위로 지나가 있을 때만 섹션 시작점으로 부드럽게 이동
          if (section.getBoundingClientRect().top < 0) {
            section.scrollIntoView({
              behavior: hasMotion() ? "smooth" : "auto",
              block: "start",
            });
          }
        }

        panel.addEventListener("transitionend", function (e) {
          if (
            e.target === panel &&
            e.propertyName === "max-height" &&
            expanded
          ) {
            release();
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
      })();

      (function () {
        var tabs = Array.from(document.querySelectorAll(".tasks__tab"));
        var groups = document.getElementById("tasks-groups");
        var modal = document.getElementById("tasks-modal");
        var modalBody = document.getElementById("tasks-modal-body");
        var closeButton = modal && modal.querySelector(".tasks-modal__close");
        var modalImage =
          modal && modal.querySelector(".tasks-modal__visual img");
        if (
          !tabs.length ||
          !groups ||
          !modal ||
          !modalBody ||
          !closeButton ||
          !modalImage
        )
          return;
        if (modal.open) modal.close();

        var popupJobs = [];

        var categories = [
          {
            name: "R&D",
            jobKey: "rnd",
            groups: [
              {
                label: "연구센터 (경기도 동탄)",
                roles: [
                  "NCE (New Chemical Entity)",
                  "QS&F (Quality Science & Formulation)",
                  "MST (Manufacturing Science Technology)",
                  "TE (Toxicology Evaluation)",
                  "DST (Drug Science & Technology)",
                  "BSS (Biological & Structural Evaluation Science)",
                ],
              },
              {
                label: "제제연구소 [의약혁신센터] (경기도 광교)",
                roles: ["신제형연구 (전문연구요원)"],
              },
            ],
          },
          {
            name: "생산/품질",
            jobKey: "prod",
            groups: [
              {
                label: "팔탄제조센터 (경기도 화성)",
                roles: ["제조", "포장", "품질관리", "기술지원"],
              },
              {
                label: "평택제조센터 (경기도 평택)",
                roles: ["DS생산 (학사)", "DS생산 (전문학사)"],
              },
            ],
          },
          {
            name: "영업",
            jobKey: "sales",
            groups: [
              {
                label: "전국 (Mobile Office)",
                roles: ["제약영업"],
              },
              {
                label: "본사 (서울시 송파구)",
                roles: ["해외영업", "IT솔루션영업"],
              },
            ],
          },
          {
            name: "경영관리",
            jobKey: "mps",
            groups: [
              {
                label: "본사 (서울시 송파구)",
                roles: ["구매", "국내법무", "특허", "안전관리", "인사총무"],
              },
            ],
          },
          {
            name: "임상",
            jobKey: "cl",
            groups: [
              {
                label: "본사 (서울시 송파구)",
                roles: [
                  "Pipeline Valuation (신약가치평가)",
                  "Market Intelligence (신약개발 전략분석)",
                  "Data Management",
                  "Biostatistician",
                ],
              },
            ],
          },
          {
            name: "글로벌",
            jobKey: "global",
            groups: [
              {
                label: "본사 (서울시 송파구)",
                roles: ["Global Regulatory Affairs", "Licensing"],
              },
            ],
          },
          {
            name: "헬스케어",
            jobKey: "healthcare",
            groups: [
              {
                label: "본사 (서울시 송파구)",
                roles: [
                  "식품영업",
                  "식품커머스운영",
                  "화장품 커머스사업기획",
                  "화장품 상품기획",
                  "화장품 홈쇼핑영업/운영",
                  "화장품 국내영업",
                  "화장품 해외영업",
                  "화장품 글로벌마케팅",
                  "해외이커머스운영",
                ],
              },
              {
                label: "서울/수도권/영남",
                roles: ["의료기기영업"],
              },
            ],
          },
        ];

        function escapeHtml(value) {
          return String(value).replace(/[&<>"']/g, function (character) {
            return {
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            }[character];
          });
        }

        function renderCategory(category) {
          groups.innerHTML = category.groups
            .map(function (group, index) {
              var panelId = "tasks-panel-" + index;
              var label = group.label;
              var roleCards = group.roles
                .map(function (role) {
                  var job = popupJobs.find(function (item) {
                    return (
                      item.department === category.name && item.title === role
                    );
                  });
                  return (
                    '<button class="tasks__role" type="button" data-role="' +
                    escapeHtml(role) +
                    '" data-group="' +
                    escapeHtml(group.label) +
                    '" data-popup-id="' +
                    escapeHtml(job ? job.id : "") +
                    '"><span class="tasks__role-name">' +
                    escapeHtml(role) +
                    '</span><svg class="tasks__role-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
                  );
                })
                .join("");

              return (
                '<section class="tasks__group"><button class="tasks__group-toggle" type="button" aria-expanded="false" aria-controls="' +
                panelId +
                '"><span class="tasks__group-label">' +
                escapeHtml(label) +
                '</span><span class="tasks__count">' +
                group.roles.length +
                '</span></button><div class="tasks__panel" id="' +
                panelId +
                '" aria-hidden="true" inert><div class="tasks__panel-inner"><div class="tasks__cards">' +
                roleCards +
                "</div></div></div></section>"
              );
            })
            .join("");
        }

        function renderModalSection(title, items) {
          if (!Array.isArray(items) || !items.length) return "";
          return (
            '<section class="tasks-modal__section"><h3>' +
            escapeHtml(title) +
            "</h3><ul>" +
            items
              .map(function (item) {
                return "<li>" + escapeHtml(item) + "</li>";
              })
              .join("") +
            "</ul></section>"
          );
        }

        function openRole(jobId) {
          var job = popupJobs.find(function (item) {
            return item.id === jobId;
          });
          if (!job) return;

          modalImage.onerror = function () {
            modalImage.onerror = null;
            modalImage.removeAttribute("src");
          };
          modalImage.src = job.image;
          modalImage.alt = job.title + " 직무 이미지";
          var sections =
            renderModalSection("직무 내용", job.job_description) +
            renderModalSection("자격요건", job.qualifications) +
            renderModalSection("우대사항", job.preferred);
          modalBody.innerHTML =
            '<div class="tasks-modal__summary"><div class="tasks-modal__heading"><h2 class="tasks-modal__title" id="tasks-modal-title">' +
            escapeHtml(job.title) +
            '</h2><span class="tasks-modal__category">' +
            escapeHtml(job.department) +
            '</span><span class="tasks-modal__group">' +
            escapeHtml(job.location) +
            '</span></div><p class="tasks-modal__level">' +
            escapeHtml(job.category) +
            '</p></div><div class="tasks-modal__content">' +
            sections +
            "</div>";
          modal.showModal();
        }

        tabs.forEach(function (tab) {
          tab.addEventListener("click", function () {
            var category = categories.find(function (item) {
              return item.jobKey === tab.dataset.jobKey;
            });
            if (!category) return;

            tabs.forEach(function (item) {
              item.setAttribute("aria-selected", String(item === tab));
            });
            renderCategory(category);
            tab.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "center",
            });
          });

          tab.addEventListener("keydown", function (event) {
            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
            event.preventDefault();
            var direction = event.key === "ArrowRight" ? 1 : -1;
            var nextIndex =
              (tabs.indexOf(tab) + direction + tabs.length) % tabs.length;
            tabs[nextIndex].focus();
            tabs[nextIndex].click();
          });
        });

        groups.addEventListener("click", function (event) {
          var toggle = event.target.closest(".tasks__group-toggle");
          if (toggle) {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            groups
              .querySelectorAll(".tasks__group-toggle")
              .forEach(function (item) {
                if (item === toggle) return;
                item.setAttribute("aria-expanded", "false");
                var otherPanel = document.getElementById(
                  item.getAttribute("aria-controls"),
                );
                otherPanel.classList.remove("is-open");
                otherPanel.setAttribute("aria-hidden", "true");
                otherPanel.inert = true;
              });

            var panel = document.getElementById(
              toggle.getAttribute("aria-controls"),
            );
            toggle.setAttribute("aria-expanded", String(!expanded));
            panel.classList.toggle("is-open", !expanded);
            panel.setAttribute("aria-hidden", String(expanded));
            panel.inert = expanded;
            return;
          }

          var roleButton = event.target.closest(".tasks__role");
          if (!roleButton) return;
          openRole(roleButton.dataset.popupId);
        });

        closeButton.addEventListener("click", function () {
          modal.close();
        });
        modal.addEventListener("keydown", function (event) {
          if (event.key === "Escape") modal.close();
        });
        modal.addEventListener("click", function (event) {
          if (event.target === modal) modal.close();
        });

        var welfareScroll = document.querySelector(".welfare__scroll");
        if (welfareScroll) {
          welfareScroll.textContent = "복지 정보를 불러오는 중입니다.";

          function createWelfareElement(tagName, className, text) {
            var element = document.createElement(tagName);
            element.className = className;
            element.textContent = text;
            return element;
          }

          function renderBenefits(data) {
            if (
              !data ||
              !Array.isArray(data.benefits) ||
              !data.benefits.every(function (group) {
                return (
                  group &&
                  typeof group.group_title === "string" &&
                  typeof group.group_description === "string" &&
                  Array.isArray(group.items) &&
                  group.items.every(function (item) {
                    return (
                      item &&
                      typeof item.title === "string" &&
                      typeof item.description === "string" &&
                      typeof item.icon === "string" &&
                      typeof item.icon_alt === "string"
                    );
                  })
                );
              })
            ) {
              throw new Error("복지 데이터 형식이 올바르지 않습니다.");
            }

            var content = document.createDocumentFragment();
            data.benefits.forEach(function (group) {
              var lead = document.createElement("div");
              lead.className = "welfare__lead";
              var heading = createWelfareElement(
                "h3",
                "welfare__highlight",
                (group.heading_emoji ? group.heading_emoji + " " : "") +
                  group.group_title,
              );
              var description = createWelfareElement(
                "p",
                "welfare__lead-desc",
                group.group_description,
              );
              lead.append(heading, description);
              content.appendChild(lead);

              var list = document.createElement("ul");
              list.className = "welfare__list";
              group.items.forEach(function (item) {
                var listItem = document.createElement("li");
                var card = document.createElement("article");
                card.className = "welfare__card";
                var copy = document.createElement("div");
                copy.appendChild(
                  createWelfareElement("h4", "welfare__card-title", item.title),
                );
                copy.appendChild(
                  createWelfareElement(
                    "p",
                    "welfare__card-desc",
                    item.description,
                  ),
                );

                var icon = document.createElement("img");
                icon.className = "welfare__icon";
                icon.src = item.icon;
                icon.alt = item.icon_alt;
                icon.width = 68;
                icon.height = 68;
                icon.loading = "lazy";
                icon.decoding = "async";
                card.append(copy, icon);
                listItem.appendChild(card);
                list.appendChild(listItem);
              });
              content.appendChild(list);
            });
            welfareScroll.replaceChildren(content);
          }

          fetch("./data/benefits.json")
            .then(function (response) {
              if (!response.ok) {
                throw new Error("복지 데이터를 불러오지 못했습니다.");
              }
              return response.json();
            })
            .then(renderBenefits)
            .catch(function (error) {
              console.error("복지 데이터 렌더링 오류:", error);
              welfareScroll.textContent =
                "복지 정보를 불러오지 못했습니다. 페이지를 로컬 서버에서 열어주세요.";
            });
        }

        fetch("./data/pop_data.json")
          .then(function (response) {
            if (!response.ok)
              throw new Error("직무 데이터를 불러오지 못했습니다.");
            return response.json();
          })
          .then(function (data) {
            popupJobs = data;
            renderCategory(categories[0]);
          })
          .catch(function () {
            groups.innerHTML =
              '<p class="tasks__empty">직무 정보를 불러오지 못했습니다. 페이지를 로컬 서버에서 열어주세요.</p>';
          });
      })();
