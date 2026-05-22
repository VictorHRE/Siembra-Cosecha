import { useEffect, useState, useContext } from "react";
import DataTable from "react-data-table-component";
import {
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  Label,
  Input,
  FormGroup,
  ModalFooter,
  Row,
  Col,
  Button,
} from "reactstrap";
import Swal from "sweetalert2";
import { 
  FaMoneyBillWave, 
  FaArrowDown, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaFilePdf, 
  FaFileExcel, 
  FaSearch,
  FaDollarSign,
  FaWallet,
  FaCreditCard,
  FaFileAlt,
  FaFilter,
  FaCalendar,
  FaUser,
  FaCoins,
  FaToggleOn
} from "react-icons/fa";
import { exportToPDF, exportToExcel, applySearchFilter } from "../utils/exportHelpers";
import { UserContext } from "../context/UserProvider";

const modeloEgreso = {
  idEgreso: 0,
  descripcion: "",
  monto: 1,
  tipoPago: "Efectivo",
  tipoDinero: "Cordobas",
  idUsuario: 0,
  esActivo: true,
  fechaRegistro: null,
};

const Egreso = () => {
  const { user } = useContext(UserContext);
  const [egreso, setEgreso] = useState(modeloEgreso);
  const [pendiente, setPendiente] = useState(true);
  const [egresos, setEgresos] = useState([]);
  const [filteredEgresos, setFilteredEgresos] = useState([]);
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
    setEgreso({
      ...egreso,
      [name]: value,
      tipoDinero: "Cordobas", // 👈 se fuerza Cordobas
    });
  } else {
    setEgreso({
      ...egreso,
      [name]: value,
    });
  }
};


  // Combined filtering function that applies both search and status filters
  const applyFilters = (data, searchValue, statusValue) => {
    let filtered = data;

    // Apply status filter
    if (statusValue === "activos") {
      filtered = filtered.filter(item => item.esActivo === true);
    } else if (statusValue === "inactivos") {
      filtered = filtered.filter(item => item.esActivo === false);
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
        { accessor: (item) => item.esActivo ? "activo" : "no activo" }
      ];
      
      filtered = applySearchFilter(filtered, searchValue, searchFields);
    }

    return filtered;
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    const filtered = applyFilters(egresos, value, statusFilter);
    setFilteredEgresos(filtered);
  };

  // Status filter function - currently not used in UI but kept for future implementation
  // eslint-disable-next-line no-unused-vars
  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    
    const filtered = applyFilters(egresos, searchTerm, value);
    setFilteredEgresos(filtered);
  };

  const exportToPDFHandler = () => {
    const columns = [
      { header: 'Descripción', accessor: (row) => row.descripcion },
      { header: 'Fecha', accessor: (row) => row.fechaRegistro },
      { header: 'Monto', accessor: (row) => `${row.monto}` },
      { header: 'Moneda', accessor: (row) => row.tipoDinero },
      { header: 'Tipo de Pago', accessor: (row) => row.tipoPago },
      { header: 'Usuario', accessor: (row) => row.nombreUsuario },
      { header: 'Estado', accessor: (row) => row.esActivo ? "Activo" : "No Activo" }
    ];
    
    exportToPDF(filteredEgresos, columns, 'Lista_de_Egresos');
  };

  const exportToExcelHandler = () => {
    const excelData = filteredEgresos.map(egr => ({
      'ID': egr.idEgreso,
      'Descripción': egr.descripcion,
      'Fecha': egr.fechaRegistro,
      'Monto': egr.monto,
      'Moneda': egr.tipoDinero,
      'Tipo de Pago': egr.tipoPago,
      'Usuario': egr.nombreUsuario,
      'Estado': egr.esActivo ? "Activo" : "No Activo"
    }));

    exportToExcel(excelData, 'Egresos');
  };

  const obtenerEgresos = async () => {
    try {
      let response = await fetch("api/egreso/Lista");

      if (response.ok) {
        let data = await response.json();
        setEgresos(data);
        setFilteredEgresos(data);
        setPendiente(false);
      }
    } catch (error) {
      console.error("Error al obtener egresos:", error);
      setPendiente(false);
    }
  };

  const abrirEditarModal = (data) => {
    setEgreso({
      idEgreso: data.idEgreso,
      descripcion: data.descripcion,
      monto: parseFloat(data.monto) || 0,
      tipoPago: data.tipoPago || "Efectivo",
      tipoDinero: data.tipoDinero,
      idUsuario: data.idUsuario,
      esActivo: data.esActivo,
      fechaRegistro: data.fechaRegistro
    });
    setModoSoloLectura(false);
    setModoEdicionDescripcion(true);
    setVerModal(!verModal);
  };

  const abrirVerModal = (data) => {
    setEgreso({
      ...data,
      monto: parseFloat(data.monto) || 0
    });
    setModoSoloLectura(true);
    setModoEdicionDescripcion(false);
    setVerModal(!verModal);
  };

  const cerrarModal = () => {
    setEgreso(modeloEgreso);
    setModoSoloLectura(false);
    setModoEdicionDescripcion(false);
    setVerModal(!verModal);
  };

  const validarSaldoDisponible = async (tipoPago, tipoDinero, montoNuevoEgreso) => {
    try {
      const response = await fetch(`api/cierre/ResumenActual?tipoPago=${tipoPago}&tipoDinero=${tipoDinero}`);
      
      if (response.ok) {
        const data = await response.json();

        
        // Handle potential null/undefined values and ensure proper parsing
        
        const monedaSimbolo = data.MonedaSimbolo || (tipoDinero === "Dolares" ? "$" : "C$");
        const saldoDisponible = data.saldoActual;
        
        return {
          esValido: saldoDisponible >= montoNuevoEgreso,
          monedaSimbolo: monedaSimbolo,
          saldoDisponible: parseFloat(saldoDisponible).toFixed(2)
        };
      } else {
        throw new Error('Error al obtener el resumen actual');
      }
    } catch (error) {
      console.error('Error en validación de saldo:', error);
      throw error;
    }
  };

  const guardarCambios = async () => {
    try {
      // Get current user data
      const userData = JSON.parse(user);
      
      // For new expenses (not edits), validate available balance
      if (egreso.idEgreso === 0) {
        try {
          // Ensure the amount is a valid number
          const montoNumerico = parseFloat(egreso.monto) || 0;
          
          const validacion = await validarSaldoDisponible(egreso.tipoPago, egreso.tipoDinero, montoNumerico);
          
          if (!validacion.esValido) {
            Swal.fire({
              title: "Saldo insuficiente",
              text: `No se puede agregar el egreso. El saldo disponible para ${egreso.tipoPago} en ${egreso.tipoDinero} es ${validacion.monedaSimbolo}${validacion.saldoDisponible}, pero está intentando egresar ${validacion.monedaSimbolo}${montoNumerico.toFixed(2)}.`,
              icon: "error",
              confirmButtonText: "Entendido"
            });
            return; // Exit without saving
          }

        } catch (error) {
          Swal.fire("Error", "No se pudo validar el saldo disponible. Intente nuevamente.", "error");
          return; // Exit without saving
        }
      }
      
      // Prepare data for sending with PascalCase property names for backend
      const egresoParaEnviar = {
        Descripcion: egreso.descripcion,
        Monto: egreso.monto,
        TipoPago: egreso.tipoPago,
        TipoDinero: egreso.tipoDinero,
        IdUsuario: userData.idUsuario,
        EsActivo: egreso.esActivo
      };

      // For edit operations, include the ID but never include FechaRegistro
      if (egreso.idEgreso !== 0) {
        egresoParaEnviar.IdEgreso = egreso.idEgreso;
      }

      let response;
      if (egreso.idEgreso === 0) {
        response = await fetch("api/egreso/Guardar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(egresoParaEnviar),
        });
      } else {
        response = await fetch("api/egreso/Editar", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(egresoParaEnviar),
        });
      }

      if (response.ok) {
        // Refresh the list
        await obtenerEgresos();
        setEgreso(modeloEgreso);
        setVerModal(!verModal);

        Swal.fire(
          `${egreso.idEgreso === 0 ? "Guardado" : "Actualizado"}`,
          `El egreso fue ${
            egreso.idEgreso === 0 ? "agregado" : "actualizado"
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
  const eliminarEgreso = async (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "¿Desea eliminar este egreso permanentemente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`api/egreso/Eliminar/${id}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              // Refresh the list
              obtenerEgresos();
              Swal.fire("Eliminado!", "El egreso fue eliminado.", "success");
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
    obtenerEgresos();
  }, []);

  // Update filtered list when search term or egresos change
  useEffect(() => {
    const filtered = applyFilters(egresos, searchTerm, statusFilter);
    setFilteredEgresos(filtered);
  }, [searchTerm, statusFilter, egresos]);

  const columns = [
    {
      name: "Descripción",
      selector: (row) => row.descripcion,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaFileAlt className="mr-2" style={{ color: '#EF4444' }} />
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
          <FaMoneyBillWave className="mr-2" style={{ color: '#DC2626' }} />
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
          {row.tipoPago === 'Efectivo' && <FaWallet className="mr-2" style={{ color: '#10B981' }} />}
          {row.tipoPago === 'Tarjeta' && <FaCreditCard className="mr-2" style={{ color: '#D946A6' }} />}
          {row.tipoPago === 'Transferencia' && <FaArrowDown className="mr-2" style={{ color: '#3B82F6' }} />}
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
          <FaUser className="mr-2" style={{ color: '#6366F1' }} />
          <span>{row.nombreUsuario}</span>
        </div>
      ),
    },
    {
      name: "Estado",
      selector: (row) => row.esActivo,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span 
          className={`badge ${row.esActivo ? 'badge-success' : 'badge-secondary'}`}
          style={{
            fontSize: '11px',
            borderRadius: '20px',
            padding: '6px 12px',
            backgroundColor: row.esActivo ? '#10B981' : '#6B7280',
            color: 'white'
          }}
        >
          {row.esActivo ? "Activo" : "Inactivo"}
        </span>
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
            title="Editar egreso"
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
        background: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
        padding: '24px 28px',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(220, 38, 38, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FaMoneyBillWave size={32} color="white" />
        </div>
        <div>
          <h2 style={{
            color: 'white',
            margin: 0,
            fontSize: '28px',
            fontWeight: '700',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Gestión de Egresos
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
            fontSize: '14px',
            marginTop: '4px'
          }}>
            Control y registro de gastos del sistema
          </p>
        </div>
      </div>

      <Row>
        <Col sm="12">
          <Card style={{
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}>
            <CardHeader style={{ 
              background: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
              padding: '20px 24px',
              border: 'none'
            }}>
              <Row className="align-items-center">
                <Col sm="6">
                  <h5 style={{
                    color: 'white',
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <FaArrowDown size={18} />
                    Lista de Egresos
                  </h5>
                </Col>
                <Col sm="6" className="text-right">
                  <button
                    onClick={() => {
                      setVerModal(!verModal)
                      setModoEdicionDescripcion(false)
                    }}
                    style={{
                      background: 'white',
                      color: '#DC2626',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(255, 255, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 255, 255, 0.3)';
                    }}
                  >
                    <FaPlus size={14} />
                    Nuevo Egreso
                  </button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody style={{ padding: '24px' }}>
              <Row className="mb-4">
                <Col sm="3" className="mb-3 mb-sm-0">
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
                      onFocus={(e) => e.target.style.borderColor = '#DC2626'}
                      onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    >
                      <option value="todos">Todos</option>
                      <option value="activos">Activos</option>
                      <option value="inactivos">Inactivos</option>
                    </Input>
                  </div>
                </Col>
                <Col sm="4" className="mb-3 mb-sm-0">
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
                      placeholder="Buscar egresos..."
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
                      onFocus={(e) => e.target.style.borderColor = '#DC2626'}
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
                  data={filteredEgresos}
                  customStyles={customStyles}
                  pagination
                  paginationComponentOptions={paginationOptions}
                  fixedHeader
                  fixedHeaderScrollHeight="600px"
                  progressPending={pendiente}
                  noDataComponent={
                    <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                      <FaMoneyBillWave size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>No hay egresos registrados</p>
                    </div>
                  }
                />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={verModal} toggle={cerrarModal} size="lg">
        <form onSubmit={(e) => { e.preventDefault(); guardarCambios(); }}>
          <div style={{
            background: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaMoneyBillWave size={24} color="white" />
              </div>
              <h5 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '600' }}>
                {egreso.idEgreso === 0 ? "Nuevo Egreso" : "Editar Egreso"}
              </h5>
            </div>
            <button
              type="button"
              onClick={cerrarModal}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              ×
            </button>
          </div>
          <ModalBody style={{ padding: '28px' }}>
            <Row>
              <Col sm={12}>
                <FormGroup>
                  <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                    <FaFileAlt className="mr-2" style={{ color: '#DC2626' }} />
                    Descripción del Egreso
                  </Label>
                  <Input
                    type="text"
                    name="descripcion"
                    onChange={handleChange}
                    value={egreso.descripcion}
                    placeholder="Ej: Pago de servicios, compra de insumos..."
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
                    <FaMoneyBillWave className="mr-2" style={{ color: '#10B981' }} />
                    Monto
                  </Label>
                  <Input
                    type="number"
                    name="monto"
                    onChange={handleChange}
                    value={egreso.monto}
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
                    type="select"
                    name="tipoPago"
                    onChange={handleChange}
                    value={egreso.tipoPago}
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
                    <FaDollarSign className="mr-2" style={{ color: '#3B82F6' }} />
                    Tipo de Dinero
                  </Label>
                  <Input
                    type="select"
                    name="tipoDinero"
                    onChange={handleChange}
                    value={egreso.tipoDinero}
                    disabled
                    style={{
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      backgroundColor: '#F9FAFB'
                    }}
                  >
                    <option value="Cordobas">Cordobas</option>
                    <option value="Dolares">Dolares</option>
                  </Input>
                </FormGroup>
              </Col>
              {egreso.idEgreso !== 0 && (
                <Col sm={6}>
                  <FormGroup>
                    <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                      <FaToggleOn className="mr-2" style={{ color: '#10B981' }} />
                      Estado
                    </Label>
                    <Input
                      type="select"
                      name="esActivo"
                      onChange={(e) => {
                        const value = e.target.value === "true";
                        setEgreso({
                          ...egreso,
                          esActivo: value
                        });
                      }}
                      value={egreso.esActivo ? "true" : "false"}
                      disabled={modoSoloLectura || modoEdicionDescripcion}
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
              )}
              {egreso.idEgreso === 0 && (
                <Col sm={6}>
                  <FormGroup>
                    <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                      <FaToggleOn className="mr-2" style={{ color: '#10B981' }} />
                      Estado
                    </Label>
                    <Input
                      type="select"
                      name="esActivo"
                      onChange={(e) => {
                        const value = e.target.value === "true";
                        setEgreso({
                          ...egreso,
                          esActivo: value
                        });
                      }}
                      value={egreso.esActivo ? "true" : "false"}
                      disabled
                      style={{
                        border: '2px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        backgroundColor: '#F9FAFB'
                      }}
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </Input>
                  </FormGroup>
                </Col>
              )}
            </Row>
          </ModalBody>
          <ModalFooter style={{ 
            padding: '20px 28px', 
            background: '#F9FAFB',
            borderTop: '1px solid #E5E7EB'
          }}>
            {!modoSoloLectura && (
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginRight: '10px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                }}
              >
                Guardar Cambios
              </button>
            )}
            <button
              type="button"
              onClick={cerrarModal}
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
              }}
            >
              Cerrar
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
};

export default Egreso;