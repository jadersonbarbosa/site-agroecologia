import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient'; // Garanta que está com as chaves {}

export default function AdminPanel({ setView }) {
  const [adminTab, setAdminTab] = useState('enviar');
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Busca dados de forma segura, checando se o supabase existe antes
  const buscarDados = async () => {
    // TRAVA DE SEGURANÇA 1: Se o supabase não inicializou por algum motivo, não deixa quebrar o código
    if (!supabase || typeof supabase.from !== 'function') {
      console.error("Supabase ainda não foi inicializado corretamente.");
      return;
    }

    try {
      setCarregando(true);
      // Altere 'videos' para o nome exato da sua tabela no banco de dados
      const { data, error } = await supabase.from('videos').select('*');

      if (error) throw error;
      setDados(data || []);
    } catch (err) {
      console.error("Erro ao buscar dados do banco:", err.message);
    } finally {
      setCarregando(false);
    }
  };

  // Dispara a busca sempre que mudar para a aba de alimentar conteúdo
  useEffect(() => {
    if (adminTab === 'alimentar') {
      buscarDados();
    }
  }, [adminTab]);

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', backgroundColor: '#111827' }}>

      {/* Menu Lateral Esquerdo */}
      <aside style={{ width: '260px', backgroundColor: '#1f2937', padding: '1.5rem 1rem', borderRight: '1px solid #374151' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>
            <button
              onClick={() => setAdminTab('enviar')}
              style={{ width: '100%', textAlign: 'left', background: adminTab === 'enviar' ? '#10b981' : 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              ➕ Enviar Vídeos
            </button>
          </li>
          <li>
            <button
              onClick={() => setAdminTab('alimentar')}
              style={{ width: '100%', textAlign: 'left', background: adminTab === 'alimentar' ? '#10b981' : 'none', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              🔄 Alimentar Vídeos/Artigos
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
      <section style={{ flex: 1, padding: '2rem', backgroundColor: '#111827', color: '#fff' }}>

        {adminTab === 'enviar' && (
          <div>
            <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>Formulário de Cadastro de Vídeos</h3>
            <p style={{ color: '#9ca3af' }}>O seu formulário original de envio de vídeos renderiza aqui.</p>
          </div>
        )}

        {adminTab === 'alimentar' && (
          <div>
            <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>Gerenciamento de Conteúdo</h3>

            {carregando ? (
              <p style={{ color: '#10b981' }}>Carregando dados do Supabase...</p>
            ) : dados.length === 0 ? (
              <p style={{ color: '#9ca3af' }}>Nenhum registro encontrado ou carregando dados da tabela...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dados.map((item) => (
                  <div key={item.id} style={{ backgroundColor: '#1f2937', padding: '1rem', borderRadius: '6px', border: '1px solid #374151' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.titulo || 'Sem título'}</h4>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>{item.descricao || 'Sem descrição'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {adminTab === 'galeria' && (
          <div>
            <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>Moderação da Galeria</h3>
            <p style={{ color: '#9ca3af' }}>Área para subir novas fotos do mutirão ou gerenciar as existentes.</p>
          </div>
        )}

      </section>

    </div>
  );
}