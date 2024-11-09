import { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink } from 'lucide-react';

interface IpfsMetadata {
  name: string;
  description: string;
  image: string;
  properties: {
    flightNumber: string;
    source: string;
    destination: string;
    departureTime: string;
    airline: string;
    totalSeats: number;
    price: string;
  };
}

const IpfsViewer = ({ ipfsUrl }: { ipfsUrl: string }) => {
  const [metadata, setMetadata] = useState<IpfsMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const GATEWAY_URL = import.meta.env.VITE_PINATA_GATEWAY_URL;

  const getIpfsHash = (url: string) => {
    return url.replace('ipfs://', '');
  };

  const getGatewayUrl = (ipfsHash: string) => {
    return `${GATEWAY_URL}${ipfsHash}`;
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const hash = getIpfsHash(ipfsUrl);
        const response = await axios.get<IpfsMetadata>(getGatewayUrl(hash));
        
        // Validate the response data
        if (!response.data || !response.data.properties) {
          throw new Error('Invalid metadata format');
        }
        
        setMetadata(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch IPFS content');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (ipfsUrl) {
      fetchMetadata();
    }
  }, [ipfsUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-blue-500">Loading IPFS content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!metadata || !metadata.properties) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-yellow-500">No metadata available</div>
      </div>
    );
  }

  return (
    <div className="bg-blue-950 bg-opacity-50 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">IPFS Content Viewer</h2>
      
      {/* Metadata Section */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Metadata</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {metadata.name}</p>
            <p><span className="font-medium">Description:</span> {metadata.description}</p>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Properties:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(metadata.properties).map(([key, value]) => (
                  <div key={key} className="bg-blue-900 bg-opacity-40 p-2 rounded">
                    <p className="text-sm font-medium text-blue-300">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-sm">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Image Preview Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Image Preview</h3>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-blue-900 bg-opacity-40">
            {metadata.image && (
              <img 
                src={getGatewayUrl(getIpfsHash(metadata.image))}
                alt={metadata.name}
                className="object-cover w-full h-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div className="mt-6 space-y-2">
        <h3 className="text-xl font-semibold mb-3">IPFS Links</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Metadata:</span>
            <a 
              href={getGatewayUrl(getIpfsHash(ipfsUrl))} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View on IPFS <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          {metadata.image && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Image:</span>
              <a 
                href={getGatewayUrl(getIpfsHash(metadata.image))} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View on IPFS <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IpfsViewer;