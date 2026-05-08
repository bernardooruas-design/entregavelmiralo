export const cidadesBrasileiras: Record<string, string[]> = {
  'São Paulo': ['São Paulo', 'Guarulhos', 'Campinas', 'Santo André', 'Osasco', 'São Bernardo do Campo'],
  'Rio de Janeiro': ['Rio de Janeiro', 'Niterói', 'Nova Iguaçu', 'Duque de Caxias', 'São Gonçalo'],
  'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim'],
  'Bahia': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari'],
  'Paraná': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'],
  'Rio Grande do Sul': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'],
  'Pernambuco': ['Recife', 'Caruaru', 'Olinda', 'Petrolina', 'Paulista'],
  'Ceará': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú'],
  'Goiás': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde'],
  'Santa Catarina': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Chapecó'],
  'DEFAULT': ['Brasil', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba'],
};

export function getCidadeBrasileira(region: string, city: string): string {
  const list = cidadesBrasileiras[region] || cidadesBrasileiras[city] || cidadesBrasileiras['DEFAULT'];
  return list[Math.floor(Math.random() * list.length)];
}

export function getCidadeAleatoria(): string {
  const all = Object.values(cidadesBrasileiras).flat().filter(c => c !== 'Brasil');
  return all[Math.floor(Math.random() * all.length)];
}
