import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Layout = () => {
  return (
    <div className="w-[100vw] h-screen text-white bg-gradient-to-b from-blue-950 to-black">
      <div className='w-[1400px] h-full px-10 mx-auto overflow-hidden'>
        <Navbar />
        <Outlet />
      </div>
    </div>
  )
}

export default Layout