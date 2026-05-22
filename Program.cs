using System.IO.Compression;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using ReactVentas.Models;
using ReactVentas.Services;
using ReactVentas.Interfaces;
using ReactVentas.Repositories;

var builder = WebApplication.CreateBuilder(args);

// ---------------- Response Compression (solo Gzip para evitar conflictos en Somee) ----------------
builder.Services.AddResponseCompression(opt =>
{
    opt.EnableForHttps = true;
    opt.Providers.Clear();
    opt.Providers.Add<GzipCompressionProvider>();
    opt.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
    {
        "application/json",
        "application/javascript",
        "application/manifest+json",
        "application/xml",
        "image/svg+xml"
    });
});
builder.Services.Configure<GzipCompressionProviderOptions>(o =>
{
    o.Level = CompressionLevel.Fastest; // Cambiar a Optimal si el CPU lo permite
});



// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<DBREACT_VENTAContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("cadenaSQL"));
});

// Registrar servicio de contraseñas
builder.Services.AddScoped<IPasswordService, PasswordService>();

// Registrar repositorios
builder.Services.AddScoped<ICategoriaRepository, CategoriaRepository>();
builder.Services.AddScoped<IProductoRepository, ProductoRepository>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IProveedorRepository, ProveedorRepository>();
builder.Services.AddScoped<IRolRepository, RolRepository>();
builder.Services.AddScoped<IIngresoRepository, IngresoRepository>();
builder.Services.AddScoped<IEgresoRepository, EgresoRepository>();
builder.Services.AddScoped<IModuloRepository, ModuloRepository>();
builder.Services.AddScoped<IUsuarioPermisoRepository, UsuarioPermisoRepository>();
builder.Services.AddScoped<IHistorialProductoRepository, HistorialProductoRepository>();

// Configuración JSON
builder.Services.AddControllers().AddJsonOptions(option =>
{
    option.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// ✅ Habilitar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Forwarded headers (por si Somee usa proxy)
builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// ✅ Solo redirigir a HTTPS si el hosting lo soporta bien
app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseForwardedHeaders();

// Compresión antes de servir estáticos
app.UseResponseCompression();

// Archivos estáticos con control de caché (HTML sin caché, assets con caché largo)
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        var headers = ctx.Context.Response.Headers;
        var name = ctx.File.Name;

        if (name.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
        {
            headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
            headers["Pragma"] = "no-cache";
            headers["Expires"] = "0";
        }
        else
        {
            headers["Cache-Control"] = "public,max-age=2592000,immutable"; // 30 días
        }
    }
});

app.UseRouting();

// ✅ Activar CORS
app.UseCors("AllowAll");

app.MapControllers();

// ✅ Fallback al index.html (para React Router en cualquier dispositivo/navegador)
app.MapFallbackToFile("index.html");

app.Run();
