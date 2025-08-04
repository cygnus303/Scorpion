using CygnuXTMSWebAPI.Application.Contracts;
using CygnuXTMSWebAPI.Application.Implementations;
using CygnuXTMSWebAPI.External.IoC;
using CygnuXTMSWebAPI.Infrastructure.IoC;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CygnuXTMSWebAPI.Application.Ioc
{
    public static class ServiceRegistration
    {
        public static void ConfigureApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            // ⬇️ Register external services first (includes IAuthService, etc.)
            services.ConfigureExternalServices(configuration);

            // ⬇️ Register infrastructure services
            services.ConfigureInfrastructureServices(configuration);

            // ⬇️ NOW register AuthRepository AFTER its dependencies are available
            services.AddScoped<IAuthRepository, AuthRepository>();
            services.AddScoped<IGeneralMasterRepository, GeneralMasterRepository>();

        }
    }

}
