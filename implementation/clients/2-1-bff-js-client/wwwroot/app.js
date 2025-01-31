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

document.getElementById("login").addEventListener("click", async () => {
    const clientCode = "aba"; // Replace with dynamic value if needed

    try {
        const response = await fetch("/api/auth/login", {
            method: "GET",
            headers: {
                "X-Client-Code": clientCode, // Pass clientCode in a custom header
            },
        });

        if (!response.ok) {
            throw new Error(`Login request failed: ${response.statusText}`);
        }

        // Redirect to the IDS login page
        window.location.href = response.url;
    } catch (error) {
        console.error(error);
    }
});

document.getElementById("api").addEventListener("click", async () => {
  try {
    const response = await fetch("/api/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://localhost:5001/graphql/graphql?core=aba&event=association&lang=en&associationCode=aba",
        method: "POST",
        body: JSON.stringify({
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
        }),
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    log(data);
  } catch (error) {
    log(error);
  }
});

document.getElementById("logout").addEventListener("click", () => {
  window.location.href = "/api/auth/logout";
});
