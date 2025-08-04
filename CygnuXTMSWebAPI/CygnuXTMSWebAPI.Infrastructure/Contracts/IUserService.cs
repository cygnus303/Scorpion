using CygnuXTMSWebAPI.Infrastructure.Models.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.Infrastructure.Contracts
{
    public interface IUserService
    {

        Task<RefreshTokenResponse> GetRefreshTokenAsync(string token);

        Task<CommonCreateResponse> AddRefreshTroken(string addTokenJson);
    }
}
