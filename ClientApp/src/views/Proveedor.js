import { useEffect, useState } from "react";
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
  FaTruck,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaFilePdf,
  FaFileExcel,
  FaSearch,
  FaFilter,
  FaBuilding,
} from "react-icons/fa";
import {
  exportToPDF,
  exportToExcel,
  applySearchFilter,
} from "../utils/exportHelpers";

const modeloProveedor = {
  idProveedor: 0,
  nombre: "",
  correo: "",
  telefono: "",
  esActivo: true,
  fechaRegistro: "",
};

const Proveedor = () => {
  const [proveedor, setProveedor] = useState(modeloProveedor);
  const [pendiente, setPendiente] = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [filteredProveedores, setFilteredProveedores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [verModal, setVerModal] = useState(false);
  const [modoSoloLectura, setModoSoloLectura] = useState(false);

  const handleChange = (e) => {
    let value;
    if (e.target.name === "esActivo") {
      value = e.target.value === "true" ? true : false;
    } else {
      value = e.target.value;
    }

    setProveedor({
      ...proveedor,
      [e.target.name]: value,
    });
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
        { accessor: (item) => item.nombre },
        { accessor: (item) => item.correo },
        { accessor: (item) => item.telefono },
        { accessor: (item) => (item.esActivo ? "activo" : "no activo") },
      ];

      filtered = applySearchFilter(filtered, searchValue, searchFields);
    }

    return filtered;
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = applyFilters(proveedores, value, statusFilter);
    setFilteredProveedores(filtered);
  };

  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setStatusFilter(value);

    const filtered = applyFilters(proveedores, searchTerm, value);
    setFilteredProveedores(filtered);
  };

  const exportToPDFHandler = () => {
    const columns = [
      { header: "Nombre", accessor: (row) => row.nombre },
      { header: "Correo", accessor: (row) => row.correo },
      { header: "Teléfono", accessor: (row) => row.telefono },
      {
        header: "Estado",
        accessor: (row) => (row.esActivo ? "Activo" : "No Activo"),
      },
    ];

    exportToPDF(filteredProveedores, columns, "Lista_de_Proveedores");
  };

  const exportToExcelHandler = () => {
    const excelData = filteredProveedores.map((prov) => ({
      ID: prov.idProveedor,
      Nombre: prov.nombre,
      Correo: prov.correo,
      Teléfono: prov.telefono,
      "Fecha Registro": prov.fechaRegistro,
      Estado: prov.esActivo ? "Activo" : "No Activo",
    }));

    exportToExcel(excelData, "Proveedores");
  };

  const obtenerProveedores = async () => {
    try {
      let response = await fetch("api/proveedor/Lista");
      if (response.ok) {
        let data = await response.json();
        setProveedores(data);
        setFilteredProveedores(data);
        setPendiente(false);
      }
    } catch (error) {
      console.error("Error obteniendo proveedores:", error);
      setPendiente(false);
    }
  };

  useEffect(() => {
    obtenerProveedores();

  }, []);

  // Separate useEffect to handle search term and status filter changes
  useEffect(() => {
    const filtered = applyFilters(proveedores, searchTerm, statusFilter);
    setFilteredProveedores(filtered);
  }, [searchTerm, statusFilter, proveedores]);

  const columns = [
    {
      name: "Nombre",
      selector: (row) => row.nombre,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaBuilding className="mr-2" style={{ color: '#3B82F6' }} />
          <span className="font-weight-bold">{row.nombre}</span>
        </div>
      ),
    },
    {
      name: "Correo",
      selector: (row) => row.correo,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaEnvelope className="mr-2" style={{ color: '#F59E0B' }} />
          <span>{row.correo}</span>
        </div>
      ),
    },
    {
      name: "Teléfono",
      selector: (row) => row.telefono,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaPhone className="mr-2" style={{ color: '#10B981' }} />
          <span>{row.telefono}</span>
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
          {row.esActivo ? "Activo" : "No Activo"}
        </span>
      ),
    },
    {
      name: "Acciones",
      width: "220px",
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
            title="Editar proveedor"
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
            onClick={() => eliminarProveedor(row.idProveedor)}
            title="Eliminar proveedor"
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

  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  const abrirEditarModal = (data) => {
    setProveedor(data);
    setModoSoloLectura(false);
    setVerModal(!verModal);
  };

  const abrirVerModal = (data) => {
    setProveedor(data);
    setModoSoloLectura(true);
    setVerModal(!verModal);
  };

  const cerrarModal = () => {
    setProveedor(modeloProveedor);
    setModoSoloLectura(false);
    setVerModal(!verModal);
  };

  const guardarCambios = async () => {
    try {
      let response;
      if (proveedor.idProveedor === 0) {
        const newProveedor = {
          nombre: proveedor.nombre,
          correo: proveedor.correo,
          telefono: proveedor.telefono,
          esActivo: proveedor.esActivo,
        };

        response = await fetch("api/proveedor/Guardar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(newProveedor),
        });
      } else {
        response = await fetch("api/proveedor/Editar", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(proveedor),
        });
      }

      if (response.ok) {
        await obtenerProveedores();
        setProveedor(modeloProveedor);
        setVerModal(!verModal);
        Swal.fire(
          `${proveedor.idProveedor === 0 ? "Guardado" : "Actualizado"}`,
          `El proveedor fue ${
            proveedor.idProveedor === 0 ? "agregado" : "actualizado"
          }`,
          "success"
        );
      } else {
        const errorData = await response.json();
        Swal.fire("Error", errorData.message || "Error al guardar", "error");
      }
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
      Swal.fire("Error", "Ocurrió un error inesperado", "error");
    }
  };

  const eliminarProveedor = async (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Desea desactivar el proveedor",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "No, volver",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          let response = await fetch(`api/proveedor/Eliminar/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            obtenerProveedores();
            Swal.fire("Desactivado!", "El proveedor fue desactivado.", "success");
          } else {
            const errorData = await response.json();
            Swal.fire(
              "Error",
              errorData.message || "Error al desactivar",
              "error"
            );
          }
        } catch (error) {
          console.error("Error desactivando proveedor:", error);
          Swal.fire("Error", "Ocurrió un error inesperado", "error");
        }
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
      <div
        style={{
          background: "linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)",
          padding: "24px 0",
          marginBottom: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="container-fluid">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              color: "white",
              paddingLeft: "16px",
            }}
          >
            <FaTruck style={{ fontSize: "42px" }} />
            <div>
              <h2 style={{ margin: 0, fontWeight: "700", fontSize: "32px" }}>
                Gestión de Proveedores
              </h2>
              <p style={{ margin: 0, opacity: 0.95, fontSize: "15px" }}>
                Administra y controla tu red de proveedores
              </p>
            </div>
          </div>
        </div>
      </div>

      <Row>
        <Col sm="12">
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              border: "none",
              overflow: "hidden",
            }}
          >
            <CardHeader
              style={{
                background: "linear-gradient(135deg, #D946A6 0%, #F59E0B 50%, #10B981 100%)",
                padding: "20px 24px",
                borderBottom: "none",
              }}
            >
              <Row className="align-items-center">
                <Col sm="6">
                  <h5
                    style={{
                      margin: 0,
                      color: "white",
                      fontSize: "20px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <FaTruck style={{ fontSize: "24px" }} />
                    Lista de Proveedores
                  </h5>
                </Col>
                <Col sm="6" className="text-right">
                  <Button
                    size="sm"
                    onClick={() => setVerModal(!verModal)}
                    style={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 20px",
                      fontWeight: "600",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.3s",
                      fontSize: "14px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 20px rgba(217, 70, 166, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <FaPlus style={{ fontSize: "16px" }} />
                    Nuevo Proveedor
                  </Button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody style={{ padding: "24px" }}>
              <Row className="mb-4">
                <Col sm="3" className="mb-3 mb-sm-0">
                  <div style={{ position: "relative" }}>
                    <FaFilter
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#D946A6",
                        fontSize: "14px",
                      }}
                    />
                    <Input
                      type="select"
                      value={statusFilter}
                      onChange={handleStatusFilter}
                      bsSize="sm"
                      style={{
                        border: "2px solid #D946A6",
                        borderRadius: "10px",
                        paddingLeft: "36px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        height: "40px",
                      }}
                    >
                      <option value="todos">Todos</option>
                      <option value="activos">Activos</option>
                      <option value="inactivos">Inactivos</option>
                    </Input>
                  </div>
                </Col>
                <Col sm="4" className="mb-3 mb-sm-0">
                  <div style={{ position: "relative" }}>
                    <FaSearch
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#F59E0B",
                        fontSize: "14px",
                      }}
                    />
                    <Input
                      type="text"
                      placeholder="Buscar proveedor..."
                      value={searchTerm}
                      onChange={handleSearch}
                      bsSize="sm"
                      style={{
                        border: "2px solid #F59E0B",
                        borderRadius: "10px",
                        paddingLeft: "36px",
                        fontSize: "14px",
                        height: "40px",
                      }}
                    />
                  </div>
                </Col>
                <Col sm="5" className="text-right">
                  <Button
                    size="sm"
                    className="mr-2"
                    onClick={exportToPDFHandler}
                    style={{
                      backgroundColor: "#EF4444",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 18px",
                      fontWeight: "600",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#DC2626";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 20px rgba(239, 68, 68, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#EF4444";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <FaFilePdf />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    onClick={exportToExcelHandler}
                    style={{
                      backgroundColor: "#10B981",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 18px",
                      fontWeight: "600",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#059669";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 20px rgba(16, 185, 129, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#10B981";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <FaFileExcel />
                    Excel
                  </Button>
                </Col>
              </Row>

              <div
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #E5E7EB",
                }}
              >
                <DataTable
                  columns={columns}
                  data={filteredProveedores}
                  progressPending={pendiente}
                  pagination
                  paginationComponentOptions={paginationComponentOptions}
                  customStyles={customStyles}
                  fixedHeader
                  fixedHeaderScrollHeight="600px"
                  noDataComponent={
                    <div className="text-center p-5">
                      <FaSearch
                        style={{
                          fontSize: "64px",
                          color: "#D1D5DB",
                          marginBottom: "16px",
                        }}
                      />
                      <p
                        style={{
                          color: "#6B7280",
                          fontSize: "16px",
                          fontWeight: "500",
                        }}
                      >
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

      {/* Modal Proveedor */}
      <Modal
        isOpen={verModal}
        toggle={cerrarModal}
        centered
        size="lg"
        style={{ maxWidth: "600px" }}
      >
        <form onSubmit={handleSubmit}>
          <ModalHeader
            toggle={cerrarModal}
            style={{
              background: "linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)",
              color: "white",
              borderBottom: "none",
              padding: "20px 24px",
              borderRadius: "0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              <FaTruck style={{ fontSize: "28px" }} />
              {proveedor.idProveedor === 0
                ? "Nuevo Proveedor"
                : modoSoloLectura
                ? "Ver Proveedor"
                : "Editar Proveedor"}
            </div>
          </ModalHeader>
          <ModalBody style={{ padding: "28px 24px", backgroundColor: "#F9FAFB" }}>
            <Row>
              <Col sm={12}>
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    Nombre del Proveedor *
                  </Label>
                  <Input
                    bsSize="sm"
                    name="nombre"
                    onChange={handleChange}
                    value={proveedor.nombre}
                    required
                    readOnly={modoSoloLectura}
                    style={{
                      border: "2px solid #E5E7EB",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontSize: "14px",
                      height: "42px",
                      backgroundColor: modoSoloLectura ? "#F3F4F6" : "white",
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FaEnvelope style={{ color: "#F59E0B", fontSize: "14px" }} />
                    Correo Electrónico
                  </Label>
                  <Input
                    bsSize="sm"
                    name="correo"
                    onChange={handleChange}
                    value={proveedor.correo}
                    type="email"
                    readOnly={modoSoloLectura}
                    style={{
                      border: "2px solid #E5E7EB",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontSize: "14px",
                      height: "42px",
                      backgroundColor: modoSoloLectura ? "#F3F4F6" : "white",
                    }}
                  />
                </FormGroup>
              </Col>
              <Col sm={6}>
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FaPhone style={{ color: "#10B981", fontSize: "14px" }} />
                    Teléfono
                  </Label>
                  <Input
                    bsSize="sm"
                    name="telefono"
                    onChange={handleChange}
                    value={proveedor.telefono}
                    readOnly={modoSoloLectura}
                    style={{
                      border: "2px solid #E5E7EB",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontSize: "14px",
                      height: "42px",
                      backgroundColor: modoSoloLectura ? "#F3F4F6" : "white",
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col sm={12}>
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    Estado
                  </Label>
                  <Input
                    bsSize="sm"
                    type="select"
                    name="esActivo"
                    onChange={handleChange}
                    value={proveedor.esActivo}
                    disabled={modoSoloLectura}
                    style={{
                      border: "2px solid #E5E7EB",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontSize: "14px",
                      height: "42px",
                      backgroundColor: modoSoloLectura ? "#F3F4F6" : "white",
                      fontWeight: "500",
                    }}
                  >
                    <option value={true}>Activo</option>
                    <option value={false}>No Activo</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter
            style={{
              backgroundColor: "#F9FAFB",
              borderTop: "2px solid #E5E7EB",
              padding: "16px 24px",
            }}
          >
            {!modoSoloLectura && (
              <Button
                type="submit"
                size="sm"
                style={{
                  backgroundColor: "#10B981",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#059669";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(16, 185, 129, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#10B981";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Guardar
              </Button>
            )}
            <Button
              size="sm"
              onClick={cerrarModal}
              style={{
                backgroundColor: "#6B7280",
                border: "none",
                borderRadius: "8px",
                padding: "10px 24px",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#4B5563";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#6B7280";
              }}
            >
              Cerrar
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
};

export default Proveedor;
