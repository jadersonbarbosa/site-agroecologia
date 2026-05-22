import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

export default function AdminPanel({ setView }) {
  const [adminTab, setAdminTab] = useState('alimentar'); // Começa na listagem para visualizar
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Estados para o Formulário (Adicionar / Editar)
  const [idEditando, setIdEditando] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [url, setUrl] = useState('');
  const [tipo, setTipo] = useState('video'); // 'video' ou 'artigo'

  // 1. FUNÇÃO PARA BUSCAR / VISUALIZAR CONTEÚDO
  const buscarDados = async () => {
    if (!supabase || typeof supabase.from !== 'function') {
      console.error("Supabase não inicializado.");
      return;
    }
    try {
      setCarregando(true);
      // Altere 'conteudos' para o nome exato da sua tabela no Supabase se for diferente
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDados(data || []);
    } catch (err) {
      console.error("Erro ao buscar dados:", err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  // 2. FUNÇÃO PARA ADICIONAR OU SALVAR EDIÇÃO
  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) return alert("O título é obrigatório!");

    try {
      setCarregando(true);
      const payload = { titulo, descricao, url, tipo };

      if (idEditando) {
        // Modo Editar
        const { error } = await supabase
          .from('videos')
          .update(payload)
          .eq('id', idEditando);
        if (error) throw error;
        alert("Conteúdo atualizado com sucesso!");
      } else {
        // Modo Adicionar Novo
        const { error } = await supabase
          .from('videos')
          .insert([payload]);
        if (error) throw error;
        alert("Novo conteúdo adicionado com sucesso!");
      }

      // Limpa o formulário e atualiza a tela
      limparFormulario();
      setAdminTab('alimentar');
      buscarDados();
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  // 3. FUNÇÃO PARA EXCLUIR CONTEÚDO
  const handleExcluir = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este item?")) return;

    try {
      setCarregando(true);
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      buscarDados();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  // Prepara os campos para edição
  const iniciarEdicao = (item) => {
    setIdEditando(item.id);
    setTitulo(item.titulo || '');
    setDescricao(item.descricao || '');
    setUrl(item.url || '');
    setTipo(item.tipo || 'video');
    setAdminTab('enviar'); // Muda para a aba do formulário
  };

  const limparFormulario = () => {
    setIdEditando(null);
    setTitulo('');
    setDescricao('');
    setUrl('');
    setTipo('video');
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', backgroundColor: '#111827' }}>

      {/* Menu Lateral Esquerdo */}
      <aside style={{ width: '260px', backgroundColor: '#1f2937', padding: '1.5rem 1rem', borderRight: '1px solid #374151' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>
            <button
              onClick={() => { limparFormulario(); setAdminTab('enviar'); }}
              style={{ width: '100%', textAlign: 'left', background: adminTab === 'enviar' ? '#10b981' : 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              ➕ {idEditando ? '📝 Editando Item' : '➕ Adicionar Conteúdo'}
            </button>
          </li>
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
              onClick={() => setAdminTab('galeria')}
              style={{ width: '100%', textAlign: 'left', background: adminTab === 'galeria' ? '#10b981' : 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              🖼️ Galeria de Fotos
            </button>
          </li>
        </ul>
      </aside>

      {/* Conteúdo da Sub-Aba Direita */}
      <section style={{ flex: 1, padding: '2rem', backgroundColor: '#111827', color: '#fff', overflowY: 'auto' }}>

        {/* ABA: FORMULÁRIO ADICIONAR / EDITAR */}
        {adminTab === 'enviar' && (
          <div style={{ maxWidth: '600px', backgroundColor: '#1f2937', padding: '2rem', borderRadius: '8px', border: '1px solid #374151' }}>
            <h3 style={{ color: '#10b981', marginTop: 0, marginBottom: '1.5rem' }}>
              {idEditando ? '📝 Editar Conteúdo' : '➕ Cadastrar Novo Conteúdo'}
            </h3>

            <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Tipo de Conteúdo</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }}>
                  <option value="video">🎥 Vídeo</option>
                  <option value="artigo">📄 Artigo / PDF</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Título</label>
                <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Introdução à Sintropia" style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Link / URL (Vídeo ou Arquivo)</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Descrição curta</label>
                <textarea rows="3" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Resumo do conteúdo..." style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563', resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={carregando} style={{ flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {carregando ? 'Salvando...' : idEditando ? 'Salvar Alterações' : 'Cadastrar Conteúdo'}
                </button>
                {idEditando && (
                  <button type="button" onClick={() => { limparFormulario(); setAdminTab('alimentar'); }} style={{ backgroundColor: '#4b5563', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ABA: VISUALIZAR / GERENCIAR LISTA (EDITAR E EXCLUIR) */}
        {adminTab === 'alimentar' && (
          <div>
            <h3 style={{ color: '#10b981', marginBottom: '1.5rem' }}>📋 Gerenciamento de Conteúdos Salvos</h3>

            {carregando ? (
              <p style={{ color: '#10b981' }}>Carregando dados do Supabase...</p>
            ) : dados.length === 0 ? (
              <p style={{ color: '#9ca3af' }}>Nenhum registro encontrado no banco de dados.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dados.map((item) => (
                  <div key={item.id} style={{ backgroundColor: '#1f2937', padding: '1.2rem', borderRadius: '8px', border: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ backgroundColor: item.tipo === 'video' ? '#065f46' : '#1e3a8a', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginRight: '0.5rem' }}>
                        {item.tipo === 'video' ? '🎥 VÍDEO' : '📄 ARTIGO'}
                      </span>
                      <h4 style={{ margin: '0.5rem 0 0.3rem 0', fontSize: '1.1rem' }}>{item.titulo}</h4>
                      <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>{item.descricao || 'Sem descrição cadastrada.'}</p>
                      {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', marginTop: '0.4rem' }}>🔗 Ver link enviado</a>}
                    </div>

                    {/* BOTÕES DE AÇÃO: EDITAR E EXCLUIR */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => iniciarEdicao(item)}
                        style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                      >
                        📝 Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(item.id)}
                        style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: GALERIA */}
        {adminTab === 'galeria' && (
          <div>
            <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>🖼️ Moderação da Galeria de Fotos</h3>
            <p style={{ color: '#9ca3af' }}>Área reservada para o upload de fotos dos mutirões agroecológicos.</p>
          </div>
        )}

      </section>

    </div>
  );
}