var config = {
  authority: "https://localhost:7001",
  client_id: "js",
  redirect_uri: "https://localhost:5500/callback.html",// should be http
  response_type: "code",
  scope: "openid profile",
  post_logout_redirect_uri: "http://localhost:5500/index.html",
  extraQueryParams: { clientCode: "aba" },
};

var user = null;

document.getElementById("login").addEventListener("click", login, false);
document.getElementById("api").addEventListener("click", api, false);
document.getElementById("logout").addEventListener("click", logout, false);

// Check if the user is already logged in
function checkUser() {
  const tokens = localStorage.getItem("oidc_tokens");
  if (tokens) {
    user = JSON.parse(tokens);
    log("User logged in", user);
  } else {
    log("User not logged in");
  }
}

// Redirect the user to the authorization endpoint
function login() {
  const authUrl =
    config.authority +
    "/connect/authorize?" +
    "client_id=" +
    encodeURIComponent(config.client_id) +
    "&redirect_uri=" +
    encodeURIComponent(config.redirect_uri) +
    "&response_type=" +
    encodeURIComponent(config.response_type) +
    "&scope=" +
    encodeURIComponent(config.scope) +
    "&state=" +
    encodeURIComponent("random_state") +
    "&nonce=" +
    encodeURIComponent("random_nonce") +
    "&clientCode=" +
    encodeURIComponent(config.extraQueryParams.clientCode);

  window.location.href = authUrl;
}

// Call the protected API
function api() {
  const tokens = localStorage.getItem("oidc_tokens");
  if (!tokens) {
    log("User not logged in");
    return;
  }

  user = JSON.parse(tokens);

  const url = "https://localhost:5001/graphql/graphql?core=aba&event=association&lang=en&associationCode=aba";

  const query = {
    query: `
            {
                companyMembership(companyId: 2254) {
                    balance
                    joinDate
                    paidThruDate
                    duesCategory
                    ownerCompany
                    membershipType
                    expirationDate
                }
            }
        `,
  };

  fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + user.access_token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  })
    .then((response) => response.json())
    .then((data) => log(data))
    .catch((error) => log(error));
}

// Log the user out
function logout() {
  const tokens = localStorage.getItem("oidc_tokens");
  if (!tokens) {
    log("User not logged in");
    return;
  }

  user = JSON.parse(tokens);

  const logoutUrl =
    config.authority +
    "/connect/endsession?" +
    "id_token_hint=" +
    encodeURIComponent(user.id_token) +
    "&post_logout_redirect_uri=" +
    encodeURIComponent(config.post_logout_redirect_uri);

  // Clear the stored tokens
  localStorage.removeItem("oidc_tokens");
  user = null;

  // Redirect to the logout endpoint
  window.location.href = logoutUrl;
}

function log() {
  document.getElementById("results").innerText = "";

  Array.prototype.forEach.call(arguments, function (msg) {
    if (msg instanceof Error) {
      msg = "Error: " + msg.message;
    } else if (typeof msg !== "string") {
      msg = JSON.stringify(msg, null, 2);
    }
    document.getElementById("results").innerText += msg + "\r\n";
  });
}

// Check if the user is logged in when the page loads
checkUser();
