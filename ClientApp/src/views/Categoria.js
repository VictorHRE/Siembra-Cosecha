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
  exportToPDF,
  exportToExcel,
  applySearchFilter,
} from "../utils/exportHelpers";
import {
  FaTags,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilePdf,
  FaFileExcel,
  FaSearch,
  FaList,
  FaFilter,
  FaAlignLeft,
  FaToggleOn,
} from "react-icons/fa";

const modeloCategoria = {
  idCategoria: 0,
  descripcion: "",
  esActivo: true,
};

const Categoria = () => {
  const [categoria, setCategoria] = useState(modeloCategoria);
  const [pendiente, setPendiente] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [filteredCategorias, setFilteredCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [verModal, setVerModal] = useState(false);
  const [modoSoloLectura, setModoSoloLectura] = useState(false);

  const handleChange = (e) => {
    let value =
      e.target.nodeName === "SELECT"
        ? e.target.value === "true"
          ? true
          : false
        : e.target.value;

    setCategoria({
      ...categoria,
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
        { accessor: (item) => item.descripcion },
        { accessor: (item) => (item.esActivo ? "activo" : "no activo") },
      ];

      filtered = applySearchFilter(filtered, searchValue, searchFields);
    }

    return filtered;
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = applyFilters(categorias, value, statusFilter);
    setFilteredCategorias(filtered);
  };

  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setStatusFilter(value);

    const filtered = applyFilters(categorias, searchTerm, value);
    setFilteredCategorias(filtered);
  };

  const exportToPDFHandler = () => {
    const columns = [
      { header: "Descripción", accessor: (row) => row.descripcion },
      {
        header: "Estado",
        accessor: (row) => (row.esActivo ? "Activo" : "No Activo"),
      },
    ];

    exportToPDF(filteredCategorias, columns, "Lista_de_Categorias");
  };

  const exportToExcelHandler = () => {
    const excelData = filteredCategorias.map((cat) => ({
      ID: cat.idCategoria,
      Descripción: cat.descripcion,
      Estado: cat.esActivo ? "Activo" : "No Activo",
    }));

    exportToExcel(excelData, "Categorias");
  };

  const obtenerCategorias = async () => {
    let response = await fetch("api/categoria/Lista");

    if (response.ok) {
      let data = await response.json();
      setCategorias(() => data);
      setFilteredCategorias(() => data);
      setPendiente(false);
    }
  };

  useEffect(() => {
    obtenerCategorias();
  }, []);

  // Apply search term and status filter changes
  useEffect(() => {
    const filtered = applyFilters(categorias, searchTerm, statusFilter);
    setFilteredCategorias(filtered);
  }, [searchTerm, statusFilter, categorias]);

  const columns = [
    {
      name: "Descripcion",
      selector: (row) => row.descripcion,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaTags className="mr-2" style={{ color: '#D946A6' }} />
          <span>{row.descripcion}</span>
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
            title="Editar categoría"
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
            onClick={() => eliminarCategoria(row.idCategoria)}
            title="Eliminar categoría"
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
    setCategoria(data);
    setModoSoloLectura(false);
    setVerModal(!verModal);
  };

  const abrirVerModal = (data) => {
    setCategoria(data);
    setModoSoloLectura(true);
    setVerModal(!verModal);
  };

  const cerrarModal = () => {
    setCategoria(modeloCategoria);
    setModoSoloLectura(false);
    setVerModal(!verModal);
  };

  const guardarCambios = async () => {
    let response;
    if (categoria.idCategoria === 0) {
      response = await fetch("api/categoria/Guardar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(categoria),
      });
    } else {
      response = await fetch("api/categoria/Editar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(categoria),
      });
    }

    if (response.ok) {
      await obtenerCategorias();
      setCategoria(modeloCategoria);
      setVerModal(!verModal);
      Swal.fire(
        `${categoria.idCategoria === 0 ? "Guardada" : "Actualizada"}`,
        `La categoria fue ${
          categoria.idCategoria === 0 ? "Agregada" : "Actualizada"
        }`,
        "success"
      );
    } else {
      alert("error al guardar");
    }
  };

  const eliminarCategoria = async (id) => {
    Swal.fire({
      title: "Esta seguro?",
      text: "Desesa desactivar esta categoria",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, continuar",
      cancelButtonText: "No, volver",
    }).then((result) => {
      if (result.isConfirmed) {
        // eslint-disable-next-line no-unused-vars
        const response = fetch("api/categoria/Eliminar/" + id, {
          method: "DELETE",
        }).then((response) => {
          if (response.ok) {
            obtenerCategorias();

            Swal.fire("Desactivado!", "La categoria fue desactivada.", "success");
          }
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
      <div
        className="page-header mb-4"
        style={{
          background: "linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="d-flex align-items-center">
          <div
            className="icon-wrapper"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              padding: "1rem",
              borderRadius: "12px",
              marginRight: "1rem",
            }}
          >
            <FaTags size={32} color="white" />
          </div>
          <div>
            <h2 className="text-white mb-1" style={{ fontWeight: "700" }}>
              Gestión de Categorías
            </h2>
            <p className="text-white mb-0" style={{ opacity: 0.9 }}>
              Administra y organiza las categorías del sistema
            </p>
          </div>
        </div>
      </div>

      <Row>
        <Col sm="12">
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
              border: "none",
            }}
          >
            <CardHeader
              style={{
                background: "linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)",
                borderRadius: "16px 16px 0 0",
                padding: "1.5rem",
                border: "none",
              }}
            >
              <Row className="align-items-center">
                <Col sm="6">
                  <div className="d-flex align-items-center">
                    <FaList className="text-white mr-2" size={20} />
                    <h5 className="text-white mb-0" style={{ fontWeight: "600" }}>
                      Lista de Categorías
                    </h5>
                  </div>
                </Col>
                <Col sm="6" className="text-right">
                  <Button
                    size="sm"
                    style={{
                      backgroundColor: "#10B981",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.5rem 1.25rem",
                      fontWeight: "600",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    onClick={() => setVerModal(!verModal)}
                  >
                    <FaPlus className="mr-2" />
                    Nueva Categoría
                  </Button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody style={{ padding: "1.5rem" }}>
              <Row className="mb-4">
                <Col sm="3" className="mb-3 mb-sm-0">
                  <div className="position-relative">
                    <FaFilter
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9CA3AF",
                        zIndex: 1,
                      }}
                    />
                    <Input
                      type="select"
                      value={statusFilter}
                      onChange={handleStatusFilter}
                      bsSize="sm"
                      style={{
                        border: "2px solid #E5E7EB",
                        borderRadius: "10px",
                        paddingLeft: "36px",
                        fontSize: "14px",
                        height: "40px",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#D946A6")}
                      onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
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
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9CA3AF",
                        zIndex: 1,
                      }}
                    />
                    <Input
                      type="text"
                      placeholder="Buscar categorías..."
                      value={searchTerm}
                      onChange={handleSearch}
                      bsSize="sm"
                      style={{
                        border: "2px solid #E5E7EB",
                        borderRadius: "10px",
                        paddingLeft: "36px",
                        fontSize: "14px",
                        height: "40px",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#D946A6")}
                      onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                    />
                  </div>
                </Col>
                <Col sm="5" className="text-right">
                  <Button
                    size="sm"
                    className="mr-2"
                    style={{
                      backgroundColor: "#EF4444",
                      border: "none",
                      borderRadius: "10px",
                      padding: "8px 16px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                    onClick={exportToPDFHandler}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#DC2626")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#EF4444")
                    }
                  >
                    <FaFilePdf className="mr-1" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    style={{
                      backgroundColor: "#10B981",
                      border: "none",
                      borderRadius: "10px",
                      padding: "8px 16px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                    onClick={exportToExcelHandler}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#059669")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#10B981")
                    }
                  >
                    <FaFileExcel className="mr-1" />
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
                  data={filteredCategorias}
                  customStyles={customStyles}
                  pagination
                  paginationComponentOptions={paginationComponentOptions}
                  fixedHeader
                  fixedHeaderScrollHeight="600px"
                  progressPending={pendiente}
                  noDataComponent={
                    <div className="text-center p-5">
                      <FaSearch size={48} color="#D1D5DB" className="mb-3" />
                      <p className="text-muted mb-0" style={{ fontSize: "1rem" }}>
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

      <Modal
        isOpen={verModal}
        toggle={cerrarModal}
        style={{
          maxWidth: "600px",
        }}
      >
        <form onSubmit={handleSubmit}>
          <ModalHeader
            toggle={cerrarModal}
            style={{
              background: "linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)",
              color: "white",
              borderRadius: "0",
              padding: "1.25rem 1.5rem",
              border: "none",
            }}
          >
            <div className="d-flex align-items-center">
              <FaTags className="mr-2" style={{ fontSize: "20px" }} />
              <span style={{ fontWeight: "600", fontSize: "1.1rem" }}>
                {categoria.idCategoria === 0
                  ? "Nueva Categoría"
                  : modoSoloLectura
                  ? "Ver Categoría"
                  : "Editar Categoría"}
              </span>
            </div>
          </ModalHeader>
          <ModalBody style={{ padding: "24px" }}>
            <Row>
              <Col sm={12}>
                <FormGroup>
                  <Label style={{ fontWeight: 600, color: "#374151", fontSize: "14px" }}>
                    <FaAlignLeft className="mr-2" style={{ color: "#D946A6" }} />
                    Descripción
                  </Label>
                  <Input
                    bsSize="sm"
                    name="descripcion"
                    onChange={handleChange}
                    value={categoria.descripcion}
                    required
                    readOnly={modoSoloLectura}
                    style={{
                      border: "2px solid #E5E7EB",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "14px",
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label style={{ fontWeight: 600, color: "#374151", fontSize: "14px" }}>
                    <FaToggleOn className="mr-2" style={{ color: "#10B981" }} />
                    Estado
                  </Label>
                  <Input
                    bsSize="sm"
                    type="select"
                    name="esActivo"
                    onChange={handleChange}
                    value={categoria.esActivo}
                    disabled={modoSoloLectura}
                    style={{
                      border: "2px solid #E5E7EB",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "14px",
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
              padding: "1rem 1.5rem",
              backgroundColor: "#F9FAFB",
              borderTop: "1px solid #E5E7EB",
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
                  padding: "0.5rem 1.5rem",
                  fontWeight: "600",
                }}
              >
                Guardar
              </Button>
            )}
            <Button
              size="sm"
              style={{
                backgroundColor: "#6B7280",
                border: "none",
                borderRadius: "8px",
                padding: "0.5rem 1.5rem",
                fontWeight: "600",
                color: "white",
              }}
              onClick={cerrarModal}
            >
              Cerrar
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
};

export default Categoria;
