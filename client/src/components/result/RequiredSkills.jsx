function RequiredSkills({ skills, matchedKeywords }) {
  const safeSkills = Array.isArray(skills) ? [...new Set(skills)] : []
  const matched = new Set(Array.isArray(matchedKeywords) ? matchedKeywords : [])
  return <article className="result-card priority-card"><span className="card-kicker">Required skills</span><h2>Core requirements</h2>{safeSkills.length ? <ul className="status-list">{safeSkills.map((skill) => <li key={skill} className={matched.has(skill) ? 'status-item status-item--matched' : 'status-item status-item--missing'}><span aria-hidden="true">{matched.has(skill) ? '✓' : '!'}</span><div><strong>{skill}</strong><small>{matched.has(skill) ? 'Matched' : 'Missing'}</small></div></li>)}</ul> : <p className="muted-copy">The job description did not identify explicitly required skills.</p>}</article>
}

export default RequiredSkills
