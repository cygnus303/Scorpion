using CygnuXTMSWebAPI.IoC;
using CygnuXTMSWebAPI.Middleware;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);
builder.Services.ConfigureApiServices(builder.Configuration);

var app = builder.Build();
app.Services.GetRequiredService<IWebHostEnvironment>();
//Console.WriteLine("Content Root Path: " + env.ContentRootPath);
var loggerFactory = app.Services.GetService<ILoggerFactory>();
loggerFactory?.AddFile(builder.Configuration["Logging:LogFilePath"]?.ToString());

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Cygnux.CRM.API v1"));
app.UseCors("AllowOrigin");
app.UseHttpsRedirection();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.UseMiddleware<AuthorizationHeaderMiddleware>();
app.UseMiddleware<ExceptionMiddleware>();

await app.RunAsync();