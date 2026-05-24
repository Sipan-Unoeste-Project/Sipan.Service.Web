import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PessoasProvider } from './context/PessoasContext';
import AppNavbar from './components/AppNavbar';
import HomePage from './pages/HomePage';
import PessoasPage from './pages/PessoasPage';
import NovaPessoaPage from './pages/NovaPessoaPage';
import EditarPessoaPage from './pages/EditarPessoaPage';
import Usuarios from './modules/sipan/pages/Usuarios';
import Funcionarios from './modules/sipan/pages/Funcionarios';
import PaginaAnimais from './modules/animais/paginas/PaginaAnimais';
import ApacPainelPage from './modules/apac/pages/ApacPainelPage';
import ApacDoacoesPage from './modules/apac/pages/ApacDoacoesPage';
import ApacCampanhasPage from './modules/apac/pages/ApacCampanhasPage';
import ApacEstoquePage from './modules/apac/pages/ApacEstoquePage';
import ApacFinanceiroPage from './modules/apac/pages/ApacFinanceiroPage';
import ApacDespesasPage from './modules/apac/pages/ApacDespesasPage';
import ApacSaudePage from './modules/apac/pages/ApacSaudePage';
import ApacBalancetePage from './modules/apac/pages/ApacBalancetePage';

export default function App() {
  return (
    <PessoasProvider>
      <BrowserRouter>
        <div className="app-shell">
          <AppNavbar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />

              <Route path="/pessoas" element={<PessoasPage />} />
              <Route path="/pessoas/nova" element={<NovaPessoaPage />} />
              <Route path="/pessoas/:id/editar" element={<EditarPessoaPage />} />

              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/funcionarios" element={<Funcionarios />} />

              <Route path="/animais" element={<PaginaAnimais />} />

              <Route path="/apac" element={<ApacPainelPage />} />
              <Route path="/apac/doacao" element={<ApacDoacoesPage />} />
              <Route path="/apac/campanhas" element={<ApacCampanhasPage />} />
              <Route path="/apac/estoque" element={<ApacEstoquePage />} />
              <Route path="/apac/financeiro" element={<ApacFinanceiroPage />} />
              <Route path="/apac/despesas" element={<ApacDespesasPage />} />
              <Route path="/apac/saude" element={<ApacSaudePage />} />
              <Route path="/apac/balancete" element={<ApacBalancetePage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </PessoasProvider>
  );
}
