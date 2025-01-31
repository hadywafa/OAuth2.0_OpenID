using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MvcClient.Models;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using System.Text.Json;
using System.Net.Http.Json;

namespace MvcClient.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        public async Task<IActionResult> CallApi()
        {
            var tokens = await HttpContext.GetTokenAsync("oidc_tokens");
            if (string.IsNullOrEmpty(tokens))
            {
                _logger.LogInformation("User not logged in");
                return View("Index");
            }

            var user = JsonSerializer.Deserialize<OidcUser>(tokens);

            var url = "https://localhost:5001/graphql/graphql?core=aba&event=association&lang=en&associationCode=aba";
            var query = new
            {
                query = @"
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
            "
            };

            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", user.AccessToken);

            var response = await client.PostAsJsonAsync(url, query);
            var data = await response.Content.ReadFromJsonAsync<object>();

            ViewBag.Json = JsonSerializer.Serialize(data);
            return View();
        }

        public IActionResult Logout()
        {
            return SignOut("Cookies", "oidc");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}