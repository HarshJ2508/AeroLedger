import { Route, Routes } from "react-router-dom"
import Profile from "./pages/Profile"
import Search from "./pages/Search"
import Layout from "./pages/Layout"
import MintTickets from "./pages/MintTickets"

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/create" element={<MintTickets />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App