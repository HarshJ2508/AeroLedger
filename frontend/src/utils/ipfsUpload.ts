import axios from 'axios';

interface TicketMetadata {
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

export const uploadToPinata = async (
  formData: any,
  imageFile: File,
  airlineName: string
): Promise<string> => {
  const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
  const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;

  try {
    // upload the image
    const imageFormData = new FormData();
    imageFormData.append('file', imageFile);
    
    const imageResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      imageFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    const imageUrl = `ipfs://${imageResponse.data.IpfsHash}`;

    // Create metadata
    const metadata: TicketMetadata = {
      name: `${formData.flightNumber} - ${formData.source} to ${formData.destination}`,
      description: `Flight ticket from ${formData.source} to ${formData.destination}`,
      image: imageUrl,
      properties: {
        flightNumber: formData.flightNumber,
        source: formData.source,
        destination: formData.destination,
        departureTime: formData.departureTime,
        airline: airlineName,
        totalSeats: formData.seats,
        price: formData.fare.toString()
      }
    };

    // Upload metadata
    const metadataResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    return `ipfs://${metadataResponse.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
};
