import { useRegisterSW } from "virtual:pwa-register/react";

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("Service Worker registrado con éxito: ", r);
    },
    onRegisterError(error) {
      console.error("Error al registrar el Service Worker:", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div
      style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}
    >
      {/* Mensaje de que la app ya se puede usar sin internet */}
      {offlineReady && (
        <div style={toastStyle}>
          <span>¡El juego está listo para jugar offline!</span>
          <button style={btnStyle} onClick={close}>
            Cerrar
          </button>
        </div>
      )}

      {/* Alerta de que hay una nueva versión del juego disponible */}
      {needRefresh && (
        <div style={toastStyle}>
          <span>
            Nueva versión disponible. ¿Deseas actualizar el juego ahora?
          </span>
          <button style={btnStyle} onClick={() => updateServiceWorker(true)}>
            Actualizar
          </button>
          <button style={btnStyle} onClick={close}>
            Luego
          </button>
        </div>
      )}
    </div>
  );
}

// Estilos rápidos de ejemplo para la alerta flotante
const toastStyle = {
  background: "#333",
  color: "#fff",
  padding: "12px 20px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const btnStyle = {
  background: "#555",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  cursor: "pointer",
  borderRadius: "4px",
  marginRight: "5px",
};

export default ReloadPrompt;
