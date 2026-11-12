import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { TLink, useTransition } from './Transition'
import { asset, categories, contacts, pad } from '../data'
import { useLang, type Key } from '../i18n'
import { gsap, useGSAP, lenis, scroll } from '../lib/motion'

export const NAV: { to: string; key: Key }[] = [
  { to: '/', key: 'nav.home' },
  { to: '/products', key: 'nav.products' },
  { to: '/about', key: 'nav.about' },
  { to: '/news', key: 'nav.news' },
  { to: '/contact', key: 'nav.contact' },
]

function LangSwitch() {
  const { lang, setLang } = useLang()
  const { run } = useTransition()
  const change = (l: 'uz' | 'ru') => l !== lang && void run(() => setLang(l))
  return (
    <div className="label flex items-center gap-2 !text-bone">
      {(['uz', 'ru'] as const).map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 && <span className="text-mute">/</span>}
          <button onClick={() => change(l)} className={`transition-opacity ${l === lang ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`} aria-pressed={l === lang}>
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  )
}

export function Header() {
  const { t } = useLang()
  const { pathname } = useLocation()
  const bar = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)

  // hide on scroll down, show on scroll up
  useEffect(() => {
    let last = 0
    let hidden = false
    const onTick = () => {
      const y = scroll.y
      const down = y > last + 2 && y > 160
      const up = y < last - 2
      if (down && !hidden) {
        hidden = true
        gsap.to(bar.current, { yPercent: -120, duration: 0.8, ease: 'expo.out' })
      } else if ((up || y < 160) && hidden) {
        hidden = false
        gsap.to(bar.current, { yPercent: 0, duration: 0.8, ease: 'expo.out' })
      }
      last = y
    }
    gsap.ticker.add(onTick)
    return () => gsap.ticker.remove(onTick)
  }, [])

  return (
    <>
      <header ref={bar} className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="flex items-center justify-between px-5 py-5 md:px-10 md:py-7">
          <TLink to="/" aria-label="Novacolor" data-cursor="link">
            <img src={asset('img/logo.png')} alt="Novacolor" className="h-7 w-auto md:h-8" />
          </TLink>
          <nav className="hidden items-center gap-9 lg:flex">
            {NAV.slice(1).map((n, i) => (
              <TLink key={n.to} to={n.to} className="group label flex items-baseline gap-1.5 !text-bone">
                <span className="text-[9px] text-ash">{pad(i + 1)}</span>
                <span className={`link-line pb-0.5 ${pathname.startsWith(n.to) ? '!bg-[length:100%_1px]' : ''}`}>{t(n.key)}</span>
              </TLink>
            ))}
          </nav>
          <div className="flex items-center gap-7">
            <div className="hidden sm:block">
              <LangSwitch />
            </div>
            <button onClick={() => setOpen(true)} className="label group flex items-center gap-3 !text-bone" aria-expanded={open}>
              <span>{t('menu')}</span>
              <span className="flex w-7 flex-col gap-[5px]">
                <span className="h-px w-full bg-bone transition-transform duration-500 group-hover:scale-x-75" />
                <span className="h-px w-full origin-right bg-bone transition-transform duration-500 group-hover:scale-x-50" />
              </span>
            </button>
          </div>
        </div>
      </header>
      <Menu open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, l } = useLang()
  const root = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline>(null)
  const [hover, setHover] = useState(0)
  const { pathname } = useLocation()

  useGSAP(
    () => {
      const el = root.current!
      tl.current = gsap
        .timeline({ paused: true })
        .set(el, { autoAlpha: 1 })
        .fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' })
        .from(el.querySelectorAll('[data-item]'), { yPercent: 120, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: 0.06 }, '-=0.45')
        .from(el.querySelectorAll('[data-fade]'), { autoAlpha: 0, y: 20, duration: 0.8, ease: 'expo.out', stagger: 0.05 }, '<0.2')
        .from(el.querySelector('[data-visual]'), { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut' }, 0.3)
    },
    { scope: root },
  )

  useEffect(() => {
    if (!tl.current) return
    if (open) {
      lenis?.stop()
      tl.current.timeScale(1).play()
    } else {
      lenis?.start()
      tl.current.timeScale(1.6).reverse()
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const visual = categories[hover % categories.length]

  return (
    <div ref={root} className="invisible fixed inset-0 z-[80] flex flex-col bg-char" role="dialog" aria-modal="true" aria-hidden={!open}>
      <div className="flex items-center justify-between px-5 py-5 md:px-10 md:py-7">
        <img data-fade src={asset('img/logo.png')} alt="Novacolor" className="h-7 w-auto md:h-8" />
        <button data-fade onClick={onClose} className="label group flex items-center gap-3 !text-bone">
          {t('close')}
          <span className="relative block h-4 w-4">
            <span className="absolute left-0 top-1/2 h-px w-full rotate-45 bg-bone transition-transform duration-500 group-hover:rotate-[135deg]" />
            <span className="absolute left-0 top-1/2 h-px w-full -rotate-45 bg-bone transition-transform duration-500 group-hover:rotate-45" />
          </span>
        </button>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-10 px-5 pb-8 md:px-10 lg:grid-cols-12">
        <nav className="flex flex-col justify-center lg:col-span-7">
          {NAV.map((n, i) => {
            const active = n.to === '/' ? pathname === '/' : pathname.startsWith(n.to)
            return (
              <div key={n.to} className="overflow-hidden">
                <TLink
                  to={n.to}
                  data-item
                  onClick={onClose}
                  onMouseEnter={() => setHover(i)}
                  className="group flex items-baseline gap-4 py-1 md:gap-6"
                >
                  <span className="label w-6">{pad(i + 1)}</span>
                  <span className={`display text-[13vw] leading-[1] transition-[color,transform] duration-700 ease-[var(--ease-expo)] group-hover:translate-x-4 group-hover:italic md:text-[7.2vw] lg:text-[5.6vw] ${active ? 'text-sand' : 'text-bone'}`}>
                    {t(n.key)}
                  </span>
                </TLink>
              </div>
            )
          })}
        </nav>
        <div className="hidden flex-col justify-center lg:col-span-5 lg:flex">
          <div data-visual className="relative aspect-[4/5] w-full overflow-hidden">
            {categories.map((c) => (
              <img
                key={c.id}
                src={asset(c.image)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-1000 ease-[var(--ease-expo)]"
                style={{ opacity: c.id === visual.id ? 1 : 0, transform: c.id === visual.id ? 'scale(1)' : 'scale(1.12)' }}
              />
            ))}
            <span className="label absolute bottom-4 left-4 !text-bone">{l(visual.name)}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-6 border-t border-line px-5 py-6 md:px-10">
        <div data-fade className="flex flex-wrap gap-x-10 gap-y-2 text-sm text-ash">
          <a href={contacts.phoneHref} className="link-line text-bone">
            {contacts.phone}
          </a>
          <a href={contacts.telegram} target="_blank" rel="noreferrer" className="link-line">
            Telegram
          </a>
          <a href={contacts.instagram} target="_blank" rel="noreferrer" className="link-line">
            Instagram
          </a>
          <span>{l(contacts.address)}</span>
        </div>
        <div data-fade>
          <LangSwitch />
        </div>
      </div>
    </div>
  )
}
