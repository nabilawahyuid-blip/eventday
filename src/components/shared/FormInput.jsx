import React from "react";
import "./FormInput.css";

function FormInput({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  name,
  id,
  forgotPassword = false,
  onForgotPassword,
}) {
  return (
    <div className="form-input-wrapper">

      {/* LABEL */}
      <div className="form-input-label-row">

        <label htmlFor={id || name}>
          {label}
        </label>

        {forgotPassword && (
          <button
            type="button"
            className="form-forgot-button"
            onClick={onForgotPassword}
          >
            Lupa Password?
          </button>
        )}

      </div>

      {/* INPUT */}
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

    </div>
  );
}

export default FormInput;