// src/lib/github-api.js

/**
 * GitHub API operations for product CRUD
 */

const GITHUB_API = 'https://api.github.com';

export class GitHubAPI {
  constructor(repo, branch, token) {
    this.repo = repo;
    this.branch = branch;
    this.token = token;
  }

  // Generate slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Build markdown content from product data
  buildProductMarkdown(productData) {
    const {
      title,
      price,
      compareAtPrice,
      category,
      affiliateLink,
      affiliateNetwork,
      commission,
      rating,
      inStock,
      quantity,
      sku,
      featured,
      bestSeller,
      newArrival,
      tags,
      description,
      image,
      images,
      seoTitle,
      seoDescription,
    } = productData;

    let markdown = '---\n';
    markdown += `title: "${title}"\n`;
    markdown += `price: "${price}"\n`;
    if (compareAtPrice) markdown += `compareAtPrice: "${compareAtPrice}"\n`;
    markdown += `category: "${category || 'Uncategorized'}"\n`;
    
    // Affiliate fields
    if (affiliateLink) markdown += `affiliateLink: "${affiliateLink}"\n`;
    if (affiliateNetwork) markdown += `affiliateNetwork: "${affiliateNetwork}"\n`;
    if (commission) markdown += `commission: "${commission}"\n`;
    
    markdown += `rating: ${Math.min(5, Math.max(0, rating || 0))}\n`;
    markdown += `inStock: ${inStock !== false}\n`;
    markdown += `quantity: ${quantity || 0}\n`;
    if (sku) markdown += `sku: "${sku}"\n`;
    if (featured) markdown += `featured: true\n`;
    if (bestSeller) markdown += `bestSeller: true\n`;
    if (newArrival) markdown += `newArrival: true\n`;
    if (tags && tags.length > 0) {
      markdown += `tags: [${tags.map(t => `"${t}"`).join(', ')}]\n`;
    }
    if (image) markdown += `image: "${image}"\n`;
    if (images && images.length > 0) {
      markdown += `images: [${images.map(i => `"${i}"`).join(', ')}]\n`;
    }
    if (seoTitle) markdown += `seoTitle: "${seoTitle}"\n`;
    if (seoDescription) markdown += `seoDescription: "${seoDescription}"\n`;
    markdown += `description: "${description || ''}"\n`;
    markdown += '---\n\n';
    markdown += description || 'Product description goes here.';

    return markdown;
  }

  // Get file from GitHub
  async getFile(filePath) {
    const url = `${GITHUB_API}/repos/${this.repo}/contents/${filePath}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.json();
  }

  // Create or update file on GitHub
  async saveFile(filePath, content, sha = null) {
    const url = `${GITHUB_API}/repos/${this.repo}/contents/${filePath}`;
    
    const body = {
      message: sha ? 'Update product' : 'Add product',
      content: btoa(unescape(encodeURIComponent(content))),
      branch: this.branch,
    };
    
    if (sha) {
      body.sha = sha;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save file');
    }

    return await response.json();
  }

  // Delete file from GitHub
  async deleteFile(filePath, sha) {
    const url = `${GITHUB_API}/repos/${this.repo}/contents/${filePath}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: 'Delete product',
        sha: sha,
        branch: this.branch
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete file');
    }

    return await response.json();
  }

  // Save product (create or update)
  async saveProduct(productData, existingSlug = null) {
    const slug = existingSlug || this.generateSlug(productData.title);
    const filePath = `src/content/products/${slug}.md`;
    const markdown = this.buildProductMarkdown(productData);
    
    // Check if file exists
    let sha = null;
    const existingFile = await this.getFile(filePath);
    if (existingFile) {
      sha = existingFile.sha;
    }
    
    await this.saveFile(filePath, markdown, sha);
    return { success: true, slug };
  }

  // Delete product
  async deleteProduct(slug) {
    const filePath = `src/content/products/${slug}.md`;
    
    // Get file to get SHA
    const file = await this.getFile(filePath);
    if (!file) {
      throw new Error('Product file not found');
    }
    
    await this.deleteFile(filePath, file.sha);
    return { success: true };
  }
}

// Create instance
let instance = null;

export function getGitHubAPI(repo, branch, token) {
  if (!instance) {
    instance = new GitHubAPI(repo, branch, token);
  }
  return instance;
}