using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.External.Entities
{
    public class ApplicationRole : IdentityRole
    {
        public string EntryBy { get; set; } = string.Empty;
        public DateTime EntryDate { get; set; }
    }
}
