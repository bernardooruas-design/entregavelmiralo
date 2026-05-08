export const ciudadesPorRegion: Record<string, string[]> = {
  Madrid: ['Madrid', 'Alcalá de Henares', 'Getafe', 'Leganés', 'Móstoles', 'Alcorcón'],
  Cataluña: ['Barcelona', 'Badalona', 'Hospitalet de Llobregat', 'Sabadell', 'Terrassa'],
  Catalunya: ['Barcelona', 'Badalona', 'Hospitalet de Llobregat', 'Sabadell', 'Terrassa'],
  Andalucía: ['Sevilla', 'Málaga', 'Córdoba', 'Granada', 'Jerez de la Frontera', 'Almería'],
  Andalusia: ['Sevilla', 'Málaga', 'Córdoba', 'Granada', 'Jerez de la Frontera', 'Almería'],
  'Comunidad Valenciana': ['Valencia', 'Alicante', 'Elche', 'Castellón de la Plana', 'Torrent'],
  'Valencian Community': ['Valencia', 'Alicante', 'Elche', 'Castellón de la Plana', 'Torrent'],
  'País Vasco': ['Bilbao', 'Vitoria-Gasteiz', 'San Sebastián', 'Barakaldo', 'Getxo'],
  'Basque Country': ['Bilbao', 'Vitoria-Gasteiz', 'San Sebastián', 'Barakaldo', 'Getxo'],
  Galicia: ['Vigo', 'A Coruña', 'Ourense', 'Santiago de Compostela', 'Pontevedra'],
  Aragón: ['Zaragoza', 'Huesca', 'Teruel', 'Calatayud', 'Monzón'],
  Aragon: ['Zaragoza', 'Huesca', 'Teruel', 'Calatayud', 'Monzón'],
  'Castilla y León': ['Valladolid', 'Burgos', 'Salamanca', 'León', 'Segovia'],
  'Castile and León': ['Valladolid', 'Burgos', 'Salamanca', 'León', 'Segovia'],
  Canarias: ['Las Palmas de Gran Canaria', 'Santa Cruz de Tenerife', 'La Laguna', 'Arrecife'],
  'Canary Islands': ['Las Palmas de Gran Canaria', 'Santa Cruz de Tenerife', 'La Laguna', 'Arrecife'],
  Murcia: ['Murcia', 'Cartagena', 'Lorca', 'Molina de Segura', 'Alcantarilla'],
  'Region of Murcia': ['Murcia', 'Cartagena', 'Lorca', 'Molina de Segura', 'Alcantarilla'],
  DEFAULT: ['España', 'Península Ibérica', 'Norte de España', 'Sur de España', 'Centro de España'],
};

export function getCiudadCercana(region: string): string {
  const ciudades = ciudadesPorRegion[region] || ciudadesPorRegion.DEFAULT;
  return ciudades[Math.floor(Math.random() * ciudades.length)];
}
