/**
 * Chevron down icon (Heroicons outline). Decorative: it inherits the text colour.
 * @param {import("react").SVGProps<SVGSVGElement>} props
 */
const ChevronDownIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
);

export default ChevronDownIcon;
