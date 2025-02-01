using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using System;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
    })
    .AddCookie(
        CookieAuthenticationDefaults.AuthenticationScheme,
        options =>
        {
            options.Cookie.HttpOnly = true; // HTTP-only cookie
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Only send over HTTPS
            options.Cookie.SameSite = SameSiteMode.None; // Allow cross-origin requests
            options.SlidingExpiration = true; // Enable sliding expiration
            options.ExpireTimeSpan = TimeSpan.FromMinutes(60); // Token expiration time
        }
    )
    .AddOpenIdConnect(
        OpenIdConnectDefaults.AuthenticationScheme,
        options =>
        {
            options.Authority = "https://localhost:7001"; // Identity Server URL
            options.ClientId = "bff"; // Client ID
            //options.ClientSecret = "secret"; // Client secret (if required)
            options.ResponseType = OpenIdConnectResponseType.Code; // Use authorization code flow
            options.SaveTokens = true; // Save tokens in the authentication properties
            options.GetClaimsFromUserInfoEndpoint = true; // Fetch additional claims from the userinfo endpoint
            options.Scope.Add("openid");
            options.Scope.Add("profile");
            options.Scope.Add("offline_access"); // Request refresh token
            options.CallbackPath = "/callback"; // Callback path
            options.SignedOutCallbackPath = "/signout-callback"; // Sign-out callback path

            // Add extra query parameters
            options.Events = new OpenIdConnectEvents
            {
                OnRedirectToIdentityProvider = context =>
                {
                    context.HttpContext.Request.Headers.TryGetValue("X-Client-Code", out var clientCode);
                    // Set clientCode directly
                    context.ProtocolMessage.SetParameter("clientCode", clientCode); 
                    return Task.CompletedTask;
                }
            };
        }
    );

var app = builder.Build();

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
