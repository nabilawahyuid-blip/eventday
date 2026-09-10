import React from "react";
import "./Button.css";

function Button({
  children,
  type = "button",
  variant = "primary",
  onClick,
}) {
  return (
    <button
      type={type}
      className={`custom-button ${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;