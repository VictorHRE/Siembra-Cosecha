import React from "react";

const TicketCierre = React.forwardRef(({ cierreData }, ref) => {
  // Get current date and time in Nicaragua timezone (UTC-6)
  const getCurrentDateTime = () => {
    const now = new Date();
    // Convert to Nicaragua timezone (UTC-6 or GMT-6)
    const nicaraguaTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Managua" })
    );

    const fecha = nicaraguaTime.toLocaleDateString("es-NI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const hora = nicaraguaTime.toLocaleTimeString("es-NI", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
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

  // Función auxiliar para agrupar por tipo de pago
  const agruparPorTipoPago = (items = []) => {
    return {
      Efectivo: items.filter((i) => i.tipoPago === "Efectivo"),
      Transferencia: items.filter((i) => i.tipoPago === "Transferencia"),
      Tarjeta: items.filter((i) => i.tipoPago === "Tarjeta"),
    };
  };

  // Función para calcular el resumen por tipo de pago
  const calcularResumenPorTipoPago = (ingresos, egresos, monedaSimbolo) => {
    // Obtener todos los tipos de pago distintos que existan en ingresos o egresos
    const tipos = Array.from(
      new Set([
        ...ingresos.map((i) => `${i.tipoPago} ${i.tipoDinero}`.trim()),
        ...egresos.map((e) => `${e.tipoPago} ${e.tipoDinero}`.trim()),
      ])
    );

    // Construir el resumen
    const resumen = tipos.map((tipo) => {
      const ingresosTipo = ingresos
        .filter((i) => `${i.tipoPago} ${i.tipoDinero}`.trim() === tipo)
        .reduce((acc, i) => acc + parseFloat(i.monto || 0), 0);

      const egresosTipo = egresos
        .filter((e) => `${e.tipoPago} ${e.tipoDinero}`.trim() === tipo)
        .reduce((acc, e) => acc + parseFloat(e.monto || 0), 0);

      return {
        tipo,
        ingresos: ingresosTipo,
        egresos: egresosTipo,
        total: ingresosTipo - egresosTipo,
      };
    });

    return resumen;
  };

  const { fecha, hora } = getCurrentDateTime();
  const nombreUsuario = getLoggedUser();

  // Extract data from props
  const {
    totalIngresoVenta = 0,
    totalIngresos = 0,
    totalEgresos = 0,
    saldoCierre = 0,
    monedaSimbolo = "C$",
    ingresos = [],
    egresos = [],
  } = cierreData || {};

  return (
    <div ref={ref} id="ticket-cierre-impresion" className="ticket">
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
          <strong>Cierre Contable</strong>
        </p>
        <p className="ticket__info">
          <strong>Fecha:</strong> {fecha}
        </p>
        <p className="ticket__info">
          <strong>Hora:</strong> {hora}
        </p>
        <p className="ticket__info">
          <strong>Generado por:</strong> {nombreUsuario}
        </p>

        <hr className="ticket__separator" />

        {/* Resumen del cierre detallado */}
        <div className="ticket__summary">
          {calcularResumenPorTipoPago(ingresos, egresos, monedaSimbolo).map(
            (row, idx) => (
              <div key={idx} className="ticket__section">
                <p className="ticket__info ticket__info--center">
                  <strong>Resumen de detalle por {row.tipo}</strong>
                </p>
                <table className="ticket__table">
                  <thead>
                    <tr>
                      <th className="ticket__table-header ticket__table-amount">
                        Ingresos
                      </th>
                      <th className="ticket__table-header ticket__table-amount">
                        Egresos
                      </th>
                      <th className="ticket__table-header ticket__table-amount">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="ticket__table-cell ticket__table-amount">
                        {monedaSimbolo}
                        {row.ingresos.toFixed(2)}
                      </td>
                      <td className="ticket__table-cell ticket__table-amount">
                        {monedaSimbolo}
                        {row.egresos.toFixed(2)}
                      </td>
                      <td className="ticket__table-cell ticket__table-amount">
                        {monedaSimbolo}
                        {row.total.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <hr className="ticket__separator" />
              </div>
            )
          )}

          {/* Resumen del cierre */}
          <div className="ticket__summary">
            <p className="ticket__info ticket__info--center">
              <strong>Detalle Resumen General</strong>
            </p>
            <p className="ticket__info">
              <strong>Total Ingresos:</strong> {monedaSimbolo}
              {totalIngresos.toFixed(2)}
            </p>
            <p className="ticket__info">
              <strong>Total Ingresos de ventas:</strong> {monedaSimbolo}
              {totalIngresoVenta.toFixed(2)}
            </p>
            <p className="ticket__info">
              <strong>Total Egresos:</strong> {monedaSimbolo}
              {totalEgresos.toFixed(2)}
            </p>
            <p className="ticket__info">
              <strong>Saldo Cierre:</strong> {monedaSimbolo}
              {saldoCierre.toFixed(2)}
            </p>
          </div>
          <hr className="ticket__separator--transparent" />
        </div>

        <hr className="ticket__separator" />

        {/* Tablas de Ingresos */}
        {ingresos && ingresos.length > 0 && (
          <div className="ticket__section">
            <p className="ticket__info ticket__info--center">
              <strong>Detalle de Ingresos</strong>
            </p>
            <hr className="ticket__separator" />

            {Object.entries(agruparPorTipoPago(ingresos)).map(([tipo, lista]) =>
              lista.length > 0 ? (
                <div key={`ingresos-${tipo}`}>
                  <p className="ticket__info ticket__info--center ticket__info--tipo">
                    <strong>
                      {tipo.toUpperCase()} ({lista.length})
                    </strong>
                  </p>
                  <hr className="ticket__separator" />
                  <table className="ticket__table">
                    <thead>
                      <tr>
                        <th className="ticket__table-header ticket__table-desc">
                          Descripción
                        </th>
                        <th className="ticket__table-header ticket__table-amount">
                          Monto
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lista.map((item, index) => (
                        <tr key={`ingreso-${tipo}-${index}`}>
                          <td className="ticket__table-cell ticket__table-desc">
                            -{item.descripcion}
                          </td>
                          <td className="ticket__table-cell ticket__table-amount">
                            {monedaSimbolo}
                            {parseFloat(item.monto).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <hr className="ticket__separator" />
                </div>
              ) : null
            )}
          </div>
        )}

        {/* Tablas de Egresos */}
        {egresos && egresos.length > 0 && (
          <div className="ticket__section">
            <p className="ticket__info ticket__info--center">
              <strong>Detalle de Egresos</strong>
            </p>
            <hr className="ticket__separator" />

            {Object.entries(agruparPorTipoPago(egresos)).map(([tipo, lista]) =>
              lista.length > 0 ? (
                <div key={`egresos-${tipo}`}>
                  <p className="ticket__info ticket__info--center ticket__info--tipo">
                    <strong>
                      {tipo.toUpperCase()} ({lista.length})
                    </strong>
                  </p>
                  <table className="ticket__table">
                    <thead>
                      <tr>
                        <th className="ticket__table-header ticket__table-desc">
                          Descripción
                        </th>
                        <th className="ticket__table-header ticket__table-amount">
                          Monto
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lista.map((item, index) => (
                        <tr key={`egreso-${tipo}-${index}`}>
                          <td className="ticket__table-cell ticket__table-desc">
                            -{item.descripcion}
                          </td>
                          <td className="ticket__table-cell ticket__table-amount">
                            {monedaSimbolo}
                            {parseFloat(item.monto).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <hr className="ticket__separator" />
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default TicketCierre;
