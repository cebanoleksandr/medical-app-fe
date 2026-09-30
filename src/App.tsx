import { Outlet, ScrollRestoration } from 'react-router-dom'

function App() {
  return (
    <>
      {/* New pages open at the top; back/forward restores the old position. */}
      <ScrollRestoration />
      <Outlet />
    </>
  )
}

export default App
