const API_URL = "http://localhost:5089/api/animais";

export const listarAnimais = async () => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Erro ao carregar animais");
    return await res.json();
  } catch (error) {
    console.error("Erro ao listar animais:", error);
    return [];
  }
};

export const adicionarAnimal = async (novoAnimal) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoAnimal),
    });
    if (!res.ok) throw new Error("Erro ao cadastrar");
    return await res.json();
  } catch (error) {
    console.error("Erro ao adicionar animal:", error);
    throw error;
  }
};

export const atualizarAnimal = async (id, animalAtualizado) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(animalAtualizado),
    });
    if (!res.ok) throw new Error("Erro ao atualizar");
    return await res.json();
  } catch (error) {
    console.error("Erro ao atualizar animal:", error);
    throw error;
  }
};

export const excluirAnimal = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao excluir");
    return true;
  } catch (error) {
    console.error("Erro ao excluir animal:", error);
    throw error;
  }
};
