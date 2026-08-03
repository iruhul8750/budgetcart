// public/index.js
// Page-specific JavaScript

(function() {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    console.log('✅ BudgetCart page loaded!');
    initNewsletterForm();
    initSmoothScrolling();
    initIntersectionObserver();
  });

  // ============================================
  // NEWSLETTER FORM
  // ============================================
  
  function initNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterEmail = document.getElementById('newsletterEmail');
    const newsletterSubmit = document.getElementById('newsletterSubmit');

    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = newsletterEmail.value.trim();
      
      if (!email || !isValidEmail(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }
      
      newsletterSubmit.textContent = 'Subscribing...';
      newsletterSubmit.disabled = true;
      
      setTimeout(() => {
        showToast('🎉 Thank you for subscribing!', 'success');
        newsletterEmail.value = '';
        newsletterSubmit.textContent = 'Subscribe Free →';
        newsletterSubmit.disabled = false;
      }, 1500);
    });
  }

  // ============================================
  // EMAIL VALIDATION
  // ============================================
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================
  
  function showToast(message, type = 'success', duration = 4000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <span>${message}</span>
      <button class="toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    const timeoutId = setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
    
    toast.querySelector('.toast-close').addEventListener('click', function() {
      clearTimeout(timeoutId);
      toast.remove();
    });
    
    toast.addEventListener('click', function() {
      clearTimeout(timeoutId);
      toast.remove();
    });
  }

  // ============================================
  // SMOOTH SCROLLING
  // ============================================
  
  function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerHeight = 70;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ============================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // ============================================
  
  function initIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.feature-card, .stat-item, .product-card').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
      return;
    }
    
    const animateElements = document.querySelectorAll('.feature-card, .stat-item, .product-card');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    
    animateElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

})();