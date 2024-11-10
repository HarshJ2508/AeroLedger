import { BrowserProvider, Contract, JsonRpcSigner, parseEther } from 'ethers';
import contractDetails from '../consts/contractDetails';

type FormType = {
    flightNumber: string;
    source: string;
    destination: string;
    departureTime: string,
    seats: number;
    fare: number;
}

interface TransactionEvent {
    event: string;
    args: Array<any>;
}

interface TransactionReceipt {
    blockHash: any;
    events?: Array<TransactionEvent>;
    transactionHash: string;
}

declare global {
    interface Window {
        ethereum?: any;
    }
}

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


export const createFlightTransaction = async (formData: FormType, metadataUri: string) => {
    try {
        const CONTRACT_ADDRESS = contractDetails.contractAddress;
        const CONTRACT_ABI = contractDetails.contractABI;

        if (!window.ethereum) {
            throw new Error("Please install MetaMask!");
        }

        // Input validation
        if (!formData.flightNumber || !formData.source || !formData.destination) {
            throw new Error("All flight details must be provided");
        }

        if (formData.seats <= 0) {
            throw new Error("Total seats must be greater than 0");
        }

        if (!metadataUri) {
            throw new Error("Metadata URI cannot be empty");
        }

        const departureTime = new Date(formData.departureTime).getTime();
        if (departureTime <= Date.now()) {
            throw new Error("Departure time must be in the future");
        }

        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        // Create a provider and signer
        const provider = new BrowserProvider(window.ethereum);
        const signer: JsonRpcSigner = await provider.getSigner();
        const address = await signer.getAddress();

        // Create contract instance
        const contract = new Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
        );

        // Convert departure time to Unix timestamp
        const departureTimestamp = Math.floor(departureTime / 1000);

        // Convert price to Wei (assuming price is in ETH)
        const priceInWei = parseEther(formData.fare.toString());

        // Create flight transaction
        console.log("Creating flight with parameters:", {
            flightNumber: formData.flightNumber,
            departureTimestamp,
            source: formData.source,
            destination: formData.destination,
            priceInWei: priceInWei.toString(),
            seats: formData.seats,
            metadataUri
        });

        const tx = await contract.createFlight(
            formData.flightNumber,
            departureTimestamp,
            formData.source,
            formData.destination,
            priceInWei,
            formData.seats,
            metadataUri
        );
        console.log("Txn: ", tx);

        // Wait for transaction to be mined
        const receipt = await tx.wait() as TransactionReceipt;
        console.log("Receipt: ", receipt);

        // Find the FlightCreated event
        const event = receipt.events?.find((event: TransactionEvent) => event.event === 'FlightCreated');
        console.log(event);

        if (event) {
            const [flightId, flightNumber, totalSeats] = event.args;
            return {
                success: true,
                flightId: flightId.toString(),
                flightNumber,
                totalSeats: totalSeats.toString()
            };
        }

        return {
            success: true,
            hash: receipt.blockHash
        };

    } catch (error: any) {
        console.error("Error creating flight:", error);
        if (error.message.includes("Not authorized")) {
            throw new Error("Your address is not authorized to create flights. Please contact the contract owner.");
        }
        throw new Error(error.message || "Failed to create flight");
    }
};


export const getFlightDetails = async (tokenIds: number[]): Promise<Flight[]> => {
    try {
        const CONTRACT_ADDRESS = contractDetails.contractAddress;
        const CONTRACT_ABI = contractDetails.contractABI;

        if(!window.ethereum) throw new Error("Please install MetaMask!");

        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            provider
        );

        const flightPromises = tokenIds.map(async (tokenId) => { // fetch flightDetails for each token
            const flight = await contract.flights(tokenId);
            
            return {
                id: flight.id.toString(),
                flightNumber: flight.flightNumber,
                departureTime: Number(flight.departureTime),
                source: flight.source,
                destination: flight.destination,
                remainingSeats: Number(flight.remainingSeats),
                totalSeats: Number(flight.totalSeats),
                price: flight.price.toString(),
                isActive: flight.isActive,
                airline: flight.airline,
                metadataURI: flight.metadataURI
            };
        });

        const flights = await Promise.all(flightPromises);
        return flights;

    } catch (error: any) {
        console.error("Error fetching flight details:", error);
        throw new Error(error.message || "Failed to fetch flight details");
    }
};



interface PurchaseTicketParams {
    flightId: number;
    quantity: number;
    price: string; // Price in ETH
}

interface PurchaseTicketResult {
    success: boolean;
    transactionHash: string;
    quantity: number;
    flightId: number;
}

export const purchaseTicket = async ({
    flightId,
    quantity,
    price
}: PurchaseTicketParams): Promise<PurchaseTicketResult> => {
    console.log(flightId, quantity, price);
    try {
        const CONTRACT_ADDRESS = contractDetails.contractAddress;
        const CONTRACT_ABI = contractDetails.contractABI;

        if (!window.ethereum) {
            throw new Error("Please install MetaMask!");
        }

        // Input validation
        if (flightId < 0) {
            throw new Error("Invalid flight ID");
        }

        if (quantity <= 0) {
            throw new Error("Quantity must be greater than 0");
        }

        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        // Create a provider and signer
        const provider = new BrowserProvider(window.ethereum);
        const signer: JsonRpcSigner = await provider.getSigner();

        // Create contract instance
        const contract = new Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
        );

        // Calculate total price in Wei
        const priceInWei = parseEther(price);
        const totalPrice = priceInWei * BigInt(quantity);

        // Purchase tickets
        console.log("Purchasing tickets with parameters:", {
            flightId,
            quantity,
            totalPrice: totalPrice.toString()
        });

        const tx = await contract.purchaseTickets(
            flightId,
            quantity,
            {
                value: totalPrice // Send ETH with the transaction
            }
        );

        console.log("Transaction:", tx);

        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log("Receipt:", receipt);

        // Find the TicketPurchased event
        const event = receipt.events?.find(
            (event: { event: string }) => event.event === 'TicketPurchased'
        );

        if (!event) {
            throw new Error("Ticket purchase event not found in transaction receipt");
        }

        return {
            success: true,
            transactionHash: receipt.hash,
            quantity,
            flightId
        };

    } catch (error: any) {
        console.error("Error purchasing ticket:", error);
        
        // Handle specific error cases
        if (error.message.includes("Flight is not active")) {
            throw new Error("This flight is no longer available for booking");
        }
        if (error.message.includes("Not enough tickets available")) {
            throw new Error("The requested number of tickets is not available");
        }
        if (error.message.includes("Insufficient funds")) {
            throw new Error("Insufficient funds to complete the purchase");
        }
        if (error.message.includes("Flight has departed")) {
            throw new Error("Cannot purchase tickets for a departed flight");
        }

        throw new Error(error.message || "Failed to purchase ticket");
    }
};