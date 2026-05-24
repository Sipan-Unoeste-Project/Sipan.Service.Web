const CHAVE_ANIMAIS = "sipan_animais";

export const listarAnimais = () => {
  const dados = localStorage.getItem(CHAVE_ANIMAIS);
  return dados ? JSON.parse(dados) : [];
};

export const salvarAnimais = (animais) => {
  localStorage.setItem(CHAVE_ANIMAIS, JSON.stringify(animais));
};

export const adicionarAnimal = (novoAnimal) => {
  const animais = listarAnimais();
  
  const animalCompleto = {
    ...novoAnimal,
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    dataCadastro: new Date().toISOString()
  };

  animais.push(animalCompleto);
  salvarAnimais(animais);
  
  return animalCompleto;
};

export const atualizarAnimal = (id, animalAtualizado) => {
  const animais = listarAnimais();
  const index = animais.findIndex(a => a.id === id);
  
  if (index !== -1) {
    animais[index] = { 
      ...animalAtualizado, 
      id 
    };
    salvarAnimais(animais);
    return animais[index];
  }
  return null;
};

export const excluirAnimal = (id) => {
  const animais = listarAnimais().filter(animal => animal.id !== id);
  salvarAnimais(animais);
  return true;
};

export const buscarAnimalPorId = (id) => {
  return listarAnimais().find(animal => animal.id === id);
};
