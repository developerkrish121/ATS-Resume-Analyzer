function Suggestions({ suggestions = [] }) {
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : []
  return <article className="result-card suggestions-card"><div><span className="card-kicker">Next steps</span><h2>Suggestions</h2><p>Only add skills and experience that accurately reflect your background.</p></div>{safeSuggestions.length ? <ol className="suggestion-list">{safeSuggestions.map((suggestion, index) => <li key={`${suggestion}-${index}`}><span>{index + 1}</span><p>{suggestion}</p></li>)}</ol> : <p className="muted-copy">No additional suggestions were generated.</p>}</article>
}

export default Suggestions
