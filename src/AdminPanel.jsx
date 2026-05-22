import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient';

// ==========================================
// CONFIGURAÇÃO: AJUSTE OS NOMES DAS SUAS TABELAS AQUI
// ==========================================
const NOME_TABELA_CONTEUDO = 'videos'; // <-- SE REJEITAR, TROQUE PELO NOME DA SUA TABELA (ex: 'conteudos')
const NOME_TABELA_GALERIA = 'galeria';
const NOME_BUCKET_STORAGE = 'galeria'; // Nome do bucket criado no Storage do Supabase

export default function AdminPanel({ setView }) {
  const [dados, setDados] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [subindoImagem, setSubindoImagem] = useState(false);

  // Referências para rolagem de tela
  const secaoAdicionarRef = useRef(null);
  const secaoListaRef = useRef(null);
  const secaoGaleriaRef = useRef(null);

  // Estados do Formulário de Conteúdo (Vídeos / Artigos / Textos)
  const [idEditando, setIdEditando] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [url, setUrl] = useState('');
  const [tipo, setTipo] = useState('video');

  // Estados do Formulário da Galeria
  const [tituloFoto, setTituloFoto] = useState('');
  const [urlFoto, setUrlFoto] = useState('');

  const rolarPara = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // -------------------------------------------------------------------------
  // 1. CARREGAMENTO DOS DADOS
  // -------------------------------------------------------------------------
  const buscarDados = async () => {
    if (!supabase || typeof supabase.from !== 'function') return;
    try {
      setCarregando(true);

      const resConteudos = await supabase.from(NOME_TABELA_CONTEUDO).select('*').order('created_at', { ascending: false });
      if (resConteudos.error) console.error("Erro conteúdos:", resConteudos.error.message);
      setDados(resConteudos.data || []);

      const resGaleria = await supabase.from(NOME_TABELA_GALERIA).select('*').order('created_at', { ascending: false });
      setGaleria(resGaleria.data || []);
    } catch (err) {
      console.error("Erro geral ao carregar dados:", err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  // -------------------------------------------------------------------------
  // 2. UPLOAD DE IMAGEM DIRETO PARA O STORAGE DO SUPABASE
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // UPLOAD DE IMAGEM ADAPTADO (À PROVA DE FALHAS DE INITIALIZATION)
  // -------------------------------------------------------------------------
  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSubindoImagem(true);

      // Gera um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // PEGA A URL E A CHAVE DIRETO DO SEU CLIENTE (Evita ler propriedade undefined)
      const supabaseUrl = supabase.supabaseUrl || "https://sua-url-do-supabase.supabase.co";
      const supabaseKey = supabase.supabaseKey || "sua-chave-anon-public-aqui";

      // Monta a URL exata do endpoint de Storage do seu projeto
      const urlUpload = `${supabaseUrl}/storage/v1/object/${NOME_BUCKET_STORAGE}/${fileName}`;

      // Faz o upload usando um fetch nativo direto para a API do Supabase
      const response = await fetch(urlUpload, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': file.type
        },
        body: file
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro na requisição de upload");
      }

      // Constrói a URL pública final da imagem para salvar na tabela
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${NOME_BUCKET_STORAGE}/${fileName}`;

      setUrlFoto(publicUrl);
      alert("Imagem carregada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro no upload: " + error.message + "\nLembre-se de criar o Bucket Público 'galeria' no painel do Supabase.");
    } finally {
      setSubindoImagem(false);
    }
  };

  // -------------------------------------------------------------------------
  // 3. AÇÕES DE CONTEÚDO (VÍDEOS / ARTIGOS / TEXTOS)
  // -------------------------------------------------------------------------
  const handleSalvarConteudo = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) return alert("O título é obrigatório!");

    // URL só é obrigatória se o tipo for vídeo ou artigo
    if ((tipo === 'video' || tipo === 'artigo') && !url.trim()) {
      return alert(`Para o tipo ${tipo}, preencher a URL é obrigatório.`);
    }

    try {
      setCarregando(true);
      const payload = { titulo, descricao, url: url.trim() || null, tipo };

      if (idEditando) {
        const { error } = await supabase.from(NOME_TABELA_CONTEUDO).update(payload).eq('id', idEditando);
        if (error) throw error;
        alert("Conteúdo atualizado com sucesso!");
      } else {
        const { error } = await supabase.from(NOME_TABELA_CONTEUDO).insert([payload]);
        if (error) throw error;
        alert("Conteúdo cadastrado com sucesso!");
      }

      limparFormularioConteudo();
      buscarDados();
      rolarPara(secaoListaRef);
    } catch (err) {
      alert("Erro ao salvar: " + err.message + "\nSe o erro persistir, verifique a variável NOME_TABELA_CONTEUDO no topo do código.");
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluirConteudo = async (id) => {
    if (!window.confirm("Deseja mesmo excluir este item de forma permanente?")) return;
    try {
      setCarregando(true);
      const { error } = await supabase.from(NOME_TABELA_CONTEUDO).delete().eq('id', id);
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
    rolarPara(secaoAdicionarRef);
  };

  const limparFormularioConteudo = () => {
    setIdEditando(null);
    setTitulo('');
    setDescricao('');
    setUrl('');
    setTipo('video');
  };

  // -------------------------------------------------------------------------
  // 4. AÇÕES DA GALERIA DE FOTOS
  // -------------------------------------------------------------------------
  const handleSalvarFoto = async (e) => {
    e.preventDefault();
    if (!tituloFoto.trim() || !urlFoto.trim()) return alert("Adicione uma legenda e faça o upload de uma imagem primeiro!");

    try {
      setCarregando(true);
      const { error } = await supabase.from(NOME_TABELA_GALERIA).insert([{ titulo: tituloFoto, url: urlFoto }]);
      if (error) throw error;

      alert("Foto adicionada com sucesso!");
      setTituloFoto('');
      setUrlFoto('');
      buscarDados();
    } catch (err) {
      alert("Erro ao salvar foto: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluirFoto = async (id) => {
    if (!window.confirm("Remover esta foto da galeria pública?")) return;
    try {
      setCarregando(true);
      const { error } = await supabase.from(NOME_TABELA_GALERIA).delete().eq('id', id);
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

      {/* Menu Lateral Fixo / Atalhos */}
      <aside style={{ width: '260px', backgroundColor: '#1f2937', padding: '1.5rem 1rem', borderRight: '1px solid #374151', position: 'sticky', top: '70px', height: 'calc(100vh - 70px)' }}>
        <p style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem', paddingLeft: '12px' }}>Navegar no Painel</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>
            <button onClick={() => rolarPara(secaoAdicionarRef)} style={{ width: '100%', textAlign: 'left', background: 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              ➕ {idEditando ? '📝 Editando Agora' : '➕ Adicionar Conteúdo'}
            </button>
          </li>
          <li>
            <button onClick={() => rolarPara(secaoListaRef)} style={{ width: '100%', textAlign: 'left', background: 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              👁️ Visualizar / Editar Lista
            </button>
          </li>
          <li>
            <button onClick={() => rolarPara(secaoGaleriaRef)} style={{ width: '100%', textAlign: 'left', background: 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              🖼️ Gerenciar Galeria de Fotos
            </button>
          </li>
        </ul>
      </aside>

      {/* ÁREA CENTRAL ÚNICA CORRIDA */}
      <section style={{ flex: 1, padding: '2rem 3rem', backgroundColor: '#111827', color: '#fff', display: 'flex', flexDirection: 'column', gap: '4rem' }}>

        {/* SEÇÃO 1: FORMULÁRIO DE CADASTRO / EDIÇÃO */}
        <div ref={secaoAdicionarRef} style={{ maxWidth: '700px', backgroundColor: '#1f2937', padding: '2rem', borderRadius: '8px', border: '1px solid #374151', scrollMarginTop: '2rem' }}>
          <h3 style={{ color: '#10b981', marginTop: 0, marginBottom: '1.5rem' }}>
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
              <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }} placeholder="Título visível na página" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Endereço URL {tipo === 'texto' ? '(Opcional)' : '(Obrigatório)'}</label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }} placeholder={tipo === 'texto' ? 'https://... (deixe em branco se não houver)' : 'https://link-obrigatorio.com'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Resumo / Descrição Completa</label>
              <textarea rows="4" value={descricao} onChange={(e) => setDescricao(e.target.value)} style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563', resize: 'none' }} placeholder="Insira o texto informativo aqui..." />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" style={{ flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                {idEditando ? 'Salvar Alterações' : 'Gravar no Banco de Dados'}
              </button>
              {idEditando && (
                <button type="button" onClick={limparFormularioConteudo} style={{ backgroundColor: '#4b5563', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
              )}
            </div>
          </form>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #374151', margin: 0 }} />

        {/* SEÇÃO 2: VISUALIZAR / EDITAR LISTA COMPLETA */}
        <div ref={secaoListaRef} style={{ scrollMarginTop: '2rem' }}>
          <h3 style={{ color: '#10b981', marginBottom: '1.5rem' }}>📋 Lista de Conteúdos Gravados (Vídeos, Artigos e Textos)</h3>
          {carregando ? (
            <p style={{ color: '#10b981' }}>Sincronizando dados...</p>
          ) : dados.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>Nenhum item localizado no banco de dados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dados.map((item) => {
                let tagCor = '#065f46';
                if (item.tipo === 'artigo') tagCor = '#1e3a8a';
                if (item.tipo === 'texto') tagCor = '#92400e';

                return (
                  <div key={item.id} style={{ backgroundColor: '#1f2937', padding: '1.2rem', borderRadius: '8px', border: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ backgroundColor: tagCor, color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        {item.tipo === 'video' ? 'VIDEO' : item.tipo === 'artigo' ? 'ARTIGO' : 'TEXTO / NOTÍCIA'}
                      </span>
                      <h4 style={{ margin: '0.6rem 0 0.2rem 0', fontSize: '1.1rem' }}>{item.titulo}</h4>
                      <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>{item.descricao || 'Sem descrição.'}</p>
                      {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', marginTop: '0.4rem' }}>🔗 Link externo</a>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => iniciarEdicao(item)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer' }}>📝 Editar</button>
                      <button onClick={() => handleExcluirConteudo(item.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer' }}>🗑️ Deletar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #374151', margin: 0 }} />

        {/* SEÇÃO 3: GERENCIAMENTO DA GALERIA COM UPLOAD REAL */}
        <div ref={secaoGaleriaRef} style={{ scrollMarginTop: '2rem' }}>
          <h3 style={{ color: '#10b981', marginBottom: '1.5rem' }}>🖼️ Painel de Controle e Upload da Galeria</h3>

          <div style={{ backgroundColor: '#1f2937', padding: '1.5rem', borderRadius: '8px', border: '1px solid #374151', marginBottom: '2rem' }}>
            <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#fff' }}>Adicionar Nova Imagem</h4>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

              <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Legenda da Imagem</label>
                  <input type="text" value={tituloFoto} onChange={(e) => setTituloFoto(e.target.value)} placeholder="Ex: Mutirão Agroecológico Realizado" style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff', border: '1px solid #4b5563' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Selecionar arquivo de Imagem</label>
                  <input type="file" accept="image/*" onChange={handleUploadFoto} style={{ color: '#fff' }} />
                  {subindoImagem && <p style={{ color: '#10b981', margin: 0, fontSize: '0.85rem' }}>Enviando arquivo...</p>}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {urlFoto && (
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#9ca3af', display: 'block', marginBottom: '0.4rem' }}>Pré-visualização do Upload:</label>
                    <img src={urlFoto} alt="Preview" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #4b5563' }} />
                  </div>
                )}
                <button onClick={handleSalvarFoto} style={{ width: '100%', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-end', marginTop: urlFoto ? '0' : '1.5rem' }}>
                  💾 Publicar Foto no Site
                </button>
              </div>

            </div>
          </div>

          <h4 style={{ marginBottom: '1rem', color: '#9ca3af' }}>Imagens em Exibição Pública:</h4>
          {galeria.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Nenhuma imagem cadastrada no álbum.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {galeria.map((foto) => (
                <div key={foto.id} style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <img src={foto.url} alt={foto.titulo} style={{ width: '100%', height: '140px', objectFit: 'cover', backgroundColor: '#374151' }} />
                  <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, justifyContent: 'space-between' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', color: '#fff' }}>{foto.titulo}</p>
                    <button onClick={() => handleExcluirFoto(foto.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>🗑️ Remover</button>
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