import { useState, useEffect } from "react";
import { adicionarAnimal, atualizarAnimal } from "../../utils/storageAnimais";
import { modeloAnimal, portes, statusOptions } from "../../utils/modeloAnimal";

const FormularioAnimal = ({
    animalParaEditar = null,
    onSalvar,
    onCancelar,
    onFeedback,
}) => {
    const [form, setForm] = useState(modeloAnimal);
    const [previewFoto, setPreviewFoto] = useState(null);
    const [erros, setErros] = useState({});

    useEffect(() => {
        if (animalParaEditar) {
            setForm({ ...modeloAnimal, ...animalParaEditar });
            if (animalParaEditar.foto) setPreviewFoto(animalParaEditar.foto);
        } else {
            setForm(modeloAnimal);
            setPreviewFoto(null);
        }
    }, [animalParaEditar]);

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
        const errosExistem = !!novosErros.dataNascimento || !!novosErros.dataAcolhimento;
        return !errosExistem;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        const animalSalvar = {
            ...form,
            id: animalParaEditar?.id,
            dataNascimento: form.dataNascimento || null,
            dataAcolhimento: form.dataAcolhimento || null,
            vacinas: form.vacinas || null,
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
            onFeedback?.("Erro ao salvar o animal. Verifique se a API está em execução.", "error");
            console.error(error);
        }
    };

    return (
                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-12 col-md-6">
                            <label className="form-label">Nome</label>
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
                            <label className="form-label">Espécie</label>
                            <input
                                type="text"
                                name="especie"
                                value={form.especie}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Ex: Cachorro, Gato, Coelho..."
                            />
                            {erros.especie && <div className="text-danger small mt-1">{erros.especie}</div>}
                        </div>

                        <div className="col-12 col-md-6">
                            <label className="form-label">Raça</label>
                            <input
                                type="text"
                                name="raca"
                                value={form.raca}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Ex: SRD, Labrador, Siamese, Sem raça definida"
                            />
                        </div>

                        <div className="col-12 col-md-6">
                            <label className="form-label">Sexo</label>
                            <select
                                name="sexo"
                                value={form.sexo}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="Macho">Macho</option>
                                <option value="Fêmea">Fêmea</option>
                                <option value="Desconhecido">Desconhecido</option>
                            </select>
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
                            <label className="form-label">Data de Acolhimento</label>
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
                            <select
                                name="porte"
                                value={form.porte}
                                onChange={handleChange}
                                className="form-select"
                            >
                                {portes.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12 col-md-6">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="form-select"
                            >
                                {statusOptions.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
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
                            <label className="form-label">Vacinas</label>
                            <input
                                type="text"
                                name="vacinas"
                                value={form.vacinas}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="V8, Antirrábica, Giárdia, Leucemia felina..."
                            />
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
