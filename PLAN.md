# Smart Home Dashboard - Plan

## Cel
Własna aplikacja webowa do lokalnego sterowania urządzeniami Tuya Zigbee i Xiaomi WiFi.

## Stack Technologiczny

| Warstwa | Technologia |
|---------|-------------|
| Runtime | Bun |
| Backend | Hono (lekki, szybki) |
| Frontend | Vue 3 + Vite |
| UI | Tailwind CSS + shadcn-vue |
| Baza danych | SQLite (Bun native, zero-config) |
| Wykresy | Chart.js lub ApexCharts |
| Real-time | WebSocket (Bun native) |

## Biblioteki IoT

- **TuyAPI** - lokalna kontrola urządzeń Tuya przez gateway
- **miio** lub **node-yeelight-wifi** - sterowanie Xiaomi/Yeelight

## Architektura

```
┌─────────────────┐     ┌──────────────────┐
│   Vue Frontend  │────▶│  Bun/Hono API    │
│   (Dashboard)   │◀────│  (WebSocket)     │
└─────────────────┘     └────────┬─────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Tuya Gateway   │     │  Xiaomi Lights  │     │     SQLite      │
│    (TuyAPI)     │     │     (miio)      │     │   (historia)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Etapy Implementacji

### Etap 0: Pobranie Tuya Credentials (wymagane przed startem)

1. **Załóż konto na Tuya IoT Platform**
   - Wejdź na https://iot.tuya.com
   - Zarejestruj się (darmowe)

2. **Utwórz Cloud Project**
   - Cloud → Development → Create Cloud Project
   - Wybierz "Smart Home" jako Industry
   - Data center: Central Europe (lub najbliższy)

3. **Połącz aplikację Smart Life/Tuya**
   - W projekcie: Devices → Link Tuya App Account
   - Zeskanuj QR kod aplikacją Smart Life
   - Urządzenia pojawią się w konsoli

4. **Pobierz Device ID i Local Key**
   - Devices → All Devices
   - Kliknij urządzenie → Device ID, Local Key

5. **Alternatywa: tuya-cli**
   ```bash
   npx @tuyapi/cli wizard
   ```
   Interaktywny wizard do pobrania wszystkich credentials.

### Etap 1: Setup projektu
- [x] Inicjalizacja projektu Bun + Hono
- [ ] Setup Vue 3 + Vite + Tailwind
- [x] Konfiguracja SQLite (Bun:sqlite)

### Etap 2: Integracja Tuya
- [x] Pobranie credentials z Tuya IoT Platform (device ID, local key)
- [x] Implementacja Tuya Cloud API
- [ ] Implementacja TuyAPI local control
- [ ] Discovery urządzeń Zigbee przez gateway
- [x] API endpoints: GET /devices, POST /devices/:id/control

### Etap 3: Integracja Xiaomi
- [ ] Setup miio library
- [ ] Discovery urządzeń Yeelight/Xiaomi
- [ ] API endpoints dla lamp (on/off, brightness, color)

### Etap 4: Frontend Dashboard
- [ ] Layout z listą urządzeń
- [ ] Karty urządzeń (status, kontrolki)
- [ ] Grupowanie urządzeń po pokojach
- [ ] WebSocket dla live updates

### Etap 5: Historia i wykresy
- [x] Schema SQLite dla logów stanów
- [ ] Cron job zapisujący stany co X minut
- [ ] Widok historii z wykresami (temperatura, zużycie energii)

### Etap 6: Polish
- [ ] Responsywność (mobile)
- [ ] Dark mode
- [ ] PWA (offline access)

## Wymagania wstępne

1. **Tuya IoT Platform account** - potrzebne do pobrania:
   - Device ID
   - Local Key (do lokalnego sterowania)

2. **Xiaomi token** - pobranie tokenu urządzenia (miio --discover)

3. **SQLite** - plik lokalny, zero konfiguracji

## Struktura plików (propozycja)

```
smart-home/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Hono server
│   │   ├── tuya/             # TuyAPI wrapper
│   │   ├── xiaomi/           # miio wrapper
│   │   ├── db/               # SQLite schema + queries
│   │   └── ws/               # WebSocket handler
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.vue
│   │   ├── components/
│   │   │   ├── DeviceCard.vue
│   │   │   ├── RoomGroup.vue
│   │   │   └── HistoryChart.vue
│   │   └── views/
│   │       ├── Dashboard.vue
│   │       └── History.vue
└── data/                     # SQLite database file
```

## Uwagi

- TuyAPI wymaga pobrania `localKey` z Tuya IoT Platform
- Xiaomi wymaga włączenia "LAN Control" w aplikacji
- Niektóre czujniki Zigbee mogą nie wysyłać statusu ciągle (tylko przy zmianie)
