using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[Route("api/[controller]")]
public class AuthController : Controller
{
    [HttpGet("login")]
    public IActionResult Login()
    {
        var authenticationProperties = new AuthenticationProperties
        {
            RedirectUri = "/"
        };

        return Challenge(authenticationProperties, OpenIdConnectDefaults.AuthenticationScheme);
    }

    [HttpGet("logout")]
    public IActionResult Logout()
    {
        return SignOut(
            new AuthenticationProperties { RedirectUri = "/" },
            CookieAuthenticationDefaults.AuthenticationScheme,
            OpenIdConnectDefaults.AuthenticationScheme
        );
    }

    [Authorize]
    [HttpGet("refresh")]
    public async Task<IActionResult> RefreshTokens()
    {
        // Force a token refresh by signing out and signing in again
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Challenge(
            new AuthenticationProperties { RedirectUri = "/" },
            OpenIdConnectDefaults.AuthenticationScheme
        );
    }
}
