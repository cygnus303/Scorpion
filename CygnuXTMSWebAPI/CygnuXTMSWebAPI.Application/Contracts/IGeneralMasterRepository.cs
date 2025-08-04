using CygnuXTMSWebAPI.External.Models;
using CygnuXTMSWebAPI.Infrastructure.Models.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.Application.Contracts
{
    public interface IGeneralMasterRepository
    {
        Task<BaseResponse<IEnumerable<GeneralMasterResponse>>> GetGeneralMasterList(string codeType, string? searchText, CancellationToken cancellationToken);

    }
}
