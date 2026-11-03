import { Fragment, useEffect, useRef, useState } from "react";
import benefitsData from "../data/benefits.json";
import campusSchedules from "../data/campus_schedule.json";
import popupJobs from "../data/pop_data.json";
import taskCategories from "../data/task_data.json";

const applicationDeadline = new Date("2026-10-18T23:59:00+09:00").getTime();
const taskLocations = new Set([
  "연구센터 (경기도 동탄)",
  "제제연구소 [의약혁신센터] (경기도 광교)",
  "팔탄제조센터 (경기도 화성)",
  "평택제조센터 (경기도 평택)",
  "전국 (Mobile Office)",
  "본사 (서울시 송파구)",
  "서울/수도권/영남",
]);
const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];
const campusRegions = ["서울", "경기", "강원", "경상", "충청", "전라"];
const fairDays = [
  { date: "8월 31일 (월)", venues: ["KAIST"] },
  { date: "9월 1일 (화)", venues: ["서울대학교", "서강대학교", "연세대학교"] },
  { date: "9월 2일 (수)", venues: ["UNIST", "한양대학교"] },
  { date: "9월 3일 (목)", venues: ["GIST"] },
  { date: "9월 4일 (금)", venues: ["고려대학교", "성균관대학교(자연)"] },
  { date: "9월 7일 (월)", venues: ["KIST", "동국대학교"] },
  { date: "9월 8일 (화)", venues: ["이화여자대학교", "중견기업박람회(대전)"] },
  { date: "9월 9일 (수)", venues: ["POSTECH"] },
  { date: "", venues: [] },
  { date: "10월 7일 (수)", venues: ["서울고용센터"] },
];

function getTimeRemaining() {
  const totalSeconds = Math.floor((applicationDeadline - Date.now()) / 1000);
  if (totalSeconds <= 0) return null;

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0"),
    seconds: String(totalSeconds % 60).padStart(2, "0"),
  };
}

function getTaskGroups(category) {
  const groups = [];
  category.items.forEach((item) => {
    if (taskLocations.has(item)) {
      groups.push({ label: item, roles: [] });
    } else {
      groups.at(-1)?.roles.push(item);
    }
  });
  return groups;
}

function parseCampusDate(value) {
  const match = /^(\d{1,2})월\s*(\d{1,2})일\s*\(([월화수목금토일])\)$/.exec(value);
  if (!match) throw new Error(`잘못된 캠퍼스 일정 날짜: ${value}`);
  const date = new Date(Date.UTC(2026, Number(match[1]) - 1, Number(match[2])));
  if (
    date.getUTCMonth() !== Number(match[1]) - 1 ||
    date.getUTCDate() !== Number(match[2]) ||
    weekdayNames[date.getUTCDay()] !== match[3]
  ) {
    throw new Error(`캠퍼스 일정 날짜와 요일이 일치하지 않습니다: ${value}`);
  }
  return date;
}

function getCampusWeeks(region) {
  const schedules = campusSchedules
    .filter((item) => item.region === region)
    .map((item) => ({ item, date: parseCampusDate(item.date) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  if (!schedules.length) return [];

  const lastDate = schedules[schedules.length - 1].date;
  const weeks = new Map();
  schedules.forEach((entry) => {
    const monday = new Date(entry.date.getTime());
    const daysFromMonday = (monday.getUTCDay() + 6) % 7;
    monday.setUTCDate(monday.getUTCDate() - daysFromMonday);
    const key = monday.getTime();
    if (!weeks.has(key)) weeks.set(key, []);
    weeks.get(key).push(entry);
  });

  return Array.from(weeks.entries())
    .sort(([first], [second]) => first - second)
    .map(([weekStartTime, entries]) => {
      const weekStart = new Date(weekStartTime);
      const finalDay = new Date(weekStartTime);
      finalDay.setUTCDate(finalDay.getUTCDate() + 4);
      if (lastDate < finalDay) finalDay.setTime(lastDate.getTime());
      const entriesByDate = new Map();
      entries.forEach((entry) => {
        const key = entry.date.getTime();
        if (!entriesByDate.has(key)) entriesByDate.set(key, []);
        entriesByDate.get(key).push({
          name: entry.item.university,
          location: entry.item.location,
          time: entry.item.time,
        });
      });

      const days = [];
      for (
        let date = new Date(weekStart);
        date <= finalDay;
        date.setUTCDate(date.getUTCDate() + 1)
      ) {
        days.push({
          date: `${date.getUTCMonth() + 1}월 ${date.getUTCDate()}일 (${weekdayNames[date.getUTCDay()]})`,
          venues: [],
          campuses: entriesByDate.get(date.getTime()) ?? [],
        });
      }
      return days;
    });
}

function CalendarDay({ day, expandedCampus, onToggleCampus }) {
  const campuses = day.campuses ?? [];
  const venues = day.venues ?? [];
  const className = [
    "exposition__day",
    !day.date && "exposition__day--empty",
    !venues.length && !campuses.length && "exposition__day--no-venue",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={className}>
      <h3 className="exposition__date">{day.date || "\u00a0"}</h3>
      <ul className="exposition__venues">
        {venues.map((venue) => <li key={venue}>{venue}</li>)}
        {campuses.map((campus, index) => {
          const detailId = `exposition-campus-detail-${day.date.replace(/\D/g, "")}-${index}`;
          const expanded = expandedCampus === detailId;
          return (
            <li
              className={`exposition__campus-entry${expanded ? " exposition__campus-entry--expanded" : ""}`}
              key={`${campus.name}-${index}`}
            >
              <button
                className="exposition__campus-name"
                type="button"
                aria-expanded={expanded}
                aria-controls={detailId}
                onClick={() => onToggleCampus(detailId)}
              >
                {campus.name}
              </button>
              <div
                className={`exposition__campus-detail${expanded ? " is-visible" : ""}`}
                id={detailId}
                role="group"
                aria-label={`${campus.name} 상세 일정`}
                aria-hidden={!expanded}
                inert={!expanded}
                tabIndex="-1"
              >
                <div className="exposition__campus-detail-item">
                  <span className="exposition__campus-detail-label">
                    <svg className="exposition__campus-detail-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    장소
                  </span>
                  <span className="exposition__campus-detail-value">{campus.location}</span>
                </div>
                <div className="exposition__campus-detail-item">
                  <span className="exposition__campus-detail-label">
                    <svg className="exposition__campus-detail-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    시간
                  </span>
                  <span className="exposition__campus-detail-value">{campus.time}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

function JobDetailList({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className="tasks-modal__section">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

export function Welfare() {
  return (
    <section className="welfare" id="welfare" aria-labelledby="welfare-title">
            <div className="welfare__inner">
              <header className="welfare__head">
                <h2 className="welfare__title" id="welfare-title">
                  한미 생활을 더 즐겁게 만드는 방법
                </h2>
                <p className="welfare__desc">
                  건강부터 성장, 휴식까지 알차게 준비한 복지를 소개할게요.
                </p>
                <img
                  className="welfare__mascot updown"
                  src="./images/con5_char.png"
                  alt="복지를 소개하는 한미 캐릭터"
                  width="411"
                  height="414"
                  loading="lazy"
                  decoding="async"
                />
              </header>
    
              <div className="welfare__scroll" role="region" aria-label="?? ?? ??">
                {benefitsData.benefits.map((group) => (
                  <Fragment key={group.group_title}>
                    <div className="welfare__lead">
                      <h3 className="welfare__highlight">
                        {group.heading_emoji ? group.heading_emoji + " " : ""}{group.group_title}
                      </h3>
                      <p className="welfare__lead-desc">{group.group_description}</p>
                    </div>
                    <ul className="welfare__list">
                      {group.items.map((item) => (
                        <li key={item.title}>
                          <article className="welfare__card">
                            <div>
                              <h4 className="welfare__card-title">{item.title}</h4>
                              <p className="welfare__card-desc">{item.description}</p>
                            </div>
                            <img
                              className="welfare__icon"
                              src={item.icon}
                              alt={item.icon_alt}
                              width="68"
                              height="68"
                              loading="lazy"
                              decoding="async"
                            />
                          </article>
                        </li>
                      ))}
                    </ul>
                  </Fragment>
                ))}
              </div>
            </div>
            <img
              className="welfare__cloud"
              src="./images/con5_cloud.png"
              alt="한미의 보라색 캐릭터"
              width="335"
              height="210"
              loading="lazy"
              decoding="async"
            />
          </section>
  );
}

export function Tasks() {
  const [activeJobKey, setActiveJobKey] = useState(taskCategories[0].jobKey);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const dialogRef = useRef(null);
  const activeCategory = taskCategories.find(
    (category) => category.jobKey === activeJobKey,
  );
  const groups = getTaskGroups(activeCategory);

  useEffect(() => {
    if (selectedJob && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, [selectedJob]);

  const handleTabKeyDown = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = taskCategories.findIndex(
      (category) => category.jobKey === activeJobKey,
    );
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (index + direction + taskCategories.length) % taskCategories.length;
    const nextCategory = taskCategories[nextIndex];
    setActiveJobKey(nextCategory.jobKey);
    event.currentTarget
      .querySelector(`[data-job-key="${nextCategory.jobKey}"]`)
      ?.focus();
    setExpandedGroup(null);
  };

  const closeDialog = () => {
    dialogRef.current?.close();
    setSelectedJob(null);
  };

  return (
    <section className="tasks" id="tasks" aria-labelledby="tasks-title">
            <div className="tasks__hero">
              <img
                className="tasks__brand-bg"
                src="./images/tasks_bg_title.png"
                alt=""
                aria-hidden="true"
              />
              <div className="tasks__stage">
                <iframe
                  className="tasks__character"
                  src="./hanmi-reading-eye-tracking/embed.html?tracking=desktop"
                  title="돋보기를 들고 직무를 살펴보는 한미 캐릭터"
                  loading="lazy"
                ></iframe>
              </div>
              <header className="tasks__intro">
                <h2 className="tasks__title" id="tasks-title">
                  알약이를 따라<br />나에게 맞는 직무를 찾아봐요!
                </h2>
                <p className="tasks__description">
                  연구부터 생산, 영업, 경영지원까지 당신의 가능성이 빛날 자리를
                  안내해 드릴게요.
                </p>
              </header>
            </div>
    
            <div className="tasks__content">
              <div
                className="tasks__tabs"
                role="tablist"
                aria-label="직무 분야"
                onKeyDown={handleTabKeyDown}
              >
                <button
                  className="tasks__tab"
                  type="button"
                  role="tab"
                  id="tasks-tab-rnd"
                  aria-selected={activeJobKey === "rnd"}
                  tabIndex={activeJobKey === "rnd" ? 0 : -1}
                  data-category="R&amp;D"
                  data-job-key="rnd"
                  onClick={() => { setActiveJobKey("rnd"); setExpandedGroup(null); }}
                >
                  R&amp;D
                </button>
                <button
                  className="tasks__tab"
                  type="button"
                  role="tab"
                  id="tasks-tab-production"
                  aria-selected={activeJobKey === "prod"}
                  tabIndex={activeJobKey === "prod" ? 0 : -1}
                  data-category="생산/품질"
                  data-job-key="prod"
                  onClick={() => { setActiveJobKey("prod"); setExpandedGroup(null); }}
                >
                  생산/품질
                </button>
                <button
                  className="tasks__tab"
                  type="button"
                  role="tab"
                  id="tasks-tab-sales"
                  aria-selected={activeJobKey === "sales"}
                  tabIndex={activeJobKey === "sales" ? 0 : -1}
                  data-category="영업"
                  data-job-key="sales"
                  onClick={() => { setActiveJobKey("sales"); setExpandedGroup(null); }}
                >
                  영업
                </button>
                <button
                  className="tasks__tab"
                  type="button"
                  role="tab"
                  id="tasks-tab-management"
                  aria-selected={activeJobKey === "mps"}
                  tabIndex={activeJobKey === "mps" ? 0 : -1}
                  data-category="경영관리"
                  data-job-key="mps"
                  onClick={() => { setActiveJobKey("mps"); setExpandedGroup(null); }}
                >
                  경영관리
                </button>
                <button
                  className="tasks__tab"
                  type="button"
                  role="tab"
                  id="tasks-tab-clinical"
                  aria-selected={activeJobKey === "cl"}
                  tabIndex={activeJobKey === "cl" ? 0 : -1}
                  data-category="임상"
                  data-job-key="cl"
                  onClick={() => { setActiveJobKey("cl"); setExpandedGroup(null); }}
                >
                  임상
                </button>
                <button
                  className="tasks__tab"
                  type="button"
                  role="tab"
                  id="tasks-tab-global"
                  aria-selected={activeJobKey === "global"}
                  tabIndex={activeJobKey === "global" ? 0 : -1}
                  data-category="글로벌"
                  data-job-key="global"
                  onClick={() => { setActiveJobKey("global"); setExpandedGroup(null); }}
                >
                  글로벌
                </button>
                <button
                  className="tasks__tab"
                  type="button"
                  role="tab"
                  id="tasks-tab-healthcare"
                  aria-selected={activeJobKey === "healthcare"}
                  tabIndex={activeJobKey === "healthcare" ? 0 : -1}
                  data-category="헬스케어"
                  data-job-key="healthcare"
                  onClick={() => { setActiveJobKey("healthcare"); setExpandedGroup(null); }}
                >
                  헬스케어
                </button>
              </div>
              <div className="tasks__groups" id="tasks-groups" aria-live="polite">
                {groups.map((group, groupIndex) => {
                  const panelId = `tasks-panel-${activeJobKey}-${groupIndex}`;
                  const isExpanded = expandedGroup === groupIndex;
                  return (
                    <section className="tasks__group" key={panelId}>
                      <button
                        className="tasks__group-toggle"
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={panelId}
                        onClick={() =>
                          setExpandedGroup(isExpanded ? null : groupIndex)
                        }
                      >
                        <span className="tasks__group-label">{group.label}</span>
                        <span className="tasks__count">{group.roles.length}</span>
                      </button>
                      <div
                        className={`tasks__panel${isExpanded ? " is-open" : ""}`}
                        id={panelId}
                        aria-hidden={!isExpanded}
                        inert={!isExpanded}
                      >
                        <div className="tasks__panel-inner">
                          <div className="tasks__cards">
                            {group.roles.map((role) => {
                              const job = popupJobs.find(
                                (item) =>
                                  item.department === activeCategory.tabName &&
                                  item.title === role,
                              );
                              return (
                                <button
                                  className="tasks__role"
                                  type="button"
                                  key={`${group.label}-${role}`}
                                  data-role={role}
                                  data-group={group.label}
                                  data-popup-id={job?.id ?? ""}
                                  onClick={() => job && setSelectedJob(job)}
                                >
                                  <span className="tasks__role-name">{role}</span>
                                  <svg
                                    className="tasks__role-arrow"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M4 12h15m-6-6 6 6-6 6"
                                      stroke="currentColor"
                                      strokeWidth="1.7"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
    
            <dialog
              className="tasks-modal"
              id="tasks-modal"
              aria-labelledby="tasks-modal-title"
              ref={dialogRef}
              onClose={() => setSelectedJob(null)}
              onClick={(event) => {
                if (event.target === dialogRef.current) closeDialog();
              }}
            >
              <div className="tasks-modal__visual">
                <img
                  src={selectedJob?.image ?? "./images/tasks_rnd_bg.jpg"}
                  alt={selectedJob ? `${selectedJob.title} 직무 이미지` : "연구실 현미경과 실험 장갑"}
                  width="800"
                  height="180"
                />
                <button
                  className="tasks-modal__close"
                  type="button"
                  aria-label="직무 상세 닫기"
                  onClick={closeDialog}
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 5l14 14M19 5L5 19"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="tasks-modal__body" id="tasks-modal-body">
                {selectedJob && (
                  <>
                    <div className="tasks-modal__summary">
                      <div className="tasks-modal__heading">
                        <h2 className="tasks-modal__title" id="tasks-modal-title">
                          {selectedJob.title}
                        </h2>
                        <span className="tasks-modal__category">
                          {selectedJob.department}
                        </span>
                        <span className="tasks-modal__group">
                          {selectedJob.location}
                        </span>
                      </div>
                      <p className="tasks-modal__level">{selectedJob.category}</p>
                    </div>
                    <div className="tasks-modal__content">
                      <JobDetailList title="직무 내용" items={selectedJob.job_description} />
                      <JobDetailList title="자격요건" items={selectedJob.qualifications} />
                      <JobDetailList title="우대사항" items={selectedJob.preferred} />
                    </div>
                  </>
                )}
              </div>
            </dialog>
          </section>
  );
}

export function Requirements() {
  const [selectedTab, setSelectedTab] = useState("eligibility");
  const handleTabKeyDown = (event) => {
    const tabs = ["eligibility", "process"];
    const index = tabs.indexOf(selectedTab);
    const nextIndex =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : index;
    if (nextIndex === index) return;
    event.preventDefault();
    const nextTab = tabs[nextIndex];
    setSelectedTab(nextTab);
    document.getElementById(`requirement-tab-${nextTab}`)?.focus();
  };

  return (
    <section
            className="requirement"
            id="requirement"
            aria-labelledby="requirement-title"
          >
            <h2 className="requirement__title" id="requirement-title">
              한미그룹과 함께하는 문은<br />활짝 열려 있습니다
            </h2>
            <img
              className="requirement__bulb updown"
              src="./images/require_bulb.png"
              alt=""
              width="360"
              height="456"
              loading="lazy"
              decoding="async"
            />
    
            <div className="requirement__tabs" role="tablist" aria-label="채용 안내">
              <button
                className="requirement__tab"
                type="button"
                role="tab"
                id="requirement-tab-eligibility"
                aria-controls="requirement-panel-eligibility"
                aria-selected={selectedTab === "eligibility"}
                tabIndex={selectedTab === "eligibility" ? 0 : -1}
                onClick={() => setSelectedTab("eligibility")}
                onKeyDown={handleTabKeyDown}
              >
                지원자격
              </button>
              <button
                className="requirement__tab"
                type="button"
                role="tab"
                id="requirement-tab-process"
                aria-controls="requirement-panel-process"
                aria-selected={selectedTab === "process"}
                tabIndex={selectedTab === "process" ? 0 : -1}
                onClick={() => setSelectedTab("process")}
                onKeyDown={handleTabKeyDown}
              >
                전형절차 및 접수방법
              </button>
            </div>
    
            <div
              className="requirement__panel"
              id="requirement-panel-eligibility"
              role="tabpanel"
              aria-labelledby="requirement-tab-eligibility"
              tabIndex="0"
              hidden={selectedTab !== "eligibility"}
            >
              <div className="requirement__eligibility">
                <article className="requirement__item">
                  <img
                    src="./images/require_ico_calendar_3d.png"
                    alt=""
                    width="169"
                    height="200"
                    loading="lazy"
                    decoding="async"
                  />
                  <h3>27년 1월 입사가 가능한 자</h3>
                </article>
                <article className="requirement__item">
                  <img
                    src="./images/require_ico_gradcap_3d.png"
                    alt=""
                    width="244"
                    height="200"
                    loading="lazy"
                    decoding="async"
                  />
                  <h3>기졸업자 또는 27년 2월 졸업 예정자</h3>
                </article>
              </div>
              <ul className="requirement__notes">
                <li>남성의 경우 병역을 마쳤거나 면제인 분</li>
                <li>해외여행 (또는 해외 출장)에 결격사유가 없는 분</li>
                <li>취업보호대상자는 관련 법령에 의거하여 우대</li>
              </ul>
              <p className="requirement__notice">
                모집 직무별로 지원자격이 상이하오니 반드시
                <strong>채용 공고</strong>를 확인해 주시기 바랍니다.
              </p>
            </div>
    
            <div
              className="requirement__panel"
              id="requirement-panel-process"
              role="tabpanel"
              aria-labelledby="requirement-tab-process"
              tabIndex="0"
              hidden={selectedTab !== "process"}
            >
              <div className="requirement__process">
                <section
                  className="requirement__process-group"
                  aria-labelledby="requirement-sales-title"
                >
                  <h3 id="requirement-sales-title">영업직군</h3>
                  <ol className="requirement__steps">
                    <li className="requirement__step">
                      <span className="requirement__step-icon" aria-hidden="true"
                        >🗓️</span
                      >
                      <span className="requirement__step-title">지원접수</span>
                      <span className="requirement__step-date">9.28~10.18</span>
                    </li>
                    <li className="requirement__step">
                      <span className="requirement__step-icon" aria-hidden="true"
                        >📄</span
                      >
                      <span className="requirement__step-title">서류전형</span>
                      <span className="requirement__step-date">10.19~10.20</span>
                    </li>
                    <li className="requirement__step">
                      <span className="requirement__step-icon" aria-hidden="true"
                        >🔍</span
                      >
                      <span className="requirement__step-title">AI역량검사</span>
                      <span className="requirement__step-date">10.21~10.25</span>
                    </li>
                    <li className="requirement__step">
                      <span className="requirement__step-icon" aria-hidden="true"
                        >👤</span
                      >
                      <span className="requirement__step-title">1차면접</span>
                      <span className="requirement__step-date">11월 중</span>
                    </li>
                    <li className="requirement__step">
                      <span className="requirement__step-icon" aria-hidden="true"
                        >📍</span
                      >
                      <span className="requirement__step-title">현장체험</span>
                      <span className="requirement__step-date">12월 초</span>
                    </li>
                    <li className="requirement__step">
                      <span className="requirement__step-icon" aria-hidden="true"
                        >💬</span
                      >
                      <span className="requirement__step-title">2차면접</span>
                      <span className="requirement__step-date">12월 중</span>
                    </li>
                    <li className="requirement__step">
                      <span className="requirement__step-icon" aria-hidden="true"
                        >🏢</span
                      >
                      <span className="requirement__step-title">교육전형</span>
                      <span className="requirement__step-date">27.1~</span>
                    </li>
                  </ol>
                </section>
                <section
                  className="requirement__process-group"
                  aria-labelledby="requirement-other-title"
                >
                  <h3 id="requirement-other-title">영업 외 전직군</h3>
                  <ol className="requirement__steps">
                    <li className="requirement__step">
                      <span className="requirement__step-icon" aria-hidden="true"
                        >🗓️</span
                      >
                      <span className="requirement__step-title">지원접수</span>
                      <span className="requirement__step-date">9.28~10.18</span>
                    </li>
                    <li className="requirement__step">
                      <span className="requirement__step-icon" aria-hidden="true"
                        >📄</span
                      >
                      <span className="requirement__step-title">서류전형</span>
                      <span className="requirement__step-date">10.19~10.20</span>
                    </li>
                    <li className="requirement__step">
                      <span className="requirement__step-icon" aria-hidden="true"
                        >🔍</span
                      >
                      <span className="requirement__step-title">AI역량검사</span>
                      <span className="requirement__step-date">10.21~10.25</span>
                    </li>
                    <li className="requirement__step">
                      <span className="requirement__step-icon" aria-hidden="true"
                        >👤</span
                      >
                      <span className="requirement__step-title">1차면접</span>
                      <span className="requirement__step-date">11월 중</span>
                    </li>
                    <li className="requirement__step">
                      <span className="requirement__step-icon" aria-hidden="true"
                        >💬</span
                      >
                      <span className="requirement__step-title">2차면접</span>
                      <span className="requirement__step-date">12월 중</span>
                    </li>
                    <li className="requirement__step">
                      <span className="requirement__step-icon" aria-hidden="true"
                        >🏢</span
                      >
                      <span className="requirement__step-title">입사</span>
                      <span className="requirement__step-date"
                        >27.1~<br />(경력직 협의 가능)</span
                      >
                    </li>
                  </ol>
                </section>
              </div>
              <ul className="requirement__process-notes">
                <li>
                  상기 일정은 상황에 따라 변경될 수 있으며 각 전형별 상세 일정은
                  대상자에 한해 개별 안내 예정입니다.
                </li>
                <li>
                  입사지원서에 허위 기재가 있거나 제출서류가 허위로 판명되는 경우,
                  또는 입사 이후 자격 미확보 및 상실하는 경우는 입사가 취소될 수
                  있습니다.
                </li>
                <li>
                  지원서 제출 후에는 수정이 절대 불가하오니, 주의하시기 바랍니다.
                </li>
                <li>
                  전형단계별 결과는 E-Mail 및 SMS를 통하여 안내하오니 E-Mail 주소 및
                  휴대전화 번호를 정확히 기재해주시기 바랍니다.
                </li>
                <li>
                  입사 후 3개월간 수습기간이 적용되며, 수습 기간 중 성적이
                  불량하거나 직무 수행 능력이 부족하다고 판단되는 경우 입사가 취소될
                  수 있습니다.
                </li>
              </ul>
            </div>
          </section>
  );
}

export function Exposition() {
  const [selectedTab, setSelectedTab] = useState("fair");
  const [selectedRegion, setSelectedRegion] = useState(campusRegions[0]);
  const [expandedCampus, setExpandedCampus] = useState(null);
  const regionIndex = campusRegions.indexOf(selectedRegion);
  const regionId = `exposition-region-${[
    "seoul",
    "gyeonggi",
    "gangwon",
    "gyeongsang",
    "chungcheong",
    "jeolla",
  ][regionIndex]}`;
  const campusWeeks = getCampusWeeks(selectedRegion);

  const handleTabKeyDown = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextTab = selectedTab === "fair" ? "campus" : "fair";
    setSelectedTab(nextTab);
    document.getElementById(`exposition-tab-${nextTab}`)?.focus();
  };

  const handleRegionKeyDown = (event) => {
    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? campusRegions.length - 1
          : (regionIndex + direction + campusRegions.length) % campusRegions.length;
    if (!direction && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    setSelectedRegion(campusRegions[nextIndex]);
    setExpandedCampus(null);
    document.getElementById(
      `exposition-region-${["seoul", "gyeonggi", "gangwon", "gyeongsang", "chungcheong", "jeolla"][nextIndex]}`,
    )?.focus();
  };

  return (
    <section
            className="exposition"
            id="exposition"
            aria-labelledby="exposition-title"
          >
            <div className="exposition__hero">
              <img
                className="exposition__character updown"
                src="./images/expo_char.png"
                alt=""
                width="698"
                height="602"
                loading="lazy"
                decoding="async"
              />
              <div className="exposition__intro">
                <h2 className="exposition__title" id="exposition-title">
                  Hanmi 박람회/캠퍼스로 출발!
                </h2>
                <p className="exposition__description">
                  한미그룹이 여러분을 만나러 박람회와 캠퍼스로 찾아갑니다.<br />
                  우리가 어디서 만날지 궁금하다면 아래 지역에서 찾아보세요!
                </p>
                <p className="exposition__description-note">
                  <span aria-hidden="true">●</span>
                  지역을 선택하면 캠퍼스 방문 일정을 확인하실 수 있습니다.
                </p>
              </div>
            </div>
    
            <div className="exposition__tabs" role="tablist" aria-label="일정 유형" onKeyDown={handleTabKeyDown}>
              <button
                className="exposition__tab"
                type="button"
                role="tab"
                id="exposition-tab-fair"
                aria-controls="exposition-panel-fair"
                aria-selected={selectedTab === "fair"}
                tabIndex={selectedTab === "fair" ? 0 : -1}
                onClick={() => setSelectedTab("fair")}
              >
                박람회
              </button>
              <button
                className="exposition__tab"
                type="button"
                role="tab"
                id="exposition-tab-campus"
                aria-controls="exposition-panel-campus"
                aria-selected={selectedTab === "campus"}
                tabIndex={selectedTab === "campus" ? 0 : -1}
                onClick={() => setSelectedTab("campus")}
              >
                캠퍼스
              </button>
            </div>
    
            <div
              className="exposition__panel"
              id="exposition-panel-fair"
              role="tabpanel"
              aria-labelledby="exposition-tab-fair"
              tabIndex="0"
              hidden={selectedTab !== "fair"}
            >
              <div
                className="exposition__week-list"
                id="exposition-fair-calendar"
                aria-live="polite"
              >
                <div className="exposition__calendar">
                  {fairDays.map((day) => (
                    <CalendarDay key={day.date || "empty"} day={day} />
                  ))}
                </div>
              </div>
            </div>
    
            <div
              className="exposition__panel"
              id="exposition-panel-campus"
              role="tabpanel"
              aria-labelledby="exposition-tab-campus"
              tabIndex="0"
              hidden={selectedTab !== "campus"}
            >
              <div
                className="exposition__region-list"
                role="tablist"
                aria-label="캠퍼스 방문 지역"
                onKeyDown={handleRegionKeyDown}
              >
                {campusRegions.map((region, index) => {
                  const key = ["seoul", "gyeonggi", "gangwon", "gyeongsang", "chungcheong", "jeolla"][index];
                  return (
                    <button
                      className="exposition__region"
                      type="button"
                      role="tab"
                      id={`exposition-region-${key}`}
                      aria-controls="exposition-campus-calendar"
                      aria-selected={selectedRegion === region}
                      tabIndex={selectedRegion === region ? 0 : -1}
                      data-region={key}
                      key={region}
                      onClick={() => {
                        setSelectedRegion(region);
                        setExpandedCampus(null);
                      }}
                    >
                      {region}
                    </button>
                  );
                })}
              </div>
              <div
                className="exposition__campus-calendar"
                id="exposition-campus-calendar"
                role="tabpanel"
                aria-labelledby={regionId}
                aria-live="polite"
                tabIndex="0"
              >
                {campusWeeks.length ? (
                  campusWeeks.map((week, weekIndex) => (
                    <div className="exposition__calendar" key={`${selectedRegion}-${weekIndex}`}>
                      {week.map((day) => (
                        <CalendarDay
                          key={day.date}
                          day={day}
                          expandedCampus={expandedCampus}
                          onToggleCampus={(detailId) =>
                            setExpandedCampus((current) =>
                              current === detailId ? null : detailId,
                            )
                          }
                        />
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="exposition__empty">해당 지역의 캠퍼스 일정이 없습니다.</p>
                )}
              </div>
            </div>
          </section>
  );
}

export function Countdown() {
  const [remaining, setRemaining] = useState(getTimeRemaining);
  const expired = remaining === null;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(getTimeRemaining());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="con9" aria-labelledby="con9-title">
            <h2 className="con9__title" id="con9-title">
              당신에게 딱 맞는 자리를 찾으러 출발!
            </h2>
            <p className="con9__countdown" id="con9-countdown" aria-live="off" hidden={expired}>
              <span className="con9__countdown-item">
                <span className="con9__countdown-number" data-countdown-days>{remaining?.days ?? 0}</span>일
              </span>
              <span className="con9__countdown-item">
                <span className="con9__countdown-number" data-countdown-hours>{remaining?.hours ?? "00"}</span
                >시간
              </span>
              <span className="con9__countdown-item">
                <span className="con9__countdown-number" data-countdown-minutes>{remaining?.minutes ?? "00"}</span
                >분
              </span>
              <span className="con9__countdown-item">
                <span className="con9__countdown-number" data-countdown-seconds>{remaining?.seconds ?? "00"}</span
                >초 남았어요
              </span>
            </p>
            <p className="con9__expired" id="con9-expired" role="status" hidden={!expired}>
              지원 기간이 종료되었습니다.
            </p>
            <a
              className="con9__earth-link"
              href="#requirement"
              aria-label="지원 자격 및 접수 안내 확인하기"
            >
              <img
                className="con9__earth"
                src="./images/con9_earth.png"
                alt=""
                width="444"
                height="444"
              />
              <span className="con9__apply">
                지원하기
                <span className="con9__apply-arrow" aria-hidden="true">
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
            </a>
            <p className="con9__note">아이콘을 클릭해서 지원해주세요!</p>
            <img
              className="con9__cloud con9__cloud--left"
              src="./images/con9_cloud_l.png"
              alt=""
              width="657"
              height="309"
              loading="lazy"
            />
            <img
              className="con9__cloud con9__cloud--right"
              src="./images/con9_cloud_r.png"
              alt=""
              width="450"
              height="383"
              loading="lazy"
            />
          </section>
  );
}
