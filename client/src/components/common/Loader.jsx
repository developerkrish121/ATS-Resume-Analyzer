function Loader({ message = 'Analyzing your resume…' }) {
  return (
    <span className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" aria-hidden="true" />
      <span>{message}</span>
    </span>
  )
}

export default Loader
