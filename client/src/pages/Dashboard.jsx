import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import ATSScore from '../components/result/ATSScore'
import MatchedSkills from '../components/result/MatchedSkills'
import MissingSkills from '../components/result/MissingSkills'
import Suggestions from '../components/result/Suggestions'
import ResumeCard from '../components/result/ResumeCard'
import ScoreBreakdown from '../components/result/ScoreBreakdown'
import ScoreExplanation from '../components/result/ScoreExplanation'
import RequiredSkills from '../components/result/RequiredSkills'
import PreferredSkills from '../components/result/PreferredSkills'
import ResumeStructure from '../components/result/ResumeStructure'
import Strengths from '../components/result/Strengths'
import Loader from '../components/common/Loader'
import { getAnalysis } from '../services/api'
import AiInsights from '../components/result/AiInsights'

function Dashboard() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { analysisId } = useParams()
  const [result, setResult] = useState(() => analysisId ? null : state)
  const [loadedAnalysisId, setLoadedAnalysisId] = useState('')
  const [error, setError] = useState({ analysisId: '', message: '' })

  const isLoading = Boolean(analysisId) && loadedAnalysisId !== analysisId && error.analysisId !== analysisId
  const errorMessage = error.analysisId === analysisId ? error.message : ''

  useEffect(() => {
    if (!analysisId) return undefined

    let isCurrent = true
    getAnalysis(analysisId)
      .then((data) => {
        if (isCurrent) {
          setResult(data)
          setLoadedAnalysisId(analysisId)
        }
      })
      .catch((requestError) => {
        if (isCurrent) setError({ analysisId, message: requestError.message })
      })

    return () => { isCurrent = false }
  }, [analysisId])

  if (isLoading) {
    return <section className="empty-state container"><Loader message="Loading your analysis…" /></section>
  }

  if (errorMessage) {
    return <section className="empty-state container"><span className="eyebrow">Analysis unavailable</span><h1>We could not load this analysis</h1><p>{errorMessage}</p><Link className="button" to="/history">View analysis history</Link></section>
  }

  const resume = result?.resume
  const analysis = result?.analysis

  if (!resume || !analysis) {
    return (
      <section className="empty-state container">
        <span className="eyebrow">Dashboard</span>
        <h1>No analysis to display yet</h1>
        <p>Analyze a resume first, then your current result will appear here.</p>
        <Link className="button" to="/#analyzer">Start an analysis</Link>
      </section>
    )
  }

  const matchedKeywords = Array.isArray(analysis.matchedKeywords) ? analysis.matchedKeywords : []
  const standardKeywords = Array.isArray(analysis.metadata?.standardKeywords) ? analysis.metadata.standardKeywords : null
  const standardMatches = standardKeywords ? standardKeywords.filter((skill) => matchedKeywords.includes(skill)) : matchedKeywords
  const analyzeAnother = () => navigate('/#analyzer', { replace: true, state: null })

  return (
    <section className="dashboard-section">
      <div className="container">
        <div className="dashboard-heading">
          <div><span className="eyebrow">Resume analysis</span><h1>Your ATS report</h1><p>Review the evidence behind your score before making changes.</p></div>
          <button className="button button--secondary" type="button" onClick={analyzeAnother}>Analyze another resume</button>
        </div>
        <ResumeCard resume={resume} />
        <div className="result-overview result-overview--score"><ATSScore score={analysis.score} matchedCount={analysis.matchedKeywordCount} totalCount={analysis.totalJobKeywords} relevantMatchedCount={analysis.metadata?.matchedRelevantKeywordCount} relevantTotalCount={analysis.metadata?.totalRelevantKeywordCount} /><ScoreBreakdown breakdown={analysis.breakdown} weights={analysis.metadata?.weights} /></div>
        <ScoreExplanation analysis={analysis} />
        <AiInsights aiInsights={analysis.aiInsights} aiStatus={analysis.aiStatus} />
        <div className="result-grid priority-grid"><RequiredSkills skills={analysis.requiredKeywords} matchedKeywords={matchedKeywords} /><PreferredSkills skills={analysis.preferredKeywords} matchedKeywords={matchedKeywords} /></div>
        <div className="result-grid"><MatchedSkills skills={standardMatches} /><MissingSkills skills={analysis.missingKeywords} requiredKeywords={analysis.requiredKeywords} preferredKeywords={analysis.preferredKeywords} standardKeywords={standardKeywords} /></div>
        <div className="result-grid"><ResumeStructure sections={analysis.resumeSections} /><Strengths strengths={analysis.strengths} /></div>
        <Suggestions suggestions={analysis.suggestions} />
      </div>
    </section>
  )
}

export default Dashboard
