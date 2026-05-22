using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReactVentas.Models.DTO;
using ReactVentas.Interfaces;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HistorialProductoController : ControllerBase
    {
        private readonly IHistorialProductoRepository _historialProductoRepository;

        public HistorialProductoController(IHistorialProductoRepository historialProductoRepository)
        {
            _historialProductoRepository = historialProductoRepository;
        }

        [HttpGet]
        [Route("GetHistorialByProducto/{productId:int}")]
        public async Task<IActionResult> GetHistorialByProducto(int productId)
        {
            try
            {
                var historial = await _historialProductoRepository.GetHistoryByProductIdAsync(productId);
                return StatusCode(StatusCodes.Status200OK, historial);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}