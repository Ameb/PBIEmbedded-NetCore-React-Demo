using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.PowerBI.Api.V2;
using Microsoft.PowerBI.Api.V2.Models;
using Microsoft.Rest;
using Newtonsoft.Json;

namespace PowerBIEmbedded.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class PowerBIController : Controller
    {
        public IConfiguration Configuration { get; set; }
        public PowerBIController(IConfiguration config)
        {
            Configuration = config;
        }
        [HttpGet("[action]")]
        public async Task<TokenInfo> GetToken(string mode = "")
        {
            var tokenBuilder = new PowerBIToken(Configuration);
            TokenInfo token = await tokenBuilder.generateToken(mode);
            return token;
        }

    }

    public struct TokenInfo
    {
        [JsonProperty("accessToken")]
        public string EmbedToken;
        [JsonProperty("embedUrl")]
        public string EmbedUrl;
        [JsonProperty("datasetId")]
        public string DatasetId;
        [JsonProperty("id")]
        public string ReportId;
        [JsonProperty("mode")]
        public string mode;
    }
    public class PowerBIToken
    {
        private readonly string Username, Password, AuthorityUrl, ResourceUrl, ClientId, ApiUrl, GroupId, ReportId;
        public IConfiguration Configuration { get; set; }

        public PowerBIToken(IConfiguration config)
        {
            Username = config["pbiUsername"];
            Password = config["pbiPassword"];
            AuthorityUrl = config["authorityUrl"];
            ResourceUrl = config["resourceUrl"];
            ClientId = config["clientId"];
            ApiUrl = config["apiUrl"];
            GroupId = config["groupId"];
            ReportId = config["reportId"];
        }
        /*
            Identificate into PowerBI api using OAuth.
        */
        private async Task<OAuthResult> AuthenticateAsync()
        {
            var oauthEndpoint = new Uri(AuthorityUrl);

            using (var client = new HttpClient())
            {
                var result = await client.PostAsync(oauthEndpoint, new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("resource", ResourceUrl),
                    new KeyValuePair<string, string>("client_id", ClientId),
                    new KeyValuePair<string, string>("grant_type", "password"),
                    new KeyValuePair<string, string>("username", Username),
                    new KeyValuePair<string, string>("password", Password),
                    new KeyValuePair<string, string>("scope", "openid"),
                }));

                var content = await result.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<OAuthResult>(content);
            }
        }
        class OAuthResult
        {
            [JsonProperty("token_type")]
            public string TokenType { get; set; }
            [JsonProperty("scope")]
            public string Scope { get; set; }
            [JsonProperty("experies_in")]
            public int ExpiresIn { get; set; }
            [JsonProperty("ext_experies_in")]
            public int ExtExpiresIn { get; set; }
            [JsonProperty("experies_on")]
            public int ExpiresOn { get; set; }
            [JsonProperty("not_before")]
            public int NotBefore { get; set; }
            [JsonProperty("resource")]
            public Uri Resource { get; set; }
            [JsonProperty("access_token")]
            public string AccessToken { get; set; }
            [JsonProperty("refresh_token")]
            public string RefreshToken { get; set; }
        }
        public async Task<TokenInfo> generateToken(string mode = "", string username = "", string roles = "")
        {
            string accessLevel;
            switch (mode)
            {
                case "edit":
                    accessLevel = TokenAccessLevel.Edit;
                    break;
                case "create":
                    accessLevel = TokenAccessLevel.Create;
                    break;
                default:
                    accessLevel = TokenAccessLevel.View;
                    break;
            }
            var authenticationResult = await AuthenticateAsync();
            if (authenticationResult == null)
            {
                throw new System.Exception();
            }

            var tokenCredentials = new TokenCredentials(authenticationResult.AccessToken, "Bearer");

            // Create a Power BI Client object. It will be used to call Power BI APIs.
            using (var client = new PowerBIClient(new Uri(ApiUrl), tokenCredentials))
            {
                // Get a list of reports.
                var reports = await client.Reports.GetReportsInGroupAsync(GroupId);

                Report report;
                if (string.IsNullOrEmpty(ReportId))
                {
                    // Get the first report in the group.
                    report = reports.Value.FirstOrDefault();
                }
                else
                {
                    report = reports.Value.FirstOrDefault(r => r.Id == ReportId);
                }

                if (report == null)
                {
                    throw new System.Exception();
                }

                var datasets = await client.Datasets.GetDatasetByIdInGroupAsync(GroupId, report.DatasetId);
                //result.IsEffectiveIdentityRequired = datasets.IsEffectiveIdentityRequired;
                //result.IsEffectiveIdentityRolesRequired = datasets.IsEffectiveIdentityRolesRequired;
                GenerateTokenRequest generateTokenRequestParameters;
                // This is how you create embed token with effective identities
                if (!string.IsNullOrEmpty(username))
                {
                    var rls = new EffectiveIdentity(username, new List<string> { report.DatasetId });
                    if (!string.IsNullOrWhiteSpace(roles))
                    {
                        var rolesList = new List<string>();
                        rolesList.AddRange(roles.Split(','));
                        rls.Roles = rolesList;
                    }
                    // Generate Embed Token with effective identities.
                    generateTokenRequestParameters = new GenerateTokenRequest
                        (
                        accessLevel: accessLevel,
                        identities: new List<EffectiveIdentity> { rls }
                        );
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(roles))
                    {
                        generateTokenRequestParameters = new GenerateTokenRequest(accessLevel: accessLevel);
                    }
                    else
                    {
                        var rls = new EffectiveIdentity { Datasets = new List<string> { report.DatasetId }, Username = "" };
                        if (!string.IsNullOrWhiteSpace(roles))
                        {
                            var rolesList = new List<string>();
                            rolesList.AddRange(roles.Split(','));
                            rls.Roles = rolesList;
                        }
                        generateTokenRequestParameters = new GenerateTokenRequest(accessLevel: accessLevel, datasetId: report.DatasetId, identities: new List<EffectiveIdentity> { rls });
                    }
                }

                var tokenResponse = await client.Reports.GenerateTokenInGroupAsync(GroupId, report.Id, generateTokenRequestParameters);

                if (tokenResponse == null)
                {
                    throw new System.Exception("Failed to generate embed token.");
                }

                // Generate Embed Configuration.
                return new TokenInfo
                {
                    mode = accessLevel,
                    EmbedToken = tokenResponse.Token,
                    EmbedUrl = report.EmbedUrl,
                    ReportId = report.Id,
                    DatasetId = report.DatasetId
                };
            }
        }
    }
}
