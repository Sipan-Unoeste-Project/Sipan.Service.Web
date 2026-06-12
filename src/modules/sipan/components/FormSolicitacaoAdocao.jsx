import { useState, useEffect } from 'react';
import { maskCPF, maskPhone } from '../../../utils/masks';

const ANIMAIS_MOCK = [
  { id: 1, nome: 'Rex', especie: 'Cachorro', raca: 'Vira-lata' },
  { id: 2, nome: 'Mimi', especie: 'Gato', raca: 'Siamês' },
  { id: 3, nome: 'Bolinha', especie: 'Cachorro', raca: 'Poodle' },
];

export default function FormSolicitacao({
  solicitacoes,
  setSolicitacoes,
  editandoId,
  setEditandoId,
  onSuccess,
  onError,
}) {
  const [nomeAdotante, setNomeAdotante] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [animalId, setAnimalId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [temOutrosAnimais, setTemOutrosAnimais] = useState('');
  const [temCriancas, setTemCriancas] = useState('');
  const [tipoResidencia, setTipoResidencia] = useState('');
  const [aceitaTermo, setAceitaTermo] = useState(false);
  const [mostrarTermo, setMostrarTermo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const animais = ANIMAIS_MOCK;

  useEffect(() => {
    if (editandoId == null) return;
    const s = solicitacoes.find((s) => s.id === editandoId);
    if (!s) return;
    setNomeAdotante(s.nomeAdotante);
    setCpf(s.cpf);
    setTelefone(s.telefone);
    setEmail(s.email);
    setEndereco(s.endereco);
    setAnimalId(String(s.animalId));
    setMotivo(s.motivo);
    setTemOutrosAnimais(s.temOutrosAnimais);
    setTemCriancas(s.temCriancas);
    setTipoResidencia(s.tipoResidencia);
    setAceitaTermo(true);
  }, [editandoId, solicitacoes]);

  function limparCampos() {
    setNomeAdotante('');
    setCpf('');
    setTelefone('');
    setEmail('');
    setEndereco('');
    setAnimalId('');
    setMotivo('');
    setTemOutrosAnimais('');
    setTemCriancas('');
    setTipoResidencia('');
    setAceitaTermo(false);
    setEditandoId(null);
  }

  async function salvar() {
    if (!nomeAdotante || !cpf || !telefone || !email || !animalId || !motivo || !tipoResidencia) {
      onError?.('Preencha todos os campos obrigatórios.');
      return;
    }
    if (!aceitaTermo) {
      onError?.('Você precisa aceitar o termo de responsabilidade.');
      return;
    }

    const body = {
      nomeAdotante,
      cpf,
      telefone,
      email,
      endereco,
      animalId: Number(animalId),
      motivo,
      temOutrosAnimais,
      temCriancas,
      tipoResidencia,
      status: 'Pendente',
      dataSolicitacao: new Date().toISOString(),
    };

    setSalvando(true);

    try {
      if (editandoId != null) {
        setSolicitacoes(solicitacoes.map((s) =>
          s.id === editandoId ? { ...body, id: editandoId } : s
        ));
        onSuccess?.('Solicitação atualizada com sucesso.');
      } else {
        setSolicitacoes([...solicitacoes, { ...body, id: Date.now() }]);
        onSuccess?.('Solicitação registrada com sucesso.');
      }
      limparCampos();
    } catch (err) {
      onError?.('Erro ao salvar solicitação.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <h4 className="mb-4">
          {editandoId != null ? 'Editar Solicitação' : 'Nova Solicitação de Adoção'}
        </h4>

        <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          Dados do Adotante
        </h6>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Nome completo <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="Nome do adotante"
              value={nomeAdotante}
              onChange={(e) => setNomeAdotante(e.target.value)}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">CPF <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="000.000.000-00"
              maxLength={14}
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Telefone <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="(00) 00000-0000"
              maxLength={15}
              value={telefone}
              onChange={(e) => setTelefone(maskPhone(e.target.value))}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">E-mail <span className="text-danger">*</span></label>
            <input
              type="email"
              className="form-control"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="col-12 mb-3">
            <label className="form-label">Endereço</label>
            <input
              type="text"
              className="form-control"
              placeholder="Rua, número, bairro, cidade"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
          </div>
        </div>

        <hr className="my-3" />
        <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          Dados da Adoção
        </h6>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Animal desejado <span className="text-danger">*</span></label>
            <select
              className="form-select"
              value={animalId}
              onChange={(e) => setAnimalId(e.target.value)}
            >
              <option value="">Selecione um animal</option>
              {animais.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} — {a.especie} {a.raca ? `(${a.raca})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Tipo de residência <span className="text-danger">*</span></label>
            <select
              className="form-select"
              value={tipoResidencia}
              onChange={(e) => setTipoResidencia(e.target.value)}
            >
              <option value="">Selecione</option>
              <option>Casa com quintal</option>
              <option>Casa sem quintal</option>
              <option>Apartamento</option>
              <option>Sítio / Fazenda</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Possui outros animais?</label>
            <select
              className="form-select"
              value={temOutrosAnimais}
              onChange={(e) => setTemOutrosAnimais(e.target.value)}
            >
              <option value="">Selecione</option>
              <option>Sim</option>
              <option>Não</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Possui crianças em casa?</label>
            <select
              className="form-select"
              value={temCriancas}
              onChange={(e) => setTemCriancas(e.target.value)}
            >
              <option value="">Selecione</option>
              <option>Sim</option>
              <option>Não</option>
            </select>
          </div>

          <div className="col-12 mb-3">
            <label className="form-label">Motivo da adoção <span className="text-danger">*</span></label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Conte um pouco sobre por que deseja adotar este animal..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
        </div>

        <hr className="my-3" />
        <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          Termo de Responsabilidade
        </h6>

        <div className="card bg-light border-0 mb-3 p-3" style={{ fontSize: '0.875rem' }}>
          <p className="mb-2">Ao assinar este termo, o adotante declara que:</p>
          <ul className="mb-0 ps-3">
            <li>Está ciente das responsabilidades de cuidado, alimentação e saúde do animal.</li>
            <li>Compromete-se a não abandonar, maltratar ou repassar o animal sem autorização da instituição.</li>
            <li>Permite visitas de acompanhamento pela equipe da APAC quando solicitado.</li>
            <li>Em caso de impossibilidade de manter o animal, retornará à instituição.</li>
          </ul>
          {!mostrarTermo && (
            <button
              type="button"
              className="btn btn-link p-0 mt-2 text-start"
              style={{ fontSize: '0.8rem' }}
              onClick={() => setMostrarTermo(true)}
            >
              Ver termo completo
            </button>
          )}
          {mostrarTermo && (
            <p className="mt-2 text-muted" style={{ fontSize: '0.8rem' }}>
              O adotante se compromete a oferecer ao animal um ambiente seguro, limpo e adequado às suas necessidades.
              O animal deverá ser mantido vacinado e vermifugado regularmente. O adotante concorda em comunicar
              à instituição qualquer problema de saúde grave do animal. A guarda do animal poderá ser revertida
              em caso de descumprimento deste termo.
            </p>
          )}
        </div>

        <div className="form-check mb-4">
          <input
            className="form-check-input"
            type="checkbox"
            id="aceitaTermo"
            checked={aceitaTermo}
            onChange={(e) => setAceitaTermo(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="aceitaTermo">
            Li e aceito o termo de responsabilidade <span className="text-danger">*</span>
          </label>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={limparCampos}
            disabled={salvando}
          >
            Limpar
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={salvar}
            disabled={salvando}
          >
            {salvando
              ? 'Salvando...'
              : editandoId != null
              ? 'Salvar Alterações'
              : 'Enviar Solicitação'}
          </button>
        </div>
      </div>
    </div>
  );
}