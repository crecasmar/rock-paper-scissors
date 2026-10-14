import "./action-button.css";

/**
 * Button used to pick a move.
 * @param {{ icon: string, label: string, onClick: () => void, disabled?: boolean }} props
 */
const ActionButton = ({ icon, label, onClick, disabled = false }) => (
  <button
    type="button"
    className="action-button"
    aria-label={label}
    aria-roledescription={"Este es un botón para jugar " + label}
    title={label}
    onClick={onClick}
    disabled={disabled}
  >
    <span aria-hidden="true">{icon}</span>
  </button>
);

export default ActionButton;
