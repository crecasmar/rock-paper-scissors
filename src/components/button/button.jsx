import { Link } from "react-router";

import { BUTTON_VARIANTS } from "./button-variants";

import "./button.css";

/**
 * Button shared by the whole app. It renders a link when it navigates (`to`)
 * and a button when it runs an action.
 * @param {{ variant?: string, to?: import("react-router").To, className?: string, children: import("react").ReactNode } & Record<string, any>} props
 */
const Button = ({
  variant = BUTTON_VARIANTS.PRIMARY,
  to,
  className,
  children,
  ...props
}) => {
  const classes = ["button", `button_${variant}`, className]
    .filter(Boolean)
    .join(" ");

  if (to !== undefined) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
