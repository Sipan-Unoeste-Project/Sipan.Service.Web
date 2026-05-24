import "./CardAnimal.css";

const CardAnimal = ({ animal, onAbrir }) => {
  return (
    <div className="card-animal">
      <div className="card-imagem">
        {animal.foto ? (
          <img src={animal.foto} alt={animal.nome} />
        ) : (
          <div className="sem-foto">
            Sem foto
          </div>
        )}
      </div>

      <div className="card-conteudo">
        <h3>{animal.nome}
          <span>
            {animal.sexo === "Macho" ? " ♂" : " ♀"}
          </span>
        </h3>
        <p><strong>Status:</strong>
          <span className={`status ${animal.status.toLowerCase().replace(" ", "-")}`}>
            {animal.status}
          </span>
        </p>

        <div className="card-acoes">
          <button
            className="botao-saiba-mais"
            onClick={() => onAbrir(animal)}
          >
            Saiba mais...
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardAnimal;
