// public/admin/dashboard.js
// This file runs ONLY in the browser

(function() {
  'use strict';

  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.log('Skipping server-side execution');
    return;
  }

  // Get initial data from server
  const initialData = window.__INITIAL_DATA__ || {};
  const SITE_URL = initialData.siteUrl || 'https://budget-cart.onrender.com';
  const REPO = initialData.githubRepo || 'your-username/your-repo';
  const BRANCH = initialData.githubBranch || 'dev';
  const ALL_CATEGORIES = initialData.categories || [];

  // State
  let token = localStorage.getItem('github_token');
  let currentProductId = null;
  let isLoading = false;

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================

  function showToast(message, type = 'success', duration = 4000) {
    // Remove existing toast container if exists
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
    
    // Auto remove after duration
    const timeoutId = setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', function() {
      clearTimeout(timeoutId);
      toast.remove();
    });
    
    // Click to dismiss
    toast.addEventListener('click', function() {
      clearTimeout(timeoutId);
      toast.remove();
    });
  }

  // ============================================
  // LOADER
  // ============================================

  function showLoader(message = 'Processing...') {
    let overlay = document.querySelector('.loader-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loader-overlay';
      overlay.innerHTML = `
        <div class="loader">
          <div class="loader-spinner"></div>
          <div class="loader-text">${message}</div>
        </div>
      `;
      document.body.appendChild(overlay);
    } else {
      overlay.querySelector('.loader-text').textContent = message;
    }
    overlay.classList.add('active');
    isLoading = true;
  }

  function hideLoader() {
    const overlay = document.querySelector('.loader-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    isLoading = false;
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');

  if (urlToken) {
    console.log('✅ Token found in URL, storing...');
    localStorage.setItem('github_token', urlToken);
    const cleanUrl = window.location.origin + window.location.pathname;
    window.location.href = cleanUrl;
    return;
  }

  if (!token) {
    console.log('❌ No token found, redirecting to login...');
    window.location.href = SITE_URL + '/admin/login';
    return;
  }

  console.log('✅ Token found, loading dashboard...');

  // Get user info
  async function getUserInfo() {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const userEmail = document.getElementById('userEmail');
        if (userEmail) {
          userEmail.textContent = data.login || 'User';
        }
        console.log('✅ User info loaded:', data.login);
      }
    } catch (error) {
      console.warn('Could not fetch user info:', error.message);
    }
  }

  getUserInfo();

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('github_token');
      window.location.href = SITE_URL + '/admin/login';
    });
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function getCategoryFromCard(card) {
    return card.getAttribute('data-category') || 'Uncategorized';
  }

  // ============================================
  // CATEGORY FILTERING
  // ============================================

  function filterProductsByCategory(category) {
    const allCards = document.querySelectorAll('#productGrid .product-card');
    
    if (category === 'all') {
      allCards.forEach(card => card.classList.remove('hidden'));
      return;
    }
    
    allCards.forEach(card => {
      const cardCategory = getCategoryFromCard(card);
      if (cardCategory === category) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  // ============================================
  // GITHUB API FUNCTIONS
  // ============================================

  async function saveProductToGitHub(filePath, markdown, sha = null) {
    const url = `https://api.github.com/repos/${REPO}/contents/${filePath}`;
    
    const body = {
      message: sha ? 'Update product' : 'Add product',
      content: btoa(unescape(encodeURIComponent(markdown))),
      branch: BRANCH,
    };
    
    if (sha) {
      body.sha = sha;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(body)
    });
    
    return response;
  }

  async function deleteProductFromGitHub(filePath, sha) {
    const url = `https://api.github.com/repos/${REPO}/contents/${filePath}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: 'Delete product',
        sha: sha,
        branch: BRANCH
      })
    });
    
    return response;
  }

  // ============================================
  // MODAL FUNCTIONS
  // ============================================

  function openModal(product = null) {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    
    if (product) {
      document.getElementById('modalTitle').textContent = 'Edit Product';
      document.getElementById('productId').value = product.slug;
      document.getElementById('productTitle').value = product.data?.title || '';
      document.getElementById('productPrice').value = product.data?.price || '';
      document.getElementById('productOriginalPrice').value = product.data?.originalPrice || '';
      document.getElementById('productCategory').value = product.data?.category || '';
      document.getElementById('productRating').value = product.data?.rating || '';
      document.getElementById('productQuantity').value = product.data?.quantity || 0;
      document.getElementById('productInStock').checked = product.data?.inStock !== false;
      document.getElementById('productFeatured').checked = product.data?.featured || false;
      document.getElementById('productBestSeller').checked = product.data?.bestSeller || false;
      document.getElementById('productNewArrival').checked = product.data?.newArrival || false;
      document.getElementById('productAffiliateLink').value = product.data?.affiliateLink || '';
      document.getElementById('productAffiliateNetwork').value = product.data?.affiliateNetwork || '';
      document.getElementById('productCommission').value = product.data?.commission || '';
      document.getElementById('productShowAffiliate').checked = product.data?.showAffiliate || false;
      document.getElementById('productTags').value = (product.data?.tags || []).join(', ');
      document.getElementById('productDescription').value = product.data?.description || '';
      currentProductId = product.slug;
    } else {
      document.getElementById('modalTitle').textContent = 'Add Product';
      document.getElementById('productForm').reset();
      document.getElementById('productId').value = '';
      document.getElementById('productInStock').checked = true;
      document.getElementById('productShowAffiliate').checked = false;
      currentProductId = null;
    }
    
    modal.classList.add('active');
  }

  function closeModal() {
    const productModal = document.getElementById('productModal');
    const deleteModal = document.getElementById('deleteModal');
    if (productModal) productModal.classList.remove('active');
    if (deleteModal) deleteModal.classList.remove('active');
  }

  function openModalFromCard(card, id) {
    if (!card) return;
    const tagsText = card.querySelector('.tags')?.textContent || '';
    const tags = tagsText ? tagsText.split(',').map(t => t.trim()) : [];
    
    const product = {
      slug: id,
      data: {
        title: card.querySelector('h3')?.textContent || '',
        price: card.querySelector('.price')?.textContent?.replace('₹', '') || '',
        originalPrice: card.querySelector('.original-price')?.textContent?.replace('₹', '') || '',
        category: card.querySelector('.category')?.textContent || '',
        rating: parseFloat(card.querySelector('[data-rating]')?.textContent?.replace('⭐ ', '') || '0'),
        quantity: parseInt(card.querySelector('.stock')?.textContent?.match(/\d+/)?.[0] || '0'),
        inStock: !card.querySelector('.stock-out'),
        featured: card.querySelector('.badge-featured') !== null,
        bestSeller: card.querySelector('.badge-bestseller') !== null,
        newArrival: card.querySelector('.badge-new') !== null,
        affiliateLink: card.querySelector('.affiliate-link')?.getAttribute('href') || '',
        affiliateNetwork: card.querySelector('.affiliate-network')?.textContent?.replace('• ', '') || '',
        commission: card.querySelector('.commission')?.textContent?.replace('• ', '') || '',
        showAffiliate: card.querySelector('.badge-affiliate') !== null,
        tags: tags,
        description: card.querySelector('.description')?.textContent || ''
      }
    };
    openModal(product);
  }

  // ============================================
  // SAVE PRODUCT
  // ============================================

  async function saveProduct(event) {
    event.preventDefault();
    
    if (isLoading) return;
    
    const id = document.getElementById('productId').value;
    const title = document.getElementById('productTitle').value.trim();
    const price = document.getElementById('productPrice').value.trim();
    const originalPrice = document.getElementById('productOriginalPrice').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const rating = parseFloat(document.getElementById('productRating').value) || 0;
    const quantity = parseInt(document.getElementById('productQuantity').value) || 0;
    const inStock = document.getElementById('productInStock').checked;
    const featured = document.getElementById('productFeatured').checked;
    const bestSeller = document.getElementById('productBestSeller').checked;
    const newArrival = document.getElementById('productNewArrival').checked;
    const affiliateLink = document.getElementById('productAffiliateLink').value.trim();
    const affiliateNetwork = document.getElementById('productAffiliateNetwork').value.trim();
    const commission = document.getElementById('productCommission').value.trim();
    const showAffiliate = document.getElementById('productShowAffiliate').checked;
    const tags = document.getElementById('productTags').value.split(',').map(t => t.trim()).filter(Boolean);
    const description = document.getElementById('productDescription').value.trim();

    if (!title || !price) {
      showToast('Title and price are required!', 'error');
      return;
    }

    showLoader(id || currentProductId ? 'Updating product...' : 'Creating product...');
    
    const slug = generateSlug(title);
    
    let markdown = '---\n';
    markdown += `title: "${title}"\n`;
    markdown += `price: "${price}"\n`;
    if (originalPrice) markdown += `originalPrice: "${originalPrice}"\n`;
    markdown += `category: "${category || 'Uncategorized'}"\n`;
    
    if (affiliateLink) markdown += `affiliateLink: "${affiliateLink}"\n`;
    if (affiliateNetwork) markdown += `affiliateNetwork: "${affiliateNetwork}"\n`;
    if (commission) markdown += `commission: "${commission}"\n`;
    markdown += `showAffiliate: ${showAffiliate}\n`;
    
    markdown += `rating: ${Math.min(5, Math.max(0, rating))}\n`;
    markdown += `inStock: ${inStock}\n`;
    markdown += `quantity: ${quantity}\n`;
    if (featured) markdown += `featured: true\n`;
    if (bestSeller) markdown += `bestSeller: true\n`;
    if (newArrival) markdown += `newArrival: true\n`;
    if (tags.length > 0) markdown += `tags: [${tags.map(t => `"${t}"`).join(', ')}]\n`;
    markdown += `description: "${description || ''}"\n`;
    markdown += '---\n\n';
    markdown += description || 'Product description goes here.';

    const filePath = `src/content/products/${slug}.md`;
    
    try {
      let sha = null;
      
      if (id || currentProductId) {
        try {
          const checkResponse = await fetch(
            `https://api.github.com/repos/${REPO}/contents/${filePath}`,
            {
              headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            }
          );
          if (checkResponse.ok) {
            const fileData = await checkResponse.json();
            sha = fileData.sha;
          }
        } catch (e) {
          console.log('File does not exist, creating new...');
        }
      }

      const response = await saveProductToGitHub(filePath, markdown, sha);

      if (response.ok) {
        showToast(id || currentProductId ? 'Product updated successfully!' : 'Product created successfully!');
        closeModal();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const error = await response.json();
        console.error('GitHub API Error:', error);
        showToast(`Error: ${error.message || 'Failed to save product'}`, 'error');
        hideLoader();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Error saving product: ' + error.message, 'error');
      hideLoader();
    } finally {
      hideLoader();
    }
  }

  // ============================================
  // DELETE PRODUCT
  // ============================================

  async function deleteProduct(id) {
    if (isLoading) return;
    
    showLoader('Deleting product...');
    
    try {
      const filePath = `src/content/products/${id}.md`;
      
      const getResponse = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${filePath}`,
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!getResponse.ok) {
        showToast('Product file not found', 'error');
        hideLoader();
        return;
      }
      
      const fileData = await getResponse.json();
      
      const response = await deleteProductFromGitHub(filePath, fileData.sha);

      if (response.ok) {
        showToast('Product deleted successfully!');
        closeModal();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const error = await response.json();
        showToast(`Error: ${error.message || 'Failed to delete product'}`, 'error');
        hideLoader();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Error deleting product: ' + error.message, 'error');
      hideLoader();
    } finally {
      hideLoader();
    }
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
  } else {
    initDashboard();
  }

  function initDashboard() {
    // Add Product buttons
    const addBtn = document.getElementById('addProductBtn');
    const emptyAddBtn = document.getElementById('emptyAddBtn');
    if (addBtn) addBtn.addEventListener('click', () => openModal(null));
    if (emptyAddBtn) emptyAddBtn.addEventListener('click', () => openModal(null));

    // Modal close buttons
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', closeModal);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeModal);

    // Form submit
    const productForm = document.getElementById('productForm');
    if (productForm) productForm.addEventListener('submit', saveProduct);

    // Category filter dropdown
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', function() {
        filterProductsByCategory(this.value);
        showToast(`Showing ${this.value === 'all' ? 'all products' : this.value}`, 'info', 2000);
      });
    }

    // Edit buttons
    document.querySelectorAll('#productGrid .edit-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const id = this.dataset.id;
        const card = this.closest('.product-card');
        openModalFromCard(card, id);
      });
    });

    // Delete buttons
    document.querySelectorAll('#productGrid .delete-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const id = this.dataset.id;
        const card = this.closest('.product-card');
        if (!card) return;
        const nameEl = card.querySelector('h3');
        document.getElementById('deleteProductName').textContent = nameEl ? nameEl.textContent : 'Product';
        document.getElementById('confirmDeleteBtn').dataset.id = id;
        document.getElementById('deleteModal').classList.add('active');
      });
    });

    // Confirm delete
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', function(e) {
        deleteProduct(this.dataset.id);
      });
    }

    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    });

    // Add new category to datalist when user types
    const categoryInput = document.getElementById('productCategory');
    if (categoryInput) {
      categoryInput.addEventListener('input', function() {
        const value = this.value.trim();
        if (value && value.length > 1) {
          const datalist = document.getElementById('categoryOptions');
          if (datalist) {
            const existing = Array.from(datalist.options).some(opt => opt.value === value);
            if (!existing) {
              const option = document.createElement('option');
              option.value = value;
              datalist.appendChild(option);
            }
          }
        }
      });
    }

    console.log('✅ Dashboard ready!');
  }

})();