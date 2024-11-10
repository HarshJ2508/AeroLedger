import { useEffect, useState } from "react"
import { getFlightDetails } from "../utils/flightService";
import Loader from "../components/Loader";
import FlightCard from "../components/FlightCard";
import FlightPreview from "../components/FlightPreview";

interface Flight {
  id: string;
  flightNumber: string;
  departureTime: number;
  source: string;
  destination: string;
  remainingSeats: number;
  totalSeats: number;
  price: string;
  isActive: boolean;
  airline: string;
  metadataURI: string;
}

const Search = () => {
  const [flights, setFlights] = useState<Flight[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [flightPreview, setFlightPreview] = useState<number | null>(null);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const flightResults = await getFlightDetails([3]);
      setFlights(flightResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  useEffect(() => {
    console.log(flights);
  }, [flights])

  if(loading) return (
    <div className="w-full h-[500px] flex flex-col gap-10 justify-center items-center">
      <Loader />
      <p className="text-xl uppercase">
        Fetching Flight Details from Blockchain....
      </p>
    </div>
  );
  if(error) return <div>Error: {error}</div>;
  if(!flights) return <div>No flights found</div>;

  return (
    <div className="mt-10">
      
      {
        flightPreview ? (
          <FlightPreview 
            tokenId={flights[flightPreview - 1].id}  
            departureTime={flights[flightPreview - 1].departureTime}
            flightNumber={flights[flightPreview - 1].flightNumber}
            source={flights[flightPreview - 1].source}
            destination={flights[flightPreview - 1].destination}
            fare={flights[flightPreview - 1].price}
            airline={flights[flightPreview - 1].airline}
            metadataURI={flights[flightPreview - 1].metadataURI.replace('ipfs://', '')}
            totalSeats={flights[flightPreview - 1].totalSeats}
            remaningSeats={flights[flightPreview - 1].remainingSeats}
            setFlightPreview={setFlightPreview}
          />
        ):
        (
          <>
            <h1 className="text-2xl font-semibold mb-10">Flights Details</h1>
            <div className="grid grid-cols-3 gap-4">
              {flights.map((flight, index) => (
                <FlightCard 
                  key={index}
                  tokenId={flight.id}  
                  departureTime={flight.departureTime}
                  flightNumber={flight.flightNumber}
                  source={flight.source}
                  destination={flight.destination}
                  fare={flight.price}
                  airline={flight.airline}
                  metadataURI={flight.metadataURI.replace('ipfs://', '')}
                  setFlightPreview={setFlightPreview}
                />
              ))}
            </div>
          </>
        )
      }
    </div>
  );
};

export default Search;