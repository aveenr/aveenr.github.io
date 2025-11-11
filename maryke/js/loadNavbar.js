async function loadNavbar() {
  try {
    const res = await fetch("snippets/navbar.html");
    const html = await res.text();
    const navbarContainer = document.getElementById("navbar");
    navbarContainer.innerHTML = html;

    // Highlight the active page
    const currentPage = window.location.pathname.split("/").pop();
    const links = navbarContainer.querySelectorAll(".nav-link");
    links.forEach(link => {
      const href = link.getAttribute("href");
      if (href && href === currentPage) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Insert dynamic view type if defined
    const viewSpan = navbarContainer.querySelector("#view-type");
    if (viewSpan && window.viewType) {
      viewSpan.textContent = ` - ${window.viewType}`;
    }

    // Initialize Bootstrap collapse manually
    const collapseEl = navbarContainer.querySelector(".collapse");
    if (collapseEl) {
      new bootstrap.Collapse(collapseEl, { toggle: false });
    }

  } catch (err) {
    console.error("Failed to load navbar:", err);
  }
}
