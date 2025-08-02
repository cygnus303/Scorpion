using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.Infrastructure.Models.Response
{
    public class BaseResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public ErrorResponse? Error { get; set; }
        public int? TotalCount { get; set; }
        public BaseResponse(T data, int? totalCount = 0)
        {
            Success = true;
            Data = data;
            TotalCount = totalCount;
        }

        public BaseResponse(ErrorResponse error)
        {
            Success = false;
            Error = error;
            TotalCount = 0;
        }

        public BaseResponse(T data)
        {
            Success = true;
            Data = data;
            TotalCount = data is ICollection collection ? collection.Count : 0;
        }

    }
}
