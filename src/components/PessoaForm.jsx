import { useState } from 'react';
import { maskCPF, maskPhone } from '../utils/masks';
import { validateForm } from '../utils/validators';

const EMPTY_FORM = {
  nome: '',
  cpf: '',
  tipo: '',
  telefone: '',
  email: '',
  obs: '',
};

/**
 * Formulário reutilizável para cadastro e edição de pessoas.
 *
 * @param {object}   initialData   - dados pré-preenchidos (modo edição)
 * @param {string[]} existingCPFs  - CPFs já cadastrados (somente dígitos) para checar duplicatas
 * @param {Function} onSubmit      - callback chamado com dados validados
 * @param {Function} onCancel      - callback para voltar sem salvar
 * @param {string}   submitLabel   - texto do botão de envio
 */
export default function PessoaForm({
  initialData = EMPTY_FORM,
  existingCPFs = [],
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialData });
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;

    let masked = value;
    if (name === 'cpf') masked = maskCPF(value);
    if (name === 'telefone') masked = maskPhone(value);

    setForm((prev) => ({ ...prev, [name]: masked }));

    // Limpa o erro do campo ao digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validateForm(form, existingCPFs);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Nome e CPF */}
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
            placeholder="Ex: Maria da Silva"
            value={form.nome}
            onChange={handleChange}
            autoComplete="off"
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
            value={form.cpf}
            onChange={handleChange}
            maxLength={14}
            autoComplete="off"
          />
          {errors.cpf && <div className="invalid-feedback">{errors.cpf}</div>}
        </div>
      </div>

      {/* Tipo e Telefone */}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label htmlFor="tipo" className="form-label fw-semibold">
            Tipo <span className="text-danger">*</span>
          </label>
          <select
            id="tipo"
            name="tipo"
            className={`form-select ${errors.tipo ? 'is-invalid' : ''}`}
            value={form.tipo}
            onChange={handleChange}
          >
            <option value="">Selecione…</option>
            <option value="doador">Doador</option>
            <option value="adotante">Adotante</option>
            <option value="voluntario">Voluntário</option>
          </select>
          {errors.tipo && <div className="invalid-feedback">{errors.tipo}</div>}
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
            value={form.telefone}
            onChange={handleChange}
            maxLength={15}
            autoComplete="off"
          />
          {errors.telefone && <div className="invalid-feedback">{errors.telefone}</div>}
        </div>

        <div className="col-md-4">
          <label htmlFor="email" className="form-label fw-semibold">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            placeholder="exemplo@email.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="off"
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
      </div>

      {/* Observações */}
      <div className="mb-4">
        <label htmlFor="obs" className="form-label fw-semibold">
          Observações
        </label>
        <textarea
          id="obs"
          name="obs"
          className="form-control"
          placeholder="Informações adicionais…"
          rows={3}
          value={form.obs}
          onChange={handleChange}
        />
      </div>

      {/* Ações */}
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
