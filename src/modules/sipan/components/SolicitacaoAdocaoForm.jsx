import { useState } from 'react';
import FormSelect from '../../../components/FormSelect';
import { maskCPF, maskPhone } from '../../../utils/masks';

const EMPTY_FORM = {
  nomeAdotante: '',
  cpf: '',
  telefone: '',
  email: '',
  endereco: '',
  animalId: '',
  motivo: '',
  temOutrosAnimais: '',
  temCriancas: '',
  tipoResidencia: '',
  aceitaTermo: false,
  status: 'Pendente',
};

export default function SolicitacaoAdocaoForm({
  initialData = EMPTY_FORM,
  animais = [],
  isEditing = false,
  onSubmit,
  onCancel,
  submitLabel = 'Enviar Solicitação',
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialData, animalId: String(initialData.animalId ?? '') });
  const [mostrarTermo, setMostrarTermo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroLocal, setErroLocal] = useState('');

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErroLocal('');

    if (!form.nomeAdotante || !form.cpf || !form.telefone || !form.email || !form.animalId || !form.motivo || !form.tipoResidencia) {
      setErroLocal('Preencha todos os campos obrigatórios.');
      return;
    }
    if (!form.aceitaTermo) {
      setErroLocal('Você precisa aceitar o termo de responsabilidade.');
      return;
    }

    setSalvando(true);
    try {
      await onSubmit(form);
    } catch {
      /* erro tratado pela página */
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {erroLocal && <div className="alert alert-danger py-2">{erroLocal}</div>}

      <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
        Dados do Adotante
      </h6>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label htmlFor="nomeAdotante" className="form-label fw-semibold">
            Nome completo <span className="text-danger">*</span>
          </label>
          <input
            id="nomeAdotante"
            name="nomeAdotante"
            type="text"
            className="form-control"
            placeholder="Nome do adotante"
            value={form.nomeAdotante}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="cpf" className="form-label fw-semibold">
            CPF <span className="text-danger">*</span>
          </label>
          <input
            id="cpf"
            name="cpf"
            type="text"
            className="form-control"
            placeholder="000.000.000-00"
            maxLength={14}
            value={form.cpf}
            onChange={(e) => setForm((prev) => ({ ...prev, cpf: maskCPF(e.target.value) }))}
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="telefone" className="form-label fw-semibold">
            Telefone <span className="text-danger">*</span>
          </label>
          <input
            id="telefone"
            name="telefone"
            type="text"
            className="form-control"
            placeholder="(00) 00000-0000"
            maxLength={15}
            value={form.telefone}
            onChange={(e) => setForm((prev) => ({ ...prev, telefone: maskPhone(e.target.value) }))}
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="email" className="form-label fw-semibold">
            E-mail <span className="text-danger">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control"
            placeholder="email@exemplo.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="col-12">
          <label htmlFor="endereco" className="form-label fw-semibold">
            Endereço
          </label>
          <input
            id="endereco"
            name="endereco"
            type="text"
            className="form-control"
            placeholder="Rua, número, bairro, cidade"
            value={form.endereco}
            onChange={handleChange}
          />
        </div>
      </div>

      <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
        Dados da Adoção
      </h6>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label htmlFor="animalId" className="form-label fw-semibold">
            Animal desejado <span className="text-danger">*</span>
          </label>
          {animais.length === 0 ? (
            <p className="text-muted small mb-0">
              Nenhum animal disponível para adoção. Em Animais, altere o status para
              &quot;Disponível&quot; (animais em tratamento ou indisponíveis não aparecem aqui).
            </p>
          ) : (
            <FormSelect
              id="animalId"
              name="animalId"
              value={form.animalId}
              onChange={handleChange}
            >
              <option value="">Selecione um animal</option>
              {animais.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} — {a.especie} {a.raca ? `(${a.raca})` : ''}
                </option>
              ))}
            </FormSelect>
          )}
        </div>

        <div className="col-md-6">
          <label htmlFor="tipoResidencia" className="form-label fw-semibold">
            Tipo de residência <span className="text-danger">*</span>
          </label>
          <FormSelect
            id="tipoResidencia"
            name="tipoResidencia"
            value={form.tipoResidencia}
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            <option>Casa com quintal</option>
            <option>Casa sem quintal</option>
            <option>Apartamento</option>
            <option>Sítio / Fazenda</option>
          </FormSelect>
        </div>

        <div className="col-md-6">
          <label htmlFor="temOutrosAnimais" className="form-label fw-semibold">
            Possui outros animais?
          </label>
          <FormSelect
            id="temOutrosAnimais"
            name="temOutrosAnimais"
            value={form.temOutrosAnimais}
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            <option>Sim</option>
            <option>Não</option>
          </FormSelect>
        </div>

        <div className="col-md-6">
          <label htmlFor="temCriancas" className="form-label fw-semibold">
            Possui crianças em casa?
          </label>
          <FormSelect
            id="temCriancas"
            name="temCriancas"
            value={form.temCriancas}
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            <option>Sim</option>
            <option>Não</option>
          </FormSelect>
        </div>

        {isEditing && (
          <div className="col-md-6">
            <label htmlFor="status" className="form-label fw-semibold">
              Status
            </label>
            <FormSelect
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option>Pendente</option>
              <option>Em análise</option>
              <option>Aprovada</option>
              <option>Recusada</option>
              <option>Concluída</option>
            </FormSelect>
          </div>
        )}

        <div className="col-12">
          <label htmlFor="motivo" className="form-label fw-semibold">
            Motivo da adoção <span className="text-danger">*</span>
          </label>
          <textarea
            id="motivo"
            name="motivo"
            className="form-control"
            rows={3}
            placeholder="Conte um pouco sobre por que deseja adotar este animal..."
            value={form.motivo}
            onChange={handleChange}
          />
        </div>
      </div>

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
          name="aceitaTermo"
          checked={form.aceitaTermo}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="aceitaTermo">
          Li e aceito o termo de responsabilidade <span className="text-danger">*</span>
        </label>
      </div>

      <div className="d-flex gap-2">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={salvando}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-success" disabled={salvando || animais.length === 0}>
          {salvando ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
