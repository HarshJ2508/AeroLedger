import { Upload, X } from "lucide-react";
import { useState } from "react"
import { uploadToPinata } from "../utils/ipfsUpload";
import { base64ToFile } from "../utils/base64ToFile";
import IpfsViewer from "./IpfsViewer";
import Loader from "../components/Loader";

const form = [
  {
    label: 'Flight Number',
    id: 'flightNumber',
    type: 'text',
    placeholder: 'Enter Flight Number (Ex. FL123)'
  },
  {
    label: 'Source',
    id: 'source',
    type: 'text',
    placeholder: 'Enter Origin of Flight (Ex. Mumbai)'
  },
  {
    label: 'Destination',
    id: 'destination', 
    type: 'text',
    placeholder: 'Enter Destination of Flight (Ex. Delhi)'
  },
  {
    label: 'Departure Time',
    id: 'departureTime',
    type: 'date',
    placeholder: 'Enter Departure Time'
  },
  {
    label: 'Total Seats',
    id: 'seats',
    type: 'number',
    placeholder: 'Enter Seats Avaiable (Ex. 125)'
  },
  {
    label: 'Fare',
    id: 'fare',
    type: 'number',
    placeholder: 'Enter Fare of Flight (Ex. 0.001)'
  },
];

type FormType = {
  flightNumber: string;
  source: string;
  destination: string;
  departureTime: string,
  seats: number;
  fare: number;
}

const MintTickets = () => {
  const [formData, setFormData] = useState<FormType>({
    flightNumber: '',
    source: '',
    destination: '',
    departureTime: '',
    seats: 0,
    fare: 0,
  });
  const [nftImage, setNftImage] = useState<string>(''); 
  const [metadataUri, setMetaDataUri] = useState<string>('');
  const [loadStatus, setLoadStatus] = useState<String>('');

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value, 
    }));
  };

  const handleFileInputClick = () => {
    const fileInput = document.getElementById('nft-img') as HTMLInputElement;
    if(fileInput) {
      fileInput.click();
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (!selectedFile) return;
  
    const reader = new FileReader();
    reader.onload = () => {
      setNftImage(reader.result as string);
    };
    reader.readAsDataURL(selectedFile); 
  };

  const clearImageInput = () => {
    if(nftImage) setNftImage('');
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoadStatus('Preparing files....');

    for(const key in formData) {
      if(formData[key as keyof FormType] === '' || formData[key as keyof FormType] === 0) return;
    }
    console.log(formData, nftImage);

    try {
      const imageFile = await base64ToFile(nftImage, 'ticket-image.png');
      setLoadStatus('Uploading to IPFS....')
      const metadataUri = await uploadToPinata(
        formData,
        imageFile,
        "Vistara Airlines"
      );
      setMetaDataUri(metadataUri);
    } catch (error) {
      console.log(error);
    }

    setLoadStatus('');
  }   

  return (
    <div className="mt-10 flex h-full gap-10 justify-between">
      {loadStatus ? (
        <div className="w-full h-[500px] flex flex-col gap-10 justify-center items-center">
          <Loader />
          <p className="text-xl uppercase">
            {loadStatus}
          </p>
        </div>
      ) :
      metadataUri ? (
        <IpfsViewer ipfsUrl={metadataUri} /> 
      ):
      (
        <>
          <div 
            className="w-[500px] flex flex-col justify-center items-center bg-opacity-50 bg-blue-950 h-[570px] rounded-3xl cursor-pointer hover:bg-blue-900 hover:bg-opacity-50 duration-200 transition-all border-[2px] border-blue-900 gap-2"
            onClick={handleFileInputClick}
          >
            {nftImage ? (
                <div className="w-full h-full relative">
                    <img 
                      src={nftImage}
                      className="w-full h-full object-cover" 
                      alt="NFT Preview"
                    />
                    <button 
                      className="absolute top-[-15px] right-[-15px] flex justify-center items-center w-8 h-8 bg-red-400 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearImageInput();
                      }}
                    >
                      <X />
                    </button>
                </div>
              ):
              (
                <>
                  <div className="bg-blue-600 p-5 rounded-full">
                    <Upload className="w-16 h-16 " />
                  </div>
                  <div className="text-2xl mt-4">Drag and drop media</div>
                  <div className="text-blue-500 text-xl underline">Browse Files</div>
                  <div className="text-xl text-red-400">Max size: 1MB</div>
                  <div className="text-lg tracking-wide">JPG, PNG, GIF, SVG</div>
                  <input 
                    id="nft-img"
                    type="file" 
                    className="hidden"
                    accept=".jpg, .png, .gif, .svg"
                    onChange={(event) => handleFileInputChange(event)}
                  />
                </>
              )
            }
          </div>
          <div className="w-1/2 flex flex-col gap-4">
            {form.map((data) => {
                return (
                  <div 
                    key={data.id} 
                    className="flex flex-col"
                  >
                    <label className="text-md font-medium">{data.label}</label>
                    <input 
                      id={data.id}
                      name={data.id}
                      type={data.type} 
                      placeholder={data.placeholder}
                      value={formData[data.id as keyof FormType]}
                      onChange={handleFormChange}
                      className={`bg-opacity-50 bg-blue-950 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all
                        ${data.type === 'date' ? 'cursor-pointer hover:bg-blue-900 hover:bg-opacity-50' : ''}`}
                      min={data.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
                    />
                  </div>
              )})
            }
            <button 
              onClick={handleSubmit}
              className="mt-2 bg-blue-600 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Mint Tickets
            </button>
          </div>
        </>
        )
      }
    </div>
  )
}

export default MintTickets;