using System;
using System.Text;
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
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Microsoft.AspNetCore.WebUtilities;

namespace PowerBIEmbedded.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class PowerBIController : Controller
    {
        private PowerBIToken tokenBuilder;
        public IConfiguration Configuration { get; set; }
        private readonly string WebId, Resource, AuthorizeUrl;
        public PowerBIController(IConfiguration config)
        {
            Configuration = config;
            tokenBuilder = new PowerBIToken(Configuration);
            WebId = config["webId"];
            Resource = config["resourceUrl"];
            AuthorizeUrl = config["authorityAuthorizeUrl"];
        }
        [HttpGet("[action]")]
        // Old Version uses this task
        public async Task<TokenInfo> GetToken(string mode = null, string user = null)
        {
            TokenInfo token = await tokenBuilder.getReportToken(mode: mode, username: user);
            return token;
        }
        [HttpGet("[action]")]
        public async Task<Report[]> GetReportList(string masterUser = null, string ADcode = null)
        {
            Report[] data = await tokenBuilder.getReportList(masterUser, ADcode);
            return data;
        }
        [HttpGet("[action]")]
        public async Task<TokenInfo> GetReportToken(string id = null, string mode = null, string user = null, string masterUser = null, string ADcode = null)
        {
            TokenInfo token = await tokenBuilder.getReportToken(id, mode, user, masterUser: masterUser, ADcode: ADcode);
            return token;
        }
        [HttpGet("[action]")]
        public RedirectResult ADToken()
        {
            Dictionary<string, string> queryParamsOut;
            //.Parameters.Get("code");
            // Use AD
            string code = Request.Query["code"].ToString();
            if (!String.IsNullOrEmpty(code)) {
                // AD Returns. Pass code to frontend
                queryParamsOut = new Dictionary<string, string>()
                    {
                        {"code", code}
                    };
                string query = QueryHelpers.AddQueryString("http://localhost:5050/AD", queryParamsOut);
                return Redirect(query);
            }
            else
            {
                queryParamsOut = new Dictionary<string, string>()
                    {
                        {"response_type", "code"},
                        {"client_id",WebId},
                        {"resource", Resource},
                        {"redirect_uri", "http://localhost:5050/api/PowerBI/ADToken/"}
                    };
                string query = QueryHelpers.AddQueryString(AuthorizeUrl, queryParamsOut);
                return Redirect(query);
            }
            //TokenInfo token = await tokenBuilder.testADAL();
            //Redirect();
            //return token;
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
        [JsonProperty("tokenType")]
        public string TokenType;
    }
    public class PowerBIToken
    {
        private readonly string Username, Password, AuthorityUrl, ResourceUrl, ClientId, ApiUrl, GroupId;
        private readonly string JMOUsername, MasterUsername, JMOPassword, MasterPassword;
        private readonly string WebId, WebSecret;
        private string ReportId;
        public IConfiguration Configuration { get; set; }

        public PowerBIToken(IConfiguration config)
        {
            Username = config["pbiUsername"];
            Password = config["pbiPassword"];
            AuthorityUrl = config["authorityTokenUrl"];
            ResourceUrl = config["resourceUrl"];
            ClientId = config["clientId"];
            ApiUrl = config["apiUrl"];
            GroupId = config["groupId"];
            ReportId = config["reportId"];
            MasterUsername = config["masterUsername"];
            MasterPassword = config["masterPassword"];
            JMOUsername = config["auxUsername"];
            JMOPassword = config["auxPassword"];

            WebId = config["webId"];
            WebSecret = config["webSecret"];
        }
        /*
            Identificate into PowerBI api using OAuth.
        */
        private async Task<string> AuthenticateAsync(string masterUser = null, string ADcode = null)
        {
            string username, password;
            if (!String.IsNullOrEmpty(ADcode))
            {
                TokenCache TC = new TokenCache();
                AuthenticationContext AC = new AuthenticationContext(AuthorityUrl, TC);
                ClientCredential cc = new ClientCredential(WebId, WebSecret);

                AuthenticationResult ar = await AC.AcquireTokenByAuthorizationCodeAsync(ADcode, new Uri("http://localhost:5050/api/PowerBI/ADToken/"),cc);
                return ar.AccessToken;
            }
            if (String.IsNullOrEmpty(masterUser)) {
                username = Username;
                password = Encoding.UTF8.GetString(Convert.FromBase64String(Password));
            }
            else
            {
                switch (masterUser.ToUpper())
                {
                    case "MASTER":
                        username = MasterUsername;
                        password = Encoding.UTF8.GetString(Convert.FromBase64String(MasterPassword));
                        break;
                    case "JMO":
                        username = JMOUsername;
                        password = Encoding.UTF8.GetString(Convert.FromBase64String(JMOPassword));
                        break;
                    default:
                        username = Username;
                        password = Encoding.UTF8.GetString(Convert.FromBase64String(Password));
                        break;
                }
            }
            var oauthEndpoint = new Uri(AuthorityUrl);

            using (var client = new HttpClient())
            {
                var result = await client.PostAsync(oauthEndpoint, new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("resource", ResourceUrl),
                    new KeyValuePair<string, string>("client_id", ClientId),
                    new KeyValuePair<string, string>("grant_type", "password"),
                    new KeyValuePair<string, string>("username", username),
                    new KeyValuePair<string, string>("password", password),
                    new KeyValuePair<string, string>("scope", "openid"),
                }));

                var content = await result.Content.ReadAsStringAsync();
                var oar = JsonConvert.DeserializeObject<OAuthResult>(content);
                // Bearer token is the default
                return oar.AccessToken;
            }
        }
        class OAuthResult
        {
            [JsonProperty("token_type")]
            public string TokenType { get; set; }
            [JsonProperty("scope")]
            public string Scope { get; set; }
            [JsonProperty("expires_in")]
            public int ExpiresIn { get; set; }
            [JsonProperty("ext_expires_in")]
            public int ExtExpiresIn { get; set; }
            [JsonProperty("expires_on")]
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
        public async Task<Report[]> getReportList(string masterUser = "", string ADcode = null)
        {
            string bearerToken = await AuthenticateAsync(masterUser, ADcode);

            // Create a Power BI Client object. It will be used to call Power BI APIs.
            using (var client = new PowerBIClient(new Uri(ApiUrl), new TokenCredentials(bearerToken)))
            {
                IList<Report> reportList = client.Reports.GetReports(GroupId).Value;
                Report[] reportArr = new Report[reportList.Count];
                reportList.CopyTo(reportArr, 0);
                return reportArr;
            }
        }
        public async Task<TokenInfo> getReportToken(string reportId = "", string mode = "", string username = "", string masterUser = "", string ADcode = null)
        {
            if (!string.IsNullOrEmpty(reportId))
            {
                ReportId = reportId;
            }
            string accessLevel;
            switch (mode.ToUpper())
            {
                case "EDIT":
                    accessLevel = TokenAccessLevel.Edit;
                    break;
                case "CREATE":
                    if (!string.IsNullOrEmpty(username)) {
                        // for RLS we will duplicate the empty template report
                        // ReportId = "d346d02f-2a7d-4f4c-9437-407bf3c9bfb5";
                    }
                    accessLevel = TokenAccessLevel.Create;
                    break;
                default:
                    accessLevel = TokenAccessLevel.View;
                    break;
            }
            string bearerToken = await AuthenticateAsync(masterUser, ADcode);

            // Create a Power BI Client object. It will be used to call Power BI APIs.
            using (var client = new PowerBIClient(new Uri(ApiUrl), new TokenCredentials(bearerToken)))
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

                //if using AD auth dont generate token
                /*
                if (!String.IsNullOrEmpty(ADcode) || true) {
                    return new TokenInfo
                    {
                        mode = accessLevel,
                        EmbedToken = bearerToken,
                        EmbedUrl = report.EmbedUrl,
                        ReportId = report.Id,
                        DatasetId = report.DatasetId
                    };
                }
                /* */
                GenerateTokenRequest generateTokenRequestParameters;
                EmbedToken tokenResponse;
                if (accessLevel == TokenAccessLevel.Create)
                {
                    if (!string.IsNullOrEmpty(username)) {
                        // Duplicate Report
                        CloneReportRequest crr = new CloneReportRequest(name: "prueba");
                        report = client.Reports.CloneReportInGroup(GroupId, report.Id, crr);
                        // apply rls
                        var rls = new EffectiveIdentity(username, new List<string> { report.DatasetId });
                        generateTokenRequestParameters = new GenerateTokenRequest
                        (
                            accessLevel: TokenAccessLevel.Edit,
                            datasetId: report.DatasetId,
                            allowSaveAs: false,
                            identities: new List<EffectiveIdentity> { rls }
                        );
                    } else {
                        generateTokenRequestParameters = new GenerateTokenRequest(accessLevel: accessLevel, datasetId: report.DatasetId, allowSaveAs: true);
                    }
                    tokenResponse = await client.Reports.GenerateTokenForCreateAsync(groupId: GroupId, requestParameters: generateTokenRequestParameters);
                }
                else
                {
                    // Generate Token Request Parameters
                    if (!string.IsNullOrEmpty(username)) {
                        var rls = new EffectiveIdentity(username, new List<string> { report.DatasetId });
                        generateTokenRequestParameters = new GenerateTokenRequest
                        (
                            accessLevel: accessLevel,
                            datasetId: report.DatasetId,
                            allowSaveAs: false,
                            identities: new List<EffectiveIdentity> { rls }
                        );
                    }
                    else
                    {
                        generateTokenRequestParameters = new GenerateTokenRequest(accessLevel: accessLevel);
                    }
                    tokenResponse = await client.Reports.GenerateTokenInGroupAsync(GroupId, report.Id, generateTokenRequestParameters);
                }
                if (tokenResponse == null)
                {
                    throw new System.Exception("Failed to generate embed token.");
                }
                // Generate Embed Configuration.
                string tokenType = String.IsNullOrEmpty(ADcode) ? "embed" : "AAD";
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
