import "./spinner.css";

/**
 * Spinning loading indicator. It inherits the text color, so callers can
 * restyle it (size, color, spacing...) through `className`.
 * @param {{ label: string, className?: string }} props
 */
const Spinner = ({ label, className }) => (
  <svg
    className={className ? `spinner ${className}` : "spinner"}
    viewBox="0 0 24 24"
    fill="none"
    role="img"
    aria-label={label}
  >
    <circle
      className="spinner__track"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="spinner__head"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default Spinner;
