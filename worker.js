export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const CLIENT_ID = env.GITHUB_CLIENT_ID;
    const CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;
    const WORKER_URL = "https://budgetcart-oauth-proxy.careermaker1075.workers.dev";
    const CMS_URL = "https://budget-cart.onrender.com";
    const REDIRECT_URI = `${WORKER_URL}/callback`;

    // Root path – just a health check
    if (url.pathname === "/") {
      return new Response("Worker is running!", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    // OAuth entry point
    if (url.pathname === "/auth") {
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: "repo,user",
      });
      return Response.redirect(
        `https://github.com/login/oauth/authorize?${params.toString()}`,
        302
      );
    }

    // OAuth callback – exchange code for token and notify opener
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("No code provided", {
          status: 400,
          headers: { "Content-Type": "text/plain" },
        });
      }

      let tokenResponse;
      try {
        tokenResponse = await fetch(
          "https://github.com/login/oauth/access_token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
            },
            body: new URLSearchParams({
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              code: code,
              redirect_uri: REDIRECT_URI,
            }).toString(),
          }
        );
      } catch (err) {
        return new Response("Token exchange failed: " + err.message, {
          status: 502,
          headers: { "Content-Type": "text/plain" },
        });
      }

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return new Response(
          `OAuth error: ${tokenData.error_description || tokenData.error}`,
          { status: 400, headers: { "Content-Type": "text/plain" } }
        );
      }

      const message = JSON.stringify({
        token: tokenData.access_token,
        provider: "github",
      });

      const html = `<!DOCTYPE html>
<html>
<head><title>Authentication complete</title></head>
<body>
<p>Authentication successful! You can close this window.</p>
<script>
  (function() {
    var msg = "authorization:github:success:${message}";
    if (window.opener) {
      window.opener.postMessage(msg, "${CMS_URL}");
    }
    setTimeout(function() { window.close(); }, 1000);
  })();
</script>
</body>
</html>`;

      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Proxy any API or Keystatic requests to the CMS
    if (url.pathname.startsWith("/api") || url.pathname.startsWith("/keystatic")) {
      const targetUrl = new URL(url.pathname + url.search, CMS_URL);
      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: "manual",
      });

      const proxyResponse = await fetch(proxyRequest);

      // Preserve status and headers from the CMS response
      const headers = new Headers(proxyResponse.headers);
      // Ensure CORS is allowed for the admin page
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

      return new Response(proxyResponse.body, {
        status: proxyResponse.status,
        headers: headers,
      });
    }

    // Any other path – 404
    return new Response("Not found", { status: 404 });
  },
};
