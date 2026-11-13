import ActionIconButtons from '../../../components/ActionIconButtons';

const CardParceiro = ({ parceiro, onEditar, onExcluir }) => {
  const isAtivo = parceiro.status === 'ativo';

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body d-flex flex-column gap-2">

        <div className="d-flex justify-content-between align-items-start gap-2">
          <h5 className="card-title mb-0" style={{ wordBreak: 'break-word' }}>
            {parceiro.nome}
          </h5>
          <span
            className={`badge ${isAtivo ? 'bg-success' : 'bg-danger'}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            {isAtivo ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        {(parceiro.tipo || parceiro.tipoNome) && (
          <span className="badge bg-secondary" style={{ alignSelf: 'flex-start' }}>
            {parceiro.tipo || parceiro.tipoNome}
          </span>
        )}

        <p className="card-text text-muted small mb-0">
          <strong>CPF/CNPJ:</strong> {parceiro.cpfCnpj || '—'}
        </p>

        <p className="card-text text-muted small mb-0">
          <strong>Telefone:</strong> {parceiro.telefone || '—'}
        </p>

        <p
          className="card-text text-muted small mb-0"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <strong>E-mail:</strong> {parceiro.email || '—'}
        </p>

        <p className="card-text text-muted small mb-0">
          <strong>Endereço:</strong> {parceiro.endereco || '—'}
        </p>

        {parceiro.observacoes && (
          <p
            className="card-text text-muted small mb-0"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {parceiro.observacoes}
          </p>
        )}

        <div className="mt-auto pt-2">
          <ActionIconButtons
            onEdit={() => onEditar(parceiro)}
            onDelete={() => onExcluir(parceiro)}
          />
        </div>

      </div>
    </div>
  );
};

export default CardParceiro;
