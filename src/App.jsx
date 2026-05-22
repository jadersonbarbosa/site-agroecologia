import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient'; // O import do passo 4
import FormularioEnvio from './FormularioEnvio';
import AdminPanel from './AdminPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('videos');
  const [view, setView] = useState('publico'); // Controla se está na home ou no admin

  // 💾 PASSO 5: COLOCAR EXATAMENTE AQUI DENTRO DO COMPONENTE APP
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Pega a sessão ativa assim que o site carrega
    supabase.auth.getSession().then(({ data: { session } }) => {
      const logado = session?.user ?? null;
      setUser(logado);

      // Se detectou o admin logado ao carregar, muda a tela direto pro painel!
      if (logado && logado.email === 'paulet.ana1@gmail.com') {
        setView('admin');
      }
    });

    // Monitora se o usuário fez login ou logout em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const logado = session?.user ?? null;
      setUser(logado);

      // Se acabou de fazer login e é o admin, muda a view automaticamente
      if (_event === 'SIGNED_IN' && logado && logado.email === 'paulet.ana1@gmail.com') {
        setView('admin');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fim do Passo 5 -----------------------------------------

  // Agora vem a lógica que decide o que vai aparecer no ecrã:
  if (view === 'admin') {
    // Coloque aqui o seu e-mail do Google que configurou como administrador
    if (user && user.email === 'paulet.ana1@gmail.com') {
      return <AdminPanel setView={setView} />;
    } else {
      return (
        <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: '#f4f7f5', minHeight: '100vh' }}>
          <h2 style={{ color: '#1a4a1f' }}>Acesso Restrito 🛑</h2>
          <p>Apenas o administrador da Plataforma Agroecológica tem permissão para aceder a esta área.</p>
          <button
            onClick={() => setView('publico')}
            style={{
              backgroundColor: '#1a4a1f',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Voltar para o Início
          </button>
        </div>
      );
    }
  }

  // Se a view não for 'admin', ele continua e renderiza o HTML público normal abaixo:
  return (
    <div style={{ backgroundColor: '#f4f7f5', minHeight: '100vh' }}>

      {/* Banner Principal com a Imagem de Fundo Ajustada */}
      <header style={{
        backgroundImage: "linear-gradient(rgba(26, 74, 31, 0.25), rgba(26, 74, 31, 0.5)), url('/fundo-hero1.jpeg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        padding: '8rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontWeight: 'bold' }}>{/*🌱 Aplicação Agroecológica*/}</h1>
          <p>{/*Conhecimento compartilhado e ferramentas práticas para um mundo sustentável.*/}</p>

        </div>
      </header>

      {/* Barra de Menu com as Abas e Botão Admin Transparente */}
      <nav style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', padding: '0.5rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap' }}>

          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', whiteSpace: 'nowrap', flex: 1 }}>
            <button onClick={() => setActiveTab('videos')} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', borderBottom: activeTab === 'videos' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'videos' ? 'bold' : 'normal', cursor: 'pointer' }}>🎬 Vídeos</button>
            <button onClick={() => setActiveTab('artigos')} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', borderBottom: activeTab === 'artigos' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'artigos' ? 'bold' : 'normal', cursor: 'pointer' }}>📄 Artigos & PDFs</button>
            <button onClick={() => setActiveTab('textos')} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', borderBottom: activeTab === 'textos' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'textos' ? 'bold' : 'normal', cursor: 'pointer' }}>📰 Textos & Notícias</button>
            <button onClick={() => setActiveTab('galeria')} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', borderBottom: activeTab === 'galeria' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'galeria' ? 'bold' : 'normal', cursor: 'pointer' }}>🖼️ Galeria</button>
            <a href="#enviar" style={{ padding: '10px', color: '#1a4a1f', fontWeight: 'bold', textDecoration: 'none' }}>📥 Enviar Conteúdo</a>
          </div>

          {/* Botão Admin Disparando o Google Auth do Supabase */}
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem' }}>
            <button
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: window.location.origin }
                });
                if (error) console.error('Erro ao fazer login:', error.message);
              }}
              style={{
                backgroundColor: 'transparent',
                color: '#1a4a1f',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              🔒 Admin
            </button>
          </div>

        </div>
      </nav>

      {/* Conteúdo dos Cards */}
      {/* Conteúdo Dinâmico com base na Aba Ativa */}
      <main className="container" style={{ padding: '2rem 1rem' }}>

        {/* ABA: VÍDEOS */}
        {activeTab === 'videos' && (
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

        {/* ABA: ARTIGOS */}
        {activeTab === 'artigos' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>PDF</span>
              <h3 style={{ marginTop: '1rem', fontSize: '1.3rem', color: '#333' }}>Cartilha de Defensivos Naturais</h3>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>Baixe o guia prático de receitas para controle de pragas orgânico.</p>
            </div>
          </div>
        )}

        {/* ABA: TEXTOS */}
        {activeTab === 'textos' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Notícias</span>
              <h3 style={{ marginTop: '1rem', fontSize: '1.3rem', color: '#333' }}>O Avanço da Agricultura Familiar</h3>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>Confira as últimas novidades sobre políticas de incentivo na região.</p>
            </div>
          </div>
        )}

        {/* ABA: GALERIA */}
        {activeTab === 'galeria' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#e5e7eb', height: '150px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>🖼️ Foto do Mutirão</div>
              <p style={{ marginTop: '0.5rem', fontWeight: '500', color: '#333' }}>Preparação do Solo Orgânico</p>
            </div>
          </div>
        )}

      </main>

      {/* Formulário de Envio no Rodapé */}
      <section id="enviar" style={{ backgroundColor: '#ffffff', padding: '3rem 0', marginTop: '2rem' }}>
        <div className="container">
          <FormularioEnvio />
        </div>
      </section>

    </div>
  );
}