import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaginaAnimais from './paginas/PaginaAnimais';
import Navbar from './componentes/navbar/Navbar';
import Menu from './componentes/menu/Menu';
import Footer from './componentes/footer/Footer';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />

        <div className="main-layout">
          <Menu />
          
          <main className="content">
            <Routes>
              <Route path="/animais" element={<PaginaAnimais />} />
            </Routes>
          </main>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
