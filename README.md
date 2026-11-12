# React + TypeScript Basic Login Window

A clean, modern, fully-typed React and TypeScript login window application built with Vite.

## 🚀 Features

- **TypeScript Type Safety**: Strongly-typed form models, validation errors, component props, and session state.
- **Multi-View Modes**:
  - **Card View**: Standard centered login screen layout.
  - **Modal Window View**: Overlay dialog popup with backdrop blur and close controls.
- **Registration-First Authentication**:
  - Only registered accounts can sign in.
  - If an unregistered email attempts to sign in, the system blocks access with: *"Access denied: No account found for '<email>'. You must register first before signing in!"* and provides a direct 1-click shortcut to the Register tab.
  - New users register on the **Register First** tab with full name, email, password, and confirmation check.
  - Upon registering, the account is stored in the database (`localStorage`) and the user is guided to sign in with their new credentials.
  - An interactive **Registered Users Database** drawer is included to view registered accounts, quickly test logins, or reset demo data.
- **User Experience**:
  - Show / Hide password toggles.
  - One-click "Use demo credentials" autofill button for instant testing.
  - Simulated network request with loading spinner and disabled submit state.
  - Clean inline validation feedback.
  - Social login buttons (Google, GitHub UI integration points).

## 📁 Project Structure

```text
├── index.html                   # HTML entry point with modern typography
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript strict configuration
├── vite.config.ts               # Vite bundler configuration
└── src/
    ├── types/
    │   └── auth.ts              # TypeScript interfaces (forms, errors, session)
    ├── components/
    │   ├── LoginWindow.tsx      # Main Login & Auth component
    │   └── LoginWindow.css      # CSS styles for the login window
    ├── App.tsx                  # Demo container with Card/Modal switcher
    ├── App.css                  # Page and modal layout styles
    ├── main.tsx                 # React DOM mount
    └── index.css                # Global base styles & font settings
```

## 🛠️ Getting Started

### 1. Navigate into project & run development server
```bash
cd login-window
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Build for Production
```bash
cd login-window
npm run build
```
This runs TypeScript compiler checks (`tsc -b`) and bundles production assets via Vite.

### 3. Preview Production Build
```bash
npm run preview
```

## 🧩 TypeScript Models

```typescript
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData extends LoginFormData {
  name: string;
  confirmPassword: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export interface UserSession {
  email: string;
  name?: string;
  token: string;
  loggedInAt: string;
}
```

