using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactVentas.Models;
using ReactVentas.Models.DTO;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UtilidadController : ControllerBase
    {
        private readonly DBREACT_VENTAContext _context;

        public UtilidadController(DBREACT_VENTAContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("Dashboard")]
        public async Task<IActionResult> Dashboard(
            string? dateRange = "Hoy",
            string? startDate = null,
            string? endDate = null,
            string? productSort = "most"
        )
        {
            // Initialize a new dashboard configuration object.
            DtoDashboard config = new DtoDashboard();

            // Calculate date ranges based on parameters
            DateTime fecha, fecha2;
            
            if (dateRange == "Elegir rango" && !string.IsNullOrEmpty(startDate) && !string.IsNullOrEmpty(endDate))
            {
                fecha = DateTime.ParseExact(startDate, "yyyy-MM-dd", null).Date;
                fecha2 = DateTime.ParseExact(endDate, "yyyy-MM-dd", null).Date;
            }
            else if (dateRange == "Este mes")
            {
                var today = DateTime.Now;
                fecha = new DateTime(today.Year, today.Month, 1);
                fecha2 = today;
            }
            else if (dateRange == "Esta semana")
            {
                fecha2 = DateTime.Now;
                fecha = fecha2.AddDays(-7);
            }
            else // Default: "Hoy"
            {
                fecha = DateTime.Now.Date; // Start of today (00:00:00)
                fecha2 = DateTime.Now.Date; // Same day
            }

            // For total stats, we'll use a 30-day period regardless of chart filters
            DateTime fechaStats = DateTime.Now.AddDays(-30);

            try
            {
                // Calculate total sales in the last 30 days.
                config.TotalVentas = _context.Venta
                    .Where(v => v.FechaRegistro >= fechaStats)
                    .Count()
                    .ToString();

                // Calculate total revenue in the last 30 days.
                config.TotalIngresos = _context.Venta
                    .Where(v => v.FechaRegistro >= fechaStats)
                    .Sum(v => v.Total)
                    .ToString();

                // Calculate the total number of active products.
                config.TotalProductos = _context.Productos
                    .Where(p => p.EsActivo == true)
                    .Count()
                    .ToString();

                // Calculate the total number of active categories.
                config.TotalCategorias = _context.Categoria
                    .Where(c => c.EsActivo == true)
                    .Count()
                    .ToString();

                // Get products sold based on the specified date range and sort order
                var productQueryBase = from p in _context.Productos
                                       join d in _context.DetalleVenta on p.IdProducto equals d.IdProducto
                                       join v in _context.Venta on d.IdVenta equals v.IdVenta
                                       where v.FechaRegistro.Value.Date >= fecha.Date && v.FechaRegistro.Value.Date <= fecha2.Date
                                       group d by p.Nombre into g
                                       select new 
                                       {
                                           Producto = g.Key,
                                           TotalQuantity = g.Sum(x => x.Cantidad ?? 0),
                                           TotalSales = g.Sum(x => x.Total ?? 0)
                                       };

                // Apply sorting based on productSort parameter
                if (productSort == "least")
                {
                    config.ProductosVendidos = productQueryBase
                        .OrderBy(p => p.TotalQuantity)
                        .Take(4)
                        .Select(p => new DtoProductoVendidos
                        {
                            Producto = p.Producto,
                            Total = p.TotalQuantity.ToString(),
                            Ventas = p.TotalSales.ToString("F2")
                        })
                        .ToList();
                }
                else // "most" (default)
                {
                    config.ProductosVendidos = productQueryBase
                        .OrderByDescending(p => p.TotalQuantity)
                        .Take(4)
                        .Select(p => new DtoProductoVendidos
                        {
                            Producto = p.Producto,
                            Total = p.TotalQuantity.ToString(),
                            Ventas = p.TotalSales.ToString("F2")
                        })
                        .ToList();
                }

                // Get sales count grouped by day for the specified date range with products
                var ventasConProductos = from v in _context.Venta
                                         join d in _context.DetalleVenta on v.IdVenta equals d.IdVenta
                                         join p in _context.Productos on d.IdProducto equals p.IdProducto
                                         where v.FechaRegistro.Value.Date >= fecha.Date && v.FechaRegistro.Value.Date <= fecha2.Date
                                         select new
                                         {
                                             Fecha = v.FechaRegistro.Value.Date,
                                             VentaId = v.IdVenta,
                                             Producto = p.Nombre,
                                             Cantidad = d.Cantidad ?? 0,
                                             TotalVenta = d.Total ?? 0
                                         };

                var ventasGrouped = ventasConProductos.ToList()
                    .GroupBy(v => v.Fecha)
                    .OrderBy(g => g.Key)
                    .Select(g => new DtoVentasDias
                    {
                        Fecha = g.Key.ToString("dd/MM/yyyy"),
                        Total = g.Select(x => x.VentaId).Distinct().Count().ToString(),
                        ProductosVendidos = g.GroupBy(x => x.Producto)
                            .Select(pg => new DtoProductoVendidos
                            {
                                Producto = pg.Key,
                                Total = pg.Sum(x => x.Cantidad).ToString(),
                                Ventas = pg.Sum(x => x.TotalVenta).ToString("F2")
                            }).ToList()
                    })
                    .ToList();

                config.VentasporDias = ventasGrouped;

                // Return the dashboard configuration with a 200 OK status.
                return StatusCode(StatusCodes.Status200OK, config);
            }
            catch (Exception ex)
            {
                // Return a 500 Internal Server Error status if an exception occurs.
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
            }
        }
    }
}
