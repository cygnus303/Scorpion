using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.Infrastructure.Models.Response
{
    public class CommonCreateResponse
    {
        public string Message { get; set; } = string.Empty;

        public int Status { get; set; } = 0;

        public string? Id { get; set; } = string.Empty;
    }
}
