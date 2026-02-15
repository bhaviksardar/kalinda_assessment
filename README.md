# Comments + WorkFlow

Table -> Has all the information that was retireved through the Voice Agent call

Voice Agent -> Where user can call a restaurant of their choosing and a VAPI Voice Agent will commence its data retrieval
(Also added a map feature where the user can see local restaurants but did not have time to fully implement it)*

Statistics -> Where the user can see a basic statisical overview of their calls

Used VAPI Voice Agent and Mapbox APIs

VAPI Voice Agent Workflow

The agent is collects certain key information (Wait Time, Open Reservation Slots, Dietary Accomodation) -> Call is intiated -> adds pre-determined key information to Google Sheet
-> After call is ended, the application later appends the timestamp and trancript of the call to the sheet

Google Sheet DB: https://docs.google.com/spreadsheets/d/1Cz028f_UcrAhyzZpGmD2W0aBY4z-NivFCM2S6mqiKag/edit?usp=sharing


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
