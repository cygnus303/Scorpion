using CygnuXTMSWebAPI.Application.Contracts;
using CygnuXTMSWebAPI.External.Models;
using CygnuXTMSWebAPI.Infrastructure.Constants;
using CygnuXTMSWebAPI.Infrastructure.Contracts;
using CygnuXTMSWebAPI.Infrastructure.Models.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.Application.Implementations
{
    public class GeneralMasterRepository : IGeneralMasterRepository
    {
        private readonly IGeneralMasterService _generalMasterService;

        public GeneralMasterRepository(IGeneralMasterService GeneralMasterService)
        {
            _generalMasterService = GeneralMasterService;
        }

        public async Task<BaseResponse<IEnumerable<GeneralMasterResponse>>> GetGeneralMasterList(string codeType, string? searchText, CancellationToken cancellationToken)
        {
            var response = await _generalMasterService.GetGeneralMasterList(codeType, searchText, cancellationToken);

            return new BaseResponse<IEnumerable<GeneralMasterResponse>>(response);
        }

      

        

       
    }
}
