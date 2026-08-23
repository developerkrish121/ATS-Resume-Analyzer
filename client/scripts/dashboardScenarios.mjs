import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createServer } from 'vite'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })

const baseState = {
  resume: { originalName: 'sample-resume.pdf', uploadDate: '2026-08-22T08:00:00.000Z' },
  analysis: {
    score: 72,
    totalJobKeywords: 6,
    matchedKeywordCount: 5,
    matchedKeywords: ['React', 'Node.js', 'MongoDB', 'REST API', 'Docker'],
    missingKeywords: ['AWS'],
    requiredKeywords: ['React', 'Node.js', 'MongoDB', 'REST API'],
    preferredKeywords: ['Docker', 'AWS'],
    resumeSections: { skills: true, experience: true, projects: true, education: true, certifications: false },
    strengths: ['Strong coverage of required technical skills.'],
    suggestions: ['The role lists AWS as preferred. Mention it only if it reflects your experience.'],
    breakdown: { skillMatch: 36, keywordRelevance: 4, experienceRelevance: 11, resumeCompleteness: 10, educationMatch: 8, additionalSignals: 3 },
    metadata: {
      standardKeywords: [],
      weights: { skillMatch: 40, keywordRelevance: 20, experienceRelevance: 15, resumeCompleteness: 10, educationMatch: 10, additionalSignals: 5 },
    },
  },
}

const scenarios = [
  ['normal analysis', baseState],
  ['no matched skills', { ...baseState, analysis: { ...baseState.analysis, matchedKeywords: [], matchedKeywordCount: 0 } }],
  ['no missing skills', { ...baseState, analysis: { ...baseState.analysis, missingKeywords: [] } }],
  ['empty strengths', { ...baseState, analysis: { ...baseState.analysis, strengths: [] } }],
  ['empty suggestions', { ...baseState, analysis: { ...baseState.analysis, suggestions: [] } }],
  ['empty preferred skills', { ...baseState, analysis: { ...baseState.analysis, preferredKeywords: [] } }],
  ['missing breakdown', { ...baseState, analysis: { ...baseState.analysis, breakdown: undefined } }],
  ['missing resume metadata', { ...baseState, resume: {} }],
  ['AI insights available', { ...baseState, analysis: { ...baseState.analysis, aiStatus: 'available', aiInsights: { summary: 'AI summary', topStrengths: ['AI strength'], improvementAreas: ['AI improvement'], missingSkillExplanation: 'AI gap context', jdSpecificRecommendations: ['AI recommendation'], bulletImprovements: ['AI bullet improvement'], overallAdvice: 'AI advice' } } }],
  ['AI insights unavailable', { ...baseState, analysis: { ...baseState.analysis, aiStatus: 'unavailable', aiInsights: null } }],
]

try {
  const { default: Dashboard } = await vite.ssrLoadModule('/src/pages/Dashboard.jsx')
  for (const [name, state] of scenarios) {
    const markup = renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        { initialEntries: [{ pathname: '/dashboard', state }] },
        React.createElement(Dashboard),
      ),
    )
    assert.match(markup, /Your ATS report/, `${name} did not render the dashboard`)
    assert.doesNotMatch(markup, />undefined<|>null<|>NaN</, `${name} rendered an unsafe value`)
    console.log(`PASS ${name}`)
  }

  const directAnalysisMarkup = renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      { initialEntries: ['/analysis/507f1f77bcf86cd799439011'] },
      React.createElement(Routes, null, React.createElement(Route, { path: '/analysis/:analysisId', element: React.createElement(Dashboard) })),
    ),
  )
  assert.match(directAnalysisMarkup, /Loading your analysis/, 'direct analysis URL did not use the ID-backed loading state')
  console.log('PASS direct analysis URL')

  const emptyDashboardMarkup = renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      { initialEntries: ['/dashboard'] },
      React.createElement(Dashboard),
    ),
  )
  assert.match(emptyDashboardMarkup, /No analysis to display yet/, 'empty dashboard state did not render safely')
  console.log('PASS empty dashboard state')
} finally {
  await vite.close()
}
