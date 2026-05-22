import React, { useState } from 'react';

// Se você usa uma instância configurada do Supabase no seu projeto, importe-a aqui
// import { supabase } from '../lib/supabaseClient';

export default function FormularioEnvio() {
  const [formData, setFormData] = useState({
    nome_autor: '',
    email_autor: '',
    titulo: '',
    tipo: 'artigo',
    conteudo: ''
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

    try {
      // Aqui entra a chamada do Supabase integrada à lógica do Antigravity
      // const { error } = await supabase.from('envios_publico').insert([formData]);

      // Simulação de sucesso para teste local
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStatusMsg({
        type: 'success',
        text: 'Obrigado! Seu conteúdo foi enviado com sucesso e está aguardando moderação.'
      });

      // Limpa o formulário após o envio
      setFormData({ nome_autor: '', email_autor: '', titulo: '', tipo: 'artigo', conteudo: '' });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: 'Ops! Ocorreu um erro ao enviar. Tente novamente mais tarde.'
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
              <option value="artigo">Artigo / PDF</option>
              <option value="texto">Texto Informativo</option>
              <option value="sugestao_video">Sugestão de Vídeo (Link)</option>
            </select>
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Conteúdo ou Link da Mídia</label>
          <textarea
            name="conteudo" value={formData.conteudo} onChange={handleChange} required
            style={{ ...styles.input, height: '120px', resize: 'vertical' }}
            placeholder="Cole aqui o seu texto completo, o link do seu artigo científico ou o link do vídeo do YouTube..."
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Enviando...' : 'Enviar para Moderação'}
        </button>
      </form>
    </div>
  );
}

// Estilos inline básicos simulando um design limpo e moderno voltado para Agroecologia
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