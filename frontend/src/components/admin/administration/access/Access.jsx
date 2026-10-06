function RegistrationSteps({ currentStep }) {
  return (
    <ul
      className="steps steps-horizontal w-full"
      aria-label="Registration progress"
    >
      {["Invitation", "Verify email", "Password"].map((label, index) => (
        <li
          key={label}
          className={`step ${currentStep >= index + 1 ? "step-primary" : ""}`}
          aria-current={currentStep === index + 1 ? "step" : undefined}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}

const Access = () => {
  const currentStep = 2;
  const authError = false;
  const completed = false;
  const busy = true;
  const disabled = false;
  const action = "";
  const registrationComplete = false;

  return (
    <>
      <main className="flex items-center justify-center p-4">
        <div className="card card-border bg-base-100 w-full max-w-md">
          <div className="card-body gap-6">
            <div>
              <h1 className="card-title">Register</h1>
              <p className="mt-2">
                Registration is available to invited residents and contractors.
              </p>
            </div>

            {authError && (
              <div className="alert alert-error" role="alert">
                Unable to load your account. Refresh the page or sign out and
                try again.
              </div>
            )}

            {completed ? (
              <section className="space-y-6">
                <div className="alert alert-success" role="status">
                  {registrationComplete && busy
                    ? "Registration complete. Taking you to login…"
                    : "Your account is registered. Select Login to continue."}
                </div>

                <div className="card-actions justify-end">
                  <button
                    className="btn w-23"
                    type="button"
                    disabled={busy}
                    aria-label="Login"
                    aria-busy={busy}
                  >
                    {busy ? (
                      <span className="loading loading-bars loading-xs" />
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>
              </section>
            ) : (
              <>
                <RegistrationSteps currentStep={currentStep} />

                {currentStep === 1 && (
                  <form className="space-y-6">
                    <fieldset>
                      <h3 className="label pb-2">Your email address:</h3>
                      <label className="floating-label input validator w-full">
                        <input
                          type="email"
                          placeholder="Email"
                          autoComplete="email"
                          required
                          disabled={disabled}
                        />
                        <span>Email</span>
                      </label>
                    </fieldset>

                    <fieldset>
                      <h3 className="label pb-2">Your invitation code:</h3>
                      <label className="floating-label input validator w-full">
                        <input
                          type="text"
                          placeholder="XXXX-XXXX-XXXX"
                          autoComplete="off"
                          autoCapitalize="characters"
                          spellCheck={false}
                          maxLength={14}
                          required
                          disabled={disabled}
                        />
                        <span>Invitation code</span>
                      </label>
                    </fieldset>

                    <div className="card-actions justify-between">
                      {busy ? (
                        <button className="btn w-23 btn-ghost" disabled>
                          Cancel
                        </button>
                      ) : (
                        <a className="btn w-23 btn-ghost" to="/login">
                          Cancel
                        </a>
                      )}

                      <button
                        className="btn w-23"
                        type="submit"
                        disabled={disabled}
                        aria-label="Continue"
                        aria-busy={action === "request"}
                      >
                        {busy ? (
                          <span className="loading loading-bars loading-xs" />
                        ) : (
                          "Continue"
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {currentStep === 2 && (
                  <form className="space-y-6">
                    <div className="alert alert-info" role="status">
                      <p>
                        Enter the six-digit code sent to{" "}
                        <strong>pending@email.com</strong>.
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <label className="otp validator">
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />

                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          aria-label="Six-digit verification code"
                          pattern="[0-9]{6}"
                          minLength={6}
                          maxLength={6}
                          required
                          disabled={disabled}
                        />
                      </label>
                    </div>

                    <div className="divider" />

                    <div className="flex flex-col gap-1">
                      <div className="w-full">
                        <span className="mr-2">Didn't get a code?</span>
                        <button
                          className="link"
                          type="button"
                          disabled={disabled}
                        >
                          {action === "resend" ? (
                            <span className="loading loading-bars loading-xs" />
                          ) : (
                            "Resend code"
                          )}
                        </button>
                      </div>
                      <div className="w-full">
                        <span className="mr-2">Not the correct email?</span>
                        <button
                          className="link"
                          type="button"
                          disabled={disabled}
                        >
                          Change email
                        </button>
                      </div>
                    </div>

                    <div className="card-actions justify-end">
                      <button
                        className="btn w-23"
                        type="submit"
                        disabled={disabled}
                        aria-label="Verify email"
                        aria-busy={action === "verify"}
                      >
                        {action === "verify" ? (
                          <span className="loading loading-bars loading-xs" />
                        ) : (
                          "Verify"
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {currentStep === 3 && (
                  <form className="space-y-6">
                    <p>
                      Set a password for <strong>session.user@email.com</strong>
                      .
                    </p>

                    <div>
                      <label className="floating-label input validator w-full">
                        <input
                          type="password"
                          placeholder="Password"
                          autoComplete="new-password"
                          minLength={8}
                          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                          required
                          disabled={disabled}
                        />
                        <span>Password</span>
                      </label>

                      <p className="mt-2 text-xs">
                        Use at least 8 characters, including an uppercase
                        letter, a lowercase letter, and a number.
                      </p>
                    </div>

                    <label className="floating-label input validator w-full">
                      <input
                        type="password"
                        placeholder="Confirm password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        disabled={disabled}
                      />
                      <span>Confirm password</span>
                    </label>

                    <div className="card-actions justify-between">
                      <button
                        className="btn btn-ghost w-23"
                        type="button"
                        disabled={busy}
                      >
                        Sign out
                      </button>

                      <button
                        className="btn w-23"
                        type="submit"
                        disabled={disabled}
                        aria-label="Create account"
                        aria-busy={action === "complete"}
                      >
                        {action === "complete" ? (
                          <span className="loading loading-bars loading-xs" />
                        ) : (
                          "Create"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Access;
