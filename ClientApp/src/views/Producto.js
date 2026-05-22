import { useEffect, useState, useContext } from "react";
import DataTable from "react-data-table-component";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  Input,
  FormGroup,
  ModalFooter,
  Row,
  Col,
} from "reactstrap";
import Swal from "sweetalert2";
import {
  exportToPDF,
  exportToExcel,
  applySearchFilter,
} from "../utils/exportHelpers";
import { UserContext } from "../context/UserProvider";
import { 
  FaBoxOpen, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaBarcode,
  FaFilePdf,
  FaFileExcel,
  FaFilter,
  FaHistory,
  FaPlusCircle,
  FaBox,
  FaTags,
  FaDollarSign,
  FaWarehouse
} from "react-icons/fa";

const modeloProducto = {
  idProducto: 0,
  nombre: "",
  descripcion: "",
  idCategoria: 0,
  idProveedor: 0,
  precio: 0,
  unidades: null,
  esActivo: true,
};

const Producto = () => {
  const { user } = useContext(UserContext);
  const [producto, setProducto] = useState(modeloProducto);
  const [pendiente, setPendiente] = useState(true);
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [verModal, setVerModal] = useState(false);
  const [modoSoloLectura, setModoSoloLectura] = useState(false);
  const [verModalUnidades, setVerModalUnidades] = useState(false);
  const [productoParaUnidades, setProductoParaUnidades] = useState(null);
  const [unidadesAAgregar, setUnidadesAAgregar] = useState("");
  const [verModalHistorial, setVerModalHistorial] = useState(false);
  const [historialProducto, setHistorialProducto] = useState([]);
  const [productoParaHistorial, setProductoParaHistorial] = useState(null);

    // Estado para controlar si ya se mostró la alerta de stock bajo

  const [alertaMostrada, setAlertaMostrada] = useState(false);

  const handleChange = (e) => {
    let value;

    if (e.target.name === "idCategoria" || e.target.name === "idProveedor") {
      value = e.target.value;
    } else if (e.target.name === "esActivo") {
      value = e.target.value === "true" ? true : false;
    } else if (e.target.name === "unidades") {
      if (e.target.value === "" || e.target.value === null || e.target.value === undefined) {
        value = null;
      } else {
        const parsedValue = parseInt(e.target.value);
        value = isNaN(parsedValue) ? null : parsedValue;
      }
    } else {
      value = e.target.value;
    }

    setProducto({
      ...producto,
      [e.target.name]: value,
    });
  };

  // Combined filtering function that applies both search and status filters
  const applyFilters = (data, searchValue, statusValue) => {
    let filtered = data;

    // Apply status filter
    if (statusValue === "activos") {
      filtered = filtered.filter((item) => item.esActivo === true);
    }
    else if(statusValue==='stock bajo')
      {
        filtered = filtered.filter((item) => item.unidades !== null && item.unidades !== undefined && item.unidades <= 10);
      } 
    
    else if (statusValue === "inactivos") {
      filtered = filtered.filter((item) => item.esActivo === false);
    }
    // "todos" shows all items, no additional filtering needed

    // Apply search filter
    if (searchValue && searchValue !== "") {
      const searchFields = [
        { accessor: (item) => item.nombre },
        { accessor: (item) => item.descripcion },
        { accessor: (item) => item.idCategoriaNavigation?.descripcion || "" },
        { accessor: (item) => item.idProveedorNavigation?.nombre || "" },
        { accessor: (item) => (item.esActivo ? "activo" : "no activo") },
      ];

      filtered = applySearchFilter(filtered, searchValue, searchFields);
    }

    return filtered;
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = applyFilters(productos, value, statusFilter);
    setFilteredProductos(filtered);
  };

  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setStatusFilter(value);

    const filtered = applyFilters(productos, searchTerm, value);
    setFilteredProductos(filtered);
  };

  const exportToPDFHandler = () => {
    const columns = [
      { header: "Nombre", accessor: (row) => row.nombre },
      { header: "Descripción", accessor: (row) => row.descripcion },
      {
        header: "Categoría",
        accessor: (row) => row.idCategoriaNavigation?.descripcion || "",
      },
      {
        header: "Proveedor",
        accessor: (row) => row.idProveedorNavigation?.nombre || "Sin proveedor",
      },
      {
        header: "Unidades",
        accessor: (row) => (row.unidades !== null && row.unidades !== undefined ? row.unidades : "Sin unidades"),
      },
      { header: "Precio", accessor: (row) => `C$${row.precio}` },
      {
        header: "Estado",
        accessor: (row) => (row.esActivo ? "Activo" : "No Activo"),
      },
    ];

    exportToPDF(filteredProductos, columns, "Lista_de_Productos");
  };

  const exportToExcelHandler = () => {
    const excelData = filteredProductos.map((prod) => ({
      ID: prod.idProducto,
      Nombre: prod.nombre,
      Descripción: prod.descripcion,
      Categoría: prod.idCategoriaNavigation?.descripcion || "",
      Proveedor: prod.idProveedorNavigation?.nombre || "Sin proveedor",
      Unidades: prod.unidades !== null && prod.unidades !== undefined ? prod.unidades : "Sin unidades",
      Precio: `C$${prod.precio}`,
      Estado: prod.esActivo ? "Activo" : "No Activo",
    }));

    exportToExcel(excelData, "Productos");
  };

  const obtenerCategorias = async () => {
    try {
      let response = await fetch("api/categoria/Lista");
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const text = await response.text();
          if (text && text.trim()) {
            try {
              let data = JSON.parse(text);
              setCategorias(() => data.filter((item) => item.esActivo));
            } catch (parseError) {
              console.error("Error parsing categorias JSON:", parseError);
              console.error("Response text:", text);
              setCategorias([]);
            }
          } else {
            console.warn("Empty response received from categorias API");
            setCategorias([]);
          }
        } else {
          console.error("Categorias response is not JSON:", contentType);
          setCategorias([]);
        }
      } else {
        console.error("HTTP error in categorias:", response.status, response.statusText);
        setCategorias([]);
      }
    } catch (error) {
      console.error("Error obteniendo categorías:", error);
      setCategorias([]);
    }
  };

  const obtenerProveedores = async () => {
    try {
      let response = await fetch("api/proveedor/Lista");
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const text = await response.text();
          if (text && text.trim()) {
            try {
              let data = JSON.parse(text);
              setProveedores(() => data.filter((item) => item.esActivo));
            } catch (parseError) {
              console.error("Error parsing proveedores JSON:", parseError);
              console.error("Response text:", text);
              setProveedores([]);
            }
          } else {
            console.warn("Empty response received from proveedores API");
            setProveedores([]);
          }
        } else {
          console.error("Proveedores response is not JSON:", contentType);
          setProveedores([]);
        }
      } else {
        console.error("HTTP error in proveedores:", response.status, response.statusText);
        setProveedores([]);
      }
    } catch (error) {
      console.error("Error obteniendo proveedores:", error);
      setProveedores([]);
    }
  };

  const obtenerProductos = async () => {
    try {
      let response = await fetch("api/producto/Lista");
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const text = await response.text();
          if (text && text.trim()) {
            try {
              let data = JSON.parse(text);
              setProductos(() => data);
              setFilteredProductos(() => data);
            } catch (parseError) {
              console.error("Error parsing JSON:", parseError);
              console.error("Response text:", text);
              setProductos([]);
              setFilteredProductos([]);
            }
          } else {
            console.warn("Empty response received from server");
            setProductos([]);
            setFilteredProductos([]);
          }
        } else {
          console.error("Response is not JSON:", contentType);
          setProductos([]);
          setFilteredProductos([]);
        }
      } else {
        console.error("HTTP error:", response.status, response.statusText);
        setProductos([]);
        setFilteredProductos([]);
      }
      setPendiente(false);
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      setProductos([]);
      setFilteredProductos([]);
      setPendiente(false);
    }
  };

  useEffect(() => {
    obtenerCategorias();
    obtenerProveedores();
    obtenerProductos();

  }, []);

  // Separate useEffect to handle search term and status filter changes
  useEffect(() => {
    const filtered = applyFilters(productos, searchTerm, statusFilter);
    setFilteredProductos(filtered);
  }, [searchTerm, statusFilter, productos]);

  // Check for low stock products and show alerts
  useEffect(() => {
    if (productos.length > 0 && !alertaMostrada) {
      const productosPocoStock = productos.filter(producto => 
        producto.unidades !== null && 
        producto.unidades !== undefined && 
        producto.unidades < 11 && 
        producto.esActivo
      );
      
      if (productosPocoStock.length > 0) {
        const nombreProductos = productosPocoStock.map(p => p.nombre).join(', ');
        Swal.fire({
          title: 'Alerta de Stock Bajo',
          text: `Los siguientes productos tienen menos de 10 unidades: ${nombreProductos}`,
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });

        setAlertaMostrada(true); // Evitar mostrar la alerta nuevamente
      }
    }
  }, [alertaMostrada, productos]);

  const columns = [
    {
      name: "Nombre",
      selector: (row) => row.nombre,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaBox className="mr-2 text-primary" />
          <span className="font-weight-bold">{row.nombre}</span>
        </div>
      ),
    },
    {
      name: "Descripcion",
      selector: (row) => row.descripcion,
      wrap: true,
      sortable: true,
      width: '200px',
    },
    {
      name: "Categoria",
      selector: (row) => row.idCategoriaNavigation?.descripcion || "",
      width: '180px',
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaTags className="mr-2 text-warning" />
          {row.idCategoriaNavigation?.descripcion || "Sin categoría"}
        </div>
      ),
    },
    {
      name: "Unidades",
      width: '150px',
      selector: (row) => row.unidades,
      sortable: true,
      cell: (row) => {
        const unidades = row.unidades ?? "Sin unidades";
        const isLowStock = row.unidades !== null && row.unidades !== undefined && row.unidades < 11;
        return (
          <div className="d-flex align-items-center">
            <FaWarehouse className={`mr-2 ${isLowStock ? 'text-danger' : 'text-success'}`} />
            <span className={isLowStock ? 'text-danger font-weight-bold' : ''}>{unidades}</span>
          </div>
        );
      },
    },
    {
      name: "Estado",
      selector: (row) => row.esActivo,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span 
          className={`badge ${row.esActivo ? 'badge-success' : 'badge-secondary'} p-2`}
          style={{
            fontSize: '11px',
            borderRadius: '20px',
            padding: '6px 12px'
          }}
        >
          {row.esActivo ? "Activo" : "No Activo"}
        </span>
      ),
    },
    {
      name: "Acciones",
      width: "260px",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            size="sm"
            className="mr-1"
            onClick={() => abrirVerModal(row)}
            title="Ver detalles"
            style={{
              backgroundColor: '#3B82F6',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px'
            }}
          >
            <FaEye />
          </Button>

          <Button
            size="sm"
            className="mr-1"
            onClick={() => abrirEditarModal(row)}
            title="Editar producto"
            style={{
              backgroundColor: '#D946A6',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px'
            }}
          >
            <FaEdit />
          </Button>

          <Button
            size="sm"
            className="mr-1"
            onClick={() => abrirModalAgregarUnidades(row)}
            title="Agregar Unidades"
            disabled={row.unidades === null || row.unidades === undefined}
            style={{
              backgroundColor: '#10B981',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              opacity: row.unidades === null || row.unidades === undefined ? 0.5 : 1
            }}
          >
            <FaPlusCircle />
          </Button>

          <Button
            size="sm"
            className="mr-1"
            onClick={() => abrirModalHistorial(row)}
            title="Ver Historial de Unidades"
            disabled={row.unidades === null || row.unidades === undefined}
            style={{
              backgroundColor: '#F59E0B',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              opacity: row.unidades === null || row.unidades === undefined ? 0.5 : 1
            }}
          >
            <FaHistory />
          </Button>

          <Button
            size="sm"
            onClick={() => eliminarProducto(row.idProducto)}
            title="Eliminar producto"
            style={{
              backgroundColor: '#EF4444',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px'
            }}
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: 700,
        backgroundColor: "#F8F9FA",
        color: "#1F2937",
        paddingTop: "16px",
        paddingBottom: "16px",
        borderBottom: "2px solid #E5E7EB",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#F8F9FA",
        borderRadius: "12px 12px 0 0",
      },
    },
    rows: {
      style: {
        fontSize: "13px",
        color: "#374151",
        minHeight: "56px",
        "&:hover": {
          backgroundColor: "#F9FAFB",
          transition: "all 0.3s ease",
        },
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
  };

  const conditionalRowStyles = [
    {
      when: row => row.unidades !== null && row.unidades !== undefined && row.unidades < 11 && row.esActivo,
      style: {
        backgroundColor: '#FEF2F2',
        color: '#991B1B',
        borderLeft: '4px solid #EF4444',
        fontWeight: 500,
      },
    },
  ];

  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  const abrirEditarModal = (data) => {
    setProducto(data);
    setModoSoloLectura(false);
    setVerModal(!verModal);
  };

  const abrirVerModal = (data) => {
    setProducto(data);
    setModoSoloLectura(true);
    setVerModal(!verModal);
  };

  const cerrarModal = () => {
    setProducto(modeloProducto);
    setModoSoloLectura(false);
    setVerModal(!verModal);
  };

  const abrirModalAgregarUnidades = (data) => {
    setProductoParaUnidades(data);
    setUnidadesAAgregar("");
    setVerModalUnidades(true);
  };

  const cerrarModalUnidades = () => {
    setProductoParaUnidades(null);
    setUnidadesAAgregar("");
    setVerModalUnidades(false);
  };

  const abrirModalHistorial = async (data) => {
    setProductoParaHistorial(data);
    setVerModalHistorial(true);
    
    try {
      const response = await fetch(`api/historialproducto/GetHistorialByProducto/${data.idProducto}`);
      if (response.ok) {
        const historial = await response.json();
        setHistorialProducto(historial);
      } else {
        setHistorialProducto([]);
        Swal.fire("Advertencia", "No se pudo cargar el historial", "warning");
      }
    } catch (error) {
      setHistorialProducto([]);
      Swal.fire("Error", "Error al cargar el historial", "error");
    }
  };

  const cerrarModalHistorial = () => {
    setProductoParaHistorial(null);
    setHistorialProducto([]);
    setVerModalHistorial(false);
  };

  const agregarUnidades = async () => {
    try {
      // Validations
      if (!unidadesAAgregar || unidadesAAgregar.trim() === "") {
        Swal.fire("Advertencia", "Debe ingresar una cantidad de unidades", "warning");
        return;
      }

      const unidades = parseInt(unidadesAAgregar);
      if (isNaN(unidades)) {
        Swal.fire("Advertencia", "Debe ingresar un número entero válido", "warning");
        return;
      }

      if (unidades <= 0) {
        Swal.fire("Advertencia", "Debe ingresar un número positivo", "warning");
        return;
      }

      const userData = JSON.parse(user);
      const requestData = {
        idUsuario: userData.idUsuario,
        unidadesAAgregar: unidades
      };

      const response = await fetch(`api/producto/AgregarUnidades/${productoParaUnidades.idProducto}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        await obtenerProductos();
        cerrarModalUnidades();
        
        Swal.fire(
          "Éxito",
          `Se agregaron ${unidades} unidades al producto`,
          "success"
        );
      } else {
        const errorText = await response.text();
        Swal.fire("Error", `No se pudieron agregar las unidades: ${errorText}`, "error");
      }
    } catch (error) {
      console.error("Error al agregar unidades:", error);
      Swal.fire("Error", "Ocurrió un error inesperado", "error");
    }
  };

  const guardarCambios = async () => {
    try {
      if (!producto.idCategoria || parseInt(producto.idCategoria) <= 0) {
        Swal.fire("Advertencia", "Debe seleccionar una categoría", "warning");
        return;
      }

      // Eliminar propiedades de navegación para evitar problemas en la serialización
      const productoParaEnviar = { ...producto };
      delete productoParaEnviar.idCategoriaNavigation;
      delete productoParaEnviar.idProveedorNavigation;

      let response;
      if (productoParaEnviar.idProducto === 0) {
        response = await fetch("api/producto/Guardar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(productoParaEnviar),
        });
      } else {
        response = await fetch("api/producto/Editar", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(productoParaEnviar),
        });
      }

      if (response.ok) {
        await obtenerProductos();
        setProducto(modeloProducto);
        setVerModal(!verModal);

        Swal.fire(
          `${productoParaEnviar.idProducto === 0 ? "Guardado" : "Actualizado"}`,
          `El producto fue ${
            productoParaEnviar.idProducto === 0 ? "Agregado" : "Actualizado"
          }`,
          "success"
        );
      } else {
        const errorText = await response.text();
        Swal.fire("Opp!", `No se pudo guardar: ${errorText}`, "warning");
      }
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      Swal.fire("Error", "Ocurrió un error inesperado", "error");
    }
  };

  const eliminarProducto = async (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Desea desactivar el producto",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "No, volver",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch("api/producto/Eliminar/" + id, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              obtenerProductos();
              Swal.fire("Desactivado!", "El producto fue desactivado.", "success");
            } else {
              response.text().then((errorText) => {
                Swal.fire("Error", `Error al desactivar: ${errorText}`, "error");
              });
            }
          })
          .catch((error) => {
            console.error("Error desactivando producto:", error);
            Swal.fire("Error", "Ocurrió un error inesperado", "error");
          });
      }
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    guardarCambios();
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center">
          <div 
            className="d-flex align-items-center justify-content-center mr-3"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
              boxShadow: '0 4px 6px rgba(217, 70, 166, 0.3)'
            }}
          >
            <FaBoxOpen style={{ fontSize: '24px', color: 'white' }} />
          </div>
          <div>
            <h2 className="mb-0" style={{ color: '#1F2937', fontWeight: 700 }}>
              Gestión de Productos
            </h2>
            <p className="mb-0 text-muted" style={{ fontSize: '14px' }}>
              Administra tu inventario de productos
            </p>
          </div>
        </div>
      </div>

      <Row>
        <Col sm="12">
          <Card 
            style={{ 
              border: 'none', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)' 
            }}
          >
            <CardHeader 
              style={{ 
                background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
                borderRadius: '16px 16px 0 0',
                border: 'none',
                padding: '20px 24px'
              }}
            >
              <Row className="align-items-center">
                <Col sm="6">
                  <div className="d-flex align-items-center">
                    <FaBarcode style={{ fontSize: '24px', color: 'white', marginRight: '12px' }} />
                    <h5 className="mb-0" style={{ color: 'white', fontWeight: 600 }}>
                      Lista de Productos
                    </h5>
                  </div>
                </Col>
                <Col sm="6" className="text-right">
                  <Button
                    size="sm"
                    onClick={() => setVerModal(!verModal)}
                    style={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 20px',
                      fontWeight: 600,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <FaPlus className="mr-2" />
                    Nuevo Producto
                  </Button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody style={{ padding: '24px' }}>
              <Row className="mb-4">
                <Col sm="3" className="mb-3 my-sm-0">
                  <div className="position-relative">
                    <FaFilter 
                      style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: '#9CA3AF',
                        zIndex: 1
                      }} 
                    />
                    <Input
                      type="select"
                      value={statusFilter}
                      onChange={handleStatusFilter}
                      bsSize="sm"
                      style={{
                        border: '2px solid #E5E7EB',
                        borderRadius: '10px',
                        paddingLeft: '36px',
                        fontSize: '14px',
                        height: '40px',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#D946A6'}
                      onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    >
                      <option value="todos">Todos</option>
                      <option value="activos">Activos</option>
                      <option value="inactivos">Inactivos</option>
                      <option value="stock bajo">Unidades bajas</option>
                    </Input>
                  </div>
                </Col>
                <Col sm="4" className="mb-3 my-sm-0">
                  <div className="position-relative">
                    <FaSearch 
                      style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: '#9CA3AF',
                        zIndex: 1
                      }} 
                    />
                    <Input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={handleSearch}
                      bsSize="sm"
                      style={{
                        border: '2px solid #E5E7EB',
                        borderRadius: '10px',
                        paddingLeft: '36px',
                        fontSize: '14px',
                        height: '40px',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#D946A6'}
                      onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                </Col>
                <Col sm="5" className="text-right">
                  <Button
                    size="sm"
                    className="mr-2"
                    onClick={exportToPDFHandler}
                    style={{
                      backgroundColor: '#EF4444',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontWeight: 600,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
                  >
                    <FaFilePdf className="mr-1" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    onClick={exportToExcelHandler}
                    style={{
                      backgroundColor: '#10B981',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontWeight: 600,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
                  >
                    <FaFileExcel className="mr-1" />
                    Excel
                  </Button>
                </Col>
              </Row>

              <div style={{ 
                borderRadius: '12px', 
                overflow: 'hidden',
                border: '1px solid #E5E7EB'
              }}>
                <DataTable
                  columns={columns}
                  data={filteredProductos}
                  customStyles={customStyles}
                  conditionalRowStyles={conditionalRowStyles}
                  pagination
                  paginationComponentOptions={paginationComponentOptions}
                  fixedHeader
                  fixedHeaderScrollHeight="600px"
                  progressPending={pendiente}
                  noDataComponent={
                    <div className="text-center p-5">
                      <FaSearch style={{ fontSize: '48px', color: '#D1D5DB', marginBottom: '16px' }} />
                      <p className="text-muted mb-0" style={{ fontSize: '15px' }}>
                        No se encontraron registros coincidentes
                      </p>
                    </div>
                  }
                />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={verModal} toggle={cerrarModal} size="lg">
        <form onSubmit={handleSubmit}>
          <ModalHeader 
            toggle={cerrarModal}
            style={{
              background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0',
            }}
          >
            <div className="d-flex align-items-center">
              <FaBoxOpen className="mr-2" style={{ fontSize: '20px' }} />
              <span style={{ fontWeight: 600 }}>
                {producto.idProducto === 0
                  ? "Nuevo Producto"
                  : modoSoloLectura
                  ? "Ver Producto"
                  : "Editar Producto"}
              </span>
            </div>
          </ModalHeader>
          <ModalBody style={{ padding: '24px' }}>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                    <FaBox className="mr-2" style={{ color: '#D946A6' }} />
                    Nombre
                  </Label>
                  <Input
                    bsSize="sm"
                    name="nombre"
                    onChange={handleChange}
                    value={producto.nombre}
                    required
                    readOnly={modoSoloLectura}
                    style={{
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px'
                    }}
                  />
                </FormGroup>
              </Col>
              <Col sm={6}>
                <FormGroup>
                  <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                    <FaBarcode className="mr-2" style={{ color: '#F59E0B' }} />
                    Descripción
                  </Label>
                  <Input
                    bsSize="sm"
                    name="descripcion"
                    onChange={handleChange}
                    value={producto.descripcion}
                    readOnly={modoSoloLectura}
                    style={{
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px'
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                    <FaTags className="mr-2" style={{ color: '#10B981' }} />
                    Categoría
                  </Label>
                  <Input
                    bsSize="sm"
                    type="select"
                    name="idCategoria"
                    onChange={handleChange}
                    value={producto.idCategoria}
                    required
                    disabled={modoSoloLectura}
                    style={{
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px'
                    }}
                  >
                    <option value={0}>Seleccionar</option>
                    {categorias.map((item) => (
                      <option key={item.idCategoria} value={item.idCategoria}>
                        {item.descripcion}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col sm={6}>
                <FormGroup>
                  <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                    <FaBox className="mr-2" style={{ color: '#3B82F6' }} />
                    Proveedor
                  </Label>
                  <Input
                    bsSize="sm"
                    type="select"
                    name="idProveedor"
                    onChange={handleChange}
                    value={producto.idProveedor}
                    disabled={modoSoloLectura}
                    style={{
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px'
                    }}
                  >
                    <option value={0}>Seleccionar</option>
                    {proveedores.map((item) => (
                      <option key={item.idProveedor} value={item.idProveedor}>
                        {item.nombre}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                    <FaDollarSign className="mr-2" style={{ color: '#10B981' }} />
                    Precio
                  </Label>
                  <Input
                    bsSize="sm"
                    name="precio"
                    type="number"
                    min={0.01}
                    step="0.01"
                    onChange={handleChange}
                    value={producto.precio}
                    required
                    readOnly={modoSoloLectura}
                    style={{
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px'
                    }}
                  />
                </FormGroup>
              </Col>
              <Col sm={6}>
                <FormGroup>
                  <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                    <FaWarehouse className="mr-2" style={{ color: '#F59E0B' }} />
                    Unidades (Opcional)
                  </Label>
                  <Input
                    bsSize="sm"
                    name="unidades"
                    type="number"
                    min={0}
                    step="1"
                    onChange={handleChange}
                    value={producto.unidades ?? ""}
                    readOnly={modoSoloLectura}
                    placeholder="Dejar vacío si no se gestionan unidades"
                    style={{
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px'
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                    Estado
                  </Label>
                  <Input
                    bsSize="sm"
                    type="select"
                    name="esActivo"
                    onChange={handleChange}
                    value={producto.esActivo}
                    disabled={modoSoloLectura}
                    style={{
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px'
                    }}
                  >
                    <option value={true}>Activo</option>
                    <option value={false}>Inactivo</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter style={{ borderTop: '1px solid #E5E7EB', padding: '16px 24px' }}>
            {!modoSoloLectura && (
              <Button 
                type="submit" 
                size="sm"
                style={{
                  background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 24px',
                  fontWeight: 600,
                  color: 'white'
                }}
              >
                Guardar
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={cerrarModal}
              style={{
                backgroundColor: '#6B7280',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 24px',
                fontWeight: 600,
                color: 'white'
              }}
            >
              Cerrar
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal para agregar unidades */}
      <Modal isOpen={verModalUnidades} toggle={cerrarModalUnidades}>
        <ModalHeader 
          toggle={cerrarModalUnidades}
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
          }}
        >
          <div className="d-flex align-items-center">
            <FaPlusCircle className="mr-2" style={{ fontSize: '20px' }} />
            <span style={{ fontWeight: 600 }}>
              Agregar Unidades - {productoParaUnidades?.nombre}
            </span>
          </div>
        </ModalHeader>
        <ModalBody style={{ padding: '24px' }}>
          <FormGroup>
            <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
              <FaWarehouse className="mr-2" style={{ color: '#10B981' }} />
              Unidades actuales: <span style={{ color: '#D946A6', fontWeight: 700 }}>{productoParaUnidades?.unidades ?? "Sin unidades registradas"}</span>
            </Label>
          </FormGroup>
          <FormGroup>
            <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
              Ingrese las unidades a agregar:
            </Label>
            <Input
              type="number"
              min="1"
              step="1"
              value={unidadesAAgregar}
              onChange={(e) => setUnidadesAAgregar(e.target.value)}
              placeholder="Ingrese un número entero positivo"
              style={{
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '14px'
              }}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter style={{ borderTop: '1px solid #E5E7EB', padding: '16px 24px' }}>
          <Button 
            onClick={agregarUnidades}
            style={{
              backgroundColor: '#10B981',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 24px',
              fontWeight: 600,
              color: 'white'
            }}
          >
            Agregar
          </Button>
          <Button 
            onClick={cerrarModalUnidades}
            style={{
              backgroundColor: '#6B7280',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 24px',
              fontWeight: 600,
              color: 'white'
            }}
          >
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal para ver historial de productos */}
      <Modal isOpen={verModalHistorial} toggle={cerrarModalHistorial} size="lg">
        <ModalHeader 
          toggle={cerrarModalHistorial}
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #D946A6 100%)',
            color: 'white',
            border: 'none',
          }}
        >
          <div className="d-flex align-items-center">
            <FaHistory className="mr-2" style={{ fontSize: '20px' }} />
            <span style={{ fontWeight: 600 }}>
              Historial - {productoParaHistorial?.nombre}
            </span>
          </div>
        </ModalHeader>
        <ModalBody style={{ padding: '24px' }}>
          {historialProducto.length === 0 ? (
            <div className="text-center p-4">
              <FaHistory style={{ fontSize: '48px', color: '#D1D5DB', marginBottom: '16px' }} />
              <p className="text-muted" style={{ fontSize: '15px' }}>
                No hay registros de historial para este producto.
              </p>
            </div>
          ) : (
            <div 
              className="table-responsive" 
              style={{ 
                borderRadius: '12px', 
                overflow: 'hidden',
                border: '1px solid #E5E7EB'
              }}
            >
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: '#F8F9FA' }}>
                  <tr>
                    <th style={{ fontWeight: 600, color: '#1F2937', fontSize: '14px', padding: '14px' }}>
                      Fecha de Registro
                    </th>
                    <th style={{ fontWeight: 600, color: '#1F2937', fontSize: '14px', padding: '14px' }}>
                      Usuario
                    </th>
                    <th style={{ fontWeight: 600, color: '#1F2937', fontSize: '14px', padding: '14px' }}>
                      Unidades Agregadas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historialProducto.map((entry, index) => (
                    <tr key={index} style={{ fontSize: '13px' }}>
                      <td style={{ padding: '14px', color: '#374151' }}>{entry.fechaRegistro}</td>
                      <td style={{ padding: '14px', color: '#374151' }}>{entry.nombreUsuario}</td>
                      <td style={{ padding: '14px' }}>
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: '#10B981', 
                            color: 'white', 
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          +{entry.unidadesAgregadas}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ModalBody>
        <ModalFooter style={{ borderTop: '1px solid #E5E7EB', padding: '16px 24px' }}>
          <Button 
            onClick={cerrarModalHistorial}
            style={{
              backgroundColor: '#6B7280',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 24px',
              fontWeight: 600,
              color: 'white'
            }}
          >
            Cerrar
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Producto;
