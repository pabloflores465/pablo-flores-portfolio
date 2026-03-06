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
