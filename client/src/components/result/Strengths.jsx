function Strengths({ strengths }) {
  const safeStrengths = Array.isArray(strengths) ? strengths : []
  return <article className="result-card"><span className="card-kicker card-kicker--success">Strengths</span><h2>Evidence-based positives</h2>{safeStrengths.length ? <ul className="check-list strengths-list">{safeStrengths.map((strength) => <li key={strength}>{strength}</li>)}</ul> : <p className="muted-copy">No specific strengths were detected by the current analysis.</p>}</article>
}

export default Strengths
