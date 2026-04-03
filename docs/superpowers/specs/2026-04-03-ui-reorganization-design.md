# Reorganizacja UI - przeniesienie urządzeń do zakładek kategorii

## Problem

Dashboard pełni podwójną rolę - jest jednocześnie przeglądem stanu domu i jedynym miejscem, gdzie widać statusy poszczególnych urządzeń (lamp, grzejników). Zakładki kategorii (`/lighting`, `/heater-schedule`) zawierają wyłącznie narzędzia zarządzania (presety, harmonogramy, pending actions), ale nie wyświetlają statusów urządzeń.

## Rozwiązanie

Przenieść karty urządzeń z dashboardu do zakładek kategorii. Dashboard staje się lekkim przeglądem stanu domu z podsumowaniami. Zakładki kategorii zyskują sub-zakładki: Urządzenia | Presety | Harmonogramy.

---

## 1. Dashboard (`/`) - nowy układ

### HomeStatusCard - rozszerzenie z 3 do 4 kafelków

Dodać nowy kafelek "Climate" pokazujący ile grzejników aktywnie grzeje:

| Station | Radiators | Climate (NOWY) | Air Quality |
|---------|-----------|----------------|-------------|
| temp + wilgotność | średnia temp | X / Y active | AQI + label |

Kafelek "Climate" liczy urządzenia TRV (category `wkf`) z valve state `opened` vs łączna liczba TRV.

Źródło danych: `store.tuyaDevices.filter(d => d.category === 'wkf')` - parsować `last_status` JSON, sprawdzić DPS `'3'` === `"opened"` dla aktywnych. Komponent HomeStatusCard musi zaimportować store.tuyaDevices (obecnie używa tylko `store.homeStatus` i `store.airPurifier`).

Grid zmienia się z `grid-cols-3` na `grid-cols-4`. Na mobile `grid-cols-2` (2x2).

### Usunięte sekcje

- Sekcja "Lights" (grid LampCard) - przeniesiona do `/lighting`
- Sekcja "Climate" (grid TRVCard) - przeniesiona do `/heater-schedule`

### Sekcje bez zmian

- Quick Access (Yamaha, Roborock, Air Purifier, Weather Station)
- Door / Window sensors
- Flood Sensors

---

## 2. Lighting (`/lighting`) - sub-zakładki

### Struktura sub-zakładek

Trzy sub-zakładki zarządzane lokalnym stanem Svelte (bez zmian URL):

1. **Urządzenia** (domyślna) - grid LampCard w trybie compact
2. **Presety** - obecna sekcja presetów lamp (CRUD + Apply)
3. **Harmonogramy** - obecne sekcje: formularz tworzenia schedule + lista schedules + pending actions

### Sub-zakładka "Urządzenia"

- Grid responsywny: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`
- Komponent `LampCard` z props `compact` - identyczny jak był na dashboardzie
- Filtrowanie: `store.lamps.filter(l => l.category === 'lamp')`
- Kliknięcie otwiera dialog z suwakami jasności, temperatury koloru, quick presets

### Sub-zakładka "Presety"

Przenoszona bez zmian z obecnej sekcji "Lamp Presets":
- Grid presetów (day, night, off, custom)
- Edycja inline (brightness, color temp, power)
- Formularz tworzenia nowego presetu
- Przyciski Apply / Delete

### Sub-zakładka "Harmonogramy"

Przenoszone bez zmian z obecnych sekcji:
- "Create Schedule" - formularz (name, preset, time)
- "Schedules" - lista harmonogramów z toggle/edit/delete
- "Pending Actions" - lista oczekujących akcji z retry count

---

## 3. Climate (`/heater-schedule`) - sub-zakładki

### Struktura sub-zakładek

Analogicznie do Lighting - trzy sub-zakładki:

1. **Urządzenia** (domyślna) - grid TRVCard w trybie compact
2. **Presety** - obecna sekcja presetów grzewczych
3. **Harmonogramy** - obecne sekcje schedules + pending actions + formularz

### Sub-zakładka "Urządzenia"

- Grid responsywny: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`
- Komponent `TRVCard` z props `compact` - identyczny jak był na dashboardzie
- Filtrowanie: `store.tuyaDevices.filter(d => d.category === 'wkf')`
- Stany wizualne: Heating (pomarańczowy glow), Idle (niebieski), Off (wyszarzony)
- Kliknięcie otwiera dialog z kontrolą temperatury, quick presets, child lock

### Sub-zakładka "Presety"

Przenoszona bez zmian z obecnej sekcji "Heater Presets":
- Grid presetów (Home, Away, Off, custom)
- Edycja przez PresetDialog
- Formularz tworzenia nowego presetu
- Przyciski Apply / Delete

### Sub-zakładka "Harmonogramy"

Przenoszone bez zmian z obecnych sekcji:
- "Create Schedule" - formularz (name, preset, time)
- "Schedules" - lista harmonogramów z toggle/edit/delete
- "Pending Actions" - lista oczekujących akcji

---

## 4. Sub-zakładki - implementacja

### Komponent TabGroup

Lokalny stan Svelte (bez zmian routingu):

```
let activeTab = $state<'devices' | 'presets' | 'schedules'>('devices');
```

Styl sub-zakładek:
- Pasek pod nagłówkiem sekcji
- Aktywna zakładka: kolor kategorii (żółty dla Lighting, pomarańczowy dla Climate) + border-bottom 2px
- Nieaktywne: `text-content-tertiary`
- Na mobile: zakładki zajmują pełną szerokość (flex, equal width)

### Stylowanie

Sub-zakładki używają kolorów kategorii z istniejącego design systemu:
- Lighting: `--color-lights-text` (żółty)
- Climate: `--color-climate-heat-text` (pomarańczowy)

---

## 5. Strona Automations (`/automations`)

Bez zmian.

---

## 6. Backend

Bez zmian - wszystkie dane już dostępne w store przez WebSocket.

---

## 7. Pliki do modyfikacji

| Plik | Zmiana |
|------|--------|
| `frontend/src/routes/+page.svelte` | Usunąć sekcje Lights i Climate |
| `frontend/src/lib/components/HomeStatusCard.svelte` | Dodać 4. kafelek Climate, zmienić grid na 4 kolumny |
| `frontend/src/routes/lighting/+page.svelte` | Dodać sub-zakładki, przenieść grid LampCard do zakładki Urządzenia |
| `frontend/src/routes/heater-schedule/+page.svelte` | Dodać sub-zakładki, przenieść grid TRVCard do zakładki Urządzenia |

---

## 8. Weryfikacja

1. **Dashboard**: otworzyć `/` - sprawdzić 4 kafelki w HomeStatusCard, brak sekcji Lights i Climate
2. **Lighting**: otworzyć `/lighting` - sprawdzić sub-zakładki, przełączanie między Urządzenia/Presety/Harmonogramy
3. **Climate**: otworzyć `/heater-schedule` - sprawdzić sub-zakładki, przełączanie
4. **Sterowanie**: kliknąć kartę lampy/TRV - sprawdzić czy dialog działa poprawnie
5. **WebSocket**: zmienić stan urządzenia - sprawdzić czy aktualizacja jest widoczna w nowej lokalizacji
6. **Responsive**: sprawdzić na mobile (2 kolumny grid, sub-zakładki pełna szerokość)
7. **Kafelek Climate**: sprawdzić czy poprawnie liczy aktywne grzejniki (valve state "opened")
