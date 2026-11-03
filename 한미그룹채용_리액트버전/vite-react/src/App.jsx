import { useEffect } from "react";
import {
  CompanyLinks,
  Future,
  Hero,
  History,
  Innovation,
  JobInterviews,
  PageFooter,
  PageHeader,
} from "./components/StaticSections.jsx";
import {
  Countdown,
  Exposition,
  Requirements,
  Tasks,
  Welfare,
} from "./components/InteractiveSections.jsx";

const revealSelectors = [
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

function usePageEffects() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;

    let previousY = window.scrollY;
    let direction = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          } else if (direction < 0) {
            entry.target.classList.remove("is-revealed");
          }
        });
      },
      { rootMargin: "0px 0px -45% 0px" },
    );

    document
      .querySelectorAll(revealSelectors.join(", "))
      .forEach((element) => {
        element.classList.add("scroll-reveal");
        observer.observe(element);
      });

    const trackDirection = () => {
      const currentY = window.scrollY;
      const delta = currentY - previousY;
      if (Math.abs(delta) > 1) direction = Math.sign(delta);
      previousY = currentY;
    };
    window.addEventListener("scroll", trackDirection, { passive: true });

    return () => {
      window.removeEventListener("scroll", trackDirection);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const preventEmptyLinks = (event) => {
      const link = event.target.closest('a[href="#"]');
      if (link) event.preventDefault();
    };
    document.addEventListener("click", preventEmptyLinks);
    return () => document.removeEventListener("click", preventEmptyLinks);
  }, []);
}

export default function App() {
  usePageEffects();

  return (
    <>
      <PageHeader />
      <main>
        <Hero />
        <Future />
        <History />
        <JobInterviews />
        <Innovation />
        <Welfare />
        <Tasks />
        <Requirements />
        <Exposition />
        <CompanyLinks />
        <Countdown />
      </main>
      <PageFooter />
    </>
  );
}
