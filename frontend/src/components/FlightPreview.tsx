import { useState, useEffect } from 'react';
import { Plane, Clock, ArrowLeft, ExternalLink, MapPin, Building, Ticket } from 'lucide-react';

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

const FlightPreview = ({
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
    const [nftImage, setNftImage] = useState<string>('');
    const [nftMetadata, setNftMetadata] = useState<any>(null);
    const ethPrice = Number.parseFloat(fare) / 10 ** 18;
    const GATEWAY_URL = import.meta.env.VITE_PINATA_GATEWAY_URL;

    const formattedDate = new Date(departureTime * 1000).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
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
        const fetchNFTData = async () => {
            try {
                const response = await fetch(GATEWAY_URL + metadataURI);
                const data = await response.json();
                setNftImage(data.image);
                setNftMetadata(data);
            } catch (error) {
                console.error('Failed to fetch NFT data:', error);
            }
        }
        fetchNFTData();
    }, []);

    return (
        <div className="min-h-[80vh]">
            <button
                onClick={() => setFlightPreview(null)}
                className="flex items-center gap-2 py-2 mb-8 text-blue-200 transition-colors rounded-lg hover:text-blue-400"
            >
                <ArrowLeft className="w-5 h-5" />
                <p className='text-lg'>Back to all flights</p>
            </button>

            <div className="grid grid-cols-[2fr_1fr] gap-8">
                {/* Ticket Container */}
                <div className="p-6 space-y-8 bg-gradient-to-br from-blue-900/50 to-blue-950/50 border border-blue-800/30 rounded-xl">
                    {/* Flight Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Plane className="w-6 h-6 text-blue-200" />
                                <h1 className="text-2xl font-bold text-blue-200">
                                    <span className='tracking-wide'>Flight</span> #{tokenId}
                                </h1>
                            </div>
                            <span className="px-4 py-1 mt-2 text-md text-center font-medium text-blue-300 rounded-full bg-blue-900/30 border border-blue-800/30">
                                {flightNumber}
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-2 mb-2">
                                <Clock className="w-5 h-5 text-blue-300" />
                                <p className="text-lg font-medium">{formattedDate}</p>
                            </div>
                            <p className="text-blue-300 font-semibold">{formattedTime}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 mb-6 rounded-lg bg-blue-300/10">
                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-5 h-5 text-blue-300" />
                                <p className="text-sm text-blue-300">From</p>
                            </div>
                            <p className="text-2xl font-medium">{source}</p>
                        </div>
                        <div className="flex-1 px-8">
                            <div className="relative flex items-center justify-center">
                                <div className="w-full h-px bg-blue-300" />
                                <Plane className="absolute w-8 h-8 text-blue-300 rotate-90" />
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-5 h-5 text-blue-300" />
                                <p className="text-sm text-blue-300">To</p>
                            </div>
                            <p className="text-2xl font-medium">{destination}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Building className="w-5 h-5 text-blue-400" />
                                <p className="text-sm text-blue-400">Operated by</p>
                            </div>
                            <p className="text-lg font-medium">{airline}</p>
                        </div>
                        <div className="text-right">
                            <p className="mb-2 text-2xl font-bold">
                                {Number(ethPrice.toFixed(6))} ETH
                            </p>
                            {inrPrice && (
                                <p className="text-lg text-blue-400">
                                    ≈ ₹{inrPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <button className="w-full px-4 py-3 text-lg font-semibold text-blue-950 transition-colors rounded-lg bg-blue-400 hover:bg-blue-500 hover:text-blue-100">
                            Buy Ticket
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-900/50 to-blue-950/50 border border-blue-800/30 rounded-xl">
                    {nftMetadata && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-blue-300" />
                                    <h2 className="text-xl font-semibold text-blue-300">NFT Ticket</h2>
                                </div>
                                <a
                                    href={GATEWAY_URL + metadataURI}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-md text-blue-300 hover:text-blue-300"
                                >
                                    View Metadata
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                            {nftImage && (
                                <div className="overflow-hidden rounded-lg border border-blue-800/30">
                                    <img
                                        src={nftImage}
                                        alt="Flight NFT"
                                        className="w-full h-auto"
                                        style={{ maxHeight: '100%' }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FlightPreview;
