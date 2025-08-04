using CygnuXTMSWebAPI.Infrastructure.Constants;
using CygnuXTMSWebAPI.Infrastructure.Contracts;
using CygnuXTMSWebAPI.Infrastructure.Models.Response;
using Dapper;
using System.Data;

namespace CygnuXTMSWebAPI.Infrastructure.Implementations
{
    internal class UserService : IUserService
    {
        private readonly IDbConnection _dbConnection;

        public UserService(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection;
        }

        public async Task<RefreshTokenResponse> GetRefreshTokenAsync(string token)
        {

            var parameters = new DynamicParameters();
            parameters.Add("@Token", token, DbType.String);

            var refreshToken = await _dbConnection.QueryFirstOrDefaultAsync<RefreshTokenResponse>(
                StoredProcedureConstants.Usp_GetRefreshToken,
                param: parameters,
                commandType: CommandType.StoredProcedure
            ) ?? new RefreshTokenResponse();

            return refreshToken;
        }

        public async Task<CommonCreateResponse> AddRefreshTroken(string addTokenJson)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@TokenJson", addTokenJson, DbType.String);

            return await _dbConnection.QueryFirstOrDefaultAsync<CommonCreateResponse>(
                StoredProcedureConstants.Usp_RefreshToken,
                param: parameters,
                commandType: CommandType.StoredProcedure
            ) ?? new CommonCreateResponse();
        }
    }
}
