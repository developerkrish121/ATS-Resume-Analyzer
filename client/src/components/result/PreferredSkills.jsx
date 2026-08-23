function PreferredSkills({ skills, matchedKeywords }) {
  const safeSkills = Array.isArray(skills) ? [...new Set(skills)] : []
  const matched = new Set(Array.isArray(matchedKeywords) ? matchedKeywords : [])
  return <article className="result-card priority-card"><span className="card-kicker card-kicker--subtle">Preferred skills</span><h2>Lower-priority additions</h2>{safeSkills.length ? <ul className="status-list">{safeSkills.map((skill) => <li key={skill} className={matched.has(skill) ? 'status-item status-item--matched' : 'status-item status-item--preferred'}><span aria-hidden="true">{matched.has(skill) ? '✓' : '○'}</span><div><strong>{skill}</strong><small>{matched.has(skill) ? 'Matched' : 'Not detected · preferred'}</small></div></li>)}</ul> : <p className="muted-copy">No preferred skills were identified separately.</p>}</article>
}

export default PreferredSkills
