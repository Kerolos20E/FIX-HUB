const fieldClass =
  'w-full rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm text-blue-900 outline-none transition focus:border-blue-900'

function TechnicalSignupForm({
  values,
  error,
  cardPreview,
  onChange,
  onCardChange,
  onSubmit,
  onBack,
}) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="technicalName" className="mb-1 block text-sm font-medium text-blue-700">
          Name
        </label>
        <input id="technicalName" name="name" type="text" className={fieldClass} value={values.name} onChange={onChange} />
      </div>

      <div>
        <label htmlFor="technicalEmail" className="mb-1 block text-sm font-medium text-blue-700">
          Email
        </label>
        <input id="technicalEmail" name="email" type="email" className={fieldClass} value={values.email} onChange={onChange} />
      </div>

      <div>
        <label htmlFor="technicalPhone" className="mb-1 block text-sm font-medium text-blue-700">
          Phone
        </label>
        <input
          id="technicalPhone"
          name="phone"
          type="tel"
          className={fieldClass}
          value={values.phone}
          onChange={onChange}
          placeholder="+20"
        />
      </div>

      <div>
        <label htmlFor="technicalNationalId" className="mb-1 block text-sm font-medium text-blue-700">
          National ID
        </label>
        <input
          id="technicalNationalId"
          name="nationalId"
          type="text"
          className={fieldClass}
          value={values.nationalId}
          onChange={onChange}
          maxLength={14}
        />
      </div>

      <div>
        <label htmlFor="technicalCardImage" className="mb-1 block text-sm font-medium text-blue-700">
          National ID Card Image
        </label>
        <input
          id="technicalCardImage"
          type="file"
          className="w-full rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm text-blue-900"
          accept="image/*"
          onChange={onCardChange}
        />
        {cardPreview ? (
          <img src={cardPreview} alt="National card preview" className="mt-3 h-40 w-full rounded-xl object-cover" />
        ) : null}
      </div>

      <div>
        <label htmlFor="technicalCity" className="mb-1 block text-sm font-medium text-blue-700">
          City
        </label>
        <select id="technicalCity" name="city" className={fieldClass} value={values.city} onChange={onChange}>
          <option value="Sohag">Sohag</option>
          <option value="Cairo">Cairo</option>
          <option value="Alexandria">Alexandria</option>
          <option value="Giza">Giza</option>
          <option value="Assiut">Assiut</option>
        </select>
      </div>

      <div>
        <label htmlFor="technicalSpecialty" className="mb-1 block text-sm font-medium text-blue-700">
          Specialty
        </label>
        <select id="technicalSpecialty" name="specialty" className={fieldClass} value={values.specialty} onChange={onChange}>
          <option value="Electrical Technician">Electrical Technician</option>
          <option value="Plumber">Plumber</option>
          <option value="Carpenter">Carpenter</option>
          <option value="Painter">Painter</option>
          <option value="AC Technician">AC Technician</option>
        </select>
      </div>

      <div>
        <label htmlFor="technicalYears" className="mb-1 block text-sm font-medium text-blue-700">
          Years of Experience
        </label>
        <input
          id="technicalYears"
          name="yearsOfExperience"
          type="number"
          min={0}
          className={fieldClass}
          value={values.yearsOfExperience}
          onChange={onChange}
        />
      </div>

      <div>
        <label htmlFor="technicalBio" className="mb-1 block text-sm font-medium text-blue-700">
          About Your Work
        </label>
        <textarea
          id="technicalBio"
          name="bio"
          className={`${fieldClass} min-h-24`}
          rows={3}
          value={values.bio}
          onChange={onChange}
        />
      </div>

      <div>
        <label htmlFor="technicalPassword" className="mb-1 block text-sm font-medium text-blue-700">
          Password
        </label>
        <input
          id="technicalPassword"
          name="password"
          type="password"
          className={fieldClass}
          value={values.password}
          onChange={onChange}
        />
      </div>

      <div>
        <label htmlFor="technicalConfirmPassword" className="mb-1 block text-sm font-medium text-blue-700">
          Confirm Password
        </label>
        <input
          id="technicalConfirmPassword"
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
          Create Technical
        </button>
      </div>
    </form>
  )
}

export default TechnicalSignupForm
