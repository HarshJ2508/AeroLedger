// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract AirTicketsNFT is ERC721URIStorage, Ownable {
    using Strings for uint256;
    
    uint256 private tokenId;
    string private baseURI;

    constructor(address initialOwner) ERC721("AirlineNFT", "ANFT") Ownable(initialOwner) {}

    struct Flight {
        uint256 id;
        string flightNumber;
        uint256 departureTime;
        string source;
        string destination;
        uint256 availableSeats;
        uint256 price;
        bool isActive;
    }

    mapping(address => bool) private isFlightOwner;
    mapping(uint256 => Flight) public ticketDetails; // tokenId -> ticket
    mapping(address => mapping(string => Flight[])) private companiesFlightDetails; // companies address -> (flightNumber -> flightDetails[])

    event TicketCreated(uint256 tokenId, string flightNumber);
    event TicketPurchased(uint256 tokenId, address buyer);

    // Set base URI for metadata
    function setBaseURI(string memory _baseURL) external onlyOwner {
        baseURI = _baseURL;
    }

    // Override _baseURI function
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setFlightOwner(address flightOwner) external onlyOwner {
        if(!isFlightOwner[flightOwner]) isFlightOwner[flightOwner] = true;
    }

    function createFlight(
        string memory flightNumber, 
        uint256 departureTime, 
        string memory source, 
        string memory destination, 
        uint256 price, 
        uint256 availableSeats,
        string memory metadataURI
    ) external {
        require(isFlightOwner[msg.sender], "Given address is not flight owner");
        require(departureTime >= block.timestamp, "Invalid Departure Time");

        for (uint256 t = 0; t < availableSeats; t++) {
            uint256 flightId = tokenId++;

            Flight memory flight = Flight({
                id: flightId,
                flightNumber: flightNumber,
                departureTime: departureTime,
                source: source,
                destination: destination,
                price: price,
                availableSeats: availableSeats,
                isActive: true
            });

            _mint(msg.sender, flightId); // Mint ticket NFT
            _setTokenURI(flightId, metadataURI); // Set metadata URI for the token
            
            companiesFlightDetails[msg.sender][flightNumber].push(flight);
            ticketDetails[flightId] = flight;
            emit TicketCreated(flightId, flightNumber);
        }
    }

    function purchaseTicket(uint256 _tokenId) external payable {
        Flight storage flight = ticketDetails[_tokenId];
        
        require(flight.isActive, "Ticket is not available for purchase");
        require(msg.value >= flight.price * 1 ether, "Insufficient funds sent");

        // Transfer the ticket (NFT) to the buyer
        address seller = ownerOf(_tokenId);
        _transfer(seller, msg.sender, _tokenId);
        
        flight.isActive = false; 
        emit TicketPurchased(_tokenId, msg.sender);
        payable(seller).transfer(msg.value);
    }

    function getFlightDetails(address company, string memory flightNumber) external view returns (Flight[] memory) {
        return companiesFlightDetails[company][flightNumber];
    }
}