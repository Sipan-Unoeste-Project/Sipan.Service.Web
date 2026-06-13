import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { PessoasProvider } from './context/PessoasContext';
import AppNavbar from './components/AppNavbar';
import Navbar from './components/Navbar';
import Menu from './components/Menu';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import QuemSomos from './pages/QuemSomos';
import Contato from './pages/Contato';
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
import PaginaParceiros from './modules/parceiros/PaginaParceiros';

function AppContent() {
  const location = useLocation();
  const isQuemSomosRoute = location.pathname === '/';

  const routes = (
    <Routes>
      <Route path="/" element={<QuemSomos />} />
      <Route path="/publico/contato" element={<Contato />} />
      <Route path="/publico/animais" element={<PaginaAnimais />} />
      <Route path="/publico/doacoes" element={<ApacDoacoesPage />} />
      <Route path="/publico/campanhas" element={<ApacCampanhasPage />} />

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
       <Route path="/apac/parceiros" element={<PaginaParceiros />} />
    </Routes>
  );

  return (
    <div className="app-shell">
      {isQuemSomosRoute ? <Navbar /> : <AppNavbar />}

      {isQuemSomosRoute ? (
        <main className="app-main">{routes}</main>
      ) : (
        <>
          <div className="page-body">
            <Menu />
            <main className="app-main">{routes}</main>
          </div>
          <Footer />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <PessoasProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </PessoasProvider>
  );
}
