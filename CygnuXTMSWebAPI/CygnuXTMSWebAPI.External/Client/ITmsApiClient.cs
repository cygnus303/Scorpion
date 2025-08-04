using CygnuXTMSWebAPI.External.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.External.Client
{
    public interface ITmsApiClient
    {
        Task<ApiClientResponse<List<GeneralMasterResponse?>>> SendGeneralMasterRequestAsync(string codeType, string searchText, CancellationToken cancellationToken);

        /*Task<ApiClientResponse<List<LocationMasterResponse?>>> SendLocationMasterRequestAsync(string userId, CancellationToken cancellationToken);*/
        Task<ApiClientResponse<List<LocationMasterResponse?>>> SendLocationMasterRequestAsync(CancellationToken cancellationToken);
        Task<ApiClientResponse<LoginResponse>> SendLoginRequestAsync(string username, string password, CancellationToken cancellationToken);
        Task<ApiClientResponse<List<CityResponse>>> SendCityMasterRequestAsync(CancellationToken cancellationToken);
    }

}
