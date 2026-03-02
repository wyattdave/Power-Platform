# Copilot Instructions for AutoReview Pro

These instructions guide AI coding agents working in this repository to be immediately productive and consistent with project conventions.

## Project Overview
- standard web technologies: HTML, CSS, JavaScript (ES6+).
- Core files:
  - `index.html`: Structure, assets, and script/style inclusions.
  - `styles.css`: responsive and built to light/dark themes using CSS custom properties.
  - `script.js`: key functionality of the site
  - `dom.js`: dom manipulation functions
  - `imgs/`: image files for UI icons.
  - `README.md`: Features, usage, and future enhancements.
  - `Sitemap.xml`: for search engine indexing.
- No build step or backend;
- Create as a Progressive Web App (PWA) with service worker for offline support and caching, but with always fetching latest data when online.
- cloudflare hosting

- Follow `wyattdave.instructions.md` conventions:
  - Use camelCase for variables and functions.
  - Prefix variable names: `b` boolean, `i` number, `s` string, `a` array, `o` object, `e` element.
- Ensure variables are type consistent and avoid implicit type coercion by using naming conventions.
- CSS should be in a separate file, avoid inline styles unless for dynamic styling.
- JavaScript should be in a separate file, avoid inline event handlers and scripts in html.
- JavaScript files should follow: script.js for main logic, dom.js for dom manipulation functions, specific js files for large logic, and per html page for page-specific logic.
- Function-first approach; avoid classes unless necessary.
- Build functions for reusability and testability; avoid inline code blocks.
- Use descriptive names for variables and functions, avoiding abbreviations.
- Use let and const, avoid var.
- Use const for dom elements where possible.
- Use strict equality `===` and inequality `!==`.
- Use `//` for single-line comments and `/* */` for multi-line comments.
- Use forEach, map, filter, reduce for array operations instead of for loops where appropriate.
- Use arrow functions for anonymous functions and callbacks.
- Use " for html attributes and ' for js strings, ` for template literals.
- Use `new RegExp("pattern","flags")` (avoid literal `/.../flags`).
- Use `fetch` for API calls, with async/await syntax.
- Handle errors gracefully with try/catch and user-friendly messages. 
- Follow the existing code style and conventions in the project for consistency.
- Prefer string concatenation `"a"+variable+"b"` over template literals.