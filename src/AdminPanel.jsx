import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

export default function AdminPanel({ setView }) {
  const [adminTab, setAdminTab] = useState('alimentar'); // Começa na listagem
  const [dados, setDados] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Estados do Formulário de Conteúdo (Vídeos/Artigos)
  const [idEditando, setIdEditando] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [url, setUrl] = useState('');
  const [tipo, setTipo] = useState('video');

  // Estados do Formulário da Galeria
  const [tituloFoto, setTituloFoto] = useState('');
  const [urlFoto, setUrlFoto] = useState('');

  // -------------------------------------------------------------------------
  // 1. CARREGAMENTO DOS DADOS (BANCO DE DADOS)
  // -------------------------------------------------------------------------
  const buscarDados = async () => {
    if (!supabase || typeof supabase.from !== 'function') return;
    try {
      setCarregando(true);
      // Busca Vídeos e Artigos
      const resConteudos = await supabase.from('videos').select('*').order('created_at', { ascending: false });
      setDados(resConteudos.data || []);

      // Busca Fotos da Galeria (Se não tiver a tabela criada ainda, ele não quebra)
      const resGaleria = await supabase.from('galeria').select('*').order('created_at', { ascending: false });
      setGaleria(resGaleria.data || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  // -------------------------------------------------------------------------
  // 2. AÇÕES DE CONTEÚDO (VÍDEOS / ARTIGOS)
  // -------------------------------------------------------------------------
  const handleSalvarConteudo = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !url.trim()) return alert("Título e URL são obrigatórios!");

    try {
      setCarregando(true);
      const payload = { titulo, descricao, url, tipo };

      if (idEditando) {
        const { error } = await supabase.from('videos').update(payload).eq('id', idEditando);
        if (error) throw error;
        alert("Conteúdo atualizado com sucesso!");
      } else {
        const { error } = await supabase.from('videos').insert([payload]);
        if (error) throw error;
        alert("Conteúdo cadastrado com sucesso!");
      }

      limparFormularioConteudo();
      setAdminTab('alimentar');
      buscarDados();
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluirConteudo = async (id) => {
    if (!window.confirm("Deseja mesmo excluir este item de forma permanente?")) return;
    try {
      setCarregando(true);
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      buscarDados();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  const iniciarEdicao = (item) => {
    setIdEditando(item.id);
    setTitulo(item.titulo || '');
    setDescricao(item.descricao || '');
    setUrl(item.url || '');
    setTipo(item.tipo || 'video');
    setAdminTab('enviar'); // Abre a aba de formulário preenchida
  };

  const limparFormularioConteudo = () => {
    setIdEditando(null);
    setTitulo('');
    setDescricao('');
    setUrl('');
    setTipo('video');
  };

  // -------------------------------------------------------------------------
  // 3. AÇÕES DA GALERIA DE FOTOS
  // -------------------------------------------------------------------------
  const handleSalvarFoto = async (e) => {
    e.preventDefault();
    if (!tituloFoto.trim() || !urlFoto.trim()) return alert("Preencha o título e a URL da imagem!");

    try {
      setCarregando(true);
      const { error } = await supabase.from('galeria').insert([{ titulo: tituloFoto, url: urlFoto }]);
      if (error) throw error;

      alert("Foto adicionada à galeria!");
      setTituloFoto('');
      setUrlFoto('');
      buscarDados();
    } catch (err) {
      alert("Erro ao subir foto: " + err.message + "\n(Verifique se criou a tabela 'galeria' no Supabase)");
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluirFoto = async (id) => {
    if (!window.confirm("Remover esta foto da galeria pública?")) return;
    try {
      setCarregando(true);
      const { error } = await supabase.from('galeria').delete().eq('id', id);
      if (error) throw error;
      buscarDados();
    } catch (err) {
      alert("Erro ao excluir foto: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', backgroundColor: '#111827' }}>

      {/* Menu Lateral Esquerdo */}
      <aside style={{ width: '260px', backgroundColor: '#1f2937', padding: '1.5rem 1rem', borderRight: '1px solid #374151' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>
            <button
              onClick={() => { buscarDados(); setAdminTab('alimentar'); }}
              style={{ width: '100%', textAlign: 'left', background: adminTab === 'alimentar' ? '#10b981' : 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              👁️ Visualizar / Editar Lista
            </button>
          </li>
          <li>
            <button
              onClick={() => { limparFormularioConteudo(); setAdminTab('enviar'); }}
              style={{ width: '100%', textAlign: 'left', background: adminTab === 'enviar' ? '#10b981' : 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              ➕ {idEditando ? '📝 Editando Conteúdo' : '➕ Adicionar Vídeo/Artigo'}
            </button>
          </li>
          <li>
            <button
              onClick={() => setAdminTab('galeria')}
              style={{ width: '100%', textAlign: 'left', background: adminTab === 'galeria' ? '#10b981' : 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              🖼️ Galeria de Fotos
            </button>
          </li>
        </ul>
      </aside>

      {/* Área Central de Trabalho */}
      <section style={{ flex: 1, padding: '2rem', backgroundColor: '#111827', color: '#fff', overflowY: 'auto' }}>

        {/* ABA 1: VISUALIZAR E EDITAR LISTA */}
        {adminTab === 'alimentar' && (
          <div>
            <h3 style={{ color: '#10b981', marginBottom: '1.5rem' }}>📋 Lista de Conteúdos Gravados no Banco</h3>
            {carregando ? (
              <p style={{ color: '#10b981' }}>Processando informações...</p>
            ) : dados.length === 0 ? (
              <p style={{ color: '#9ca3af' }}>Nenhum item localizado na tabela 'videos'.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dados.map((item) => (
                  <div key={item.id} style={{ backgroundColor: '#1f2937', padding: '1.2rem', borderRadius: '8px', border: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ backgroundColor: item.tipo === 'video' ? '#065f46' : '#1e3a8a', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {item.tipo === 'video' ? 'VIDEO' : 'ARTIGO'}
                      </span>
                      <h4 style={{ margin: '0.5rem 0 0.2rem 0', fontSize: '1.1rem' }}>{item.titulo}</h4>
                      <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>{item.descricao || 'Sem descrição.'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => iniciarEdicao(item)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>📝 Editar</button>
                      <button onClick={() => handleExcluirConteudo(item.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>🗑️ Deletar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 2: ADICIONAR / SALVAR EDIÇÃO */}
        {adminTab === 'enviar' && (
          <div style={{ maxWidth: '600px', backgroundColor: '#1f2937', padding: '2rem', borderRadius: '8px', border: '1px solid #374151' }}>
            <h3 style={{ color: '#10b981', marginTop: 0, marginBottom: '1.5rem' }}>
              {idEditando ? '📝 Atualizar Informações' : '➕ Cadastrar Novo Recurso'}
            </h3>
            <form onSubmit={handleSalvarConteudo} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ color: '#9ca3af' }}>Selecione o Canal</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }}>
                  <option value="video">🎥 Vídeo</option>
                  <option value="artigo">📄 Artigo / PDF</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ color: '#9ca3af' }}>Nome / Título</label>
                <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }} placeholder="Título visível ao usuário" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ color: '#9ca3af' }}>Endereço URL (Link completo)</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }} placeholder="https://youtube.com/..." />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ color: '#9ca3af' }}>Resumo explicativo</label>
                <textarea rows="3" value={descricao} onChange={(e) => setDescricao(e.target.value)} style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563', resize: 'none' }} placeholder="Breve resumo..." />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {idEditando ? 'Salvar Alterações' : 'Gravar no Banco'}
                </button>
                {idEditando && (
                  <button type="button" onClick={() => { limparFormularioConteudo(); setAdminTab('alimentar'); }} style={{ backgroundColor: '#4b5563', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ABA 3: GERENCIAMENTO COMPLETO DA GALERIA */}
        {adminTab === 'galeria' && (
          <div>
            <h3 style={{ color: '#10b981', marginBottom: '1.5rem' }}>🖼️ Painel de Controle da Galeria</h3>

            {/* Formulário interno para criar novas fotos */}
            <form onSubmit={handleSalvarFoto} style={{ backgroundColor: '#1f2937', padding: '1.5rem', borderRadius: '8px', border: '1px solid #374151', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Legenda da Foto</label>
                <input type="text" value={tituloFoto} onChange={(e) => setTituloFoto(e.target.value)} placeholder="Ex: Mutirão de Plantio" style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }} />
              </div>
              <div style={{ flex: 2, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Link Direto da Imagem (URL)</label>
                <input type="url" value={urlFoto} onChange={(e) => setUrlFoto(e.target.value)} placeholder="https://..." style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }} />
              </div>
              <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                ➕ Adicionar Imagem
              </button>
            </form>

            {/* Listagem em Grade com Opção de Excluir Foto */}
            <h4 style={{ marginBottom: '1rem', color: '#9ca3af' }}>Fotos Ativas no Site Público:</h4>
            {galeria.length === 0 ? (
              <p style={{ color: '#6b7280' }}>Nenhuma foto registrada na tabela 'galeria'.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {galeria.map((foto) => (
                  <div key={foto.id} style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <img src={foto.url} alt={foto.titulo} style={{ width: '100%', height: '120px', objectFit: 'cover', backgroundColor: '#374151' }} />
                    <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, justifyContent: 'space-between' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', color: '#fff', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{foto.titulo}</p>
                      <button onClick={() => handleExcluirFoto(foto.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', width: '100%', fontWeight: 'bold' }}>
                        🗑️ Remover Foto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </section>

    </div>
  );
}