import { useState, useEffect, useRef } from "react";
import FormSelect from "../../../../components/FormSelect";
import { adicionarAnimal, atualizarAnimal } from "../../utils/storageAnimais";
import { modeloAnimal, portes, statusOptions } from "../../utils/modeloAnimal";
import { ESPECIES } from "../../utils/especies";
import { listarRacas, adicionarNovaRaca } from "../../utils/racasStorage";

const FormularioAnimal = ({
    animalParaEditar = null,
    onSalvar,
    onCancelar,
    onFeedback,
}) => {
    const [form, setForm] = useState(modeloAnimal);
    const [previewFoto, setPreviewFoto] = useState(null);
    const [racas, setRacas] = useState([]);
    const [erros, setErros] = useState({});
    const [showAddRaca, setShowAddRaca] = useState(false);
    const [newRaca, setNewRaca] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const inputRacaRef = useRef(null);

    useEffect(() => {
        if (animalParaEditar) {
            setForm({ ...modeloAnimal, ...animalParaEditar });
            if (animalParaEditar.foto) setPreviewFoto(animalParaEditar.foto);

            if (animalParaEditar.especie) {
                listarRacas(animalParaEditar.especie).then(setRacas);
            }
        } else {
            setForm(modeloAnimal);
            setPreviewFoto(null);
            setRacas([]);
        }
    }, [animalParaEditar]);

    useEffect(() => {

        if (form.especie) setRacas(listarRacas(form.especie));
        else setRacas([]);
    }, [form.especie]);

    useEffect(() => {
        const carregarRacas = async () => {
            if (form.especie) {
                const lista = await listarRacas(form.especie);
                setRacas(lista);
            } else {
                setRacas([]);
            }
        };
        carregarRacas();
    }, [form.especie]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));

        if (erros[name]) {
            setErros(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                onFeedback?.("A foto deve ter no máximo 5MB", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, foto: reader.result }));
                setPreviewFoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validarFormulario = () => {
        const novosErros = {};
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (!form.nome || !form.nome.trim()) {
            novosErros.nome = "Campo obrigatório";
        }

        if (!form.especie || !form.especie.trim()) {
            novosErros.especie = "Campo obrigatório";
        }

        if (!form.dataAcolhimento) {
            novosErros.dataAcolhimento = "Campo obrigatório";
        }

        if (form.dataNascimento) {
            const nascimento = new Date(form.dataNascimento);
            if (nascimento > hoje) {
                novosErros.dataNascimento = "Data de nascimento não pode ser futura";
            }
        }

        if (form.dataAcolhimento) {
            const acolhimento = new Date(form.dataAcolhimento);
            if (acolhimento > hoje) {
                novosErros.dataAcolhimento = "Data de acolhimento não pode ser futura";
            }
        }

        if (form.dataNascimento && form.dataAcolhimento) {
            const nascimento = new Date(form.dataNascimento);
            const acolhimento = new Date(form.dataAcolhimento);

            if (acolhimento < nascimento) {
                novosErros.dataAcolhimento = "Data de acolhimento não pode ser anterior à data de nascimento";
            }
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        const animalSalvar = {
            ...form,
            id: animalParaEditar?.id,
            dataNascimento: form.dataNascimento || null,
            dataAcolhimento: form.dataAcolhimento || null,
            sobre: form.sobre || null,
            foto: form.foto || null,
        };

        try {
            if (animalParaEditar) {
                await atualizarAnimal(animalParaEditar.id, animalSalvar);
                onFeedback?.("Animal atualizado com sucesso!", "success");
            } else {
                await adicionarAnimal(animalSalvar);
                onFeedback?.("Animal cadastrado com sucesso!", "success");
            }

            onSalvar?.();

            if (!animalParaEditar) {
                setForm(modeloAnimal);
                setPreviewFoto(null);
            }
        } catch (error) {
            onFeedback?.("Preencha todos os campos obrigatórios.", "error");
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row g-3">
                <div className="col-12 col-md-6">
                    <label className="form-label">Nome <span style={{ color: 'var(--bs-danger)' }}>*</span></label>
                    <input
                        type="text"
                        name="nome"
                        value={form.nome}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Ex: Thor, Luna, Bob"
                    />
                    {erros.nome && <div className="text-danger small mt-1">{erros.nome}</div>}
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label">Espécie <span style={{ color: 'var(--bs-danger)' }}>*</span></label>
                    <FormSelect
                        name="especie"
                        value={form.especie}
                        onChange={(e) => {
                            handleChange(e);
                            const nova = e.target.value;
                            setTimeout(() => {
                                const list = listarRacas(nova);
                                setRacas(list);
                                setForm((prev) => ({ ...prev, raca: "" }));
                            }, 0);
                        }}
                    >
                        <option value="">Selecione espécie</option>
                        {ESPECIES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </FormSelect>
                    {erros.especie && <div className="text-danger small mt-1">{erros.especie}</div>}
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label">Raça</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            ref={inputRacaRef}
                            type="text"
                            name="raca"
                            value={form.raca}
                            onChange={(e) => {
                                handleChange(e);
                                setShowSuggestions(true);
                                setHighlightIndex(-1);
                            }}
                            onFocus={() => { if (racas.length) setShowSuggestions(true); }}
                            onBlur={() => { setTimeout(() => setShowSuggestions(false), 150); }}
                            onKeyDown={(e) => {
                                const filtered = racas.filter(r => r.toLowerCase().includes((form.raca || '').toLowerCase()));
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
                                    setShowSuggestions(true);
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setHighlightIndex((i) => Math.max(i - 1, 0));
                                } else if (e.key === 'Enter') {
                                    if (highlightIndex >= 0 && filtered[highlightIndex]) {
                                        const sel = filtered[highlightIndex];
                                        setForm((prev) => ({ ...prev, raca: sel }));
                                        setShowSuggestions(false);
                                        setHighlightIndex(-1);
                                        e.preventDefault();
                                    }
                                } else if (e.key === 'Escape') {
                                    setShowSuggestions(false);
                                    setHighlightIndex(-1);
                                }
                            }}
                            className="form-control"
                            placeholder={form.especie ? 'Digite para filtrar ou selecione' : 'Selecione a espécie primeiro'}
                            disabled={!form.especie}
                        />

                        <button
                            type="button"
                            title="Cadastrar raça"
                            style={{ position: 'absolute', right: 0, top: 0, borderColor: 'var(--color-accent)', fontSize: '1.5rem', borderRadius: 'var(--radius)', padding: '0 0.25rem' }}
                            onClick={() => {
                                if (!form.especie) {
                                    onFeedback?.('Selecione a espécie antes de cadastrar uma raça', 'error');
                                    return;
                                }
                                setShowAddRaca(true);
                                setNewRaca('');
                            }}
                        >
                            +
                        </button>

                        {showSuggestions && form.especie && (
                            <ul className="autocomplete-list">
                                {racas.filter(r => r.toLowerCase().includes((form.raca || '').toLowerCase())).map((r, idx) => (
                                    <li
                                        key={r}
                                        className={`autocomplete-item ${idx === highlightIndex ? 'highlight' : ''}`}
                                        onMouseDown={() => {
                                            setForm((prev) => ({ ...prev, raca: r }));
                                            setShowSuggestions(false);
                                            setHighlightIndex(-1);
                                        }}
                                    >
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {showAddRaca && (
                        <div className="mt-2 d-flex gap-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder={`Nova raça para ${form.especie}`}
                                value={newRaca}
                                onChange={(e) => setNewRaca(e.target.value)}
                            />
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={async () => {                    
                                    const nome = (newRaca || '').trim();
                                    if (!nome) return;

                                    try {
                                        const novasRacas = await adicionarNovaRaca(form.especie, nome);
                                        setRacas(novasRacas);
                                        setForm((prev) => ({ ...prev, raca: nome }));
                                        setShowAddRaca(false);
                                        setNewRaca('');
                                        onFeedback?.('Raça adicionada com sucesso!', 'success');
                                    } catch (error) {
                                        onFeedback?.(error.message || 'Erro ao adicionar raça', 'error');
                                    }
                                }}
                            >
                                Salvar
                            </button>
                            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddRaca(false)}>Cancelar</button>
                        </div>
                    )}
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label">Sexo</label>
                    <FormSelect
                        name="sexo"
                        value={form.sexo}
                        onChange={handleChange}
                    >
                        <option value="Macho">Macho</option>
                        <option value="Fêmea">Fêmea</option>
                        <option value="Desconhecido">Desconhecido</option>
                    </FormSelect>
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label">Data de Nascimento</label>
                    <input
                        type="date"
                        name="dataNascimento"
                        value={form.dataNascimento}
                        onChange={handleChange}
                        className="form-control"
                        max={new Date().toISOString().split("T")[0]}
                    />
                    {erros.dataNascimento && <div className="text-danger small mt-1">{erros.dataNascimento}</div>}
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label">Data de Acolhimento <span style={{ color: 'var(--bs-danger)' }}>*</span></label>
                    <input
                        type="date"
                        name="dataAcolhimento"
                        value={form.dataAcolhimento}
                        onChange={handleChange}
                        className="form-control"
                        max={new Date().toISOString().split("T")[0]}
                    />
                    {erros.dataAcolhimento && <div className="text-danger small mt-1">{erros.dataAcolhimento}</div>}
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label">Porte</label>
                    <FormSelect
                        name="porte"
                        value={form.porte}
                        onChange={handleChange}
                    >
                        {portes.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </FormSelect>
                </div>

                <div className="col-12">
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            name="castrado"
                            checked={form.castrado}
                            onChange={handleChange}
                            id="castradoSwitch"
                        />
                        <label className="form-check-label" htmlFor="castradoSwitch">
                            Castrado
                        </label>
                    </div>
                </div>

                <div className="col-12">
                    <label className="form-label">Sobre o animal</label>
                    <textarea
                        name="sobre"
                        value={form.sobre}
                        onChange={handleChange}
                        className="form-control"
                        rows="4"
                        placeholder="Descreva o temperamento, histórico, observações importantes..."
                    />
                </div>

                <div className="col-12">
                    <label className="form-label">Foto do Animal</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="form-control"
                    />

                    {previewFoto && (
                        <div className="mt-3">
                            <img
                                src={previewFoto}
                                alt="Preview da foto"
                                className="img-fluid rounded border"
                                style={{ maxHeight: 250 }}
                            />
                        </div>
                    )}
                </div>

                <div className="col-12 d-flex justify-content-between">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={onCancelar}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="btn btn-success"
                    >
                        {animalParaEditar ? "Atualizar Animal" : "Cadastrar Animal"}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default FormularioAnimal;
