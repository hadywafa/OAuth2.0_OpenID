/// <reference path="oidc-client.js" />

function log() {
    document.getElementById('results').innerText = '';

    Array.prototype.forEach.call(arguments, function (msg) {
        if (msg instanceof Error) {
            msg = "Error: " + msg.message;
        }
        else if (typeof msg !== 'string') {
            msg = JSON.stringify(msg, null, 2);
        }
        document.getElementById('results').innerText += msg + '\r\n';
    });
}

document.getElementById("login").addEventListener("click", login, false);
document.getElementById("api").addEventListener("click", api, false);
document.getElementById("logout").addEventListener("click", logout, false);

var config = {
    authority: "https://localhost:7001",
    client_id: "js",
    redirect_uri: "https://localhost:5500/callback.html",
    response_type: "code",
    scope: "openid profile",
    post_logout_redirect_uri: "https://localhost:5500/index.html",
    extraQueryParams: { clientCode: "aba" }
};
var mgr = new Oidc.UserManager(config);

mgr.getUser().then(function (user) {
    if (user) {
        log("User logged in", user.profile);
    }
    else {
        log("User not logged in");
    }
});

function login() {
    mgr.signinRedirect();
}

function api() {
    mgr.getUser().then(function (user) {
        var url = "https://aba2.issi.net/hub/gqlapi/graphql/graphql?core=aba&event=association&lang=en&associationCode=aba";

        var query = {
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
            `
        };

        var xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.onload = function () {
            log(xhr.status, JSON.parse(xhr.responseText));
        }
        xhr.setRequestHeader("Authorization", "Bearer " + user.access_token);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(query));
    });
}

function logout() {
    mgr.signoutRedirect();
}