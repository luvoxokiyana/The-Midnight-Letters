/* =========================================
   THE MIDNIGHT LETTERS
   Typing & Interactive Astrolabe
========================================= */

document.addEventListener('DOMContentLoaded', () => {
  /* =====================================
       1. TYPING ANIMATION
    ===================================== */

  const typingElement = document.getElementById('typing-text')

  const headingText = 'Dear Readers of the Midnight Letters,'

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  if (typingElement) {
    if (reducedMotion) {
      typingElement.textContent = headingText
    } else {
      let index = 0

      function typeText () {
        if (index < headingText.length) {
          typingElement.textContent += headingText[index]

          index++

          setTimeout(typeText, 75 + Math.random() * 55)
        }
      }

      setTimeout(typeText, 900)
    }
  }

  /* =====================================
       2. ASTROLABE CANVAS
    ===================================== */

  const canvas = document.getElementById('astrolabe-canvas')
  const section = document.querySelector('.hero-section')

  if (!canvas || !section) return

  const ctx = canvas.getContext('2d')

  let width = 0
  let height = 0

  let stars = []
  let animationFrame

  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  }

  const clicks = []

  const isMobile = window.matchMedia('(max-width: 768px)').matches

  const ink = 'rgba(94, 78, 55,'

  /* =====================================
       3. CANVAS RESIZING
    ===================================== */

  function resizeCanvas () {
    const rect = section.getBoundingClientRect()

    width = rect.width
    height = rect.height

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    canvas.width = width * dpr
    canvas.height = height * dpr

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    pointer.x = 0
    pointer.y = 0
    pointer.targetX = 0
    pointer.targetY = 0

    createStars()
  }

  /* =====================================
       4. STAR FIELD
    ===================================== */

  function createStars () {
    stars = []

    const count = isMobile ? 35 : 75

    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,

        size: Math.random() * 1.2 + 0.35,

        opacity: Math.random() * 0.35 + 0.1,

        phase: Math.random() * Math.PI * 2,

        speed: Math.random() * 0.0008 + 0.0002
      })
    }
  }

  /* =====================================
       5. DRAW STAR FIELD
    ===================================== */

  function drawStars (time) {
    stars.forEach(star => {
      const twinkle = Math.sin(time * star.speed + star.phase)

      let opacity = star.opacity + twinkle * 0.1

      let size = star.size

      if (pointer.targetX || pointer.targetY) {
        const dx = star.x - pointer.targetX
        const dy = star.y - pointer.targetY

        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 90) {
          const influence = 1 - distance / 90

          opacity += influence * 0.35
          size += influence * 0.5
        }
      }

      opacity = Math.max(0.03, Math.min(opacity, 0.8))

      ctx.beginPath()

      ctx.arc(star.x, star.y, size, 0, Math.PI * 2)

      ctx.fillStyle = `${ink} ${opacity})`

      ctx.fill()
    })
  }

  /* =====================================
       6. ASTROLABE GEOMETRY
    ===================================== */

  function drawAstrolabe (time) {
    // Position the illustration on the right
    const baseX = width * 0.79
    const baseY = height * 0.51

    const radius = Math.min(width * 0.29, height * 0.38, 245)

    // Smooth mouse movement
    pointer.x += (pointer.targetX - pointer.x) * 0.035
    pointer.y += (pointer.targetY - pointer.y) * 0.035

    const centerX = baseX + pointer.x * 0.035
    const centerY = baseY + pointer.y * 0.035

    ctx.save()

    // Keep the diagram delicate
    ctx.strokeStyle = `${ink} 0.22)`
    ctx.fillStyle = `${ink} 0.5)`
    ctx.lineWidth = 0.7

    /* Outer circles */

    ;[1, 0.92, 0.75, 0.58, 0.28].forEach(scale => {
      ctx.beginPath()

      ctx.arc(centerX, centerY, radius * scale, 0, Math.PI * 2)

      ctx.stroke()
    })

    /* Outer astronomical graduations */

    const tickCount = 72

    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2

      const major = i % 6 === 0

      const innerRadius = radius * (major ? 0.94 : 0.975)

      const outerRadius = radius

      const x1 = centerX + Math.cos(angle) * innerRadius

      const y1 = centerY + Math.sin(angle) * innerRadius

      const x2 = centerX + Math.cos(angle) * outerRadius

      const y2 = centerY + Math.sin(angle) * outerRadius

      ctx.beginPath()

      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)

      ctx.lineWidth = major ? 1 : 0.5

      ctx.stroke()
    }

    /* Radial guide lines */

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2

      const x = centerX + Math.cos(angle) * radius * 0.75

      const y = centerY + Math.sin(angle) * radius * 0.75

      ctx.beginPath()

      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)

      ctx.strokeStyle = `${ink} 0.09)`

      ctx.stroke()
    }

    /* Elliptical celestial paths */

    ctx.save()

    ctx.translate(centerX, centerY)

    ctx.rotate(-0.38)

    ;[0.85, 0.55].forEach(scale => {
      ctx.beginPath()

      ctx.ellipse(
        0,
        0,
        radius * scale,
        radius * scale * 0.42,
        0,
        0,
        Math.PI * 2
      )

      ctx.strokeStyle = `${ink} 0.16)`

      ctx.stroke()
    })

    ctx.restore()

    /* Moving celestial marker */

    const angle = time * 0.000035

    const orbitRadius = radius * 0.75

    const markerX = centerX + Math.cos(angle) * orbitRadius

    const markerY = centerY + Math.sin(angle) * orbitRadius * 0.42

    ctx.beginPath()

    ctx.arc(markerX, markerY, 3, 0, Math.PI * 2)

    ctx.fillStyle = `${ink} 0.65)`

    ctx.fill()

    /* Central compass star */

    ctx.save()

    ctx.translate(centerX, centerY)
    ctx.rotate(-0.25)

    ctx.beginPath()

    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4

      const r = i % 2 === 0 ? 13 : 4

      const x = Math.cos(angle) * r
      const y = Math.sin(angle) * r

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.closePath()

    ctx.strokeStyle = `${ink} 0.5)`
    ctx.stroke()

    ctx.restore()

    /* Faint directional labels */

    ctx.font = '10px Georgia'

    ctx.textAlign = 'center'

    ctx.fillStyle = `${ink} 0.55)`

    ctx.fillText('N', centerX, centerY - radius - 14)

    ctx.fillText('S', centerX, centerY + radius + 20)

    ctx.fillText('E', centerX + radius + 14, centerY + 3)

    ctx.fillText('W', centerX - radius - 14, centerY + 3)

    /* Small decorative inscription */

    ctx.font = 'italic 11px Georgia'

    ctx.fillStyle = `${ink} 0.55)`

    ctx.fillText('CAELUM', centerX, centerY + radius + 43)

    ctx.restore()
  }

  /* =====================================
       7. CLICK INTERACTION
    ===================================== */

  function drawClickEffects (time) {
    for (let i = clicks.length - 1; i >= 0; i--) {
      const click = clicks[i]

      const age = time - click.created

      const progress = age / 1200

      if (progress >= 1) {
        clicks.splice(i, 1)
        continue
      }

      const radius = progress * 38

      const opacity = (1 - progress) * 0.3

      ctx.beginPath()

      ctx.arc(click.x, click.y, radius, 0, Math.PI * 2)

      ctx.strokeStyle = `rgba(94, 78, 55, ${opacity})`

      ctx.lineWidth = 0.8

      ctx.stroke()
    }
  }

  /* =====================================
       8. ANIMATION LOOP
    ===================================== */

  function animate (time = 0) {
    ctx.clearRect(0, 0, width, height)

    drawAstrolabe(time)
    drawStars(time)
    drawClickEffects(time)

    animationFrame = requestAnimationFrame(animate)
  }

  /* =====================================
       9. MOUSE INTERACTION
    ===================================== */

  section.addEventListener('pointermove', event => {
    const rect = canvas.getBoundingClientRect()

    pointer.targetX = event.clientX - rect.left - width / 2

    pointer.targetY = event.clientY - rect.top - height / 2
  })

  section.addEventListener('pointerleave', () => {
    pointer.targetX = 0
    pointer.targetY = 0
  })

  section.addEventListener('click', event => {
    const rect = canvas.getBoundingClientRect()

    clicks.push({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,

      created: performance.now()
    })
  })

  /* =====================================
       10. INITIALISE
    ===================================== */

  resizeCanvas()

  if (reducedMotion) {
    drawAstrolabe(0)
    drawStars(0)
  } else {
    animate()
  }

  /* =====================================
       11. RESIZE HANDLING
    ===================================== */

  let resizeTimeout

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)

    resizeTimeout = setTimeout(() => {
      cancelAnimationFrame(animationFrame)

      resizeCanvas()

      if (reducedMotion) {
        ctx.clearRect(0, 0, width, height)

        drawAstrolabe(0)
        drawStars(0)
      } else {
        animate()
      }
    }, 150)
  })

  // About section entrance animation

  const aboutSection = document.querySelector('.about-section')

  if (aboutSection) {
    const aboutElements = aboutSection.querySelectorAll(
      '.about-heading, .letter-content, .about-illustration'
    )

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (!reducedMotion && 'IntersectionObserver' in window) {
      aboutElements.forEach(element => {
        element.style.opacity = '0'
        element.style.transform = 'translateY(20px)'
        element.style.transition = 'opacity 1s ease, transform 1s ease'
      })

      const aboutObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = '1'
              entry.target.style.transform = 'translateY(0)'
              aboutObserver.unobserve(entry.target)
            }
          })
        },
        {
          threshold: 0.15
        }
      )

      aboutElements.forEach(element => {
        aboutObserver.observe(element)
      })
    }
  }
})
