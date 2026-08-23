function ScoreExplanation({ analysis }) {
  const required = Array.isArray(analysis?.requiredKeywords) ? analysis.requiredKeywords : []
  const matched = new Set(Array.isArray(analysis?.matchedKeywords) ? analysis.matchedKeywords : [])
  const missing = Array.isArray(analysis?.missingKeywords) ? analysis.missingKeywords : []
  const sections = analysis?.resumeSections && typeof analysis.resumeSections === 'object' ? analysis.resumeSections : {}
  const completeness = Number(analysis?.breakdown?.resumeCompleteness)
  const completenessMax = Number(analysis?.metadata?.weights?.resumeCompleteness)
  const explanations = []

  if (required.length) {
    const matchedRequired = required.filter((skill) => matched.has(skill)).length
    if (matchedRequired / required.length >= 0.8) explanations.push('Strong coverage of required skills was detected.')
    else if (matchedRequired < required.length) explanations.push('Some required skills are missing from the resume.')
  }
  if (sections.projects && sections.experience) explanations.push('Project and experience sections were detected.')
  if (completenessMax > 0 && completeness / completenessMax >= 0.8) explanations.push('Most core resume sections are present.')
  if (!missing.length && (Array.isArray(analysis?.matchedKeywords) && analysis.matchedKeywords.length)) explanations.push('All detected job skills are represented in the resume.')

  return (
    <article className="result-card explanation-card">
      <span className="card-kicker">Why this score?</span>
      <h2>Evidence from this analysis</h2>
      {explanations.length ? <ul className="explanation-list">{explanations.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="muted-copy">There is not enough structured evidence to provide an additional explanation.</p>}
    </article>
  )
}

export default ScoreExplanation
