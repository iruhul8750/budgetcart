// worker.js – GitHub OAuth Proxy with token passing
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const CLIENT_ID = env.GITHUB_CLIENT_ID;
    const CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;
    const SITE_URL = env.SITE_URL || 'http://localhost:10000';

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return new Response("Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET in environment", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // --- /auth — redirect to GitHub OAuth ---
    if (url.pathname === "/auth") {
      const redirectUri = `https://${url.hostname}/auth/callback`;
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: redirectUri,
        scope: "repo,user",
      });
      const githubAuthUrl = "https://github.com/login/oauth/authorize?" + params.toString();
      return Response.redirect(githubAuthUrl, 302);
    }

    // --- /auth/callback — exchange code for token and redirect to admin with token ---
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

        // ✅ Use HTTP redirect with token in URL instead of HTML redirect
        // This ensures the token appears in the URL
        const redirectUrl = `${SITE_URL}/admin?token=${accessToken}`;
        return Response.redirect(redirectUrl, 302);

      } catch (err) {
        return new Response(`Server error: ${err.message}`, {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        });
      }
    }

    // --- Root ---
    return new Response("GitHub OAuth Proxy is running. Use /auth to start authentication.", {
      headers: { "Content-Type": "text/plain" },
    });
  },
};