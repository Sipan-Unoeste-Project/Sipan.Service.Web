import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { podeAcessarRota } from '../utils/permissoes';

export default function ProtectedRoute({ children }) {
  const { autenticado, carregando, usuario } = useAuth();
  const location = useLocation();

  if (carregando) {
    return (
      <div className="container py-5 text-center text-muted">
        Verificando sessão...
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!podeAcessarRota(usuario?.permissao, location.pathname)) {
    return <Navigate to="/inicio" replace />;
  }

  return children;
}
