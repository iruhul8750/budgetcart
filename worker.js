// worker.js – GitHub OAuth Proxy with Keystatic Dashboard Redirect
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const CLIENT_ID = env.GITHUB_CLIENT_ID;
    const CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return new Response("Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET in environment", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // --- /auth — redirect to GitHub OAuth ---
    if (url.pathname === "/auth") {
      // ✅ Use the exact same URL that's registered in GitHub
      const redirectUri = `http://localhost:8787/auth/callback`;
      // or for production: `https://budgetcart-oauth-proxy.careermaker1075.workers.dev/auth/callback`
      
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: redirectUri,
        scope: "repo,user",
      });
      const githubAuthUrl = "https://github.com/login/oauth/authorize?" + params.toString();
      return Response.redirect(githubAuthUrl, 302);
    }

    // --- /auth/callback — exchange code for token and redirect to admin ---
    if (url.pathname === "/auth/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("Missing code parameter", { status: 400 });
      }

      try {
        const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
          }),
        });

        const tokenData = await tokenResp.json();

        if (tokenData.error) {
          return new Response(
            `Error: ${tokenData.error_description || tokenData.error}`,
            { status: 400, headers: { "Content-Type": "text/plain" } }
          );
        }

        // ✅ Redirect to Keystatic admin dashboard with token stored
        const html = `<!DOCTYPE html>
<html>
<head>
  <title>Authentication complete</title>
  <meta charset="utf-8">
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 400px;
    }
    .spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #2563eb;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 20px 0;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .success { color: #16a34a; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🛒 BudgetCart</h1>
    <div class="spinner"></div>
    <p>Authentication successful!</p>
    <p class="success">✅ Redirecting to admin dashboard...</p>
  </div>
  <script>
    // Store token in localStorage
    localStorage.setItem('github_token', '${tokenData.access_token}');
    // Redirect to Keystatic admin dashboard
    window.location.href = '/admin';
  </script>
</body>
</html>`;

        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });

      } catch (err) {
        return new Response(`Server error: ${err.message}`, {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        });
      }
    }

    // --- /admin — redirect to the Keystatic admin dashboard ---
    if (url.pathname === "/admin") {
      // This handles the case where someone visits the worker's /admin path
      // Redirect to the actual Keystatic admin on your site
      const siteUrl = env.SITE_URL || 'https://budget-cart.onrender.com';
      return Response.redirect(`${siteUrl}/admin`, 302);
    }

    // --- Root ---
    return new Response("GitHub OAuth Proxy is running. Use /auth to start authentication.", {
      headers: { "Content-Type": "text/plain" },
    });
  },
};