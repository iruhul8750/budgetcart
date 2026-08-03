// public/layout.js
// Layout JavaScript - Handles header, mobile menu, dark mode, and navigation

(function() {
  'use strict';

  // ============================================
  // DOM READY
  // ============================================
  
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    console.log('✅ Layout initialized');
    initMobileMenu();
    initHeaderScroll();
    initMobileDropdown();
    initActiveNavLinks();
    initDarkMode();
    initBackToTop();
  });

  // ============================================
  // MOBILE MENU WITH SCROLL LOCK AND BLUR
  // ============================================
  
  function initMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');

    if (!menuToggle || !mobileNav) return;

    // Create overlay with blur
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.id = 'mobileOverlay';
    document.body.appendChild(overlay);

    function toggleMenu() {
      menuToggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
      overlay.classList.toggle('active');
      
      // Toggle body scroll lock
      if (mobileNav.classList.contains('active')) {
        document.body.classList.add('menu-open');
        const scrollY = window.scrollY;
        document.body.style.top = `-${scrollY}px`;
      } else {
        const scrollY = document.body.style.top;
        document.body.classList.remove('menu-open');
        document.body.style.top = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    }

    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMenu();
    });

    // Close menu on link click
    document.querySelectorAll('.mobile-nav-link, .mobile-dropdown-link').forEach(link => {
      link.addEventListener('click', function() {
        if (mobileNav.classList.contains('active')) toggleMenu();
      });
    });

    // Close menu on overlay click
    overlay.addEventListener('click', function() {
      if (mobileNav.classList.contains('active')) toggleMenu();
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('active')) toggleMenu();
    });

    // Close menu on window resize (desktop)
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && mobileNav.classList.contains('active')) {
        toggleMenu();
      }
    });
  }

  // ============================================
  // HEADER SCROLL EFFECT
  // ============================================
  
  function initHeaderScroll() {
    const header = document.getElementById('mainHeader');
    if (!header) return;

    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // ============================================
  // MOBILE DROPDOWN TOGGLE
  // ============================================
  
  function initMobileDropdown() {
    const mobileCategoriesToggle = document.getElementById('mobileCategoriesToggle');
    const mobileCategoriesContent = document.getElementById('mobileCategoriesContent');

    if (!mobileCategoriesToggle || !mobileCategoriesContent) return;

    mobileCategoriesToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('active');
      mobileCategoriesContent.classList.toggle('open');
    });

    // Close dropdown when clicking a link
    mobileCategoriesContent.querySelectorAll('.mobile-dropdown-link').forEach(link => {
      link.addEventListener('click', function() {
        mobileCategoriesToggle.classList.remove('active');
        mobileCategoriesContent.classList.remove('open');
      });
    });
  }

  // ============================================
  // ACTIVE NAV LINK STATE
  // ============================================
  
  function initActiveNavLinks() {
    setActiveNavLink();

    window.addEventListener('hashchange', function() {
      setActiveNavLink();
    });

    let scrollTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function() {
        updateActiveOnScroll();
      }, 50);
    });
  }

  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    
    const isHome = currentPath === '/' || currentPath === '';
    
    const allNavLinks = document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav .mobile-nav-link');
    const allDropdownLinks = document.querySelectorAll('.mobile-dropdown-link');
    
    allNavLinks.forEach(link => link.classList.remove('active'));
    allDropdownLinks.forEach(link => link.classList.remove('active'));
    
    if (isHome && !currentHash) {
      document.querySelectorAll('.nav-link[data-page="home"], .mobile-nav-link[data-page="home"]').forEach(link => {
        link.classList.add('active');
      });
      return;
    }
    
    if (currentHash) {
      let hashMatched = false;
      allNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        if (href === currentHash || href === '/' + currentHash) {
          link.classList.add('active');
          hashMatched = true;
        }
      });
      
      if (hashMatched) return;
    }
    
    allNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      if (href === currentPath) {
        link.classList.add('active');
      }
    });
    
    allDropdownLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href === currentPath) {
        link.classList.add('active');
      }
    });
  }

  function updateActiveOnScroll() {
    const scrollPosition = window.scrollY + 120;
    
    const sections = document.querySelectorAll('section[id]');
    let currentSectionId = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.id;
      }
    });
    
    if (!currentSectionId && scrollPosition < 100) {
      currentSectionId = 'home';
    }
    
    const allNavLinks = document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav .mobile-nav-link');
    const allDropdownLinks = document.querySelectorAll('.mobile-dropdown-link');
    
    allNavLinks.forEach(link => link.classList.remove('active'));
    allDropdownLinks.forEach(link => link.classList.remove('active'));
    
    if (currentSectionId) {
      allNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        if (href === '#' + currentSectionId || href === '/#' + currentSectionId) {
          link.classList.add('active');
        }
        
        if (link.dataset.page === currentSectionId) {
          link.classList.add('active');
        }
      });
      
      allDropdownLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href === '/categories/' + currentSectionId) {
          link.classList.add('active');
        }
      });
    }
    
    if (window.scrollY < 50) {
      document.querySelectorAll('.nav-link[data-page="home"], .mobile-nav-link[data-page="home"]').forEach(link => {
        link.classList.add('active');
      });
    }
  }

  // ============================================
  // DARK MODE - ORIGINAL
  // ============================================
  
  function initDarkMode() {
    const darkToggle = document.getElementById('darkModeToggle');
    
    if (!darkToggle) return;

    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const isDark = savedMode === 'enabled' || (!savedMode && prefersDark);
    document.documentElement.classList.toggle('dark-mode', isDark);

    darkToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const dark = document.documentElement.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', dark ? 'enabled' : 'disabled');
    });
  }

  // ============================================
  // BACK TO TOP BUTTON
  // ============================================
  
  function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();