import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import FormularioEnvio from './FormularioEnvio';
import AdminPanel from './AdminPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('videos');
  const [view, setView] = useState('publico'); // 'publico' ou 'admin'
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verifica a sessão ao carregar a página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_OUT') {
        setView('publico');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Função para fazer Logout de forma segura
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('publico');
  };

  // -------------------------------------------------------------------------
  // RECORTE 1: TELA DO ADMINISTRADOR (Totalmente isolada do resto do site)
  // -------------------------------------------------------------------------
  if (view === 'admin') {
    return (
      <div style={{ backgroundColor: '#111827', minHeight: '100vh', color: '#fff' }}>
        {/* Barra Superior do Admin com o Botão Sair */}
        <div style={{
          backgroundColor: '#1f2937',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #374151'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#10b981' }}>⚙️ Painel de Controle Agroecológico</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => setView('publico')}
              style={{ backgroundColor: '#374151', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
            >
              🏠 Ver Site Antigo
            </button>
            <button
              onClick={handleLogout}
              style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
            >
              🚪 Sair do Admin
            </button>
          </div>
        </div>

        {/* Renderiza o seu componente AdminPanel original */}
        {user && user.email === 'paulet.ana1@gmail.com' ? (
          <AdminPanel setView={setView} />
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem' }}>
            <h2>Acesso Restrito 🛑</h2>
            <p>Seu e-mail não possui privilégios de administrador.</p>
            <button onClick={() => setView('publico')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Voltar para a Home</button>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RECORTE 2: TELA PÚBLICA (Só aparece se view === 'publico')
  // -------------------------------------------------------------------------
  return (
    <div style={{ backgroundColor: '#f4f7f5', minHeight: '100vh' }}>

      {/* Banner Principal */}
      <header style={{
        backgroundImage: "linear-gradient(rgba(26, 74, 31, 0.2), rgba(26, 74, 31, 0.2)), url('/fundo-hero1.jpeg')",
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundColor: '#e3ece4',
        color: '#ffffff',
        padding: '2rem 0',
        textAlign: 'center',
        minHeight: '150px'
      }}>
        <div className="container">
          <h1 style={{ fontWeight: 'bold', visibility: 'hidden' }}>🌱 Aplicação Agroecológica</h1>
        </div>
      </header>

      {/* Barra de Menu Principal */}
      <nav style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', padding: '0.5rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap' }}>

          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', whiteSpace: 'nowrap', flex: 1 }}>
            <button onClick={() => setActiveTab('videos')} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', borderBottom: activeTab === 'videos' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'videos' ? 'bold' : 'normal', cursor: 'pointer' }}>🎬 Vídeos</button>
            <button onClick={() => setActiveTab('artigos')} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', borderBottom: activeTab === 'artigos' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'artigos' ? 'bold' : 'normal', cursor: 'pointer' }}>📄 Artigos & PDFs</button>
            <button onClick={() => setActiveTab('textos')} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', borderBottom: activeTab === 'textos' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'textos' ? 'bold' : 'normal', cursor: 'pointer' }}>📰 Textos & Notícias</button>
            <button onClick={() => setActiveTab('galeria')} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', borderBottom: activeTab === 'galeria' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'galeria' ? 'bold' : 'normal', cursor: 'pointer' }}>🖼️ Galeria</button>
            <a href="#enviar" style={{ padding: '10px', color: '#1a4a1f', fontWeight: 'bold', textDecoration: 'none' }}>📥 Enviar Conteúdo</a>
          </div>

          {/* Botão Admin no menu */}
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem' }}>
            {user && user.email === 'paulet.ana1@gmail.com' ? (
              <button
                onClick={() => setView('admin')}
                style={{ background: 'none', border: 'none', color: '#1a4a1f', fontWeight: '600', cursor: 'pointer' }}
              >
                ⚙️ Entrar no Admin
              </button>
            ) : (
              <button
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: window.location.origin }
                  });
                  if (error) console.error('Erro ao fazer login:', error.message);
                }}
                style={{ backgroundColor: 'transparent', color: '#1a4a1f', border: 'none', padding: '8px 16px', fontWeight: '600', cursor: 'pointer' }}
              >
                🔒 Admin
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* Conteúdo Dinâmico Público */}
      <main className="container" style={{ padding: '2rem 1rem' }}>
        {activeTab === 'videos' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ backgroundColor: '#e2eee3', color: '#1a4a1f', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Aulas</span>
              <h3 style={{ marginTop: '1rem', fontSize: '1.3rem', color: '#333' }}>Introdução à Agroecologia e Sistemas Sintrópicos</h3>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>Entenda os conceitos fundamentais para iniciar o manejo sustentável.</p>
            </div>
          </div>
        )}

        {activeTab === 'artigos' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>PDF</span>
              <h3 style={{ marginTop: '1rem', fontSize: '1.3rem', color: '#333' }}>Cartilha de Defensivos Naturais</h3>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>Guia prático de receitas para controle de pragas orgânico.</p>
            </div>
          </div>
        )}

        {activeTab === 'textos' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Notícias</span>
              <h3 style={{ marginTop: '1rem', fontSize: '1.3rem', color: '#333' }}>O Avanço da Agricultura Familiar</h3>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>Confira as últimas novidades sobre políticas de incentivo na região.</p>
            </div>
          </div>
        )}

        {activeTab === 'galeria' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#e5e7eb', height: '150px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>🖼️ Foto do Mutirão</div>
              <p style={{ marginTop: '0.5rem', fontWeight: '500', color: '#333' }}>Preparação do Solo Orgânico</p>
            </div>
          </div>
        )}
      </main>

      {/* Formulário de Envio (Apenas na Home Pública) */}
      <section id="enviar" style={{ backgroundColor: '#ffffff', padding: '3rem 0', marginTop: '2rem' }}>
        <div className="container">
          <FormularioEnvio />
        </div>
      </section>

    </div>
  );
}