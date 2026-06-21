document.addEventListener('DOMContentLoaded', () => {
  const postContainer = document.getElementById('ctc-post');
  if (!postContainer) return;

  const contentArea = postContainer.querySelector('.ctc-main-content');
  const navList = document.getElementById('ctc-dynamic-nav');
  if (!contentArea || !navList) return;

  const headings = Array.from(contentArea.querySelectorAll('h2'));
  const navLinks = [];

  // 1. Scan headings and dynamically construct the navigation sidebar
  headings.forEach((heading, idx) => {
    // Generate clean slug ID from heading text if not already present
    if (!heading.id) {
      const slug = heading.textContent
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // remove special characters
        .replace(/\s+/g, '-')     // replace spaces with hyphens
        .replace(/-+/g, '-');     // remove double hyphens
      heading.id = slug || `section-${idx + 1}`;
    }

    // Determine the navigation label text
    // Look at the label preceding the H2 (e.g. <div class="section-label">Gastronomy</div>)
    let navTitle = '';
    const prevSibling = heading.previousElementSibling;
    if (prevSibling && prevSibling.classList.contains('section-label')) {
      navTitle = prevSibling.textContent.trim();
      
      // Map standard category titles to friendly navigation shortcuts
      if (navTitle.toLowerCase() === 'introduction') navTitle = 'Understand';
      if (navTitle.toLowerCase() === 'strategic context') navTitle = 'Context';
      if (navTitle.toLowerCase() === 'practicalities') navTitle = 'Practical Tips';
    } else {
      // Fallback: use first three words of the heading text
      navTitle = heading.textContent.split(' ').slice(0, 3).join(' ') + '...';
    }

    // Create navigation list item and anchor link
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${heading.id}`;
    a.textContent = navTitle;
    if (idx === 0) {
      a.classList.add('active');
    }

    // Handle smooth scrolling when clicking sidebar links
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(heading.id);
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 120, // 120px offset for sticky headers
          behavior: 'smooth'
        });
        
        // Update URL hash without causing page jump
        history.pushState(null, null, `#${heading.id}`);
      }
    });

    li.appendChild(a);
    navList.appendChild(li);
    navLinks.push(a);
  });

  // 2. Scroll Spy: Highlight current section link in the sidebar as reader scrolls
  function updateActiveLink() {
    let activeId = '';
    const scrollPosition = window.scrollY + 160; // offset trigger point

    for (const heading of headings) {
      if (scrollPosition >= heading.offsetTop) {
        activeId = heading.getAttribute('id');
      } else {
        break;
      }
    }

    if (!activeId && headings.length > 0) {
      activeId = headings[0].getAttribute('id');
    }

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' + activeId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink);
  // Initialize on page load
  updateActiveLink();
});
