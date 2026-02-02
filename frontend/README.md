# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Debug Mode

### Overview

The application includes a comprehensive debug mode for development that displays all data exchanges with Supabase and OpenAI in real-time.

### Activation

**Keyboard shortcut:**
- Mac: `Cmd + Shift + D`
- Windows/Linux: `Ctrl + Shift + D`

A debug panel slides in from the right side of the screen.

### Features

- **Real-time logging** of all Supabase and OpenAI API calls
- **Filtering** by service type (Supabase/OpenAI)
- **Expandable log entries** showing full request/response data
- **Highlighted logs** for important events (form submissions, OpenAI responses)
- **Chronological timeline** with timestamps and duration metrics
- **Export functionality** to download logs as JSON
- **LocalStorage persistence** (max 100 logs, 7-day retention)
- **Dark mode support**

### Log Types

**Supabase:**
- Form submission inserts (highlighted)
- Email output inserts

**OpenAI:**
- Thread creation
- Message creation
- Run creation and polling
- Response retrieval (highlighted)
- Error handling

### Documentation

For detailed usage instructions, see [docs/debug-mode-usage.md](../docs/debug-mode-usage.md)

### Security

⚠️ **Important:** The debug mode is for development only and should never be enabled in production.

- API keys and tokens are automatically sanitized in logs
- Authorization headers are redacted
- Sensitive data is filtered before display

### Architecture

**Core files:**
- `src/components/DebugPanel.jsx` - Main UI component
- `src/context/DebugContext.jsx` - Global state management
- `src/lib/debugLogger.js` - Logging utilities

**Integration points:**
- `src/lib/supabase.js` - Supabase logging
- `src/lib/openai.js` - OpenAI logging
- `src/components/FormFlow.jsx` - Keyboard shortcut and panel rendering

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
