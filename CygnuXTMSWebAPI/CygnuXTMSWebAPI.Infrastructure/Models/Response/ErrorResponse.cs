using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.Infrastructure.Models.Response
{
    public class ErrorResponse
    {
        public int ErrorCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public object? Details { get; set; }
    }
}
