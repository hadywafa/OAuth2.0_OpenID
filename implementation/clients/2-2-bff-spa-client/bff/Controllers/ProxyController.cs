using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class ProxyController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public ProxyController(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Proxy([FromBody] ProxyRequest request)
    {
        // Retrieve the access token from the authentication properties
        var accessToken = await HttpContext.GetTokenAsync("access_token");
        if (string.IsNullOrEmpty(accessToken))
        {
            return Unauthorized("Access token not found.");
        }

        // Prepare the request to the API
        var httpRequest = new HttpRequestMessage(new HttpMethod(request.Method), request.Url)
        {
            Content =
                request.Body != null
                    ? new StringContent(request.Body, Encoding.UTF8, "application/json")
                    : null
        };

        // Attach the access token to the request
        httpRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(
            "Bearer",
            accessToken
        );

        // Forward the request to the API
        var response = await _httpClient.SendAsync(httpRequest);
        if (!response.IsSuccessStatusCode)
        {
            return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
        }

        var responseData = await response.Content.ReadAsStringAsync();
        return Ok(JsonSerializer.Deserialize<object>(responseData));
    }
}

public class ProxyRequest
{
    public string Url { get; set; }
    public string Method { get; set; }
    public string Body { get; set; }
}
