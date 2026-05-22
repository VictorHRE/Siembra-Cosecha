import {
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import React, { useState } from "react";
import Ticket from "../componentes/Ticket";
import printJS from "print-js";
import { 
  FaHistory, 
  FaEye, 
  FaCalendar, 
  FaSearch, 
  FaPrint, 
  FaTimes,
  FaFileInvoice,
  FaFilter
} from "react-icons/fa";

import "react-datepicker/dist/react-datepicker.css";

const HistorialVenta = () => {
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [nroVenta, setNumeroVenta] = useState("");
  const [buscarPor, setBuscarPor] = useState("fecha");

  const [verModal, setVerModal] = useState(false);
  const [detalleVenta, setDetalleVenta] = useState({});
  const [ventas, setVentas] = useState([]);

  // Función para buscar ventas
  const buscarVenta = () => {
    let options = { year: "numeric", month: "2-digit", day: "2-digit" };

    let _fechaInicio = fechaInicio.toLocaleDateString("es-PE", options);
    let _fechaFin = fechaFin.toLocaleDateString("es-PE", options);

    fetch(
      `api/venta/Listar?buscarPor=${buscarPor}&numeroVenta=${nroVenta}&fechaInicio=${_fechaInicio}&fechaFin=${_fechaFin}`
    )
      .then((response) => {
        return response.ok ? response.json() : Promise.reject(response);
      })
      .then((dataJson) => {
        var data = dataJson;
        if (data.length < 1) {
          Swal.fire("Opps!", "No se encontraron resultados", "warning");
        }
        setVentas(data);
      })
      .catch((error) => {
        setVentas([]);
        Swal.fire("Opps!", "No se pudo encontrar información", "error");
      });
  };

  // Función para mostrar detalles en el modal
  const mostrarModal = (data) => {
    setDetalleVenta(data);
    setVerModal(true);
  };

  // Función para imprimir el ticket
  const imprimirTicket = () => {
    printJS({
      printable: "ticket-impresion",
      type: "html",
      css: "/css/Ticket.css",
    });
  };

  return (
    <>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
        padding: '24px 30px',
        borderRadius: '15px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(217, 70, 166, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <FaHistory style={{ fontSize: '32px', color: 'white' }} />
        <h2 style={{ 
          margin: 0, 
          color: 'white', 
          fontSize: '28px',
          fontWeight: '600',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Historial de Ventas
        </h2>
      </div>

      <Row>
        <Col sm={12}>
          <Card style={{
            borderRadius: '15px',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <CardHeader style={{ 
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              padding: '20px 25px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FaFilter style={{ fontSize: '20px' }} />
              <span style={{ fontSize: '18px', fontWeight: '600' }}>Filtros de Búsqueda</span>
            </CardHeader>
            <CardBody style={{ padding: '25px' }}>
              <Row className="align-items-end">
                <Col sm={3}>
                  <FormGroup>
                    <Label style={{ 
                      fontWeight: '600', 
                      color: '#374151',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <FaFilter style={{ fontSize: '14px', color: '#10B981' }} />
                      Buscar por:
                    </Label>
                    <Input
                      type="select"
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #E5E7EB',
                        padding: '10px 12px',
                        fontSize: '14px',
                        color: '#374151',
                        transition: 'all 0.3s ease',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        height: 'fit-content'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#10B981'}
                      onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                      onChange={(e) => setBuscarPor(e.target.value)}
                      value={buscarPor}
                    >
                      <option value="fecha">Fechas</option>
                      <option value="numero">Numero Venta</option>
                    </Input>
                  </FormGroup>
                </Col>
                {buscarPor === "fecha" ? (
                  <>
                    <Col sm={3}>
                      <FormGroup>
                        <Label style={{ 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <FaCalendar style={{ fontSize: '14px', color: '#F59E0B' }} />
                          Fecha Inicio:
                        </Label>
                        <DatePicker
                          className="form-control"
                          style={{
                            borderRadius: '10px',
                            border: '2px solid #E5E7EB',
                            padding: '10px 12px',
                          }}
                          selected={fechaInicio}
                          onChange={(date) => setFechaInicio(date)}
                          dateFormat="dd/MM/yyyy"
                        />
                      </FormGroup>
                    </Col>
                    <Col sm={3}>
                      <FormGroup>
                        <Label style={{ 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <FaCalendar style={{ fontSize: '14px', color: '#F59E0B' }} />
                          Fecha Fin:
                        </Label>
                        <DatePicker
                          className="form-control"
                          style={{
                            borderRadius: '10px',
                            border: '2px solid #E5E7EB',
                            padding: '10px 12px',
                          }}
                          selected={fechaFin}
                          onChange={(date) => setFechaFin(date)}
                          dateFormat="dd/MM/yyyy"
                        />
                      </FormGroup>
                    </Col>
                  </>
                ) : (
                  <Col sm={3}>
                    <FormGroup>
                      <Label style={{ 
                        fontWeight: '600', 
                        color: '#374151',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <FaFileInvoice style={{ fontSize: '14px', color: '#D946A6' }} />
                        Numero venta:
                      </Label>
                      <Input
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #E5E7EB',
                          padding: '10px 12px',
                          fontSize: '14px',
                          transition: 'all 0.3s ease',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#D946A6'}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                        value={nroVenta}
                        onChange={(e) => setNumeroVenta(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                )}
                <Col sm={3}>
                  <FormGroup>
                    <Button
                      block
                      onClick={buscarVenta}
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '11px 20px',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                      }}
                    >
                      <FaSearch /> Buscar
                    </Button>
                  </FormGroup>
                </Col>
              </Row>
              <div style={{ 
                height: '1px', 
                background: 'linear-gradient(90deg, transparent, #E5E7EB, transparent)',
                margin: '20px 0' 
              }} />
              <Row>
                <Col sm="12">
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #E5E7EB'
                  }}>
                    <Table responsive hover style={{ marginBottom: 0 }}>
                      <thead>
                        <tr style={{
                          background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
                          color: 'white'
                        }}>
                          <th style={{ 
                            padding: '15px 20px', 
                            fontWeight: '600',
                            fontSize: '14px',
                            borderBottom: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Fecha Registro</th>
                          <th style={{ 
                            padding: '15px 20px', 
                            fontWeight: '600',
                            fontSize: '14px',
                            borderBottom: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Numero Venta</th>
                          <th style={{ 
                            padding: '15px 20px', 
                            fontWeight: '600',
                            fontSize: '14px',
                            borderBottom: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Documento Cliente</th>
                          <th style={{ 
                            padding: '15px 20px', 
                            fontWeight: '600',
                            fontSize: '14px',
                            borderBottom: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Nombre Cliente</th>
                          <th style={{ 
                            padding: '15px 20px', 
                            fontWeight: '600',
                            fontSize: '14px',
                            borderBottom: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Total</th>
                          <th style={{ 
                            padding: '15px 20px', 
                            fontWeight: '600',
                            fontSize: '14px',
                            borderBottom: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            textAlign: 'center'
                          }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventas.length < 1 ? (
                          <tr>
                            <td colSpan="7" style={{ 
                              textAlign: "center",
                              padding: '40px 20px',
                              color: '#9CA3AF',
                              fontSize: '15px'
                            }}>
                              Sin resultados
                            </td>
                          </tr>
                        ) : (
                          ventas.map((item, index) => (
                            <tr key={item.numeroDocumento} style={{
                              transition: 'all 0.2s ease',
                              borderBottom: '1px solid #F3F4F6'
                            }}>
                              <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                                {item.fechaRegistro}
                              </td>
                              <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#D946A6' }}>
                                {item.numeroDocumento}
                              </td>
                              <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                                {item.documentoCliente}
                              </td>
                              <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                                {item.nombreCliente}
                              </td>
                              <td style={{ padding: '16px 20px', fontSize: '15px', fontWeight: '600', color: '#10B981' }}>
                                C${item.total}
                              </td>
                              <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                <Button
                                  onClick={() => mostrarModal(item)}
                                  style={{
                                    background: 'linear-gradient(135deg, #D946A6 0%, #C026D3 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    color: 'white',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 2px 8px rgba(217, 70, 166, 0.3)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 166, 0.4)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 8px rgba(217, 70, 166, 0.3)';
                                  }}
                                >
                                  <FaEye /> Ver detalle
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal size="lg" isOpen={verModal} style={{ borderRadius: '15px' }}>
        <ModalHeader style={{
          background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
          color: 'white',
          border: 'none',
          padding: '20px 25px',
          fontSize: '20px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FaFileInvoice /> Detalle de Venta
        </ModalHeader>
        <ModalBody style={{ padding: '25px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <Row>
              <Col sm={4}>
                <FormGroup>
                  <Label style={{ 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}>Fecha Registro:</Label>
                  <Input
                    disabled
                    value={detalleVenta.fechaRegistro}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      padding: '10px 12px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                </FormGroup>
              </Col>
              <Col sm={4}>
                <FormGroup>
                  <Label style={{ 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}>Numero Venta:</Label>
                  <Input
                    disabled
                    value={detalleVenta.numeroDocumento}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      padding: '10px 12px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: '#D946A6',
                      fontWeight: '600'
                    }}
                  />
                </FormGroup>
              </Col>

              <Col sm={4}>
                <FormGroup>
                  <Label style={{ 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}>Usuario Registro:</Label>
                  <Input
                    disabled
                    value={detalleVenta.usuarioRegistro}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      padding: '10px 12px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <Row>
              <Col sm={4}>
                <FormGroup>
                  <Label style={{ 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}>Documento Cliente:</Label>
                  <Input
                    disabled
                    value={detalleVenta.documentoCliente}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #F59E0B',
                      padding: '10px 12px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                </FormGroup>
              </Col>
              <Col sm={4}>
                <FormGroup>
                  <Label style={{ 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}>Nombre Cliente:</Label>
                  <Input
                    disabled
                    value={detalleVenta.nombreCliente || "N/A"}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #F59E0B',
                      padding: '10px 12px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                </FormGroup>
              </Col>

              <Col sm={4}>
                <FormGroup>
                  <Label style={{ 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}>Numero Ruc:</Label>
                  <Input
                    disabled
                    value={detalleVenta.numeroRuc || "N/A"}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #F59E0B',
                      padding: '10px 12px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <Row>
              <Col sm={3}>
                <FormGroup>
                  <Label style={{ 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}>Tipo Pago:</Label>
                  <Input
                    disabled
                    value={detalleVenta.tipoPago || "N/A"}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #10B981',
                      padding: '10px 12px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                </FormGroup>
              </Col>
              <Col sm={3}>
                <FormGroup>
                  <Label style={{ 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}>Moneda:</Label>
                  <Input
                    disabled
                    value={detalleVenta.tipoDinero || "N/A"}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #10B981',
                      padding: '10px 12px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                </FormGroup>
              </Col>

              <Col sm={3}>
                <FormGroup>
                  <Label style={{ 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}>Monto Pago:</Label>
                  <Input
                    disabled
                    value={`${detalleVenta.tipoDinero === 'Cordobas' ? 'C$' : '$'}${detalleVenta.montoPago || "N/A"}`}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #10B981',
                      padding: '10px 12px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: '#10B981',
                      fontWeight: '600'
                    }}
                  />
                </FormGroup>
              </Col>
              <Col sm={3}>
                <FormGroup>
                  <Label style={{ 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}>Monto Cambio:</Label>
                  <Input
                    disabled
                    value={`C$${detalleVenta.vuelto || "0"}`}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #10B981',
                      padding: '10px 12px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: '#10B981',
                      fontWeight: '600'
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
            marginBottom: '20px'
          }}>
            <Table responsive style={{ marginBottom: 0 }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  color: 'white'
                }}>
                  <th style={{ 
                    padding: '12px 16px', 
                    fontWeight: '600',
                    fontSize: '13px',
                    borderBottom: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Producto</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    fontWeight: '600',
                    fontSize: '13px',
                    borderBottom: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Descripción</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    fontWeight: '600',
                    fontSize: '13px',
                    borderBottom: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Cantidad</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    fontWeight: '600',
                    fontSize: '13px',
                    borderBottom: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Precio</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    fontWeight: '600',
                    fontSize: '13px',
                    borderBottom: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {detalleVenta.detalle ? (
                  detalleVenta.detalle.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>
                        {item.producto}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#6B7280' }}>
                        {item.descripcion}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                        {item.cantidad}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#F59E0B', fontWeight: '600' }}>
                        C${item.precio}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#10B981', fontWeight: '600' }}>
                        C${item.total}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ 
                      textAlign: "center",
                      padding: '30px 16px',
                      color: '#9CA3AF',
                      fontSize: '14px'
                    }}>
                      Sin resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
            padding: '20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Label style={{ 
              fontWeight: '700', 
              color: '#1E40AF',
              fontSize: '18px',
              margin: 0
            }}>Total de la Venta:</Label>
            <div style={{
              background: 'white',
              padding: '12px 30px',
              borderRadius: '10px',
              border: '2px solid #3B82F6',
              fontSize: '24px',
              fontWeight: '700',
              color: '#10B981'
            }}>
              C${detalleVenta.total}
            </div>
          </div>
        </ModalBody>

        <ModalFooter style={{ 
          padding: '20px 25px',
          borderTop: '1px solid #E5E7EB',
          background: '#F9FAFB'
        }}>
          <Button 
            onClick={imprimirTicket}
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 24px',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            <FaPrint /> Imprimir
          </Button>
          <Button 
            onClick={() => setVerModal(false)}
            style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 24px',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
            }}
          >
            <FaTimes /> Cerrar
          </Button>
        </ModalFooter>
      </Modal>

      <div style={{ display: "none" }}>
        <Ticket detalleVenta={detalleVenta} />
      </div>
    </>
  );
};

export default HistorialVenta;
