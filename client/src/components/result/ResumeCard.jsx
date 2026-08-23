function ResumeCard({ resume }) {
  const rawDate = resume?.uploadDate || resume?.createdAt
  const parsedDate = rawDate ? new Date(rawDate) : null
  const formattedDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toLocaleString() : null
  return <article className="result-card resume-card"><span className="card-kicker">Analyzed resume</span><h2>{resume?.originalName || 'Uploaded resume'}</h2><p>{formattedDate ? `Analyzed ${formattedDate}` : 'Analysis completed successfully.'}</p></article>
}

export default ResumeCard
