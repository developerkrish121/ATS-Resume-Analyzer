function ATSScore({ score, matchedCount, totalCount, relevantMatchedCount, relevantTotalCount }) {
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0))
  const safeMatchedCount = Number.isFinite(Number(matchedCount)) ? Number(matchedCount) : 0
  const safeTotalCount = Number.isFinite(Number(totalCount)) ? Number(totalCount) : 0
  const hasRelevantKeywordCounts = Number.isFinite(Number(relevantMatchedCount)) && Number.isFinite(Number(relevantTotalCount)) && Number(relevantTotalCount) > 0
  const interpretation = safeScore >= 90 ? 'Excellent Match' : safeScore >= 75 ? 'Strong Match' : safeScore >= 60 ? 'Moderate Match' : safeScore >= 40 ? 'Needs Improvement' : 'Low Match'
  return (
    <article className="result-card score-card">
      <div className="score-ring" style={{ '--score': `${safeScore * 3.6}deg` }} role="img" aria-label={`ATS score: ${safeScore} out of 100, ${interpretation}`}><div><strong>{safeScore}</strong><span>/ 100</span></div></div>
      <div><span className="card-kicker">ATS score</span><h2>{interpretation}</h2><p><strong>{safeMatchedCount}</strong> of <strong>{safeTotalCount}</strong> detected job skills matched.</p>{hasRelevantKeywordCounts && <p className="score-detail"><strong>{Number(relevantMatchedCount)}</strong> of <strong>{Number(relevantTotalCount)}</strong> additional relevant terms matched.</p>}</div>
    </article>
  )
}

export default ATSScore
