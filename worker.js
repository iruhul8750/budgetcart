// worker.js – Complete Working Version
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const CLIENT_ID = env.GITHUB_CLIENT_ID;
    const CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;
    const SITE_URL = env.SITE_URL;
    const WORKER_URL = env.WORKER_URL;

    // Validate required environment variables
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return new Response("Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET in environment", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (!SITE_URL) {
      return new Response("Missing SITE_URL in environment", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (!WORKER_URL) {
      return new Response("Missing WORKER_URL in environment", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // --- /auth — redirect to GitHub OAuth ---
    if (url.pathname === "/auth") {
      const redirectUri = `${WORKER_URL}/auth/callback`;
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: redirectUri,
        scope: "repo,user",
      });
      const githubAuthUrl = "https://github.com/login/oauth/authorize?" + params.toString();
      return Response.redirect(githubAuthUrl, 302);
    }

    // --- /auth/callback — exchange code for token and redirect with token ---
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

        const accessToken = tokenData.access_token;
        
        // ✅ Redirect to dashboard with token
        const dashboardUrl = `${SITE_URL}/admin/dashboard?token=${accessToken}`;
        return Response.redirect(dashboardUrl, 302);

      } catch (err) {
        return new Response(`Server error: ${err.message}`, {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        });
      }
    }

    // --- Root ---
    return new Response(`GitHub OAuth Proxy is running. SITE_URL: ${SITE_URL}, WORKER_URL: ${WORKER_URL}`, {
      headers: { "Content-Type": "text/plain" },
    });
  },
};