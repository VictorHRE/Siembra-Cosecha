using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReactVentas.Models;
using ReactVentas.Models.DTO;
using ReactVentas.Services;
using ReactVentas.Interfaces;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SessionController : ControllerBase
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IPasswordService _passwordService;

        public SessionController(IUsuarioRepository usuarioRepository, IPasswordService passwordService)
        {
            _usuarioRepository = usuarioRepository;
            _passwordService = passwordService;
        }

        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login([FromBody] Dtosesion request)
        {
            Usuario usuario = new Usuario();
            try
            {
                if (string.IsNullOrWhiteSpace(request.correo) || string.IsNullOrWhiteSpace(request.clave))
                {
                    return StatusCode(StatusCodes.Status400BadRequest, new { message = "Debe enviar usuario o correo y contraseña" });
                }

                usuario = await _usuarioRepository.GetByCorreoONombreAsync(request.correo);

                // NOTE: Using different status codes for email not found vs incorrect password
                // can potentially allow email enumeration attacks. This is implemented per
                // explicit requirement but should be considered in security audits.
                if (usuario == null)
                {
                    return StatusCode(StatusCodes.Status404NotFound, new { message = "Usuario o correo no encontrado" });
                }

                if (!_passwordService.VerifyPassword(request.clave, usuario.Clave))
                {
                    return StatusCode(StatusCodes.Status401Unauthorized, new { message = "Contraseña incorrecta" });
                }

                return StatusCode(StatusCodes.Status200OK, usuario);
            }
            catch
            {
                return StatusCode(StatusCodes.Status500InternalServerError, usuario);
            }
        }
    }
}