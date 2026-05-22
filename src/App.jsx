import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient';
import FormularioEnvio from './FormularioEnvio';
import AdminPanel from './AdminPanel';

const NOME_TABELA_CONTEUDO = 'videos';
const NOME_TABELA_GALERIA = 'galeria';

export default function App() {
  const [view, setView] = useState('publico');
  const [user, setUser] = useState(null);
  const [dados, setDados] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Referências para a rolagem suave das seções
  const secaoInicioRef = useRef(null);
  const secaoVideosRef = useRef(null);
  const secaoArtigosRef = useRef(null);
  const secaoNoticiasRef = useRef(null);
  const secaoGaleriaRef = useRef(null);
  const secaoEnviarRef = useRef(null);

  const rolarPara = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_OUT') setView('publico');
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (view === 'publico') {
      const carregarDadosHome = async () => {
        try {
          setCarregando(true);
          const resConteudos = await supabase.from(NOME_TABELA_CONTEUDO).select('*').order('created_at', { ascending: false });
          setDados(resConteudos.data || []);

          const resGaleria = await supabase.from(NOME_TABELA_GALERIA).select('*').order('created_at', { ascending: false });
          setGaleria(resGaleria.data || []);
        } catch (err) {
          console.error("Erro ao carregar dados:", err);
        } finally {
          setCarregando(false);
        }
      };
      carregarDadosHome();
    }
  }, [view]);

  const videos = dados.filter(item => item.tipo === 'video');
  const artigos = dados.filter(item => item.tipo === 'artigo');
  const noticias = dados.filter(item => item.tipo === 'texto');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('publico');
  };

  if (view === 'admin') {
    return (
      <div style={{ backgroundColor: '#111827', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ backgroundColor: '#1f2937', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#10b981' }}>⚙️ Painel de Controle Agroecológico</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={() => setView('publico')} style={{ backgroundColor: '#374151', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>🏠 Ver Site Público</button>
            <button onClick={handleLogout} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>🚪 Sair do Admin</button>
          </div>
        </div>
        {user && user.email === 'paulet.ana1@gmail.com' ? <AdminPanel setView={setView} /> : <div style={{ textAlign: 'center', padding: '5rem' }}><h2>Acesso Restrito 🛑</h2><button onClick={() => setView('publico')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Voltar para a Home</button></div>}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>

      {/* 1. BARRA SUPERIOR FIXA (NAVBAR) */}
      <nav style={{ position: 'sticky', top: 0, backgroundColor: '#111827', padding: '0.8rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', zIndex: 1000, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => rolarPara(secaoInicioRef)}>
          🌱 <span style={{ color: '#fff' }}>Agroecologia</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => rolarPara(secaoVideosRef)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>🎬 Vídeos</button>
          <button onClick={() => rolarPara(secaoArtigosRef)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>📄 Artigos</button>
          <button onClick={() => rolarPara(secaoNoticiasRef)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>📰 Notícias</button>
          <button onClick={() => rolarPara(secaoGaleriaRef)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>🖼️ Galeria</button>
          <button onClick={() => rolarPara(secaoEnviarRef)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>📥 Compartilhar</button>

          {user && user.email === 'paulet.ana1@gmail.com' ? (
            <button onClick={() => setView('admin')} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>⚙️ Admin</button>
          ) : (
            <button onClick={async () => { const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); if (error) console.error(error.message); }} style={{ backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #374151', borderRadius: '4px', padding: '5px 12px', fontSize: '0.85rem', cursor: 'pointer' }}>🔒 Login</button>
          )}
        </div>
      </nav>

      {/* 2. IMAGEM HERO LADO A LADO (FULL WIDTH) */}
      <header ref={secaoInicioRef} style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('/fundo-hero1.jpeg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        width: '100%',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#ffffff',
        margin: 0,
        padding: '0 1rem'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', margin: '0 0 1rem 0', letterSpacing: '-0.025em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Laboratório de Agroecologia</h1>
        <p style={{ fontSize: '1.25rem', color: '#e5e7eb', maxWidth: '700px', margin: 0, lineHeight: '1.6', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Espaço integrado de estudo, vivência prática, transição sintrópica e preservação ambiental.</p>
      </header>

      {/* 3. LAYOUT DE VÍDEOS E CONTEÚDOS ESTRUTURADOS (CONTAINER CENTRAL) */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '5rem' }}>

        {/* SEÇÃO VÍDEOS */}
        <div ref={secaoVideosRef} style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#111827', fontSize: '1.75rem', fontWeight: '700', borderBottom: '3px solid #10b981', paddingBottom: '0.5rem', marginBottom: '2rem' }}>🎥 Vídeos Educativos</h2>
          {carregando ? <p>Carregando...</p> : videos.length === 0 ? <p style={{ color: '#6b7280' }}>Nenhum vídeo publicado.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {videos.map(item => (
                <div key={item.id} style={{ backgroundColor: '#ffffff', padding: '1.8rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e5e7eb' }}>
                  <div>
                    <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Conteúdo Audiovisual</span>
                    <h3 style={{ marginTop: '1.2rem', marginBottom: '0.6rem', fontSize: '1.3rem', color: '#111827', fontWeight: '600' }}>{item.titulo}</h3>
                    <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>{item.descricao}</p>
                  </div>
                  {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ marginTop: '1.5rem', display: 'block', backgroundColor: '#10b981', color: '#fff', textDecoration: 'none', padding: '10px', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(16,185,129,0.2)' }}>Assistir no YouTube 📺</a>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO ARTIGOS */}
        <div ref={secaoArtigosRef} style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#111827', fontSize: '1.75rem', fontWeight: '700', borderBottom: '3px solid #10b981', paddingBottom: '0.5rem', marginBottom: '2rem' }}>📄 Artigos e Trabalhos Científicos</h2>
          {carregando ? <p>Carregando...</p> : artigos.length === 0 ? <p style={{ color: '#6b7280' }}>Nenhum artigo disponível.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {artigos.map(item => (
                <div key={item.id} style={{ backgroundColor: '#ffffff', padding: '1.8rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e5e7eb' }}>
                  <div>
                    <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Publicação Técnica</span>
                    <h3 style={{ marginTop: '1.2rem', marginBottom: '0.6rem', fontSize: '1.3rem', color: '#111827', fontWeight: '600' }}>{item.titulo}</h3>
                    <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>{item.descricao}</p>
                  </div>
                  {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ marginTop: '1.5rem', display: 'block', backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', padding: '10px', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>Acessar Documento / PDF 📥</a>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO NOTÍCIAS */}
        <div ref={secaoNoticiasRef} style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#111827', fontSize: '1.75rem', fontWeight: '700', borderBottom: '3px solid #10b981', paddingBottom: '0.5rem', marginBottom: '2rem' }}>📰 Textos Informativos e Notícias</h2>
          {carregando ? <p>Carregando...</p> : noticias.length === 0 ? <p style={{ color: '#6b7280' }}>Nenhuma notícia publicada.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {noticias.map(item => (
                <div key={item.id} style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                  <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Boletim Agroecológico</span>
                  <h3 style={{ marginTop: '1.2rem', fontSize: '1.4rem', color: '#111827', fontWeight: '600', marginBottom: '0.8rem' }}>{item.titulo}</h3>
                  <p style={{ color: '#374151', fontSize: '1.05rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>{item.descricao}</p>
                  {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block', marginTop: '1rem', fontWeight: 'bold' }}>🔗 Ver referência completa</a>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO GALERIA */}
        <div ref={secaoGaleriaRef} style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#111827', fontSize: '1.75rem', fontWeight: '700', borderBottom: '3px solid #10b981', paddingBottom: '0.5rem', marginBottom: '2rem' }}>🖼️ Galeria de Fotos dos Mutirões</h2>
          {carregando ? <p>Carregando...</p> : galeria.length === 0 ? <p style={{ color: '#6b7280' }}>Nenhuma imagem cadastrada.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
              {galeria.map(foto => (
                <div key={foto.id} style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <img src={foto.url} alt={foto.titulo} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' }} />
                  <p style={{ marginTop: '0.8rem', marginBottom: 0, fontWeight: 'bold', color: '#374151', fontSize: '0.95rem', textAlign: 'center' }}>{foto.titulo}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO FORMULÁRIO COMUNIDADE */}
        <div ref={secaoEnviarRef} style={{ scrollMarginTop: '100px', backgroundColor: '#ffffff', padding: '3rem 2rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <FormularioEnvio />
        </div>

      </main>

      {/* 4. O FINAL COM INFORMAÇÕES E CONTATOS (FOOTER) */}
      <footer style={{ backgroundColor: '#111827', color: '#9ca3af', padding: '4rem 2rem 2rem 2rem', borderTop: '1px solid #1f2937' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem', marginBottom: '3rem' }}>

          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>🌱 Lab Agroecologia</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>Promovendo a agricultura sustentável, sistemas agroflorestais e a soberania alimentar através do compartilhamento comunitário de saberes técnicos e vivências práticas.</p>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Links de Acesso</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><span onClick={() => rolarPara(secaoVideosRef)} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#10b981'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>🎥 Vídeos Educativos</span></li>
              <li><span onClick={() => rolarPara(secaoArtigosRef)} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#10b981'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>📄 Artigos Técnicos</span></li>
              <li><span onClick={() => rolarPara(secaoNoticiasRef)} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#10b981'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>📰 Mural de Notícias</span></li>
              <li><span onClick={() => rolarPara(secaoGaleriaRef)} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#10b981'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>🖼️ Álbum da Galeria</span></li>
            </ul>
          </div>

          <div style={{ flex: '1 1 250px' }}>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Informações de Contato</h4>
            <p style={{ fontSize: '0.9rem', margin: '0 0 0.6rem 0' }}>📍 Campus Experimental de Práticas Agrícolas</p>
            <p style={{ fontSize: '0.9rem', margin: '0 0 0.6rem 0' }}>📧 contato@agroecolab.org</p>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>🛡️ Acesso Restrito ao Administrador Geral</p>
          </div>

        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid #1f2937', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#4b5563' }}>
          &copy; {new Date().getFullYear()} Laboratório de Vivências Agroecológicas. Todos os direitos reservados. Sincronizado via Supabase e hospedado na Vercel.
        </div>
      </footer>

    </div>
  );
}