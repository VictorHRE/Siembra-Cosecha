import { Card, CardBody, CardHeader, Col, FormGroup, Label, Row, Button } from "reactstrap";
import DatePicker from "react-datepicker";
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect, useRef } from "react";
import { exportToPDF, exportToExcel } from '../utils/exportHelpers';
import TicketCierre from '../componentes/TicketCierre';
import printJS from "print-js";
import { 
    FaCashRegister, 
    FaCalculator, 
    FaFileExcel, 
    FaFilePdf, 
    FaPrint,
    FaCalendarAlt,
    FaChartLine,
    FaMoneyBillWave,
    FaArrowUp,
    FaArrowDown,
    FaBalanceScale,
    FaCreditCard,
    FaExchangeAlt,
    FaWallet
} from 'react-icons/fa';


const Cierre = () => {
    // State for filters
    const [dateRange, setDateRange] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [reportMode, setReportMode] = useState("");
    const [tipoPago, setTipoPago] = useState("");
    const [tipoDinero, setTipoDinero] = useState("");
    
    // State for data
    const [pendiente, setPendiente] = useState(false);
    const [cierreData, setCierreData] = useState(null);
    const [ingresos, setIngresos] = useState([]);
    const [egresos, setEgresos] = useState([]);
    const [consolidatedData, setConsolidatedData] = useState(null);
    
    // State for calculations
    const [totalIngresoVenta, setTotalIngresoVenta] = useState(0);
    const [totalIngresos, setTotalIngresos] = useState(0);
    const [totalEgresos, setTotalEgresos] = useState(0);
    const [saldoCierre, setSaldoCierre] = useState(0);
    const [monedaSimbolo, setMonedaSimbolo] = useState("");
    
    // State for print functionality - kept for future modal implementation
    // eslint-disable-next-line no-unused-vars
    const [showPrintModal, setShowPrintModal] = useState(false);
    const ticketRef = useRef();

    // Handle date range selection
    const handleDateRangeChange = (value) => {
        setDateRange(value);
        setShowDatePicker(value === "Elegir Rango");
        
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        switch (value) {
            case "Hoy":
                setStartDate(today);
                setEndDate(today);
                break;
            case "Ayer":
                setStartDate(yesterday);
                setEndDate(yesterday);
                break;
            case "Esta Semana":
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                setStartDate(startOfWeek);
                setEndDate(today);
                break;
            case "Este Mes":
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                setStartDate(startOfMonth);
                setEndDate(today);
                break;
            default:
                break;
        }
    };

    // Calculate closure when all filters are selected
    const calcularCierre = async () => {
        // Validate required filters
        if (!dateRange) {
            Swal.fire('Error', 'Debe seleccionar un rango de fechas', 'error');
            return;
        }
        if (!reportMode) {
            Swal.fire('Error', 'Debe seleccionar un tipo de reporte', 'error');
            return;
        }
        
        if (reportMode === "Segmentación por método") {
            if (!tipoPago) {
                Swal.fire('Error', 'Debe seleccionar un tipo de pago', 'error');
                return;
            }
            // Always use Cordobas for segmentation mode
            setTipoDinero("Cordobas");
        }

        setPendiente(true);
        
        try {
            const fechaInicio = startDate.toLocaleDateString('en-GB'); // dd/MM/yyyy format
            const fechaFin = endDate.toLocaleDateString('en-GB');
            
            if (reportMode === "Segmentación por método") {
                // Force Cordobas for segmentation
                const tipoDineroToUse = "Cordobas";
                const url = `api/cierre/Calcular?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&tipoPago=${tipoPago}&tipoDinero=${tipoDineroToUse}`;
                
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    setCierreData(data);
                    setIngresos(data.ingresos);
                    setEgresos(data.egresos);
                    setTotalIngresos(data.totalIngresos);
                    setTotalEgresos(data.totalEgresos);
                    setSaldoCierre(data.saldoCierre);
                    setMonedaSimbolo(data.monedaSimbolo);
                    setConsolidatedData(null);
                    setTotalIngresoVenta(data.totalIngresoVenta);
                    
                    if (data.ingresos.length === 0 && data.egresos.length === 0) {
                        Swal.fire('Información', 'No se encontraron registros para los filtros seleccionados', 'info');
                    }
                } else {
                    throw new Error('Error al obtener datos');
                }
            } else {
                // Consolidated general - only use Córdobas combinations, exclude dollar calculations
                const combinations = [
                    { tipoPago: "Efectivo", tipoDinero: "Cordobas" },
                    { tipoPago: "Transferencia", tipoDinero: "Cordobas" },
                    { tipoPago: "Tarjeta", tipoDinero: "Cordobas" }
                ];
                
                try {
                    // Make all 5 API calls in parallel
                    const promises = combinations.map(combo => {
                        const url = `api/cierre/Calcular?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&tipoPago=${combo.tipoPago}&tipoDinero=${combo.tipoDinero}`;
                        return fetch(url).then(response => {
                            if (response.ok) {
                                return response.json().then(data => ({ ...data, ...combo }));
                            } else {
                                throw new Error(`Error fetching data for ${combo.tipoPago}-${combo.tipoDinero}`);
                            }
                        });
                    });
                    
                    const results = await Promise.all(promises);
                    
                    // Process results - since we're only using Córdobas, no currency conversion needed
                    const resumenPorTipo = results.map(result => {
                        const totalIngresoVenta = result.totalIngresoVenta;
                        const totalIngresos = result.totalIngresos;
                        const totalEgresos = result.totalEgresos;
                        const saldoCierre = totalIngresos - totalEgresos;
                        
                        return {
                            tipoPago: result.tipoPago,
                            tipoMoneda: result.tipoDinero,
                            totalIngresoVenta,
                            totalIngresos,
                            totalEgresos,
                            saldoCierre,
                            saldoCierreCordobas: null, // No conversion needed since everything is in Córdobas
                            ingresos: result.ingresos, // Keep original transaction data
                            egresos: result.egresos  // Keep original transaction data
                        };
                    });
                    
                    const consolidatedData = { resumenPorTipo };
                    
                    setConsolidatedData(consolidatedData);
                    setCierreData(null);
                    setIngresos([]);
                    setEgresos([]);
                    
                    // Calculate overall totals - all in córdobas, no conversion needed
                    let totalIngresosConsolidado = 0;
                    let totalEgresosConsolidado = 0;
                    let totalIngresoVentaConsolidado = 0;
                    
                    consolidatedData.resumenPorTipo.forEach(item => {
                        totalIngresosConsolidado += item.totalIngresos;
                        totalEgresosConsolidado += item.totalEgresos;
                        totalIngresoVentaConsolidado += item.totalIngresoVenta;
                    });
                    
                    setTotalIngresos(totalIngresosConsolidado);
                    setTotalEgresos(totalEgresosConsolidado);
                    setSaldoCierre(totalIngresosConsolidado - totalEgresosConsolidado);
                    setMonedaSimbolo("C$");
                    setTotalIngresoVenta(totalIngresoVentaConsolidado);
                    
                    if (consolidatedData.resumenPorTipo.every(item => item.ingresos.length === 0 && item.egresos.length === 0)) {
                        Swal.fire('Información', 'No se encontraron registros para los filtros seleccionados', 'info');
                    }
                } catch (error) {
                    console.error('Error fetching consolidated data:', error);
                    Swal.fire('Error', 'No se pudo obtener los datos del cierre consolidado', 'error');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo calcular el cierre contable', 'error');
        } finally {
            setPendiente(false);
        }
    };

    // Reset data when filters change (calculation only happens on button click)
    useEffect(() => {
        if (cierreData || consolidatedData) {
            // Clear results when filters change after a calculation has been done
            setCierreData(null);
            setConsolidatedData(null);
            setIngresos([]);
            setEgresos([]);
            setTotalIngresos(0);
            setTotalEgresos(0);
            setSaldoCierre(0);
            setMonedaSimbolo("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange, startDate, endDate, reportMode, tipoPago, tipoDinero]);

    // Auto-select Cordobas for segmentation mode
    useEffect(() => {
        if (reportMode === "Segmentación por método") {
            setTipoDinero("Cordobas");
        }
    }, [reportMode]);

    // Columns for Ingresos table
    const ingresosColumns = [
        {
            name: "Descripción",
            selector: (row) => row.descripcion,
            sortable: true,
            grow: 2,
        },
        {
            name: "Fecha",
            selector: (row) => row.fechaRegistro,
            sortable: true,
        },
        {
            name: "Monto",
            selector: (row) => row.monto,
            sortable: true,
            cell: (row) => `${monedaSimbolo}${parseFloat(row.monto).toFixed(2)}`,
        },
        {
            name: "Tipo Pago",
            selector: (row) => row.tipoPago,
            sortable: true,
        },
        {
            name: "Usuario",
            selector: (row) => row.nombreUsuario,
            sortable: true,
        },
    ];

    // Columns for Egresos table
    const egresosColumns = [
        {
            name: "Descripción",
            selector: (row) => row.descripcion,
            sortable: true,
            grow: 2,
        },
        {
            name: "Fecha",
            selector: (row) => row.fechaRegistro,
            sortable: true,
        },
        {
            name: "Monto",
            selector: (row) => row.monto,
            sortable: true,
            cell: (row) => `${monedaSimbolo}${parseFloat(row.monto).toFixed(2)}`,
        },
        {
            name: "Tipo Pago",
            selector: (row) => row.tipoPago,
            sortable: true,
        },
        {
            name: "Usuario",
            selector: (row) => row.nombreUsuario,
            sortable: true,
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                fontSize: '13px',
                fontWeight: 800,
                backgroundColor: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
                color: 'white',
            },
        },
        headRow: {
            style: {
                backgroundColor: "#f8f9fa",
                borderBottom: '2px solid #D946A6',
            }
        },
        rows: {
            style: {
                '&:hover': {
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer',
                }
            }
        }
    };

    // Export functions
    const exportToExcelHandler = () => {
        if (!cierreData && !consolidatedData) {
            Swal.fire('Error', 'No hay datos para exportar', 'error');
            return;
        }

        let excelData = [];

        if (consolidatedData) {
            // Export consolidated data with detailed transactions
            excelData = [
                {
                    'Concepto': 'RESUMEN CIERRE CONSOLIDADO',
                    'Valor': ''
                },
                {
                    'Concepto': `Total Ingresos`,
                    'Valor': `${monedaSimbolo}${totalIngresos.toFixed(2)}`
                },
                {
                    'Concepto': `Total Egresos`,
                    'Valor': `${monedaSimbolo}${totalEgresos.toFixed(2)}`
                },
                {
                    'Concepto': `Saldo Cierre`,
                    'Valor': `${monedaSimbolo}${saldoCierre.toFixed(2)}`
                },
                {}
            ];

            // Add detailed information for each payment type/currency combination
            consolidatedData.resumenPorTipo.forEach(item => {
                // Always use Córdobas symbol since we removed dollar calculations
                const currencySymbol = "C$";
                
                // Category header
                excelData.push({
                    'Concepto': `${item.tipoPago.toUpperCase()} - ${item.tipoMoneda.toUpperCase()}`,
                    'Valor': ''
                });
                
                // Category summary
                excelData.push({
                    'Concepto': `Total Ingresos`,
                    'Valor': `${currencySymbol}${item.totalIngresos.toFixed(2)}`
                });
                excelData.push({
                    'Concepto': `Total Egresos`,
                    'Valor': `${currencySymbol}${item.totalEgresos.toFixed(2)}`
                });
                excelData.push({
                    'Concepto': `Saldo`,
                    'Valor': `${currencySymbol}${item.saldoCierre.toFixed(2)}`
                });
                
                excelData.push({});
                
                // Detailed Ingresos
                if (item.ingresos && item.ingresos.length > 0) {
                    excelData.push({
                        'Concepto': `INGRESOS DETALLADOS (${item.ingresos.length})`,
                        'Valor': ''
                    });
                    
                    item.ingresos.forEach(ing => {
                        excelData.push({
                            'Descripción': ing.descripcion,
                            'Fecha': ing.fechaRegistro,
                            'Monto': `${currencySymbol}${parseFloat(ing.monto).toFixed(2)}`,
                            'Tipo Pago': ing.tipoPago,
                            'Usuario': ing.nombreUsuario
                        });
                    });
                    
                    excelData.push({});
                }
                
                // Detailed Egresos
                if (item.egresos && item.egresos.length > 0) {
                    excelData.push({
                        'Concepto': `EGRESOS DETALLADOS (${item.egresos.length})`,
                        'Valor': ''
                    });
                    
                    item.egresos.forEach(egr => {
                        excelData.push({
                            'Descripción': egr.descripcion,
                            'Fecha': egr.fechaRegistro,
                            'Monto': `C$${parseFloat(egr.monto).toFixed(2)}`,
                            'Tipo Pago': egr.tipoPago,
                            'Usuario': egr.nombreUsuario
                        });
                    });
                    
                    excelData.push({});
                }
            });
        } else {
            // Export segmented data (existing logic)
            excelData = [
                {
                    'Concepto': 'RESUMEN CIERRE CONTABLE',
                    'Valor': ''
                },
                {
                    'Concepto': `Total Ingresos`,
                    'Valor': `${monedaSimbolo}${totalIngresos.toFixed(2)}`
                },
                {
                    'Concepto': `Total Egresos`,
                    'Valor': `${monedaSimbolo}${totalEgresos.toFixed(2)}`
                },
                {
                    'Concepto': `Saldo Cierre`,
                    'Valor': `${monedaSimbolo}${saldoCierre.toFixed(2)}`
                },
                {},
                {
                    'Concepto': 'DETALLE INGRESOS',
                    'Valor': ''
                },
                ...ingresos.map(ing => ({
                    'Concepto': ing.descripcion,
                    'Fecha': ing.fechaRegistro,
                    'Monto': `${monedaSimbolo}${parseFloat(ing.monto).toFixed(2)}`,
                    'Tipo Pago': ing.tipoPago,
                    'Usuario': ing.nombreUsuario
                })),
                {},
                {
                    'Concepto': 'DETALLE EGRESOS',
                    'Valor': ''
                },
                ...egresos.map(egr => ({
                    'Concepto': egr.descripcion,
                    'Fecha': egr.fechaRegistro,
                    'Monto': `${monedaSimbolo}${parseFloat(egr.monto).toFixed(2)}`,
                    'Tipo Pago': egr.tipoPago,
                    'Usuario': egr.nombreUsuario
                }))
            ];
        }

        exportToExcel(excelData, 'Cierre_Contable');
    };

    const exportToPDFHandler = () => {
        if (!cierreData && !consolidatedData) {
            Swal.fire('Error', 'No hay datos para exportar', 'error');
            return;
        }

        let columns, pdfData, analytics;

        if (consolidatedData) {
            // Columnas para consolidado
            columns = [
                { header: 'Categoría', accessor: (row) => row.categoria },
                { header: 'Tipo', accessor: (row) => row.tipo },
                { header: 'Descripción', accessor: (row) => row.descripcion },
                { header: 'Fecha', accessor: (row) => row.fechaRegistro },
                { header: 'Monto', accessor: (row) => row.monto },
                { header: 'Usuario', accessor: (row) => row.nombreUsuario }
            ];

            pdfData = [];

            // Resumen general consolidado (totales globales en córdobas)
            pdfData.push({
                categoria: 'CONSOLIDADO',
                tipo: 'RESUMEN GENERAL',
                descripcion: `Total Ingresos: ${monedaSimbolo}${totalIngresos.toFixed(2)} | Total Egresos: ${monedaSimbolo}${totalEgresos.toFixed(2)} | Saldo: ${monedaSimbolo}${saldoCierre.toFixed(2)}`,
                fechaRegistro: '',
                monto: '',
                nombreUsuario: ''
            });

            // Línea vacía separadora
            pdfData.push({
                categoria: '',
                tipo: '',
                descripcion: '',
                fechaRegistro: '',
                monto: '',
                nombreUsuario: ''
            });

            // Detalle por categoría
            consolidatedData.resumenPorTipo.forEach(item => {
                const currencySymbol = "C$"; // Always use Córdobas
                const categoria = `${item.tipoPago} - ${item.tipoMoneda}`;

                // Resumen por categoría
                pdfData.push({
                    categoria,
                    tipo: 'RESUMEN',
                    descripcion: `Ingresos: ${currencySymbol}${item.totalIngresos.toFixed(2)} | Egresos: ${currencySymbol}${item.totalEgresos.toFixed(2)} | Saldo: ${currencySymbol}${item.saldoCierre.toFixed(2)}`,
                    fechaRegistro: '',
                    monto: '',
                    nombreUsuario: ''
                });

                // Ingresos
                if (item.ingresos && item.ingresos.length > 0) {
                    item.ingresos.forEach(ing => {
                        pdfData.push({
                            categoria,
                            tipo: 'Ingreso',
                            descripcion: ing.descripcion,
                            fechaRegistro: ing.fechaRegistro,
                            monto: `${currencySymbol}${parseFloat(ing.monto).toFixed(2)}`,
                            nombreUsuario: ing.nombreUsuario
                        });
                    });
                }

                // Egresos
                if (item.egresos && item.egresos.length > 0) {
                    item.egresos.forEach(egr => {
                        pdfData.push({
                            categoria,
                            tipo: 'Egreso',
                            descripcion: egr.descripcion,
                            fechaRegistro: egr.fechaRegistro,
                            monto: `${currencySymbol}${parseFloat(egr.monto).toFixed(2)}`,
                            nombreUsuario: egr.nombreUsuario
                        });
                    });
                }

                // Separador entre categorías
                pdfData.push({
                    categoria: '',
                    tipo: '',
                    descripcion: '',
                    fechaRegistro: '',
                    monto: '',
                    nombreUsuario: ''
                });
            });

            analytics = {
                type: 'consolidated_closure_detailed',
                totalIngresos: `${monedaSimbolo}${totalIngresos.toFixed(2)}`,
                totalEgresos: `${monedaSimbolo}${totalEgresos.toFixed(2)}`,
                saldoCierre: `${monedaSimbolo}${saldoCierre.toFixed(2)}`,
                details: consolidatedData.resumenPorTipo.map(item => ({
                    category: `${item.tipoPago} - ${item.tipoMoneda}`,
                    ingresos: `C$${item.totalIngresos.toFixed(2)}`,
                    egresos: `C$${item.totalEgresos.toFixed(2)}`,
                    saldo: `C$${item.saldoCierre.toFixed(2)}`,
                    saldoCordobas: null // No conversion needed since everything is in Córdobas
                }))
            };
        } else {
            // Segmentado
            columns = [
                { header: 'Tipo', accessor: (row) => row.tipo },
                { header: 'Descripción', accessor: (row) => row.descripcion },
                { header: 'Fecha', accessor: (row) => row.fechaRegistro },
                { header: 'Monto', accessor: (row) => `${monedaSimbolo}${parseFloat(row.monto).toFixed(2)}` },
                { header: 'Usuario', accessor: (row) => row.nombreUsuario }
            ];

            pdfData = [
                ...ingresos.map(ing => ({ ...ing, tipo: 'Ingreso' })),
                ...egresos.map(egr => ({ ...egr, tipo: 'Egreso' }))
            ];

            analytics = {
                type: 'closure',
                totalIngresos: `${monedaSimbolo}${totalIngresos.toFixed(2)}`,
                totalEgresos: `${monedaSimbolo}${totalEgresos.toFixed(2)}`,
                saldoCierre: `${monedaSimbolo}${saldoCierre.toFixed(2)}`
            };
        }

        exportToPDF(pdfData, columns, 'Cierre_Contable', analytics);
    };

    // Print handler function
    const handlePrint = () => {
        if (!cierreData && !consolidatedData) {
            Swal.fire('Error', 'No hay datos para imprimir', 'error');
            return;
        }

        // Prepare data for the ticket
        const ticketData = {
            totalIngresoVenta,
            totalIngresos,
            totalEgresos,
            saldoCierre,
            monedaSimbolo,
            ingresos: cierreData ? ingresos : consolidatedData ? consolidatedData.resumenPorTipo.flatMap(item => item.ingresos || []) : [],
            egresos: cierreData ? egresos : consolidatedData ? consolidatedData.resumenPorTipo.flatMap(item => item.egresos || []) : []
        };

        // If consolidated data, we need to combine all ingresos and egresos
        if (consolidatedData) {
            const allIngresos = [];
            const allEgresos = [];
            
            consolidatedData.resumenPorTipo.forEach(item => {
                if (item.ingresos) {
                    allIngresos.push(...item.ingresos);
                }
                if (item.egresos) {
                    allEgresos.push(...item.egresos);
                }
            });
            
            ticketData.ingresos = allIngresos;
            ticketData.egresos = allEgresos;
        }
console.log("Ticket Data:", ticketData); // Debug log
        printJS({
              printable: "ticket-cierre-impresion",
              type: "html",
              css: "/css/TicketCierre.css",
            });
        
        
    };


    return (
        <>
            {/* Page Header */}
            <div style={{
                background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 50%, #10B981 100%)',
                padding: '2rem',
                borderRadius: '15px',
                marginBottom: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaCashRegister size={48} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
                    <div>
                        <h2 style={{ margin: 0, fontWeight: 700, fontSize: '2rem' }}>Cierre Contable</h2>
                        <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
                            Gestión y análisis de cierres de caja
                        </p>
                    </div>
                </div>
            </div>

            <Row>
                <Col sm={12}>
                    <Card style={{
                        borderRadius: '15px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        border: 'none'
                    }}>
                        <CardHeader style={{
                            background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
                            color: 'white',
                            borderRadius: '15px 15px 0 0',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: 600,
                            fontSize: '1.1rem'
                        }}>
                            <FaChartLine size={24} />
                            Filtros de Búsqueda
                        </CardHeader>
                        <CardBody style={{ padding: '2rem' }}>
                            {/* Filters Section */}
                            <Row className="align-items-end mb-3 filters-row">
                                <Col xs={12} sm={12} md={6} lg={12} xl={3} className="mb-3 mb-xl-0">
                                    <FormGroup>
                                        <Label style={{
                                            fontWeight: 600,
                                            color: '#374151',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.5rem',
                                            fontSize: '0.9rem'
                                        }}>
                                            <FaCalendarAlt style={{ color: '#D946A6' }} size={14} />
                                            Rango de fechas:
                                        </Label>
                                        <select 
                                            className="form-control"
                                            value={dateRange}
                                            onChange={(e) => handleDateRangeChange(e.target.value)}
                                            style={{
                                                borderRadius: '8px',
                                                border: '2px solid #e5e7eb',
                                                padding: '0.5rem',
                                                fontSize: '0.9rem',
                                                color: '#374151',
                                                transition: 'all 0.3s ease',
                                                outline: 'none',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                MozAppearance: 'none',
                                                height: 'auto'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#D946A6'}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="Hoy">Hoy</option>
                                            <option value="Ayer">Ayer</option>
                                            <option value="Esta Semana">Esta Semana</option>
                                            <option value="Este Mes">Este Mes</option>
                                            <option value="Elegir Rango">Elegir Rango</option>
                                        </select>
                                    </FormGroup>
                                </Col>

                                {showDatePicker && (
                                    <>
                                        <Col xs={12} sm={6} md={6} lg={6} xl={2} className="mb-3 mb-xl-0">
                                            <FormGroup>
                                                <Label style={{
                                                    fontWeight: 600,
                                                    color: '#374151',
                                                    marginBottom: '0.5rem',
                                                    fontSize: '0.9rem'
                                                }}>Fecha inicio:</Label>
                                                <DatePicker
                                                    selected={startDate}
                                                    onChange={(date) => setStartDate(date)}
                                                    className="form-control"
                                                    dateFormat="dd/MM/yyyy"
                                                    wrapperClassName="w-100"
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e5e7eb',
                                                        fontSize: '0.9rem'
                                                    }}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col xs={12} sm={6} md={6} lg={6} xl={2} className="mb-3 mb-xl-0">
                                            <FormGroup>
                                                <Label style={{
                                                    fontWeight: 600,
                                                    color: '#374151',
                                                    marginBottom: '0.5rem',
                                                    fontSize: '0.9rem'
                                                }}>Fecha fin:</Label>
                                                <DatePicker
                                                    selected={endDate}
                                                    onChange={(date) => setEndDate(date)}
                                                    className="form-control"
                                                    dateFormat="dd/MM/yyyy"
                                                    wrapperClassName="w-100"
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e5e7eb',
                                                        fontSize: '0.9rem'
                                                    }}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </>
                                )}

                                <Col xs={12} sm={12} md={6} lg={12} xl={showDatePicker ? 3 : 5} className="mb-3 mb-xl-0">
                                    <FormGroup>
                                        <Label style={{
                                            fontWeight: 600,
                                            color: '#374151',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.5rem',
                                            fontSize: '0.9rem'
                                        }}>
                                            <FaChartLine style={{ color: '#F59E0B' }} size={14} />
                                            Tipo de reporte:
                                        </Label>
                                        <select 
                                            className="form-control"
                                            value={reportMode}
                                            onChange={(e) => setReportMode(e.target.value)}
                                            style={{
                                                borderRadius: '8px',
                                                border: '2px solid #e5e7eb',
                                                padding: '0.5rem',
                                                fontSize: '0.9rem',
                                                color: '#374151',
                                                transition: 'all 0.3s ease',
                                                outline: 'none',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                MozAppearance: 'none',
                                                height: 'auto'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="Consolidado general">Consolidado general</option>
                                            <option value="Segmentación por método">Segmentación por método</option>
                                        </select>
                                    </FormGroup>
                                </Col>

                                {reportMode === "Segmentación por método" && (
                                    <Col xs={12} sm={12} md={6} lg={12} xl={2} className="mb-3 mb-xl-0">
                                        <FormGroup>
                                            <Label style={{
                                                fontWeight: 600,
                                                color: '#374151',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.5rem',
                                                fontSize: '0.9rem'
                                            }}>
                                                <FaCreditCard style={{ color: '#10B981' }} size={14} />
                                                Tipo de pago:
                                            </Label>
                                            <select 
                                                className="form-control"
                                                value={tipoPago}
                                                onChange={(e) => setTipoPago(e.target.value)}
                                                style={{
                                                    borderRadius: '8px',
                                                    border: '2px solid #e5e7eb',
                                                    padding: '0.5rem',
                                                    fontSize: '0.9rem',
                                                    color: '#374151',
                                                    transition: 'all 0.3s ease',
                                                    outline: 'none',
                                                    appearance: 'none',
                                                    WebkitAppearance: 'none',
                                                    MozAppearance: 'none',
                                                    height: 'auto'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#10B981'}
                                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="Transferencia">Transferencia</option>
                                                <option value="Efectivo">Efectivo</option>
                                                <option value="Tarjeta">Tarjeta</option>
                                            </select>
                                        </FormGroup>
                                    </Col>
                                )}

                                <Col xs={12} sm={12} md={6} lg={12} xl={showDatePicker ? 2 : 3} className="d-flex align-items-end mb-3 mb-xl-0">
                                    <FormGroup className="w-100">
                                        <Button 
                                            size="sm" 
                                            block 
                                            onClick={calcularCierre}
                                            disabled={!dateRange || !reportMode || 
                                                (reportMode === "Segmentación por método" && !tipoPago)
                                            }
                                            style={{
                                                background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '0.5rem 1rem',
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                boxShadow: '0 4px 15px rgba(217, 70, 166, 0.3)',
                                                transition: 'all 0.3s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                cursor: !dateRange || !reportMode || 
                                                    (reportMode === "Segmentación por método" && !tipoPago) ? 'not-allowed' : 'pointer',
                                                opacity: !dateRange || !reportMode || 
                                                    (reportMode === "Segmentación por método" && !tipoPago) ? 0.6 : 1,
                                                minHeight: '38px'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (dateRange && reportMode && 
                                                    (reportMode !== "Segmentación por método" || tipoPago)) {
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = '0 6px 20px rgba(217, 70, 166, 0.4)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 15px rgba(217, 70, 166, 0.3)';
                                            }}
                                        >
                                            <FaCalculator size={14} />
                                            <span className="d-none d-xl-inline">Calcular</span>
                                        </Button>
                                    </FormGroup>
                                </Col>
                            </Row>

                            {/* Results Summary */}
                            {(cierreData || consolidatedData) && (
                                <Row className="mb-4 resumen-row" style={{ marginTop: '2rem' }}>
                                    <Col sm={12}>
                                        <Card style={{
                                            background: 'linear-gradient(135deg, rgba(217, 70, 166, 0.05) 0%, rgba(245, 158, 11, 0.05) 50%, rgba(16, 185, 129, 0.05) 100%)',
                                            border: 'none',
                                            borderRadius: '15px',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
                                        }}>
                                            <CardBody style={{ padding: '2rem' }}>
                                                <Row className="no-gutters align-items-center">
                                                    <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
                                                        <div style={{
                                                            padding: '0.75rem 0'
                                                        }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '6px',
                                                                marginBottom: '0.5rem',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 600,
                                                                textTransform: 'uppercase',
                                                                color: '#10B981',
                                                                letterSpacing: '0.3px'
                                                            }}>
                                                                <FaArrowUp size={14} />
                                                                Total Ingresos
                                                            </div>
                                                            <div style={{
                                                                fontSize: '1.5rem',
                                                                fontWeight: 700,
                                                                color: '#1f2937'
                                                            }}>
                                                                {monedaSimbolo}{totalIngresos.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
                                                        <div style={{
                                                            padding: '0.75rem 0'
                                                        }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '6px',
                                                                marginBottom: '0.5rem',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 600,
                                                                textTransform: 'uppercase',
                                                                color: '#EF4444',
                                                                letterSpacing: '0.3px'
                                                            }}>
                                                                <FaArrowDown size={14} />
                                                                Total Egresos
                                                            </div>
                                                            <div style={{
                                                                fontSize: '1.5rem',
                                                                fontWeight: 700,
                                                                color: '#1f2937'
                                                            }}>
                                                                {monedaSimbolo}{totalEgresos.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={4} className="text-center">
                                                        <div style={{
                                                            padding: '0.75rem 0'
                                                        }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '6px',
                                                                marginBottom: '0.5rem',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 600,
                                                                textTransform: 'uppercase',
                                                                color: saldoCierre >= 0 ? '#D946A6' : '#DC2626',
                                                                letterSpacing: '0.3px'
                                                            }}>
                                                                <FaBalanceScale size={14} />
                                                                Saldo Cierre
                                                            </div>
                                                            <div style={{
                                                                fontSize: '1.5rem',
                                                                fontWeight: 700,
                                                                color: saldoCierre >= 0 ? '#10B981' : '#DC2626'
                                                            }}>
                                                                {monedaSimbolo}{saldoCierre.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            )}

                            {/* Export Buttons */}
                            {(cierreData || consolidatedData) && (
                                <Row className="mb-3" style={{ marginTop: '1.5rem' }}>
                                    <Col xs={12} md={4} className="mb-3 mb-md-0">
                                        <Button 
                                            size="sm" 
                                            onClick={exportToExcelHandler}
                                            style={{
                                                background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '0.75rem 1.5rem',
                                                fontSize: '0.95rem',
                                                fontWeight: 600,
                                                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                                                transition: 'all 0.3s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                width: '100%'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                                            }}
                                        >
                                            <FaFileExcel size={18} /> Exportar Excel
                                        </Button>
                                    </Col>
                                    <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
                                        <Button 
                                            size="sm" 
                                            onClick={exportToPDFHandler}
                                            style={{
                                                background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '0.75rem 1.5rem',
                                                fontSize: '0.95rem',
                                                fontWeight: 600,
                                                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                                                transition: 'all 0.3s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                width: '100%'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                                            }}
                                        >
                                            <FaFilePdf size={18} /> Exportar PDF
                                        </Button>
                                    </Col>
                                    <Col xs={12} md={4} className="text-center">
                                        <Button 
                                            size="sm" 
                                            onClick={handlePrint}
                                            style={{
                                                background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '0.75rem 1.5rem',
                                                fontSize: '0.95rem',
                                                fontWeight: 600,
                                                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                                                transition: 'all 0.3s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                width: '100%'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                                            }}
                                        >
                                            <FaPrint size={18} /> Imprimir Ticket
                                        </Button>
                                    </Col>
                                </Row>
                            )}

                            {/* Consolidated Report Details */}
                            {consolidatedData && (
                                <Row className="mb-4 resumen-row-consolidado" style={{ marginTop: '2rem' }}>
                                    <Col sm={12}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            marginBottom: '1.5rem',
                                            color: '#1f2937',
                                            fontWeight: 700,
                                            fontSize: '1.3rem'
                                        }}>
                                            <FaMoneyBillWave style={{ color: '#D946A6' }} size={28} />
                                            Detalle por Tipo de Pago y Moneda
                                        </div>
                                        <Row>
                                            {consolidatedData.resumenPorTipo.map((item, index) => {
                                                const paymentIcon = item.tipoPago === "Efectivo" ? FaWallet : 
                                                                   item.tipoPago === "Transferencia" ? FaExchangeAlt : FaCreditCard;
                                                const PaymentIcon = paymentIcon;
                                                
                                                return (
                                                    <Col xs={12} md={6} key={index} className="mb-4">
                                                        <Card style={{
                                                            borderRadius: '15px',
                                                            border: 'none',
                                                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                                            transition: 'all 0.3s ease',
                                                            overflow: 'hidden'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                                            e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.15)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                                                        }}>
                                                            <div style={{
                                                                background: 'linear-gradient(135deg, #D946A6 0%, #F59E0B 100%)',
                                                                padding: '1rem 1.5rem',
                                                                color: 'white'
                                                            }}>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.75rem',
                                                                    fontSize: '1.1rem',
                                                                    fontWeight: 700
                                                                }}>
                                                                    <PaymentIcon size={24} />
                                                                    {item.tipoPago} - {item.tipoMoneda}
                                                                </div>
                                                            </div>
                                                            <CardBody style={{ padding: '1.5rem' }}>
                                                                <Row className="no-gutters mb-3">
                                                                    <Col sm={4} className="text-center">
                                                                        <div style={{
                                                                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)',
                                                                            borderRadius: '10px',
                                                                            padding: '1rem',
                                                                            border: '2px solid #10B981'
                                                                        }}>
                                                                            <div style={{
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: 700,
                                                                                color: '#10B981',
                                                                                textTransform: 'uppercase',
                                                                                marginBottom: '0.5rem',
                                                                                letterSpacing: '0.5px'
                                                                            }}>
                                                                                Ingresos
                                                                            </div>
                                                                            <div style={{
                                                                                fontSize: '1.2rem',
                                                                                fontWeight: 800,
                                                                                color: '#1f2937'
                                                                            }}>
                                                                                C${item.totalIngresos.toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                    </Col>
                                                                    <Col sm={4} className="text-center">
                                                                        <div style={{
                                                                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%)',
                                                                            borderRadius: '10px',
                                                                            padding: '1rem',
                                                                            border: '2px solid #EF4444'
                                                                        }}>
                                                                            <div style={{
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: 700,
                                                                                color: '#EF4444',
                                                                                textTransform: 'uppercase',
                                                                                marginBottom: '0.5rem',
                                                                                letterSpacing: '0.5px'
                                                                            }}>
                                                                                Egresos
                                                                            </div>
                                                                            <div style={{
                                                                                fontSize: '1.2rem',
                                                                                fontWeight: 800,
                                                                                color: '#1f2937'
                                                                            }}>
                                                                                C${item.totalEgresos.toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                    </Col>
                                                                    <Col sm={4} className="text-center">
                                                                        <div style={{
                                                                            background: item.saldoCierre >= 0
                                                                                ? 'linear-gradient(135deg, rgba(217, 70, 166, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)'
                                                                                : 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)',
                                                                            borderRadius: '10px',
                                                                            padding: '1rem',
                                                                            border: item.saldoCierre >= 0 ? '2px solid #D946A6' : '2px solid #DC2626'
                                                                        }}>
                                                                            <div style={{
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: 700,
                                                                                color: item.saldoCierre >= 0 ? '#D946A6' : '#DC2626',
                                                                                textTransform: 'uppercase',
                                                                                marginBottom: '0.5rem',
                                                                                letterSpacing: '0.5px'
                                                                            }}>
                                                                                Saldo
                                                                            </div>
                                                                            <div style={{
                                                                                fontSize: '1.2rem',
                                                                                fontWeight: 800,
                                                                                color: item.saldoCierre >= 0 ? '#10B981' : '#DC2626'
                                                                            }}>
                                                                                C${item.saldoCierre.toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                    </Col>
                                                                </Row>
                                                                
                                                                <Row className="resumen-row-consolidado" style={{ marginTop: '1.5rem' }}>
                                                                    <Col sm={6}>
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '0.5rem',
                                                                            marginBottom: '1rem',
                                                                            color: '#10B981',
                                                                            fontWeight: 700,
                                                                            fontSize: '1rem'
                                                                        }}>
                                                                            <FaArrowUp />
                                                                            Ingresos ({item.ingresos ? item.ingresos.length : 0})
                                                                        </div>
                                                                        <DataTable
                                                                            columns={[
                                                                                {
                                                                                    name: "Descripción",
                                                                                    selector: (row) => row.descripcion,
                                                                                    sortable: true,
                                                                                    grow: 2,
                                                                                },
                                                                                {
                                                                                    name: "Fecha",
                                                                                    selector: (row) => row.fechaRegistro,
                                                                                    sortable: true,
                                                                                },
                                                                                {
                                                                                    name: "Monto",
                                                                                    selector: (row) => row.monto,
                                                                                    sortable: true,
                                                                                    cell: (row) => `C$${parseFloat(row.monto).toFixed(2)}`,
                                                                                },
                                                                                {
                                                                                    name: "Tipo Pago",
                                                                                    selector: (row) => row.tipoPago,
                                                                                    sortable: true,
                                                                                },
                                                                                {
                                                                                    name: "Usuario",
                                                                                    selector: (row) => row.nombreUsuario,
                                                                                    sortable: true,
                                                                                },
                                                                            ]}
                                                                            data={item.ingresos || []}
                                                                            customStyles={customStyles}
                                                                            pagination
                                                                            paginationPerPage={5}
                                                                            noDataComponent="No hay ingresos para mostrar"
                                                                            dense
                                                                        />
                                                                    </Col>
                                                                    <Col sm={6}>
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '0.5rem',
                                                                            marginBottom: '1rem',
                                                                            color: '#EF4444',
                                                                            fontWeight: 700,
                                                                            fontSize: '1rem'
                                                                        }}>
                                                                            <FaArrowDown />
                                                                            Egresos ({item.egresos ? item.egresos.length : 0})
                                                                        </div>
                                                                        <DataTable
                                                                            columns={[
                                                                                {
                                                                                    name: "Descripción",
                                                                                    selector: (row) => row.descripcion,
                                                                                    sortable: true,
                                                                                    grow: 2,
                                                                                },
                                                                                {
                                                                                    name: "Fecha",
                                                                                    selector: (row) => row.fechaRegistro,
                                                                                    sortable: true,
                                                                                },
                                                                                {
                                                                                    name: "Monto",
                                                                                    selector: (row) => row.monto,
                                                                                    sortable: true,
                                                                                    cell: (row) => `C$${parseFloat(row.monto).toFixed(2)}`,
                                                                                },
                                                                                {
                                                                                    name: "Tipo Pago",
                                                                                    selector: (row) => row.tipoPago,
                                                                                    sortable: true,
                                                                                },
                                                                                {
                                                                                    name: "Usuario",
                                                                                    selector: (row) => row.nombreUsuario,
                                                                                    sortable: true,
                                                                                },
                                                                            ]}
                                                                            data={item.egresos || []}
                                                                            customStyles={customStyles}
                                                                            pagination
                                                                            paginationPerPage={5}
                                                                            noDataComponent="No hay egresos para mostrar"
                                                                            dense
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            </CardBody>
                                                        </Card>
                                                    </Col>
                                                );
                                            })}
                                        </Row>
                                    </Col>
                                </Row>
                            )}

                            {/* Tables Section - Only show in segmentation mode */}
                            {cierreData && reportMode === "Segmentación por método" && (
                                <>
                                    <hr style={{
                                        margin: '2rem 0',
                                        border: 'none',
                                        height: '2px',
                                        background: 'linear-gradient(90deg, transparent, #D946A6, #F59E0B, transparent)'
                                    }} />
                                    <Row className="resumen-row">
                                        <Col sm={6}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                marginBottom: '1rem',
                                                color: '#10B981',
                                                fontWeight: 700,
                                                fontSize: '1.3rem'
                                            }}>
                                                <FaArrowUp size={24} />
                                                Ingresos ({ingresos.length})
                                            </div>
                                            <DataTable
                                                progressPending={pendiente}
                                                columns={ingresosColumns}
                                                data={ingresos}
                                                customStyles={customStyles}
                                                pagination
                                                paginationPerPage={10}
                                                noDataComponent="No hay ingresos para mostrar"
                                            />
                                        </Col>
                                        <Col sm={6}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                marginBottom: '1rem',
                                                color: '#EF4444',
                                                fontWeight: 700,
                                                fontSize: '1.3rem'
                                            }}>
                                                <FaArrowDown size={24} />
                                                Egresos ({egresos.length})
                                            </div>
                                            <DataTable
                                                progressPending={pendiente}
                                                columns={egresosColumns}
                                                data={egresos}
                                                customStyles={customStyles}
                                                pagination
                                                paginationPerPage={10}
                                                noDataComponent="No hay egresos para mostrar"
                                            />
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Print Modal */}
            <div style={{display: 'none'}}>
                    <TicketCierre
  ref={ticketRef}
  cierreData={{
    totalIngresoVenta,
    totalIngresos,
    totalEgresos,
    saldoCierre,
    monedaSimbolo,
    ingresos: cierreData ? ingresos : consolidatedData ? consolidatedData.resumenPorTipo.flatMap(item => item.ingresos || []) : [],
    egresos: cierreData ? egresos : consolidatedData ? consolidatedData.resumenPorTipo.flatMap(item => item.egresos || []) : []
  }}
/>
            </div>
        </>
    );
};

export default Cierre;