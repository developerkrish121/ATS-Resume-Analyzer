import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'
import ResumeUpload from '../components/upload/ResumeUpload'
import JobDescription, { MIN_JOB_DESCRIPTION_LENGTH } from '../components/upload/JobDescription'
import { analyzeResume } from '../services/api'

function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [errors, setErrors] = useState({ resume: '', jobDescription: '', form: '' })
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (location.hash === '#analyzer') {
      document.getElementById('analyzer')?.scrollIntoView()
    }
  }, [location.hash])

  const scrollToAnalyzer = () => document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' })

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isAnalyzing) return

    const nextErrors = { resume: '', jobDescription: '', form: '' }
    if (!resume) nextErrors.resume = 'Select a PDF resume before continuing.'
    if (!jobDescription.trim()) nextErrors.jobDescription = 'Paste the job description before continuing.'
    else if (jobDescription.trim().length < MIN_JOB_DESCRIPTION_LENGTH) nextErrors.jobDescription = `Enter at least ${MIN_JOB_DESCRIPTION_LENGTH} characters.`

    if (nextErrors.resume || nextErrors.jobDescription) {
      setErrors(nextErrors)
      return
    }

    setErrors(nextErrors)
    setIsAnalyzing(true)
    try {
      const result = await analyzeResume({ resume, jobDescription: jobDescription.trim() })
      navigate(`/analysis/${result.analysisId}`, { state: result })
    } catch (error) {
      setErrors((current) => ({ ...current, form: error.message }))
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Resume-to-role comparison</span>
            <h1>See how well your resume matches the job.</h1>
            <p className="hero-copy">Upload a PDF and paste the job description to get an explainable match score, keyword gaps, and practical suggestions.</p>
            <Button onClick={scrollToAnalyzer}>Analyze my resume</Button>
            <p className="privacy-note">PDF only · 5 MB maximum · No account required</p>
          </div>
          <div className="hero-panel" aria-label="Analysis overview">
            <div className="hero-panel__step"><span>01</span><div><strong>Upload</strong><p>Select your current PDF resume.</p></div></div>
            <div className="hero-panel__step"><span>02</span><div><strong>Compare</strong><p>Add the complete job description.</p></div></div>
            <div className="hero-panel__step"><span>03</span><div><strong>Improve</strong><p>Review matches, gaps, and suggestions.</p></div></div>
          </div>
        </div>
      </section>

      <section className="features-section" aria-labelledby="features-title">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Focused feedback</span><h2 id="features-title">A clearer way to tailor your application</h2></div>
          <div className="feature-grid">
            <article className="feature-card"><span>Match</span><h3>Explainable score</h3><p>Understand the keyword coverage behind your result.</p></article>
            <article className="feature-card"><span>Find</span><h3>Visible gaps</h3><p>See which terms from the role are missing from your resume.</p></article>
            <article className="feature-card"><span>Act</span><h3>Practical next steps</h3><p>Use focused suggestions without rewriting your experience.</p></article>
          </div>
        </div>
      </section>

      <section id="analyzer" className="analyzer-section" aria-labelledby="analyzer-title">
        <div className="container analyzer-layout">
          <div className="analyzer-intro"><span className="eyebrow">Start analysis</span><h2 id="analyzer-title">Compare your resume</h2><p>Use the full job posting so the comparison reflects its actual requirements.</p></div>
          <form className="analyzer-form" onSubmit={handleSubmit} noValidate>
            <ResumeUpload file={resume} error={errors.resume} onChange={(file, error) => { setResume(file); setErrors((current) => ({ ...current, resume: error, form: '' })) }} />
            <JobDescription value={jobDescription} error={errors.jobDescription} onChange={(value, error) => { setJobDescription(value); setErrors((current) => ({ ...current, jobDescription: error, form: '' })) }} />
            {errors.form && <div className="form-alert" role="alert">{errors.form}</div>}
            <Button className="button--full" type="submit" disabled={isAnalyzing}>{isAnalyzing ? <Loader message="Calculating ATS score and generating AI insights…" /> : 'Analyze resume'}</Button>
          </form>
        </div>
      </section>
    </>
  )
}

export default Home
