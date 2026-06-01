import {
  listAnimais,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  toAnimalPayload,
} from '../../../api/animaisApi';

export const listarAnimais = (params) => listAnimais(params);

export const adicionarAnimal = async (novoAnimal) => {
  return createAnimal(toAnimalPayload(novoAnimal));
};

export const atualizarAnimal = async (id, animalAtualizado) => {
  return updateAnimal(id, toAnimalPayload(animalAtualizado));
};

export const excluirAnimal = (id) => deleteAnimal(id);
