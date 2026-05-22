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
  FaEyeSlash,
  FaEye,
  FaUser,
  FaPlus,
  FaEdit,
  FaTrash,
  FaKey,
  FaFilePdf,
  FaFileExcel,
  FaSearch,
  FaFilter,
  FaUserShield,
  FaEnvelope,
  FaPhone,
  FaUserTag,
  FaToggleOn,
} from "react-icons/fa";
import {
  exportToPDF,
  exportToExcel,
  applySearchFilter,
} from "../utils/exportHelpers";
import ModalPermisos from "../componentes/ModalPermisos";

const modeloUsuario = {
  idUsuario: 0,
  nombre: "",
  correo: "",
  telefono: "",
  idRol: 0,
  clave: "",
  esActivo: true,
  claveNueva: "",
};

const Usuario = () => {
  const [usuario, setUsuario] = useState(modeloUsuario);
  const [pendiente, setPendiente] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [roles, setRoles] = useState([]);
  const [verModal, setVerModal] = useState(false);
  const [modoSoloLectura, setModoSoloLectura] = useState(false);
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [cambiandoClave, setCambiandoClave] = useState(false);
  const [verModalPermisos, setVerModalPermisos] = useState(false);
  const [usuarioPermisos, setUsuarioPermisos] = useState(null);
  const [visibleNuevaPassword, setVisibleNuevaPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario({
      ...usuario,
      [name]: value,
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
        { accessor: (item) => item.idRolNavigation?.descripcion || "" },
        { accessor: (item) => (item.esActivo ? "activo" : "no activo") },
      ];

      filtered = applySearchFilter(filtered, searchValue, searchFields);
    }

    return filtered;
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = applyFilters(usuarios, value, statusFilter);
    setFilteredUsuarios(filtered);
  };

  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setStatusFilter(value);

    const filtered = applyFilters(usuarios, searchTerm, value);
    setFilteredUsuarios(filtered);
  };

  const exportToPDFHandler = () => {
    const columns = [
      { header: "Nombre", accessor: (row) => row.nombre },
      { header: "Correo o Usuario", accessor: (row) => row.correo },
      { header: "Teléfono", accessor: (row) => row.telefono },
      {
        header: "Rol",
        accessor: (row) => row.idRolNavigation?.descripcion || "",
      },
      {
        header: "Estado",
        accessor: (row) => (row.esActivo ? "Activo" : "No Activo"),
      },
    ];

    exportToPDF(filteredUsuarios, columns, "Lista_de_Usuarios");
  };

  const exportToExcelHandler = () => {
    const excelData = filteredUsuarios.map((user) => ({
      ID: user.idUsuario,
      Nombre: user.nombre,
      Correo: user.correo,
      Teléfono: user.telefono,
      Rol: user.idRolNavigation?.descripcion || "",
      Estado: user.esActivo ? "Activo" : "No Activo",
    }));

    exportToExcel(excelData, "Usuarios");
  };

  const obtenerRoles = async () => {
    try {
      let response = await fetch("api/rol/Lista");
      if (response.ok) {
        let data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      Swal.fire("Error", "Error al obtener roles", "error");
    }
  };

  const obtenerUsuarios = async () => {
    try {
      let response = await fetch("api/usuario/Lista");
      if (response.ok) {
        let data = await response.json();
        setUsuarios(data);
        setFilteredUsuarios(data);
        setPendiente(false);
      }
    } catch (error) {
      Swal.fire("Error", "Error al obtener usuarios", "error");
    }
  };

  useEffect(() => {
    obtenerRoles();
    obtenerUsuarios();
  }, []);

  // Separate useEffect to handle search term and status filter changes
  useEffect(() => {
    const filtered = applyFilters(usuarios, searchTerm, statusFilter);
    setFilteredUsuarios(filtered);
  }, [searchTerm, statusFilter, usuarios]);

  const columns = [
    {
      name: "Nombre",
      selector: (row) => row.nombre,
      sortable: true,
      width:'170px',
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaUser className="mr-2" style={{ color: '#D946A6' }} />
          <span style={{ fontWeight: 600 }}>{row.nombre}</span>
        </div>
      ),
    },
    {
      name: "Correo o usuario",
      selector: (row) => row.correo,
      sortable: true,
      width:'210px',
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaEnvelope className="mr-2" style={{ color: '#9CA3AF' }} />
          <span>{row.correo}</span>
        </div>
      ),
    },
    {
      name: "Teléfono",
      selector: (row) => row.telefono,
      sortable: true,
      width:'140px',
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaPhone className="mr-2" style={{ color: '#9CA3AF' }} />
          <span>{row.telefono || 'N/A'}</span>
        </div>
      ),
    },
    {
      name: "Rol",
      selector: (row) => row.idRolNavigation,
      sortable: true,
      width: "100px",
      cell: (row) => (
        <span 
          className="badge p-2"
          style={{
            fontSize: '11px',
            borderRadius: '20px',
            padding: '6px 12px',
            backgroundColor: '#D946A6',
            color: 'white'
          }}
        >
          {row.idRolNavigation?.descripcion || "Sin rol"}
        </span>
      ),
    },
    {
      name: "Estado",
      selector: (row) => row.esActivo,
      sortable: true,
      width: "100px",
      cell: (row) => (
        <span 
          className={`badge p-2`}
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
            title="Ver Detalles"
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
            title="Editar"
            style={{
              backgroundColor: '#D946A6',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px'
            }}
          >
            <FaEdit />
          </Button>
          {row.idRolNavigation?.descripcion === "Empleado" && (
            <Button
              size="sm"
              className="mr-1"
              onClick={() => abrirModalPermisos(row)}
              title="Gestionar Permisos"
              style={{
                backgroundColor: '#10B981',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px'
              }}
            >
              <FaKey />
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => eliminarUsuario(row.idUsuario)}
            title="Eliminar"
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
    setUsuario({
      ...data,
      clave: "",
      claveNueva: "",
    });
    setCambiandoClave(false);
    setModoSoloLectura(false);
    setVerModal(true);
  };

  const abrirVerModal = (data) => {
    setUsuario({
      ...data,
      clave: "",
      claveNueva: "",
    });
    setCambiandoClave(false);
    setModoSoloLectura(true);
    setVerModal(true);
  };

  const abrirNuevoModal = () => {
    setUsuario(modeloUsuario);
    setCambiandoClave(false);
    setModoSoloLectura(false);
    setVerModal(true);
  };

  const abrirModalPermisos = (data) => {
    setUsuarioPermisos(data);
    setVerModalPermisos(true);
  };

  const cerrarModalPermisos = () => {
    setUsuarioPermisos(null);
    setVerModalPermisos(false);
  };

  const cerrarModal = () => {
    setUsuario(modeloUsuario);
    setVerModal(false);
    setVisiblePassword(false);
    setCambiandoClave(false);
    setModoSoloLectura(false);
  };

  const guardarCambios = async () => {
    try {
      let payload;
      let url;
      let method;

      if (usuario.idUsuario === 0) {
        // Nuevo usuario
        payload = { ...usuario };
        delete payload.idRolNavigation;
        url = "api/usuario/Guardar";
        method = "POST";
      } else {
        // Edición existente
        payload = {
          idUsuario: usuario.idUsuario,
          nombre: usuario.nombre,
          correo: usuario.correo,
          telefono: usuario.telefono,
          idRol: usuario.idRol,
          esActivo: usuario.esActivo === "true" || usuario.esActivo === true,
          claveNueva: cambiandoClave ? usuario.claveNueva : "",
        };

        url = "api/usuario/Editar";
        method = "PATCH";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await obtenerUsuarios();
        cerrarModal();
        Swal.fire(
          `${usuario.idUsuario === 0 ? "Creado" : "Actualizado"}`,
          `El usuario fue ${
            usuario.idUsuario === 0 ? "agregado" : "actualizado"
          }`,
          "success"
        );
      } else {
        const error = await response.text();
        Swal.fire("Error", error, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error en la conexión con el servidor", "error");
    }
  };

  const eliminarUsuario = async (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "¿Desea desactivar este usuario permanentemente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`api/usuario/Eliminar/${id}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              obtenerUsuarios();
              Swal.fire(
                "Desactivado!",
                "El usuario fue desactivado.",
                "success"
              );
            } else {
              return response.text().then((error) => {
                Swal.fire("Error", error, "error");
              });
            }
          })
          .catch((error) => {
            Swal.fire("Error", "Error al conectar con el servidor", "error");
          });
      }
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    guardarCambios();
  };

  const handleVisiblePassword = () => {
    setVisiblePassword((prev) => !prev);
  };

  return (
    <>
      <div className="container-fluid px-4">
        {/* Page Header */}
        <div className="d-flex align-items-center mb-4">
          <div className="icon-box-large gradient-pink-orange mr-3">
            <FaUserShield size={32} />
          </div>
          <div>
            <h2 className="mb-0 font-weight-bold text-gradient-pink-orange">
              Gestión de Usuarios
            </h2>
            <p className="text-muted mb-0">
              Administra los usuarios del sistema
            </p>
          </div>
        </div>

        <Row>
          <Col sm="12">
            <Card className="shadow-lg border-0">
              <CardHeader className="gradient-pink-orange border-0">
                <Row className="align-items-center">
                  <Col sm="6">
                    <div className="d-flex align-items-center">
                      <FaUser className="mr-2" size={20} />
                      <h5 className="mb-0 font-weight-bold">
                        Lista de Usuarios
                      </h5>
                    </div>
                  </Col>
                  <Col sm="6" className="text-right">
                    <Button
                      className="btn-gradient-green shadow-sm"
                      size="sm"
                      onClick={abrirNuevoModal}
                    >
                      <FaPlus className="mr-2" />
                      Nuevo Usuario
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody className="p-4">
                <Row className="mb-4">
                  <Col sm="12" md="3" className="mb-3 mb-md-0">
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
                        <option value="todos">Todos los Estados</option>
                        <option value="activos">Activos</option>
                        <option value="inactivos">Inactivos</option>
                      </Input>
                    </div>
                  </Col>
                  <Col sm="12" md="4" className="mb-3 mb-md-0">
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
                        placeholder="Buscar usuario..."
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
                  <Col sm="12" md="5" className="text-md-right">
                    <Button
                      className="btn-gradient-danger shadow-sm mr-2"
                      size="sm"
                      onClick={exportToPDFHandler}
                    >
                      <FaFilePdf className="mr-1" />
                      Exportar PDF
                    </Button>
                    <Button
                      className="btn-gradient-green shadow-sm"
                      size="sm"
                      onClick={exportToExcelHandler}
                    >
                      <FaFileExcel className="mr-1" />
                      Exportar Excel
                    </Button>
                  </Col>
                </Row>

                <div className="table-modern">
                  <DataTable
                    columns={columns}
                    data={filteredUsuarios}
                    customStyles={customStyles}
                    pagination
                    paginationComponentOptions={paginationComponentOptions}
                    fixedHeader
                    fixedHeaderScrollHeight="600px"
                    progressPending={pendiente}
                    noDataComponent={
                      <div className="text-center p-5">
                        <FaSearch
                          size={60}
                          className="text-muted mb-3 opacity-50"
                        />
                        <p className="text-muted h5">
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
      </div>

      {/* Modal Usuario */}
      <Modal isOpen={verModal} toggle={cerrarModal} centered size="lg">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            toggle={cerrarModal}
            className="gradient-pink-orange border-0"
          >
            <div className="d-flex align-items-center">
              <FaUser className="mr-2" />
              <span>
                {modoSoloLectura
                  ? "Ver Usuario"
                  : usuario.idUsuario === 0
                  ? "Nuevo Usuario"
                  : "Editar Usuario"}
              </span>
            </div>
          </ModalHeader>
          <ModalBody className="p-4">
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                    <FaUser className="mr-2" style={{ color: '#D946A6' }} />
                    Nombre <span className="text-danger">*</span>
                  </Label>
                  <Input
                    bsSize="sm"
                    name="nombre"
                    onChange={handleChange}
                    value={usuario.nombre}
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
                    <FaEnvelope className="mr-2" style={{ color: '#F59E0B' }} />
                    Correo o usuario <span className="text-danger">*</span>
                  </Label>
                  <Input
                    bsSize="sm"
                    name="correo"
                    onChange={handleChange}
                    value={usuario.correo}
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
                    <FaPhone className="mr-2" style={{ color: '#10B981' }} />
                    Teléfono
                  </Label>
                  <Input
                    bsSize="sm"
                    name="telefono"
                    onChange={handleChange}
                    value={usuario.telefono}
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
                    <FaUserTag className="mr-2" style={{ color: '#3B82F6' }} />
                    Rol <span className="text-danger">*</span>
                  </Label>
                  <Input
                    bsSize="sm"
                    type="select"
                    name="idRol"
                    onChange={handleChange}
                    value={usuario.idRol}
                    required
                    disabled={modoSoloLectura}
                    style={{
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Seleccionar rol...</option>
                    {roles.map((item) => (
                      <option key={item.idRol} value={item.idRol}>
                        {item.descripcion}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            {/* Contraseña para nuevo usuario */}
            {usuario.idUsuario === 0 && !modoSoloLectura && (
              <Row>
                <Col sm="6">
                  <FormGroup>
                    <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                      <FaKey className="mr-2" style={{ color: '#EF4444' }} />
                      Contraseña <span className="text-danger">*</span>
                    </Label>
                    <div className="position-relative">
                      <Input
                        bsSize="sm"
                        name="clave"
                        onChange={handleChange}
                        value={usuario.clave}
                        type={visiblePassword ? "text" : "password"}
                        required
                        style={{
                          border: '2px solid #E5E7EB',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '14px'
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm position-absolute password-toggle"
                        style={{ right: 5, top: 0, zIndex: 10 }}
                        onClick={handleVisiblePassword}
                      >
                        {visiblePassword ? (
                          <FaEyeSlash className="text-pink" />
                        ) : (
                          <FaEye className="text-pink" />
                        )}
                      </button>
                    </div>
                  </FormGroup>
                </Col>
                <Col sm="6">
                  <FormGroup>
                    <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                      <FaToggleOn className="mr-2" style={{ color: '#10B981' }} />
                      Estado <span className="text-danger">*</span>
                    </Label>
                    <Input
                      bsSize="sm"
                      type="select"
                      name="esActivo"
                      onChange={handleChange}
                      value={usuario.esActivo}
                      required
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
            )}

            {/* Campos para edición */}
            {usuario.idUsuario !== 0 && (
              <>
                <Row>
                  <Col sm="6">
                    <FormGroup>
                      <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                        <FaToggleOn className="mr-2" style={{ color: '#10B981' }} />
                        Estado <span className="text-danger">*</span>
                      </Label>
                      <Input
                        bsSize="sm"
                        type="select"
                        name="esActivo"
                        onChange={handleChange}
                        value={usuario.esActivo}
                        required
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
                  {!modoSoloLectura && (
                    <Col sm="6">
                      <FormGroup className="d-flex align-items-center mt-4">
                        <Input
                          type="checkbox"
                          id="cambiarClave"
                          checked={cambiandoClave}
                          onChange={() => setCambiandoClave(!cambiandoClave)}
                          className="mr-2"
                        />
                        <Label
                          for="cambiarClave"
                          className="mb-0 font-weight-bold text-orange"
                        >
                          <FaKey className="mr-1" />
                          Cambiar contraseña
                        </Label>
                      </FormGroup>
                    </Col>
                  )}
                </Row>

                {cambiandoClave && !modoSoloLectura && (
                  <Row>
                    <Col sm="6">
                      <FormGroup>
                        <Label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                          <FaKey className="mr-2" style={{ color: '#EF4444' }} />
                          Nueva Contraseña <span className="text-danger">*</span>
                        </Label>
                        <div className="position-relative">
                          <Input
                            bsSize="sm"
                            name="claveNueva"
                            onChange={handleChange}
                            value={usuario.claveNueva}
                            type={visibleNuevaPassword ? "text" : "password"}
                            required
                            style={{
                              border: '2px solid #E5E7EB',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '14px'
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm position-absolute password-toggle"
                            style={{ right: 5, top: 0, zIndex: 10 }}
                            onClick={() =>
                              setVisibleNuevaPassword((prev) => !prev)
                            }
                          >
                            {visibleNuevaPassword ? (
                              <FaEyeSlash className="text-pink" />
                            ) : (
                              <FaEye className="text-pink" />
                            )}
                          </button>
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                )}
              </>
            )}
          </ModalBody>
          <ModalFooter className="border-0 bg-light">
            {!modoSoloLectura && (
              <Button type="submit" size="sm" className="btn-gradient-pink">
                {usuario.idUsuario === 0 ? "Crear Usuario" : "Guardar Cambios"}
              </Button>
            )}
            <Button size="sm" className="btn-gradient-danger" onClick={cerrarModal}>
              Cerrar
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal de Permisos */}
      <ModalPermisos
        isOpen={verModalPermisos}
        toggle={cerrarModalPermisos}
        usuario={usuarioPermisos}
      />
    </>
  );
};

export default Usuario;
