import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('moderacao');
  const [envios, setEnvios] = useState([]);
  const [conteudos, setConteudos] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para os formulários de inserção rápida
  const [novoConteudo, setNovoConteudo] = useState({ titulo: '', tipo: 'video', url_midia: '', resumo: '', categoria: '' });
  const [novaFoto, setNovaFoto] = useState({ titulo: '', url: '', descricao: '', categoria: '' });

  // Simulação de carregamento de dados do Supabase
  useEffect(() => {
    carregarDados();
  }, [activeTab]);

  const carregarDados = async () => {
    setLoading(true);
    // Aqui você usaria as chamadas do Antigravity/Supabase. Ex:
    // const { data } = await supabase.from('envios_publico').select('*');

    // Dados fictícios para visualização imediata do painel rodando:
    await new Promise(resolve => setTimeout(resolve, 600));

    if (activeTab === 'moderacao') {
      setEnvios([
        { id: '1', nome_autor: 'Mariana Costa', email_autor: 'mari@agro.com', titulo: 'Cartilha de Agroecologia 2026', tipo: 'artigo', conteudo: 'https://linkdaimportacao.com/cartilha.pdf', status: 'pendente' },
        { id: '2', nome_autor: 'Carlos Souza', email_autor: 'carlos@perma.com', titulo: 'Vídeo Sintropia na Prática', tipo: 'sugestao_video', conteudo: 'https://youtube.com/watch?v=123', status: 'pendente' }
      ]);
    } else if (activeTab === 'conteudos') {
      setConteudos([
        { id: '101', titulo: 'O que é Agroecologia?', tipo: 'texto', categoria: 'Conceitos básicos', publicado: true },
        { id: '102', titulo: 'Manejo Ecológico do Solo', tipo: 'video', categoria: 'Práticas', publicado: true }
      ]);
    } else if (activeTab === 'galeria') {
      setGaleria([
        { id: '201', titulo: 'Mutirão de Plantio', url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675', categoria: 'Vivências' }
      ]);
    }
    setLoading(false);
  };

  // Lógica de Moderação: Aprovar Conteúdo Público
  const handleAprovar = async (envio) => {
    try {
      // 1. Atualiza o status na tabela 'envios_publico' para 'aprovado'
      // 2. Insere automaticamente na tabela 'conteudos' mapeando os campos:
      const novoRegistro = {
        titulo: envio.titulo,
        tipo: envio.tipo === 'sugestao_video' ? 'video' : 'artigo',
        url_midia: envio.conteudo,
        resumo: `Enviado por: ${envio.nome_autor} (${envio.email_autor})`,
        publicado: true
      };

      alert(`Conteúdo "${envio.titulo}" aprovado com sucesso e publicado no site!`);
      setEnvios(prev => prev.filter(item => item.id !== envio.id));
    } catch (err) {
      console.error(err);
    }
  };

  // Lógica de Moderação: Rejeitar Conteúdo Público
  const handleRejeitar = async (id) => {
    if (window.confirm("Tem certeza que deseja rejeitar este envio?")) {
      // await supabase.from('envios_publico').update({ status: 'rejeitado' }).eq('id', id);
      setEnvios(prev => prev.filter(item => item.id !== id));
    }
  };

  // Cadastro Manual de Conteúdo (Vídeo/Artigo/Texto)
  const handleSalvarConteudo = (e) => {
    e.preventDefault();
    alert(`"${novoConteudo.titulo}" cadastrado manualmente!`);
    setNovoConteudo({ titulo: '', tipo: 'video', url_midia: '', resumo: '', categoria: '' });
    carregarDados();
  };

  // Cadastro Manual de Foto na Galeria
  const handleSalvarFoto = (e) => {
    e.preventDefault();
    alert('Nova imagem adicionada à galeria!');
    setNovaFoto({ titulo: '', url: '', descricao: '', categoria: '' });
    carregarDados();
  };

  return (
    <div style={styles.adminContainer}>
      {/* MENU LATERAL */}
      <aside style={styles.sidebar}>
        <div style={styles.logoArea}>
          <h2 style={styles.logoText}>Painel Admin</h2>
          <span style={styles.statusBadge}>● Online</span>
        </div>
        <nav style={styles.navMenu}>
          <button onClick={() => setActiveTab('moderacao')} style={{ ...styles.navBtn, backgroundColor: activeTab === 'moderacao' ? '#2e6933' : 'transparent' }}>
            📥 Envios do Público {envios.length > 0 && <span style={styles.notifBadge}>{envios.length}</span>}
          </button>
          <button onClick={() => setActiveTab('conteudos')} style={{ ...styles.navBtn, backgroundColor: activeTab === 'conteudos' ? '#2e6933' : 'transparent' }}>
            📚 Alimentar Vídeos/Artigos
          </button>
          <button onClick={() => setActiveTab('galeria')} style={{ ...styles.navBtn, backgroundColor: activeTab === 'galeria' ? '#2e6933' : 'transparent' }}>
            🖼️ Galeria de Fotos
          </button>
        </nav>
      </aside>

      {/* ÁREA DE CONTEÚDO DO PAINEL */}
      <main style={styles.mainContent}>
        <header style={styles.topbar}>
          <h1 style={styles.pageTitle}>
            {activeTab === 'moderacao' && '📥 Moderação de Envios Externos'}
            {activeTab === 'conteudos' && '📚 Gerenciar e Alimentar Conteúdos'}
            {activeTab === 'galeria' && '🖼️ Gerenciar Galeria Fotográfica'}
          </h1>
        </header>

        {loading ? (
          <div style={styles.loading}>Carregando dados estruturados...</div>
        ) : (
          <div style={styles.tabView}>

            {/* ====== ABA 1: MODERAÇÃO GERAL ====== */}
            {activeTab === 'moderacao' && (
              <div>
                <p style={styles.descText}>Aqui aparecem as informações e arquivos que o público enviou pelo formulário do site. Você decide o que vai ao ar.</p>
                {envios.length === 0 ? (
                  <div style={styles.emptyState}>Nenhum envio pendente no momento. Tudo limpo! 🎉</div>
                ) : (
                  <div style={styles.gridCards}>
                    {envios.map(item => (
                      <div key={item.id} style={styles.adminCard}>
                        <div style={styles.cardHeader}>
                          <span style={styles.typeTag}>{item.tipo.toUpperCase()}</span>
                          <span style={styles.authorText}>Por: <strong>{item.nome_autor}</strong> ({item.email_autor})</span>
                        </div>
                        <h3 style={styles.cardTitle}>{item.titulo}</h3>
                        <div style={styles.contentBox}>
                          <strong>Conteúdo enviado:</strong>
                          <p style={styles.contentBody}>{item.conteudo}</p>
                        </div>
                        <div style={styles.actionRow}>
                          <button onClick={() => handleAprovar(item)} style={styles.btnApprove}>✓ Aprovar e Publicar</button>
                          <button onClick={() => handleRejeitar(item.id)} style={styles.btnReject}>✕ Rejeitar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ====== ABA 2: CADASTRO DE VÍDEOS / ARTIGOS ====== */}
            {activeTab === 'conteudos' && (
              <div style={styles.splitLayout}>
                {/* Formulário de cadastro */}
                <form onSubmit={handleSalvarConteudo} style={styles.adminForm}>
                  <h3>Novo Conteúdo Oficial</h3>
                  <input type="text" placeholder="Título do Conteúdo" required value={novoConteudo.titulo} onChange={e => setNovoConteudo({ ...novoConteudo, titulo: e.target.value })} style={styles.admInput} />
                  <select value={novoConteudo.tipo} onChange={e => setNovoConteudo({ ...novoConteudo, tipo: e.target.value })} style={styles.admInput}>
                    <option value="video">Vídeo (YouTube)</option>
                    <option value="artigo">Artigo / PDF</option>
                    <option value="texto">Texto Informativo / Notícia</option>
                  </select>
                  <input type="text" placeholder="URL da Mídia (Link do YouTube ou link do arquivo)" value={novoConteudo.url_midia} onChange={e => setNovoConteudo({ ...novoConteudo, url_midia: e.target.value })} style={styles.admInput} />
                  <input type="text" placeholder="Categoria (Ex: Práticas, Adubação)" value={novoConteudo.categoria} onChange={e => setNovoConteudo({ ...novoConteudo, categoria: e.target.value })} style={styles.admInput} />
                  <textarea placeholder="Resumo ou descrição do texto..." value={novoConteudo.resumo} onChange={e => setNovoConteudo({ ...novoConteudo, resumo: e.target.value })} style={{ ...styles.admInput, height: '80px' }} />
                  <button type="submit" style={styles.btnSubmit}>Publicar no Site</button>
                </form>

                {/* Lista atual */}
                <div style={styles.listTable}>
                  <h3>Conteúdos Online ({conteudos.length})</h3>
                  {conteudos.map(c => (
                    <div key={c.id} style={styles.tableRow}>
                      <div>
                        <strong>[{c.tipo}]</strong> {c.titulo} <br />
                        <small style={{ color: '#777' }}>{c.categoria}</small>
                      </div>
                      <span style={{ color: '#2e6933', fontWeight: 'bold' }}>Ativo</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ====== ABA 3: GERENCIAR GALERIA ====== */}
            {activeTab === 'galeria' && (
              <div style={styles.splitLayout}>
                <form onSubmit={handleSalvarFoto} style={styles.adminForm}>
                  <h3>Adicionar Foto à Galeria</h3>
                  <input type="text" placeholder="Título da Imagem" required value={novaFoto.titulo} onChange={e => setNovaFoto({ ...novaFoto, titulo: e.target.value })} style={styles.admInput} />
                  <input type="text" placeholder="URL da Imagem (Link hospedado)" required value={novaFoto.url} onChange={e => setNovaFoto({ ...novaFoto, url: e.target.value })} style={styles.admInput} />
                  <input type="text" placeholder="Categoria" value={novaFoto.categoria} onChange={e => setNovaFoto({ ...novaFoto, categoria: e.target.value })} style={styles.admInput} />
                  <textarea placeholder="Pequena descrição da imagem..." value={novaFoto.descricao} onChange={e => setNovaFoto({ ...novaFoto, descricao: e.target.value })} style={{ ...styles.admInput, height: '80px' }} />
                  <button type="submit" style={styles.btnSubmit}>Adicionar à Galeria</button>
                </form>

                <div style={styles.listTable}>
                  <h3>Fotos no Grid ({galeria.length})</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginTop: '10px' }}>
                    {galeria.map(f => (
                      <div key={f.id} style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={f.url} alt={f.titulo} style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
                        <div style={{ fontSize: '10px', padding: '4px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{f.titulo}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  adminContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f4', fontFamily: 'system-ui, sans-serif' },
  sidebar: { width: '260px', backgroundColor: '#1a4a1f', color: '#fff', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' },
  logoArea: { borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' },
  logoText: { fontSize: '1.3rem', margin: 0, color: '#fff' },
  statusBadge: { fontSize: '0.75rem', color: '#81c995' },
  navMenu: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  navBtn: { width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: '0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  notifBadge: { backgroundColor: '#ea4335', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' },
  mainContent: { flex: 1, padding: '2rem' },
  topbar: { borderBottom: '1px solid #e0e0e0', paddingBottom: '1rem', marginBottom: '1.5rem' },
  pageTitle: { fontSize: '1.5rem', margin: 0, color: '#222' },
  descText: { fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' },
  loading: { padding: '2rem', textAlign: 'center', color: '#666' },
  emptyState: { padding: '3rem', backgroundColor: '#fff', borderRadius: '8px', textAlign: 'center', color: '#777', border: '1px dashed #ccc' },
  gridCards: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  adminCard: { backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' },
  typeTag: { backgroundColor: '#e6f4ea', color: '#137333', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' },
  cardTitle: { margin: '0 0 0.8rem 0', fontSize: '1.15rem', color: '#111' },
  contentBox: { backgroundColor: '#f9f9f9', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '1rem' },
  contentBody: { margin: '0.2rem 0 0 0', color: '#333', wordBreak: 'break-all' },
  actionRow: { display: 'flex', gap: '0.5rem' },
  btnApprove: { backgroundColor: '#2e6933', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  btnReject: { backgroundColor: '#fff', color: '#d93025', border: '1px solid #d93025', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  splitLayout: { display: 'flex', gap: '2rem', flexWrap: 'wrap' },
  adminForm: { flex: '1 1 350px', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  admInput: { padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem' },
  btnSubmit: { backgroundColor: '#1a4a1f', color: '#fff', border: 'none', padding: '0.7rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  listTable: { flex: '1 1 350px', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e0e0e0' },
  tableRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #eee', fontSize: '0.9rem' }
};