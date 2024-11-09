import {  CircleUserRound, Plane, Search, TicketSlash } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const navLinks = [
    {
        title: 'Create',
        path: '/create',
        icon: <TicketSlash />
    },
    {
        title: 'Search',
        path: '/search',
        icon: <Search />
    },
];

const Navbar = () => {
    const navigate = useNavigate();

  return (
    <div className="min-h-20 flex items-center justify-between border-b-[2px] border-b-blue-400 border-opacity-20 rounded-xl"> 
        <div className="text-2xl w-1/6 font-semibold">
            <button 
                onClick={() => navigate("/")} 
                className="flex items-center">
                <Plane className="h-8 w-8"/>
                AeroLedger
            </button>
        </div>
        <ul className="flex w-2/4 gap-10 tracking-wide">
            {
                navLinks.map((link, index) => {
                    return (
                        <NavLink 
                            key={index}
                            to={link.path} 
                            className={({ isActive }) =>
                                isActive
                                  ? "flex items-center gap-2"
                                  : "flex items-center gap-2 opacity-45 hover:opacity-80 transition-opacity"
                            }
                        >
                            {link.icon}
                            {link.title}
                        </NavLink>
                    );
                })
            }
        </ul>
        <button 
            className="flex items-center gap-2 ml-auto bg-white text-blue-800 px-5 py-2 rounded-lg justify-center"
            onClick={() => {}}
        >
            <CircleUserRound />
            <div className="font-semibold">Profile</div>
        </button>
    </div>
  );
};

export default Navbar;
