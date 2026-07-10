(function fixhubInteractiveLayer() {
  const root = document.documentElement

  const updateYear = () => {
    const yearNode = document.getElementById('year')
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear())
    }
  }

  const updateFloaters = (pointerX, pointerY) => {
    const xRatio = pointerX / window.innerWidth - 0.5
    const yRatio = pointerY / window.innerHeight - 0.5

    document.querySelectorAll('[data-float]').forEach((node) => {
      const intensity = Number(node.getAttribute('data-float') || 8)
      node.style.transform = `translate3d(${(-xRatio * intensity).toFixed(2)}px, ${(-yRatio * intensity).toFixed(2)}px, 0)`
    })
  }

  const syncPointerGlow = (pointerX, pointerY) => {
    root.style.setProperty('--mouse-x', `${pointerX}px`)
    root.style.setProperty('--mouse-y', `${pointerY}px`)
    updateFloaters(pointerX, pointerY)
  }

  let pointerX = window.innerWidth / 2
  let pointerY = window.innerHeight / 2

  window.addEventListener(
    'pointermove',
    (event) => {
      pointerX = event.clientX
      pointerY = event.clientY
      syncPointerGlow(pointerX, pointerY)
    },
    { passive: true },
  )

  window.addEventListener('resize', () => syncPointerGlow(pointerX, pointerY))
  document.addEventListener('DOMContentLoaded', () => {
    updateYear()
    syncPointerGlow(pointerX, pointerY)
  })
})()
