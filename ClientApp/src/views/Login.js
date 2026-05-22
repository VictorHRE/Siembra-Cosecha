import { useContext, useState } from "react"
import { UserContext } from "../context/UserProvider"
import Swal from 'sweetalert2'
import { Navigate } from "react-router-dom"
import { FaEyeSlash, FaEye } from 'react-icons/fa';

const Login = () => {

    const [_correo, set_Correo] = useState("")
    const [_clave, set_Clave] = useState("")
    const { user, iniciarSession } = useContext(UserContext)
    const [visiblePassword, setVisiblePassword] = useState(false);
    const [loading, setLoading] = useState(false);

   

    if (user != null) {
        return <Navigate to="/" replace />
    }



    const handleVisiblePassword = () => {
        setVisiblePassword((preVisible) => !preVisible);
    };


    const handleSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        const request = {
            correo: _correo,
            clave:_clave
        }

        fetch("api/session/Login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(request)
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 404) {
                return response.json().then(data => Promise.reject({ status: 404, message: data.message }));
            } else if (response.status === 401) {
                return response.json().then(data => Promise.reject({ status: 401, message: data.message }));
            } else {
                return Promise.reject({ status: response.status, message: 'Error en el servidor' });
            }
        })
        .then((dataJson) => {
            setLoading(false);
            if (dataJson.idUsuario === 0) {
                Swal.fire(
                    'Opps!',
                    'No se encontro el usuario',
                    'error'
                )
            } else {
                iniciarSession(dataJson)
                // Permissions will be loaded automatically by App.js
            }

        }).catch((error) => {
            setLoading(false);
            if (error.status === 404) {
                Swal.fire(
                    'Opps!',
                    'Usuario o correo no encontrado',
                    'error'
                )
            } else if (error.status === 401) {
                Swal.fire(
                    'Opps!',
                    'Contraseña incorrecta',
                    'error'
                )
            } else {
                Swal.fire(
                    'Opps!',
                    'No se pudo iniciar sesión',
                    'error'
                )
            }
        })
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #D946A6 0%, #A8297D 50%, #F59E0B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            width: '100%'
        }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-5 col-lg-6 col-md-8">
                        <div className="card" style={{
                            border: 'none',
                            borderRadius: '1rem',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                            overflow: 'hidden'
                        }}>
                            <div className="card-body p-0">
                                {/* Logo and Welcome Section */}
                                <div style={{
                                    background: 'white',
                                    padding: '3rem 2rem 0',
                                    textAlign: 'center'
                                }}>
                                    <img 
                                        src='/Batidos-logo.png' 
                                        alt="Siembras & Cosechas" 
                                        style={{
                                            width: '160px',
                                            height: '160px',
                                            objectFit: 'contain',
                                            marginBottom: '0'
                                        }}
                                    />
                                    <h2 style={{
                                        color: '#D946A6',
                                        fontWeight: '700',
                                        fontSize: '1.75rem',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Siembras & Cosechas
                                    </h2>
                                    
                                </div>

                                {/* Login Form Section */}
                                <div style={{
                                    background: '#F9FAFB',
                                    padding: '2.5rem 2rem',
                                    paddingTop: '0'
                                }}>
                                    <h3 style={{
                                        color: '#111827',
                                        fontWeight: '600',
                                        fontSize: '1.25rem',
                                        marginBottom: '1.5rem',
                                        textAlign: 'center'
                                    }}>
                                        Iniciar Sesión
                                    </h3>
                                    
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                            <label style={{
                                                color: '#374151',
                                                fontWeight: '500',
                                                fontSize: '0.875rem',
                                                marginBottom: '0.5rem',
                                                display: 'block'
                                            }}>
                                                Correo Electrónico o Usuario
                                            </label>
                                            <input 
                                                className="form-control" 
                                                placeholder="tu@email.com"
                                                value={_correo}
                                                onChange={(e) => set_Correo(e.target.value)}
                                                required
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    fontSize: '0.95rem',
                                                    borderRadius: '0.5rem',
                                                    border: '1px solid #E5E7EB'
                                                }}
                                            />
                                        </div>
                                        
                                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                            <label style={{
                                                color: '#374151',
                                                fontWeight: '500',
                                                fontSize: '0.875rem',
                                                marginBottom: '0.5rem',
                                                display: 'block'
                                            }}>
                                                Contraseña
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <input 
                                                    type={visiblePassword ? 'text' : 'password'} 
                                                    className="form-control" 
                                                    placeholder="Tu contraseña"
                                                    value={_clave}
                                                    onChange={(e) => set_Clave(e.target.value)}
                                                    required
                                                    style={{
                                                        padding: '0.75rem 3rem 0.75rem 1rem',
                                                        fontSize: '0.95rem',
                                                        borderRadius: '0.5rem',
                                                        border: '1px solid #E5E7EB'
                                                    }}
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={handleVisiblePassword}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '12px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#9CA3AF',
                                                        cursor: 'pointer',
                                                        padding: '0.5rem',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    {visiblePassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary btn-block"
                                            disabled={loading}
                                            style={{
                                                padding: '0.875rem',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                borderRadius: '0.5rem',
                                                marginTop: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <span 
                                                        className="spinner-border spinner-border-sm" 
                                                        role="status" 
                                                        aria-hidden="true"
                                                        style={{ marginRight: '0.5rem' }}
                                                    ></span>
                                                    Cargando...
                                                </>
                                            ) : (
                                                'Ingresar al Sistema'
                                            )}
                                        </button>
                                    </form>
                                   
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login