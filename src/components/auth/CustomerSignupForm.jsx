const fieldClass =
  'w-full rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm text-blue-900 outline-none transition focus:border-blue-900'

function CustomerSignupForm({ values, error, onChange, onSubmit, onBack }) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="customerName" className="mb-1 block text-sm font-medium text-blue-700">
          Name
        </label>
        <input id="customerName" name="name" type="text" className={fieldClass} value={values.name} onChange={onChange} />
      </div>

      <div>
        <label htmlFor="customerEmail" className="mb-1 block text-sm font-medium text-blue-700">
          Email
        </label>
        <input id="customerEmail" name="email" type="email" className={fieldClass} value={values.email} onChange={onChange} />
      </div>

      <div>
        <label htmlFor="customerPhone" className="mb-1 block text-sm font-medium text-blue-700">
          Phone
        </label>
        <input
          id="customerPhone"
          name="phone"
          type="tel"
          className={fieldClass}
          value={values.phone}
          onChange={onChange}
          placeholder="+20"
        />
      </div>

      <div>
        <label htmlFor="customerNationalId" className="mb-1 block text-sm font-medium text-blue-700">
          National ID
        </label>
        <input
          id="customerNationalId"
          name="nationalId"
          type="text"
          className={fieldClass}
          value={values.nationalId}
          onChange={onChange}
          maxLength={14}
        />
      </div>

      <div>
        <label htmlFor="customerCity" className="mb-1 block text-sm font-medium text-blue-700">
          City
        </label>
        <select id="customerCity" name="city" className={fieldClass} value={values.city} onChange={onChange}>
          <option value="Sohag">Sohag</option>
          <option value="Cairo">Cairo</option>
          <option value="Alexandria">Alexandria</option>
          <option value="Giza">Giza</option>
          <option value="Assiut">Assiut</option>
        </select>
      </div>

      <div>
        <label htmlFor="customerAddress" className="mb-1 block text-sm font-medium text-blue-700">
          Address
        </label>
        <input
          id="customerAddress"
          name="address"
          type="text"
          className={fieldClass}
          value={values.address}
          onChange={onChange}
        />
      </div>

      <div>
        <label htmlFor="customerBio" className="mb-1 block text-sm font-medium text-blue-700">
          About You
        </label>
        <textarea
          id="customerBio"
          name="bio"
          className={`${fieldClass} min-h-24`}
          rows={3}
          value={values.bio}
          onChange={onChange}
        />
      </div>

      <div>
        <label htmlFor="customerPassword" className="mb-1 block text-sm font-medium text-blue-700">
          Password
        </label>
        <input
          id="customerPassword"
          name="password"
          type="password"
          className={fieldClass}
          value={values.password}
          onChange={onChange}
        />
      </div>

      <div>
        <label htmlFor="customerConfirmPassword" className="mb-1 block text-sm font-medium text-blue-700">
          Confirm Password
        </label>
        <input
          id="customerConfirmPassword"
          name="confirmPassword"
          type="password"
          className={fieldClass}
          value={values.confirmPassword}
          onChange={onChange}
        />
      </div>

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          Back
        </button>
        <button
          type="submit"
          className="rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Create Customer
        </button>
      </div>
    </form>
  )
}

export default CustomerSignupForm
