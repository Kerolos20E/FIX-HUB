const fieldClass =
  'w-full rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm text-blue-900 outline-none transition focus:border-blue-900'

function LoginForm({ values, error, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="loginEmail" className="mb-1 block text-sm font-medium text-blue-700">
          Email
        </label>
        <input
          id="loginEmail"
          name="email"
          type="email"
          className={fieldClass}
          value={values.email}
          onChange={onChange}
          placeholder="name@email.com"
        />
      </div>

      <div>
        <label htmlFor="loginPassword" className="mb-1 block text-sm font-medium text-blue-700">
          Password
        </label>
        <input
          id="loginPassword"
          name="password"
          type="password"
          className={fieldClass}
          value={values.password}
          onChange={onChange}
          placeholder="******"
        />
      </div>

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
      >
        Login and Continue
      </button>
    </form>
  )
}

export default LoginForm
