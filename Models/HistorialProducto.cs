using System;
using System.Collections.Generic;

namespace ReactVentas.Models
{
    /// <summary>
    /// Represents a product history entry that tracks when units are added to products.
    /// </summary>
    public partial class HistorialProducto
    {
        /// <summary>
        /// Gets or sets the unique identifier for the product history entry.
        /// </summary>
        public int IdHistorialProducto { get; set; }

        /// <summary>
        /// Gets or sets the identifier for the product to which units were added.
        /// </summary>
        public int IdProducto { get; set; }

        /// <summary>
        /// Gets or sets the identifier for the user who added the units.
        /// </summary>
        public int IdUsuario { get; set; }

        /// <summary>
        /// Gets or sets the number of units that were added.
        /// </summary>
        public int UnidadesAgregadas { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the units were added.
        /// </summary>
        public DateTime? FechaRegistro { get; set; }

        /// <summary>
        /// Navigation property to the related product entity.
        /// </summary>
        public virtual Producto? IdProductoNavigation { get; set; }

        /// <summary>
        /// Navigation property to the related user entity.
        /// </summary>
        public virtual Usuario? IdUsuarioNavigation { get; set; }
    }
}