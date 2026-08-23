import { useRef } from 'react'
import Button from '../common/Button'

const MAX_FILE_SIZE = 5 * 1024 * 1024

function ResumeUpload({ file, error, onChange }) {
  const inputRef = useRef(null)

  const handleFile = (selectedFile) => {
    if (!selectedFile) return
    if (selectedFile.type !== 'application/pdf') {
      onChange(null, 'Please select a PDF file.')
      return
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      onChange(null, 'Your resume must be 5 MB or smaller.')
      return
    }
    onChange(selectedFile, '')
  }

  const clearFile = () => {
    if (inputRef.current) inputRef.current.value = ''
    onChange(null, '')
  }

  return (
    <div className="field-group">
      <div className="field-heading"><label htmlFor="resume">Resume PDF</label><span>Maximum 5 MB</span></div>
      <div className={`upload-box ${error ? 'upload-box--error' : ''}`}>
        <input ref={inputRef} id="resume" className="visually-hidden" type="file" accept="application/pdf,.pdf" onChange={(event) => handleFile(event.target.files?.[0])} />
        <div>
          <p className="upload-box__title">{file ? file.name : 'Choose your resume'}</p>
          <p className="upload-box__help">{file ? 'Ready to analyze. You can replace it at any time.' : 'PDF files only. Upload begins when you click Analyze.'}</p>
        </div>
        <div className="upload-box__actions">
          <Button className="button--secondary button--small" onClick={() => inputRef.current?.click()}>{file ? 'Replace' : 'Select PDF'}</Button>
          {file && <Button className="button--text button--small" onClick={clearFile}>Clear</Button>}
        </div>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  )
}

export default ResumeUpload
