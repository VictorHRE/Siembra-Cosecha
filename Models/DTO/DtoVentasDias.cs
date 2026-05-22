namespace ReactVentas.Models.DTO
{
    public class DtoVentasDias
    {
        public string Fecha { get; set; }
        public string Total { get; set; }
        public List<DtoProductoVendidos> ProductosVendidos { get; set; }
    }
}
