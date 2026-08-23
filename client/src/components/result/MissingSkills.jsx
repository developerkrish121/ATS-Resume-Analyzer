function MissingSkills({ skills, requiredKeywords, preferredKeywords, standardKeywords }) {
  const safeSkills = Array.isArray(skills) ? [...new Set(skills)] : []
  const required = new Set(Array.isArray(requiredKeywords) ? requiredKeywords : [])
  const preferred = new Set(Array.isArray(preferredKeywords) ? preferredKeywords : [])
  const standard = new Set(Array.isArray(standardKeywords) ? standardKeywords : [])
  const canClassify = Array.isArray(requiredKeywords) || Array.isArray(preferredKeywords) || Array.isArray(standardKeywords)
  const categories = canClassify ? [
    ['Required', safeSkills.filter((skill) => required.has(skill))],
    ['Standard', safeSkills.filter((skill) => standard.has(skill))],
    ['Preferred', safeSkills.filter((skill) => preferred.has(skill))],
  ].filter(([, items]) => items.length) : []

  return <article className="result-card missing-card"><span className="card-kicker card-kicker--warning">Missing skills</span><h2>Review these gaps</h2>{!safeSkills.length ? <p className="muted-copy">No skill gaps were identified.</p> : categories.length ? <div className="missing-groups">{categories.map(([label, items]) => <section key={label}><h3>{label}</h3><ul className="tag-list tag-list--missing">{items.map((skill) => <li key={skill}>! {skill}</li>)}</ul></section>)}</div> : <ul className="tag-list tag-list--missing">{safeSkills.map((skill) => <li key={skill}>! {skill}</li>)}</ul>}</article>
}

export default MissingSkills
