import { useEffect, useState, useCallback } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,LinearScale,BarElement,Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { exportToPDF, exportToExcel } from '../utils/exportHelpers';
import { CHART_COLORS } from '../utils/brandColors';
import { FaShoppingCart, FaBoxOpen, FaTags, FaFilePdf, FaFileExcel, FaChartBar, FaChartPie } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const data_inicio_donut = {
    labels: ['Sin resultados'],
    datasets: [
        {
            data: [0],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1,
        },
    ],
};


const data_inicio_bar = {
    labels: ['Sin resultados'],
    datasets: [
        {
            label: 'Cantidad',
            data: [0],
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
    ],
};

const DashBoard = () => {

    const [config, setConfig] = useState({})
    const [dataDonut, setDataDonut] = useState(data_inicio_donut)
    const [dataBar, setDataBar] = useState(data_inicio_bar)
    
    // New state for filters
    const [dateRange, setDateRange] = useState("Hoy")
    const [productSort, setProductSort] = useState("most")
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)

    const optionsBar = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    afterBody: function(context) {
                        const index = context[0].dataIndex;
                        const ventasData = config.ventasporDias;
                        
                        if (ventasData && ventasData[index] && ventasData[index].productosVendidos) {
                            const productos = ventasData[index].productosVendidos;
                            const lines = ['', 'Productos vendidos:'];
                            
                            productos.forEach(producto => {
                                lines.push(`• ${producto.producto}: ${producto.total} unidades`);
                            });
                            
                            return lines;
                        }
                        return [];
                    }
                }
            }
        }
    };

    const optionsDonut = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            }
        }
    };

    const obtenerConfiguracion = useCallback(() => {
        let url = "api/utilidad/Dashboard?dateRange=" + encodeURIComponent(dateRange) + "&productSort=" + productSort;
        
        if (dateRange === "Elegir rango") {
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            url += "&startDate=" + formatDate(startDate) + "&endDate=" + formatDate(endDate);
        }

        fetch(url)
            .then((response) => {
                return response.ok ? response.json() : Promise.reject(response);
            })
            .then((dataJson) => {
                let d = dataJson;

                let lblsBar = d.ventasporDias.map((item) => { return item.fecha })
                let dtaBar = d.ventasporDias.map((item) => { return item.total } )

                let lblsDonut = d.productosVendidos.map((item) => { return item.producto })
                let dtaDonut = d.productosVendidos.map((item) => { return item.total })


                let modeloBar = {
                    labels: lblsBar,
                    datasets: [
                        {
                            label: 'Cantidad',
                            data: dtaBar,
                            backgroundColor: CHART_COLORS.bar.primary,
                            borderRadius: CHART_COLORS.bar.borderRadius,
                            borderWidth: 0,
                        },
                    ]
                };

                let modeloDonut = {
                    labels: lblsDonut,
                    datasets: [
                        {
                            data: dtaDonut,
                            backgroundColor: CHART_COLORS.doughnut.backgroundColor,
                            borderColor: CHART_COLORS.doughnut.borderColor,
                            borderWidth: CHART_COLORS.doughnut.borderWidth
                        },
                    ],
                }

                if (d.ventasporDias.length < 1)
                    setDataBar(data_inicio_bar)
                else
                    setDataBar(modeloBar)

                if (d.productosVendidos.length < 1)
                    setDataDonut(data_inicio_donut)
                else
                    setDataDonut(modeloDonut)
                
                setConfig(d)
            }).catch((error) => {
                console.log("error")
            })

    }, [dateRange, productSort, startDate, endDate])

    const handleDateRangeChange = (value) => {
        setDateRange(value);
        setShowDatePicker(value === "Elegir rango");
    };

    const handleProductSortChange = (value) => {
        setProductSort(value);
    };

    // Helper function to calculate sales analytics
    const calculateSalesAnalytics = (salesData) => {
        if (!salesData || salesData.length === 0) return null;
        
        // Sort sales data by total quantity to ensure we get the correct maximum and minimum
        const sortedSales = [...salesData].sort((a, b) => Number(b.total) - Number(a.total));
        const maxSale = sortedSales[0];
        const minSale = sortedSales[sortedSales.length - 1];
        
        return {
            type: 'sales',
            maxSales: {
                date: maxSale.fecha,
                quantity: maxSale.total
            },
            minSales: {
                date: minSale.fecha,
                quantity: minSale.total
            }
        };
    };

    // Helper function to calculate products analytics
    const calculateProductsAnalytics = (productsData, isTopSelling) => {
        if (!productsData || productsData.length === 0) return null;
        
        // Sort products by total quantity to ensure we get the correct max/min
        const sortedProducts = [...productsData].sort((a, b) => b.total - a.total);
        const targetProduct = isTopSelling ? sortedProducts[0] : sortedProducts[sortedProducts.length - 1];
        
        return {
            type: 'products',
            product: targetProduct.producto,
            quantity: targetProduct.total,
            isTopSelling: isTopSelling
        };
    };

    const exportSalesChartToPDF = () => {
        try {
            const salesData = config.ventasporDias || [];
            if (salesData.length === 0) {
                alert('No hay datos de ventas para exportar');
                return;
            }

            const salesAnalytics = calculateSalesAnalytics(salesData);
            
            // Flatten data to include product details
            const flattenedData = [];
            salesData.forEach(day => {
                flattenedData.push({
                    fecha: day.fecha,
                    total: day.total,
                    productos: '',
                    cantidades: ''
                });
                
                if (day.productosVendidos && day.productosVendidos.length > 0) {
                    day.productosVendidos.forEach(producto => {
                        flattenedData.push({
                            fecha: '',
                            total: '',
                            productos: producto.producto,
                            cantidades: producto.total + ' unidades'
                        });
                    });
                }
            });

            const salesColumns = [
                { header: 'Fecha', accessor: (row) => row.fecha },
                { header: 'Ventas', accessor: (row) => row.total },
                { header: 'Productos', accessor: (row) => row.productos },
                { header: 'Cantidades', accessor: (row) => row.cantidades }
            ];

            const dateRangeText = dateRange === "Elegir rango" 
                ? `${startDate.toLocaleDateString('es-ES').replace(/\//g, '-')}_a_${endDate.toLocaleDateString('es-ES').replace(/\//g, '-')}`
                : dateRange.replace(' ', '_');
            const fileName = `Ventas_${dateRangeText}`;
            
            exportToPDF(flattenedData, salesColumns, fileName, salesAnalytics);
        } catch (error) {
            console.error('Error exporting sales to PDF:', error);
            alert('Error al exportar ventas PDF. Por favor, inténtelo de nuevo.');
        }
    };

    const exportSalesChartToExcel = () => {
        try {
            const salesData = config.ventasporDias || [];
            if (salesData.length === 0) {
                alert('No hay datos de ventas para exportar');
                return;
            }

            const salesAnalytics = calculateSalesAnalytics(salesData);
            
            // Flatten data to include product details
            const salesExcelData = [];
            salesData.forEach(day => {
                salesExcelData.push({
                    'Fecha': day.fecha,
                    'Ventas': day.total,
                    'Productos': '',
                    'Cantidades': ''
                });
                
                if (day.productosVendidos && day.productosVendidos.length > 0) {
                    day.productosVendidos.forEach(producto => {
                        salesExcelData.push({
                            'Fecha': '',
                            'Ventas': '',
                            'Productos': producto.producto,
                            'Cantidades': producto.total + ' unidades'
                        });
                    });
                }
            });

            const dateRangeText = dateRange === "Elegir rango" 
                ? `${startDate.toLocaleDateString('es-ES').replace(/\//g, '-')}_a_${endDate.toLocaleDateString('es-ES').replace(/\//g, '-')}`
                : dateRange.replace(' ', '_');
            const fileName = `Ventas_${dateRangeText}`;
            
            exportToExcel(salesExcelData, fileName, salesAnalytics);
        } catch (error) {
            console.error('Error exporting sales to Excel:', error);
            alert('Error al exportar ventas Excel. Por favor, inténtelo de nuevo.');
        }
    };

    const exportProductsChartToPDF = () => {
        try {
            const productsData = config.productosVendidos || [];
            if (productsData.length === 0) {
                alert('No hay datos de productos para exportar');
                return;
            }

            const productsAnalytics = calculateProductsAnalytics(productsData, productSort === "most");
            const productsColumns = [
                { header: 'Producto', accessor: (row) => row.producto },
                { header: 'Total Vendido', accessor: (row) => row.total }
            ];

            const productSortText = productSort === "most" ? "mas_vendidos" : "menos_vendidos";
            const fileName = `Productos_${productSortText}`;
            
            exportToPDF(productsData, productsColumns, fileName, productsAnalytics);
        } catch (error) {
            console.error('Error exporting products to PDF:', error);
            alert('Error al exportar productos PDF. Por favor, inténtelo de nuevo.');
        }
    };

    const exportProductsChartToExcel = () => {
        try {
            const productsData = config.productosVendidos || [];
            if (productsData.length === 0) {
                alert('No hay datos de productos para exportar');
                return;
            }

            const productsAnalytics = calculateProductsAnalytics(productsData, productSort === "most");
            const productsExcelData = productsData.map(item => ({
                'Producto': item.producto,
                'Total Vendido': item.total
            }));

            const productSortText = productSort === "most" ? "mas_vendidos" : "menos_vendidos";
            const fileName = `Productos_${productSortText}`;
            
            exportToExcel(productsExcelData, fileName, productsAnalytics);
        } catch (error) {
            console.error('Error exporting products to Excel:', error);
            alert('Error al exportar productos Excel. Por favor, inténtelo de nuevo.');
        }
    };

    /* Commented out - these functions are not currently used in the UI
    const exportChartsToPDF = () => {
        try {
            // Prepare data for PDF export
            const salesData = config.ventasporDias || [];
            const productsData = config.productosVendidos || [];

            if (salesData.length === 0 && productsData.length === 0) {
                alert('No hay datos para exportar');
                return;
            }

            // Calculate analytics
            const salesAnalytics = calculateSalesAnalytics(salesData);
            const productsAnalytics = calculateProductsAnalytics(productsData, productSort === "most");

            // Prepare sales data for PDF
            const salesColumns = [
                { header: 'Fecha', accessor: (row) => row.fecha },
                { header: 'Cantidad', accessor: (row) => row.total }
            ];

            // Prepare products data for PDF
            const productsColumns = [
                { header: 'Producto', accessor: (row) => row.producto },
                { header: 'Total Vendido', accessor: (row) => row.total }
            ];

            // Create filename based on current filters
            const dateRangeText = dateRange === "Elegir rango" 
                ? `${startDate.toLocaleDateString('es-ES').replace(/\//g, '-')}_a_${endDate.toLocaleDateString('es-ES').replace(/\//g, '-')}`
                : dateRange.replace(' ', '_');
            const productSortText = productSort === "most" ? "mas_vendidos" : "menos_vendidos";
            const fileName = `Dashboard_${dateRangeText}_${productSortText}`;
            
            // Export sales data if available
            if (salesData.length > 0) {
                exportToPDF(salesData, salesColumns, `${fileName}_Ventas`, salesAnalytics);
            }
            
            // Export products data if available
            if (productsData.length > 0) {
                setTimeout(() => {
                    exportToPDF(productsData, productsColumns, `${fileName}_Productos`, productsAnalytics);
                }, 500);
            }
                
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            alert('Error al exportar PDF. Por favor, inténtelo de nuevo.');
        }
    };

    const exportChartsToExcel = () => {
        try {
            // Prepare data for Excel export
            const salesData = config.ventasporDias || [];
            const productsData = config.productosVendidos || [];

            if (salesData.length === 0 && productsData.length === 0) {
                alert('No hay datos para exportar');
                return;
            }

            // Calculate analytics
            const salesAnalytics = calculateSalesAnalytics(salesData);
            const productsAnalytics = calculateProductsAnalytics(productsData, productSort === "most");

            // Create filename based on current filters
            const dateRangeText = dateRange === "Elegir rango" 
                ? `${startDate.toLocaleDateString('es-ES').replace(/\//g, '-')}_a_${endDate.toLocaleDateString('es-ES').replace(/\//g, '-')}`
                : dateRange.replace(' ', '_');
            const productSortText = productSort === "most" ? "mas_vendidos" : "menos_vendidos";
            const fileName = `Dashboard_${dateRangeText}_${productSortText}`;
            
            // Prepare sales data for Excel (simple object format)
            const salesExcelData = salesData.map(item => ({
                'Fecha': item.fecha,
                'Cantidad': item.total
            }));

            // Prepare products data for Excel (simple object format)
            const productsExcelData = productsData.map(item => ({
                'Producto': item.producto,
                'Total Vendido': item.total
            }));
            
            // Export sales data if available
            if (salesData.length > 0) {
                exportToExcel(salesExcelData, `${fileName}_Ventas`, salesAnalytics);
            }
            
            // Export products data if available
            if (productsData.length > 0) {
                setTimeout(() => {
                    exportToExcel(productsExcelData, `${fileName}_Productos`, productsAnalytics);
                }, 500);
            }
                
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Error al exportar Excel. Por favor, inténtelo de nuevo.');
        }
    };
    */

    useEffect(() => {
        obtenerConfiguracion()
    }, [obtenerConfiguracion])

    return (
        <>
            {/* Page Header */}
            <div style={{
                marginBottom: '2rem'
            }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <FaChartBar style={{ color: '#D946A6' }} />
                    Dashboard Analítico
                </h1>
                <p style={{
                    color: '#6B7280',
                    fontSize: '1rem',
                    margin: 0
                }}>
                    Visualiza métricas y estadísticas del sistema
                </p>
            </div>

            {/* Stats Cards */}
            <div className="row">
                <div className="col-xl-4 col-md-6 mb-4">
                    <div className="stats-card stats-primary">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6B7280', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                                    Cantidad de Ventas
                                </div>
                                <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#111827' }}>
                                    {(config.totalVentas !== undefined) ? config.totalVentas : "0"}
                                </div>
                            </div>
                            <div className="stats-card-icon icon-primary">
                                <FaShoppingCart />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-md-6 mb-4">
                    <div className="stats-card stats-secondary">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6B7280', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                                    Total Productos
                                </div>
                                <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#111827' }}>
                                    {(config.totalProductos !== undefined) ? config.totalProductos : "0"}
                                </div>
                            </div>
                            <div className="stats-card-icon icon-secondary">
                                <FaBoxOpen />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-md-6 mb-4">
                    <div className="stats-card stats-success">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6B7280', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                                    Total Categorías
                                </div>
                                <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#111827' }}>
                                    {(config.totalCategorias !== undefined) ? config.totalCategorias : "0"}
                                </div>
                            </div>
                            <div className="stats-card-icon icon-success">
                                <FaTags />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="row">
                <div className="col-12 mb-4">
                    <div className="card" style={{
                        borderRadius: '1rem',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                            padding: '1.5rem',
                            borderRadius: '1rem 1rem 0 0',
                            color: 'white'
                        }}>
                            <h5 style={{ margin: 0, fontWeight: '600', fontSize: '1.125rem' }}>
                                Filtros de Análisis
                            </h5>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div className="row align-items-end">
                                <div className="col-md-3 col-sm-6 mb-3">
                                    <label style={{
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '0.875rem',
                                        marginBottom: '0.5rem',
                                        display: 'block'
                                    }}>
                                        Rango de fechas
                                    </label>
                                    <select 
                                        className="form-control"
                                        value={dateRange}
                                        onChange={(e) => handleDateRangeChange(e.target.value)}
                                        style={{
                                            border: '2px solid #E5E7EB',
                                            borderRadius: '10px',
                                            padding: '10px 12px',
                                            fontSize: '14px',
                                            height: '42px'
                                        }}
                                    >
                                        <option value="Hoy">Hoy</option>
                                        <option value="Esta semana">Esta semana</option>
                                        <option value="Este mes">Este mes</option>
                                        <option value="Elegir rango">Elegir rango</option>
                                    </select>
                                </div>
                                
                                {showDatePicker && (
                                    <>
                                        <div className="col-md-3 col-sm-6 mb-3">
                                            <label style={{
                                                fontWeight: '600',
                                                color: '#374151',
                                                fontSize: '0.875rem',
                                                marginBottom: '0.5rem',
                                                display: 'block'
                                            }}>
                                                Fecha inicio
                                            </label>
                                            <div style={{
                                                border: '2px solid #E5E7EB',
                                                borderRadius: '10px',
                                                padding: '0'
                                            }}>
                                                <DatePicker
                                                    selected={startDate}
                                                    onChange={(date) => setStartDate(date)}
                                                    className="form-control"
                                                    dateFormat="dd/MM/yyyy"
                                                    wrapperClassName="w-100"
                                                    style={{
                                                        border: 'none',
                                                        padding: '10px 12px',
                                                        fontSize: '14px',
                                                        height: '42px',
                                                        width: '100%'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-3 col-sm-6 mb-3">
                                            <label style={{
                                                fontWeight: '600',
                                                color: '#374151',
                                                fontSize: '0.875rem',
                                                marginBottom: '0.5rem',
                                                display: 'block'
                                            }}>
                                                Fecha fin
                                            </label>
                                            <div style={{
                                                border: '2px solid #E5E7EB',
                                                borderRadius: '10px',
                                                padding: '0'
                                            }}>
                                                <DatePicker
                                                    selected={endDate}
                                                    onChange={(date) => setEndDate(date)}
                                                    className="form-control"
                                                    dateFormat="dd/MM/yyyy"
                                                    wrapperClassName="w-100"
                                                    style={{
                                                        border: 'none',
                                                        padding: '10px 12px',
                                                        fontSize: '14px',
                                                        height: '42px',
                                                        width: '100%'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                
                                <div className={showDatePicker ? "col-md-3 col-sm-6 mb-3" : "col-md-3 col-sm-6 mb-3"}>
                                    <label style={{
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '0.875rem',
                                        marginBottom: '0.5rem',
                                        display: 'block'
                                    }}>
                                        Productos
                                    </label>
                                    <select 
                                        className="form-control"
                                        value={productSort}
                                        onChange={(e) => handleProductSortChange(e.target.value)}
                                        style={{
                                            border: '2px solid #E5E7EB',
                                            borderRadius: '10px',
                                            padding: '10px 12px',
                                            fontSize: '14px',
                                            height: '42px'
                                        }}
                                    >
                                        <option value="most">Más vendidos</option>
                                        <option value="least">Menos vendidos</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="row">
                <div className="col-xl-8 col-lg-7">
                    <div className="card" style={{
                        borderRadius: '1rem',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #D946A6 0%, #A8297D 100%)',
                            padding: '1.5rem',
                            borderRadius: '1rem 1rem 0 0',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h5 style={{ margin: 0, fontWeight: '600', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaChartBar />
                                Ventas - {dateRange === "Elegir rango" ? `${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}` : dateRange}
                            </h5>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                    className="btn btn-sm"
                                    onClick={exportSalesChartToPDF}
                                    title="Exportar ventas a PDF"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.375rem 0.875rem',
                                        borderRadius: '0.375rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem'
                                    }}
                                >
                                    <FaFilePdf />PDF
                                </button>
                                <button 
                                    className="btn btn-sm"
                                    onClick={exportSalesChartToExcel}
                                    title="Exportar ventas a Excel"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.375rem 0.875rem',
                                        borderRadius: '0.375rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem'
                                    }}
                                >
                                    <FaFileExcel />Excel
                                </button>
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{height:350}}>
                                <Bar options={optionsBar} data={dataBar} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-4 col-lg-5">
                    <div className="card" style={{
                        borderRadius: '1rem',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            padding: '1.5rem',
                            borderRadius: '1rem 1rem 0 0',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h5 style={{ margin: 0, fontWeight: '600', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaChartPie />
                                Productos {productSort === "most" ? "más vendidos" : "menos vendidos"}
                            </h5>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                    className="btn btn-sm"
                                    onClick={exportProductsChartToPDF}
                                    title="Exportar productos a PDF"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.375rem 0.875rem',
                                        borderRadius: '0.375rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem'
                                    }}
                                >
                                    <FaFilePdf />PDF
                                </button>
                                <button 
                                    className="btn btn-sm"
                                    onClick={exportProductsChartToExcel}
                                    title="Exportar productos a Excel"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.375rem 0.875rem',
                                        borderRadius: '0.375rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem'
                                    }}
                                >
                                    <FaFileExcel />Excel
                                </button>
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ height: 350 }}>
                                <Doughnut options={optionsDonut} data={dataDonut} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DashBoard;