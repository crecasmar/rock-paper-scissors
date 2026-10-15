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

| Comando                 | Qué hace                                                         |
| ----------------------- | ---------------------------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo con recarga en caliente                   |
| `npm run build`         | Genera la versión de producción en `dist/`                       |
| `npm run preview`       | Sirve en local la versión ya compilada (útil para probar la PWA) |
| `npm test`              | Ejecuta los tests en modo _watch_                                |
| `npm run test:coverage` | Ejecuta los tests una vez y genera el informe de cobertura       |
| `npm run lint`          | Revisa el código con ESLint                                      |

---

## 🎮 Funcionalidades

- **Registro de jugador**: pantalla inicial para introducir el nombre de tu jugador (siempre que sea válido).
- **Partida contra el bot**: eliges piedra, papel o tijera y el bot "piensa" durante 1 segundo antes de responder.
- **Bot impredecible**: el bot nunca repite la misma jugada dos veces seguidas.
- **Puntuación persistente**: cada victoria suma un punto. Las puntuaciones de todos los jugadores se guardan, así que si vuelves con el mismo nombre recuperas tu marcador.
- **Cerrar sesión** úsalo desde la barra de navegación para cambiar de jugador.
- **Multidioma**: español e inglés. El idioma se elige automáticamente según el navegador (inglés por defecto).
- **PWA instalable y offline**: las nuevas versiones se descargan en segundo plano y se usan en la siguiente visita, sin avisos ni recargas a mitad de partida.

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
- **Husky** + **lint-staged**: antes de cada commit se ejecutan ESLint y Prettier sobre los archivos modificados.

---

## 📁 Estructura del proyecto

```
src/
├── components/   # Componentes reutilizables (botones, barra de navegación, layout, spinner)
├── hooks/        # Hooks propios (lógica de cada ronda, valor con retardo)
├── locales/      # Traducciones en español e inglés
├── pages/        # Páginas: home, game y not-found
├── store/        # Estado global con Zustand
├── utils/        # Reglas del juego y validaciones
├── app.jsx       # Proveedores (idioma, router)
└── routes.jsx    # Definición de rutas
```

Hay alias de importación configurados para rutas más limpias: `@/` apunta a `src/` (también `@components`, `@pages`, `@store`, `@utils`…).

---

## ⚙️ Integración y despliegue continuo

El proyecto usa **GitHub Actions**:

- **Build** (`.github/workflows/build.yml`): en cada _pull request_ y en cada push a `main` ejecuta los tests con cobertura y lanza un análisis de **SonarQube Cloud**.
- **CI/CD Pipeline** (`.github/workflows/deploy.yml`): en cada push a `main` pasa el linter y los tests, compila la app y la publica en **GitHub Pages**.

> El build copia `index.html` como `404.html` para que, al recargar una ruta como `/game` en GitHub Pages, la app cargue correctamente.

### Flujo de ramas

Se trabaja sobre `develop` y las versiones se publican mediante _pull request_ a `main`, que es la rama que se despliega.
