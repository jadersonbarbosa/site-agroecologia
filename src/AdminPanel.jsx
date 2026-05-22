import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient';

export default function AdminPanel({ setView }) {
  const [dados, setDados] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Criando referências (Refs) para rolar a tela até cada seção
  const secaoAdicionarRef = useRef(null);
  const secaoListaRef = useRef(null);
  const secaoGaleriaRef = useRef(null);

  // Estados do Formulário de Conteúdo (Vídeos / Artigos / Textos)
  const [idEditando, setIdEditando] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [url, setUrl] = useState('');
  const [tipo, setTipo] = useState('video'); // 'video', 'artigo' ou 'texto'

  // Estados do Formulário da Galeria
  const [tituloFoto, setTituloFoto] = useState('');
  const [urlFoto, setUrlFoto] = useState('');

  // Função auxiliar para rolar a tela de forma suave
  const rolarPara = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // -------------------------------------------------------------------------
  // 1. CARREGAMENTO DOS DADOS (BANCO DE DADOS)
  // -------------------------------------------------------------------------
  const buscarDados = async () => {
    if (!supabase || typeof supabase.from !== 'function') return;
    try {
      setCarregando(true);
      // Busca Vídeos, Artigos e Textos
      const resConteudos = await supabase.from('videos').select('*').order('created_at', { ascending: false });
      setDados(resConteudos.data || []);

      // Busca Fotos da Galeria
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
  // 2. AÇÕES DE CONTEÚDO (SALVAR / ATUALIZAR)
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
      buscarDados();
      rolarPara(secaoListaRef); // Rola de volta para a lista após salvar
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
    rolarPara(secaoAdicionarRef); // Rola a página para o formulário lá no topo
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
      alert("Erro ao subir foto: " + err.message);
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

      {/* Menu Lateral Esquerdo Fixo como Navegador / Atalho */}
      <aside style={{ width: '260px', backgroundColor: '#1f2937', padding: '1.5rem 1rem', borderRight: '1px solid #374151', position: 'sticky', top: '70px', height: 'calc(100vh - 70px)' }}>
        <p style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem', paddingLeft: '12px' }}>Navegar no Painel</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>
            <button
              onClick={() => rolarPara(secaoAdicionarRef)}
              style={{ width: '100%', textAlign: 'left', background: 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ➕ {idEditando ? '📝 Editando Agora' : '➕ Adicionar Vídeo/Artigo/Texto'}
            </button>
          </li>
          <li>
            <button
              onClick={() => rolarPara(secaoListaRef)}
              style={{ width: '100%', textAlign: 'left', background: 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              👁️ Visualizar / Editar Lista
            </button>
          </li>
          <li>
            <button
              onClick={() => rolarPara(secaoGaleriaRef)}
              style={{ width: '100%', textAlign: 'left', background: 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              🖼️ Gerenciar Galeria de Fotos
            </button>
          </li>
        </ul>
      </aside>

      {/* ÁREA CENTRAL ÚNICA CORRIDA (TUDO EM UM LUGAR SÓ) */}
      <section style={{ flex: 1, padding: '2rem 3rem', backgroundColor: '#111827', color: '#fff', display: 'flex', flexDirection: 'column', gap: '4rem' }}>

        {/* SEÇÃO 1: FORMULÁRIO DE CADASTRO / EDIÇÃO */}
        <div ref={secaoAdicionarRef} style={{ maxWidth: '700px', backgroundColor: '#1f2937', padding: '2rem', borderRadius: '8px', border: '1px solid #374151', scrollMarginTop: '2rem' }}>
          <h3 style={{ color: '#10b981', marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {idEditando ? '📝 Editando Conteúdo Selecionado' : '➕ Cadastrar Novo Recurso no Site'}
          </h3>
          <form onSubmit={handleSalvarConteudo} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Selecione o Destino do Conteúdo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ padding: '12px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563', fontWeight: '500' }}>
                <option value="video">🎥 Aba: Vídeos</option>
                <option value="artigo">📄 Aba: Artigos & PDFs</option>
                <option value="texto">📰 Aba: Textos & Notícias</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Nome / Título</label>
              <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }} placeholder="Ex: Técnicas de Manejo de Solo" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Endereço URL (Link completo)</label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }} placeholder="https://..." />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Resumo / Descrição Explicativa</label>
              <textarea rows="3" value={descricao} onChange={(e) => setDescricao(e.target.value)} style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563', resize: 'none' }} placeholder="Descreva brevemente o assunto..." />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" style={{ flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                {idEditando ? 'Salvar Alterações' : 'Gravar no Banco de Dados'}
              </button>
              {idEditando && (
                <button type="button" onClick={limparFormularioConteudo} style={{ backgroundColor: '#4b5563', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar Edição</button>
              )}
            </div>
          </form>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #374151', margin: 0 }} />

        {/* SEÇÃO 2: VISUALIZAR / EDITAR LISTA COMPLETA */}
        <div ref={secaoListaRef} style={{ scrollMarginTop: '2rem' }}>
          <h3 style={{ color: '#10b981', marginBottom: '1.5rem' }}>📋 Lista de Conteúdos Gravados no Banco (Vídeos, Artigos e Textos)</h3>
          {carregando ? (
            <p style={{ color: '#10b981' }}>Sincronizando dados...</p>
          ) : dados.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>Nenhum item localizado na tabela do banco.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dados.map((item) => {
                // Define a cor da tag baseado no tipo
                let tagCor = '#065f46';
                if (item.tipo === 'artigo') tagCor = '#1e3a8a';
                if (item.tipo === 'texto') tagCor = '#92400e';

                return (
                  <div key={item.id} style={{ backgroundColor: '#1f2937', padding: '1.2rem', borderRadius: '8px', border: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ backgroundColor: tagCor, color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {item.tipo === 'video' ? '🎥 VIDEO' : item.tipo === 'artigo' ? '📄 ARTIGO' : '📰 TEXTO / NOTÍCIA'}
                      </span>
                      <h4 style={{ margin: '0.6rem 0 0.2rem 0', fontSize: '1.1rem', color: '#fff' }}>{item.titulo}</h4>
                      <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>{item.descricao || 'Sem descrição inserida.'}</p>
                      {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', marginTop: '0.4rem' }}>🔗 Link de Origem</a>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => iniciarEdicao(item)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>📝 Editar</button>
                      <button onClick={() => handleExcluirConteudo(item.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>🗑️ Deletar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #374151', margin: 0 }} />

        {/* SEÇÃO 3: GERENCIAMENTO COMPLETO DA GALERIA */}
        <div ref={secaoGaleriaRef} style={{ scrollMarginTop: '2rem' }}>
          <h3 style={{ color: '#10b981', marginBottom: '1.5rem' }}>🖼️ Painel de Controle e Moderação da Galeria</h3>

          {/* Formulário para criar novas fotos */}
          <form onSubmit={handleSalvarFoto} style={{ backgroundColor: '#1f2937', padding: '1.5rem', borderRadius: '8px', border: '1px solid #374151', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Legenda da Imagem</label>
              <input type="text" value={tituloFoto} onChange={(e) => setTituloFoto(e.target.value)} placeholder="Ex: Área de Plantio Coberta" style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }} />
            </div>
            <div style={{ flex: 2, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Link Direto da Imagem (URL hospedada)</label>
              <input type="url" value={urlFoto} onChange={(e) => setUrlFoto(e.target.value)} placeholder="https://images.unsplash.com/..." style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }} />
            </div>
            <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              ➕ Publicar Foto
            </button>
          </form>

          {/* Listagem em Grade com Opção de Excluir Foto */}
          <h4 style={{ marginBottom: '1rem', color: '#9ca3af' }}>Imagens em Exibição no Site Público:</h4>
          {galeria.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Nenhuma imagem cadastrada no álbum.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {galeria.map((foto) => (
                <div key={foto.id} style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <img src={foto.url} alt={foto.titulo} style={{ width: '100%', height: '140px', objectFit: 'cover', backgroundColor: '#374151' }} />
                  <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, justifyContent: 'space-between' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', color: '#fff', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{foto.titulo}</p>
                    <button onClick={() => handleExcluirFoto(foto.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', width: '100%', fontWeight: 'bold' }}>
                      🗑️ Remover da Galeria
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

    </div>
  );
}