import React, { useState, useRef } from 'react'
import {
  Zap, Shield, BarChart3, Users, ChevronRight, PlayCircle, Star,
  CheckCircle2, Monitor, Building2, Calculator, Layout,
  FileText, ShieldCheck, Check
} from 'lucide-react'

const Landing = ({ onEnter }: { onEnter: () => void }) => {
  const [progress, setProgress] = useState(50)
  const heroRef = useRef<HTMLDivElement>(null)

  return (
    <div className="landing-page">
      {/* Premium Navbar */}
      <nav className="navbar">
        <div className="logo">
          <Zap className="logo-icon" />
          <span>El Inge : <span className="smart-grids-text">Smart Grids</span></span>
        </div>
        <div className="nav-links">
          <a href="#features">Características</a>
          <a href="#pricing">Planes</a>
          <a href="#testimonials">Testimonios</a>
          <div className="btn-secondary" onClick={onEnter} style={{ padding: '8px 20px', fontSize: '14px' }}>Log In</div>
        </div>
      </nav>

      {/* Dynamic Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-glow"></div>
        <div className="hero-visual">
          <div className="glass-orbit">
            <div className="visual-image-container software-bg">
              <div className="hero-dashboard-mockup">
                <div className="mockup-sidebar">
                  <div className="s-icon active"><Monitor size={14} /></div>
                  <div className="s-icon"><Zap size={14} /></div>
                  <div className="s-icon"><FileText size={14} /></div>
                </div>
                <div className="mockup-content">
                  <div className="m-nav"><span>Dashboard</span> / <span>Iluminación</span></div>
                  <div className="m-grid">
                    <div className="m-card glass">
                      <div className="m-c-header">Intensidad</div>
                      <div className="m-c-val">450 Lux</div>
                    </div>
                    <div className="m-card glass">
                      <div className="m-c-header">Uniformidad</div>
                      <div className="m-c-val">0.82</div>
                    </div>
                  </div>
                  <div className="m-chart glass">
                    <div className="chart-bar" style={{ height: '40%' }}></div>
                    <div className="chart-bar" style={{ height: '70%' }}></div>
                    <div className="chart-bar" style={{ height: '55%' }}></div>
                    <div className="chart-bar" style={{ height: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="visual-image-container delivery-bg" style={{ clipPath: `inset(0 0 0 ${progress}%)` }}>
              <img
                src="/images/lighting_project.png"
                alt="Lighting Project Visualization"
                className="hero-main-image"
              />
            </div>
          </div>
          <div className="story-stepper">
            <div className="transition-label">Cálculo</div>
            <div className="step-line">
              <div className="step-fill" style={{ width: `${progress}%` }}></div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="step-slider"
              />
            </div>
            <div className="transition-label">Entrega</div>
          </div>
        </div>

        <div className="hero-content">
          <div className="badge">
            <Zap size={14} />
            <span>Nueva Versión 2.0 disponible</span>
          </div>
          <h1 className="hero-title">
            Diseña el <span className="gradient-text">Futuro</span> de la Energía
          </h1>
          <p className="hero-subtitle">
            La plataforma líder para ingenieros eléctricos. Optimiza tus diseños,
            automatiza cálculos y gestiona obras con precisión milimétrica.
          </p>
          <div className="cta-group">
            <button className="btn-primary" onClick={onEnter}>
              Empezar Ahora <ChevronRight size={18} />
            </button>
            <button className="btn-secondary">
              <PlayCircle size={18} /> Ver Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-header">
          <h2 className="section-title">Visualiza cada <span className="gradient-text">Detalle</span></h2>
          <p className="section-subtitle">Panel de control unificado para tus cálculos y seguimientos.</p>
        </div>
        <div className="features-grid-recreate">
          {[
            { title: 'Calculadora Eléctrica', desc: 'Calcula secciones de cables y caídas de tensión según normativa.', icon: <Calculator size={24} />, color: '#3B82F6' },
            { title: 'Gestión de Planos', desc: 'Organiza y visualiza tus esquemas unifilares en la nube.', icon: <Layout size={24} />, color: '#8B5CF6' },
            { title: 'Informes Técnicos', desc: 'Genera memorias técnicas y certificaciones en segundos.', icon: <FileText size={24} />, color: '#EC4899' },
            { title: 'Colaboración', desc: 'Trabaja en equipo con roles y permisos personalizados.', icon: <Users size={24} />, color: '#10B981' },
            { title: 'Análisis de Costes', desc: 'Control integral de materiales y presupuestos de obra.', icon: <BarChart3 size={24} />, color: '#F59E0B' },
            { title: 'Seguridad Legal', desc: 'Validación automática según el REBT y normativas locales.', icon: <ShieldCheck size={24} />, color: '#6366F1' }
          ].map((f, i) => (
            <div key={i} className="feature-card-sharp glass">
              <div className="icon-box" style={{ background: `${f.color}20`, color: f.color }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section" id="pricing">
        <div className="section-header">
          <h2 className="section-title">Planes para tu <span className="gradient-text">Éxito</span></h2>
          <p className="section-subtitle">Escala tu negocio con el soporte que mereces.</p>
        </div>
        <div className="pricing-grid-sharp">
          <div className="pricing-card-sharp glass">
            <h3>Starter</h3>
            <div className="price">$0<span>/siempre</span></div>
            <ul className="p-features">
              <li><Check size={14} className="check" /> 5 proyectos activos</li>
              <li><Check size={14} className="check" /> Cálculos básicos</li>
              <li><Check size={14} className="check" /> Exportación PDF</li>
            </ul>
            <button className="btn-p-action-outline" onClick={onEnter}>Empezar Gratis</button>
          </div>
          <div className="pricing-card-sharp glass featured">
            <div className="popular-badge">Más Popular</div>
            <h3>Professional</h3>
            <div className="price">$30<span>/mes</span></div>
            <ul className="p-features">
              <li><Check size={14} className="check" /> Proyectos ilimitados</li>
              <li><Check size={14} className="check" /> Colaboración en equipo</li>
              <li><Check size={14} className="check" /> Gestión de presupuestos</li>
              <li><Check size={14} className="check" /> Soporte prioritario</li>
            </ul>
            <button className="btn-p-action-gradient" onClick={onEnter}>Probar Pro</button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" id="testimonials">
        <div className="section-header">
          <h2 className="section-title">Lo que dicen los <span className="gradient-text">Expertos</span></h2>
        </div>
        <div className="testimonials-grid-sharp">
          {[
            { name: 'Carlos R.', role: 'Instalador', text: 'Tripliqué mi productividad con los cálculos automáticos.', avatar: 'CR' },
            { name: 'María G.', role: 'Ingeniera', text: 'La mejor herramienta para cumplir normativas sin errores.', avatar: 'MG' },
            { name: 'Antonio M.', role: 'Director', text: 'Gestionar 20 obras a la vez ahora es posible.', avatar: 'AM' }
          ].map((t, i) => (
            <div key={i} className="testimonial-card-sharp glass">
              <div className="stars">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="#F59E0B" color="#F59E0B" />)}
              </div>
              <p className="t-text">"{t.text}"</p>
              <div className="t-user">
                <div className="t-avatar">{t.avatar}</div>
                <div className="t-info">
                  <h4>{t.name}</h4>
                  <p>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="logo">
              <Zap className="logo-icon" />
              <span>El Inge : <span className="smart-grids-text">Smart Grids</span></span>
            </div>
            <p>La plataforma inteligente para el ingeniero eléctrico moderno.</p>
          </div>
          <div className="footer-links">
            <div className="f-col">
              <h4>Producto</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Precios</a>
            </div>
            <div className="f-col">
              <h4>Empresa</h4>
              <a href="#">Sobre nosotros</a>
              <a href="#">Contacto</a>
            </div>
            <div className="f-col">
              <h4>Legal</h4>
              <a href="#">Privacidad</a>
              <a href="#">Términos</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 El Inge : Smart Grids. Todos los derechos reservados.</p>
        </div>
      </footer>

      <style>{`
        .landing-page {
          min-height: 100vh;
          background: #020617;
          color: white;
          font-family: 'Inter', sans-serif;
        }
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10%;
          background: rgba(2, 6, 23, 0.82);
          backdrop-filter: blur(12px);
          z-index: 1000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 20px; }
        .logo-icon { color: #3B82F6; }
        .smart-grids-text { font-weight: 400; opacity: 0.6; }
        .nav-links { display: flex; align-items: center; gap: 30px; }
        .nav-links a { text-decoration: none; color: rgba(255,255,255,0.7); font-size: 14px; transition: 0.3s; }
        .nav-links a:hover { color: white; }
        
        .hero-glow {
          position: absolute;
          top: -10%;
          left: -10%;
          width: 50%;
          height: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
          filter: blur(80px);
          z-index: -1;
          pointer-events: none;
        }
        
        .hero-section {
          padding: 160px 10% 100px;
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 60px;
          align-items: flex-start;
          position: relative;
        }
        .hero-title { font-size: 72px; font-weight: 900; line-height: 1.1; margin-bottom: 24px; margin-top: -10px; }
        .gradient-text { background: linear-gradient(135deg, #60A5FA, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-subtitle { font-size: 20px; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 40px; }
        
        .btn-primary { background: #3B82F6; color: white; padding: 16px 32px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 10px; }
        .btn-secondary { background: rgba(255,255,255,0.05); color: white; padding: 16px 32px; border-radius: 12px; font-weight: 600; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; display: flex; align-items: center; gap: 10px; }
        
        .hero-visual { position: relative; padding-top: 10px; }
        .glass-orbit { width: 100%; height: 400px; border-radius: 32px; overflow: hidden; position: relative; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 40px 100px rgba(0,0,0,0.5); }
        .visual-image-container { position: absolute; inset: 0; }
        .hero-main-image { width: 100%; height: 100%; object-fit: cover; }
        
        .hero-dashboard-mockup { width: 100%; height: 100%; background: #0f172a; display: flex; }
        .mockup-sidebar { width: 50px; background: #1e293b; display: flex; flex-direction: column; gap: 15px; padding: 20px 0; align-items: center; }
        .s-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.2); }
        .s-icon.active { background: #3B82F6; color: white; }
        .mockup-content { flex: 1; padding: 30px; display: flex; flex-direction: column; gap: 20px; }
        .m-nav { font-size: 10px; opacity: 0.3; }
        .m-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .m-card { padding: 20px; border-radius: 16px; background: rgba(255,255,255,0.03); }
        .m-c-header { font-size: 10px; opacity: 0.5; margin-bottom: 5px; }
        .m-c-val { font-size: 24px; font-weight: 800; color: #3B82F6; }
        .m-chart { flex: 1; display: flex; align-items: flex-end; gap: 10px; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 16px; }
        .chart-bar { flex: 1; background: linear-gradient(0deg, #3B82F6, #8B5CF6); border-radius: 6px 6px 0 0; }
        
        .story-stepper { margin-top: 30px; display: flex; align-items: center; gap: 20px; }
        .step-line { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; position: relative; }
        .step-fill { position: absolute; height: 100%; background: #3B82F6; border-radius: 3px; }
        .step-slider { position: absolute; width: 100%; top: -10px; opacity: 0; cursor: pointer; }
        .transition-label { font-size: 12px; font-weight: 800; color: #3B82F6; text-transform: uppercase; letter-spacing: 1px; }

        .features-section, .pricing-section, .testimonials-section { padding: 100px 10%; text-align: center; }
        .section-title { font-size: 48px; font-weight: 900; margin-bottom: 20px; }
        .section-subtitle { color: rgba(255,255,255,0.5); font-size: 18px; margin-bottom: 60px; }
        .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; }
        
        .features-grid-recreate { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .feature-card-sharp { padding: 40px; text-align: left; transition: 0.3s; }
        .feature-card-sharp:hover { transform: translateY(-10px); background: rgba(255,255,255,0.05); }
        .icon-box { width: 60px; height: 60px; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
        .feature-card-sharp h3 { font-size: 20px; margin-bottom: 12px; }
        .feature-card-sharp p { font-size: 15px; opacity: 0.6; line-height: 1.6; }
        
        .pricing-grid-sharp { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 400px)); gap: 30px; justify-content: center; }
        .pricing-card-sharp { padding: 50px; text-align: left; position: relative; }
        .pricing-card-sharp.featured { border: 2px solid #3B82F6; background: rgba(59, 130, 246, 0.05); transform: scale(1.05); }
        .popular-badge { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: #3B82F6; padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 800; }
        .price { font-size: 48px; font-weight: 900; margin-top: 15px; }
        .price span { font-size: 16px; opacity: 0.5; font-weight: 400; }
        .p-features { list-style: none; padding: 0; margin: 30px 0; }
        .p-features li { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; font-size: 14px; opacity: 0.8; }
        .check { color: #10B981; }
        .btn-p-action-outline { width: 100%; padding: 16px; border-radius: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: white; cursor: pointer; }
        .btn-p-action-gradient { width: 100%; padding: 16px; border-radius: 12px; background: #3B82F6; border: none; color: white; font-weight: 700; cursor: pointer; }

        .testimonials-grid-sharp { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .testimonial-card-sharp { padding: 30px; text-align: left; }
        .t-text { font-style: italic; opacity: 0.7; margin: 20px 0; line-height: 1.6; }
        .t-user { display: flex; align-items: center; gap: 15px; }
        .t-avatar { width: 44px; height: 44px; border-radius: 50%; background: #3B82F6; display: flex; align-items: center; justify-content: center; font-weight: 800; }
        .t-info h4 { font-size: 15px; margin: 0; }
        .t-info p { font-size: 12px; opacity: 0.5; margin: 2px 0 0; }

        .landing-footer { padding: 80px 10% 40px; border-top: 1px solid rgba(255,255,255,0.05); background: #010413; }
        .footer-main { display: flex; justify-content: space-between; margin-bottom: 60px; }
        .footer-links { display: flex; gap: 60px; }
        .f-col h4 { font-size: 14px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .f-col a { display: block; color: rgba(255,255,255,0.5); text-decoration: none; margin-bottom: 12px; font-size: 14px; }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 40px; color: rgba(255,255,255,0.3); font-size: 12px; }

        @media (max-width: 968px) {
          .hero-section { grid-template-columns: 1fr; }
          .hero-title { font-size: 44px; }
        }
      `}</style>
    </div>
  )
}

export default Landing
