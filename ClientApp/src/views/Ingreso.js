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
  FaMoneyBillWave, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaFilePdf, 
  FaFileExcel, 
  FaSearch,
  FaFileAlt,
  FaDollarSign,
  FaCreditCard,
  FaCoins,
  FaToggleOn,
  FaCalendar,
  FaUser
} from "react-icons/fa";

const modeloIngreso = {
  idIngreso: 0,
  descripcion: "",
  monto: 1,
  tipoPago: "Efectivo",
  tipoDinero: "Cordobas",
  idUsuario: 0,
  esActivo: true,
  fechaRegistro: null,
};

const Ingreso = () => {
  const { user } = useContext(UserContext);
  const [ingreso, setIngreso] = useState(modeloIngreso);
  const [pendiente, setPendiente] = useState(true);
  const [ingresos, setIngresos] = useState([]);
  const [filteredIngresos, setFilteredIngresos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [verModal, setVerModal] = useState(false);
  const [modoSoloLectura, setModoSoloLectura] = useState(false);
  const [modoEdicionDescripcion, setModoEdicionDescripcion] = useState(false);


  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "monto") {
      value = parseFloat(value) || 0;
    }

    if (name === "tipoPago" && value === "Tarjeta") {
      setIngreso({
        ...ingreso,
        [name]: value,
        tipoDinero: "Cordobas", // 👈 se fuerza Cordobas
      });
    } else {
      setIngreso({
        ...ingreso,
        [name]: value,
      });
    }
  };

  // Combined filtering function that applies both search and status filters
  const applyFilters = (data, searchValue, statusValue) => {
    let filtered = data;

    // Apply status filter
    if (statusValue === "activos") {
      filtered = filtered.filter((item) => item.esActivo === true);
    } else if (statusValue === "inactivos") {
      filtered = filtered.filter((item) => item.esActivo === false);
    }
    // "todos" shows all items, no additional filtering needed

    // Apply search filter
    if (searchValue && searchValue !== "") {
      const searchFields = [
        { accessor: (item) => item.descripcion },
        { accessor: (item) => item.monto },
        { accessor: (item) => item.tipoDinero },
        { accessor: (item) => item.nombreUsuario },
        { accessor: (item) => item.fechaRegistro },
        { accessor: (item) => item.tipoPago },
        { accessor: (item) => (item.esActivo ? "activo" : "no activo") },
      ];

      filtered = applySearchFilter(filtered, searchValue, searchFields);
    }

    return filtered;
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = applyFilters(ingresos, value, statusFilter);
    setFilteredIngresos(filtered);
  };

  // Status filter function - currently not used in UI but kept for future implementation
  // eslint-disable-next-line no-unused-vars
  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setStatusFilter(value);

    const filtered = applyFilters(ingresos, searchTerm, value);
    setFilteredIngresos(filtered);
  };

  const exportToPDFHandler = () => {
    const columns = [
      { header: "Descripción", accessor: (row) => row.descripcion },
      { header: "Fecha", accessor: (row) => row.fechaRegistro },
      { header: "Monto", accessor: (row) => `${row.monto}` },
      { header: "Moneda", accessor: (row) => row.tipoDinero },
      { header: "Tipo de Pago", accessor: (row) => row.tipoPago },
      { header: "Usuario", accessor: (row) => row.nombreUsuario },
      {
        header: "Estado",
        accessor: (row) => (row.esActivo ? "Activo" : "No Activo"),
      },
    ];

    exportToPDF(filteredIngresos, columns, "Lista_de_Ingresos");
  };

  const exportToExcelHandler = () => {
    const excelData = filteredIngresos.map((ing) => ({
      ID: ing.idIngreso,
      Descripción: ing.descripcion,
      Fecha: ing.fechaRegistro,
      Monto: ing.monto,
      Moneda: ing.tipoDinero,
      TipoDePago: ing.tipoPago,
      Usuario: ing.nombreUsuario,
      Estado: ing.esActivo ? "Activo" : "No Activo",
    }));

    exportToExcel(excelData, "Ingresos");
  };

  const obtenerIngresos = async () => {
    try {
      let response = await fetch("api/ingreso/Lista");

      if (response.ok) {
        let data = await response.json();
        setIngresos(data);
        setFilteredIngresos(data);
        setPendiente(false);
      }
    } catch (error) {
      console.error("Error al obtener ingresos:", error);
      setPendiente(false);
    }
  };

  const abrirEditarModal = (data) => {
    setIngreso({
      idIngreso: data.idIngreso,
      descripcion: data.descripcion,
      monto: parseFloat(data.monto) || 0,
      tipoPago: data.tipoPago || "Efectivo",
      tipoDinero: data.tipoDinero,
      idUsuario: data.idUsuario,
      esActivo: data.esActivo,
      fechaRegistro: data.fechaRegistro,
    });
    setModoSoloLectura(false);
    setModoEdicionDescripcion(true);
    setVerModal(!verModal);
  };

  const abrirVerModal = (data) => {
    setIngreso({
      ...data,
      monto: parseFloat(data.monto) || 0,
    });
    setModoSoloLectura(true);
    setModoEdicionDescripcion(false);
    setVerModal(!verModal);
  };

  const cerrarModal = () => {
    setIngreso(modeloIngreso);
    setModoSoloLectura(false);
    setModoEdicionDescripcion(false);
    setVerModal(!verModal);
  };

  const guardarCambios = async () => {
    try {
      // Get current user data
      const userData = JSON.parse(user);

      // Prepare data for sending with PascalCase property names for backend
      const ingresoParaEnviar = {
        Descripcion: ingreso.descripcion,
        Monto: ingreso.monto,
        TipoPago: ingreso.tipoPago,
        TipoDinero: ingreso.tipoDinero,
        IdUsuario: userData.idUsuario,
        EsActivo: ingreso.esActivo,
      };

      // For edit operations, include the ID but never include FechaRegistro
      if (ingreso.idIngreso !== 0) {
        ingresoParaEnviar.IdIngreso = ingreso.idIngreso;
      }

      let response;
      if (ingreso.idIngreso === 0) {
        response = await fetch("api/ingreso/Guardar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(ingresoParaEnviar),
        });
      } else {
        response = await fetch("api/ingreso/Editar", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(ingresoParaEnviar),
        });
      }

      if (response.ok) {
        // Refresh the list
        await obtenerIngresos();
        setIngreso(modeloIngreso);
        setVerModal(!verModal);

        Swal.fire(
          `${ingreso.idIngreso === 0 ? "Guardado" : "Actualizado"}`,
          `El ingreso fue ${
            ingreso.idIngreso === 0 ? "agregado" : "actualizado"
          }`,
          "success"
        );
      } else {
        const errorText = await response.text();
        Swal.fire("Opp!", `No se pudo guardar: ${errorText}`, "warning");
      }
    } catch (error) {
      Swal.fire("Error", "Error en la conexión con el servidor", "error");
    }
  };

  // Delete function - currently not used in UI but kept for future implementation
  // eslint-disable-next-line no-unused-vars
  const eliminarIngreso = async (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "¿Desea eliminar este ingreso permanentemente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`api/ingreso/Eliminar/${id}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              // Refresh the list
              obtenerIngresos();
              Swal.fire("Eliminado!", "El ingreso fue eliminado.", "success");
            } else {
              return response.text().then((error) => {
                Swal.fire("Error", error, "error");
              });
            }
          })
          .catch((error) => {
            Swal.fire("Error", "Error en la conexión con el servidor", "error");
          });
      }
    });
  };

  useEffect(() => {
    obtenerIngresos();
  }, []);

  // Update filtered list when search term or ingresos change
  useEffect(() => {
    const filtered = applyFilters(ingresos, searchTerm, statusFilter);
    setFilteredIngresos(filtered);
  }, [searchTerm, statusFilter, ingresos]);

  const columns = [
    {
      name: "Descripción",
      selector: (row) => row.descripcion,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaFileAlt className="mr-2" style={{ color: '#6366F1' }} />
          <span>{row.descripcion}</span>
        </div>
      ),
    },
    {
      name: "Fecha",
      selector: (row) => row.fechaRegistro,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaCalendar className="mr-2" style={{ color: '#8B5CF6' }} />
          <span>{row.fechaRegistro}</span>
        </div>
      ),
    },
    {
      name: "Monto",
      selector: (row) => row.monto,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaDollarSign className="mr-2" style={{ color: '#10B981' }} />
          <span className="font-weight-bold">{parseFloat(row.monto).toFixed(2)}</span>
        </div>
      ),
    },
    {
      name: "Moneda",
      selector: (row) => row.tipoDinero,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaCoins className="mr-2" style={{ color: '#F59E0B' }} />
          <span>{row.tipoDinero}</span>
        </div>
      ),
    },
    {
      name: "Tipo de Pago",
      selector: (row) => row.tipoPago,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaCreditCard className="mr-2" style={{ color: '#3B82F6' }} />
          <span>{row.tipoPago}</span>
        </div>
      ),
    },
    {
      name: "Usuario",
      selector: (row) => row.nombreUsuario,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaUser className="mr-2" style={{ color: '#D946A6' }} />
          <span>{row.nombreUsuario}</span>
        </div>
      ),
    },
    {
      name: "Acciones",
      width: "180px",
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
            onClick={() => abrirEditarModal(row)}
            title="Editar ingreso"
            style={{
              backgroundColor: '#D946A6',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px'
            }}
          >
            <FaEdit />
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

  const paginationOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  return (
    <>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
        padding: '24px 32px',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 8px 16px rgba(217, 70, 166, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '12px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          }}>
            <FaMoneyBillWave size={32} color="white" />
          </div>
          <div>
            <h2 style={{ 
              color: 'white', 
              margin: 0, 
              fontSize: '28px', 
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Gestión de Ingresos
            </h2>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              margin: 0, 
              fontSize: '14px',
              marginTop: '4px'
            }}>
              Administra y controla todos los ingresos del sistema
            </p>
          </div>
        </div>
      </div>

      <Row>
        <Col sm="12">
          <Card style={{
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}>
            <CardHeader style={{ 
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              padding: '20px 24px',
              border: 'none'
            }}>
              <Row>
                <Col sm="6" style={{ display: 'flex', alignItems: 'center' }}>
                  <h5 style={{ 
                    color: 'white', 
                    margin: 0, 
                    fontSize: '20px', 
                    fontWeight: 600 
                  }}>
                    Lista de Ingresos
                  </h5>
                </Col>
                <Col sm="6" className="text-right">
                  <Button
                    size="sm"
                    onClick={() => {
                      setVerModal(!verModal)
                      setModoEdicionDescripcion(false)
                    }}
                    style={{
                      background: 'white',
                      color: '#10B981',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
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
                    <FaPlus />
                    Nuevo Ingreso
                  </Button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody style={{ padding: '24px' }}>
              <Row className="mb-3">
                
                <Col sm="3" className="mb-3 my-sm-0">
                  <div style={{ position: 'relative' }}>
                    <FaSearch style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#D946A6',
                      zIndex: 1
                    }} />
                    <Input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={handleSearch}
                      bsSize="sm"
                      style={{
                        border: "2px solid #E5E7EB",
                        borderRadius: "10px",
                        paddingLeft: '36px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </Col>
                <Col sm="7" className="text-right">
                  <Button
                    size="sm"
                    className="mr-2"
                    onClick={exportToPDFHandler}
                    style={{
                      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <FaFilePdf />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    onClick={exportToExcelHandler}
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <FaFileExcel />
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
                  data={filteredIngresos}
                  customStyles={customStyles}
                  pagination
                  paginationComponentOptions={paginationOptions}
                  fixedHeader
                  fixedHeaderScrollHeight="600px"
                  progressPending={pendiente}
                />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={verModal} toggle={cerrarModal} size="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            guardarCambios();
          }}
        >
          <ModalHeader 
            toggle={cerrarModal}
            style={{
              background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
              color: 'white',
              borderRadius: '0',
              padding: '20px 24px',
              border: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaMoneyBillWave size={24} />
              <span style={{ fontSize: '20px', fontWeight: 600 }}>
                {ingreso.idIngreso === 0 ? "Nuevo Ingreso" : "Editar Ingreso"}
              </span>
            </div>
          </ModalHeader>
          <ModalBody style={{ padding: '24px', background: '#F9FAFB' }}>
            <Row>
              <Col sm={12}>
                <FormGroup>
                  <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                    <FaFileAlt className="mr-2" style={{ color: '#D946A6' }} />
                    Descripción
                  </Label>
                  <Input
                    bsSize="sm"
                    type="text"
                    name="descripcion"
                    onChange={handleChange}
                    value={ingreso.descripcion}
                    placeholder="Descripción del ingreso"
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
            </Row>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                    <FaDollarSign className="mr-2" style={{ color: '#10B981' }} />
                    Monto
                  </Label>
                  <Input
                    bsSize="sm"
                    type="number"
                    name="monto"
                    onChange={handleChange}
                    value={ingreso.monto}
                    placeholder="0.00"
                    step="0.01"
                    min="1"
                    required
                    readOnly={modoSoloLectura || modoEdicionDescripcion}
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
                    <FaCreditCard className="mr-2" style={{ color: '#F59E0B' }} />
                    Tipo de Pago
                  </Label>
                  <Input
                    bsSize="sm"
                    type="select"
                    name="tipoPago"
                    onChange={handleChange}
                    value={ingreso.tipoPago}
                    disabled={modoSoloLectura || modoEdicionDescripcion}
                    style={{
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px'
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
              <Col sm={6}>
                <FormGroup>
                  <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                    <FaCoins className="mr-2" style={{ color: '#3B82F6' }} />
                    Moneda
                  </Label>
                  <Input
                    bsSize="sm"
                    type="select"
                    name="tipoDinero"
                    onChange={handleChange}
                    value={ingreso.tipoDinero}
                    disabled
                    style={{
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      background: '#F3F4F6'
                    }}
                  >
                    <option value="Cordobas">Cordobas</option>
                    <option value="Dolares">Dolares</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            {/* Only show date and status fields for existing records */}
            {ingreso.idIngreso !== 0 && (
              <Row>
                <Col sm={6}>
                  <FormGroup>
                    <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                      <FaToggleOn className="mr-2" style={{ color: '#8B5CF6' }} />
                      Estado
                    </Label>
                    <Input
                      bsSize="sm"
                      type="select"
                      name="esActivo"
                      onChange={(e) => {
                        const value = e.target.value === "true";
                        setIngreso({
                          ...ingreso,
                          esActivo: value,
                        });
                      }}
                      value={ingreso.esActivo ? "true" : "false"}
                      disabled={
                        modoSoloLectura || ingreso.tipoPago === "Tarjeta" || modoEdicionDescripcion
                      }
                      style={{
                        border: '2px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
            )}
            {/* Show only status field for new records */}
            {ingreso.idIngreso === 0 && (
              <Row>
                <Col sm={6}>
                  <FormGroup>
                    <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                      <FaToggleOn className="mr-2" style={{ color: '#8B5CF6' }} />
                      Estado
                    </Label>
                    <Input
                      bsSize="sm"
                      type="select"
                      name="esActivo"
                      onChange={(e) => {
                        const value = e.target.value === "true";
                        setIngreso({
                          ...ingreso,
                          esActivo: value,
                        });
                      }}
                      value={ingreso.esActivo ? "true" : "false"}
                      disabled
                      style={{
                        border: '2px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        background: '#F3F4F6'
                      }}
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
            )}
          </ModalBody>
          <ModalFooter style={{ 
            background: '#F9FAFB', 
            padding: '16px 24px',
            borderTop: '1px solid #E5E7EB'
          }}>
            {!modoSoloLectura && (
              <Button 
                type="submit" 
                size="sm"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Guardar
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={cerrarModal}
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontWeight: 600,
                color: 'white',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Cerrar
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
};

export default Ingreso;
