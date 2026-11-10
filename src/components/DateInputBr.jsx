import { useEffect, useMemo, useRef, useState } from 'react';
import { formatDateBr, toIsoDate } from '../utils/dates';
import { maskDate } from '../utils/masks';

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function parseIsoParts(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}

function toIso(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function diasDoMes(ano, mes) {
  const primeiro = new Date(ano, mes - 1, 1);
  const total = new Date(ano, mes, 0).getDate();
  const offset = primeiro.getDay();
  const celulas = [];
  for (let i = 0; i < offset; i++) celulas.push(null);
  for (let d = 1; d <= total; d++) celulas.push(d);
  while (celulas.length % 7 !== 0) celulas.push(null);
  return celulas;
}

/**
 * Data no padrão BR (dd/mm/aaaa) com calendário verde do SIPAN.
 * value/onChange usam yyyy-MM-dd (ISO) quando a data está completa.
 */
export default function DateInputBr({
  id,
  value = '',
  onChange,
  required = false,
  className = 'form-control',
  min,
  title,
  disabled = false,
  'aria-label': ariaLabel,
}) {
  const wrapRef = useRef(null);
  const isoValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : toIsoDate(value);
  const [texto, setTexto] = useState(() =>
    /^\d{4}-\d{2}-\d{2}$/.test(isoValue) ? formatDateBr(isoValue) : ''
  );
  const [aberto, setAberto] = useState(false);

  const selecionado = parseIsoParts(isoValue);
  const hoje = new Date();
  const [cursor, setCursor] = useState(() => ({
    y: selecionado?.y || hoje.getFullYear(),
    m: selecionado?.m || hoje.getMonth() + 1,
  }));

  useEffect(() => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      setTexto(formatDateBr(value));
      const p = parseIsoParts(value);
      if (p) setCursor({ y: p.y, m: p.m });
      return;
    }
    if (!value) setTexto('');
  }, [value]);

  useEffect(() => {
    if (!aberto) return undefined;
    function fecharFora(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', fecharFora);
    return () => document.removeEventListener('mousedown', fecharFora);
  }, [aberto]);

  const celulas = useMemo(() => diasDoMes(cursor.y, cursor.m), [cursor.y, cursor.m]);
  const minParts = parseIsoParts(min);

  function emitir(iso) {
    onChange?.({ target: { value: iso } });
  }

  function handleTexto(e) {
    const mascarado = maskDate(e.target.value);
    setTexto(mascarado);
    if (!mascarado) {
      emitir('');
      return;
    }
    if (mascarado.length === 10) {
      const iso = toIsoDate(mascarado);
      if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        emitir(iso);
        const p = parseIsoParts(iso);
        if (p) setCursor({ y: p.y, m: p.m });
      }
    }
  }

  function diaDesabilitado(d) {
    if (!d || !minParts) return false;
    const iso = toIso(cursor.y, cursor.m, d);
    return iso < toIso(minParts.y, minParts.m, minParts.d);
  }

  function escolherDia(d) {
    if (!d || diaDesabilitado(d)) return;
    const iso = toIso(cursor.y, cursor.m, d);
    emitir(iso);
    setTexto(formatDateBr(iso));
    setAberto(false);
  }

  function mesAnterior() {
    setCursor((c) => {
      if (c.m === 1) return { y: c.y - 1, m: 12 };
      return { y: c.y, m: c.m - 1 };
    });
  }

  function mesSeguinte() {
    setCursor((c) => {
      if (c.m === 12) return { y: c.y + 1, m: 1 };
      return { y: c.y, m: c.m + 1 };
    });
  }

  function abrirCalendario() {
    if (disabled) return;
    if (selecionado) setCursor({ y: selecionado.y, m: selecionado.m });
    setAberto((v) => !v);
  }

  return (
    <div className="date-input-br" ref={wrapRef}>
      <div className="input-group">
        <input
          id={id}
          type="text"
          className={className}
          inputMode="numeric"
          placeholder="dd/mm/aaaa"
          maxLength={10}
          value={texto}
          onChange={handleTexto}
          required={required}
          title={title}
          aria-label={ariaLabel}
          autoComplete="off"
          disabled={disabled}
        />
        <button
          type="button"
          className={`btn btn-outline-success${aberto ? ' active' : ''}`}
          onClick={abrirCalendario}
          title="Abrir calendário"
          aria-label="Abrir calendário"
          aria-expanded={aberto}
          disabled={disabled}
        >
          <i className="bi bi-calendar3" aria-hidden="true" />
        </button>
      </div>

      {aberto && (
        <div className="date-input-br-popup" role="dialog" aria-label="Calendário">
          <div className="date-input-br-header">
            <button type="button" className="btn btn-sm btn-outline-success" onClick={mesAnterior}>
              ‹
            </button>
            <span className="date-input-br-title">
              {MESES[cursor.m - 1]} {cursor.y}
            </span>
            <button type="button" className="btn btn-sm btn-outline-success" onClick={mesSeguinte}>
              ›
            </button>
          </div>
          <div className="date-input-br-weekdays">
            {DIAS_SEMANA.map((dia, i) => (
              <span key={`${dia}-${i}`}>{dia}</span>
            ))}
          </div>
          <div className="date-input-br-grid">
            {celulas.map((d, i) => {
              if (!d) return <span key={`e-${i}`} className="date-input-br-empty" />;
              const iso = toIso(cursor.y, cursor.m, d);
              const selecionadoDia = isoValue === iso;
              const hojeDia =
                d === hoje.getDate() &&
                cursor.m === hoje.getMonth() + 1 &&
                cursor.y === hoje.getFullYear();
              const disabled = diaDesabilitado(d);
              return (
                <button
                  key={iso}
                  type="button"
                  className={[
                    'date-input-br-day',
                    selecionadoDia ? 'is-selected' : '',
                    hojeDia ? 'is-today' : '',
                    disabled ? 'is-disabled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={disabled}
                  onClick={() => escolherDia(d)}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
