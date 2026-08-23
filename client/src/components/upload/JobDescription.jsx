export const MIN_JOB_DESCRIPTION_LENGTH = 50
export const MAX_JOB_DESCRIPTION_LENGTH = 50000

function JobDescription({ value, error, onChange }) {
  return (
    <div className="field-group">
      <div className="field-heading"><label htmlFor="job-description">Job description</label><span>{value.length.toLocaleString()} / {MAX_JOB_DESCRIPTION_LENGTH.toLocaleString()}</span></div>
      <textarea id="job-description" className={error ? 'textarea textarea--error' : 'textarea'} value={value} maxLength={MAX_JOB_DESCRIPTION_LENGTH} rows="10" placeholder="Paste the complete job description, including responsibilities and required skills." aria-describedby={error ? 'job-description-error' : undefined} onChange={(event) => onChange(event.target.value, '')} />
      <div className="field-support">
        <span>Include at least {MIN_JOB_DESCRIPTION_LENGTH} characters for a useful comparison.</span>
        {error && <span id="job-description-error" className="field-error" role="alert">{error}</span>}
      </div>
    </div>
  )
}

export default JobDescription
