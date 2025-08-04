using CygnuXTMSWebAPI.External.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.Infrastructure.Contracts
{
    public interface IGeneralMasterService
    {
        Task<IEnumerable<GeneralMasterResponse>> GetGeneralMasterList(string codeType, string? searchText, CancellationToken cancellationToken);
    }
}
