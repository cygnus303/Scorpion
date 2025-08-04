using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.External.Models
{
    public class BaseApiResponse<T>
    {
        public int StatusCode { get; set; }

        public int Status { get; set; }

        public List<T?> Data { get; set; }

    }

    public class BaseApiSingularResponse<T>
    {
        public int StatusCode { get; set; }

        public int Status { get; set; }

        public T? Data { get; set; }

    }
}
