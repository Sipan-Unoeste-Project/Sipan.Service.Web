import { useState, useEffect } from 'react';
import * as usuariosApi from '../../../api/usuariosApi';
import FormSelect from '../../../components/FormSelect';
import StatusToggle from '../../../components/StatusToggle';

const SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const EMPTY_FORM = {
  nome: '',
  login: '',
  email: '',
  senha: '',
  permissao: '',
  status: 'Ativo',
};

const PERMISSOES = ['Administrador', 'Financeiro', 'Veterinário', 'Voluntário'];

export default function UsuarioForm({
  initialData = EMPTY_FORM,
  isEditing = false,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialData, senha: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({ ...EMPTY_FORM, ...initialData, senha: '' });
    setErrors({});
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.nome.trim()) errs.nome = 'Nome é obrigatório.';
    if (!form.login.trim()) errs.login = 'Login é obrigatório.';
    if (!form.email.trim()) errs.email = 'E-mail é obrigatório.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'E-mail inválido.';
    if (!form.permissao) errs.permissao = 'Selecione uma permissão.';
    if (!isEditing && !form.senha.trim()) errs.senha = 'Senha é obrigatória para novo usuário.';
    if (form.senha.trim() && !SENHA_FORTE.test(form.senha)) {
      errs.senha =
        'Mínimo 8 caracteres: maiúscula, minúscula, número e caractere especial.';
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
        <div className="col-md-6">
          <label htmlFor="nome" className="form-label fw-semibold">
            Nome <span className="text-danger">*</span>
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
        <div className="col-md-6">
          <label htmlFor="login" className="form-label fw-semibold">
            Login <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="login"
            name="login"
            className={`form-control ${errors.login ? 'is-invalid' : ''}`}
            value={form.login}
            onChange={handleChange}
            autoComplete="off"
          />
          {errors.login && <div className="invalid-feedback">{errors.login}</div>}
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label htmlFor="email" className="form-label fw-semibold">
            E-mail <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            placeholder="usuario@email.com"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        <div className="col-md-6">
          <label htmlFor="senha" className="form-label fw-semibold">
            {isEditing ? 'Nova senha (opcional)' : 'Senha'}{' '}
            {!isEditing && <span className="text-danger">*</span>}
          </label>
          <input
            type="password"
            id="senha"
            name="senha"
            className={`form-control ${errors.senha ? 'is-invalid' : ''}`}
            placeholder="Digite uma senha forte"
            value={form.senha}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {errors.senha && <div className="invalid-feedback">{errors.senha}</div>}
          <small className="text-muted">
            Mínimo 8 caracteres: maiúscula, minúscula, número e caractere especial.
          </small>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label htmlFor="permissao" className="form-label fw-semibold">
            Permissão <span className="text-danger">*</span>
          </label>
          <FormSelect
            id="permissao"
            name="permissao"
            className={errors.permissao ? 'is-invalid' : ''}
            value={form.permissao}
            onChange={handleChange}
          >
            <option value="">Selecione…</option>
            {PERMISSOES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </FormSelect>
          {errors.permissao && <div className="invalid-feedback">{errors.permissao}</div>}
        </div>
        <div className="col-md-6">
          <span className="form-label fw-semibold d-block">Status</span>
          <StatusToggle
            id="usuario-status"
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
