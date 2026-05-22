import React, { useState, useEffect } from 'react';
import FormularioEnvio from './FormularioEnvio';
import AdminPanel from './AdminPanel';
import './index.css';

export default function App() {
  const [view, setView] = useState('publico'); // 'publico' ou 'admin'
  const [activeTab, setActiveTab] = useState('videos');
  const [items, setItems] = useState([]);
  const [fotos, setFotos] = useState([]);

  // Simulação de carregamento do banco de dados (Supabase)
  useEffect(() => {
    // Aqui no futuro você buscará direto do banco usando as tabelas oficiais:
    // const { data } = await supabase.from('conteudos').select('*').eq('publicado', true);

    // Simulando dados fictícios iniciais para o site já abrir preenchido:
    if (activeTab === 'videos') {
      setItems([
        { id: '1', titulo: 'Introdução à Agroecologia e Sistemas Sintrópicos', categoria: 'Aulas', url_midia: 'https://www.youtube.com/embed/dQw4w9WgXcQ', resumo: 'Entenda os conceitos fundamentais para iniciar o manejo sustentável.' },
        { id: '2', titulo: 'Manejo de Água no Semiárido', categoria: 'Práticas', url_midia: 'https://www.youtube.com/embed/dQw4w9WgXcQ', resumo: 'Técnicas eficientes de captação e armazenamento de água.' }
      ]);
    } else if (activeTab === 'artigos') {
      setItems([
        { id: '3', titulo: 'Cartilha Prática de Adubação Verde.pdf', categoria: 'Manuais', url_midia: '#', resumo: 'Aprenda a recuperar solos degradados usando leguminosas nativas.' },
        { id: '4', titulo: 'Artigo Científico: Biodiversidade no Sertão', categoria: 'Artigos', url_midia: '#', resumo: 'Estudo de caso detalhado sobre a resiliência de cultivares locais.' }
      ]);
    } else if (activeTab === 'textos') {
      setItems([
        { id: '5', titulo: 'O papel das feiras orgânicas na economia local', categoria: 'Notícias', resumo: 'Como a comercialização direta fortalece a agricultura familiar urbana.', corpo: 'Texto completo aqui...' }
      ]);
    }
  }, [activeTab]);

  // Carregar fotos da galeria
  useEffect(() => {
    setFotos([
      { id: '1', titulo: 'Dia de Campo - Colheita', url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=500', categoria: 'Vivências' },
      { id: '2', titulo: 'Feira Agroecológica Local', url: 'https://images.unsplash.com/photo-1488459711626-d6df22946802?w=500', categoria: 'Eventos' }
    ]);
  }, []);

  // Se o usuário clicar para acessar o Admin
  if (view === 'admin') {
    return (
      <div>
        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: '0.85rem' }}>Ambiente Administrativo Protegido</span>
          <button onClick={() => setView('publico')} style={{ padding: '4px 12px', cursor: 'pointer', background: '#444', color: '#fff', border: 'none', borderRadius: '4px' }}>Voltar para o Site</button>
        </div>
        <AdminPanel />
      </div>
    );
  }

  return (
    <div>
      {/* CABEÇALHO / HERO */}
      <header style={styles.hero}>
        <div className="container" style={styles.heroContent}>
          <h1 style={styles.heroTitle}> {/*🌱 Aplicação Agroecológica*/}</h1>
          <p style={styles.heroSubtitle}>Conhecimento compartilhado e ferramentas práticas para um mundo sustentável.</p>
          <button onClick={() => setView('admin')} className="btn" style={{ backgroundColor: 'transparent', border: '2px solid white', marginTop: '1rem' }}>
            🔒 Acessar Painel Admin
          </button>
        </div>
      </header>

      {/* NAVEGAÇÃO ABAS PÚBLICAS */}
      <nav style={styles.navbar}>
        <div className="container" style={styles.navContainer}>
          <button onClick={() => setActiveTab('videos')} style={{ ...styles.navTab, borderBottom: activeTab === 'videos' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'videos' ? 'bold' : 'normal' }}>🎬 Vídeos</button>
          <button onClick={() => setActiveTab('artigos')} style={{ ...styles.navTab, borderBottom: activeTab === 'artigos' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'artigos' ? 'bold' : 'normal' }}>📄 Artigos & PDFs</button>
          <button onClick={() => setActiveTab('textos')} style={{ ...styles.navTab, borderBottom: activeTab === 'textos' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'textos' ? 'bold' : 'normal' }}>📰 Textos & Notícias</button>
          <button onClick={() => setActiveTab('galeria')} style={{ ...styles.navTab, borderBottom: activeTab === 'galeria' ? '3px solid #1a4a1f' : 'none', fontWeight: activeTab === 'galeria' ? 'bold' : 'normal' }}>🖼️ Galeria</button>
          <a href="#enviar" style={{ ...styles.navTab, color: '#1a4a1f', fontWeight: 'bold' }}>📥 Enviar Conteúdo</a>
        </div>
      </nav>

      {/* CONTEÚDO DINÂMICO DO SITE */}
      <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '50vh' }}>

        {activeTab !== 'galeria' ? (
          <div style={styles.grid}>
            {items.map(item => (
              <div key={item.id} style={styles.card}>
                {item.tipo === 'video' && (
                  <div style={styles.videoWrapper}>
                    <iframe src={item.url_midia} title={item.titulo} frameBorder="0" allowFullScreen style={styles.iframe}></iframe>
                  </div>
                )}
                <div style={{ padding: '1.25rem' }}>
                  <span style={styles.categoryBadge}>{item.categoria}</span>
                  <h3 style={styles.cardTitle}>{item.titulo}</h3>
                  <p style={styles.cardText}>{item.resumo}</p>
                  {item.tipo === 'artigo' && (
                    <a href={item.url_midia} className="btn" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', marginTop: '0.5rem' }}>⬇ Baixar Documento</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* GRID DA GALERIA */
          <div style={styles.galleryGrid}>
            {fotos.map(foto => (
              <div key={foto.id} style={styles.galleryCard}>
                <img src={foto.url} alt={foto.titulo} style={styles.galleryImg} />
                <div style={{ padding: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{foto.titulo}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>{foto.categoria}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* SEÇÃO DE ENVIOS DO PÚBLICO */}
      <section id="enviar" style={{ backgroundColor: '#eef2ee', padding: '1rem 0' }}>
        <FormularioEnvio />
      </section>

      {/* RODAPÉ */}
      <footer style={styles.footer}>
        <p>© 2026 Aplicação Agroecológica. Desenvolvido com React & Supabase.</p>
      </footer>
    </div>
  );
}

const styles = {
  hero: {
    backgroundImage: "linear-gradient(rgba(26, 74, 31, 0.85), rgba(26, 74, 31, 0.85)), url('/fundo-hero.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#ffffff',
    padding: '4rem 0',
    textAlign: 'center'
  },
  heroTitle: { fontSize: '2.5rem', marginBottom: '0.5rem' },
  heroSubtitle: { fontSize: '1.1rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' },
  navbar: { backgroundColor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', sticky: 'top', position: 'sticky', top: 0, zIndex: 100 },
  navContainer: { display: 'flex', gap: '1rem', overflowX: 'auto', whiteSpace: 'nowrap' },
  navTab: { background: 'none', border: 'none', padding: '1rem 0.5rem', fontSize: '0.95rem', cursor: 'pointer', color: '#333', textDecoration: 'none' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' },
  card: { backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #eef2ee' },
  videoWrapper: { position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' },
  iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  categoryBadge: { display: 'inline-block', backgroundColor: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.5rem' },
  cardTitle: { fontSize: '1.15rem', color: '#111', marginBottom: '0.5rem', lineHeight: '1.4' },
  cardText: { fontSize: '0.9rem', color: '#555' },
  galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' },
  galleryCard: { backgroundColor: '#fff', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' },
  galleryImg: { width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px' },
  footer: { backgroundColor: '#222', color: '#bbb', padding: '2rem 0', textAlign: 'center', fontSize: '0.9rem', marginTop: '3rem' }
};