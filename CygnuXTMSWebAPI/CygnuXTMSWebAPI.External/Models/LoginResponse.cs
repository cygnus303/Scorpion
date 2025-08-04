using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.External.Models
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public string BranchCode { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public string EmailId { get; set; } = string.Empty;
        public string UserImage { get; set; } = string.Empty;
        public string BaseCompanyCode { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public string FinYear { get; set; } = string.Empty;
        public string DesignationId { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string ReportingLoc { get; set; } = string.Empty;
        public string ReportLocName { get; set; } = string.Empty;
        public List<LocationMasterResponse> MultiLocation { get; set; }

    }
}
