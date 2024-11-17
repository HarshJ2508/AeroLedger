import { CircleChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const Welcome = () => {
    const navigate = useNavigate();
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div 
            className="relative mt-10 flex flex-col min-h-[80vh]"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="flex flex-col gap-6 w-full justify-center items-center h-[70vh] relative">
                <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    className="text-lg bg-blue-950/50 text-blue-100 px-4 py-2 rounded-2xl backdrop-blur-sm border border-blue-800/30 hover:bg-blue-900/50 transition-colors duration-300"
                >
                    # NFT Ticketing
                </motion.div>
                
                <motion.div 
                    variants={itemVariants}
                    className="space-y-4 text-center"
                >
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                        <motion.h1 
                            className="text-6xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
                        >
                            Book Your
                        </motion.h1>
                        <motion.div 
                            className="relative"
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            initial={{ rotate: -3 }}
                        >
                            <h1 className="text-6xl font-bold bg-blue-600 px-6 py-3 rounded-xl shadow-lg">
                                Tickets
                            </h1>
                        </motion.div>
                    </div>
                    <motion.div variants={itemVariants}>
                        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-blue-400">
                            with AeroLedger
                        </h1>
                    </motion.div>
                </motion.div>
                
                <motion.p 
                    variants={itemVariants}
                    className="max-w-2xl text-center mt-8 text-xl text-blue-100/90 leading-relaxed"
                >
                    Revolutionizing air travel with secure NFT tickets and blockchain-powered 
                    flight management for a seamless, transparent experience.
                </motion.p>
                
                <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative mt-12 cursor-pointer"
                    onClick={() => navigate("/search")}
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg blur opacity-70 group-hover:opacity-100 transition duration-200"></div>
                    <button className="relative flex items-center gap-2 px-8 py-3 bg-blue-950 rounded-lg hover:bg-blue-900 transition-colors duration-300">
                        <span className="text-xl font-medium">Explore Now</span>
                        <CircleChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                </motion.div>
                
            </div>
        </motion.div>
    )
}

export default Welcome