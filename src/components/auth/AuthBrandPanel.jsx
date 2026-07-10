import logoPreview from '../../assets/fixhub-logo.png'

function AuthBrandPanel() {
  return (
    <article className="mx-auto w-full max-w-xl rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur md:p-8">
      <img
        src={logoPreview}
        alt="FixHub logo"
        className="mx-auto h-52 w-full max-w-md rounded-2xl border border-blue-200 object-cover"
      />
      <h1 className="mt-6 font-['Outfit'] text-3xl font-semibold text-blue-900 md:text-4xl">
        FIXHUB Account Portal
      </h1>
      <p className="mt-3 text-sm text-blue-600 md:text-base">
        Create account, sign in, and continue to services and booking in one smart flow.
      </p>
    </article>
  )
}

export default AuthBrandPanel
