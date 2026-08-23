const SECTION_LABELS = {
  summary: 'Summary', objective: 'Objective', skills: 'Skills', experience: 'Experience', projects: 'Projects', education: 'Education', certifications: 'Certifications', achievements: 'Achievements',
}
const CORE_SECTIONS = new Set(['skills', 'experience', 'projects', 'education'])

function ResumeStructure({ sections }) {
  if (!sections || typeof sections !== 'object') return <article className="result-card"><span className="card-kicker">Resume structure</span><h2>Detected sections</h2><p className="muted-copy">Resume section information is not available.</p></article>
  const rows = Object.entries(sections).filter(([key]) => SECTION_LABELS[key])
  return <article className="result-card structure-card"><span className="card-kicker">Resume structure</span><h2>Detected sections</h2>{rows.length ? <ul className="structure-list">{rows.map(([key, present]) => <li key={key} className={present ? 'structure-item structure-item--present' : CORE_SECTIONS.has(key) ? 'structure-item structure-item--missing' : 'structure-item structure-item--optional'}><span aria-hidden="true">{present ? '✓' : CORE_SECTIONS.has(key) ? '!' : '—'}</span><strong>{SECTION_LABELS[key]}</strong><small>{present ? 'Detected' : CORE_SECTIONS.has(key) ? 'Not detected' : 'Optional · not detected'}</small></li>)}</ul> : <p className="muted-copy">No section fields were returned.</p>}</article>
}

export default ResumeStructure
