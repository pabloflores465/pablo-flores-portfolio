const revealItems = document.querySelectorAll(".reveal");
const yearNode = document.querySelector("#year");
const navLinks = Array.from(document.querySelectorAll(".section-nav a"));
const cursorGlow = document.querySelector(".cursor-glow");
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.14
  }
);

revealItems.forEach((item) => observer.observe(item));

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
  });
};

if (sections.length > 0) {
  const updateActiveSection = () => {
    const offset = window.innerHeight * 0.32;
    let currentId = sections[0].id;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) {
        currentId = section.id;
      }
    });

    setActiveLink(currentId);
  };

  updateActiveSection();
  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);
  window.addEventListener("hashchange", updateActiveSection);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("href")?.replace("#", "");

      if (id) {
        setActiveLink(id);
      }
    });
  });
}

if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let glowX = targetX;
  let glowY = targetY;

  const renderCursor = () => {
    glowX += (targetX - glowX) * 0.12;
    glowY += (targetY - glowY) * 0.12;

    cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;

    window.requestAnimationFrame(renderCursor);
  };

  window.addEventListener("pointermove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    document.body.classList.add("cursor-active");
  });

  document.addEventListener("mouseleave", () => {
    document.body.classList.remove("cursor-active");
  });

  renderCursor();
}

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const animatedDetails = Array.from(document.querySelectorAll(".entry-details"));
const detailsEasing = "cubic-bezier(0.22, 1, 0.36, 1)";

const updateDetailCardState = (details) => {
  const card = details.closest(".timeline-card, .education-card, .project-card, .certification-card");

  if (card) {
    card.classList.toggle("details-open", details.open);
  }
};

const finishDetailsAnimation = (details) => {
  details.dataset.animating = "false";
  details.classList.remove("is-animating");
  details.style.height = "";
  details.style.overflow = "";
  details.style.transition = "";
  delete details.dataset.animationDirection;
};

const animateDetailsHeight = (details, startHeight, endHeight, duration, onFinish) => {
  details.style.height = startHeight;
  details.style.transition = `height ${duration}ms ${detailsEasing}`;
  details.getBoundingClientRect();

  window.requestAnimationFrame(() => {
    details.style.height = endHeight;
  });

  const handleTransitionEnd = (event) => {
    if (event.propertyName !== "height") {
      return;
    }

    details.removeEventListener("transitionend", handleTransitionEnd);
    onFinish();
  };

  details.addEventListener("transitionend", handleTransitionEnd);
};

const toggleDetails = (details) => {
  const isReducedMotion = motionQuery.matches;

  if (details.dataset.animating === "true") {
    return;
  }

  if (isReducedMotion) {
    details.open = !details.open;
    updateDetailCardState(details);
    return;
  }

  const summary = details.querySelector("summary");

  if (!summary) {
    details.open = !details.open;
    updateDetailCardState(details);
    return;
  }

  details.dataset.animating = "true";
  details.classList.add("is-animating");
  details.style.overflow = "hidden";

  if (details.open) {
    const startHeight = `${details.offsetHeight}px`;
    const endHeight = `${summary.offsetHeight}px`;
    details.dataset.animationDirection = "closing";

    animateDetailsHeight(details, startHeight, endHeight, 320, () => {
      details.open = false;
      updateDetailCardState(details);
      finishDetailsAnimation(details);
    });
    return;
  }

  const startHeight = `${details.offsetHeight}px`;
  details.open = true;
  updateDetailCardState(details);
  const endHeight = `${details.offsetHeight}px`;
  details.dataset.animationDirection = "opening";

  animateDetailsHeight(details, startHeight, endHeight, 360, () => {
    finishDetailsAnimation(details);
  });
};

animatedDetails.forEach((details) => {
  const summary = details.querySelector("summary");

  if (!summary) {
    return;
  }

  updateDetailCardState(details);

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    toggleDetails(details);
  });
});
