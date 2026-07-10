const channels = [
  { icon: '📞', title: 'Phone', value: '0123-456-789' },
  { icon: '✉️', title: 'Email', value: 'support@fixhub-eg.com' },
  { icon: '💬', title: 'WhatsApp', value: '+20 123 456 789' },
  { icon: '🕒', title: 'Availability', value: '24/7 Dispatch' },
]

function ContactPage() {
  return (
    <section className="px-4 pb-12 pt-2 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Contact Page</span>
            <h1 className="mt-2 font-['Outfit'] text-3xl font-semibold text-blue-900">Reach FixHub Support</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-blue-600">
              Use any channel below and the team will follow up quickly.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {channels.map((channel) => (
              <article key={channel.title} className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center">
                <div className="text-3xl">{channel.icon}</div>
                <h2 className="mt-3 font-['Outfit'] text-xl font-semibold text-blue-900">{channel.title}</h2>
                <p className="mt-1 text-sm text-blue-600">{channel.value}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactPage
