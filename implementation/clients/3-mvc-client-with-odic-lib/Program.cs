using System.IdentityModel.Tokens.Jwt;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

JwtSecurityTokenHandler.DefaultMapInboundClaims = false;

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultScheme = "Cookies";
        options.DefaultChallengeScheme = "oidc";
    })
    .AddCookie("Cookies")
    .AddOpenIdConnect(
        "oidc",
        options =>
        {
            options.Authority = "https://localhost:7001";
            options.ClientId = "mvc";
            options.ResponseType = "code";
            
            options.Scope.Add("api1");
            options.SaveTokens = true;

            // Add extra query parameters
            options.Events = new OpenIdConnectEvents
            {
                OnRedirectToIdentityProvider = context =>
                {
                    //context.HttpContext.Request.Headers.TryGetValue("X-Client-Code", out var clientCode);
                    context.ProtocolMessage.SetParameter("clientCode", "aba");
                    return Task.CompletedTask;
                }
            };
        }
    );

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Home/Error");
}

app.UseStaticFiles();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapDefaultControllerRoute().RequireAuthorization();

app.Run();
