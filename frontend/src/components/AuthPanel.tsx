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
  if (authorized) {
    return (
      <section className="panel auth-panel auth-panel-unlocked" aria-label="Tracker access">
        <div>
          <p className="access-label">Tracker access</p>
          <strong>Unlocked</strong>
        </div>
        <button type="button" className="button ghost small" onClick={onSignOut}>
          Lock tracker
        </button>
      </section>
    );
  }

  return (
    <section className="panel auth-panel auth-panel-locked" aria-label="Unlock inventory">
      <div className="panel-heading">
        <h2>
          <Key size={18} weight="duotone" aria-hidden="true" /> Unlock tracker
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
        Enter the shared passcode to view and manage your inventory.
      </p>

      {errorMessage ? (
        <p className="field-error" role="alert">
          {errorMessage}
        </p>
      ) : (
        <p className="auth-note" role="status">
          {checking
            ? "Verifying passcode..."
            : "The inventory stays private until it is unlocked."}
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
