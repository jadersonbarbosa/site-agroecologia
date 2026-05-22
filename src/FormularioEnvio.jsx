import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient'; // Conexão direta ativa

export default function FormularioEnvio() {
  const [formData, setFormData] = useState({
    nome_autor: '',
    email_autor: '',
    titulo: '',
    tipo: 'artigo', // 'artigo', 'texto', ou 'video'
    conteudo: ''    // Link ou texto descritivo
  });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    if (!formData.titulo.trim()) {
      setLoading(false);
      return setStatusMsg({ type: 'error', text: 'O título do conteúdo é obrigatório!' });
    }

    try {
      // Ajustando o tipo 'sugestao_video' para 'video' para bater com o banco de dados
      const tipoCorreto = formData.tipo === 'sugestao_video' ? 'video' : formData.tipo;

      // Mapeando os campos para a tabela correta ('videos') que o Admin gerencia
      const payload = {
        titulo: formData.titulo,
        tipo: tipoCorreto,
        // Se for um texto/notícia, o conteúdo vai para a descrição. Se for link, vai para a URL.
        descricao: tipoCorreto === 'texto' ? formData.conteudo : `Enviado por: ${formData.nome_autor} (${formData.email_autor}). \n\nResumo: ${formData.conteudo}`,
        url: tipoCorreto !== 'texto' ? formData.conteudo.trim() : null
      };

      // Inserção real no banco de dados do Supabase
      const { error } = await supabase.from('videos').insert([payload]);

      if (error) throw error;

      setStatusMsg({
        type: 'success',
        text: 'Obrigado! Seu conteúdo foi enviado com sucesso e já está disponível no painel administrativo para visualização/edição.'
      });

      // Limpa o formulário após o sucesso
      setFormData({ nome_autor: '', email_autor: '', titulo: '', tipo: 'artigo', conteudo: '' });
    } catch (err) {
      console.error("Erro ao enviar dados:", err.message);
      setStatusMsg({
        type: 'error',
        text: `Erro ao enviar: ${err.message}. Verifique a conexão com o banco.`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🌱 Compartilhe seu Conhecimento</h2>
      <p style={styles.subtitle}>Envie artigos, textos ou sugestões de vídeos de Agroecologia para nossa equipe avaliar e publicar no site.</p>

      {statusMsg.text && (
        <div style={{
          ...styles.alert,
          backgroundColor: statusMsg.type === 'success' ? '#e6f4ea' : '#fce8e6',
          color: statusMsg.type === 'success' ? '#137333' : '#c5221f'
        }}>
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.group}>
            <label style={styles.label}>Seu Nome</label>
            <input
              type="text" name="nome_autor" value={formData.nome_autor}
              onChange={handleChange} required style={styles.input} placeholder="Ex: João Silva"
            />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Seu E-mail</label>
            <input
              type="email" name="email_autor" value={formData.email_autor}
              onChange={handleChange} required style={styles.input} placeholder="Ex: joao@email.com"
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.group}>
            <label style={styles.label}>Título do Conteúdo</label>
            <input
              type="text" name="titulo" value={formData.titulo}
              onChange={handleChange} required style={styles.input} placeholder="Ex: Práticas de Permacultura no Sertão"
            />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Tipo de Conteúdo</label>
            <select
              name="tipo" value={formData.tipo}
              onChange={handleChange} style={styles.input}
            >
              <option value="artigo">Artigo / PDF (Link)</option>
              <option value="texto">Texto Informativo / Notícia</option>
              <option value="sugestao_video">Sugestão de Vídeo (Link)</option>
            </select>
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>
            {formData.tipo === 'texto' ? 'Escreva o texto informativo ou notícia completo:' : 'Cole aqui o Link da mídia/artigo:'}
          </label>
          <textarea
            name="conteudo" value={formData.conteudo} onChange={handleChange} required
            style={{ ...styles.input, height: '120px', resize: 'vertical' }}
            placeholder={formData.tipo === 'texto' ? "Escreva o texto aqui..." : "https://link-do-seu-conteudo.com"}
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Enviando ao banco...' : 'Enviar para Moderação'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '700px', margin: '2rem auto', padding: '2rem', borderRadius: '12px', backgroundColor: '#fdfdfd', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0', fontFamily: 'system-ui, sans-serif' },
  title: { fontSize: '1.6rem', color: '#1a4a1f', margin: '0 0 0.5rem 0' },
  subtitle: { fontSize: '0.95rem', color: '#555', marginBottom: '1.5rem', lineHeight: '1.5' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  row: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  group: { flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.88rem', fontWeight: '600', color: '#333' },
  input: { padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fff' },
  button: { padding: '0.85rem', borderRadius: '6px', border: 'none', backgroundColor: '#1a4a1f', color: '#fff', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s', marginTop: '0.5rem' },
  alert: { padding: '1rem', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.4', fontWeight: '500' }
};