const clientId = "js";
const authority = "https://localhost:7001";
const redirectUri = "http://localhost:5500/callback.html";
const responseType = "code";
const scope = "openid profile";
const logoutUri = "http://localhost:5500";

document.getElementById("login-button").addEventListener("click", login);
document.getElementById("logout-button").addEventListener("click", logout);

function login() {
  const url = `${authority}/connect/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&clientCode=aba`;
  window.location.href = url;
}

function logout() {
  const url = `${authority}/connect/endsession?id_token_hint=${sessionStorage.getItem("id_token")}&post_logout_redirect_uri=${logoutUri}`;
  sessionStorage.clear();
  window.location.href = url;
}

window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code) {
    exchangeCodeForToken(code);
  }
};

function exchangeCodeForToken(code) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${authority}/connect/token`, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("x-client-code", "aba");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      sessionStorage.setItem("access_token", response.access_token);
      sessionStorage.setItem("id_token", response.id_token);
      displayContent(response);
    }
  };

  const data = `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}&client_id=${clientId}`;
  xhr.send(data);
}

function displayContent(token) {
  document.getElementById("content").innerText = `Access Token: ${token.access_token}`;
}
