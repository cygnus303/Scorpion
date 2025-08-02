using CygnuXTMSWebAPI.Infrastructure.IoC;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CygnuXTMSWebAPI.Application.Ioc
{
    public static class ServiceRegistration
    {
        public static void ConfigureApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
           
            //services.ConfigureExternalServices(configuration);
            services.ConfigureInfrastructureServices(configuration);
        }
    }
}
