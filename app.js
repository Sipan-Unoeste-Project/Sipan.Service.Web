'use strict';

// ===== State =====
const PAGE_SIZE = 8;

let pessoas = [
  { id: 1, nome: 'Ana Paula Oliveira',   cpf: '123.456.789-00', tipo: 'doador',    telefone: '(11) 98765-4321', email: 'ana.oliveira@email.com',  obs: '',                              criadoEm: '2026-01-15' },
  { id: 2, nome: 'Carlos Eduardo Silva', cpf: '987.654.321-00', tipo: 'adotante',  telefone: '(11) 91234-5678', email: 'carlos.silva@email.com',   obs: 'Adotou o cachorro Rex.',        criadoEm: '2026-02-03' },
  { id: 3, nome: 'Fernanda Costa',       cpf: '456.789.123-00', tipo: 'voluntario',telefone: '(13) 99876-5432', email: 'fernanda.costa@email.com', obs: 'Responsável pelos fins de semana.', criadoEm: '2026-02-18' },
  { id: 4, nome: 'Roberto Mendes',       cpf: '321.654.987-00', tipo: 'doador',    telefone: '(13) 97654-3210', email: 'roberto.mendes@email.com', obs: '',                              criadoEm: '2026-03-05' },
  { id: 5, nome: 'Juliana Torres',       cpf: '654.321.098-00', tipo: 'adotante',  telefone: '(11) 96543-2109', email: 'juliana.torres@email.com', obs: 'Adotou a gata Mimi.',          criadoEm: '2026-03-12' },
  { id: 6, nome: 'Marcelo Souza',        cpf: '789.012.345-00', tipo: 'voluntario',telefone: '(13) 95432-1098', email: '',                         obs: 'Veterinário voluntário.',       criadoEm: '2026-03-20' },
  { id: 7, nome: 'Patrícia Lima',        cpf: '012.345.678-00', tipo: 'doador',    telefone: '(11) 94321-0987', email: 'patricia.lima@email.com',  obs: '',                              criadoEm: '2026-04-02' },
  { id: 8, nome: 'Lucas Ferreira',       cpf: '234.567.890-00', tipo: 'adotante',  telefone: '(13) 93210-9876', email: 'lucas.ferreira@email.com', obs: '',                              criadoEm: '2026-04-10' },
  { id: 9, nome: 'Beatriz Alves',        cpf: '567.890.123-00', tipo: 'voluntario',telefone: '(11) 92109-8765', email: 'beatriz.alves@email.com',  obs: 'Participa das campanhas.',      criadoEm: '2026-04-22' },
];

let nextId        = 10;
let currentPage   = 1;
let activeFilter  = 'todos';
let searchQuery   = '';
let deleteTargetId = null;

// ===== DOM refs =====
const tableBody    = document.getElementById('table-body');
const emptyState   = document.getElementById('empty-state');
const searchInput  = document.getElementById('search-input');
const filterBtns   = document.querySelectorAll('.filter-btn');

const modalOverlay = document.getElementById('modal-overlay');
const modalTitle   = document.getElementById('modal-title');
const pessoaForm   = document.getElementById('pessoa-form');

const confirmOverlay = document.getElementById('confirm-overlay');
const confirmName    = document.getElementById('confirm-name');

const statTotal     = document.getElementById('stat-total');
const statDoador    = document.getElementById('stat-doador');
const statAdotante  = document.getElementById('stat-adotante');
const statVoluntario= document.getElementById('stat-voluntario');

const paginationInfo = document.getElementById('pagination-info');
const pageIndicator  = document.getElementById('page-indicator');
const btnPrev        = document.getElementById('btn-prev');
const btnNext        = document.getElementById('btn-next');

const toastContainer = document.getElementById('toast-container');

// ===== Helpers =====
function getInitials(nome) {
  return nome.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function labelTipo(tipo) {
  return { doador: 'Doador', adotante: 'Adotante', voluntario: 'Voluntário' }[tipo] || tipo;
}

function filteredPessoas() {
  const q = searchQuery.toLowerCase();
  return pessoas.filter(p => {
    const matchFilter = activeFilter === 'todos' || p.tipo === activeFilter;
    const matchSearch = !q ||
      p.nome.toLowerCase().includes(q) ||
      p.cpf.includes(q) ||
      p.telefone.includes(q) ||
      p.email.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
}

// ===== Render =====
function render() {
  updateStats();

  const list  = filteredPessoas();
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > pages) currentPage = pages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = list.slice(start, start + PAGE_SIZE);

  tableBody.innerHTML = '';

  if (total === 0) {
    emptyState.style.display = '';
    document.getElementById('pessoas-table').style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    document.getElementById('pessoas-table').style.display = '';
    slice.forEach(p => tableBody.appendChild(buildRow(p)));
  }

  paginationInfo.textContent = total === 0
    ? 'Nenhum resultado'
    : `Exibindo ${start + 1}–${Math.min(start + PAGE_SIZE, total)} de ${total} ${total === 1 ? 'pessoa' : 'pessoas'}`;

  pageIndicator.textContent = `${currentPage} / ${pages}`;
  btnPrev.disabled = currentPage <= 1;
  btnNext.disabled = currentPage >= pages;
}

function buildRow(p) {
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td>
      <div class="cell-name">
        <div class="person-avatar avatar-${p.tipo}">${getInitials(p.nome)}</div>
        <span class="cell-name-text">${escHtml(p.nome)}</span>
      </div>
    </td>
    <td>${escHtml(p.cpf)}</td>
    <td><span class="badge badge-${p.tipo}">${labelTipo(p.tipo)}</span></td>
    <td>${escHtml(p.telefone)}</td>
    <td>${p.email ? escHtml(p.email) : '<span style="color:var(--color-text-3)">—</span>'}</td>
    <td style="color:var(--color-text-2)">${formatDate(p.criadoEm)}</td>
    <td>
      <div class="action-btns">
        <button class="icon-btn" data-action="edit" data-id="${p.id}" title="Editar">
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="icon-btn delete" data-action="delete" data-id="${p.id}" title="Excluir">
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M3 4h10M6 4V3h4v1M5 4l.5 9h5L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </td>
  `;
  return tr;
}

function updateStats() {
  statTotal.textContent     = pessoas.length;
  statDoador.textContent    = pessoas.filter(p => p.tipo === 'doador').length;
  statAdotante.textContent  = pessoas.filter(p => p.tipo === 'adotante').length;
  statVoluntario.textContent= pessoas.filter(p => p.tipo === 'voluntario').length;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== Modal =====
function openModal(pessoa = null) {
  clearFormErrors();
  if (pessoa) {
    modalTitle.textContent = 'Editar Pessoa';
    document.getElementById('form-id').value       = pessoa.id;
    document.getElementById('form-nome').value     = pessoa.nome;
    document.getElementById('form-cpf').value      = pessoa.cpf;
    document.getElementById('form-tipo').value     = pessoa.tipo;
    document.getElementById('form-telefone').value = pessoa.telefone;
    document.getElementById('form-email').value    = pessoa.email;
    document.getElementById('form-obs').value      = pessoa.obs;
  } else {
    modalTitle.textContent = 'Nova Pessoa';
    pessoaForm.reset();
    document.getElementById('form-id').value = '';
  }
  modalOverlay.style.display = 'flex';
  setTimeout(() => document.getElementById('form-nome').focus(), 80);
}

function closeModal() {
  modalOverlay.style.display = 'none';
}

// ===== Confirm =====
function openConfirm(id) {
  deleteTargetId = id;
  const p = pessoas.find(x => x.id === id);
  confirmName.textContent = p ? p.nome : '';
  confirmOverlay.style.display = 'flex';
}

function closeConfirm() {
  confirmOverlay.style.display = 'none';
  deleteTargetId = null;
}

// ===== Validation =====
function validateCPF(cpf) {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += +digits[i] * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== +digits[9]) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += +digits[i] * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === +digits[10];
}

function setFieldError(field, msg) {
  document.getElementById(field).textContent = msg;
  if (msg) {
    const inputId = field.replace('error-', 'form-');
    const el = document.getElementById(inputId) || document.querySelector(`#form-${inputId.split('-')[1]}`);
    if (el) el.classList.add('invalid');
  }
}

function clearFormErrors() {
  ['nome', 'cpf', 'tipo', 'telefone', 'email'].forEach(f => {
    document.getElementById('error-' + f).textContent = '';
    const el = document.getElementById('form-' + f);
    if (el) el.classList.remove('invalid');
  });
}

function validateForm() {
  clearFormErrors();
  const nome     = document.getElementById('form-nome').value.trim();
  const cpf      = document.getElementById('form-cpf').value.trim();
  const tipo     = document.getElementById('form-tipo').value;
  const telefone = document.getElementById('form-telefone').value.trim();
  const email    = document.getElementById('form-email').value.trim();
  let valid = true;

  if (!nome) { setFieldError('error-nome', 'Nome é obrigatório.'); valid = false; }
  else if (nome.length < 3) { setFieldError('error-nome', 'Mínimo de 3 caracteres.'); valid = false; }

  if (!cpf) { setFieldError('error-cpf', 'CPF é obrigatório.'); valid = false; }
  else if (!validateCPF(cpf)) { setFieldError('error-cpf', 'CPF inválido.'); valid = false; }

  if (!tipo) { setFieldError('error-tipo', 'Selecione um tipo.'); valid = false; }

  if (!telefone) { setFieldError('error-telefone', 'Telefone é obrigatório.'); valid = false; }
  else if (telefone.replace(/\D/g,'').length < 10) { setFieldError('error-telefone', 'Telefone inválido.'); valid = false; }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('error-email', 'E-mail inválido.'); valid = false;
  }

  return valid;
}

// ===== CRUD =====
function savePessoa(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const id       = document.getElementById('form-id').value;
  const nome     = document.getElementById('form-nome').value.trim();
  const cpf      = document.getElementById('form-cpf').value.trim();
  const tipo     = document.getElementById('form-tipo').value;
  const telefone = document.getElementById('form-telefone').value.trim();
  const email    = document.getElementById('form-email').value.trim();
  const obs      = document.getElementById('form-obs').value.trim();

  // Check duplicate CPF
  const cpfDigits = cpf.replace(/\D/g, '');
  const duplicate = pessoas.find(p => p.cpf.replace(/\D/g,'') === cpfDigits && String(p.id) !== String(id));
  if (duplicate) {
    setFieldError('error-cpf', 'CPF já cadastrado para outra pessoa.');
    return;
  }

  if (id) {
    const idx = pessoas.findIndex(p => String(p.id) === String(id));
    if (idx !== -1) {
      pessoas[idx] = { ...pessoas[idx], nome, cpf, tipo, telefone, email, obs };
      showToast('Pessoa atualizada com sucesso.', 'success');
    }
  } else {
    const today = new Date().toISOString().split('T')[0];
    pessoas.push({ id: nextId++, nome, cpf, tipo, telefone, email, obs, criadoEm: today });
    showToast('Pessoa cadastrada com sucesso.', 'success');
    currentPage = 1;
  }

  closeModal();
  render();
}

function deletePessoa() {
  if (!deleteTargetId) return;
  pessoas = pessoas.filter(p => p.id !== deleteTargetId);
  closeConfirm();
  showToast('Pessoa excluída.', 'success');
  render();
}

// ===== Toast =====
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;

  const icon = type === 'success'
    ? `<svg class="toast-icon" viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    : `<svg class="toast-icon" viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M8 5v4M8 11.5v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

  t.innerHTML = `${icon}<span>${msg}</span>`;
  toastContainer.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 320); }, 3200);
}

// ===== Masks =====
document.getElementById('form-cpf').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 9)      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  this.value = v;
});

document.getElementById('form-telefone').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 10)     v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  else if (v.length > 0) v = v.replace(/(\d{1,2})/, '($1');
  this.value = v;
});

// ===== Events =====
document.getElementById('btn-nova-pessoa').addEventListener('click', () => openModal());

document.getElementById('btn-close-modal').addEventListener('click', closeModal);
document.getElementById('btn-cancel').addEventListener('click', closeModal);
pessoaForm.addEventListener('submit', savePessoa);

modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
confirmOverlay.addEventListener('click', e => { if (e.target === confirmOverlay) closeConfirm(); });

document.getElementById('btn-confirm-cancel').addEventListener('click', closeConfirm);
document.getElementById('btn-confirm-delete').addEventListener('click', deletePessoa);

tableBody.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = parseInt(btn.dataset.id, 10);
  if (btn.dataset.action === 'edit') {
    openModal(pessoas.find(p => p.id === id));
  } else if (btn.dataset.action === 'delete') {
    openConfirm(id);
  }
});

searchInput.addEventListener('input', () => {
  searchQuery  = searchInput.value;
  currentPage  = 1;
  render();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    currentPage  = 1;
    render();
  });
});

btnPrev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; render(); } });
btnNext.addEventListener('click', () => {
  const pages = Math.ceil(filteredPessoas().length / PAGE_SIZE);
  if (currentPage < pages) { currentPage++; render(); }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeConfirm();
  }
});

// ===== Init =====
render();
