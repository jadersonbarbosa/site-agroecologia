import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient';

const NOME_TABELA_CONTEUDO = 'conteudos';
const NOME_TABELA_GALERIA = 'galeria';
const NOME_BUCKET_STORAGE = 'galeria';

export default function AdminPanel({ setView }) {
  const [dados, setDados] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [subindoImagem, setSubindoImagem] = useState(false);

  const secaoAdicionarRef = useRef(null);
  const secaoListaRef = useRef(null);
  const secaoGaleriaRef = useRef(null);

  const [idEditando, setIdEditando] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [url, setUrl] = useState('');
  const [tipo, setTipo] = useState('video');

  const [tituloFoto, setTituloFoto] = useState('');
  const [urlFoto, setUrlFoto] = useState('');

  const rolarPara = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const buscarDados = async () => {
    try {
      setCarregando(true);
      const supabaseUrl = supabase.supabaseUrl;
      const supabaseKey = supabase.supabaseKey;

      // Busca direta de conteúdos
      const urlConteudos = `${supabaseUrl}/rest/v1/${NOME_TABELA_CONTEUDO}?select=*&order=created_at.desc`;
      const resConteudos = await fetch(urlConteudos, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Accept': 'application/json'
        }
      });
      if (resConteudos.ok) {
        const dadosC = await resConteudos.json();
        setDados(dadosC || []);
      }

      // Busca direta da galeria
      const urlGaleria = `${supabaseUrl}/rest/v1/${NOME_TABELA_GALERIA}?select=*&order=created_at.desc`;
      const resGaleria = await fetch(urlGaleria, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Accept': 'application/json'
        }
      });
      if (resGaleria.ok) {
        const dadosG = await resGaleria.json();
        setGaleria(dadosG || []);
      }
    } catch (err) {
      console.error("Erro ao buscar dados no painel:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSubindoImagem(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const supabaseUrl = supabase.supabaseUrl || "https://sua-url-do-supabase.supabase.co";
      const supabaseKey = supabase.supabaseKey || "sua-chave-anon-public-aqui";
      const urlUpload = `${supabaseUrl}/storage/v1/object/${NOME_BUCKET_STORAGE}/${fileName}`;

      const formData = new FormData();
      formData.append('cacheControl', '3600');
      formData.append('file', file);

      const response = await fetch(urlUpload, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${supabaseKey}`, 'apikey': supabaseKey },
        body: formData
      });

      if (!response.ok) throw new Error("Erro no Storage");

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${NOME_BUCKET_STORAGE}/${fileName}`;
      setUrlFoto(publicUrl);
      alert("Imagem carregada com sucesso!");
    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setSubindoImagem(false);
    }
  };

  const handleSalvarConteudo = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) return alert("O título é obrigatório!");

    try {
      setCarregando(true);
      // Mapeamento correto das colunas em inglês para inserção no banco
      const payload = {
        title: titulo.trim(),
        description: descricao.trim(),
        url: url.trim() || null,
        type: tipo
      };

      if (idEditando) {
        const { error } = await supabase.from(NOME_TABELA_CONTEUDO).update(payload).eq('id', idEditando);
        if (error) throw error;
        alert("Conteúdo atualizado!");
      } else {
        const { error } = await supabase.from(NOME_TABELA_CONTEUDO).insert([payload]);
        if (error) throw error;
        alert("Conteúdo cadastrado!");
      }

      limparFormularioConteudo();
      buscarDados();
      rolarPara(secaoListaRef);
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluirConteudo = async (id) => {
    if (!window.confirm("Excluir item permanentemente?")) return;
    try {
      setCarregando(true);
      const { error } = await supabase.from(NOME_TABELA_CONTEUDO).delete().eq('id', id);
      if (error) throw error;
      buscarDados();
    } catch (err) {
      alert(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const iniciarEdicao = (item) => {
    setIdEditando(item.id);
    setTitulo(item.title || '');
    setDescricao(item.description || '');
    setUrl(item.url || '');
    setTipo(item.type || 'video');
    rolarPara(secaoAdicionarRef);
  };

  const limparFormularioConteudo = () => {
    setIdEditando(null);
    setTitulo('');
    setDescricao('');
    setUrl('');
    setTipo('video');
  };

  const handleSalvarFoto = async (e) => {
    e.preventDefault();
    if (!tituloFoto.trim() || !urlFoto.trim()) return alert("Preencha todos os campos da foto!");

    try {
      setCarregando(true);
      const { error } = await supabase.from(NOME_TABELA_GALERIA).insert([{ titulo: tituloFoto.trim(), url: urlFoto.trim() }]);
      if (error) throw error;
      alert("Foto publicada!");
      setTituloFoto(''); setUrlFoto('');
      buscarDados();
    } catch (err) {
      alert(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluirFoto = async (id) => {
    if (!window.confirm("Remover foto?")) return;
    try {
      setCarregando(true);
      const { error } = await supabase.from(NOME_TABELA_GALERIA).delete().eq('id', id);
      if (error) throw error;
      buscarDados();
    } catch (err) {
      alert(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', backgroundColor: '#111827' }}>
      <aside style={{ width: '260px', backgroundColor: '#1f2937', padding: '1.5rem 1rem', borderRight: '1px solid #374151', position: 'sticky', top: '70px', height: 'calc(100vh - 70px)' }}>
        <p style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem', paddingLeft: '12px' }}>Painel Admin</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li><button onClick={() => rolarPara(secaoAdicionarRef)} style={{ width: '100%', textAlign: 'left', background: 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>➕ {idEditando ? '📝 Editando' : '➕ Novo Conteúdo'}</button></li>
          <li><button onClick={() => rolarPara(secaoListaRef)} style={{ width: '100%', textAlign: 'left', background: 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>👁️ Lista Geral</button></li>
          <li><button onClick={() => rolarPara(secaoGaleriaRef)} style={{ width: '100%', textAlign: 'left', background: 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>🖼️ Galeria de Fotos</button></li>
        </ul>
      </aside>

      <section style={{ flex: 1, padding: '2rem 3rem', backgroundColor: '#111827', color: '#fff', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        <div ref={secaoAdicionarRef} style={{ maxWidth: '700px', backgroundColor: '#1f2937', padding: '2rem', borderRadius: '8px', border: '1px solid #374151' }}>
          <h3 style={{ color: '#10b981', marginTop: 0 }}>{idEditando ? '📝 Editando Conteúdo' : '➕ Cadastrar Recurso'}</h3>
          <form onSubmit={handleSalvarConteudo} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ padding: '12px', borderRadius: '4px', backgroundColor: '#374151', color: '#fff' }}>
              <option value="video">🎥 Aba: Vídeos</option>
              <option value="artigo">📄 Aba: Artigos & PDFs</option>
              <option value="texto">📰 Aba: Textos & Notícias</option>
            </select>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} style={{ padding: '10px', backgroundColor: '#374151', color: '#fff' }} placeholder="Título" />
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} style={{ padding: '10px', backgroundColor: '#374151', color: '#fff' }} placeholder="URL (Opcional para texto)" />
            <textarea rows="4" value={descricao} onChange={(e) => setDescricao(e.target.value)} style={{ padding: '10px', backgroundColor: '#374151', color: '#fff', resize: 'none' }} placeholder="Descrição..." />
            <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', padding: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Salvar no Banco</button>
          </form>
        </div>

        <hr style={{ borderTop: '1px solid #374151' }} />

        <div ref={secaoListaRef}>
          <h3 style={{ color: '#10b981' }}>📋 Itens na Tabela 'conteudos'</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dados.map((item) => (
              <div key={item.id} style={{ backgroundColor: '#1f2937', padding: '1.2rem', borderRadius: '8px', border: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ backgroundColor: '#065f46', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem' }}>{item.type?.toUpperCase()}</span>
                  <h4 style={{ margin: '0.6rem 0 0.2rem 0' }}>{item.title}</h4>
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>{item.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => iniciarEdicao(item)} style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '8px', cursor: 'pointer' }}>📝 Editar</button>
                  <button onClick={() => handleExcluirConteudo(item.id)} style={{ backgroundColor: '#ef4444', color: '#fff', padding: '8px', cursor: 'pointer' }}>🗑️ Deletar</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr style={{ borderTop: '1px solid #374151' }} />

        <div ref={secaoGaleriaRef}>
          <h3>🖼️ Controle da Galeria</h3>
          <div style={{ backgroundColor: '#1f2937', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <input type="text" value={tituloFoto} onChange={(e) => setTituloFoto(e.target.value)} placeholder="Legenda da Foto" style={{ padding: '10px', width: '100%', marginBottom: '1rem' }} />
            <input type="file" accept="image/*" onChange={handleUploadFoto} />
            {subindoImagem && <p>Enviando imagem...</p>}
            {urlFoto && <img src={urlFoto} style={{ width: '100px', display: 'block', marginTop: '1rem' }} alt="Preview" />}
            <button onClick={handleSalvarFoto} style={{ width: '100%', backgroundColor: '#10b981', color: '#fff', padding: '12px', marginTop: '1rem', cursor: 'pointer' }}>Publicar Foto</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {galeria.map((foto) => (
              <div key={foto.id} style={{ backgroundColor: '#1f2937', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={foto.url} style={{ width: '100%', height: '120px', objectFit: 'cover' }} alt="" />
                <div style={{ padding: '0.5rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>{foto.titulo}</p>
                  <button onClick={() => handleExcluirFoto(foto.id)} style={{ backgroundColor: '#ef4444', color: '#fff', width: '100%', marginTop: '0.5rem', cursor: 'pointer' }}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}