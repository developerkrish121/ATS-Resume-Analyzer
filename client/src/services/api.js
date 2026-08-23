import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '', timeout: 60000 })

export const analyzeResume = async ({ resume, jobDescription }) => {
  const formData = new FormData()
  formData.append('resume', resume)
  formData.append('jobDescription', jobDescription)

  try {
    const response = await api.post('/api/resume/upload', formData)
    if (!response.data?.success || !response.data?.data?.resume || !response.data?.data?.analysis) throw new Error('The server returned an unexpected response.')
    return response.data.data
  } catch (error) {
    if (error.response) throw new Error(error.response.data?.message || 'The resume could not be analyzed.', { cause: error })
    if (error.code === 'ECONNABORTED') throw new Error('The analysis took too long. Please try again.', { cause: error })
    if (error.request) throw new Error('Unable to reach the analysis service. Please check that the server is running.', { cause: error })
    throw new Error(error.message || 'Something went wrong while analyzing your resume.', { cause: error })
  }
}

const requestAnalysis = async (request, fallbackMessage) => {
  try {
    const response = await request()
    if (!response.data?.success) throw new Error(response.data?.message || fallbackMessage)
    return response.data.data
  } catch (error) {
    if (error.response) throw new Error(error.response.data?.message || fallbackMessage, { cause: error })
    if (error.request) throw new Error('Unable to reach the analysis service. Please check that the server is running.', { cause: error })
    throw new Error(error.message || fallbackMessage, { cause: error })
  }
}

export const getAnalysis = (analysisId) => requestAnalysis(
  () => api.get(`/api/resume/${analysisId}`),
  'The analysis could not be loaded.',
)

export const getAnalysisHistory = () => requestAnalysis(
  () => api.get('/api/resume/history'),
  'Analysis history could not be loaded.',
)

export const deleteAnalysis = (analysisId) => requestAnalysis(
  () => api.delete(`/api/resume/${analysisId}`),
  'The analysis could not be deleted.',
)

export default api
