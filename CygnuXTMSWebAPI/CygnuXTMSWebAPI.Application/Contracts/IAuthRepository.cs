using CygnuXTMSWebAPI.Application.Models.Request;
using CygnuXTMSWebAPI.Application.Models.Request.Auth;
using CygnuXTMSWebAPI.External.Models;
using CygnuXTMSWebAPI.Infrastructure.Models.Response;

namespace CygnuXTMSWebAPI.Application.Contracts
{
    public interface IAuthRepository
    {
        public Task<BaseResponse<LoginResponse>> LoginAsync(UserLoginRequest loginRequest);

        public Task<BaseResponse<RefreshTokenResponse>> GetRefreshTokenAsync(TokenRequest tokenRequest);

        Task<BaseResponse<RefreshTokenResponse>> GenerateRefreshTokenAsync(string userId);
    }
}
