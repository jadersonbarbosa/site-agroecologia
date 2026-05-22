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
    <div style={{ backgroundColor: '#f4ede4', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', paddingTop: '60px', color: '#3d2817' }}>

      {/* Barra de Menu Superior Totalmente Fixa no Topo (Sticky/Fixed Navbar) */}
      <nav style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 8px rgba(61, 40, 23, 0.08)',
        padding: '0.6rem 2rem',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottom: '1px solid rgba(107, 142, 111, 0.15)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          {/* Links do Menu que acionam a rolagem vertical suave */}
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', whiteSpace: 'nowrap', flex: 1 }}>
            <button onClick={() => rolarPara(secaoVideosRef)} style={{ background: 'none', border: 'none', padding: '10px', color: '#6b8e6f', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>🎬 Vídeos</button>
            <button onClick={() => rolarPara(secaoArtigosRef)} style={{ background: 'none', border: 'none', padding: '10px', color: '#6b8e6f', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>📄 Artigos & PDFs</button>
            <button onClick={() => rolarPara(secaoNoticiasRef)} style={{ background: 'none', border: 'none', padding: '10px', color: '#6b8e6f', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>📰 Textos & Notícias</button>
            <button onClick={() => rolarPara(secaoGaleriaRef)} style={{ background: 'none', border: 'none', padding: '10px', color: '#6b8e6f', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>🖼️ Galeria</button>
            <button onClick={() => rolarPara(secaoEnviarRef)} style={{ background: 'none', border: 'none', padding: '10px', color: '#d4a574', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>📥 Compartilhar Saberes</button>
          </div>

          {/* Botão Admin Lateral */}
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem' }}>
            {user && user.email === 'paulet.ana1@gmail.com' ? (
              <button
                onClick={() => setView('admin')}
                style={{ backgroundColor: '#6b8e6f', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(107,142,111,0.2)' }}
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
                style={{ backgroundColor: 'transparent', color: '#6b8e6f', border: '1px solid #6b8e6f', borderRadius: '6px', padding: '6px 14px', fontWeight: '600', cursor: 'pointer' }}
              >
                🔒 Painel
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* Banner Principal de Entrada Lado a Lado (Full Width) */}
      <header ref={secaoInicioRef} style={{
        backgroundImage: "linear-gradient(rgba(61, 40, 23, 0.35), rgba(61, 40, 23, 0.35)), url('/fundo-hero1.jpeg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundColor: '#e3ece4',
        color: '#ffffff',
        padding: '5rem 0',
        textAlign: 'center',
        minHeight: '280px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        boxShadow: 'inset 0 -4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ maxWidth: '800px', padding: '0 1.5rem' }}>
          <h1 style={{ fontWeight: '800', margin: '0 0 0.8rem 0', fontSize: '2.8rem', letterSpacing: '-0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>Laboratório de Vivências Agroecológicas</h1>
          <p style={{ margin: 0, color: '#f4ede4', fontSize: '1.2rem', fontWeight: '400', lineHeight: '1.5', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Transição sintrópica, segurança alimentar e preservação ambiental ativa comunitária</p>
        </div>
      </header>

      {/* CONTEÚDO CORRIDO VERTICAL (TUDO EM UMA SÓ PÁGINA) */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '5.5rem' }}>

        {/* SEÇÃO 1: VÍDEOS */}
        <div ref={secaoVideosRef} style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#3d2817', borderBottom: '2px solid #6b8e6f', paddingBottom: '0.6rem', marginBottom: '2rem', fontSize: '1.8rem', fontWeight: '700' }}>🎬 Vídeos Práticos e Aulas</h2>
          {carregando ? <p style={{ color: '#6b8e6f' }}>Carregando dados públicos...</p> : videos.length === 0 ? (
            <p style={{ color: '#6b8e6f', opacity: 0.7 }}>Nenhum vídeo publicado no momento.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.2rem' }}>
              {videos.map(item => (
                <div key={item.id} style={{ backgroundColor: '#ffffff', padding: '1.8rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(61,40,23,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(61,40,23,0.06)' }}>
                  <div>
                    <span style={{ backgroundColor: '#f4ede4', color: '#6b8e6f', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>CONTEÚDO AUDIOVISUAL</span>
                    <h3 style={{ marginTop: '1.2rem', fontSize: '1.35rem', color: '#3d2817', fontWeight: '700', marginBottom: '0.6rem' }}>{item.titulo}</h3>
                    <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>{item.descricao}</p>
                  </div>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" style={{ marginTop: '1.6rem', display: 'block', backgroundColor: '#6b8e6f', color: '#ffffff', textDecoration: 'none', padding: '11px', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(107,142,111,0.15)' }}>
                      Assistir Conteúdo Prático 📺
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO 2: ARTIGOS & PDFS */}
        <div ref={secaoArtigosRef} style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#3d2817', borderBottom: '2px solid #6b8e6f', paddingBottom: '0.6rem', marginBottom: '2rem', fontSize: '1.8rem', fontWeight: '700' }}>📄 Artigos Técnicos & PDFs</h2>
          {carregando ? <p style={{ color: '#6b8e6f' }}>Buscando publicações...</p> : artigos.length === 0 ? (
            <p style={{ color: '#6b8e6f', opacity: 0.7 }}>Nenhum artigo disponível no momento.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.2rem' }}>
              {artigos.map(item => (
                <div key={item.id} style={{ backgroundColor: '#ffffff', padding: '1.8rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(61,40,23,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(61,40,23,0.06)' }}>
                  <div>
                    <span style={{ backgroundColor: '#f4ede4', color: '#d4a574', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>RECURSO CIENTÍFICO</span>
                    <h3 style={{ marginTop: '1.2rem', fontSize: '1.35rem', color: '#3d2817', fontWeight: '700', marginBottom: '0.6rem' }}>{item.titulo}</h3>
                    <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>{item.descricao}</p>
                  </div>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" style={{ marginTop: '1.6rem', display: 'block', backgroundColor: '#d4a574', color: '#ffffff', textDecoration: 'none', padding: '11px', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Acessar Documentação Técnica 📥
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO 3: TEXTOS & NOTÍCIAS */}
        <div ref={secaoNoticiasRef} style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#3d2817', borderBottom: '2px solid #6b8e6f', paddingBottom: '0.6rem', marginBottom: '2rem', fontSize: '1.8rem', fontWeight: '700' }}>📰 Textos Informativos e Notícias</h2>
          {carregando ? <p style={{ color: '#6b8e6f' }}>Buscando informativos...</p> : noticias.length === 0 ? (
            <p style={{ color: '#6b7280', opacity: 0.7 }}>Nenhuma notícia registrada recentemente.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.2rem' }}>
              {noticias.map(item => (
                <div key={item.id} style={{ backgroundColor: '#ffffff', padding: '2.2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(61,40,23,0.04)', border: '1px solid rgba(61,40,23,0.06)' }}>
                  <span style={{ backgroundColor: '#f4ede4', color: '#3d2817', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>MURAL INFORMATIVO</span>
                  <h3 style={{ marginTop: '1.2rem', fontSize: '1.5rem', color: '#3d2817', marginBottom: '0.6rem', fontWeight: '700' }}>{item.titulo}</h3>
                  <p style={{ color: '#444444', fontSize: '1.05rem', lineHeight: '1.65', whiteSpace: 'pre-wrap', margin: 0 }}>{item.descricao}</p>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#6b8e6f', fontSize: '0.95rem', textDecoration: 'none', display: 'inline-block', marginTop: '1rem', fontWeight: 'bold' }}>
                      🔗 Acessar referência externa associada
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO 4: GALERIA DE FOTOS MURAL */}
        <div ref={secaoGaleriaRef} style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#3d2817', borderBottom: '2px solid #6b8e6f', paddingBottom: '0.6rem', marginBottom: '2rem', fontSize: '1.8rem', fontWeight: '700' }}>🖼️ Galeria de Fotos e Vivências</h2>
          {carregando ? <p style={{ color: '#6b8e6f' }}>Renderizando imagens...</p> : galeria.length === 0 ? (
            <p style={{ color: '#6b8e6f', opacity: 0.7 }}>Nenhuma foto postada no mural ainda.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.8rem' }}>
              {galeria.map(foto => (
                <div key={foto.id} style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(61,40,23,0.04)', overflow: 'hidden', border: '1px solid rgba(61,40,23,0.06)' }}>
                  <img src={foto.url} alt={foto.titulo} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#e5e7eb' }} />
                  <p style={{ marginTop: '0.9rem', marginBottom: 0, fontWeight: '700', color: '#3d2817', fontSize: '0.95rem', textAlign: 'center' }}>{foto.titulo}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO 5: FORMULÁRIO DE ENVIO DA COMUNIDADE */}
        <div ref={secaoEnviarRef} style={{ scrollMarginTop: '100px', backgroundColor: '#ffffff', padding: '3rem 2.5rem', borderRadius: '16px', boxShadow: '0 6px 18px rgba(61,40,23,0.04)', border: '1px solid rgba(61,40,23,0.06)' }}>
          <FormularioEnvio />
        </div>

      </main>

    </div>
  );
}