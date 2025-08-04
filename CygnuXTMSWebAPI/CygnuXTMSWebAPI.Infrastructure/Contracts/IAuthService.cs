using CygnuXTMSWebAPI.External.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.Infrastructure.Contracts
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(string email, string password);
    }
}
