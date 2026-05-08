export interface BrazilianUser {
  username: string;
  displayName: string;
  followers: number;
  city: string;
}

export const brazilianUsers: BrazilianUser[] = [
  { username: 'amanda.ferreira_', displayName: 'Amanda Ferreira', followers: 287, city: 'São Paulo' },
  { username: 'lucas.oliveira22', displayName: 'Lucas Oliveira', followers: 134, city: 'Rio de Janeiro' },
  { username: 'gabriela_santos', displayName: 'Gabriela Santos', followers: 412, city: 'Belo Horizonte' },
  { username: 'rafael.costa_', displayName: 'Rafael Costa', followers: 89, city: 'Curitiba' },
  { username: 'fernanda.lima__', displayName: 'Fernanda Lima', followers: 223, city: 'Porto Alegre' },
  { username: 'matheus_rodrigues', displayName: 'Matheus Rodrigues', followers: 156, city: 'Salvador' },
  { username: 'julia.alves_', displayName: 'Julia Alves', followers: 341, city: 'Fortaleza' },
  { username: 'pedro.souza22', displayName: 'Pedro Souza', followers: 198, city: 'Recife' },
  { username: 'isabela.pereira_', displayName: 'Isabela Pereira', followers: 267, city: 'Manaus' },
  { username: 'thiago_nascimento', displayName: 'Thiago Nascimento', followers: 112, city: 'Belém' },
  { username: 'carolina.freitas', displayName: 'Carolina Freitas', followers: 389, city: 'Goiânia' },
  { username: 'brunno.silva_', displayName: 'Brunno Silva', followers: 78, city: 'Florianópolis' },
  { username: 'natalia_carvalho', displayName: 'Natália Carvalho', followers: 445, city: 'Vitória' },
  { username: 'diego.araujo_', displayName: 'Diego Araújo', followers: 167, city: 'Campo Grande' },
  { username: 'leticia.mendes22', displayName: 'Leticia Mendes', followers: 234, city: 'João Pessoa' },
  { username: 'victor_gomes_', displayName: 'Victor Gomes', followers: 93, city: 'Teresina' },
  { username: 'bianca.moreira', displayName: 'Bianca Moreira', followers: 512, city: 'São Luís' },
  { username: 'eduardo_teixeira', displayName: 'Eduardo Teixeira', followers: 201, city: 'Maceió' },
  { username: 'mariana.barbosa_', displayName: 'Mariana Barbosa', followers: 378, city: 'Natal' },
  { username: 'henrique.cardoso', displayName: 'Henrique Cardoso', followers: 145, city: 'Porto Velho' },
  { username: 'priscila_santos_', displayName: 'Priscila Santos', followers: 289, city: 'Cuiabá' },
  { username: 'caio.ribeiro_', displayName: 'Caio Ribeiro', followers: 67, city: 'Macapá' },
  { username: 'larissa.monteiro', displayName: 'Larissa Monteiro', followers: 423, city: 'Rio Branco' },
  { username: 'willian_ferreira', displayName: 'Willian Ferreira', followers: 188, city: 'Palmas' },
  { username: 'thalita_rocha_', displayName: 'Thalita Rocha', followers: 334, city: 'Boa Vista' },
  { username: 'igor.pinto22', displayName: 'Igor Pinto', followers: 129, city: 'Aracaju' },
  { username: 'camila_xavier_', displayName: 'Camila Xavier', followers: 456, city: 'Porto Alegre' },
  { username: 'renato.vieira_', displayName: 'Renato Vieira', followers: 83, city: 'Campinas' },
  { username: 'aline.batista_', displayName: 'Aline Batista', followers: 267, city: 'Guarulhos' },
  { username: 'vinicius_correia', displayName: 'Vinícius Correia', followers: 310, city: 'São Paulo' },
];

export function censorUsername(username: string): string {
  if (username.length <= 3) return username + '*****';
  return username.slice(0, 3) + '*****';
}

export function getRandomBrazilianUsers(count: number): BrazilianUser[] {
  const shuffled = [...brazilianUsers].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function formatFollowers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
