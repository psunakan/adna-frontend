import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'

export type SearchableSelectOption = {
  value: string
  label: string
  searchText?: string
}

type PanelLayout = {
  style: CSSProperties
  listMaxHeight: number
  placement: 'below' | 'above'
}

type Props = {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: SearchableSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  hasError?: boolean
  disabled?: boolean
  searchable?: boolean
  testId?: string
  emptyMessage?: string
}

const PANEL_GAP = 6
const VIEWPORT_PADDING = 12
const MIN_PANEL_HEIGHT = 160
/** Above sticky main nav (z-9999); below mobile menu / contact overlays. */
const PANEL_Z_INDEX = 10050

function shouldAutofocusSearch() {
  if (typeof navigator === 'undefined') return false
  // Touch phones (and Playwright mobile emulation) report maxTouchPoints > 0.
  return navigator.maxTouchPoints === 0
}

function getViewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight
}

function getHeaderInset() {
  const stickyNav = document.querySelector('nav.sticky, header .sticky, .shadow-md.sticky')
  if (!stickyNav) return VIEWPORT_PADDING

  const rect = stickyNav.getBoundingClientRect()
  if (rect.bottom <= 0) return VIEWPORT_PADDING

  return Math.max(VIEWPORT_PADDING, rect.bottom + 8)
}

function getFooterInset() {
  const footer = document.querySelector('footer')
  if (!footer) return VIEWPORT_PADDING

  const viewportHeight = getViewportHeight()
  const rect = footer.getBoundingClientRect()
  if (rect.top >= viewportHeight) return VIEWPORT_PADDING

  return Math.max(VIEWPORT_PADDING, viewportHeight - rect.top + 8)
}

function measurePanelLayout(trigger: HTMLElement, searchable: boolean): PanelLayout {
  const rect = trigger.getBoundingClientRect()
  const viewportHeight = getViewportHeight()
  const headerInset = getHeaderInset()
  const footerInset = getFooterInset()
  const searchHeight = searchable ? 49 : 0
  const spaceBelow = viewportHeight - rect.bottom - footerInset - PANEL_GAP
  const spaceAbove = rect.top - headerInset - PANEL_GAP
  const placement = spaceBelow < MIN_PANEL_HEIGHT && spaceAbove > spaceBelow ? 'above' : 'below'
  const availableSpace = placement === 'below' ? spaceBelow : spaceAbove
  const listMaxHeight = Math.max(120, availableSpace - searchHeight - 12)

  const style: CSSProperties = {
    position: 'fixed',
    left: rect.left,
    width: rect.width,
    zIndex: PANEL_Z_INDEX,
  }

  if (placement === 'below') {
    style.top = rect.bottom + PANEL_GAP
  } else {
    style.bottom = viewportHeight - rect.top + PANEL_GAP
  }

  return { style, listMaxHeight, placement }
}

export function SearchableSelect({
  id,
  name,
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Select an option',
  searchPlaceholder = 'Type to search…',
  hasError = false,
  disabled = false,
  searchable = true,
  testId,
  emptyMessage = 'No matches found.',
}: Props) {
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [panelLayout, setPanelLayout] = useState<PanelLayout | null>(null)

  const selectedOption = options.find((option) => option.value === value)
  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return options

    return options.filter((option) => {
      const haystack = (option.searchText ?? `${option.label} ${option.value}`).toLowerCase()
      return haystack.includes(normalized)
    })
  }, [options, query])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setPanelLayout(null)
    onBlur?.()
  }, [onBlur])

  const updatePanelLayout = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    setPanelLayout(measurePanelLayout(trigger, searchable))
  }, [searchable])

  const openPanel = () => {
    if (disabled) return
    setOpen(true)
  }

  const selectOption = (nextValue: string) => {
    onChange(nextValue)
    // Mark touched after value is set so validation sees the selection.
    close()
  }

  useEffect(() => {
    if (!open) return undefined

    updatePanelLayout()

    const onPointerDownOutside = (event: PointerEvent) => {
      const target = event.target as Node
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        close()
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    const onLayoutChange = () => updatePanelLayout()

    document.addEventListener('pointerdown', onPointerDownOutside)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onLayoutChange)
    window.addEventListener('scroll', onLayoutChange, true)
    window.visualViewport?.addEventListener('resize', onLayoutChange)
    window.visualViewport?.addEventListener('scroll', onLayoutChange)

    return () => {
      document.removeEventListener('pointerdown', onPointerDownOutside)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onLayoutChange)
      window.removeEventListener('scroll', onLayoutChange, true)
      window.visualViewport?.removeEventListener('resize', onLayoutChange)
      window.visualViewport?.removeEventListener('scroll', onLayoutChange)
    }
  }, [open, close, updatePanelLayout])

  useEffect(() => {
    if (!open || !panelLayout || !searchable || !shouldAutofocusSearch()) return undefined

    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open, panelLayout, searchable])

  const panel =
    open && panelLayout ? (
      <div
        ref={panelRef}
        className={[
          'searchable-select__panel',
          'searchable-select__panel--floating',
          panelLayout.placement === 'above' ? 'searchable-select__panel--above' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={panelLayout.style}
        data-testid={testId ? `${testId}-panel` : undefined}
      >
        {searchable ? (
          <input
            ref={searchRef}
            type="search"
            className="searchable-select__search"
            data-testid={testId ? `${testId}-search` : undefined}
            value={query}
            placeholder={searchPlaceholder}
            aria-label={`Search ${placeholder}`}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && filteredOptions[0]) {
                event.preventDefault()
                selectOption(filteredOptions[0].value)
              }
            }}
          />
        ) : null}
        <ul
          id={listboxId}
          className={['searchable-select__list', searchable ? '' : 'searchable-select__list--plain']
            .filter(Boolean)
            .join(' ')}
          role="listbox"
          style={{ maxHeight: panelLayout.listMaxHeight }}
        >
          {filteredOptions.length === 0 ? (
            <li className="searchable-select__empty">{emptyMessage}</li>
          ) : (
            filteredOptions.map((option) => (
              <li key={`${option.value}-${option.label}`} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  className={[
                    'searchable-select__option',
                    option.value === value ? 'is-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onPointerDown={(event) => {
                    // Touch/pen: select immediately so the tap isn't lost when the
                    // panel closes or the keyboard/focus changes. Mouse keeps click.
                    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
                    if (event.button !== 0) return
                    event.preventDefault()
                    event.stopPropagation()
                    selectOption(option.value)
                  }}
                  onClick={() => selectOption(option.value)}
                >
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    ) : null

  return (
    <div
      ref={rootRef}
      className={['searchable-select', open ? 'is-open' : '', hasError ? 'is-error' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="searchable-select__trigger"
        data-testid={testId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => (open ? close() : openPanel())}
      >
        <span
          className={selectedOption ? 'searchable-select__value' : 'searchable-select__placeholder'}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <span className="searchable-select__chevron" aria-hidden="true" />
      </button>

      {name ? <input type="hidden" name={name} value={value} readOnly /> : null}

      {panel ? createPortal(panel, document.body) : null}
    </div>
  )
}
