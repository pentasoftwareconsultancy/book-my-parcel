// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // 1. Base JS rules
  js.configs.recommended,

  // 2. React recommended rules
  pluginReact.configs.flat.recommended,

  // 3. Your custom config (LAST → overrides everything)
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      react: pluginReact,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",           // project doesn't maintain PropTypes

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];