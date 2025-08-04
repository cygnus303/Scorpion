using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CygnuXTMSWebAPI.External.Models
{
    public class DocketDetailResponse
    {
        public string BookingBranch { get; set; } = string.Empty;// Origin
        public string ReassigN_DESTCD { get; set; } = string.Empty; // Destination
        public string DktStatus { get; set; } = string.Empty;
        public string PartyName { get; set; } = string.Empty;
    }
}
