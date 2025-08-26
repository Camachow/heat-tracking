import React from "react";
import { useTheme } from "../theme/ThemeProvider";

export function ThemeToggle(props) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      {...props}
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={`Mudar para tema ${isDark ? "claro" : "escuro"}`}
      className={`theme-toggle ${isDark ? "on" : "off"} ${
        props.className || ""
      }`}
    >
      <svg className="icon sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="5"></circle>
        <g>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </g>
      </svg>
      <div className="knob" aria-hidden="true"></div>
      <svg className="icon moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
      </svg>
    </button>
  );
}
