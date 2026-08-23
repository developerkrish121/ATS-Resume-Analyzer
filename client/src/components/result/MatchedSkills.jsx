function MatchedSkills({ skills = [], title = 'Standard skill matches', emptyMessage = 'No standard skill matches were found.' }) {
  const safeSkills = Array.isArray(skills) ? skills : []
  return <article className="result-card"><span className="card-kicker card-kicker--success">Matched skills</span><h2>{title}</h2>{safeSkills.length ? <ul className="tag-list tag-list--matched">{safeSkills.map((skill) => <li key={skill}>✓ {skill}</li>)}</ul> : <p className="muted-copy">{emptyMessage}</p>}</article>
}

export default MatchedSkills
