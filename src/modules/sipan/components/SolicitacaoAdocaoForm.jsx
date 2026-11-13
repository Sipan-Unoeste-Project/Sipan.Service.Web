import { useState } from 'react';
import FormSelect from '../../../components/FormSelect';
import { maskCPF, maskPhone } from '../../../utils/masks';
import { validateCPF, validateEmail } from '../../../utils/validators';
import TermoResponsabilidadeTexto from './TermoResponsabilidadeTexto';

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
  const [errors, setErrors] = useState({});

  function validate(data) {
    const errs = {};

    if (!data.nomeAdotante.trim()) {
      errs.nomeAdotante = 'Nome do adotante é obrigatório.';
    }
    if (!data.cpf.trim()) {
      errs.cpf = 'CPF é obrigatório.';
    } else if (!validateCPF(data.cpf)) {
      errs.cpf = 'CPF inválido.';
    }
    if (!data.telefone.trim()) {
      errs.telefone = 'Telefone é obrigatório.';
    } else if (data.telefone.replace(/\D/g, '').length < 10) {
      errs.telefone = 'Telefone inválido (mínimo 10 dígitos).';
    }
    if (!data.email.trim()) {
      errs.email = 'E-mail é obrigatório.';
    } else if (!validateEmail(data.email)) {
      errs.email = 'E-mail inválido.';
    }
    if (!data.animalId) {
      errs.animalId = 'Selecione o animal desejado.';
    }
    if (!data.tipoResidencia.trim()) {
      errs.tipoResidencia = 'Selecione o tipo de residência.';
    }
    if (!data.motivo.trim()) {
      errs.motivo = 'Conte o motivo da adoção.';
    }
    if (!data.aceitaTermo) {
      errs.aceitaTermo = 'Você precisa aceitar o termo de responsabilidade.';
    }

    return errs;
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function handleMaskedChange(name, maskedValue) {
    setForm((prev) => ({ ...prev, [name]: maskedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSalvando(true);
    try {
      await onSubmit(form);
    } catch {
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
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
            className={`form-control ${errors.nomeAdotante ? 'is-invalid' : ''}`}
            placeholder="Nome do adotante"
            value={form.nomeAdotante}
            onChange={handleChange}
          />
          {errors.nomeAdotante && <div className="invalid-feedback">{errors.nomeAdotante}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="cpf" className="form-label fw-semibold">
            CPF <span className="text-danger">*</span>
          </label>
          <input
            id="cpf"
            name="cpf"
            type="text"
            className={`form-control ${errors.cpf ? 'is-invalid' : ''}`}
            placeholder="000.000.000-00"
            maxLength={14}
            value={form.cpf}
            onChange={(e) => handleMaskedChange('cpf', maskCPF(e.target.value))}
          />
          {errors.cpf && <div className="invalid-feedback">{errors.cpf}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="telefone" className="form-label fw-semibold">
            Telefone <span className="text-danger">*</span>
          </label>
          <input
            id="telefone"
            name="telefone"
            type="text"
            className={`form-control ${errors.telefone ? 'is-invalid' : ''}`}
            placeholder="(00) 00000-0000"
            maxLength={15}
            value={form.telefone}
            onChange={(e) => handleMaskedChange('telefone', maskPhone(e.target.value))}
          />
          {errors.telefone && <div className="invalid-feedback">{errors.telefone}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="email" className="form-label fw-semibold">
            E-mail <span className="text-danger">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            placeholder="email@exemplo.com"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
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
            value={form.endereco ?? ''}
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
            <>
              <FormSelect
                id="animalId"
                name="animalId"
                value={form.animalId}
                onChange={handleChange}
                className={errors.animalId ? 'is-invalid' : ''}
              >
                <option value="">Selecione um animal</option>
                {animais.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome} — {a.especie} {a.raca ? `(${a.raca})` : ''}
                  </option>
                ))}
              </FormSelect>
              {errors.animalId && <div className="invalid-feedback d-block">{errors.animalId}</div>}
            </>
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
            className={errors.tipoResidencia ? 'is-invalid' : ''}
          >
            <option value="">Selecione</option>
            <option>Casa com quintal</option>
            <option>Casa sem quintal</option>
            <option>Apartamento</option>
            <option>Sítio / Fazenda</option>
          </FormSelect>
          {errors.tipoResidencia && <div className="invalid-feedback d-block">{errors.tipoResidencia}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="temOutrosAnimais" className="form-label fw-semibold">
            Possui outros animais?
          </label>
          <FormSelect
            id="temOutrosAnimais"
            name="temOutrosAnimais"
            value={form.temOutrosAnimais ?? ''}
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
            value={form.temCriancas ?? ''}
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
            className={`form-control ${errors.motivo ? 'is-invalid' : ''}`}
            rows={3}
            placeholder="Conte um pouco sobre por que deseja adotar este animal..."
            value={form.motivo}
            onChange={handleChange}
          />
          {errors.motivo && <div className="invalid-feedback">{errors.motivo}</div>}
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
          <div className="mt-3 pt-3 border-top">
            <TermoResponsabilidadeTexto />
            <button
              type="button"
              className="btn btn-link p-0 mt-2 text-start"
              style={{ fontSize: '0.8rem' }}
              onClick={() => setMostrarTermo(false)}
            >
              Ocultar termo completo
            </button>
          </div>
        )}
        <p className="mt-3 mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
          A assinatura do termo é feita online, na página &quot;Assinar Termo&quot;, depois que a
          sua solicitação for aprovada.
        </p>
      </div>

      <div className="form-check mb-4">
        <input
          className={`form-check-input ${errors.aceitaTermo ? 'is-invalid' : ''}`}
          type="checkbox"
          id="aceitaTermo"
          name="aceitaTermo"
          checked={form.aceitaTermo}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="aceitaTermo">
          Li e aceito o termo de responsabilidade <span className="text-danger">*</span>
        </label>
        {errors.aceitaTermo && <div className="invalid-feedback d-block">{errors.aceitaTermo}</div>}
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
