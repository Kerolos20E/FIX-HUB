const fieldClass =
  'w-full rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm text-blue-900 outline-none transition focus:border-blue-900'

function SignupForm({ values, error, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="signupName" className="mb-1 block text-sm font-medium text-blue-700">
          Full Name
        </label>
        <input id="signupName" name="name" type="text" className={fieldClass} value={values.name} onChange={onChange} />
      </div>

      <div>
        <label htmlFor="signupPhone" className="mb-1 block text-sm font-medium text-blue-700">
          Phone Number
        </label>
        <input id="signupPhone" name="phone" type="tel" className={fieldClass} value={values.phone} onChange={onChange} />
      </div>

      <div>
        <label htmlFor="signupEmail" className="mb-1 block text-sm font-medium text-blue-700">
          Email
        </label>
        <input id="signupEmail" name="email" type="email" className={fieldClass} value={values.email} onChange={onChange} />
      </div>

      <div>
        <label htmlFor="signupPassword" className="mb-1 block text-sm font-medium text-blue-700">
          Password
        </label>
        <input id="signupPassword" name="password" type="password" className={fieldClass} value={values.password} onChange={onChange} />
      </div>

      <div>
        <label htmlFor="signupConfirmPassword" className="mb-1 block text-sm font-medium text-blue-700">
          Confirm Password
        </label>
        <input
          id="signupConfirmPassword"
          name="confirmPassword"
          type="password"
          className={fieldClass}
          value={values.confirmPassword}
          onChange={onChange}
        />
      </div>

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
      >
        Create Account and Continue
      </button>
    </form>
  )
}

export default SignupForm
