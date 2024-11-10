import { useState, useEffect } from 'react';
import { Plane, Clock, ExternalLink } from 'lucide-react';

type Props = {
    tokenId: string;
    flightNumber: string;
    source: string;
    destination: string;
    fare: string;
    airline: string;
    metadataURI: string;
    departureTime: number;
    setFlightPreview: React.Dispatch<React.SetStateAction<number | null>>;
}

const FlightCard = ({
    tokenId,
    flightNumber,
    source,
    destination,
    fare,
    airline,
    metadataURI,
    departureTime,
    setFlightPreview,
}: Props) => {
    const [inrPrice, setInrPrice] = useState<number | null>(null);
    const ethPrice = Number.parseFloat(fare) / 10 ** 18;
    const GATEWAY_URL = import.meta.env.VITE_PINATA_GATEWAY_URL;
    const [nftImage, setNftImage] = useState<string>('');

    const formattedDate = new Date(departureTime * 1000).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    const formattedTime = new Date(departureTime * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    useEffect(() => {
        const fetchEthPrice = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr');
                const data = await response.json();
                const ethToInr = data.ethereum.inr;
                setInrPrice(ethToInr * ethPrice * 100);
            } catch (error) {
                console.error('Failed to fetch ETH price:', error);
            }
        };
        
        fetchEthPrice();
    }, [ethPrice]);

    useEffect(() => {
        const fetchNFTImage = async () => {
            try {
                const response = await fetch(GATEWAY_URL + metadataURI);
                const data = await response.json();
                setNftImage(data.image);
            } catch (error) {
                console.error('Failed to fetch NFT Image:', error);
            }
        }
        fetchNFTImage();
    }, []);

    return (
        <button
            onClick={() => setFlightPreview(Number.parseInt(tokenId) - 2)}
            className="relative w-full p-6 transition-all duration-300 rounded-xl bg-gradient-to-br from-blue-900/50 to-blue-950/50 hover:from-blue-800/50 hover:to-blue-900/50 backdrop-blur-sm border border-blue-800/30 hover:border-blue-700/50 group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-blue-400" />
                    <span className="text-lg font-semibold text-blue-400">
                        Flight #{tokenId}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <div className="text-right">
                        <p className="text-sm font-medium">{formattedDate}</p>
                        <p className="text-xs text-blue-400">{formattedTime}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-6 mb-6">
                {nftImage && (
                    <div className="relative w-24 h-24 overflow-hidden rounded-lg border border-blue-800/30">
                        <img 
                            src={nftImage} 
                            alt="Flight NFT" 
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                        />
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <div className="text-left">
                        <p className="mb-1 text-sm text-blue-400">From</p>
                        <p className="text-lg font-medium">{source}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <div className="w-16 h-px bg-blue-400" />
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                    </div>
                    <div className="text-left">
                        <p className="mb-1 text-sm text-blue-400">To</p>
                        <p className="text-lg font-medium">{destination}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div className="text-left">
                    <p className="text-sm text-blue-400">Operated by</p>
                    <p className="text-sm font-medium truncate">{airline}</p>
                    <a
                        href={GATEWAY_URL + metadataURI}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        View Metadata
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <div className="text-right">
                    <p className="mb-1 text-xl font-semibold">
                        {Number(ethPrice.toFixed(6))} ETH
                    </p>
                    {inrPrice && (
                        <p className="text-sm text-blue-400">
                            ≈ ₹{inrPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </p>
                    )}
                </div>
            </div>
        </button>
    );
};

export default FlightCard;