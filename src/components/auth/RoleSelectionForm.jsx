function RoleSelectionForm({ selectedRole, onRoleChange, onSubmit, onGoLogin }) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="roleSelect" className="mb-1 block text-sm font-medium text-blue-700">
          Account Type
        </label>
        <select
          id="roleSelect"
          className="w-full rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm text-blue-900 outline-none transition focus:border-blue-900"
          value={selectedRole}
          onChange={(event) => onRoleChange(event.target.value)}
        >
          <option value="customer">Customer</option>
          <option value="technical">Technical Worker</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="submit"
          className="rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Next
        </button>
        <button
          type="button"
          onClick={onGoLogin}
          className="rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          I Have Account
        </button>
      </div>
    </form>
  )
}

export default RoleSelectionForm
