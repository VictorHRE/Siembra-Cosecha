import {
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Row,
  Table,
  Button,
} from "reactstrap";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { useContext, useEffect, useState, useCallback } from "react";
import "./css/Venta.css";
import { UserContext } from "../context/UserProvider";
import { generateCode } from "../utils/generateCode";
import printJS from "print-js";
import Ticket from "../componentes/Ticket";
import { 
  FaCashRegister, 
  FaUser, 
  FaShoppingCart, 
  FaSearch, 
  FaTrash, 
  FaEdit, 
  FaPlus, 
  FaMoneyBillWave,
  FaExchangeAlt,
  FaDollarSign,
  FaReceipt,
  FaFileInvoice
} from "react-icons/fa";

const Venta = () => {
  const { user } = useContext(UserContext);

  const [a_Productos, setA_Productos] = useState([]);
  const [a_Busqueda, setA_Busqueda] = useState("");
  const [mostrarProductos, setMostrarProductos] = useState(false);

  const [documentoCliente, setDocumentoCliente] = useState(generateCode());
  const [nombreCliente, setNombreCliente] = useState("");

  const [productos, setProductos] = useState([]);
  const [productsCart, setProductsCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [tempProducts, setTempProducts] = useState([]);

  // New fields for payment
  const [tipoPago, setTipoPago] = useState("Efectivo");
  const [tipoDinero, setTipoDinero] = useState("Cordobas");
  const [numeroRuc, setNumeroRuc] = useState("");
  const [montoPago, setMontoPago] = useState(0);
  const [vuelto, setVuelto] = useState(0);
  const [tipoCambio, setTipoCambio] = useState(0);

  // Estado para la última venta (para imprimir)
  const [ultimaVenta, setUltimaVenta] = useState({});

  // Estado para controlar si ya se mostró la alerta de stock bajo

  const [alertaMostrada, setAlertaMostrada] = useState(false);

  const reestablecer = () => {
    setDocumentoCliente(generateCode());
    setNombreCliente("");
    setProductos([]);
    setTotal(0);
    setTipoPago("Efectivo");
    setTipoDinero("Cordobas");
    setNumeroRuc("");
    setMontoPago(0);
    setVuelto(0);
    setTipoCambio(0);
  };

  const obtenerProductos = async () => {
    let response = await fetch("api/producto/Lista");

    if (response.ok) {
      let data = await response.json();
      setTempProducts(() => data);
    }
  };

  const calcularVuelto = useCallback(
    (pagoCliente) => {
      // For Transferencia, no change is calculated (exact payment)
      if (tipoPago === "Transferencia") {
        setVuelto(0);
        return;
      }

      const totalVenta = parseFloat(total) || 0;
      const pago = parseFloat(pagoCliente) || 0;

      // For Dolares, convert to cordobas using exchange rate
      if (tipoDinero === "Dolares") {
        // convertir a córdobas usando tipo de cambio
        const montoConvertido = pago * (parseFloat(tipoCambio) || 0);
        const cambio = montoConvertido - totalVenta;
        setVuelto(cambio >= 0 ? cambio : 0);
        return;
      }

      // For Cordobas, calculate change normally
      const cambio = pago - totalVenta;
      setVuelto(cambio >= 0 ? cambio : 0);
    },
    [tipoCambio, tipoPago, tipoDinero, total]
  );

  const verificarStockBajo = (productos) => {
    if (productos.length > 0) {
      const productosPocoStock = productos.filter(
        (producto) =>
          producto.unidades !== null &&
          producto.unidades !== undefined &&
          producto.unidades <= 10 &&
          producto.esActivo
      );

      if (productosPocoStock.length > 0) {
        const nombreProductos = productosPocoStock
          .map((p) => p.nombre)
          .join(", ");
        Swal.fire({
          title: "Alerta de Stock Bajo",
          text: `Los siguientes productos tienen menos de 10 unidades: ${nombreProductos}`,
          icon: "warning",
          confirmButtonText: "Entendido",
        });
      }
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  // Check for low stock products and show alerts (similar to Producto.js)
  useEffect(() => {
    if (tempProducts.length > 0 && !alertaMostrada) {
      verificarStockBajo(tempProducts);
      setAlertaMostrada(true); // 👈 evita que vuelva a salir
    }
  }, [tempProducts, alertaMostrada]);

  // Recalculate change when payment type changes
  useEffect(() => {
    if (tipoPago === "Transferencia" || tipoPago === "Tarjeta") {
      // Si el tipo de dinero es dólares, convertir
      if (tipoDinero === "Dolares") {
        if (tipoCambio > 0) {
          const montoEnDolares = (
            parseFloat(total) / parseFloat(tipoCambio)
          ).toFixed(2);
          setMontoPago(montoEnDolares);
        }
      } else {
        // Si es en córdobas, asignar el mismo total
        setMontoPago(parseFloat(total).toFixed(2));
      }
      setVuelto(0);
    } else {
      // For Cordobas and dollars, recalculate automatically
      calcularVuelto(montoPago);
    }
  }, [tipoPago, tipoDinero, total, montoPago, calcularVuelto, tipoCambio]);

  // Buscar productos para mostrar en la tabla
  const buscarProductos = (value) => {
    if (value.length >= 2) {
      fetch("api/venta/Productos/" + value)
        .then((response) => {
          return response.ok ? response.json() : Promise.reject(response);
        })
        .then((dataJson) => {
          // Filtrar productos que no estén en el carrito
          const filteredProducts = dataJson
            .filter((item) => {
              const isInCart = productsCart.some(
                (cartItem) => cartItem[0].idProducto === item.idProducto
              );

              const tempStock = tempProducts.find(
                (item2) => item2.idProducto === item.idProducto
              );

              return (
                item.precio > 0 && !isInCart && tempStock && tempStock.esActivo
              );
            })
            .map((item) => {
              const tempStock = tempProducts.find(
                (p) => p.idProducto === item.idProducto
              );

              const categoria =
                item.categoria || item.idCategoriaNavigation?.descripcion || "Sin categoría";

              return {
                ...item,
                categoria,
                unidades: tempStock ? tempStock.unidades : 0, // 👈 ahora sí unidades
              };
            });

          setA_Productos(filteredProducts);
          setMostrarProductos(true);
        })
        .catch((error) => {
          console.log("No se pudo obtener datos, mayor detalle: ", error);
          setA_Productos([]);
          setMostrarProductos(false);
        });
    } else {
      setA_Productos([]);
      setMostrarProductos(false);
    }
  };

  // Evento cuando cambie el valor del texto de búsqueda
  const onChange = (e) => {
    const value = e.target.value;
    setA_Busqueda(value);
    buscarProductos(value);
  };

  const agregarProductoAlCarrito = async (producto) => {
    const unidadesDisponibles = producto.unidades ?? 0;
    const tieneUnidadesGestionadas =
      producto.unidades !== null && producto.unidades !== undefined;

    Swal.fire({
      title: producto.nombre || producto.descripcion,
      text: tieneUnidadesGestionadas
        ? `Ingrese la cantidad (Stock disponible: ${unidadesDisponibles} unidades)`
        : `Ingrese la cantidad (Este producto no gestiona stock)`,
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
        placeholder: tieneUnidadesGestionadas
          ? `Máximo ${unidadesDisponibles} unidades`
          : "Cantidad deseada",
      },
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Volver",
      showLoaderOnConfirm: true,
      preConfirm: (inputValue) => {
        obtenerProductos();

        if (isNaN(parseFloat(inputValue))) {
          Swal.showValidationMessage("Debe ingresar un valor númerico");
        } else if (parseInt(inputValue) < 1) {
          Swal.showValidationMessage(`La cantidad debe ser mayor a "0"`);
        } else {
          // Solo validar stock si el producto gestiona unidades
          if (tieneUnidadesGestionadas) {
            const cantidadSolicitada = parseInt(inputValue);
            const unidadesDisponibles = producto.unidades || 0;

            if (cantidadSolicitada > unidadesDisponibles) {
              Swal.showValidationMessage(
                `La cantidad solicitada (${cantidadSolicitada}) supera el stock disponible (${unidadesDisponibles} unidades)`
              );
              return;
            }
          }

          const tempStock = tempProducts.filter(
            (item) => item.idProducto === producto.idProducto
          );

          setProductsCart(() => [...productsCart, tempStock]);

          let nuevoProducto = {
            idProducto: producto.idProducto,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            cantidad: parseInt(inputValue),
            precio: producto.precio,
            total: producto.precio * parseFloat(inputValue),
          };
          let arrayProductos = [];
          arrayProductos.push(...productos);
          arrayProductos.push(nuevoProducto);

          setProductos((anterior) => [...anterior, nuevoProducto]);
          calcularTotal(arrayProductos);

          // Ocultar la tabla y limpiar búsqueda
          setA_Busqueda("");
          setA_Productos([]);
          setMostrarProductos(false);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  };

  // Columnas para la tabla de productos
  const columnasProductos = [
    {
      name: "Nombre",
      selector: (row) => row.nombre,
      sortable: true,
      width: "170px",
      wrap: true,
    },
    {
      name: "Categoría",
      selector: (row) => row.categoria || row.idCategoriaNavigation?.descripcion || "",
      sortable: true,
      width: "150px",
      wrap: true,
      cell: (row) => row.categoria || row.idCategoriaNavigation?.descripcion || "Sin categoría",
    },
    {
      name: "Descripción",
      selector: (row) => row.descripcion,
      sortable: true,
      width: "220px",
      wrap: true,
    },
    {
      name: "Precio",
      selector: (row) => row.precio,
      sortable: true,
      cell: (row) => `C$${row.precio}`,
      width: "100px",
    },
    {
      name: "Unidades",
      selector: (row) => row.unidades,
      sortable: true,
      cell: (row) => row.unidades ?? "Sin gestión",
      width: "120px",
    },
    {
      name: "Acción",
      cell: (row) => (
        <Button
          size="sm"
          onClick={() => agregarProductoAlCarrito(row)}
          style={{
            backgroundColor: '#10B981',
            border: 'none',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '8px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#10B981'}
        >
          <FaPlus style={{ marginRight: '4px' }} /> Agregar
        </Button>
      ),
      width: "120px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // Conditional row styles for low stock products (similar to Producto.js)
  const conditionalRowStyles = [
    {
      when: (row) => row.unidades <= 10 && row.unidades !== null,
      style: {
        backgroundColor: "#ffebee",
        color: "#d32f2f",
      },
    },
  ];

  // Función para modificar cantidad en el carrito
  const modificarCantidadCarrito = async (producto) => {
    Swal.fire({
      title: `Modificar cantidad - ${producto.descripcion}`,
      text: "Ingrese la nueva cantidad",
      input: "text",
      inputValue: producto.cantidad,
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
      preConfirm: (inputValue) => {
        if (isNaN(parseFloat(inputValue))) {
          Swal.showValidationMessage("Debe ingresar un valor númerico");
        } else if (parseInt(inputValue) < 1) {
          Swal.showValidationMessage(`La cantidad debe ser mayor a "0"`);
        } else {
          // Actualizar la cantidad del producto en el carrito
          const nuevaCantidad = parseInt(inputValue);
          const nuevoTotal = producto.precio * nuevaCantidad;

          // Actualizar el producto en la lista de productos del carrito
          const productosActualizados = productos.map((p) =>
            p.idProducto === producto.idProducto
              ? { ...p, cantidad: nuevaCantidad, total: nuevoTotal }
              : p
          );

          setProductos(productosActualizados);
          calcularTotal(productosActualizados);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  };

  const eliminarProducto = (id) => {
    let listaproductos = productos.filter((p) => p.idProducto !== id);
    const tempProductsCart = productsCart.filter(
      (item) => item[0].idProducto !== id
    );
    setProductsCart(() => tempProductsCart);
    setProductos(listaproductos);
    calcularTotal(listaproductos);
  };

  const calcularTotal = (arrayProductos) => {
    let t = 0; // total

    if (arrayProductos.length > 0) {
      arrayProductos.forEach((p) => {
        t += p.total; // aquí p.total = precio * cantidad
      });
    }

    setTotal(t.toFixed(2));
  };
  // Función para obtener detalles de una venta específica
  const obtenerDetalleVenta = async (numeroVenta) => {
    try {
      let options = { year: "numeric", month: "2-digit", day: "2-digit" };
      let fecha = new Date().toLocaleDateString("es-PE", options);

      const response = await fetch(
        `api/venta/Listar?buscarPor=numero&numeroVenta=${numeroVenta}&fechaInicio=${fecha}&fechaFin=${fecha}`
      );

      if (response.ok) {
        const dataJson = await response.json();
        if (dataJson.length > 0) {
          setUltimaVenta(dataJson[0]);
          console.log("Detalle de venta obtenido:", dataJson[0]);
          return dataJson[0];
        }
      }
      return null;
    } catch (error) {
      console.error("Error al obtener detalle de venta:", error);
      return null;
    }
  };

  // Función para imprimir el ticket (igual que en HistorialVenta)
  const imprimirTicket = () => {
    printJS({
      printable: "ticket-impresion",
      type: "html",
      css: "/css/Ticket.css",
    });
  };

  const terminarVenta = () => {
    if (productos.length < 1) {
      Swal.fire("Opps!", "No existen productos", "error");
      return;
    }

    // Validation for required fields
    if (!tipoPago) {
      Swal.fire("Opps!", "Debe seleccionar un tipo de pago", "error");
      return;
    }

    if (montoPago <= 0) {
      Swal.fire("Opps!", "Debe ingresar el monto que paga el cliente", "error");
      return;
    }

    // For Dolares payment, validate exchange rate and use conversion
    if (tipoDinero === "Dolares") {
      if (tipoCambio <= 0) {
        Swal.fire(
          "Opps!",
          "Debe ingresar un tipo de cambio válido (mayor a 0)",
          "error"
        );
        return;
      }

      const montoConvertido = parseFloat(montoPago) * parseFloat(tipoCambio);
      if (montoConvertido < parseFloat(total)) {
        Swal.fire(
          "Opps!",
          "El monto pagado debe ser mayor o igual al total de la venta",
          "error"
        );
        return;
      }
    } else {
      // For other payment types, validate normally
      if (montoPago < parseFloat(total)) {
        Swal.fire(
          "Opps!",
          "El monto pagado debe ser mayor o igual al total de la venta",
          "error"
        );
        return;
      }
    }

    let venta = {
      documentoCliente: documentoCliente,
      nombreCliente: nombreCliente,
      idUsuario: JSON.parse(user).idUsuario,
      total: parseFloat(total),
      tipoPago: tipoPago,
      tipoDinero: tipoDinero,
      numeroRuc: numeroRuc || "",
      montoPago: parseFloat(montoPago),
      vuelto: parseFloat(vuelto),
      tipoCambio: parseFloat(tipoCambio) || 0,
      listaProductos: productos,
    };

    setProductsCart([]);

    fetch("api/venta/Registrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(venta),
    })
      .then((response) => {
        return response.ok ? response.json() : Promise.reject(response);
      })
      .then(async (dataJson) => {
        reestablecer();
        var data = dataJson;

        // Mostrar mensaje de éxito con opción de imprimir
        const result = await Swal.fire({
          title: "Venta Creada!",
          text: `Número de venta: ${data.numeroDocumento}`,
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Imprimir Ticket",
          cancelButtonText: "Cerrar",
          confirmButtonColor: "#4e73df",
          cancelButtonColor: "#6c757d",
        });

        // Si el usuario quiere imprimir
        if (result.isConfirmed) {
          // Obtener los detalles de la venta para imprimir
          const detalleVenta = await obtenerDetalleVenta(data.numeroDocumento);
          if (detalleVenta) {
            // Dar un pequeño tiempo para que se rendericen los elementos
            setTimeout(() => {
              imprimirTicket();
            }, 500);
          } else {
            Swal.fire(
              "Error",
              "No se pudo obtener los detalles para imprimir",
              "error"
            );
          }
        }

        obtenerProductos();
        setAlertaMostrada(false);
      })
      .catch((error) => {
        Swal.fire("Opps!", "No se pudo crear la venta", "error");
        console.log("No se pudo enviar la venta ", error);
      });
  };

  return (
    <>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
        padding: '24px 32px',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <FaCashRegister style={{ fontSize: '40px', color: 'white' }} />
        <div>
          <h2 style={{ 
            margin: 0, 
            color: 'white', 
            fontWeight: '700',
            fontSize: '28px',
            letterSpacing: '-0.5px'
          }}>
            Nueva Venta
          </h2>
          <p style={{ 
            margin: 0, 
            color: 'rgba(255, 255, 255, 0.9)', 
            fontSize: '14px',
            marginTop: '4px'
          }}>
            Registra y gestiona las ventas de productos
          </p>
        </div>
      </div>

      <Row>
        <Col lg={8} md={12} sm={12}>
          <Row className="mb-3">
            <Col sm={12}>
              <Card style={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden'
              }}>
                <CardHeader style={{ 
                  background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
                  padding: '16px 24px',
                  border: 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaUser style={{ fontSize: '20px', color: 'white' }} />
                    <span style={{ 
                      color: 'white', 
                      fontWeight: '600',
                      fontSize: '18px'
                    }}>
                      Información del Cliente
                    </span>
                  </div>
                </CardHeader>
                <CardBody style={{ padding: '24px' }}>
                  <Row>
                    <Col lg={6} md={6} sm={12}>
                      <FormGroup>
                        <Label style={{ 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '8px',
                          fontSize: '14px'
                        }}>
                          Código Documento
                        </Label>
                        <Input
                          bsSize="sm"
                          value={documentoCliente}
                          onChange={(e) => setDocumentoCliente(e.target.value)}
                          readOnly
                          style={{
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            padding: '10px 12px',
                            backgroundColor: '#F9FAFB',
                            fontSize: '14px'
                          }}
                        />
                      </FormGroup>
                    </Col>
                    <Col lg={6} md={6} sm={12}>
                      <FormGroup>
                        <Label style={{ 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '8px',
                          fontSize: '14px'
                        }}>
                          Nombre
                        </Label>
                        <Input
                          bsSize="sm"
                          value={nombreCliente}
                          onChange={(e) => setNombreCliente(e.target.value)}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            padding: '10px 12px',
                            fontSize: '14px'
                          }}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={6} md={6} sm={12}>
                      <FormGroup>
                        <Label style={{ 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '8px',
                          fontSize: '14px'
                        }}>
                          Número RUC (Opcional)
                        </Label>
                        <Input
                          bsSize="sm"
                          value={numeroRuc}
                          onChange={(e) => setNumeroRuc(e.target.value)}
                          placeholder="RUC del cliente"
                          style={{
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            padding: '10px 12px',
                            fontSize: '14px'
                          }}
                        />
                      </FormGroup>
                    </Col>
                    <Col lg={6} md={6} sm={12}>
                      <FormGroup>
                        <Label style={{ 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '8px',
                          fontSize: '14px'
                        }}>
                          Tipo de Pago <span style={{ color: '#EF4444' }}>*</span>
                        </Label>
                        <Input
                          type="select"
                          bsSize="sm"
                          value={tipoPago}
                          onChange={(e) => {
                            const value = e.target.value;
                            setTipoPago(value);

                            // Si es tarjeta, forzar siempre Cordobas
                            if (value === "Tarjeta") {
                              setTipoDinero("Cordobas");
                            }
                          }}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            padding: '10px 12px',
                            fontSize: '14px',
                            color: '#374151',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            height: 'fit-content'
                          }}
                        >
                          <option value="Efectivo">Efectivo</option>
                          <option value="Transferencia">Transferencia</option>
                          <option value="Tarjeta">Tarjeta</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={6} md={6} sm={12}>
                      <FormGroup>
                        <Label style={{ 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '8px',
                          fontSize: '14px'
                        }}>
                          Tipo de Moneda <span style={{ color: '#EF4444' }}>*</span>
                        </Label>
                        <Input
                          type="select"
                          bsSize="sm"
                          value={tipoDinero}
                          onChange={(e) => setTipoDinero(e.target.value)}
                          disabled={tipoPago === "Tarjeta"}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            padding: '10px 12px',
                            fontSize: '14px',
                            color: '#374151',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            height: 'fit-content'
                          }}
                        >
                          <option value="Cordobas">Córdobas</option>
                          <option value="Dolares">Dólares</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    {tipoDinero === "Dolares" && (
                      <Col lg={6} md={6} sm={12}>
                        <FormGroup>
                          <Label style={{ 
                            fontWeight: '600', 
                            color: '#374151',
                            marginBottom: '8px',
                            fontSize: '14px'
                          }}>
                            Tipo de Cambio (C$ por US$){" "}
                            <span style={{ color: '#EF4444' }}>*</span>
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            bsSize="sm"
                            value={tipoCambio}
                            onChange={(e) => setTipoCambio(e.target.value)}
                            placeholder="Ej: 36.6"
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #E5E7EB',
                              padding: '10px 12px',
                              fontSize: '14px'
                            }}
                          />
                        </FormGroup>
                      </Col>
                    )}
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <Card style={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden'
              }}>
                <CardHeader style={{ 
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  padding: '16px 24px',
                  border: 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaShoppingCart style={{ fontSize: '20px', color: 'white' }} />
                    <span style={{ 
                      color: 'white', 
                      fontWeight: '600',
                      fontSize: '18px'
                    }}>
                      Productos
                    </span>
                  </div>
                </CardHeader>
                <CardBody style={{ padding: '24px' }}>
                  <Row className="mb-3">
                    <Col sm={12}>
                      <FormGroup style={{ position: 'relative' }}>
                        <div style={{ position: 'relative' }}>
                          <FaSearch style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#9CA3AF',
                            zIndex: 1
                          }} />
                          <Input
                            type="text"
                            placeholder="Buscar producto por nombre..."
                            value={a_Busqueda}
                            onChange={onChange}
                            style={{
                              paddingLeft: '40px',
                              borderRadius: '12px',
                              border: '2px solid #E5E7EB',
                              padding: '12px 12px 12px 40px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10B981'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                          />
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                  {mostrarProductos && a_Productos.length > 0 && (
                    <Row className="mb-3">
                      <Col sm={12}>
                        <div className="table-responsive-productos" style={{
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid #E5E7EB'
                        }}>
                          <DataTable
                            columns={columnasProductos}
                            data={a_Productos}
                            noDataComponent="No se encontraron productos"
                            dense
                            striped
                            responsive
                            highlightOnHover
                            pagination={false}
                            conditionalRowStyles={conditionalRowStyles}
                          />
                        </div>
                      </Col>
                    </Row>
                  )}
                  <Row>
                    <Col sm={12}>
                      <div style={{
                        background: '#F9FAFB',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #E5E7EB'
                      }}>
                        <h6 style={{
                          margin: '0 0 16px 0',
                          color: '#374151',
                          fontWeight: '600',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <FaShoppingCart style={{ color: '#10B981' }} />
                          Carrito de Compras
                        </h6>
                        <div className="table-responsive">
                          <Table striped size="sm" style={{
                            marginBottom: 0,
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}>
                            <thead style={{
                              backgroundColor: '#F3F4F6'
                            }}>
                              <tr>
                                <th style={{ 
                                  fontWeight: '600', 
                                  color: '#ffff',
                                  fontSize: '13px',
                                  padding: '12px'
                                }}></th>
                                <th style={{ 
                                  fontWeight: '600', 
                                  color: '#ffff',
                                  fontSize: '13px',
                                  padding: '12px'
                                }}>Producto</th>
                                <th style={{ 
                                  fontWeight: '600', 
                                  color: '#ffff',
                                  fontSize: '13px',
                                  padding: '12px'
                                }}>Descripción</th>
                                <th style={{ 
                                  fontWeight: '600', 
                                  color: '#ffff',
                                  fontSize: '13px',
                                  padding: '12px'
                                }}>Cantidad</th>
                                <th style={{ 
                                  fontWeight: '600', 
                                  color: '#ffff',
                                  fontSize: '13px',
                                  padding: '12px'
                                }}>Precio</th>
                                <th style={{ 
                                  fontWeight: '600', 
                                  color: '#ffff',
                                  fontSize: '13px',
                                  padding: '12px'
                                }}>Total</th>
                                <th style={{ 
                                  fontWeight: '600', 
                                  color: '#ffff',
                                  fontSize: '13px',
                                  padding: '12px'
                                }}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {productos.length < 1 ? (
                                <tr>
                                  <td colSpan="7" style={{
                                    textAlign: 'center',
                                    padding: '32px',
                                    color: '#9CA3AF',
                                    fontSize: '14px'
                                  }}>
                                    <FaShoppingCart style={{ 
                                      fontSize: '32px', 
                                      marginBottom: '8px',
                                      display: 'block',
                                      margin: '0 auto 8px'
                                    }} />
                                    No hay productos en el carrito
                                  </td>
                                </tr>
                              ) : (
                                productos.map((item) => (
                                  <tr key={item.idProducto}>
                                    <td style={{ padding: '12px' }}>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          eliminarProducto(item.idProducto)
                                        }
                                        style={{
                                          backgroundColor: '#EF4444',
                                          border: 'none',
                                          borderRadius: '8px',
                                          padding: '6px 10px'
                                        }}
                                      >
                                        <FaTrash />
                                      </Button>
                                    </td>
                                    <td style={{ 
                                      padding: '12px',
                                      fontWeight: '500',
                                      color: '#374151'
                                    }}>{item.nombre}</td>
                                    <td style={{ 
                                      padding: '12px',
                                      color: '#374151'
                                    }}>{item.descripcion}</td>
                                    <td style={{ 
                                      padding: '12px',
                                      fontWeight: '600',
                                      color: '#374151'
                                    }}>{item.cantidad}</td>
                                    <td style={{ 
                                      padding: '12px',
                                      color: '#374151'
                                    }}>C${item.precio}</td>
                                    <td style={{ 
                                      padding: '12px',
                                      fontWeight: '600',
                                      color: '#D946A6'
                                    }}>C${item.total}</td>
                                    <td style={{ padding: '12px' }}>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          modificarCantidadCarrito(item)
                                        }
                                        style={{
                                          backgroundColor: '#F59E0B',
                                          border: 'none',
                                          borderRadius: '8px',
                                          padding: '6px 10px'
                                        }}
                                      >
                                        <FaEdit />
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col lg={4} md={12} sm={12} className="venta-details-col">
          <Row className="mb-3">
            <Col sm={12}>
              <Card style={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
                color: 'white'
              }}>
                <CardHeader style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '16px 24px',
                  border: 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaReceipt style={{ fontSize: '20px', color: 'white' }} />
                    <span style={{ 
                      color: 'white', 
                      fontWeight: '600',
                      fontSize: '18px'
                    }}>
                      Resumen de Venta
                    </span>
                  </div>
                </CardHeader>
                <CardBody style={{ padding: '24px' }}>
                  <Row className="mb-3">
                    <Col sm={12}>
                      <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        padding: '16px',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <Label style={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '13px',
                          fontWeight: '500',
                          marginBottom: '8px',
                          display: 'block'
                        }}>
                          Total a Pagar
                        </Label>
                        <div style={{
                          fontSize: '32px',
                          fontWeight: '700',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <FaDollarSign style={{ fontSize: '28px' }} />
                          C${total}
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={12}>
                      <Label style={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '13px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        Paga con <span style={{ color: '#FEE2E2' }}>*</span>
                      </Label>
                      <InputGroup size="sm">
                        <InputGroupText style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '8px 0 0 8px',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          <FaMoneyBillWave style={{ marginRight: '6px', color: '#10B981' }} />
                          {tipoDinero === "Dolares" ? "US$" : "C$"}
                        </InputGroupText>
                        <Input
                          type="number"
                          step="0.01"
                          value={montoPago}
                          onChange={(e) => {
                            if (
                              tipoPago !== "Transferencia" ||
                              tipoPago !== "Tarjeta"
                            ) {
                              const valor = e.target.value;
                              setMontoPago(valor);
                              calcularVuelto(valor);
                            }
                          }}
                          readOnly={
                            tipoPago === "Transferencia" ||
                            tipoPago === "Tarjeta"
                          }
                          placeholder="Monto que paga el cliente"
                          style={{
                            border: 'none',
                            borderRadius: '0 8px 8px 0',
                            padding: '10px 12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                          }}
                        />
                      </InputGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={12}>
                      <Label style={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '13px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        Vuelto
                      </Label>
                      <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '20px',
                        fontWeight: '700',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaExchangeAlt />
                        C${vuelto.toFixed(2)}
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <Card style={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden'
              }}>
                <CardBody style={{ padding: '16px' }}>
                  <Button 
                    block 
                    onClick={terminarVenta}
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '16px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    <FaFileInvoice style={{ fontSize: '20px' }} /> 
                    Terminar Venta
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Ticket oculto para impresión */}
      <div style={{ display: "none" }}>
        <Ticket detalleVenta={ultimaVenta} />
      </div>
    </>
  );
};

export default Venta;
