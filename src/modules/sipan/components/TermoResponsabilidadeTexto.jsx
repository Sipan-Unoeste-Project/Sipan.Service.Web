const CLAUSULAS = [
  {
    titulo: 'Cuidados básicos',
    texto:
      'Oferecer ao animal alimentação adequada, água fresca à vontade, abrigo seguro, higiene e convívio, ' +
      'respeitando as necessidades da espécie, do porte e da idade.',
  },
  {
    titulo: 'Saúde',
    texto:
      'Manter vacinação e vermifugação em dia, levar o animal ao médico-veterinário sempre que necessário ' +
      '(inclusive para castração, quando recomendada) e comunicar à APAC qualquer problema grave de saúde.',
  },
  {
    titulo: 'Proibição de maus-tratos e abandono',
    texto:
      'Não abandonar, maltratar, agredir, manter acorrentado ou preso de forma permanente, nem submeter o ' +
      'animal a qualquer forma de crueldade, ciente de que tais atos configuram crime previsto na legislação ' +
      'vigente (Lei nº 9.605/1998, art. 32).',
  },
  {
    titulo: 'Proibição de repasse',
    texto:
      'Não vender, doar, trocar ou ceder o animal a terceiros sem autorização prévia e por escrito da APAC.',
  },
  {
    titulo: 'Segurança',
    texto:
      'Manter o local de moradia seguro (muros, telas ou proteções) para evitar fugas e acidentes, e identificar ' +
      'o animal sempre que possível.',
  },
  {
    titulo: 'Acompanhamento',
    texto:
      'Permitir visitas de acompanhamento e aceitar contatos da equipe da APAC, mediante combinação prévia, ' +
      'para verificar as condições de bem-estar do animal.',
  },
  {
    titulo: 'Devolução',
    texto:
      'Caso não seja mais possível manter o animal, comunicar a APAC e devolvê-lo à instituição, sem repassá-lo ' +
      'a terceiros.',
  },
  {
    titulo: 'Descumprimento',
    texto:
      'Em caso de descumprimento deste termo, a guarda do animal poderá ser revertida à APAC, sem prejuízo das ' +
      'demais medidas legais cabíveis.',
  },
  {
    titulo: 'Veracidade e dados pessoais',
    texto:
      'Declarar que as informações prestadas na solicitação são verdadeiras e autorizar o uso dos dados ' +
      'pessoais informados exclusivamente para o processo de adoção e o acompanhamento do animal.',
  },
];

/**
 * Texto completo do Termo de Responsabilidade de adoção.
 * Opcionalmente personalizado com o nome do adotante e do animal.
 */
export default function TermoResponsabilidadeTexto({ nomeAdotante, animalNome }) {
  return (
    <div style={{ fontSize: '0.875rem' }}>
      <h6 className="fw-bold text-center mb-3">TERMO DE RESPONSABILIDADE PARA ADOÇÃO DE ANIMAL</h6>

      <p>
        {nomeAdotante ? <strong>{nomeAdotante}</strong> : 'O(A) adotante'}, ao assinar este termo,
        declara que adota{' '}
        {animalNome ? <strong>{animalNome}</strong> : 'o animal indicado na solicitação'}, sob guarda
        da APAC, e assume as seguintes responsabilidades:
      </p>

      <ol className="ps-3 mb-3">
        {CLAUSULAS.map((c) => (
          <li key={c.titulo} className="mb-2">
            <strong>{c.titulo}.</strong> {c.texto}
          </li>
        ))}
      </ol>

      <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
        Assinatura eletrônica: ao digitar o nome completo e confirmar, o adotante manifesta sua
        concordância com todas as cláusulas acima. A data e a hora da assinatura são registradas
        pelo sistema.
      </p>
    </div>
  );
}
