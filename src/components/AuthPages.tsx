import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, Zap } from 'lucide-react'

interface AuthPagesProps {
    onAuthSuccess: () => void
}

type AuthView = 'login' | 'register' | 'forgot-password'

export default function AuthPages({ onAuthSuccess }: AuthPagesProps) {
    const [view, setView] = useState<AuthView>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const { signIn, signUp, resetPassword } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            if (view === 'login') {
                const { error } = await signIn(email, password)
                if (error) {
                    setError(error.message === 'Invalid login credentials'
                        ? 'Email o contraseña incorrectos'
                        : error.message)
                } else {
                    onAuthSuccess()
                }
            } else if (view === 'register') {
                if (password.length < 6) {
                    setError('La contraseña debe tener al menos 6 caracteres')
                    setLoading(false)
                    return
                }
                const { error } = await signUp(email, password, fullName)
                if (error) {
                    setError(error.message)
                } else {
                    setSuccess('¡Cuenta creada! Revisa tu email para confirmar.')
                }
            } else if (view === 'forgot-password') {
                const { error } = await resetPassword(email)
                if (error) {
                    setError(error.message)
                } else {
                    setSuccess('Te enviamos un email para restablecer tu contraseña.')
                }
            }
        } catch (err) {
            setError('Ocurrió un error. Intenta de nuevo.')
        }

        setLoading(false)
    }

    return (
        <div className="auth-container">
            <div className="auth-left">
                <div className="auth-brand">
                    <div className="brand-icon">
                        <Zap size={32} />
                    </div>
                    <h1>El Inge : <span>Smart Grids</span></h1>
                </div>

                <div className="auth-hero">
                    <h2>Gestiona tus proyectos eléctricos de forma inteligente</h2>
                    <p>Cálculos precisos, presupuestos profesionales y gestión de clientes en una sola plataforma.</p>

                    <div className="feature-list">
                        <div className="feature-item">
                            <CheckCircle size={20} />
                            <span>Calculadora eléctrica profesional</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircle size={20} />
                            <span>Generador de presupuestos PDF</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircle size={20} />
                            <span>Gestión de clientes y proyectos</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircle size={20} />
                            <span>Reportes y estadísticas</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-card">
                    <div className="auth-header">
                        <h3>
                            {view === 'login' && 'Bienvenido de vuelta'}
                            {view === 'register' && 'Crear cuenta'}
                            {view === 'forgot-password' && 'Recuperar contraseña'}
                        </h3>
                        <p>
                            {view === 'login' && 'Ingresa tus credenciales para continuar'}
                            {view === 'register' && 'Completa los datos para registrarte'}
                            {view === 'forgot-password' && 'Te enviaremos un email para recuperar tu contraseña'}
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <CheckCircle size={18} />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {view === 'register' && (
                            <div className="form-group">
                                <label>Nombre completo</label>
                                <div className="input-wrapper">
                                    <User size={18} />
                                    <input
                                        type="text"
                                        placeholder="Tu nombre"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Correo electrónico</label>
                            <div className="input-wrapper">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {view !== 'forgot-password' && (
                            <div className="form-group">
                                <label>Contraseña</label>
                                <div className="input-wrapper">
                                    <Lock size={18} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        )}

                        {view === 'login' && (
                            <button
                                type="button"
                                className="forgot-link"
                                onClick={() => {
                                    setView('forgot-password')
                                    setError('')
                                    setSuccess('')
                                }}
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        )}

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                <>
                                    {view === 'login' && 'Iniciar sesión'}
                                    {view === 'register' && 'Crear cuenta'}
                                    {view === 'forgot-password' && 'Enviar email'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        {view === 'login' && (
                            <p>
                                ¿No tienes cuenta?{' '}
                                <button onClick={() => {
                                    setView('register')
                                    setError('')
                                    setSuccess('')
                                }}>
                                    Regístrate gratis
                                </button>
                            </p>
                        )}
                        {view === 'register' && (
                            <p>
                                ¿Ya tienes cuenta?{' '}
                                <button onClick={() => {
                                    setView('login')
                                    setError('')
                                    setSuccess('')
                                }}>
                                    Inicia sesión
                                </button>
                            </p>
                        )}
                        {view === 'forgot-password' && (
                            <p>
                                <button onClick={() => {
                                    setView('login')
                                    setError('')
                                    setSuccess('')
                                }}>
                                    ← Volver al login
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        .auth-container {
          display: flex;
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .auth-left {
          flex: 1;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 60px;
        }

        .brand-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .auth-brand h1 {
          font-size: 28px;
          font-weight: 700;
        }

        .auth-brand h1 span {
          color: var(--accent-blue);
        }

        .auth-hero h2 {
          font-size: 42px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #fff, #94A3B8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .auth-hero p {
          font-size: 18px;
          color: var(--text-secondary);
          margin-bottom: 40px;
          max-width: 500px;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--accent-green);
          font-weight: 500;
        }

        .feature-item span {
          color: var(--text-primary);
        }

        .auth-right {
          width: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .auth-card {
          width: 100%;
          max-width: 400px;
        }

        .auth-header {
          margin-bottom: 32px;
        }

        .auth-header h3 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .auth-header p {
          color: var(--text-secondary);
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--accent-red);
        }

        .alert-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--accent-green);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 14px 16px;
          transition: all 0.2s ease;
        }

        .input-wrapper:focus-within {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-wrapper svg {
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .input-wrapper input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 15px;
          outline: none;
        }

        .input-wrapper input::placeholder {
          color: var(--text-secondary);
        }

        .forgot-link {
          display: block;
          background: none;
          border: none;
          color: var(--accent-blue);
          font-size: 14px;
          cursor: pointer;
          text-align: right;
          width: 100%;
          margin-bottom: 24px;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .btn-submit {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          background: linear-gradient(135deg, #3B82F6, #2563EB);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 24px;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-footer {
          margin-top: 32px;
          text-align: center;
        }

        .auth-footer p {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .auth-footer button {
          background: none;
          border: none;
          color: var(--accent-blue);
          font-weight: 600;
          cursor: pointer;
        }

        .auth-footer button:hover {
          text-decoration: underline;
        }

        @media (max-width: 1024px) {
          .auth-left {
            display: none;
          }

          .auth-right {
            width: 100%;
          }
        }
      `}</style>
        </div>
    )
}
