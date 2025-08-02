using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.Infrastructure.Contracts
{
    public interface IUserSettings
    {
        string? UserId { get; set; }
        string? CreatedBy { get; set; }
        string? ModifiedBy { get; set; }
    }
}
