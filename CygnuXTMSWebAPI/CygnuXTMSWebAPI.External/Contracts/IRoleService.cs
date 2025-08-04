using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.External.Contracts
{
    public interface IRoleService
    {
        Task<IdentityResult> AddRole(string roleName);

        Task<IdentityResult> UpdateRole(string roleId, string newRoleName);
    }
}
