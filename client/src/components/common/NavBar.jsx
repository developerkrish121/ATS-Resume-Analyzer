import { NavLink } from 'react-router-dom'

function NavBar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink className="brand" to="/" aria-label="ResumeFit home">
          <span className="brand__mark" aria-hidden="true">RF</span>
          <span>ResumeFit</span>
        </NavLink>
        <nav className="navbar__links" aria-label="Primary navigation">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>Home</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>Dashboard</NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>History</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default NavBar
