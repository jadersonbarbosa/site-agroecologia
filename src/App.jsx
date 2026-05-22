import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient';
import FormularioEnvio from './FormularioEnvio';
import AdminPanel from './AdminPanel';

// Nomes das tabelas idênticos ao do seu AdminPanel
const NOME_TABELA_CONTEUDO = 'videos';
const NOME_TABELA_GALERIA = 'galeria';

export default function App() {
  const [view, setView] = useState('publico'); // 'publico' ou 'admin'
  const [user, setUser] = useState(null);

  // Estados para armazenar os dados dinâmicos do banco
  const [dados, setDados] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // 1. Criando as referências (Refs) para a rolagem suave na página pública
  const secaoInicioRef = useRef(null);
  const secaoVideosRef = useRef(null);
  const secaoArtigosRef = useRef(null);
  const secaoNoticiasRef = useRef(null);
  const secaoGaleriaRef = useRef(null);
  const secaoEnviarRef = useRef(null);

  // 2. Função que executa a rolagem suave ao clicar nos links do menu
  const rolarPara = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Monitoramento de autenticação do usuário
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_OUT') {
        setView('publico');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Buscar os dados das tabelas para renderizar na Home Pública
  useEffect(() => {
    if (view === 'publico') {
      const carregarDadosHome = async () => {
        try {
          setCarregando(true);

          // Busca Vídeos, Artigos e Textos
          const resConteudos = await supabase.from(NOME_TABELA_CONTEUDO).select('*').order('created_at', { ascending: false });
          setDados(resConteudos.data || []);

          // Busca Fotos da Galeria
          const resGaleria = await supabase.from(NOME_TABELA_GALERIA).select('*').order('created_at', { ascending: false });
          setGaleria(resGaleria.data || []);
        } catch (err) {
          console.error("Erro ao alimentar Home Pública:", err);
        } finally {
          setCarregando(false);
        }
      };

      carregarDadosHome();
    }
  }, [view]);

  // Filtragem dos dados recuperados do banco por tipo correspondente
  const videos = dados.filter(item => item.tipo === 'video');
  const artigos = dados.filter(item => item.tipo === 'artigo');
  const noticias = dados.filter(item => item.tipo === 'texto');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('publico');
  };

  // -------------------------------------------------------------------------
  // RECORTE 1: TELA DO ADMINISTRADOR (Mantida intacta e isolada)
  // -------------------------------------------------------------------------
  if (view === 'admin') {
    return (
      <div style={{ backgroundColor: '#111827', minHeight: '100vh', color: '#fff' }}>
        <div style={{
          backgroundColor: '#1f2937',
          padding: '1rem 2rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #374151'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#10b981' }}>⚙️ Painel de Controle Agroecológico</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => setView('publico')}
              style={{ backgroundColor: '#374151', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
            >
              🏠 Ver Site Público
            </button>
            <button
              onClick={handleLogout}
              style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
            >
              🚪 Sair do Admin
            </button>
          </div>
        </div>

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
  // RECORTE 2: TELA PÚBLICA TOTALMENTE CORRIDA E DINÂMICA
  // -------------------------------------------------------------------------
  return (
    <div style={{ backgroundColor: '#f4f7f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* Banner Principal de Entrada */}
      <header ref={secaoInicioRef} style={{
        backgroundImage: "linear-gradient(rgba(26, 74, 31, 0.2), rgba(26, 74, 31, 0.2)), url('/fundo-hero1.jpeg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundColor: '#e3ece4',
        color: '#ffffff',
        padding: '3rem 0',
        textAlign: 'center',
        minHeight: '220px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>

      </header>

      {/* Barra de Menu Superior Fixa (Sticky Navbar) */}
      <nav style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', padding: '0.5rem 0', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          {/* Links do Menu que acionam a rolagem vertical suave */}
          <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', whiteSpace: 'nowrap', flex: 1 }}>
            <button onClick={() => rolarPara(secaoVideosRef)} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', fontWeight: 'bold', cursor: 'pointer' }}>🎬 Vídeos</button>
            <button onClick={() => rolarPara(secaoArtigosRef)} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', fontWeight: 'bold', cursor: 'pointer' }}>📄 Artigos & PDFs</button>
            <button onClick={() => rolarPara(secaoNoticiasRef)} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', fontWeight: 'bold', cursor: 'pointer' }}>📰 Textos & Notícias</button>
            <button onClick={() => rolarPara(secaoGaleriaRef)} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', fontWeight: 'bold', cursor: 'pointer' }}>🖼️ Galeria</button>
            <button onClick={() => rolarPara(secaoEnviarRef)} style={{ background: 'none', border: 'none', padding: '10px', color: '#1a4a1f', fontWeight: 'bold', cursor: 'pointer' }}>📥 Enviar Conteúdo</button>
          </div>

          {/* Botão Admin Lateral */}
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem' }}>
            {user && user.email === 'paulet.ana1@gmail.com' ? (
              <button
                onClick={() => setView('admin')}
                style={{ backgroundColor: '#1a4a1f', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
              >
                ⚙️ Painel Admin
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
                style={{ backgroundColor: 'transparent', color: '#1a4a1f', border: '1px solid #1a4a1f', borderRadius: '4px', padding: '6px 14px', fontWeight: '600', cursor: 'pointer' }}
              >
                🔒 Admin
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* CONTEÚDO CORRIDO VERTICAL (TUDO EM UMA SÓ PÁGINA) */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', gap: '5rem' }}>

        {/* SEÇÃO 1: VÍDEOS */}
        <div ref={secaoVideosRef} style={{ scrollMarginTop: '80px' }}>
          <h2 style={{ color: '#1a4a1f', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>🎬 Vídeos Práticos e Aulas</h2>
          {carregando ? <p style={{ color: '#666' }}>Carregando dados públicos...</p> : videos.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>Nenhum vídeo publicado no momento.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {videos.map(item => (
                <div key={item.id} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ backgroundColor: '#e2eee3', color: '#1a4a1f', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>VÍDEO</span>
                    <h3 style={{ marginTop: '1rem', fontSize: '1.25rem', color: '#111827' }}>{item.titulo}</h3>
                    <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.5' }}>{item.descricao}</p>
                  </div>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" style={{ marginTop: '1rem', display: 'block', backgroundColor: '#1a4a1f', color: '#fff', textDecoration: 'none', padding: '10px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Assistir Conteúdo 📺
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO 2: ARTIGOS & PDFS */}
        <div ref={secaoArtigosRef} style={{ scrollMarginTop: '80px' }}>
          <h2 style={{ color: '#1a4a1f', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>📄 Artigos Técnicos & PDFs</h2>
          {carregando ? <p style={{ color: '#666' }}>Buscando publicações...</p> : artigos.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>Nenhum artigo disponível no momento.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {artigos.map(item => (
                <div key={item.id} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>DOCUMENTO</span>
                    <h3 style={{ marginTop: '1rem', fontSize: '1.25rem', color: '#111827' }}>{item.titulo}</h3>
                    <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.5' }}>{item.descricao}</p>
                  </div>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" style={{ marginTop: '1rem', display: 'block', backgroundColor: '#1e40af', color: '#fff', textDecoration: 'none', padding: '10px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Acessar Documento 📥
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO 3: TEXTOS & NOTÍCIAS */}
        <div ref={secaoNoticiasRef} style={{ scrollMarginTop: '80px' }}>
          <h2 style={{ color: '#1a4a1f', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>📰 Textos Informativos e Notícias</h2>
          {carregando ? <p style={{ color: '#666' }}>Buscando informativos...</p> : noticias.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>Nenhuma notícia registrada recentemente.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {noticias.map(item => (
                <div key={item.id} style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)' }}>
                  <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>INFORMATIVO</span>
                  <h3 style={{ marginTop: '1rem', fontSize: '1.4rem', color: '#111827', marginBottom: '0.5rem' }}>{item.titulo}</h3>
                  <p style={{ color: '#374151', fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.descricao}</p>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem', fontWeight: 'bold' }}>
                      🔗 Ver referência externa
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO 4: GALERIA DE FOTOS MURAL */}
        <div ref={secaoGaleriaRef} style={{ scrollMarginTop: '80px' }}>
          <h2 style={{ color: '#1a4a1f', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>🖼️ Galeria e Registros Fotográficos</h2>
          {carregando ? <p style={{ color: '#666' }}>Renderizando imagens...</p> : galeria.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>Nenhuma foto postada no mural ainda.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {galeria.map(foto => (
                <div key={foto.id} style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                  <img src={foto.url} alt={foto.titulo} style={{ width: '100%', height: '170px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#e5e7eb' }} />
                  <p style={{ marginTop: '0.8rem', marginBottom: 0, fontWeight: 'bold', color: '#374151', fontSize: '0.95rem' }}>{foto.titulo}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO 5: FORMULÁRIO DE ENVIO DA COMUNIDADE */}
        <div ref={secaoEnviarRef} style={{ scrollMarginTop: '80px', backgroundColor: '#ffffff', padding: '2.5rem 2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)' }}>
          <h2 style={{ color: '#1a4a1f', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.6rem' }}>📥 Compartilhe Conosco um Novo Conteúdo</h2>
          <FormularioEnvio />
        </div>

      </main>

    </div>
  );
}