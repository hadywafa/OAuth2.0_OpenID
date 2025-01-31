using System;

namespace MvcClient.Models
{
    public class OidcUser
    {
        public string AccessToken { get; set; }
        public string IdToken { get; set; }
        public string RefreshToken { get; set; }
        public DateTime ExpiresAt { get; set; }
        public string[] Scopes { get; set; }
    }
}
