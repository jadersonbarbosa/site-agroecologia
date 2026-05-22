import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import FormularioEnvio from './FormularioEnvio';
import AdminPanel from './AdminPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('videos');
  const [view, setView] = useState('publico'); // 'publico' ou 'admin'
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verifica sessão ao carregar a página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Função para fazer Logout de forma segura
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('publico');
  };

  return (
    <div style={{ backgroundColor: '#f4f7f5', minHeight: '100vh' }}>

      {/* Banner Principal com a Imagem de Fundo Ajustada */}
      <header style={{
        backgroundImage: "linear-gradient(rgba(26, 74, 31, 0.2), rgba(26, 74, 31, 0.2)), url('/fundo-hero1.jpeg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundColor: '#e3ece4',
        color: '#ffffff',
        padding: '8rem 0',
        textAlign: 'center',
        minHeight: '250px'
      }}>
        <div className="container">
          <h1 style={{ fontWeight: 'bold', visibility: 'hidden' }}>🌱 Aplicação Agroecológica</h1>
        </div>
      </header>

      {/* Barra de Menu Principal */}
      <nav style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', padding: '0.5rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap' }}>

          {/* Abas de Navegação (Só aparecem se não estiver na tela admin) */}
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', whiteSpace: 'nowrap', flex: 1 }}>
            <button onClick={() => { setView('publico'); setActiveTab('videos'); }} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', borderBottom: view === 'publico' && activeTab === 'videos' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'videos' && view === 'publico' ? 'bold' : 'normal', cursor: 'pointer' }}>🎬 Vídeos</button>
            <button onClick={() => { setView('publico'); setActiveTab('artigos'); }} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', borderBottom: view === 'publico' && activeTab === 'artigos' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'artigos' && view === 'publico' ? 'bold' : 'normal', cursor: 'pointer' }}>📄 Artigos & PDFs</button>
            <button onClick={() => { setView('publico'); setActiveTab('textos'); }} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', borderBottom: view === 'publico' && activeTab === 'textos' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'textos' && view === 'publico' ? 'bold' : 'normal', cursor: 'pointer' }}>📰 Textos & Notícias</button>
            <button onClick={() => { setView('publico'); setActiveTab('galeria'); }} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', borderBottom: view === 'publico' && activeTab === 'galeria' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'galeria' && view === 'publico' ? 'bold' : 'normal', cursor: 'pointer' }}>🖼️ Galeria</button>
            <a href="#enviar" style={{ padding: '10px', color: '#1a4a1f', fontWeight: 'bold', textDecoration: 'none' }}>📥 Enviar Conteúdo</a>
          </div>

          {/* Botão de Autenticação / Controle do Admin */}
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem', gap: '10px' }}>
            {user ? (
              <>
                {/* Se estiver logado com o e-mail correto, mostra o botão para ir ao painel */}
                {user.email === 'paulet.ana1@gmail.com' && (
                  <button
                    onClick={() => setView(view === 'admin' ? 'publico' : 'admin')}
                    style={{ background: 'none', border: 'none', color: '#1a4a1f', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {view === 'admin' ? '🏠 Ver Site' : '⚙️ Painel Admin'}
                  </button>
                )}
                {/* Botão de Sair visível para qualquer usuário logado retornar ao estado original */}
                <button
                  onClick={handleLogout}
                  style={{ backgroundColor: '#666', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Sair
                </button>
              </>
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

      {/* Área de Conteúdo Dinâmica */}
      <main className="container" style={{ padding: '2rem 1rem' }}>

        {/* SE A VIEW FOR ADMIN: Carrega o painel administrativo (Se o e-mail bater) */}
        {view === 'admin' && (
          user && user.email === 'paulet.ana1@gmail.com' ? (
            <AdminPanel setView={setView} />
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h2>Acesso Restrito 🛑</h2>
              <p>Seu e-mail não possui privilégios de administrador.</p>
              <button onClick={() => setView('publico')} style={{ backgroundColor: '#1a4a1f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Voltar para a Home</button>
            </div>
          )
        )}

        {/* SE A VIEW FOR PÚBLICA: Carrega os cards normais dependendo da aba ativa */}
        {view === 'publico' && activeTab === 'videos' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ backgroundColor: '#e2eee3', color: '#1a4a1f', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Aulas</span>
              <h3 style={{ marginTop: '1rem', fontSize: '1.3rem', color: '#333' }}>Introdução à Agroecologia e Sistemas Sintrópicos</h3>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>Entenda os conceitos fundamentais para iniciar o manejo sustentável.</p>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ backgroundColor: '#e2eee3', color: '#1a4a1f', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Práticas</span>
              <h3 style={{ marginTop: '1rem', fontSize: '1.3rem', color: '#333' }}>Manejo de Água no Semiárido</h3>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>Técnicas eficientes de captação e armazenamento de água.</p>
            </div>
          </div>
        )}

        {view === 'publico' && activeTab === 'artigos' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>PDF</span>
              <h3 style={{ marginTop: '1rem', fontSize: '1.3rem', color: '#333' }}>Cartilha de Defensivos Naturais</h3>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>Guia prático de receitas para controle de pragas orgânico.</p>
            </div>
          </div>
        )}

        {view === 'publico' && activeTab === 'textos' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Notícias</span>
              <h3 style={{ marginTop: '1rem', fontSize: '1.3rem', color: '#333' }}>O Avanço da Agricultura Familiar</h3>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>Confira as últimas novidades sobre políticas de incentivo na região.</p>
            </div>
          </div>
        )}

        {view === 'publico' && activeTab === 'galeria' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#e5e7eb', height: '150px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>🖼️ Foto do Mutirão</div>
              <p style={{ marginTop: '0.5rem', fontWeight: '500', color: '#333' }}>Preparação do Solo Orgânico</p>
            </div>
          </div>
        )}

      </main>

      {/* Formulário de Envio permanece fixo no rodapé da página pública */}
      {view === 'publico' && (
        <section id="enviar" style={{ backgroundColor: '#ffffff', padding: '3rem 0', marginTop: '2rem' }}>
          <div className="container">
            <FormularioEnvio />
          </div>
        </section>
      )}

    </div>
  );
}