import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../components/common/Loader'
import { deleteAnalysis, getAnalysisHistory } from '../services/api'

function History() {
  const [analyses, setAnalyses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    let isCurrent = true
    getAnalysisHistory()
      .then((data) => {
        if (isCurrent) setAnalyses(Array.isArray(data) ? data : [])
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.message)
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })
    return () => { isCurrent = false }
  }, [])

  const handleDelete = async (analysisId) => {
    if (deletingId) return
    setDeletingId(analysisId)
    setError('')
    try {
      await deleteAnalysis(analysisId)
      setAnalyses((current) => current.filter((analysis) => analysis.analysisId !== analysisId))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingId('')
    }
  }

  if (isLoading) return <section className="empty-state container"><Loader message="Loading analysis history…" /></section>

  return (
    <section className="dashboard-section">
      <div className="container">
        <div className="dashboard-heading"><div><span className="eyebrow">Saved analyses</span><h1>Analysis history</h1><p>Revisit or remove previous resume comparisons.</p></div><Link className="button button--secondary" to="/#analyzer">Analyze another resume</Link></div>
        {error && <div className="form-alert" role="alert">{error}</div>}
        {!analyses.length ? <article className="result-card empty-history"><h2>No saved analyses yet</h2><p>Analyze a resume to create your first saved report.</p><Link className="button" to="/#analyzer">Analyze a resume</Link></article> : <div className="history-list">{analyses.map((analysis) => {
          const date = analysis.createdAt || analysis.uploadDate
          const label = date ? new Date(date).toLocaleString() : 'Date unavailable'
          return <article className="result-card history-item" key={analysis.analysisId}><div><span className="card-kicker">Saved analysis</span><h2>{analysis.originalName || 'Uploaded resume'}</h2><p>Score: <strong>{Number(analysis.atsScore) || 0}/100</strong> · {label}</p></div><div className="history-item__actions"><Link className="button button--secondary button--small" to={`/analysis/${analysis.analysisId}`}>Open</Link><button className="button button--text button--small" type="button" onClick={() => handleDelete(analysis.analysisId)} disabled={deletingId === analysis.analysisId}>{deletingId === analysis.analysisId ? 'Deleting…' : 'Delete'}</button></div></article>
        })}</div>}
      </div>
    </section>
  )
}

export default History
