import { useState, useEffect } from 'react';
import { maskCPF, maskPhone } from '../../../utils/masks';
import FormSelect from '../../../components/FormSelect';
import StatusToggle from '../../../components/StatusToggle';

const EMPTY_FORM = {
  nome: '',
  cpf: '',
  cargo: '',
  telefone: '',
  status: 'Ativo',
};

const CARGOS = ['Administrador', 'Financeiro', 'Voluntário', 'Veterinário', 'Recepcionista', 'Auxiliar'];

export default function VoluntarioForm({
  initialData = EMPTY_FORM,
  existingCPFs = [],
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialData });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({ ...EMPTY_FORM, ...initialData });
    setErrors({});
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    let masked = value;
    if (name === 'cpf') masked = maskCPF(value);
    if (name === 'telefone') masked = maskPhone(value);
    setForm((prev) => ({ ...prev, [name]: masked }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.nome.trim()) errs.nome = 'Nome é obrigatório.';
    if (!form.cpf.trim()) errs.cpf = 'CPF é obrigatório.';
    else if (form.cpf.replace(/\D/g, '').length !== 11) errs.cpf = 'CPF inválido.';
    else if (existingCPFs.includes(form.cpf.replace(/\D/g, ''))) {
      errs.cpf = 'CPF já cadastrado para outro voluntário.';
    }
    if (!form.cargo) errs.cargo = 'Selecione a área de atuação.';
    if (!form.telefone.trim()) errs.telefone = 'Telefone é obrigatório.';
    else if (form.telefone.replace(/\D/g, '').length < 10) {
      errs.telefone = 'Telefone inválido (mínimo 10 dígitos).';
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="row g-3 mb-3">
        <div className="col-md-7">
          <label htmlFor="nome" className="form-label fw-semibold">
            Nome completo <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
            value={form.nome}
            onChange={handleChange}
          />
          {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
        </div>
        <div className="col-md-5">
          <label htmlFor="cpf" className="form-label fw-semibold">
            CPF <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            className={`form-control ${errors.cpf ? 'is-invalid' : ''}`}
            placeholder="000.000.000-00"
            maxLength={14}
            value={form.cpf}
            onChange={handleChange}
          />
          {errors.cpf && <div className="invalid-feedback">{errors.cpf}</div>}
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label htmlFor="cargo" className="form-label fw-semibold">
            Área de atuação <span className="text-danger">*</span>
          </label>
          <FormSelect
            id="cargo"
            name="cargo"
            className={errors.cargo ? 'is-invalid' : ''}
            value={form.cargo}
            onChange={handleChange}
          >
            <option value="">Selecione…</option>
            {CARGOS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FormSelect>
          {errors.cargo && <div className="invalid-feedback">{errors.cargo}</div>}
        </div>
        <div className="col-md-4">
          <label htmlFor="telefone" className="form-label fw-semibold">
            Telefone <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="telefone"
            name="telefone"
            className={`form-control ${errors.telefone ? 'is-invalid' : ''}`}
            placeholder="(00) 00000-0000"
            maxLength={15}
            value={form.telefone}
            onChange={handleChange}
          />
          {errors.telefone && <div className="invalid-feedback">{errors.telefone}</div>}
        </div>
        <div className="col-md-4">
          <span className="form-label fw-semibold d-block">Status</span>
          <StatusToggle
            id="voluntario-status"
            ativo={form.status === 'Ativo'}
            onChange={(status) => setForm((prev) => ({ ...prev, status }))}
          />
        </div>
      </div>

      <div className="d-flex gap-2 justify-content-end">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-success px-4">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
