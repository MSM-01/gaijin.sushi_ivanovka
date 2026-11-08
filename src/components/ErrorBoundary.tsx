import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useSettings } from '../store/settings';
import { translations } from '../i18n/translations';

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('GAIJIN SUSHI error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const tr = translations[useSettings.getState().lang];
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-6 text-center text-ink">
        <h1 className="font-display text-2xl">{tr['error.title']}</h1>
        <p className="max-w-sm text-mute">{tr['error.text']}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          {tr['error.reload']}
        </button>
      </div>
    );
  }
}
