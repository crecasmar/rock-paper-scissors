# ✊🖐️✌️ Piedra, Papel o Tijera

Juego clásico de **Piedra, Papel o Tijera** contra la máquina, hecho con React y Vite.

Introduces un nombre, eliges tu siguiente jugada y el bot responderá con la suya. Si ganas, sumarás un punto. Tu puntuación se guarda en el navegador, así que puedes cerrar la página y seguir jugando offline.

👉 **Juega aquí:** https://crecasmar.github.io/rock-paper-scissors/

---

## 🚀 Cómo arrancarlo en local

### Requisitos

- [Node.js](https://nodejs.org/) **26.12.0** (la versión está fijada en `.tool-versions`).
- npm (viene con Node).

### Pasos

1. Clona el repositorio:

   ```bash
   git clone https://github.com/crecasmar/rock-paper-scissors.git
   ```

2. Entra en la carpeta e instala las dependencias:

   ```bash
   cd rock-paper-scissors && npm install
   ```

3. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre en el navegador **http://localhost:5173/rock-paper-scissors/**

> ℹ️ La app se sirve bajo la ruta `/rock-paper-scissors/` (igual que en GitHub Pages), por eso la URL local la incluye.

### Scripts disponibles

| Comando                   | Qué hace                                                         |
| ------------------------- | ---------------------------------------------------------------- |
| `npm run dev`             | Servidor de desarrollo con recarga en caliente                   |
| `npm run build`           | Genera la versión de producción en `dist/`                       |
| `npm run preview`         | Sirve en local la versión ya compilada (útil para probar la PWA) |
| `npm test`                | Ejecuta los tests en modo _watch_                                |
| `npm run test:coverage`   | Ejecuta los tests una vez y genera el informe de cobertura       |
| `npm run test:e2e`        | Ejecuta los tests end-to-end con Playwright                      |
| `npm run test:e2e:ui`     | Abre los tests end-to-end en el modo interactivo de Playwright   |
| `npm run test:e2e:report` | Abre el informe HTML de la última ejecución end-to-end           |
| `npm run lint`            | Revisa el código con ESLint                                      |

---

## 🎮 Funcionalidades

- **Registro de jugador**: pantalla inicial para introducir el nombre de tu jugador (siempre que sea válido).
- **Modos de juego**: antes de entrar eliges el modo con el que vas a jugar:
  - **Clásico**: piedra, papel o tijera.
  - **Extendido**: piedra, papel, tijera, lagarto, Spock.
- **Partida contra el bot**: eliges tu jugada entre las del modo elegido y el bot "piensa" durante 1 segundo antes de responder.
- **Bot impredecible**: el bot nunca repite la misma jugada dos veces seguidas.
- **Puntuación y estadísticas**: cada victoria suma un punto en el modo en el que estés jugando y además puedes ver las estadísticas de tus partidas.
- **Cambia entre modos de juego**: puedes cambiar de modo desde la barra de navegación. Siempre tendrás instrucciones para jugar por si te olvidas.
- **Ranking**: desde la barra de navegación (con la sesión cerrada) puedes ver la clasificación de todos los jugadores.
- **Cerrar sesión** úsalo desde la barra de navegación para cambiar de jugador.
- **Multidioma**: español e inglés. El idioma se elige automáticamente según el idioma de tu navegador (inglés por defecto).
- **PWA instalable y offline**: las nuevas versiones se descargan en segundo plano y se usan en la siguiente visita, sin avisos ni recargas a mitad de partida.
- **Modo claro y oscuro**: utiliza la aplicación en el modo favorito de tu navegador.

### 🔮 Mejoras pendientes

Dos mejoras que se plantearon y quedan fuera de esta versión, con la idea de cómo se implementarían:

- **Jugar contra otro jugador** en lugar de contra la máquina. Hay dos enfoques posibles:
  - **En el mismo dispositivo, por turnos**: cada jugador elige su jugada y se oculta la pantalla antes de pasar el móvil al siguiente. El resultado se muestra cuando los dos han elegido. Bastaría con un nuevo modo en la store de la aplicación (`players: [a, b]`, `pendingMove`) y reutilizar `getRoundResult`, sustituyendo al bot por la jugada del segundo jugador en `useGameRound`.
  - **En dispositivos distintos, en tiempo real**: conexión directa entre navegadores con **WebRTC**, usando **PeerJS** por ser la opción más sencilla para un proyecto de este tamaño. PeerJS ofrece un servidor de señalización gratuito, así que la app puede seguir desplegada como web estática en GitHub Pages, sin backend propio. Un jugador crea una sala y comparte el enlace (`/game?room=<id>`). Cada uno envía su jugada por el canal de datos y solo se revelan cuando han llegado las dos, para que nadie pueda esperar a ver la del rival.
- **Un bot más "inteligente"**, con más probabilidad de ganar. Las personas no juegan al azar: repiten la jugada con la que acaban de ganar, cambian tras perder o tienen una jugada favorita. El bot guardaría el historial de jugadas del jugador e intentaría predecir la siguiente, por ejemplo contando qué suele jugar después de cada jugada. Después elegiría la jugada que gana a esa predicción. Para que no se vuelva predecible, mantendría un porcentaje de jugadas aleatorias. Todo encaja en `pickBotMove`, que ya recibe el contexto de la ronda anterior.

---

## 🧩 Tecnologías y plugins

### Aplicación

| Librería                                                 | Para qué se usa                                                                   |
| -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [React 19](https://react.dev/)                           | Interfaz de usuario                                                               |
| [Vite](https://vite.dev/)                                | Servidor de desarrollo y empaquetado                                              |
| [React Router](https://reactrouter.com/)                 | Navegación entre páginas                                                          |
| [Zustand](https://zustand.docs.pmnd.rs/)                 | Estado global (jugador actual y puntuaciones), con persistencia en `localStorage` |
| [React Intl](https://formatjs.github.io/docs/react-intl) | Traducciones (español / inglés)                                                   |
| [Tailwind CSS 4](https://tailwindcss.com/)               | Estilos                                                                           |

### Plugins de Vite

- **`@vitejs/plugin-react`**: soporte para React y recarga en caliente.
- **`@tailwindcss/vite`**: integración de Tailwind CSS.
- **`vite-plugin-pwa`** + **`@vite-pwa/assets-generator`**: genera el _service worker_, el manifiesto y los iconos de la PWA.

### Calidad de código y tests

- **[Vitest](https://vitest.dev/)** + **[Testing Library](https://testing-library.com/)** + **jsdom**: tests unitarios y de componentes.
- **Cobertura** con Istanbul (informes en `coverage/`).
- **ESLint** (con reglas de React Hooks y React Refresh) y **Prettier** para el formato.
- **[Playwright](https://playwright.dev/)**: tests end-to-end en Chromium (carpeta `e2e/`) que recorren la app como lo haría un usuario en diferentes rutas.
- **Husky** + **lint-staged**: antes de cada commit se ejecutan ESLint y Prettier sobre los archivos modificados.

---

## 📁 Estructura del proyecto

```
e2e/                  # Tests end-to-end con Playwright
├── helpers/          # Datos y utilidades compartidos (modos, reglas, jugadores de prueba)
└── *.spec.js         # Un recorrido de usuario por archivo (ronda clásica, extendida, estadísticas, ranking, puntuación)
src/
├── components/       # Componentes reutilizables (botones, barra de navegación, selector de modo, layout, spinner)
├── hooks/            # Hooks propios (lógica de cada ronda, valor con retardo)
├── locales/          # Traducciones en español e inglés
├── pages/            # Páginas: home, game, ranking y not-found
├── store/            # Estado global con Zustand
├── utils/            # Reglas del juego, ranking y validaciones
├── app.jsx           # Proveedores (idioma, router)
└── routes.jsx        # Definición de rutas
playwright.config.js  # Configuración de Playwright (arranca el servidor de desarrollo)
```

Hay alias de importación configurados para rutas más limpias: `@/` apunta a `src/` (también `@components`, `@pages`, `@store`, `@utils`…).

---

## ⚙️ Integración y despliegue continuo

El proyecto usa **GitHub Actions**:

- **Build** (`.github/workflows/build.yml`): en cada _pull request_ y en cada push a `main` ejecuta dos jobs en paralelo:
  - **SonarQube**: ejecuta los tests con cobertura y lanza un análisis de **SonarQube Cloud**.
  - **E2E tests**: instala Chromium y ejecuta los tests end-to-end de Playwright. El informe HTML se sube como artefacto (`playwright-report`) para poder revisarlo si algo falla.
- **CI/CD Pipeline** (`.github/workflows/deploy.yml`): en cada push a `main` pasa el linter y los tests, compila la app y la publica en **GitHub Pages**.

> El build copia `index.html` como `404.html` para que, al recargar una ruta como `/game` en GitHub Pages, la app cargue correctamente.

### Flujo de ramas

Se trabaja sobre `develop` y las versiones se publican mediante _pull request_ a `main`, que es la rama que se despliega.
