using Microsoft.EntityFrameworkCore;
using ReactVentas.Interfaces;
using ReactVentas.Models;
using ReactVentas.Models.DTO;

namespace ReactVentas.Repositories
{
    /// <summary>
    /// Implementation of the repository for the HistorialProducto entity
    /// </summary>
    public class HistorialProductoRepository : BaseRepository<HistorialProducto>, IHistorialProductoRepository
    {
        public HistorialProductoRepository(DBREACT_VENTAContext context) : base(context)
        {
        }

        /// <summary>
        /// Gets product history entries for a specific product with user information
        /// </summary>
        public async Task<List<DtoHistorialProducto>> GetHistoryByProductIdAsync(int productId)
        {
            var historyEntries = await _dbSet
                .Include(h => h.IdUsuarioNavigation)
                .Include(h => h.IdProductoNavigation)
                .Where(h => h.IdProducto == productId)
                .OrderByDescending(h => h.FechaRegistro)
                .Select(h => new DtoHistorialProducto
                {
                    IdHistorialProducto = h.IdHistorialProducto,
                    IdProducto = h.IdProducto,
                    IdUsuario = h.IdUsuario,
                    UnidadesAgregadas = h.UnidadesAgregadas,
                    FechaRegistro = h.FechaRegistro.Value.ToString("dd/MM/yyyy HH:mm:ss"),
                    NombreUsuario = h.IdUsuarioNavigation != null ? h.IdUsuarioNavigation.Nombre : "Usuario desconocido",
                    NombreProducto = h.IdProductoNavigation != null ? h.IdProductoNavigation.Nombre : "Producto desconocido"
                })
                .ToListAsync();

            return historyEntries;
        }

        /// <summary>
        /// Creates a new product history entry
        /// </summary>
        public async Task<HistorialProducto> CreateHistoryEntryAsync(int productId, int userId, int unitsAdded)
        {
            var historyEntry = new HistorialProducto
            {
                IdProducto = productId,
                IdUsuario = userId,
                UnidadesAgregadas = unitsAdded,
            };

            await _dbSet.AddAsync(historyEntry);
            return historyEntry;
        }
    }
}