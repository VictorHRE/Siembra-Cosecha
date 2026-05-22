import { useState } from "react";
import { useContext, useEffect } from "react";
import { UserContext } from "../context/UserProvider";
import { FaUser, FaEnvelope, FaUserTag, FaClock } from "react-icons/fa";

const modelo = {
    nombre: "",
    correo: "",
    idRolNavigation: {
        descripcion :""
    }
}

const Inicio = () => {

    const { user } = useContext(UserContext)
    const [ dataUser, setDataUser ] = useState(modelo)
    const [ currentTime, setCurrentTime ] = useState(new Date())

    useEffect(() => {
        let dt = JSON.parse(user)
        setDataUser(dt)
    }, [user])

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const getGreeting = () => {
        const hour = currentTime.getHours()
        if (hour < 12) return "Buenos días"
        if (hour < 19) return "Buenas tardes"
        return "Buenas noches"
    }

    const formatDate = () => {
        return currentTime.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    }

    const formatTime = () => {
        // Nicaragua timezone (UTC-6)
        const nicaraguaTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'America/Managua' }))
        return nicaraguaTime.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
        })
    }

    return (
        <div>
            {/* Header Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #D946A6 0%, #A8297D 100%)',
                borderRadius: '1rem',
                padding: '3rem 2rem',
                marginBottom: '2rem',
                color: 'white',
                boxShadow: '0 10px 30px rgba(217, 70, 166, 0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '-30px',
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)'
                }}></div>
                
                <div className="row align-items-center" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="col-md-8">
                        <h1 style={{ 
                            fontSize: '2.5rem', 
                            fontWeight: '700',
                            marginBottom: '0.5rem'
                        }}>
                            {getGreeting()}, {dataUser.nombre}
                        </h1>
                        <p style={{ 
                            fontSize: '1.125rem', 
                            marginBottom: '0',
                            opacity: 0.95
                        }}>
                            Bienvenido al Sistema de Gestión - Siembras & Cosechas
                        </p>
                    </div>
                    <div className="col-md-4 text-right">
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem', opacity: 0.9 }}>
                                <FaClock style={{ marginRight: '0.5rem' }} />
                                {formatDate()}
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                                {formatTime()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Card */}
            <div className="row">
                <div className="col-lg-4 col-md-5">
                    <div className="card" style={{
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                            padding: '2rem',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                margin: '0 auto',
                                borderRadius: '50%',
                                border: '4px solid white',
                                overflow: 'hidden',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
                            }}>
                                <img 
                                    src={"./imagen/Foto003.jpg"} 
                                    alt="Profile" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <h3 style={{ 
                                color: 'white', 
                                fontWeight: '600',
                                marginTop: '1rem',
                                marginBottom: '0'
                            }}>
                                {dataUser.nombre}
                            </h3>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '1rem'
                            }}>
                                <span style={{
                                    display: 'inline-block',
                                    background: 'linear-gradient(135deg, #D946A6 0%, #A8297D 100%)',
                                    color: 'white',
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '2rem',
                                    fontWeight: '600',
                                    fontSize: '0.875rem'
                                }}>
                                    {dataUser.idRolNavigation.descripcion}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8 col-md-7">
                    <div className="card" style={{
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        border: 'none'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #D946A6 0%, #A8297D 100%)',
                            color: 'white',
                            padding: '1.5rem',
                            borderRadius: '1rem 1rem 0 0'
                        }}>
                            <h4 style={{ margin: 0, fontWeight: '600' }}>
                                <FaUser style={{ marginRight: '0.75rem' }} />
                                Información del Perfil
                            </h4>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1.25rem',
                                    background: '#F9FAFB',
                                    borderRadius: '0.75rem',
                                    marginBottom: '1rem',
                                    borderLeft: '4px solid #D946A6'
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '0.5rem',
                                        background: 'linear-gradient(135deg, #F0A5D9 0%, #D946A6 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '1rem',
                                        color: '#A8297D',
                                        fontSize: '1.25rem'
                                    }}>
                                        <FaUser />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            color: '#6B7280',
                                            fontWeight: '600',
                                            letterSpacing: '0.5px',
                                            marginBottom: '0.25rem'
                                        }}>
                                            Nombre Completo
                                        </div>
                                        <div style={{
                                            fontSize: '1rem',
                                            color: '#111827',
                                            fontWeight: '500'
                                        }}>
                                            {dataUser.nombre}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1.25rem',
                                    background: '#F9FAFB',
                                    borderRadius: '0.75rem',
                                    marginBottom: '1rem',
                                    borderLeft: '4px solid #10B981'
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '0.5rem',
                                        background: 'linear-gradient(135deg, #6EE7B7 0%, #10B981 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '1rem',
                                        color: '#047857',
                                        fontSize: '1.25rem'
                                    }}>
                                        <FaEnvelope />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            color: '#6B7280',
                                            fontWeight: '600',
                                            letterSpacing: '0.5px',
                                            marginBottom: '0.25rem'
                                        }}>
                                            Correo Electrónico
                                        </div>
                                        <div style={{
                                            fontSize: '1rem',
                                            color: '#111827',
                                            fontWeight: '500'
                                        }}>
                                            {dataUser.correo}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1.25rem',
                                    background: '#F9FAFB',
                                    borderRadius: '0.75rem',
                                    borderLeft: '4px solid #F59E0B'
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '0.5rem',
                                        background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '1rem',
                                        color: '#D97706',
                                        fontSize: '1.25rem'
                                    }}>
                                        <FaUserTag />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            color: '#6B7280',
                                            fontWeight: '600',
                                            letterSpacing: '0.5px',
                                            marginBottom: '0.25rem'
                                        }}>
                                            Rol en el Sistema
                                        </div>
                                        <div style={{
                                            fontSize: '1rem',
                                            color: '#111827',
                                            fontWeight: '500'
                                        }}>
                                            {dataUser.idRolNavigation.descripcion}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                background: 'linear-gradient(135deg, rgba(217, 70, 166, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                                padding: '1.5rem',
                                borderRadius: '0.75rem',
                                textAlign: 'center'
                            }}>
                                <p style={{
                                    color: '#6B7280',
                                    fontSize: '0.95rem',
                                    marginBottom: '0',
                                    lineHeight: '1.6'
                                }}>
                                    Utiliza el menú de navegación para acceder a las diferentes funcionalidades del sistema
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        )
}

export default Inicio;