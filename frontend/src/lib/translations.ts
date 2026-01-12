// Polish to English translations for room names
export const roomTranslations: Record<string, string> = {
  'Salon': 'Living Room',
  'Sypialnia': 'Bedroom',
  'Kuchnia': 'Kitchen',
  'Łazienka': 'Bathroom',
  'Korytarz': 'Hallway',
  'Biuro': 'Office',
  'Garaż': 'Garage',
  'Pokój dzieci': 'Kids Room',
  'Pokój Dzieci': 'Kids Room',
  'Jadalnia': 'Dining Room',
  'Gabinet': 'Study',
  'Pralnia': 'Laundry',
  'Przedpokój': 'Entryway',
};

// Polish to English translations for device names
export const deviceNameTranslations: Record<string, string> = {
  // Exact device name mappings (case-insensitive matching)
  'korytarz 1': 'Hallway 1',
  'korytarz 2': 'Hallway 2',
  'kuchnia': 'Kitchen',
  'salon': 'Living Room',
  'sypialnia': 'Bedroom',
  'łazienka': 'Bathroom',
  'pokój dzieci': 'Kids Room',
  'jadalnia': 'Dining Room',
  'gabinet': 'Study',
  'pralnia': 'Laundry',

  // Sensors
  'Czujnik zalania kuchnia': 'Kitchen Sensor',
  'Czujnik zalania łazienka': 'Bathroom Sensor',
  'Czujnik zalania': 'Water Sensor',
  'Stacja meteo': 'Weather Station',
  'Drzwi': 'Door Sensor',

  // Thermostats
  'Grzejnik salon': 'Radiator Living Room',
  'Grzejnik sypialnia': 'Radiator Bedroom',
  'Grzejnik kuchnia': 'Radiator Kitchen',
  'Grzejnik łazienka': 'Radiator Bathroom',
  'Grzejnik korytarz': 'Radiator Hallway',
  'Grzejnik pokój dzieci': 'Radiator Kids Room',
  'Grzejnik': 'Radiator',
};

// Word-by-word replacements for partial matches
const wordReplacements: Record<string, string> = {
  'korytarz': 'Hallway',
  'kuchnia': 'Kitchen',
  'salon': 'Living Room',
  'sypialnia': 'Bedroom',
  'łazienka': 'Bathroom',
  'pokój dzieci': 'Kids Room',
  'pokój': 'Room',
  'dzieci': 'Kids',
  'Czujnik zalania': 'Water Sensor',
  'Stacja meteo': 'Weather Station',
  'Grzejnik': 'Radiator',
  'Drzwi': 'Door',
  'Lampa': 'Light',
  'duży': 'Large',
  'mały': 'Small',
  'główny': 'Main',
  'górny': 'Upper',
  'dolny': 'Lower',
};

export function translateRoom(room: string | null): string {
  if (!room) return 'Unassigned';
  return roomTranslations[room] || room;
}

export function translateDeviceName(name: string): string {
  if (!name) return name;

  // Check for exact match first (case-insensitive)
  const lowerName = name.toLowerCase();
  for (const [polish, english] of Object.entries(deviceNameTranslations)) {
    if (lowerName === polish.toLowerCase()) {
      return english;
    }
  }

  // Try word-by-word replacement (longest matches first)
  let translated = name;
  const sortedReplacements = Object.entries(wordReplacements)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [polish, english] of sortedReplacements) {
    const regex = new RegExp(polish, 'gi');
    translated = translated.replace(regex, english);
  }

  return translated;
}

// Room icons (using English names)
export const roomIcons: Record<string, string> = {
  'Living Room': '🛋️',
  'Bedroom': '🛏️',
  'Kitchen': '🍳',
  'Bathroom': '🚿',
  'Office': '💼',
  'Hallway': '🚪',
  'Garage': '🚗',
  'Kids Room': '🧒',
  'Dining Room': '🍽️',
  'Study': '📚',
  'Laundry': '🧺',
  'Entryway': '🚪',
  'Unassigned': '📦',
};

export function getRoomIcon(room: string): string {
  return roomIcons[room] || '🏠';
}
