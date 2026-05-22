import { Card, CardBody, CardHeader, Col, FormGroup, Label, Row, Button } from "reactstrap";
import DatePicker from "react-datepicker";
import Swal from 'sweetalert2'
import DataTable from 'react-data-table-component';
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import printJS from "print-js";
import TicketReporteVenta from "../componentes/TicketReporteVenta";
import { FaChartLine, FaFileExcel, FaPrint, FaSearch, FaCalendar } from 'react-icons/fa';

import * as XLSX from "xlsx"

const modeloInicio = [{
    fechaRegistro : "",
    numeroDocumento: "",
    documentoCliente: "",
    nombreCliente: "",
    totalVenta: "",
    producto: "",
    cantidad: "",
    precio: "",
    total: ""
}]

const ReporteVenta = () => {
    const [fechaInicio, setFechaInicio] = useState(new Date());
    const [fechaFin, setFechaFin] = useState(new Date());
    const [pendiente, setPendiente] = useState(false);
    const [ventas, setVentas] = useState(modeloInicio);
    const [ventasTicket, setVentasTicket] = useState(modeloInicio);


    const buscar = () => {

        setPendiente(true)
        let options = { year: 'numeric', month: '2-digit', day: '2-digit' };

        let _fechaInicio = fechaInicio.toLocaleDateString('es-PE', options)
        let _fechaFin = fechaFin.toLocaleDateString('es-PE', options)

        fetch(`api/venta/Reporte?fechaInicio=${_fechaInicio}&fechaFin=${_fechaFin}`)
            .then((response) => {
                return response.ok ? response.json() : Promise.reject(response);
            })
            .then((dataJson) => {
                var data = dataJson;
                setPendiente(false)
                if (data.length < 1) {
                    Swal.fire(
                        'Opps!',
                        'No se encontraron resultados',
                        'warning'
                    )
                }
                setVentas(data);
                // Generar datos agrupados para el ticket
                generarDatosTicket(data);
            }).catch((error) => {
                setVentas([]);
                setVentasTicket([]);
                Swal.fire(
                    'Opps!',
                    'No se pudo encontrar información',
                    'error'
                )
            })
    }

    // Función para agrupar productos y sumar cantidades
    const generarDatosTicket = (data) => {
        const productosAgrupados = {};
        
        data.forEach(venta => {
            const producto = venta.producto;
            const cantidad = parseFloat(venta.cantidad) || 0;
            const precio = parseFloat(venta.precio) || 0;
            const total = parseFloat(venta.total) || 0;
            
            if (productosAgrupados[producto]) {
                // Si el producto ya existe, sumar la cantidad y el total
                productosAgrupados[producto].cantidad += cantidad;
                productosAgrupados[producto].total += total;
            } else {
                // Si es nuevo, crear entrada
                productosAgrupados[producto] = {
                    producto: producto,
                    cantidad: cantidad,
                    precio: precio,
                    total: total
                };
            }
        });

        // Convertir objeto a array
        const datosTicket = Object.values(productosAgrupados);
        setVentasTicket(datosTicket);
    }

    // Función para imprimir el ticket
    const imprimirTicket = () => {
        if (ventasTicket.length === 0) {
            Swal.fire('Opps!', 'No hay datos para imprimir', 'warning');
            return;
        }
        
        printJS({
            printable: "ticket-reporte-impresion",
            type: "html",
            css: "/css/TicketReporteVenta.css",
        });
    }
 
    const columns = [
        {
            name: 'Fecha Registro',
            selector: row => row.fechaRegistro,
        },
        {
            name: 'Numero Venta',
            selector: row => row.numeroDocumento,
        },
        
        {
            name: 'Documento Cliente',
            selector: row => row.documentoCliente,
        },
        {
            name: 'Nombre Cliente',
            selector: row => row.nombreCliente,
        },
        
        {
            name: 'Total Venta',
            selector: row => row.totalVenta,
        },
        {
            name: 'Producto',
            sortable: true,
            grow: 2,
            maxWidth: '600px',
            selector: row => row.producto,
        },
        {
            name: 'Cantidad',
            selector: row => row.cantidad,
        },
        {
            name: 'Precio',
            selector: row => row.precio,
        },
        {
            name: 'Total',
            selector: row => row.total,
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                fontSize: '13px',
                fontWeight: 800,
                backgroundColor: '#F3F4F6',
                color: '#374151',
                paddingTop: '12px',
                paddingBottom: '12px',
            },
        },
        headRow: {
            style: {
                backgroundColor: "#F3F4F6",
                borderBottom: '2px solid #D946A6',
                minHeight: '48px',
            }
        },
        rows: {
            style: {
                minHeight: '48px',
                '&:hover': {
                    backgroundColor: '#FDF2F8',
                    cursor: 'pointer',
                },
            },
        },
        cells: {
            style: {
                fontSize: '13px',
                color: '#1F2937',
            },
        },
    };

    const exportarExcel = () => {
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.json_to_sheet(ventasTicket);

        XLSX.utils.book_append_sheet(wb, ws, "Reporte");
        XLSX.writeFile(wb, "Reporte Ventas.xlsx")
    }

    return (
        <>
            {/* Page Header */}
            <div style={{
                background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
                padding: '24px 28px',
                borderRadius: '12px',
                marginBottom: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <FaChartLine style={{ fontSize: '32px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            color: '#ffffff',
                            margin: 0,
                            fontSize: '28px',
                            fontWeight: 'bold',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}>
                            Reportes de Ventas
                        </h2>
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            margin: 0,
                            fontSize: '14px',
                            marginTop: '4px',
                        }}>
                            Consulta y exporta los reportes de ventas por rango de fechas
                        </p>
                    </div>
                </div>
            </div>

            <Row>
                <Col sm={12}>
                    <Card style={{
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: 'none',
                    }}>
                        <CardHeader style={{
                            background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                            borderBottom: '2px solid #D946A6',
                            borderRadius: '12px 12px 0 0',
                            padding: '20px 24px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    backgroundColor: '#D946A6',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <FaCalendar style={{ fontSize: '18px', color: '#ffffff' }} />
                                </div>
                                <h5 style={{
                                    margin: 0,
                                    color: '#1F2937',
                                    fontWeight: '600',
                                    fontSize: '18px',
                                }}>
                                    Filtros de Búsqueda
                                </h5>
                            </div>
                        </CardHeader>
                        <CardBody style={{ padding: '24px' }}>
                            <Row className="align-items-end">
                                
                                <Col sm={3}>
                                    <FormGroup>
                                        <Label style={{
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '14px',
                                            marginBottom: '8px',
                                        }}>
                                            Fecha Inicio:
                                        </Label>
                                        <div style={{ position: 'relative' }}>
                                            <DatePicker
                                                className="form-control"
                                                selected={fechaInicio}
                                                onChange={(date) => setFechaInicio(date)}
                                                dateFormat='dd/MM/yyyy'
                                                style={{
                                                    borderColor: '#D1D5DB',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                }}
                                            />
                                            <FaCalendar style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#9CA3AF',
                                                pointerEvents: 'none',
                                            }} />
                                        </div>
                                    </FormGroup>
                                </Col>

                                <Col sm={3}>
                                    <FormGroup>
                                        <Label style={{
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '14px',
                                            marginBottom: '8px',
                                        }}>
                                            Fecha Fin:
                                        </Label>
                                        <div style={{ position: 'relative' }}>
                                            <DatePicker
                                                className="form-control"
                                                selected={fechaFin}
                                                onChange={(date) => setFechaFin(date)}
                                                dateFormat='dd/MM/yyyy'
                                                style={{
                                                    borderColor: '#D1D5DB',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                }}
                                            />
                                            <FaCalendar style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#9CA3AF',
                                                pointerEvents: 'none',
                                            }} />
                                        </div>
                                    </FormGroup>
                                </Col>
                                <Col sm={2}>
                                    <FormGroup>
                                        <Button 
                                            block 
                                            onClick={buscar}
                                            style={{
                                                background: 'linear-gradient(135deg, #D946A6 0%, #C026D3 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '10px 16px',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(217, 70, 166, 0.3)',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(217, 70, 166, 0.4)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(217, 70, 166, 0.3)';
                                            }}
                                        >
                                            <FaSearch /> Buscar
                                        </Button>
                                    </FormGroup>
                                </Col>

                                <Col sm={2}>
                                    <FormGroup>
                                        <Button 
                                            block 
                                            onClick={exportarExcel}
                                            style={{
                                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '10px 16px',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(16, 185, 129, 0.4)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.3)';
                                            }}
                                        >
                                            <FaFileExcel /> Exportar
                                        </Button>
                                    </FormGroup>
                                </Col>

                                <Col sm={2}>
                                    <FormGroup>
                                        <Button 
                                            block 
                                            onClick={imprimirTicket}
                                            style={{
                                                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '10px 16px',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(245, 158, 11, 0.4)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(245, 158, 11, 0.3)';
                                            }}
                                        >
                                            <FaPrint /> Imprimir
                                        </Button>
                                    </FormGroup>
                                </Col>
                            </Row>
                            
                            <div style={{
                                margin: '24px 0',
                                height: '1px',
                                background: 'linear-gradient(90deg, transparent, #D946A6, #F59E0B, transparent)',
                            }}></div>
                            
                            <Row>
                                <Col sm="12">
                                    <div style={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: '1px solid #E5E7EB',
                                    }}>
                                        <DataTable
                                            progressPending={pendiente}
                                            columns={columns}
                                            data={ventas}
                                            customStyles={customStyles}
                                            pagination
                                            paginationPerPage={10}
                                            paginationRowsPerPageOptions={[10, 20, 30, 50]}
                                            noDataComponent={
                                                <div style={{ 
                                                    padding: '40px',
                                                    textAlign: 'center',
                                                    color: '#9CA3AF',
                                                }}>
                                                    <FaChartLine style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
                                                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                                                        No hay datos para mostrar
                                                    </p>
                                                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                                                        Selecciona un rango de fechas y haz clic en Buscar
                                                    </p>
                                                </div>
                                            }
                                        />
                                    </div>
                                </Col>
                            </Row>

                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Ticket oculto para impresión */}
            <div style={{ display: "none" }}>
                <TicketReporteVenta ventasTicket={ventasTicket} />
            </div>
            
        </>
    )
}

export default ReporteVenta;