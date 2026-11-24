document.addEventListener('DOMContentLoaded', () => {
  // =====================================
  // ELEMENTS
  // =====================================

  const bookGrid = document.getElementById('book-grid')
  const letterCount = document.getElementById('letter-count')

  const modal = document.getElementById('reading-modal')
  const modalPanel = modal.querySelector('.reading-panel')

  const modalTitle = document.getElementById('modal-title')
  const modalNumber = document.getElementById('modal-number')
  const modalDate = document.getElementById('modal-date')
  const modalOpening = document.getElementById('modal-opening')
  const modalBody = document.getElementById('modal-body')
  const modalSignoff = document.getElementById('modal-signoff')
  const modalAuthor = document.getElementById('modal-author')

  const previousButton = document.getElementById('previous-letter')
  const nextButton = document.getElementById('next-letter')

  const readingPosition = document.getElementById('reading-position')

  const copyrightYear = document.getElementById('copyright-year')

  if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear()
  }

  // =====================================
  // STATE
  // =====================================

  let letters = []
  let currentIndex = -1
  let lastFocusedElement = null
  let previousBodyOverflow = ''

  // =====================================
  // HELPERS
  // =====================================

  function createElement (tag, className, text) {
    const element = document.createElement(tag)

    if (className) {
      element.className = className
    }

    if (text !== undefined) {
      element.textContent = text
    }

    return element
  }

  function formatDate (dateString) {
    if (!dateString) {
      return 'UNDATED'
    }

    const dateParts = dateString.split('-').map(Number)

    if (dateParts.length !== 3 || dateParts.some(Number.isNaN)) {
      return dateString
    }

    const [year, month, day] = dateParts

    const date = new Date(year, month - 1, day)

    if (Number.isNaN(date.getTime())) {
      return dateString
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  function showMessage (message) {
    bookGrid.replaceChildren(createElement('p', 'archive-message', message))
  }

  // =====================================
  // LOAD LETTERS
  // =====================================

  async function loadLetters () {
    try {
      const response = await fetch('data/letters.json')

      if (!response.ok) {
        throw new Error(`Unable to load letters: ${response.status}`)
      }

      const data = await response.json()

      if (!Array.isArray(data.letters)) {
        throw new Error('The letters file has an invalid structure.')
      }

      letters = data.letters.filter(letter => {
        return (
          Number.isInteger(letter.id) &&
          typeof letter.title === 'string' &&
          typeof letter.number === 'string' &&
          Array.isArray(letter.body)
        )
      })

      if (letters.length === 0) {
        showMessage('There are no letters here just yet.')
        letterCount.textContent = '0 LETTERS'
        bookGrid.setAttribute('aria-busy', 'false')
        return
      }

      renderBooks()

      letterCount.textContent = `${letters.length} ${
        letters.length === 1 ? 'LETTER' : 'LETTERS'
      }`

      bookGrid.setAttribute('aria-busy', 'false')
    } catch (error) {
      console.error('Letters archive error:', error)

      showMessage('The letters could not be retrieved. Please try again later.')

      letterCount.textContent = 'ARCHIVE UNAVAILABLE'
      bookGrid.setAttribute('aria-busy', 'false')
    }
  }

  // =====================================
  // CREATE BOOK COVERS
  // =====================================
  function createBook (letter, index) {
    const card = createElement('article', 'book-card')

    const button = createElement('button', 'book-button')
    button.type = 'button'

    button.setAttribute(
      'aria-label',
      `Read letter ${letter.number}: ${letter.title}`
    )

    const spine = createElement(
      'div',
      `book-spine spine-tone-${(index % 8) + 1}`
    )

    const top = createElement('span', 'spine-number', letter.number)

    const title = createElement('span', 'spine-title', letter.title)

    const ornament = createElement('span', 'spine-ornament', '✦')

    const author = createElement('span', 'spine-author', 'M.')

    spine.append(top, ornament, title, author)
    button.appendChild(spine)

    const caption = createElement(
      'span',
      'visually-hidden',
      `${letter.title} — ${letter.category || 'Letter'}`
    )

    card.append(button, caption)

    button.addEventListener('click', () => {
      openLetter(index)
    })

    return card
  }

  // =====================================
  // RENDER BOOK COLLECTION
  // =====================================

  function renderBooks () {
    bookGrid.replaceChildren()

    const fragment = document.createDocumentFragment()

    const booksPerShelf = 12

    // Always create one extra shelf.
    // There must always be at least two shelves.
    const shelfCount = Math.max(
      2,
      Math.ceil(letters.length / booksPerShelf) + 1
    )

    for (let i = 0; i < shelfCount; i++) {
      const shelf = createElement('div', 'bookshelf-row')

      const shelfBooks = letters.slice(
        i * booksPerShelf,
        (i + 1) * booksPerShelf
      )

      shelfBooks.forEach((letter, shelfIndex) => {
        const book = createBook(letter, i * booksPerShelf + shelfIndex)

        shelf.appendChild(book)
      })

      const shelfBoard = createElement('div', 'bookshelf-board')

      shelf.appendChild(shelfBoard)

      fragment.appendChild(shelf)
    }

    bookGrid.appendChild(fragment)
  }

  // =====================================
  // DISPLAY LETTER CONTENT
  // =====================================

  function renderLetter (index) {
    const letter = letters[index]

    if (!letter) {
      return
    }

    modalNumber.textContent = `LETTER NO. ${letter.number}`
    modalDate.textContent = formatDate(letter.date)

    modalTitle.textContent = letter.title

    modalOpening.textContent = letter.opening || ''

    modalBody.replaceChildren()

    const greeting = createElement(
      'p',
      'reading-greeting',
      letter.greeting || 'My dear reader,'
    )

    modalBody.appendChild(greeting)

    letter.body.forEach(paragraph => {
      const paragraphElement = createElement('p', '', paragraph)

      modalBody.appendChild(paragraphElement)
    })

    modalSignoff.textContent = letter.signOff || 'Yours kindly,'
    modalAuthor.textContent = letter.author || 'M.'

    readingPosition.textContent = `${index + 1} / ${letters.length}`

    previousButton.disabled = index === 0
    nextButton.disabled = index === letters.length - 1

    const scrollArea = modal.querySelector('.reading-scroll')

    scrollArea.scrollTop = 0
  }

  // =====================================
  // OPEN LETTER
  // =====================================

  function openLetter (index) {
    if (index < 0 || index >= letters.length) {
      return
    }

    currentIndex = index

    lastFocusedElement = document.activeElement
    previousBodyOverflow = document.body.style.overflow

    renderLetter(currentIndex)

    modal.classList.add('is-open')
    modal.setAttribute('aria-hidden', 'false')

    document.body.style.overflow = 'hidden'

    modalPanel.focus()
  }

  // =====================================
  // CLOSE LETTER
  // =====================================

  function closeLetter () {
    if (!modal.classList.contains('is-open')) {
      return
    }

    modal.classList.remove('is-open')
    modal.setAttribute('aria-hidden', 'true')

    document.body.style.overflow = previousBodyOverflow

    currentIndex = -1

    if (lastFocusedElement) {
      lastFocusedElement.focus()
    }
  }

  // =====================================
  // PREVIOUS / NEXT NAVIGATION
  // =====================================

  function showPreviousLetter () {
    if (currentIndex > 0) {
      currentIndex--
      renderLetter(currentIndex)
    }
  }

  function showNextLetter () {
    if (currentIndex < letters.length - 1) {
      currentIndex++
      renderLetter(currentIndex)
    }
  }

  previousButton.addEventListener('click', showPreviousLetter)

  nextButton.addEventListener('click', showNextLetter)

  // =====================================
  // CLOSE BUTTONS AND BACKDROP
  // =====================================

  modal.addEventListener('click', event => {
    if (event.target.closest('[data-close-modal]')) {
      closeLetter()
    }
  })

  // =====================================
  // KEYBOARD CONTROLS
  // =====================================

  document.addEventListener('keydown', event => {
    if (!modal.classList.contains('is-open')) {
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      closeLetter()
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      showPreviousLetter()
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      showNextLetter()
      return
    }

    // Keep keyboard focus inside the modal.

    if (event.key === 'Tab') {
      const focusableElements = Array.from(
        modalPanel.querySelectorAll(
          'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'
        )
      )

      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  })

  // =====================================
  // INITIALISE ARCHIVE
  // =====================================

  loadLetters()
})
