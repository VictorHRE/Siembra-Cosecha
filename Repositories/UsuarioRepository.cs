using Microsoft.EntityFrameworkCore;
using ReactVentas.Interfaces;
using ReactVentas.Models;

namespace ReactVentas.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad Usuario
    /// </summary>
    public class UsuarioRepository : BaseRepository<Usuario>, IUsuarioRepository
    {
        public UsuarioRepository(DBREACT_VENTAContext context) : base(context)
        {
        }

        /// <summary>
        /// Obtiene usuarios con su información de rol (todos los registros)
        /// </summary>
        public async Task<List<Usuario>> GetUsersWithRoleAsync()
        {
            return await _dbSet
                .Include(u => u.IdRolNavigation)
                .OrderByDescending(u => u.IdUsuario)
                .ToListAsync();
        }

        /// <summary>
        /// Obtiene usuarios activos con su información de rol
        /// </summary>
        public async Task<List<Usuario>> GetActiveUsersWithRoleAsync()
        {
            return await _dbSet
                .Include(u => u.IdRolNavigation)
                .Where(u => u.EsActivo == true)
                .OrderByDescending(u => u.IdUsuario)
                .ToListAsync();
        }

        /// <summary>
        /// Obtiene un usuario activo por correo o nombre
        /// </summary>
        public async Task<Usuario?> GetByCorreoONombreAsync(string identificador)
        {
            var criterio = identificador.Trim().ToLower();

            return await _dbSet
                .Include(u => u.IdRolNavigation)
                .FirstOrDefaultAsync(u =>
                    u.EsActivo == true &&
                    (
                        ((u.Correo ?? string.Empty).ToLower() == criterio) ||
                        ((u.Nombre ?? string.Empty).ToLower() == criterio)
                    ));
        }

        /// <summary>
        /// Obtiene usuarios por rol
        /// </summary>
        public async Task<List<Usuario>> GetUsersByRoleAsync(int rolId)
        {
            return await _dbSet
                .Include(u => u.IdRolNavigation)
                .Where(u => u.IdRol == rolId && u.EsActivo == true)
                .OrderByDescending(u => u.IdUsuario)
                .ToListAsync();
        }

        /// <summary>
        /// Sobrescribe GetAllAsync para incluir información de rol
        /// </summary>
        public override async Task<List<Usuario>> GetAllAsync()
        {
            return await GetUsersWithRoleAsync();
        }

        /// <summary>
        ///     
        public async Task<Usuario> GetUserWithRelatedDataByIdAsync(int id)
        {
            return await _dbSet
                .Include(p => p.IdRolNavigation)
                .FirstOrDefaultAsync(p => p.IdUsuario == id);
        }
    }
}