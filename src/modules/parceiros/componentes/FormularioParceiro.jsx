import { useState, useEffect, useRef } from 'react';
import { adicionarParceiro, atualizarParceiro } from '../utils/storageParceiros';
import { modeloParceiro } from '../utils/modeloParceiro';
import {
  listarTiposParceiro,
  adicionarTipoParceiro,
} from '../utils/tiposParceiroStorage';
import {
  formatarCpfCnpj,
  validarCpfCnpj,
  tipoCpfCnpj,
} from '../utils/validacaoCpfCnpj';
import { listarParceiros } from '../utils/storageParceiros';

const FormularioParceiro = ({
  parceiroParaEditar = null,
  onSalvar,
  onCancelar,
  onFeedback,
}) => {
  const [form, setForm] = useState(modeloParceiro);
  const [erros, setErros] = useState({});
  const [tipos, setTipos] = useState([]);
  const [showAddTipo, setShowAddTipo] = useState(false);
  const [newTipo, setNewTipo] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputTipoRef = useRef(null);

  useEffect(() => {
    setTipos(listarTiposParceiro());
  }, []);

  useEffect(() => {
    if (parceiroParaEditar) {
      setForm({ ...modeloParceiro, ...parceiroParaEditar });
    } else {
      setForm(modeloParceiro);
    }
  }, [parceiroParaEditar]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cpfCnpj') {
      const formatado = formatarCpfCnpj(value);
      setForm((prev) => ({ ...prev, cpfCnpj: formatado }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    if (erros[name]) {
      setErros((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!form.nome?.trim()) novosErros.nome = 'Campo obrigatório';

    if (!form.cpfCnpj?.trim()) {
      novosErros.cpfCnpj = 'Campo obrigatório';
    } else if (!validarCpfCnpj(form.cpfCnpj)) {
      novosErros.cpfCnpj = `${tipoCpfCnpj(form.cpfCnpj)} inválido`;
    } else {
      const todos = listarParceiros();
      const cpfCnpjLimpo = form.cpfCnpj.replace(/\D/g, '');
      const duplicado = todos.find(
        (p) =>
          p.cpfCnpj?.replace(/\D/g, '') === cpfCnpjLimpo &&
          p.id !== parceiroParaEditar?.id
      );
      if (duplicado) {
        novosErros.cpfCnpj = `Este ${tipoCpfCnpj(form.cpfCnpj)} já está cadastrado`;
      }
    }

    if (!form.tipo?.trim()) novosErros.tipo = 'Campo obrigatório';
    if (!form.telefone?.trim()) novosErros.telefone = 'Campo obrigatório';
    if (!form.email?.trim()) {
      novosErros.email = 'Campo obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      novosErros.email = 'E-mail inválido';
    }
    if (!form.endereco?.trim()) novosErros.endereco = 'Campo obrigatório';

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    const payload = {
      ...form,
      id: parceiroParaEditar?.id,
    };

    try {
      if (parceiroParaEditar) {
        await atualizarParceiro(parceiroParaEditar.id, payload);
        onFeedback?.('Parceiro atualizado com sucesso!', 'success');
      } else {
        await adicionarParceiro(payload);
        onFeedback?.('Parceiro cadastrado com sucesso!', 'success');
      }
      onSalvar?.();
      if (!parceiroParaEditar) {
        setForm(modeloParceiro);
      }
    } catch (error) {
      onFeedback?.('Erro ao salvar. Verifique os campos e tente novamente.', 'error');
      console.error(error);
    }
  };

  const tiposFiltrados = tipos.filter((t) =>
    t.toLowerCase().includes((form.tipo || '').toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="row g-3">

        <div className="col-12 col-md-6">
          <label className="form-label">
            Nome / Razão Social <span style={{ color: 'var(--bs-danger)' }}>*</span>
          </label>
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className={`form-control ${erros.nome ? 'is-invalid' : ''}`}
            placeholder="Ex: Clínica PetShop"
          />
          {erros.nome && <div className="text-danger small mt-1">{erros.nome}</div>}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">
            CPF ou CNPJ <span style={{ color: 'var(--bs-danger)' }}>*</span>
          </label>
          <input
            type="text"
            name="cpfCnpj"
            value={form.cpfCnpj}
            onChange={handleChange}
            className={`form-control ${erros.cpfCnpj ? 'is-invalid' : ''}`}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            maxLength={18}
          />
          {erros.cpfCnpj && (
            <div className="text-danger small mt-1">{erros.cpfCnpj}</div>
          )}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">
            Tipo <span style={{ color: 'var(--bs-danger)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              ref={inputTipoRef}
              type="text"
              name="tipo"
              value={form.tipo}
              onChange={(e) => {
                handleChange(e);
                setShowSuggestions(true);
                setHighlightIndex(-1);
              }}
              onFocus={() => {
                if (tipos.length) setShowSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 150);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHighlightIndex((i) =>
                    Math.min(i + 1, tiposFiltrados.length - 1)
                  );
                  setShowSuggestions(true);
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHighlightIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === 'Enter') {
                  if (highlightIndex >= 0 && tiposFiltrados[highlightIndex]) {
                    const sel = tiposFiltrados[highlightIndex];
                    setForm((prev) => ({ ...prev, tipo: sel }));
                    setShowSuggestions(false);
                    setHighlightIndex(-1);
                    e.preventDefault();
                  }
                } else if (e.key === 'Escape') {
                  setShowSuggestions(false);
                  setHighlightIndex(-1);
                }
              }}
              className={`form-control ${erros.tipo ? 'is-invalid' : ''}`}
              placeholder="Digite para filtrar ou selecione"
              style={{ paddingRight: '2.5rem' }}
            />

            <button
              type="button"
              title="Cadastrar novo tipo"
              className="btn btn-outline-secondary"
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                borderColor: 'var(--primary, #198754)',
                fontSize: '1.25rem',
                lineHeight: 1,
                borderRadius: '0 var(--bs-border-radius) var(--bs-border-radius) 0',
                padding: '0 0.6rem',
              }}
              onClick={() => {
                setShowAddTipo(true);
                setNewTipo(form.tipo || '');
              }}
            >
              +
            </button>

            {showSuggestions && tiposFiltrados.length > 0 && (
              <ul
                className="autocomplete-list"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  border: '1px solid #dee2e6',
                  borderRadius: '0 0 var(--bs-border-radius) var(--bs-border-radius)',
                  background: '#fff',
                  maxHeight: 200,
                  overflowY: 'auto',
                  boxShadow: '0 4px 8px rgba(0,0,0,.1)',
                }}
              >
                {tiposFiltrados.map((t, idx) => (
                  <li
                    key={t}
                    className={`autocomplete-item ${idx === highlightIndex ? 'highlight' : ''}`}
                    style={{
                      padding: '0.4rem 0.75rem',
                      cursor: 'pointer',
                      background:
                        idx === highlightIndex ? '#f0f0f0' : 'transparent',
                    }}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    onMouseDown={() => {
                      setForm((prev) => ({ ...prev, tipo: t }));
                      setShowSuggestions(false);
                      setHighlightIndex(-1);
                    }}
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {showAddTipo && (
            <div className="mt-2 d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Nome do novo tipo"
                value={newTipo}
                onChange={(e) => setNewTipo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const nome = (newTipo || '').trim();
                  if (!nome) return;
                  const novos = adicionarTipoParceiro(nome);
                  setTipos(novos);
                  setForm((prev) => ({ ...prev, tipo: nome }));
                  setShowAddTipo(false);
                  setNewTipo('');
                  onFeedback?.('Tipo adicionado com sucesso', 'success');
                }}
              >
                Salvar
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowAddTipo(false)}
              >
                Cancelar
              </button>
            </div>
          )}

          {erros.tipo && (
            <div className="text-danger small mt-1">{erros.tipo}</div>
          )}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">
            Telefone <span style={{ color: 'var(--bs-danger)' }}>*</span>
          </label>
          <input
            type="text"
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            className={`form-control ${erros.telefone ? 'is-invalid' : ''}`}
            placeholder="(13) 99999-9999"
          />
          {erros.telefone && (
            <div className="text-danger small mt-1">{erros.telefone}</div>
          )}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">
            E-mail <span style={{ color: 'var(--bs-danger)' }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={`form-control ${erros.email ? 'is-invalid' : ''}`}
            placeholder="contato@parceiro.com.br"
          />
          {erros.email && (
            <div className="text-danger small mt-1">{erros.email}</div>
          )}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">
            Endereço <span style={{ color: 'var(--bs-danger)' }}>*</span>
          </label>
          <input
            type="text"
            name="endereco"
            value={form.endereco}
            onChange={handleChange}
            className={`form-control ${erros.endereco ? 'is-invalid' : ''}`}
            placeholder="Rua, número, bairro, cidade"
          />
          {erros.endereco && (
            <div className="text-danger small mt-1">{erros.endereco}</div>
          )}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="form-select"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <div className="col-12">
          <label className="form-label">Observações</label>
          <textarea
            name="observacoes"
            value={form.observacoes}
            onChange={handleChange}
            className="form-control"
            rows={3}
            placeholder="Informações adicionais sobre o parceiro ou fornecedor..."
          />
        </div>

        <div className="col-12 d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-success">
            {parceiroParaEditar ? 'Atualizar Parceiro' : 'Cadastrar Parceiro'}
          </button>
        </div>

      </div>
    </form>
  );
};

export default FormularioParceiro;
