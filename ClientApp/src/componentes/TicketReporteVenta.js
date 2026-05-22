import React from "react";

const TicketReporteVenta = React.forwardRef(({ ventasTicket }, ref) => {
  // Get current date and time in Nicaragua timezone (UTC-6)
  const getCurrentDateTime = () => {
    const now = new Date();
    // Convert to Nicaragua timezone (UTC-6 or GMT-6)
    const nicaraguaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Managua"}));
    
    const fecha = nicaraguaTime.toLocaleDateString('es-NI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const hora = nicaraguaTime.toLocaleTimeString('es-NI', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    return { fecha, hora };
  };

  // Get logged user from localStorage
  const getLoggedUser = () => {
    try {
      const userSession = window.localStorage.getItem("sesion_usuario");
      if (userSession) {
        const userData = JSON.parse(userSession);
        return userData.nombre || userData.correo || "Usuario";
      }
    } catch (error) {
      console.error("Error al obtener usuario de localStorage:", error);
    }
    return "Usuario";
  };

  const { fecha, hora } = getCurrentDateTime();
  const nombreUsuario = getLoggedUser();

  return (
    <div ref={ref} id="ticket-reporte-impresion" className="ticket">
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
        <p className="ticket__info ticket__info--center">
          <strong>Reporte de Ventas</strong>
        </p>
        <p className="ticket__info">
          <strong>Fecha:</strong> {fecha}
        </p>
        <p className="ticket__info">
          <strong>Hora:</strong> {hora}
        </p>
        <p className="ticket__info">
          <strong>Reporte Generado por:</strong> {nombreUsuario}
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
            {ventasTicket && ventasTicket.length > 0 ? (
              ventasTicket.map((item, index) => (
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
        
        {ventasTicket && ventasTicket.length > 0 && (
          <p className="ticket__info">
            <strong>Total General:</strong> C${
              ventasTicket.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2)
            }
          </p>
        )}
      </div>
      
      <div className="ticket__footer" style={{ textAlign: "center" }}>
        <p className="ticket__footer-title">
          <strong>“Este reporte refleja únicamente ventas, no incluye gastos, ni retiros de efectivo.”</strong>
        </p>
      </div>
     
    </div>
  );
});

export default TicketReporteVenta;