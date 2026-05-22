import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient'; // O import do passo 4
import FormularioEnvio from './FormularioEnvio';
import AdminPanel from './AdminPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('videos');
  const [view, setView] = useState('publico'); // Controla se está na home ou no admin

  // 💾 PASSO 5: COLOCAR EXATAMENTE AQUI DENTRO DO COMPONENTE APP
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Pega a sessão ativa assim que o site carrega
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Monitoriza se o utilizador fez login ou logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fim do Passo 5 -----------------------------------------

  // Agora vem a lógica que decide o que vai aparecer no ecrã:
  if (view === 'admin') {
    // Coloque aqui o seu e-mail do Google que configurou como administrador
    if (user && user.email === 'paulet.ana1@gmail.com') {
      return <AdminPanel setView={setView} />;
    } else {
      return (
        <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: '#f4f7f5', minHeight: '100vh' }}>
          <h2 style={{ color: '#1a4a1f' }}>Acesso Restrito 🛑</h2>
          <p>Apenas o administrador da Plataforma Agroecológica tem permissão para aceder a esta área.</p>
          <button
            onClick={() => setView('publico')}
            style={{
              backgroundColor: '#1a4a1f',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Voltar para o Início
          </button>
        </div>
      );
    }
  }

  // Se a view não for 'admin', ele continua e renderiza o HTML público normal abaixo:
  return (
    <div>
      {/* O resto do código do seu site (Header, Navbar, Conteúdo...) continua aqui */}
    </div>
  );
}