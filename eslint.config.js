import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/public/**",
      "**/scripts/**",
      "**/*.config.js",
      "**/*.config.ts",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    languageOptions: {
      formatter: {
        format: (results) => {
          if (
            results.every(
              (result) => result.errorCount === 0 && result.warningCount === 0
            )
          ) {
            return "✅ All ESLint checks passed successfully!";
          }
          return undefined; // Use default formatter for errors/warnings
        },
      },
    },
  },
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic
);
