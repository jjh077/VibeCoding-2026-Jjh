import { useEffect, useRef, useState } from "react";

let walkerPlayerPromise;

function loadWalkerPlayer() {
  if (window.HanmiWalker) return Promise.resolve();
  if (!walkerPlayerPromise) {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Unable to load ${src}`));
        document.head.append(script);
      });

    walkerPlayerPromise = loadScript("./hanmi-eye-tracking/metadata.js").then(
      () => loadScript("./hanmi-eye-tracking/player.js"),
    );
  }
  return walkerPlayerPromise;
}

export function PageHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerState, setHeaderState] = useState("");
  const [motionDisabled, setMotionDisabled] = useState(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const closeButtonRef = useRef(null);
  const openButtonRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("scroll-motion-disabled", motionDisabled);
    return () => root.classList.remove("scroll-motion-disabled");
  }, [motionDisabled]);

  useEffect(() => {
    let previousY = window.scrollY;
    let accumulatedDelta = 0;
    let frame = 0;

    const updateHeader = () => {
      frame = 0;
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - previousY;
      if (currentY <= 6) {
        setHeaderState("");
        accumulatedDelta = 0;
      } else {
        accumulatedDelta =
          !accumulatedDelta || Math.sign(delta) === Math.sign(accumulatedDelta)
            ? accumulatedDelta + delta
            : delta;
        if (accumulatedDelta > 6) {
          setHeaderState("is-hidden");
          accumulatedDelta = 0;
        } else if (accumulatedDelta < -6) {
          setHeaderState("is-visible");
          accumulatedDelta = 0;
        }
      }
      previousY = currentY;
    };

    const handleScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateHeader);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (menuOpen) {
      root.classList.add("is-menu-open");
      closeButtonRef.current?.focus();
    } else {
      root.classList.remove("is-menu-open");
    }

    const closeOnEscape = (event) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        openButtonRef.current?.focus();
      }
    };
    const closeOnResize = () => {
      if (window.innerWidth > 390) setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnResize);
    return () => {
      root.classList.remove("is-menu-open");
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnResize);
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    openButtonRef.current?.focus();
  };

  return (
    <>
      <label className="scroll-motion-toggle" title="부드러운 스크롤 끄기">
        <span className="sr-only">부드러운 스크롤 끄기</span>
        <input
          id="scroll-motion-toggle"
          type="checkbox"
          aria-label="부드러운 스크롤 끄기"
          checked={motionDisabled}
          onChange={(event) => setMotionDisabled(event.target.checked)}
        />
      </label>
      <header className={`header ${headerState}`}>
        <div className="header__inner">
          <a className="brand" href="#" aria-label="한미그룹 홈">
            <img src="./images/logo_svg.svg" alt="Hanmi 한미그룹" width="182" height="31" />
          </a>
          <nav className={`gnb${menuOpen ? " is-open" : ""}`} id="gnb" aria-label="주요 메뉴">
            <div className="gnb__head">
              <a className="brand" href="#" aria-label="한미그룹 홈">
                <img src="./images/logo_svg.svg" alt="Hanmi 한미그룹" width="182" height="31" />
              </a>
              <button
                className="btn-menu-close"
                type="button"
                id="menuClose"
                aria-label="전체 메뉴 닫기"
                ref={closeButtonRef}
                onClick={closeMenu}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <ul className="gnb__list">
              <li className="gnb__item"><a className="gnb__link" href="#job" onClick={() => setMenuOpen(false)}>직무소개</a></li>
              <li className="gnb__item"><a className="gnb__link" href="#requirement" onClick={() => setMenuOpen(false)}>지원자격 및 접수방법</a></li>
              <li className="gnb__item"><a className="gnb__link" href="#exposition" onClick={() => setMenuOpen(false)}>채용설명회 일정</a></li>
            </ul>
            <div className="gnb__apply">
              <a className="btn-apply" href="#"><span>지원하기</span><svg viewBox="0 0 7 12" fill="none" aria-hidden="true"><path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
            </div>
            <img className="gnb__char" src="./images/mo_menu_char.png" alt="" />
          </nav>
          <div className="header__mo">
            <a className="btn-apply" href="#"><span>지원하기</span></a>
            <button
              className="btn-menu"
              type="button"
              id="menuOpen"
              aria-label="전체 메뉴 열기"
              aria-expanded={menuOpen}
              aria-controls="gnb"
              ref={openButtonRef}
              onClick={() => setMenuOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M2 6h20M2 12h20M2 18h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export function Hero() {
  return (
    <section className="main-visual" id="main-visual" aria-labelledby="mv-title">
            <div className="main-visual__bg" aria-hidden="true"></div>
    
            <div className="main-visual__inner">
              <div className="mv-copy">
                <div className="mv-copy__text">
                  <p className="mv-copy__eyebrow">2026년 하반기</p>
                  <h1 className="mv-copy__title" id="mv-title">
                    <span className="mv-copy__brand">한미그룹</span>
                    <span className="mv-copy__sub">공개채용</span>
                  </h1>
                  <p className="mv-copy__period">
                    모집기간 : <time dateTime="2026-09-28">2026.9.28(월)</time> ~
                    <time dateTime="2026-10-18T23:59">2026.10.18(일) 23:59</time
                    >까지
                  </p>
                </div>
                <a className="btn-cta" href="#tasks">모집직무 바로가기!</a>
              </div>
    
              <figure
                className="mv-stage"
                role="img"
                aria-label="현미경과 실험 도구 사이에서 일하는 한미그룹 캐릭터들"
              >
                <div className="mv-stage__glass"></div>
                <div className="mv-stage__ring"></div>
    
                <img className="micro updown" src="./images/mv_micro.png" alt="" />
                <img className="char1 updown" src="./images/mv_char1.png" alt="" />
                <img className="char2 updown" src="./images/mv_char2.png" alt="" />
                <img className="char3 updown" src="./images/mv_char3.png" alt="" />
                <img className="char4 updown" src="./images/mv_char4.png" alt="" />
    
                <span className="star star--blue"></span>
                <span className="star star--red"></span>
                <span className="star star--gold-l"></span>
                <span className="star star--gold-s"></span>
                <span className="star star--purple"></span>
              </figure>
            </div>
    
            <button
              className="btn-scroll"
              type="button"
              id="scrollDown"
              aria-label="아래로 스크롤"
              onClick={() => document.getElementById("mirae")?.scrollIntoView({ behavior: "smooth" })}
            >
              <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <path
                  d="M12 16l8 8 8-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </section>
  );
}

export function Future() {
  useEffect(() => {
    loadWalkerPlayer().catch((error) => {
      const status = document.querySelector("#mirae [data-status]");
      if (status) {
        status.textContent = `이미지 플레이어를 불러오지 못했습니다: ${error.message}`;
      }
    });
  }, []);

  return (
    <div className="band band--mirae">
            <section className="mirae" id="mirae" aria-labelledby="mirae-title">
              <h2 className="mirae__title" id="mirae-title">
                <span className="mirae__title-em">새로운 미래</span>를 향해 나아갑니다
              </h2>
    
              {/* 배경 장식: 구름 · 별 (스크린리더에서는 숨김) */}
              <div className="mirae__deco" aria-hidden="true">
                <img
                  className="mirae__cloud mirae__cloud--blur-l"
                  src="./images/mirae_cont.png"
                  alt="멀리 흐릿하게 떠 있는 큰 구름"
                />
                <img
                  className="mirae__cloud mirae__cloud--blur-r"
                  src="./images/mirae_cloud1.png"
                  alt="오른쪽 아래에 흐릿하게 떠 있는 작은 구름"
                />
                <img
                  className="mirae__cloud mirae__cloud--front-l"
                  src="./images/mirae_cloud2.png"
                  alt="화면 왼쪽 가장자리에 걸친 하얀 구름"
                />
                <img
                  className="mirae__cloud mirae__cloud--front-r"
                  src="./images/mirae_cloud3.png"
                  alt="화면 오른쪽 가장자리에 걸친 큰 하얀 구름"
                />
                <img
                  className="mirae__star mirae__star--right"
                  src="./images/mirae_star1.png"
                  alt="캐릭터 오른쪽 위에서 반짝이는 노란 별"
                />
                <img
                  className="mirae__star mirae__star--left"
                  src="./images/mirae_star2.png"
                  alt="캐릭터 왼쪽 아래에서 반짝이는 노란 별"
                />
              </div>
    
              <div
                className="mirae__char hanmi-walker"
                data-hanmi-walker
                data-tracking="desktop"
              >
                <canvas
                  width="1920"
                  height="1080"
                  role="img"
                  aria-label="사원증을 목에 건 한미그룹 캐릭터가 초록 언덕 위를 걸어 나아가는 모습"
                ></canvas>
                <span data-status role="status">이미지 준비 중</span>
              </div>
            </section>
          </div>
  );
}

export function History() {
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef(null);

  const toggleHistory = () => {
    if (expanded && sectionRef.current?.getBoundingClientRect().top < 0) {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      sectionRef.current.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
    setExpanded((current) => !current);
  };

  return (
    <section
      className={`history is-collapsible${expanded ? " is-expanded" : ""}`}
      id="history"
      aria-labelledby="history-title"
      ref={sectionRef}
    >
            <div className="history__panel" id="history-panel">
              <header className="history__head">
                <h2 className="history__title" id="history-title">
                  <span className="history__title-line"
                    >한미의 도전은 작은 가능성에서</span
                  >
                  <span className="history__title-line">시작되었습니다.</span>
                </h2>
                <p className="history__num history__num--start">
                  <span className="sr-only">한미약품 설립 53주년</span>
                  <span className="history__num-main" aria-hidden="true">53</span>
                  <span className="history__num-suffix" aria-hidden="true">th</span>
                </p>
                <img
                  className="history__deco history__deco--obj history__deco--stars updown"
                  src="./images/obj_star_big.png"
                  alt="반짝이는 노란 별 세 개"
                  width="240"
                  height="288"
                  loading="lazy"
                  decoding="async"
                  aria-hidden="true"
                />
              </header>
    
              <div className="history__timeline">
                {/* 1973~2001 : 목록 좌 / 이미지 우 */}
                <div className="history__block history__block--list-left">
                  <h3 className="history__range">1973~2001</h3>
                  <p className="history__phrase">한계를 하나씩 넘을 때마다,</p>
                  <div className="history__events">
                    <ul className="history__list">
                      <li className="history__item">
                        <span className="history__year">1973</span>
                        <span className="history__desc">한미약품공업주식회사 설립</span>
                      </li>
                      <li className="history__item">
                        <span className="history__year">1984</span>
                        <span className="history__desc">팔탄 GMP 공장 신축</span>
                      </li>
                      <li className="history__item">
                        <span className="history__year">1989</span>
                        <span className="history__desc"
                          >세프트리악손 제조방법 Roche사 기술 수출</span
                        >
                      </li>
                      <li className="history__item">
                        <span className="history__year">1997</span>
                        <span className="history__desc"
                          >마이크로에멀젼 제제기술 Novartis사 기술 수출</span
                        >
                      </li>
                    </ul>
                    <span className="history__dots" aria-hidden="true"
                      ><span></span><span></span><span></span
                    ></span>
                  </div>
                  <figure className="history__media history__media--snack">
                    <img
                      src="./images/his1.png"
                      alt="텐텐, 쎄쎄 등 한미약품 초기 어린이 영양제와 비타민 제품 모음"
                      width="750"
                      height="404"
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                  <img
                    className="history__deco history__deco--obj history__deco--beaker updown updown"
                    src="./images/obj_beaker.png"
                    alt="분홍빛 용액이 담긴 연구용 비커"
                    width="240"
                    height="288"
                    loading="lazy"
                    decoding="async"
                    aria-hidden="true"
                  />
                </div>
    
                {/* 2002~2010 : 이미지 좌 / 목록 우 */}
                <div className="history__block history__block--list-right">
                  <h3 className="history__range">2002~2010</h3>
                  <div className="history__events">
                    <ul className="history__list">
                      <li className="history__item">
                        <span className="history__year">2004</span>
                        <span className="history__desc"
                          >국내 최초 고혈압치료제 ‘아모디핀’ 미국특허 획득</span
                        >
                      </li>
                      <li className="history__item">
                        <span className="history__year">2006</span>
                        <span className="history__desc"
                          >세계 최초 유소아 해열 시럽제 개량신약 ‘맥시부펜’ 개발
                          성공</span
                        >
                      </li>
                      <li className="history__item">
                        <span className="history__year">2008</span>
                        <span className="history__desc"
                          >국내 최초 주사용항생제 세프트리악손 美 FDA 승인</span
                        >
                      </li>
                      <li className="history__item">
                        <span className="history__year">2009</span>
                        <span className="history__desc"
                          >세계최초 암로디핀+로살탄 복합제 ‘아모잘탄’ 발매</span
                        >
                      </li>
                    </ul>
                    <span className="history__dots" aria-hidden="true"
                      ><span></span><span></span><span></span
                    ></span>
                  </div>
                  <figure className="history__media history__media--together">
                    <img
                      src="./images/his2.png"
                      alt="노을 지는 해변 위에서 손을 잡고 함께 뛰어오르는 다섯 사람의 실루엣"
                      width="830"
                      height="600"
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                  <img
                    className="history__deco history__deco--blur history__deco--hex"
                    src="./images/obj_mol_blur1.png"
                    alt="흐릿하게 번진 푸른 분자 구조 배경 장식"
                    width="420"
                    height="465"
                    loading="lazy"
                    decoding="async"
                    aria-hidden="true"
                  />
                  <img
                    className="history__deco history__deco--obj history__deco--microscope updown"
                    src="./images/obj_microscope.png"
                    alt="파란색 현미경"
                    width="218"
                    height="306"
                    loading="lazy"
                    decoding="async"
                    aria-hidden="true"
                  />
                </div>
    
                {/* 2011~2015 : 목록 좌 / 이미지 우 */}
                <div className="history__block history__block--list-left">
                  <h3 className="history__range">2011~2015</h3>
                  <p className="history__phrase">새로운 가능성이 현실이 되었어요.</p>
                  <div className="history__events">
                    <ul className="history__list">
                      <li className="history__item">
                        <span className="history__year">2011</span>
                        <span className="history__desc"
                          >MSD와 ‘아모잘탄’ 50여개국 수출 계약 체결</span
                        >
                      </li>
                      <li className="history__item">
                        <span className="history__year">2012</span>
                        <span className="history__desc"
                          >‘LAPS-GCSF’ 美 스펙트럼사와 공동개발 및 상업화 계약</span
                        >
                      </li>
                      <li className="history__item">
                        <span className="history__year">2013</span>
                        <span className="history__desc"
                          >국내 개량신약 최초 미국 FDA 승인 및 미국 출시
                          ‘에소메졸’</span
                        >
                      </li>
                      <li className="history__item">
                        <span className="history__year">2014</span>
                        <span className="history__desc"
                          >‘트리악손’ 국내 최초 유럽 4개국 시판 허가</span
                        >
                      </li>
                      <li className="history__item">
                        <span className="history__year">2015</span>
                        <span className="history__desc"
                          >한국 사상 최대규모 릴레이 기술수출</span
                        >
                      </li>
                    </ul>
                    <span className="history__dots" aria-hidden="true"
                      ><span></span><span></span><span></span
                    ></span>
                  </div>
                  <figure className="history__media history__media--spectrum">
                    <img
                      src="./images/his3.png"
                      alt="인체 엑스레이 이미지 앞에 놓인 에소메졸 20mg·40mg 제품과 스펙트럼 파마슈티컬스 로고"
                      width="1000"
                      height="508"
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                  <img
                    className="history__deco history__deco--blur history__deco--ring"
                    src="./images/obj_mol_blur2.png"
                    alt="흐릿하게 번진 회색 분자 구조 배경 장식"
                    width="338"
                    height="372"
                    loading="lazy"
                    decoding="async"
                    aria-hidden="true"
                  />
                </div>
    
                {/* 2016~2020 : 이미지 좌 / 목록 우 */}
                <div className="history__block history__block--list-right">
                  <h3 className="history__range">2016~2020</h3>
                  <div className="history__events">
                    <ul className="history__list">
                      <li className="history__item">
                        <span className="history__year">2016</span>
                        <span className="history__desc"
                          >차세대 RAF 저해제, Roche 제넨텍 기술수출</span
                        >
                      </li>
                      <li className="history__item">
                        <span className="history__year">2017</span>
                        <span className="history__desc"
                          >‘에소메졸’ 국내 제약회사 최초 미국약전(USP) 등재</span
                        >
                      </li>
                      <li className="history__item">
                        <span className="history__year">2018</span>
                        <span className="history__desc"
                          >‘Glucagon Analog’, ‘오락솔’ 차세대 AML 치료제 美
                          희귀의약품 지정</span
                        >
                      </li>
                      <li className="history__item">
                        <span className="history__year">2019</span>
                        <span className="history__desc"
                          >최근 10년간 처방실적 최다 4조 4,176억원</span
                        >
                      </li>
                    </ul>
                    <span className="history__dots" aria-hidden="true"
                      ><span></span><span></span><span></span
                    ></span>
                  </div>
                  <figure className="history__media history__media--asco">
                    <img
                      src="./images/his4.png"
                      alt="ASCO와 USP 로고, 로수젯 네 가지 용량의 제품 패키지"
                      width="934"
                      height="452"
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                </div>
    
                {/* 2021~2026 : 목록 좌 / 이미지 우 */}
                <div className="history__block history__block--list-left">
                  <h3 className="history__range">2021~2026</h3>
                  <p className="history__phrase">
                    하지만 아직, 가야 할 길이 더 남아 있습니다.
                  </p>
                  <div className="history__events">
                    <ul className="history__list">
                      <li className="history__item">
                        <span className="history__year">2021</span>
                        <span className="history__desc"
                          >‘로수젯’, 국내사 개발 처방의약품 매출 1위 달성</span
                        >
                      </li>
                      <li className="history__item">
                        <span className="history__year">2022</span>
                        <span className="history__desc">
                          <span className="history__line"
                            >‘롤론티스’ 한국 최초 FDA 허가 받은 바이오신약
                            등재</span
                          >
                          <span className="history__line"
                            >‘로수젯 RACING 연구’ 세계 최고 권위 의학저널 ‘LANCET’
                            등재</span
                          >
                        </span>
                      </li>
                      <li className="history__item">
                        <span className="history__year">2023</span>
                        <span className="history__desc"
                          >비만 프로젝트 ‘H.O.P’ 프로젝트 가동</span
                        >
                      </li>
                      <li className="history__item">
                        <span className="history__year">2024</span>
                        <span className="history__desc"
                          >근손실 한계 뛰어넘은 신개념 비만 신약 ‘HM17321’
                          발표</span
                        >
                      </li>
                      <li className="history__item">
                        <span className="history__year">2025</span>
                        <span className="history__desc">
                          <span className="history__line"
                            >‘로수젯’ 한국 전문의약품 시장 1위 품목 등록</span
                          >
                          <span className="history__line"
                            >한미약품 8년 연속 원외처방 1위</span
                          >
                          <span className="history__line"
                            >미국암연구학회(AACR)서 국내 최다 11개 연구 성과
                            발표</span
                          >
                          <span className="history__line"
                            >한미사이언스 약국화장품 ‘EGF크림’ 27만개 완판</span
                          >
                        </span>
                      </li>
                      <li className="history__item">
                        <span className="history__year">2026</span>
                        <span className="history__desc">
                          <span className="history__line"
                            >희귀질환치료제 ‘LAPS-GLP2’ 릴리 기술수출</span
                          >
                          <span className="history__line"
                            >한미 ‘완전두유·케어미’ 국제 우수 미각상 수상</span
                          >
                        </span>
                      </li>
                    </ul>
                    <span className="history__dots" aria-hidden="true"
                      ><span></span><span></span><span></span
                    ></span>
                  </div>
                  <figure className="history__media history__media--lancet">
                    <img
                      src="./images/his5.png"
                      alt="랜싯 200주년 표지와 롤론티스 제품·주사기, 약물 작용 원리를 보여주는 도식"
                      width="746"
                      height="538"
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                  <img
                    className="history__deco history__deco--obj history__deco--molecule updown"
                    src="./images/obj_mol_big.png"
                    alt="보랏빛 유리 구슬로 만든 분자 구조 오브제"
                    width="237"
                    height="293"
                    loading="lazy"
                    decoding="async"
                    aria-hidden="true"
                  />
                </div>
              </div>
    
              <div className="history__goal">
                <p className="history__num history__num--goal">
                  <span className="sr-only">한미약품 100주년</span>
                  <span className="history__num-main" aria-hidden="true">100</span>
                  <span className="history__num-suffix" aria-hidden="true">th</span>
                </p>
                <div className="history__closing">
                  <p className="history__closing-sub">
                    한계를 넘을 때마다, 건강한 미래는 가까워졌습니다. 한계를 넘는
                    일, 우리에게는 꽤 익숙하니까.
                  </p>
                  <p className="history__closing-main">
                    <span className="history__closing-line"
                      >수많은 도전이 오늘의 한미를 만들었습니다.</span
                    >
                    <span className="history__closing-line"
                      >이제 또 다른 가능성을 향해 당신과 함께 나아갑니다.</span
                    >
                  </p>
                </div>
                <img
                  className="history__deco history__deco--blur history__deco--shadow"
                  src="./images/cloud_blur_medium.png"
                  alt="캐릭터 아래에 드리운 흐릿한 그림자"
                  width="379"
                  height="230"
                  loading="lazy"
                  decoding="async"
                  aria-hidden="true"
                />
                <img
                  className="history__deco history__deco--obj history__deco--char leftright"
                  src="./images/con2_char.png"
                  alt="사원증을 목에 걸고 힘차게 달려가는 한미 캐릭터"
                  width="339"
                  height="485"
                  loading="lazy"
                  decoding="async"
                  aria-hidden="true"
                />
              </div>
            </div>
    
            {/* 펼치기/접기: JS가 활성화되면 hidden 해제 + .is-collapsible 부여 */}
            <button
              className="history__toggle"
              type="button"
              aria-expanded={expanded}
              aria-controls="history-panel"
              onClick={toggleHistory}
            >
              <svg
                className="history__toggle-icon"
                viewBox="0 0 24 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 9l9-6.5L21 9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 17l9-6.5L21 17"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.45"
                />
              </svg>
              <span className="history__toggle-label">{expanded ? "접기" : "펼치기"}</span>
            </button>
          </section>
  );
}

export function JobInterviews() {
  return (
    <div className="band band--job">
            <section className="job" id="job" aria-labelledby="job-title">
              {/* 배경 장식: 우측 가장자리 번짐 (데스크탑 시안에만 노출) */}
              <div className="job__glow" aria-hidden="true"></div>
    
              <div className="job__inner">
                <header className="job__head">
                  <img
                    className="job__logo updown"
                    src="./images/con3_logo.png"
                    alt="붉은 타원형 한미(Hanmi) 로고"
                    width="216"
                    height="193"
                    loading="lazy"
                    decoding="async"
                  />
                  <h2 className="job__title" id="job-title">
                    한미에서는 어떤 일을 할까요?
                  </h2>
                  <p className="job__desc">
                    <span className="job__desc-line"
                      >일의 보람부터 성장의 순간까지, 먼저 경험한 현직자들이
                      솔직하게</span
                    >
                    <span className="job__desc-line">들려드립니다.</span>
                  </p>
                  <img
                    className="job__char leftright"
                    src="./images/con3_char.png"
                    alt="서류 가방을 들고 사원증을 목에 건 보라색 한미 캐릭터"
                    width="560"
                    height="458"
                    loading="lazy"
                    decoding="async"
                  />
                </header>
    
                <ul className="job__list">
                  <li className="job__item">
                    {/* TODO: href 를 실제 현직자 상세 페이지 주소로 교체 */}
                    <a className="job__card" href="#">
                      <figure className="job__card-media">
                        <img
                          src="./images/con3_int1.png"
                          alt="실험 장비가 늘어선 연구실에서 주먹을 쥐어 보이며 웃고 있는 한미약품 품질관리 이건호 사원"
                          width="1100"
                          height="706"
                          loading="lazy"
                          decoding="async"
                        />
                      </figure>
                      <p className="job__card-text">
                        <span className="job__card-line"
                          >정밀한 시험과 분석으로 의약품의 품질을 확인해</span
                        >
                        <span className="job__card-line"
                          >안전하고 신뢰할 수 있는 의약품을 만들어갑니다.</span
                        >
                      </p>
                      <div className="job__card-foot">
                        <p className="job__card-meta">
                          <span className="job__card-team">한미약품 품질관리</span>
                          <span className="job__card-name">이건호 사원</span>
                        </p>
                        <span className="job__card-arrow" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 12h14M13 6l6 6-6 6"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                      <span className="sr-only">이건호 사원 인터뷰 자세히 보기</span>
                    </a>
                  </li>
    
                  <li className="job__item">
                    {/* TODO: href 를 실제 현직자 상세 페이지 주소로 교체 */}
                    <a className="job__card" href="#">
                      <figure className="job__card-media">
                        <img
                          src="./images/con3_int2.png"
                          alt="블라인드가 내려진 창가의 긴 소파에 앉아 미소 짓고 있는 한미약품 전임상연구 박진하 연구원"
                          width="1100"
                          height="706"
                          loading="lazy"
                          decoding="async"
                        />
                      </figure>
                      <p className="job__card-text">
                        <span className="job__card-line"
                          >신약 후보물질의 가능성을 과학적으로 검증해</span
                        >
                        <span className="job__card-line"
                          >새로운 치료제가 환자에게 향하는 첫걸음을 만듭니다.</span
                        >
                      </p>
                      <div className="job__card-foot">
                        <p className="job__card-meta">
                          <span className="job__card-team">한미약품 전임상연구</span>
                          <span className="job__card-name">박진하 연구원</span>
                        </p>
                        <span className="job__card-arrow" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 12h14M13 6l6 6-6 6"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                      <span className="sr-only">박진하 연구원 인터뷰 자세히 보기</span>
                    </a>
                  </li>
                </ul>
    
                {/* TODO: href 를 현직자 목록 페이지 주소로 교체 */}
                <a className="job__cta" href="#">모든 현직자 알아가기!</a>
              </div>
    
              {/* 약병: 첫 번째 카드 좌하단에 걸쳐 놓이는 장식 (모바일 시안에는 없음) */}
              <img
                className="job__bottle updown"
                src="./images/con3_bottle.png"
                alt="한미 로고가 붙은 파란 뚜껑의 약병"
                width="442"
                height="692"
                loading="lazy"
                decoding="async"
              />
            </section>
          </div>
  );
}

export function Innovation() {
  return (
    <div className="band band--innovation">
            <section
              className="innovation"
              id="innovation"
              aria-labelledby="innovation-title"
            >
              <div className="innovation__inner">
                <header className="innovation__head">
                  <h2 className="innovation__title" id="innovation-title">
                    <span className="innovation__title-line">당신의 가능성,</span>
                    <span className="innovation__title-line"
                      >한미그룹에서 더 크게 성장합니다</span
                    >
                  </h2>
                  <p className="innovation__desc">
                    연구와 혁신으로 성장하며 글로벌 제약/바이오 기업을 향해
                    나아갑니다.
                  </p>
                </header>
    
                <div className="innovation__card">
                  {/* 장식: 화학식(뒤) + 원자 모형(앞), 카드 우상단에 걸침 */}
                  <img
                    className="innovation__chem"
                    src="./images/inno_chemical.png"
                    alt=""
                    width="702"
                    height="208"
                    loading="lazy"
                    decoding="async"
                  />
                  <img
                    className="innovation__atom bigsmall"
                    src="./images/inno_molecule1.png"
                    alt=""
                    width="359"
                    height="359"
                    loading="lazy"
                    decoding="async"
                  />
    
                  <ul className="innovation__list">
                    <li className="innovation__item">
                      {/* TODO: href 를 해당 기사 주소로 교체 */}
                      <a
                        className="innovation__bubble innovation__bubble--orange"
                        href="#"
                      >
                        <svg
                          className="innovation__shape"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <rect width="100%" height="100%" rx="1em" />
                        </svg>
                        <svg
                          className="innovation__tail"
                          viewBox="0 0 22 14"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="M8 0C8 7 5 12 0 14H22V0Z" />
                        </svg>
                        <span className="innovation__text"
                          >한미약품, 상반기 누적 매출 8,602억원…2분기 영업이익 117%
                          증가</span
                        >
                      </a>
                    </li>
                    <li className="innovation__item">
                      {/* TODO: href 를 해당 기사 주소로 교체 */}
                      <a
                        className="innovation__bubble innovation__bubble--white"
                        href="#"
                      >
                        <svg
                          className="innovation__shape"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <rect width="100%" height="100%" rx="1em" />
                        </svg>
                        <svg
                          className="innovation__tail"
                          viewBox="0 0 22 14"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="M8 0C8 7 5 12 0 14H22V0Z" />
                        </svg>
                        <span className="innovation__text"
                          ><span className="innovation__line"
                            >“사업형 지주사 경쟁력 입증”…한미사이언스, 2분기
                            영업이익 71%↑</span
                          ><span className="innovation__line"
                            >2분기 매출 3,679억원…상반기 누적 매출 7,216억원
                            돌파</span
                          ></span
                        >
                      </a>
                    </li>
                    <li className="innovation__item">
                      {/* TODO: href 를 해당 기사 주소로 교체 */}
                      <a
                        className="innovation__bubble innovation__bubble--orange"
                        href="#"
                      >
                        <svg
                          className="innovation__shape"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <rect width="100%" height="100%" rx="1em" />
                        </svg>
                        <svg
                          className="innovation__tail"
                          viewBox="0 0 22 14"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="M8 0C8 7 5 12 0 14H22V0Z" />
                        </svg>
                        <span className="innovation__text"
                          >한미약품, 로슈 제넨텍에 비만신약 기술수출…최대 3조
                          2,000억 규모</span
                        >
                      </a>
                    </li>
                    <li className="innovation__item">
                      {/* TODO: href 를 해당 기사 주소로 교체 */}
                      <a
                        className="innovation__bubble innovation__bubble--white"
                        href="#"
                      >
                        <svg
                          className="innovation__shape"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <rect width="100%" height="100%" rx="1em" />
                        </svg>
                        <svg
                          className="innovation__tail"
                          viewBox="0 0 22 14"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="M8 0C8 7 5 12 0 14H22V0Z" />
                        </svg>
                        <span className="innovation__text"
                          >“UCN2 이어 또…” 한미약품, 두 번째 근육 증가 비만신약
                          공개</span
                        >
                      </a>
                    </li>
                    <li className="innovation__item">
                      {/* TODO: href 를 해당 기사 주소로 교체 */}
                      <a
                        className="innovation__bubble innovation__bubble--orange"
                        href="#"
                      >
                        <svg
                          className="innovation__shape"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <rect width="100%" height="100%" rx="1em" />
                        </svg>
                        <svg
                          className="innovation__tail"
                          viewBox="0 0 22 14"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="M8 0C8 7 5 12 0 14H22V0Z" />
                        </svg>
                        <span className="innovation__text"
                          ><span className="innovation__line"
                            >명품 반열 오른 한미 ‘로수젯’…압도적 데이터 경쟁력으로
                            시장 석권</span
                          ><span className="innovation__line"
                            >2년 연속 국내사 개발 전문의약품 시장 ‘1위’…올해 상반기
                            누적 처방액도 선두</span
                          ></span
                        >
                      </a>
                    </li>
                    <li className="innovation__item">
                      {/* TODO: href 를 해당 기사 주소로 교체 */}
                      <a
                        className="innovation__bubble innovation__bubble--white"
                        href="#"
                      >
                        <svg
                          className="innovation__shape"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <rect width="100%" height="100%" rx="1em" />
                        </svg>
                        <svg
                          className="innovation__tail"
                          viewBox="0 0 22 14"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="M8 0C8 7 5 12 0 14H22V0Z" />
                        </svg>
                        <span className="innovation__text"
                          >“비만 넘어 항암으로 혁신 확장”…한미, AACR서 차세대 신약
                          대거 공개</span
                        >
                      </a>
                    </li>
                    <li className="innovation__item">
                      {/* TODO: href 를 해당 기사 주소로 교체 */}
                      <a
                        className="innovation__bubble innovation__bubble--orange"
                        href="#"
                      >
                        <svg
                          className="innovation__shape"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <rect width="100%" height="100%" rx="1em" />
                        </svg>
                        <svg
                          className="innovation__tail"
                          viewBox="0 0 22 14"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="M8 0C8 7 5 12 0 14H22V0Z" />
                        </svg>
                        <span className="innovation__text"
                          >한미 완전두유·케어미, 영양에 ‘맛’까지 인정…국제 우수
                          미각상 수상</span
                        >
                      </a>
                    </li>
                  </ul>
                  <p className="innovation__hint">
                    말풍선을 클릭해서 기사를 확인해 보세요.
                  </p>
                </div>
              </div>
    
              {/* 장식: 좌하단 분자 모형 */}
              <img
                className="innovation__molecule updown"
                src="./images/inno_molecule2.png"
                alt=""
                width="359"
                height="383"
                loading="lazy"
                decoding="async"
              />
            </section>
          </div>
  );
}

export function CompanyLinks() {
  return (
    <section className="con8" aria-label="한미그룹 바로가기">
            <svg className="con8__filters" aria-hidden="true" focusable="false">
              <filter id="con8-remove-black" colorInterpolationFilters="sRGB">
                <feColorMatrix
                  in="SourceGraphic"
                  type="matrix"
                  values="1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          1 0 0 0 0"
                  result="red-opacity"
                />
                <feComposite in="SourceGraphic" in2="red-opacity" operator="in" />
              </filter>
            </svg>
            <img
              className="con8__mascot updown"
              src="./images/con8_char.png"
              alt=""
              width="281"
              height="357"
              loading="lazy"
            />
            <div className="con8__inner">
              <article className="con8__card">
                <a className="con8__link" href="#welfare">
                  <div className="con8__image-wrap">
                    <img
                      className="con8__image"
                      src="./images/con8_img1.jpg"
                      alt=""
                      width="774"
                      height="1000"
                      loading="lazy"
                    />
                  </div>
                  <img
                    className="con8__mark con8__mark--arrow-left"
                    src="./images/con8_image.png"
                    alt=""
                    aria-hidden="true"
                    width="90"
                    height="160"
                  />
                  <img
                    className="con8__mark con8__mark--star"
                    src="./images/con8_Image-2.png"
                    alt=""
                    aria-hidden="true"
                    width="112"
                    height="112"
                  />
                  <div className="con8__caption">
                    <span className="con8__question">
                      한미그룹의
                      <span className="con8__marked-text">
                        문화와 복지가
                        <img
                          className="con8__mark con8__mark--underline"
                          src="./images/con8_Image-1.png"
                          alt=""
                          aria-hidden="true"
                          width="240"
                          height="10"
                        />
                      </span>
                      궁금하다면?
                    </span>
                    <span className="con8__action">
                      한미그룹 YouTube
                      <span className="con8__arrow" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path
                            d="M5 12h14m-6-6 6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </div>
                </a>
              </article>
              <article className="con8__card">
                <a className="con8__link" href="#job">
                  <div className="con8__image-wrap">
                    <img
                      className="con8__image"
                      src="./images/con8_img2.jpg"
                      alt=""
                      width="774"
                      height="1000"
                      loading="lazy"
                    />
                  </div>
                  <img
                    className="con8__mark con8__mark--arrow-right"
                    src="./images/con8_Image-4.png"
                    alt=""
                    aria-hidden="true"
                    width="90"
                    height="158"
                  />
                  <div className="con8__caption">
                    <span className="con8__question">
                      한미그룹의
                      <span className="con8__marked-text"
                        >직무<img
                          className="con8__mark con8__mark--circle"
                          src="./images/con8_Image-3.png"
                          alt=""
                          aria-hidden="true"
                          width="164"
                          height="114" /></span
                      >가 궁금하다면?
                    </span>
                    <span className="con8__action">
                      한미그룹 직무 소개 페이지
                      <span className="con8__arrow" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path
                            d="M5 12h14m-6-6 6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </div>
                </a>
              </article>
              <article className="con8__card">
                <a className="con8__link" href="#requirement">
                  <div className="con8__image-wrap">
                    <img
                      className="con8__image"
                      src="./images/con8_img3.jpg"
                      alt=""
                      width="774"
                      height="1000"
                      loading="lazy"
                    />
                  </div>
                  <div className="con8__caption">
                    <span className="con8__question">
                      한미그룹의
                      <span className="con8__marked-text"
                        >채용소식<img
                          className="con8__mark con8__mark--underline-wide"
                          src="./images/con8_Image-5.png"
                          alt=""
                          aria-hidden="true"
                          width="210"
                          height="20" /></span
                      >을 빠르게 받고 싶다면?
                    </span>
                    <span className="con8__action">
                      한미그룹 채용 홈페이지
                      <span className="con8__arrow" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path
                            d="M5 12h14m-6-6 6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </div>
                </a>
              </article>
            </div>
          </section>
  );
}

export function PageFooter() {
  return (
    <footer className="footer">
          <div className="footer__inner">
            <img
              className="footer__logo"
              src="./images/logo_svg.svg"
              alt="Hanmi 한미그룹"
              width="182"
              height="31"
              loading="lazy"
            />
          </div>
        </footer>
  );
}
