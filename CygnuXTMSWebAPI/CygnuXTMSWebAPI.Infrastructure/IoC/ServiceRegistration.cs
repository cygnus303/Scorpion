using CygnuXTMSWebAPI.Infrastructure.Contracts;
using CygnuXTMSWebAPI.Infrastructure.Implementations;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Data;

namespace CygnuXTMSWebAPI.Infrastructure.IoC
{
    public static class ServiceRegistration
    {
        public static void ConfigureInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<IUserSettings, UserSettings>();
            // Add Dapper or other DB connection service
            services.AddScoped<IDbConnection>(sp => new SqlConnection(configuration.GetConnectionString("DefaultConnection")));


            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IGeneralMasterService, GeneralMasterService>();




        }
    }
}
