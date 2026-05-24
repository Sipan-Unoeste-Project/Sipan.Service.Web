import { useState, useEffect } from "react";
import { adicionarAnimal, atualizarAnimal } from "../../utils/storageAnimais";
import { modeloAnimal, portes, statusOptions } from "../../utils/modeloAnimal";
import "./FormularioAnimal.css";

const FormularioAnimal = ({ animalParaEditar = null, onSalvar }) => {
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
                alert("A foto deve ter no máximo 5MB");
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
        const erros = !!novosErros.dataNascimento || !!novosErros.dataAcolhimento;
        return !erros;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formularioValido = validarFormulario();

        if (!formularioValido) {
        return;
    }

        const animalSalvar = {
            ...form,
            id: animalParaEditar?.id || Date.now().toString(),
            dataCadastro: animalParaEditar?.dataCadastro || new Date().toISOString()
        };

        if (animalParaEditar) {
            atualizarAnimal(animalParaEditar.id, animalSalvar);
            alert("Animal atualizado com sucesso!");
        } else {
            adicionarAnimal(animalSalvar);
            alert("Animal cadastrado com sucesso!");
        }

        onSalvar?.();

        if (!animalParaEditar) {
            setForm(modeloAnimal);
            setPreviewFoto(null);
        }
    };

    return (
        <div className="formulario-container">
            <h2>{animalParaEditar ? "Editar Animal" : "Cadastrar Novo Animal"}</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div>
                        <label>Nome</label>
                        <input
                            type="text"
                            name="nome"
                            value={form.nome}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Ex: Thor, Luna, Bob"
                        />
                        {erros.nome && <span className="erro">{erros.nome}</span>}
                    </div>

                    <div>
                        <label>Espécie</label>
                        <input
                            type="text"
                            name="especie"
                            value={form.especie}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Ex: Cachorro, Gato, Coelho..."
                        />
                        {erros.especie && <span className="erro">{erros.especie}</span>}
                    </div>

                    <div>
                        <label>Raça</label>
                        <input
                            type="text"
                            name="raca"
                            value={form.raca}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Ex: SRD, Labrador, Siamese, Sem raça definida"
                        />
                    </div>

                    <div>
                        <label>Sexo</label>
                        <select name="sexo" value={form.sexo} onChange={handleChange} className="form-control">
                            <option value="Macho">Macho</option>
                            <option value="Fêmea">Fêmea</option>
                            <option value="Desconhecido">Desconhecido</option>
                        </select>
                    </div>

                    <div>
                        <label>Data de Nascimento</label>
                        <input
                            type="date"
                            name="dataNascimento"
                            value={form.dataNascimento}
                            onChange={handleChange}
                            className="form-control"
                            max={new Date().toISOString().split("T")[0]}
                        />
                        {erros.dataNascimento && <span className="erro">{erros.dataNascimento}</span>}
                    </div>

                    <div>
                        <label>Data de Acolhimento</label>
                        <input
                            type="date"
                            name="dataAcolhimento"
                            value={form.dataAcolhimento}
                            onChange={handleChange}
                            className="form-control"
                            max={new Date().toISOString().split("T")[0]}
                        />
                        {erros.dataAcolhimento && <span className="erro">{erros.dataAcolhimento}</span>}
                    </div>

                    <div>
                        <label>Porte</label>
                        <select name="porte" value={form.porte} onChange={handleChange} className="form-control">
                            {portes.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Status</label>
                        <select name="status" value={form.status} onChange={handleChange} className="form-control">
                            {statusOptions.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="checkbox-container">
                        <label>
                            <input
                                type="checkbox"
                                name="castrado"
                                checked={form.castrado}
                                onChange={handleChange}
                            />
                            Castrado
                        </label>
                    </div>
                </div>

                <div>
                    <label>Vacinas</label>
                    <input
                        type="text"
                        name="vacinas"
                        value={form.vacinas}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="V8, Antirrábica, Giárdia, Leucemia felina..."
                    />
                </div>

                <div>
                    <label>Sobre o animal</label>
                    <textarea
                        name="sobre"
                        value={form.sobre}
                        onChange={handleChange}
                        className="form-control"
                        rows="4"
                        placeholder="Descreva o temperamento, histórico, observações importantes..."
                    />
                </div>

                <div>
                    <label>Foto do Animal</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="form-control"
                    />

                    {previewFoto && (
                        <div className="preview-foto">
                            <img src={previewFoto} alt="Preview da foto" />
                        </div>
                    )}
                </div>

                <div className="form-acoes">
                    <button type="submit" className="botao botao-editar">
                        {animalParaEditar ? "Atualizar Animal" : "Cadastrar Animal"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioAnimal;