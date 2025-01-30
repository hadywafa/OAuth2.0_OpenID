// Handle the OIDC callback
function handleCallback() {
  // Parse the URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code"); // Authorization code
  const state = urlParams.get("state"); // State parameter for CSRF protection
  const error = urlParams.get("error"); // Error from the authorization server

  if (error) {
    console.error("Authorization error:", error);
    window.location = "index.html"; // Redirect to the main page
    return;
  }

  if (!code) {
    console.error("No authorization code found in the callback URL.");
    window.location = "index.html"; // Redirect to the main page
    return;
  }

  // Exchange the authorization code for tokens
  exchangeCodeForTokens(code, state)
    .then(() => {
      // Redirect to the main page after successful token exchange
      window.location = "index.html";
    })
    .catch((err) => {
      console.error("Token exchange failed:", err);
      window.location = "index.html"; // Redirect to the main page
    });
}

// Exchange the authorization code for tokens
function exchangeCodeForTokens(code, state) {
  const config = {
    authority: "https://localhost:7001",
    client_id: "js",
    redirect_uri: "https://localhost:5500/callback.html",
    token_endpoint: "https://localhost:7001/connect/token", // Token endpoint
  };

  // Prepare the request body for the token endpoint
  const body = new URLSearchParams();
  body.append("client_id", config.client_id);
  body.append("code", code);
  body.append("redirect_uri", config.redirect_uri);
  body.append("grant_type", "authorization_code");

  // Make a POST request to the token endpoint
  return fetch(config.token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Token request failed: ${response.statusText}`);
      }
      return response.json();
    })
    .then((tokens) => {
      // Store the tokens in localStorage or sessionStorage
      localStorage.setItem("oidc_tokens", JSON.stringify(tokens));
      console.log("Tokens received:", tokens);
    });
}

// Execute the callback handling logic when the page loads
handleCallback();
