export const spanishUsers: string[] = [
  'carlos.madrid_',
  'lucia_bcn22',
  'pablo.sevilla',
  'marta_vlc',
  'jorge.bilbao',
  'sofia_malaga',
  'alex.granada_',
  'nuria.zaragoza',
  'ivan_vigo',
  'alba.cordoba',
  'miguel.alicante',
  'claudia_bcn',
  'sergio.murcia_',
  'patricia.leon',
  'raul.burgos22',
  'elena_sevilla_',
  'david.salamanca',
  'laura.getafe',
  'antonio_malaga',
  'beatriz.vlc',
  'roberto.badalona',
  'cristina_madrid',
  'fernando.bilbao_',
  'silvia.granada22',
  'javier.zaragoza',
  'ana.cordoba_',
  'victor.alicante',
  'irene_vigo',
  'oscar.leon',
  'noelia.murcia22',
  'gonzalo_bcn',
  'tamara.sevilla_',
  'ruben.madrid22',
  'vanesa.vlc',
  'hector.burgos_',
  'monica.salamanca',
  'jaime_bilbao22',
  'rocio.malaga_',
  'andres.granada',
  'lorena.zaragoza_',
];

export function getRandomUsers(count: number, exclude?: string[]): string[] {
  const filtered = spanishUsers.filter((u) => !exclude?.includes(u));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getAvatarGradient(username: string): string {
  const gradients = [
    'from-pink-500 to-purple-600',
    'from-blue-500 to-cyan-400',
    'from-orange-500 to-pink-500',
    'from-green-400 to-teal-500',
    'from-violet-500 to-blue-500',
    'from-rose-500 to-orange-400',
  ];
  const idx = username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradients.length;
  return gradients[idx];
}

export function getInitials(username: string): string {
  const clean = username.replace(/[._0-9]/g, '').toUpperCase();
  return clean.slice(0, 2) || 'U';
}
