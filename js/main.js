// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const header = document.querySelector(".header");
  const otherLinksItem = document.querySelector(".main-nav > li:nth-child(4)");
  const otherLinksToggle = otherLinksItem.querySelector(":scope > a"); // Get only the direct "Other Links" anchor
  const megaMenu = otherLinksItem.querySelector(".mega-menu");
  const mobileToggle = document.querySelector(".mobile-toggle");
  const isMobile = () => window.innerWidth < 768;

  // Mobile menu toggle
  if (mobileToggle) {
    mobileToggle.addEventListener("click", function () {
      header.classList.toggle("mobile-menu-active");
    });
  }

  // Close mobile menu when clicking on direct navigation links (except Other Links)
  const mainNavLinks = document.querySelectorAll(".main-nav > li > a");
  mainNavLinks.forEach((link) => {
    // Skip the Other Links toggle since it has special handling
    if (link !== otherLinksToggle) {
      link.addEventListener("click", function () {
        // Close the mobile menu
        if (isMobile()) {
          header.classList.remove("mobile-menu-active");
        }
      });
    }
  });

  // Add click event listener for the document
  document.addEventListener("click", function (event) {
    // Close mobile menu when clicking outside
    if (
      header.classList.contains("mobile-menu-active") &&
      !event.target.closest(".main-nav") &&
      !event.target.closest(".mobile-toggle")
    ) {
      header.classList.remove("mobile-menu-active");
    }

    // Close mega menu when clicking outside
    if (
      otherLinksItem &&
      otherLinksItem.classList.contains("mega-active") &&
      !event.target.closest(".mega-menu") &&
      event.target !== otherLinksToggle &&
      !otherLinksToggle.contains(event.target)
    ) {
      // Let CSS handle the transition
      otherLinksItem.classList.remove("mega-active");
    }
  });

  // Mega menu toggle - ONLY applies to the "Other Links" anchor, not its children
  if (otherLinksToggle) {
    otherLinksToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent the document click handler from immediately closing it

      // Toggle the class that controls visibility
      otherLinksItem.classList.toggle("mega-active");

      // For better animation in mobile
      if (isMobile() && megaMenu) {
        // Force a reflow to ensure the transition happens
        megaMenu.offsetHeight;
      }
    });
  }

  // Add event delegation for mega menu links
  if (otherLinksItem) {
    const megaMenu = otherLinksItem.querySelector(".mega-menu");
    if (megaMenu) {
      megaMenu.addEventListener("click", function (e) {
        // If it's a link within the mega menu, let it work normally (don't prevent default)
        if (e.target.tagName === "A" || e.target.closest("a")) {
          // Close the mega menu on all screen sizes
          otherLinksItem.classList.remove("mega-active");

          // Also close the mobile menu if on mobile
          if (isMobile()) {
            header.classList.remove("mobile-menu-active");
          }

          // Allow the default link behavior to happen
        }
      });
    }
  }

  // Handle window resize
  window.addEventListener("resize", function () {
    // Remove all active classes when resizing
    header.classList.remove("mobile-menu-active");
    if (otherLinksItem) {
      otherLinksItem.classList.remove("mega-active");
    }
  });

  // ===== SCROLL ANIMATION FUNCTIONALITY =====
  // Setup sections for animation
  setupScrollAnimations();

  // Initialize skills animation
  initSkillsAnimation();

  // Initialize stats counter animation
  initStatsCounter();
});

// Function to setup scroll animations
function setupScrollAnimations() {
  // Add fade-in class to section titles and cards
  const sections = document.querySelectorAll(
    ".articles, .gallery, .features, .testimonials, .team, .services, .skills, .work-steps, .events, .pricing, .videos, .stats"
  );
  
  // Create an array of sections that should use the fade-in-up animation
  const fadeUpSections = ["features", "testimonials", "team", "gallery"];

  sections.forEach((section) => {
    // Add animation to section title
    const title = section.querySelector(".main-title");
    if (title) {
      title.classList.add("fade-in");
    }
    
    // Check if this section should use the fade-in-up animation
    const shouldFadeUp = fadeUpSections.some(className => section.classList.contains(className));

    // Add animation to cards/boxes within each section
    const cards = section.querySelectorAll(".box, .card");
    if (cards.length > 0) {
      // Add cards-container class to the immediate parent of the cards
      const cardsContainer = cards[0].parentElement;
      cardsContainer.classList.add("cards-container");

      // Add fade-in class and index for staggered animation
      cards.forEach((card, index) => {
        card.classList.add("fade-in");
        card.style.setProperty("--card-index", index);
        
        // Apply additional styling for the specified sections that need fade-in-up
        if (shouldFadeUp) {
          // The CSS will handle the transform based on the section class
          card.style.setProperty("--initial-y", "25px"); // Slightly reduced from 30px
          card.style.setProperty("--transition-duration", "0.5s"); // Reduced from 0.6s
        }
      });
    }

    // Special handling for videos section
    if (section.classList.contains("videos")) {
      const holder = section.querySelector(".holder");
      if (holder) {
        holder.classList.add("fade-in");

        // Add fade-in to video list items
        const videoItems = holder.querySelectorAll(".list ul li");
        videoItems.forEach((item, index) => {
          item.classList.add("fade-in");
          item.style.setProperty("--item-index", index);
        });

        // Add fade-in to preview section
        const preview = holder.querySelector(".preview");
        if (preview) {
          preview.classList.add("fade-in");
        }
      }
    }
  });

  // Check if Intersection Observer is supported
  if ("IntersectionObserver" in window) {
    // Initialize Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If element is in viewport
          if (entry.isIntersecting) {
            // Use requestAnimationFrame for smooth performance
            requestAnimationFrame(() => {
              entry.target.classList.add("active");

              // For video list items, add staggered animation
              if (entry.target.classList.contains("videos")) {
                const videoItems = entry.target.querySelectorAll(
                  ".list ul li.fade-in"
                );
                videoItems.forEach((item, index) => {
                  setTimeout(() => {
                    item.classList.add("active");
                  }, 100 * index); // 100ms delay between each item
                });

                // Animate the preview section after a slight delay
                const preview = entry.target.querySelector(".preview.fade-in");
                if (preview) {
                  setTimeout(() => {
                    preview.classList.add("active");
                  }, 300); // Slight delay for the preview
                }
              }
            });

            // Only unobserve if not the videos section
            if (!entry.target.classList.contains("videos")) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        root: null, // using the viewport
        threshold: 0.1, // trigger when 10% of the element is visible (reduced from 15%)
        rootMargin: "0px 0px -100px 0px", // trigger earlier (increased from -50px to -100px)
      }
    );

    // Observe all fade-in elements
    document.querySelectorAll(".fade-in").forEach((el) => {
      observer.observe(el);
    });

    // Also observe videos section as a whole for the list item animations
    document.querySelectorAll(".videos").forEach((section) => {
      observer.observe(section);
    });
  } else {
    // Fallback for browsers that don't support Intersection Observer
    function checkScroll() {
      const fadeElements = document.querySelectorAll(".fade-in:not(.active)");

      fadeElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight * 0.9 && elementBottom > 0) {
          element.classList.add("active");

          // Handle video items specially
          if (element.closest(".videos")) {
            const videoItems = element.querySelectorAll(".list ul li.fade-in");
            videoItems.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add("active");
              }, 100 * index); // 100ms delay between each item
            });
          }
        }
      });
    }

    // Initial check
    checkScroll();

    // Add scroll event listener with throttling
    let scrollTimeout;
    window.addEventListener("scroll", function () {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(function () {
          scrollTimeout = null;
          checkScroll();
        }, 20); // Throttle to 50fps for performance
      }
    });
  }
}

// Function to handle the skills progress bar animation
function initSkillsAnimation() {
  const skillsSection = document.querySelector(".skills");
  if (!skillsSection) return;

  const progressSection = skillsSection.querySelector(".progress");
  const progressHolders = skillsSection.querySelectorAll(".prog-holder");
  const progressBars = skillsSection.querySelectorAll(".prog span");

  // Add animation classes
  progressSection.classList.add("animate-on-scroll");

  // Create and position percentage indicators
  progressBars.forEach((bar) => {
    const width = bar.style.width;
    const progHolder = bar.closest(".prog-holder");

    // Create percentage indicator element
    const percentIndicator = document.createElement("div");
    percentIndicator.className = "progress-percent";
    percentIndicator.textContent = width;

    // Store original width value as custom property
    bar.closest(".prog").style.setProperty("--progress-width", width);

    // Add the indicator to the DOM
    progHolder.appendChild(percentIndicator);

    // Position the indicator at the end of the progress bar (will be updated on animation)
    const widthValue = parseInt(width);
    const barWidth = bar.closest(".prog").offsetWidth;
    const indicatorPosition = (barWidth * widthValue) / 100;
    percentIndicator.style.left = indicatorPosition + "px";
  });

  // Create the Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        // Animate each progress holder with a slight delay between each
        progressHolders.forEach((holder, index) => {
          setTimeout(() => {
            holder.classList.add("show");

            // Update indicator position after animation
            const bar = holder.querySelector(".prog span");
            const indicator = holder.querySelector(".progress-percent");
            if (bar && indicator) {
              const width =
                bar.style.getPropertyValue("--progress-width") ||
                bar.style.width;
              const widthValue = parseInt(width);
              const barWidth = bar.closest(".prog").offsetWidth;
              const indicatorPosition = (barWidth * widthValue) / 100;
              indicator.style.left = indicatorPosition + "px";
            }
          }, index * 200); // 200ms delay between each progress bar
        });

        // Stop observing once triggered
        observer.unobserve(skillsSection);
      }
    },
    {
      threshold: 0.2, // Trigger when 20% of the skills section is visible
      rootMargin: "0px 0px -100px 0px", // Offset to trigger earlier
    }
  );

  // Start observing the skills section
  observer.observe(skillsSection);

  // Update indicator positions on window resize
  window.addEventListener("resize", function () {
    progressBars.forEach((bar) => {
      const indicator = bar
        .closest(".prog-holder")
        .querySelector(".progress-percent");
      if (indicator) {
        const width = bar.style.width;
        const widthValue = parseInt(width);
        const barWidth = bar.closest(".prog").offsetWidth;
        const indicatorPosition = (barWidth * widthValue) / 100;
        indicator.style.left = indicatorPosition + "px";
      }
    });
  });
}

// Function to animate number counters in the Stats section
function initStatsCounter() {
  const statsSection = document.querySelector(".stats");
  if (!statsSection) return;

  const numberElements = statsSection.querySelectorAll(".number");
  let animated = false;

  // Parse the target number from text content
  function parseTargetNumber(text) {
    // Handle numbers with K suffix (e.g., "500K")
    if (text.endsWith("K")) {
      return parseFloat(text.replace("K", "")) * 1000;
    }
    return parseInt(text.replace(/,/g, ""), 10);
  }

  // Animation function to count up to target value
  function animateCounter(element, target, duration) {
    let startTime = null;
    const startValue = 0;

    // Store original text to handle non-numeric suffixes like "K"
    const originalText = element.textContent;
    const hasSuffix = originalText.endsWith("K");

    function step(timestamp) {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      let currentValue = Math.floor(
        progress * (target - startValue) + startValue
      );

      // Format with suffix if original had it
      if (hasSuffix) {
        // If target is in thousands and has K suffix
        if (target >= 1000) {
          currentValue =
            (currentValue / 1000).toFixed(target % 1000 === 0 ? 0 : 1) + "K";
        }
      }

      element.textContent = currentValue;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        // Ensure final value matches the original exactly
        element.textContent = originalText;
      }
    }

    window.requestAnimationFrame(step);
  }

  // Create an Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !animated) {
        animated = true; // Make sure we only animate once

        // Animate each number with a slight delay between each
        numberElements.forEach((element, index) => {
          const target = parseTargetNumber(element.textContent);

          setTimeout(() => {
            animateCounter(element, target, 2000); // 2 seconds duration
          }, index * 250); // 250ms delay between each counter
        });

        // Stop observing once triggered
        observer.unobserve(statsSection);
      }
    },
    {
      threshold: 0.3, // Trigger when 30% of the stats section is visible
      rootMargin: "0px 0px -50px 0px", // Offset to trigger earlier
    }
  );

  // Start observing the stats section
  observer.observe(statsSection);
}
