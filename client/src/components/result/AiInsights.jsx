function InsightList({ title, items }) {
  const safeItems = Array.isArray(items) ? items : []
  if (!safeItems.length) return null
  return <section className="ai-insights__group"><h3>{title}</h3><ul className="check-list">{safeItems.map((item) => <li key={item}>{item}</li>)}</ul></section>
}

function AiInsights({ aiInsights, aiStatus }) {
  if (aiStatus !== 'available' || !aiInsights) {
    return <article className="result-card ai-insights-card"><span className="card-kicker card-kicker--subtle">AI-generated insights</span><h2>AI Resume Insights</h2><p className="muted-copy">AI insights are currently unavailable. Your deterministic ATS analysis is still complete.</p></article>
  }

  return (
    <article className="result-card ai-insights-card">
      <span className="card-kicker card-kicker--subtle">AI-generated insights</span>
      <h2>AI Resume Insights</h2>
      <p>{aiInsights.summary}</p>
      <div className="ai-insights__grid">
        <InsightList title="AI strengths" items={aiInsights.topStrengths} />
        <InsightList title="Improvement areas" items={aiInsights.improvementAreas} />
        <InsightList title="JD-specific recommendations" items={aiInsights.jdSpecificRecommendations} />
        <InsightList title="Bullet improvements" items={aiInsights.bulletImprovements} />
      </div>
      {aiInsights.missingSkillExplanation && <section className="ai-insights__group"><h3>Missing skill context</h3><p>{aiInsights.missingSkillExplanation}</p></section>}
      {aiInsights.overallAdvice && <section className="ai-insights__group"><h3>Overall advice</h3><p>{aiInsights.overallAdvice}</p></section>}
    </article>
  )
}

export default AiInsights
