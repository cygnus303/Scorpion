using CygnuXTMSWebAPI.External.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.External.Contracts
{
    public interface IJwtService
    {
        public string GenerateEncodedToken(ApplicationUser userFromRepo);
        public string GenerateRefreshToken();
    }
}
