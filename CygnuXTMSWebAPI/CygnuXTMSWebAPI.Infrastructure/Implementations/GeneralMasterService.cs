using CygnuXTMSWebAPI.External.Models;
using CygnuXTMSWebAPI.Infrastructure.Constants;
using CygnuXTMSWebAPI.Infrastructure.Contracts;
using Dapper;
using Microsoft.Graph.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

internal class GeneralMasterService : IGeneralMasterService
{
    private readonly IDbConnection _dbConnection;

    public GeneralMasterService(IDbConnection dbConnection)
    {
        _dbConnection = dbConnection;
    }
    public async Task<IEnumerable<GeneralMasterResponse>> GetGeneralMasterList(string codeType, string? searchText, CancellationToken cancellationToken)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@CodeType", codeType, DbType.String);
        if (!string.IsNullOrWhiteSpace(searchText))
        {
            parameters.Add("@SearchText", searchText, DbType.String);
        }
        return await _dbConnection.QueryAsync<GeneralMasterResponse>(
             StoredProcedureConstants.Usp_GetGeneralMaster,
             parameters,
             commandType: CommandType.StoredProcedure
         );
    }
}
