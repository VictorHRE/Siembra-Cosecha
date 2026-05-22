namespace ReactVentas.Models.DTO
{
    public class DtoHistorialProducto
    {
        public int IdHistorialProducto { get; set; }
        public int IdProducto { get; set; }
        public int IdUsuario { get; set; }
        public int UnidadesAgregadas { get; set; }
        public string FechaRegistro { get; set; } = null!;
        public string? NombreUsuario { get; set; }
        public string? NombreProducto { get; set; }
    }
}