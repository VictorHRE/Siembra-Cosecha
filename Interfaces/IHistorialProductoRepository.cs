using ReactVentas.Models;
using ReactVentas.Models.DTO;

namespace ReactVentas.Interfaces
{
    /// <summary>
    /// Interface for product history repository operations
    /// </summary>
    public interface IHistorialProductoRepository : IBaseRepository<HistorialProducto>
    {
        /// <summary>
        /// Gets product history entries for a specific product with user information
        /// </summary>
        /// <param name="productId">Product identifier</param>
        /// <returns>List of product history entries with user information</returns>
        Task<List<DtoHistorialProducto>> GetHistoryByProductIdAsync(int productId);

        /// <summary>
        /// Creates a new product history entry
        /// </summary>
        /// <param name="productId">Product identifier</param>
        /// <param name="userId">User identifier</param>
        /// <param name="unitsAdded">Number of units added</param>
        /// <returns>Created history entry</returns>
        Task<HistorialProducto> CreateHistoryEntryAsync(int productId, int userId, int unitsAdded);
    }
}