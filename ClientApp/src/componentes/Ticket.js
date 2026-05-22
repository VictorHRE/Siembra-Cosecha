import React from "react";
import "../views/css/Ticket.css";

const Ticket = React.forwardRef(({ detalleVenta }, ref) => {
  return (
    <div ref={ref} id="ticket-impresion" className="ticket">
      <div className="ticket__header">
        <img 
          src="/Batidos-logo.png" 
          alt="Logo Batidos" 
          className="ticket__logo"
          width={120}
          height={120}
        />
        <p className="ticket__title">SIEMBRAS & COSECHAS</p>

        <p className="ticket__subtitle">Expertos en batidos</p>

        <p className="ticket__address">San Benito</p>
        

        <hr className="ticket__separator" />
      </div>
      <div className="ticket__body">
        <p className="ticket__info">
          <strong>Tipo Pago:</strong> {detalleVenta.tipoPago}
        </p>
        <p className="ticket__info">
          <strong>Moneda:</strong> {detalleVenta.tipoDinero}
        </p>
        <p className="ticket__info">
          <strong>Fecha Registro:</strong> {detalleVenta.fechaRegistro}
        </p>
        <p className="ticket__info">
          <strong>Hora Registro:</strong>
          {detalleVenta.horaRegistro}
        </p>

        <p className="ticket__info">
          <strong>Ticket N.º:</strong> {detalleVenta.numeroDocumento}
        </p>
        <p className="ticket__info">
          <strong>Vendedor:</strong> {detalleVenta.usuarioRegistro}
        </p>
        <hr className="ticket__separator" />
        <table className="ticket__table">
          <thead>
            <tr>
              <th className="ticket__table-header ticket__table-product">
                Producto
              </th>
              <th className="ticket__table-header ticket__table-qty">Cant.</th>
              <th className="ticket__table-header ticket__table-price">
                Precio
              </th>
              <th className="ticket__table-header ticket__table-total">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {detalleVenta.detalle && detalleVenta.detalle.length > 0 ? (
              detalleVenta.detalle.map((item, index) => (
                <tr key={index}>
                  <td className="ticket__table-cell ticket__table-product">
                    -{item.producto}
                  </td>
                  <td className="ticket__table-cell ticket__table-qty">
                    {item.cantidad}
                  </td>
                  <td className="ticket__table-cell ticket__table-price">
                    C${Math.trunc(item.precio)}
                  </td>
                  <td className="ticket__table-cell ticket__table-total">
                    C${Math.trunc(item.total)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="ticket__table-cell ticket__table-cell--center"
                >
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <hr className="ticket__separator" />

        <p className="ticket__info">
          <strong>Total a pagar:</strong> C${detalleVenta.total}
        </p>
        <p className="ticket__info">
          <strong>Efectivo entregado:</strong>{" "}
          {detalleVenta.tipoDinero === "Cordobas" ? "C$" : "$"}
          {detalleVenta.montoPago || "N/A"}
        </p>
        {detalleVenta.tipoDinero === "Dolares" &&
          detalleVenta.tipoPago === "Efectivo" && (
            <>
              <p className="ticket__info">
                <strong>Tipo de cambio dólar:</strong> C$
                {detalleVenta.tipoCambio}
              </p>

              <p className="ticket__info">
                <strong>Efectivo en Córdoba:</strong> C$
                {detalleVenta.montoPago * detalleVenta.tipoCambio}
              </p>
            </>
          )}
        <p className="ticket__info">
          <strong>Cambio:</strong>{" "}
          {detalleVenta.vuelto > 0 ? `C$${detalleVenta.vuelto}` : "C$0"}
        </p>
      </div>
      {(detalleVenta.nombreCliente || detalleVenta.numeroRuc) && (
        <div className="ticket__footer">
          <p className="ticket__footer-title" style={{ textAlign: "left" }}>
            <strong>Datos del Cliente:</strong>
          </p>

          {detalleVenta.nombreCliente && (
            <p className="ticket__info">
              <strong>Nombre Cliente:</strong> {detalleVenta.nombreCliente}
            </p>
          )}

          {detalleVenta.numeroRuc && (
            <p className="ticket__info">
              <strong>Ruc N.º:</strong> {detalleVenta.numeroRuc}
            </p>
          )}
        </div>
      )}
      <div className="ticket__footer" style={{ textAlign: "center" }}>
        <p className="ticket__footer-title">
          <strong>¡Gracias por su preferencia!</strong>
        </p>
      </div>
    </div>
  );
});

export default Ticket;
