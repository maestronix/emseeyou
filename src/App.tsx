import { useEffect, useMemo, useRef, useState } from 'react'
import timeline from '../data/timeline.json'
import ironMan from '../data/movies/iron-man.json'
import wandaVision from '../data/series/wandavision.json'

type Entry = (typeof timeline.entries)[number]
type Title = { id: string; type: string; title: string; overview?: string; releaseDate?: string; assets?: { logo?: { path: string | null }; poster?: { path: string | null }; backdrop?: { path: string | null } }; seasons?: { id: string; number: number; title: string; episodes: { id: string; number: number; title: string }[] }[] }
const titles: Record<string, Title> = { [ironMan.id]: ironMan, [wandaVision.id]: wandaVision }
const phases = [
  { label: 'Phase One', year: '2008 — 2012', order: 1 },
  { label: 'Phase Four', year: '2021 — 2022', order: 2 },
]
const fallback = `${import.meta.env.BASE_URL}assets/fallbacks/title-mark.svg`

export default function App() {
  const [selected, setSelected] = useState<Entry>(timeline.entries[0])
  const [watched, setWatched] = useState<Record<string, boolean>>({})
  const [episodeWatched, setEpisodeWatched] = useState<Record<string, boolean>>({})
  const trackRef = useRef<HTMLDivElement>(null)
  const ordered = useMemo(() => [...timeline.entries].sort((a, b) => a.order - b.order), [])
  const selectedTitle = titles[selected.target.type === 'episode' ? selected.target.seriesId! : selected.target.id]
  const episodes = selectedTitle?.seasons?.flatMap(season => season.episodes) ?? []
  const doneCount = episodes.filter(episode => episodeWatched[episode.id]).length
  const seriesProgress = episodes.length ? doneCount / episodes.length : 0

  useEffect(() => {
    const saved = localStorage.getItem('emseeyou-progress-v1')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { movies?: Record<string, boolean>; episodes?: Record<string, boolean> }
        setWatched(parsed.movies ?? {})
        setEpisodeWatched(parsed.episodes ?? {})
      } catch { localStorage.removeItem('emseeyou-progress-v1') }
    }
  }, [])
  useEffect(() => {
    localStorage.setItem('emseeyou-progress-v1', JSON.stringify({ movies: watched, episodes: episodeWatched }))
  }, [watched, episodeWatched])

  function moveFocus(direction: number) {
    const current = ordered.findIndex(entry => entry.id === selected.id)
    const next = ordered[Math.max(0, Math.min(ordered.length - 1, current + direction))]
    setSelected(next)
    trackRef.current?.querySelectorAll<HTMLButtonElement>('[data-entry]')[Math.max(0, Math.min(ordered.length - 1, current + direction))]?.focus()
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="wordmark" href="#top" aria-label="emseeyou home">em<span>see</span>you<span className="wordmark-dot">.</span></a>
      <nav aria-label="Main navigation"><a href="#timeline">Timeline</a><a href="#details">Explore</a></nav>
      <a className="github-link" href="https://github.com/maestronix/emseeyou" target="_blank" rel="noreferrer">GitHub ↗</a>
    </header>
    <main id="top">
      <section className="intro">
        <p className="eyebrow"><span className="eyebrow-line" /> THE MARVEL CINEMATIC UNIVERSE</p>
        <h1>Every story.<br/><span>One timeline.</span></h1>
        <p className="intro-copy">Travel through the MCU in in-universe chronological order.<br className="desktop-break"/> Your journey, your pace.</p>
        <a className="scroll-cue" href="#timeline">EXPLORE THE TIMELINE <span>↓</span></a>
      </section>
      <section className="timeline-section" id="timeline" aria-labelledby="timeline-heading">
        <div className="section-heading"><div><p className="eyebrow">THE CHRONOLOGY</p><h2 id="timeline-heading">The timeline</h2></div><span className="entry-count">{ordered.length} STORIES · PREVIEW</span></div>
        <div className="phase-labels" aria-hidden="true">{phases.map(phase => <div key={phase.label}><span>{phase.label}</span><small>{phase.year}</small></div>)}</div>
        <div className="timeline-track" ref={trackRef} tabIndex={0} aria-label="Timeline. Use left and right arrow keys to navigate." onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); moveFocus(1) } if (event.key === 'ArrowLeft') { event.preventDefault(); moveFocus(-1) } }}>
          <div className="timeline-line" />
          {ordered.map((entry, index) => {
            const title = titles[entry.target.type === 'episode' ? entry.target.seriesId! : entry.target.id]
            if (!title) return null
            const isWatched = title.type === 'movie' ? !!watched[title.id] : !!episodeWatched[entry.target.id]
            return <button key={entry.id} data-entry className={`timeline-item ${selected.id === entry.id ? 'selected' : ''} ${isWatched ? 'is-watched' : ''}`} style={{ '--item-index': index } as React.CSSProperties} onClick={() => setSelected(entry)} aria-pressed={selected.id === entry.id} aria-label={`${title.title}, ${entry.chronology.start ?? 'date unknown'}`}>
              <span className="timeline-node"><span /></span>
              <span className="title-art">
                <img src={title.assets?.logo?.path ?? fallback} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = fallback }} />
              </span>
              <span className="timeline-title">{title.title}</span>
              <span className="timeline-year">{entry.chronology.start ?? 'TBD'}</span>
            </button>
          })}
        </div>
        <p className="timeline-hint">Scroll horizontally to explore <span>·</span> Select a story to see details</p>
      </section>
      <section className="details-section" id="details" aria-live="polite">
        <div className="details-art"><img src={selectedTitle?.assets?.poster?.path ?? fallback} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = fallback }}/><span className="art-caption">YOUR MCU JOURNEY</span></div>
        <div className="details-content">
          <p className="eyebrow">STORY FILE <span className="file-number">/ {String(selected.order).padStart(2, '0')}</span></p>
          <h2>{selectedTitle?.title ?? 'Unknown title'}</h2>
          <p className="detail-meta">{selectedTitle?.type === 'series' ? 'SERIES · EPISODE TRACKING' : 'FEATURE FILM'} <span>·</span> {selected.chronology.start ?? 'CHRONOLOGY TBD'}</p>
          <p className="overview">{selectedTitle?.overview ?? 'Details will appear here when this title is added to the catalog.'}</p>
          {selectedTitle?.type === 'movie' ? <button className={`progress-button ${watched[selectedTitle.id] ? 'complete' : ''}`} onClick={() => setWatched(previous => ({ ...previous, [selectedTitle.id]: !previous[selectedTitle.id] }))}>{watched[selectedTitle.id] ? '✓ Watched' : 'Mark as watched'}</button> :
            <div className="episode-panel"><div className="episode-summary"><span>SEASON PROGRESS</span><strong>{doneCount} / {episodes.length} episodes</strong></div><div className="progress-track"><span style={{ width: `${seriesProgress * 100}%` }}/></div>{episodes.map(episode => <label className="episode-row" key={episode.id}><input type="checkbox" checked={!!episodeWatched[episode.id]} onChange={event => setEpisodeWatched(previous => ({ ...previous, [episode.id]: event.target.checked }))}/><span><small>EPISODE {String(episode.number).padStart(2, '0')}</small>{episode.title}</span><span className="episode-check">{episodeWatched[episode.id] ? '✓' : ''}</span></label>)}</div>}
        </div>
      </section>
    </main>
    <footer><a className="wordmark footer-mark" href="#top">em<span>see</span>you<span className="wordmark-dot">.</span></a><p>AN UNOFFICIAL MCU FAN PROJECT · NOT AFFILIATED WITH MARVEL OR DISNEY</p><a href="https://github.com/maestronix/emseeyou/issues" target="_blank" rel="noreferrer">REPORT AN ISSUE ↗</a></footer>
  </div>
}