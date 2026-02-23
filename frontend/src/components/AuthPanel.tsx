import { Key } from "@phosphor-icons/react";

type AuthPanelProps = {
  passcodeInput: string;
  authorized: boolean;
  checking: boolean;
  errorMessage: string | null;
  onPasscodeInputChange: (value: string) => void;
  onVerify: () => void;
  onSignOut: () => void;
};

export function AuthPanel({
  passcodeInput,
  authorized,
  checking,
  errorMessage,
  onPasscodeInputChange,
  onVerify,
  onSignOut,
}: AuthPanelProps) {
  return (
    <section className="panel auth-panel" aria-label="Editor authorization">
      <div className="panel-heading">
        <h2>
          <Key size={18} weight="duotone" aria-hidden="true" /> Editor access
        </h2>
      </div>

      <label htmlFor="editor-passcode">
        Passcode
        <input
          id="editor-passcode"
          type="password"
          autoComplete="current-password"
          placeholder="Enter passcode"
          value={passcodeInput}
          onChange={(event) => onPasscodeInputChange(event.target.value)}
          disabled={checking}
          aria-describedby="editor-passcode-helper"
        />
      </label>
      <p id="editor-passcode-helper" className="field-helper">
        Enter the shared edit passcode to enable add, edit, and delete actions.
      </p>

      {errorMessage ? (
        <p className="field-error" role="alert">
          {errorMessage}
        </p>
      ) : (
        <p className="auth-note" role="status">
          {checking
            ? "Verifying passcode..."
            : authorized
              ? "Editor mode is enabled."
              : "Read-only mode is active."}
        </p>
      )}

      <div className="auth-actions">
        <button
          type="button"
          className="button"
          onClick={onVerify}
          disabled={checking}
        >
          {checking ? "Verifying..." : "Verify passcode"}
        </button>
        {authorized ? (
          <button type="button" className="button ghost" onClick={onSignOut}>
            Sign out
          </button>
        ) : null}
      </div>
    </section>
  );
}
