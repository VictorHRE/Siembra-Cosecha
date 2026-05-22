using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReactVentas.Models;
using ReactVentas.Models.DTO;
using ReactVentas.Interfaces;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductoController : ControllerBase
    {
        private readonly IProductoRepository _productoRepository;
        private readonly IHistorialProductoRepository _historialProductoRepository;

        public ProductoController(IProductoRepository productoRepository, IHistorialProductoRepository historialProductoRepository)
        {
            _productoRepository = productoRepository;
            _historialProductoRepository = historialProductoRepository;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            // Retrieves a list of products including their category and supplier information, ordered by product ID in descending order.
            try
            {
                var productos = await _productoRepository.GetProductsWithRelatedDataAsync();
                
                // Convert to DTO to avoid circular references
                var productosDto = productos.Select(p => new DtoProductoLista
                {
                    IdProducto = p.IdProducto,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    IdCategoria = p.IdCategoria,
                    IdProveedor = p.IdProveedor,
                    Precio = p.Precio,
                    Unidades = p.Unidades,
                    EsActivo = p.EsActivo,
                    FechaRegistro = p.FechaRegistro,
                    IdCategoriaNavigation = p.IdCategoriaNavigation != null ? new DtoCategoriaSimple
                    {
                        IdCategoria = p.IdCategoriaNavigation.IdCategoria,
                        Descripcion = p.IdCategoriaNavigation.Descripcion,
                        EsActivo = p.IdCategoriaNavigation.EsActivo
                    } : null,
                    IdProveedorNavigation = p.IdProveedorNavigation != null ? new DtoProveedorSimple
                    {
                        IdProveedor = p.IdProveedorNavigation.IdProveedor,
                        Nombre = p.IdProveedorNavigation.Nombre,
                        Correo = p.IdProveedorNavigation.Correo,
                        Telefono = p.IdProveedorNavigation.Telefono,
                        EsActivo = p.IdProveedorNavigation.EsActivo
                    } : null
                }).ToList();

                return StatusCode(StatusCodes.Status200OK, productosDto);
            }
            catch (Exception ex)
            {
                // Log the exception for debugging
                System.Console.WriteLine($"Error in ProductoController.Lista: {ex.Message}");
                // Returns a 500 Internal Server Error status if an exception occurs.
                return StatusCode(StatusCodes.Status500InternalServerError, new List<DtoProductoLista>());
            }
        }

        [HttpPost]
        [Route("Guardar")]
        public async Task<IActionResult> Guardar([FromBody] Producto request)
        {
            // Adds a new product to the database.
            try
            {
                if (!request.IdCategoria.HasValue || request.IdCategoria.Value <= 0)
                    return StatusCode(StatusCodes.Status400BadRequest, "La categoría es obligatoria");

                // Convert 0 to null for optional foreign keys to allow saving without provider
                if (request.IdProveedor == 0)
                    request.IdProveedor = null;
                
                // Ensure Unidades is either null or a positive integer
                if (request.Unidades.HasValue && request.Unidades.Value < 0)
                    request.Unidades = null;

               var newProduct = await _productoRepository.AddAsync(request);
                await _productoRepository.SaveChangesAsync();

                // Returns a 200 OK status on successful save.
                return StatusCode(StatusCodes.Status200OK, "ok");
            }
            catch (Exception ex)
            {
                // Returns a 500 Internal Server Error status if an exception occurs during saving.
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPut]
        [Route("Editar")]
        public async Task<IActionResult> Editar([FromBody] Producto request)
        {
            // Updates an existing product in the database.
            try
            {
                if (!request.IdCategoria.HasValue || request.IdCategoria.Value <= 0)
                    return StatusCode(StatusCodes.Status400BadRequest, "La categoría es obligatoria");

                // Convert 0 to null for optional foreign keys to allow saving without provider
                if (request.IdProveedor == 0)
                    request.IdProveedor = null;
                
                // Ensure Unidades is either null or a positive integer
                if (request.Unidades.HasValue && request.Unidades.Value < 0)
                    request.Unidades = null;

                await _productoRepository.UpdateAsync(request);
                await _productoRepository.SaveChangesAsync();

                // Returns a 200 OK status on successful update.
                return StatusCode(StatusCodes.Status200OK, "ok");
            }
            catch (Exception ex)
            {
                // Returns a 500 Internal Server Error status if an exception occurs during update.
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPut]
        [Route("AgregarUnidades/{id:int}")]
        public async Task<IActionResult> AgregarUnidades(int id, [FromBody] DtoAgregarUnidades request)
        {
            // Adds units to an existing product and saves history.
            try
            {
                var producto = await _productoRepository.GetByIdAsync(id);
                if (producto == null)
                {
                    return StatusCode(StatusCodes.Status404NotFound, "Producto not found");
                }

                // Add units to current amount
                producto.Unidades = (producto.Unidades ?? 0) + request.UnidadesAAgregar;
                
                await _productoRepository.UpdateAsync(producto);
                
                // Create history entry
                await _historialProductoRepository.CreateHistoryEntryAsync(id, request.IdUsuario, request.UnidadesAAgregar);
                
                // Save both product update and history entry
                await _productoRepository.SaveChangesAsync();
                await _historialProductoRepository.SaveChangesAsync();

                // Returns a 200 OK status on successful update.
                return StatusCode(StatusCodes.Status200OK, "ok");
            }
            catch (Exception ex)
            {
                // Returns a 500 Internal Server Error status if an exception occurs during update.
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpDelete]
        [Route("Eliminar/{id:int}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            // Performs soft delete by setting EsActivo to false instead of removing the record.
            try
            {
                var result = await _productoRepository.SoftDeleteAsync(id);
                if (result)
                {
                    await _productoRepository.SaveChangesAsync();
                    
                    return StatusCode(StatusCodes.Status200OK, "ok");
                }
                else
                {
                    return StatusCode(StatusCodes.Status404NotFound, "Producto not found");
                }
            }
            catch (Exception ex)
            {
                // Returns a 500 Internal Server Error status if an exception occurs during deletion.
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}
