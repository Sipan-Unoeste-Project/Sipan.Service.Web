import { useState } from 'react';
import FormSelect from './FormSelect';
import { maskCPF, maskPhone, maskCEP } from '../utils/masks';
import { validateForm } from '../utils/validators';
import { PERFIS_PESSOA, normalizeTipos } from '../utils/pessoaTipos';

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const EMPTY_FORM = {
  nome: '',
  cpf: '',
  tipos: [],
  telefone: '',
  email: '',
  cep: '',
  endereco: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  obs: '',
};

function buildFormState(initialData) {
  return {
    ...EMPTY_FORM,
    ...initialData,
    tipos: normalizeTipos(initialData),
  };
}

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
  const [form, setForm] = useState(() => buildFormState(initialData));
  const [errors, setErrors] = useState({});

  function toggleTipo(tipo) {
    setForm((prev) => {
      const has = prev.tipos.includes(tipo);
      const tipos = has ? prev.tipos.filter((t) => t !== tipo) : [...prev.tipos, tipo];
      return { ...prev, tipos };
    });
    if (errors.tipos) {
      setErrors((prev) => ({ ...prev, tipos: '' }));
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    let masked = value;
    if (name === 'cpf') masked = maskCPF(value);
    if (name === 'telefone') masked = maskPhone(value);
    if (name === 'cep') masked = maskCEP(value);

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

      {/* Perfis e contato */}
      <div className="row g-3 mb-3">
        <div className="col-12">
          <span className="form-label fw-semibold d-block">
            Perfis <span className="text-danger">*</span>
          </span>
          <div className="d-flex flex-wrap gap-3">
            {PERFIS_PESSOA.map(({ value, label }) => (
              <div className="form-check" key={value}>
                <input
                  type="checkbox"
                  className={`form-check-input ${errors.tipos ? 'is-invalid' : ''}`}
                  id={`perfil-${value}`}
                  checked={form.tipos.includes(value)}
                  onChange={() => toggleTipo(value)}
                />
                <label className="form-check-label" htmlFor={`perfil-${value}`}>
                  {label}
                </label>
              </div>
            ))}
          </div>
          {errors.tipos && <div className="text-danger small mt-1">{errors.tipos}</div>}
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
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

        <div className="col-md-6">
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

      {/* Endereço */}
      <h6 className="fw-semibold mb-3">Endereço</h6>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label htmlFor="cep" className="form-label fw-semibold">
            CEP
          </label>
          <input
            type="text"
            id="cep"
            name="cep"
            className={`form-control ${errors.cep ? 'is-invalid' : ''}`}
            placeholder="00000-000"
            value={form.cep}
            onChange={handleChange}
            maxLength={9}
            autoComplete="postal-code"
          />
          {errors.cep && <div className="invalid-feedback">{errors.cep}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="endereco" className="form-label fw-semibold">
            Endereço
          </label>
          <input
            type="text"
            id="endereco"
            name="endereco"
            className="form-control"
            placeholder="Rua, avenida, logradouro"
            value={form.endereco}
            onChange={handleChange}
            autoComplete="street-address"
          />
        </div>

        <div className="col-md-3">
          <label htmlFor="numero" className="form-label fw-semibold">
            Número
          </label>
          <input
            type="text"
            id="numero"
            name="numero"
            className="form-control"
            placeholder="Nº"
            value={form.numero}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label htmlFor="bairro" className="form-label fw-semibold">
            Bairro
          </label>
          <input
            type="text"
            id="bairro"
            name="bairro"
            className="form-control"
            value={form.bairro}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-5">
          <label htmlFor="cidade" className="form-label fw-semibold">
            Cidade
          </label>
          <input
            type="text"
            id="cidade"
            name="cidade"
            className="form-control"
            value={form.cidade}
            onChange={handleChange}
            autoComplete="address-level2"
          />
        </div>

        <div className="col-md-3">
          <label htmlFor="estado" className="form-label fw-semibold">
            Estado
          </label>
          <FormSelect
            id="estado"
            name="estado"
            className={errors.estado ? 'is-invalid' : ''}
            value={form.estado}
            onChange={handleChange}
          >
            <option value="">UF</option>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </FormSelect>
          {errors.estado && <div className="invalid-feedback">{errors.estado}</div>}
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
