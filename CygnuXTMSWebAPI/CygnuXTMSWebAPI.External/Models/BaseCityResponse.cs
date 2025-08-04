using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.External.Models
{
    public class BaseCityResponse
    {
        public string Location { get; set; } = string.Empty;

        public List<CityResponse> CityList { get; set; }
    }
}
