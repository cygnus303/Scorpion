using CygnuXTMSWebAPI.External.Entities;
using Microsoft.AspNetCore.Identity;


namespace CygnuXTMSWebAPI.External.Contracts
{
    public interface IUserService
    {
        Task<IdentityResult> AddUser(ApplicationUser applicationUser);

        Task<IdentityResult> UpdateUser(string id, ApplicationUser applicationUser);
    }
}
