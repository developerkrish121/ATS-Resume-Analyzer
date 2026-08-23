const BREAKDOWN_LABELS = {
  skillMatch: 'Skill Match',
  keywordRelevance: 'Keyword Relevance',
  experienceRelevance: 'Experience Relevance',
  resumeCompleteness: 'Resume Completeness',
  educationMatch: 'Education Match',
  additionalSignals: 'Additional Signals',
}

function ScoreBreakdown({ breakdown, weights }) {
  if (!breakdown || typeof breakdown !== 'object') {
    return <article className="result-card"><span className="card-kicker">Score breakdown</span><h2>How points were earned</h2><p className="muted-copy">A detailed score breakdown is not available for this analysis.</p></article>
  }

  const rows = Object.entries(BREAKDOWN_LABELS).filter(([key]) => Number.isFinite(Number(breakdown[key])))

  return (
    <article className="result-card breakdown-card">
      <span className="card-kicker">Score breakdown</span>
      <h2>How points were earned</h2>
      {rows.length ? <ul className="breakdown-list">{rows.map(([key, label]) => {
        const earned = Number(breakdown[key])
        const maximum = Number.isFinite(Number(weights?.[key])) ? Number(weights[key]) : null
        const percent = maximum ? Math.min(100, Math.max(0, (earned / maximum) * 100)) : 0
        return <li key={key}><div className="breakdown-row"><span>{label}</span><strong>{earned}{maximum === null ? ' points' : ` / ${maximum}`}</strong></div>{maximum !== null && <div className="breakdown-track" role="progressbar" aria-label={`${label}: ${earned} out of ${maximum}`} aria-valuemin="0" aria-valuemax={maximum} aria-valuenow={earned}><span style={{ width: `${percent}%` }} /></div>}</li>
      })}</ul> : <p className="muted-copy">No score components were returned.</p>}
    </article>
  )
}

export default ScoreBreakdown
