import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import timeline from '../data/timeline.json'
import ironMan from '../data/movies/iron-man.json'
import wandaVision from '../data/series/wandavision.json'

type Entry = (typeof timeline.entries)[number]
type DisplayEntry = Entry & { demoTitle?: string; demoLogo?: string; demoType?: 'movie' | 'series' }
type Title = { id: string; type: string; title: string; overview?: string; releaseDate?: string; assets?: { logo?: { path: string | null }; poster?: { path: string | null }; backdrop?: { path: string | null } }; seasons?: { id: string; number: number; title: string; episodes: { id: string; number: number; title: string }[] }[] }
const titles: Record<string, Title> = { [ironMan.id]: ironMan, [wandaVision.id]: wandaVision }
function titleForEntry(entry: DisplayEntry): Title | undefined {
  if (!entry.demoTitle) return titles[entry.target.type === 'episode' ? entry.target.seriesId! : entry.target.id]
  if (entry.demoTitle === ironMan.title) return ironMan
  if (entry.demoTitle === wandaVision.title) return wandaVision
  return {
    id: entry.id,
    type: entry.demoType ?? 'movie',
    title: entry.demoTitle,
    overview: 'Demo entry only. Title-specific metadata and episode data have not been added to the catalog.',
  }
}
const phases = [
  { label: 'Phase One', year: '2008 — 2012', order: 1 },
  { label: 'Phase Four', year: '2021 — 2022', order: 2 },
]
const fallback = `${import.meta.env.BASE_URL}assets/fallbacks/title-mark.svg`
const backdrops = ['cityscape.svg', 'cosmic.svg', 'industrial.svg']
function backdropUrl(index: number) { return `${import.meta.env.BASE_URL}assets/backdrops/${backdrops[index % backdrops.length]}` }
function backdropForEntry(entry: DisplayEntry, index: number) {
  const title = (entry.demoTitle ?? titleForEntry(entry)?.title ?? '').toLowerCase()
  const cosmicStories = ['captain marvel', 'guardians of the galaxy', 'doctor strange', 'eternals', 'multiverse of madness']
  const industrialStories = ['iron man', 'shang-chi']
  const backdrop = cosmicStories.some(name => title.includes(name))
    ? 'cosmic.svg'
    : industrialStories.some(name => title.includes(name))
      ? 'industrial.svg'
      : null
  return backdrop ? `${import.meta.env.BASE_URL}assets/backdrops/${backdrop}` : backdropUrl(index)
}
function assetUrl(path?: string | null) {
  if (!path) return fallback
  if (path.startsWith('http')) return path
  while (path.startsWith('/')) path = path.slice(1)
  if (path.startsWith('public/')) path = path.slice('public/'.length)
  return import.meta.env.BASE_URL + path
}
const progressKey = 'emseeyou-progress-v1'

type SavedProgress = { movies?: Record<string, boolean>; episodes?: Record<string, boolean> }

function readProgress(): SavedProgress {
  try {
    const saved = window.localStorage.getItem(progressKey)
    return saved ? JSON.parse(saved) as SavedProgress : {}
  } catch {
    return {}
  }
}

export default function App() {
  const [selected, setSelected] = useState<DisplayEntry>(timeline.entries[0])
  const [timelineBackdrops, setTimelineBackdrops] = useState({ images: [0, 1], active: 0 })
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsClosing, setDetailsClosing] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const closeTimerRef = useRef<number | undefined>(undefined)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [watched, setWatched] = useState<Record<string, boolean>>(() => readProgress().movies ?? {})
  const [episodeWatched, setEpisodeWatched] = useState<Record<string, boolean>>(() => readProgress().episodes ?? {})
  const trackRef = useRef<HTMLDivElement>(null)
  const ordered = useMemo<DisplayEntry[]>(() => {
    const seed = [...timeline.entries].sort((a, b) => a.order - b.order)
    const stories = [
      ['Iron Man', '2008', 'https://commons.wikimedia.org/wiki/Special:FilePath/Iron_Man_-_2008_movie_logo.svg'],
      ['Captain America: The First Avenger', '1943', 'https://commons.wikimedia.org/wiki/Special:FilePath/Captain_America_The_First_Avenger_logo.svg'],
      ['Captain Marvel', '1995', 'https://commons.wikimedia.org/wiki/Special:FilePath/Captain_Marvel_Logo_Black.svg'],
      ['Iron Man 2', '2010', 'https://commons.wikimedia.org/wiki/Special:FilePath/Iron_Man_2_2010_Movie_Logo.svg'],
      ['Thor', '2011', 'https://commons.wikimedia.org/wiki/Special:FilePath/Thor_Movie_Logo_2011.svg'],
      ['The Avengers', '2012', 'https://commons.wikimedia.org/wiki/Special:FilePath/Marvel%27s_The_Avengers_logo.svg'],
      ['Guardians of the Galaxy', '2014', 'https://commons.wikimedia.org/wiki/Special:FilePath/Guardians_of_the_Galaxy-Logo.svg'],
      ['Black Panther', '2016', 'https://commons.wikimedia.org/wiki/Special:FilePath/Black_Panther_Logo_Black.svg'],
      ['Doctor Strange', '2016', 'https://commons.wikimedia.org/wiki/Special:FilePath/Doctor-Strange-logo.svg'],
      ['Avengers: Infinity War', '2018', 'https://commons.wikimedia.org/wiki/Special:FilePath/Avengers-infinity-war-logo.svg'],
      ['WandaVision', '2023', 'https://commons.wikimedia.org/wiki/Special:FilePath/WandaVision_wordmark_logo.svg', 'series'],
      ['Loki', '2023', 'https://commons.wikimedia.org/wiki/Special:FilePath/Loki_TV_series_logo.svg', 'series'],
      ['Shang-Chi and the Legend of the Ten Rings', '2024', 'https://commons.wikimedia.org/wiki/Special:FilePath/Shang_Chi_Logo.svg'],
      ['Eternals', '2024', 'https://commons.wikimedia.org/wiki/Special:FilePath/Eternals_Logo_Dark.svg'],
      ['Spider-Man: No Way Home', '2024', 'https://commons.wikimedia.org/wiki/Special:FilePath/Spider_Man_No_Way_Home_Logo.svg'],
      ['Doctor Strange in the Multiverse of Madness', '2025', 'https://commons.wikimedia.org/wiki/Special:FilePath/Multiverse_Of_Madness_Logo.svg'],
    ] as const
    return stories.map(([demoTitle, year, demoLogo, demoType], index) => {
      const entry = seed[index % seed.length]
      return {
        ...entry,
        id: 'demo-' + (index + 1) + '-' + entry.id,
        order: index + 1,
        chronology: { ...entry.chronology, start: year, note: 'Visual fixture only; verify chronology before production use.' },
        demoTitle,
        demoLogo,
        demoType: demoType ?? 'movie',
      }
    })
  }, [])
  const selectedTitle = titleForEntry(selected)
  const selectedDisplayTitle = selected.demoTitle ?? selectedTitle?.title
  const selectedProgressId = selected.demoTitle ? selected.id : selectedTitle?.id
  const episodes = selectedTitle?.seasons?.flatMap(season => season.episodes) ?? []
  const doneCount = episodes.filter(episode => episodeWatched[episode.id]).length
  const seriesProgress = episodes.length ? doneCount / episodes.length : 0
  const selectedBackdrop = selectedTitle?.assets?.backdrop?.path ? assetUrl(selectedTitle.assets.backdrop.path) : backdropForEntry(selected, ordered.findIndex(entry => entry.id === selected.id))

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionPreference.matches) return
    const interval = window.setInterval(() => {
      setTimelineBackdrops(current => {
        const nextLayer = 1 - current.active
        const nextImage = (current.images[current.active] + 1) % backdrops.length
        const images = [...current.images]
        images[nextLayer] = nextImage
        return { images, active: nextLayer }
      })
    }, 8000)
    return () => window.clearInterval(interval)
  }, [])


  useEffect(() => {
    try {
      window.localStorage.setItem(progressKey, JSON.stringify({ movies: watched, episodes: episodeWatched }))
    } catch {
      // Progress still works for the current session when browser storage is blocked or full.
    }
  }, [watched, episodeWatched])


  const closeDetails = useCallback(() => {
    if (!detailsOpen || detailsClosing) return
    setDetailsClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      setDetailsOpen(false)
      setDetailsClosing(false)
      closeTimerRef.current = undefined
    }, 360)
  }, [detailsOpen, detailsClosing])

  useEffect(() => {
    if (!detailsOpen) return
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeButtonRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeDetails()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [detailsOpen, closeDetails])

  function moveFocus(direction: number) {
    const selectedIndex = ordered.findIndex(entry => entry.id === selected.id)
    const current = selectedIndex < 0 ? 0 : selectedIndex
    const nextIndex = Math.max(0, Math.min(ordered.length - 1, current + direction))
    const next = ordered[nextIndex]
    if (!next) return
    setSelected(next)
    trackRef.current?.querySelectorAll<HTMLButtonElement>('[data-entry]')[nextIndex]?.focus()
  }

  function markImageFallback(event: React.SyntheticEvent<HTMLImageElement>) {
    event.currentTarget.onerror = null
    event.currentTarget.src = fallback
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="wordmark" href="#top" aria-label="emseeyou home">em<span>see</span>you<span className="wordmark-dot">.</span></a>
      <nav aria-label="Main navigation"><a href="#timeline">Timeline</a></nav>
      <a className="github-link" href="https://github.com/maestronix/emseeyou" target="_blank" rel="noreferrer">GitHub ↗</a>
    </header>
    <main id="top">
      <section className="intro">
        <p className="eyebrow"><span className="eyebrow-line" /> MARVEL CINEMATIC UNIVERSE</p>
        <h1>MCU <span>Chronology</span></h1>
        <p className="intro-copy">Stories in in-universe order.</p>
        <a className="scroll-cue" href="#timeline">VIEW TIMELINE <span>↓</span></a>
      </section>
      <section className="timeline-section" id="timeline" aria-labelledby="timeline-heading">
        <div className={`timeline-backdrop-layer ${timelineBackdrops.active === 0 ? 'is-active' : ''}`} style={{ backgroundImage: `url("${backdropUrl(timelineBackdrops.images[0])}")` }} aria-hidden="true" />
        <div className={`timeline-backdrop-layer ${timelineBackdrops.active === 1 ? 'is-active' : ''}`} style={{ backgroundImage: `url("${backdropUrl(timelineBackdrops.images[1])}")` }} aria-hidden="true" />
        <div className="section-heading"><div><p className="eyebrow">THE CHRONOLOGY</p><h2 id="timeline-heading">The timeline</h2></div><span className="entry-count">{ordered.length} STORIES · DEMO DATA</span></div>
        <div className="phase-labels" aria-hidden="true">{phases.map(phase => <div key={phase.label}><span>{phase.label}</span><small>{phase.year}</small></div>)}</div>
        <div className="timeline-track" ref={trackRef} tabIndex={0} aria-label="Timeline. Use left and right arrow keys to navigate." onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); moveFocus(1) } if (event.key === 'ArrowLeft') { event.preventDefault(); moveFocus(-1) } }}>
          <div className="timeline-line" />
          {ordered.map((entry, index) => {
            const title = titleForEntry(entry)
            if (!title) return null
            const titleEpisodes = title.seasons?.flatMap(season => season.episodes) ?? []
            const titleDone = titleEpisodes.filter(episode => episodeWatched[episode.id]).length
            const progressId = entry.demoTitle ? entry.id : title.id
            const reveal = title.type === 'movie' ? (watched[progressId] ? 100 : 0) : (titleEpisodes.length ? titleDone / titleEpisodes.length * 100 : 0)
            const isWatched = reveal === 100
            return <button key={entry.id} data-entry className={`timeline-item ${selected.id === entry.id ? 'selected' : ''} ${isWatched ? 'is-watched' : ''}`} style={{ '--item-index': index, '--color-reveal': `${reveal}%`, '--item-backdrop': `url("${backdropForEntry(entry, index)}")` } as React.CSSProperties} onClick={() => { if (closeTimerRef.current !== undefined) { window.clearTimeout(closeTimerRef.current); closeTimerRef.current = undefined } setSelected(entry); setDetailsClosing(false); setDetailsOpen(true) }} aria-pressed={selected.id === entry.id} aria-label={`${entry.demoTitle ?? title.title}, ${entry.chronology.start ?? 'date unknown'}`}>
              <span className="timeline-node"><span /></span>
              <span className="title-art logo-only">
                <img src={assetUrl(entry.demoLogo ?? title.assets?.logo?.path)} alt={(entry.demoTitle ?? title.title) + ' logo'} onError={markImageFallback} />
              </span>
              <span className="timeline-title">{entry.demoTitle ?? title.title}</span>
              <span className="timeline-year">{entry.chronology.start ?? 'TBD'}</span>
              {title.type === 'series' && <span className="item-progress" aria-label={`${Math.round(reveal)} percent watched`}><span style={{ width: `${reveal}%` }} /></span>}
            </button>
          })}
        </div>
        <p className="timeline-hint">Scroll horizontally to explore <span>·</span> Select a story to see details</p>
      </section>
      {detailsOpen && <section key={selected.id} className={`details-section detail-reveal ${detailsClosing ? 'is-closing' : ''}`} id="details" aria-labelledby="detail-title" aria-live="polite" style={{ '--detail-backdrop': `url("${selectedBackdrop}")` } as React.CSSProperties}>
        <div className="details-art"><img src={assetUrl(selectedTitle?.assets?.poster?.path ?? selectedTitle?.assets?.logo?.path)} alt="" onError={markImageFallback}/><span className="art-caption">YOUR MCU JOURNEY</span></div>
        <div className="details-content">
          <p className="eyebrow">STORY FILE <span className="file-number">/ {String(selected.order).padStart(2, '0')}</span></p>
          <div className="detail-title-row"><h2 id="detail-title">{selectedDisplayTitle ?? 'Unknown title'}</h2><button ref={closeButtonRef} className="detail-close" onClick={closeDetails} aria-label="Close story details">× <span>Close</span></button></div><p className="demo-notice">VISUAL TEST FIXTURE · NOT CURATED CANON DATA</p>
          <p className="detail-meta">{selectedTitle?.type === 'series' ? 'SERIES · EPISODE TRACKING' : 'FEATURE FILM'} <span>·</span> {selected.chronology.start ?? 'CHRONOLOGY TBD'}</p>
          <p className="overview">{selectedTitle?.overview ?? 'Details will appear here when this title is added to the catalog.'}</p>
          {selectedTitle?.type === 'movie' ? <button className={`progress-button ${selectedProgressId && watched[selectedProgressId] ? 'complete' : ''}`} onClick={() => selectedProgressId && setWatched(previous => ({ ...previous, [selectedProgressId]: !previous[selectedProgressId] }))}>{selectedProgressId && watched[selectedProgressId] ? '✓ Watched' : 'Mark as watched'}</button> : episodes.length > 0 ?
            <div className="episode-panel"><div className="episode-summary"><span>SEASON PROGRESS</span><strong>{doneCount} / {episodes.length} episodes · {Math.round(seriesProgress * 100)}%</strong></div><div className="progress-track"><span style={{ width: `${seriesProgress * 100}%` }}/></div>{episodes.map(episode => <label className="episode-row" key={episode.id}><input type="checkbox" checked={!!episodeWatched[episode.id]} onChange={event => setEpisodeWatched(previous => ({ ...previous, [episode.id]: event.target.checked }))}/><span><small>EPISODE {String(episode.number).padStart(2, '0')}</small>{episode.title}</span><span className="episode-check">{episodeWatched[episode.id] ? '✓' : ''}</span></label>)}</div> : <p className="overview">Episode tracking is unavailable for this demo series until its own series data is added.</p>}
        </div>
      </section>}
    </main>
    <footer><a className="wordmark footer-mark" href="#top">em<span>see</span>you<span className="wordmark-dot">.</span></a><p>AN UNOFFICIAL MCU FAN PROJECT · NOT AFFILIATED WITH MARVEL OR DISNEY</p><a href="https://github.com/maestronix/emseeyou/issues" target="_blank" rel="noreferrer">REPORT AN ISSUE ↗</a></footer>
  </div>
}