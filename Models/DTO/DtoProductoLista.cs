namespace ReactVentas.Models.DTO
{
    /// <summary>
    /// DTO for product listing that includes category and supplier information without circular references
    /// </summary>
    public class DtoProductoLista
    {
        public int IdProducto { get; set; }
        public string? Nombre { get; set; }
        public string? Descripcion { get; set; }
        public int? IdCategoria { get; set; }
        public int? IdProveedor { get; set; }
        public decimal? Precio { get; set; }
        public int? Unidades { get; set; }
        public bool? EsActivo { get; set; }
        public DateTime? FechaRegistro { get; set; }

        // Related data without circular references
        public DtoCategoriaSimple? IdCategoriaNavigation { get; set; }
        public DtoProveedorSimple? IdProveedorNavigation { get; set; }
    }

    /// <summary>
    /// Simple category DTO to avoid circular references
    /// </summary>
    public class DtoCategoriaSimple
    {
        public int IdCategoria { get; set; }
        public string? Descripcion { get; set; }
        public bool? EsActivo { get; set; }
    }

    /// <summary>
    /// Simple supplier DTO to avoid circular references
    /// </summary>
    public class DtoProveedorSimple
    {
        public int IdProveedor { get; set; }
        public string? Nombre { get; set; }
        public string? Correo { get; set; }
        public string? Telefono { get; set; }
        public bool? EsActivo { get; set; }
    }
}