using CygnuXTMSWebAPI.External.Models;
using CygnuXTMSWebAPI.External.Options;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Text;

namespace CygnuXTMSWebAPI.External.Client
{
    public class TmsApiClient : BaseApiClient, ITmsApiClient
    {
        private readonly TMSApiOptions _options;

        public TmsApiClient(IHttpClientFactory httpClientFactory,
            IOptions<TMSApiOptions> options) :
            base(httpClientFactory.CreateClient(TMSApiOptions.TmsApis))
        {
            _options = options.Value;
        }

        public async Task<ApiClientResponse<List<GeneralMasterResponse?>>> SendGeneralMasterRequestAsync(string codeType, string searchText, CancellationToken cancellationToken)
        {
            var apiUrl = BuildApiUrl($"{_options.GeneralMasterUrl}{codeType}");

            var response = await SendRequestAsync<BaseApiResponse<GeneralMasterResponse>>(apiUrl, HttpMethod.Get, cancellationToken: cancellationToken);

            return response.IsSuccess ? ApiClientResponse<List<GeneralMasterResponse?>>.Success(response.Data?.Data) : ApiClientResponse<List<GeneralMasterResponse?>>.Failure(response.ErrorMessage);
        }

        public async Task<ApiClientResponse<List<LocationMasterResponse?>>> SendLocationMasterRequestAsync(CancellationToken cancellationToken)
        {
            var apiUrl = BuildApiUrl(_options.LocationMasterUrl);

            var response = await SendRequestAsync<BaseApiResponse<LocationMasterResponse>>(apiUrl, HttpMethod.Get, cancellationToken: cancellationToken);

            return response.IsSuccess ? ApiClientResponse<List<LocationMasterResponse?>>.Success(response.Data?.Data) : ApiClientResponse<List<LocationMasterResponse?>>.Failure(response.ErrorMessage);
        }
        public async Task<ApiClientResponse<LoginResponse>> SendLoginRequestAsync(string username, string password, CancellationToken cancellationToken)
        {
            var apiUrl = BuildApiUrl(_options.LoginUrl);
            var content = new
            {
                username = username,
                password = password
            };

            // Serialize the content to JSON
            var jsonContent = JsonConvert.SerializeObject(content); // or JsonSerializer.Serialize(content) for System.Text.Json
            var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            var response = await SendRequestAsync<BaseApiSingularResponse<LoginResponse>>(apiUrl, HttpMethod.Post, httpContent, cancellationToken: cancellationToken);
            var result = response.Data?.Data;
            if (result is not null)
            {
                return response.IsSuccess ? ApiClientResponse<LoginResponse>.Success(response.Data?.Data) : ApiClientResponse<LoginResponse>.Failure(response.ErrorMessage);
            }
            return ApiClientResponse<LoginResponse>.Failure("User name or password incorrect");
        }

        public async Task<ApiClientResponse<List<CityResponse>>> SendCityMasterRequestAsync(CancellationToken cancellationToken)
        {
            var apiUrl = BuildApiUrl(_options.CityUrl);

            var response = await SendRequestAsync<BaseApiSingularResponse<BaseCityResponse>>(apiUrl, HttpMethod.Post, cancellationToken: cancellationToken);
            var result = response.Data?.Data;
            if (result is not null)
            {
                return response.IsSuccess ? ApiClientResponse<List<CityResponse>>.Success(result.CityList) : ApiClientResponse<List<CityResponse>>.Failure(response.ErrorMessage);

            }
            return ApiClientResponse<List<CityResponse>>.Failure(response.ErrorMessage);
        }
   

    }
}
