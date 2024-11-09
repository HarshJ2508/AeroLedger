// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AirTicketsNFT is ERC1155, Ownable {
    using Strings for uint256;
    
    uint256 private flightIdCounter;
    string private baseURI;

    struct Flight {
        uint256 id;
        string flightNumber;
        uint256 departureTime;
        string source;
        string destination;
        uint256 remainingSeats;
        uint256 totalSeats;
        uint256 price;
        bool isActive;
        address airline; 
        string metadataURI; 
    }

    mapping(address => bool) private isFlightOwner;
    mapping(uint256 => Flight) public flights; // flightId -> flight details
    mapping(address => mapping(string => uint256[])) private companyFlights; // company -> flightNumber -> flightIds

    event FlightCreated(uint256 flightId, string flightNumber, uint256 totalSeats);
    event TicketPurchased(uint256 flightId, address buyer, uint256 quantity);

    constructor(address initialOwner) ERC1155("AeroLedger") Ownable(initialOwner) {
        _setApprovalForAll(address(this), initialOwner, true);
    }

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        return flights[tokenId].metadataURI;
    }

    function setFlightOwner(address flightOwner) external onlyOwner {
        if(!isFlightOwner[flightOwner]) {
            isFlightOwner[flightOwner] = true;
            _setApprovalForAll(address(this), flightOwner, true);
        }
    }

    function createFlight(
        string memory flightNumber,
        uint256 departureTime,
        string memory source,
        string memory destination,
        uint256 price,
        uint256 totalSeats,
        string memory metadataURI
    ) external {
        require(isFlightOwner[msg.sender], "Not authorized to create flights");
        require(departureTime > block.timestamp, "Invalid departure time");
        require(totalSeats > 0, "Seats must be greater than 0");
        require(bytes(metadataURI).length > 0, "Metadata URI cannot be empty");

        uint256 flightId = flightIdCounter++;

        Flight memory flight = Flight({
            id: flightId,
            flightNumber: flightNumber,
            departureTime: departureTime,
            source: source,
            destination: destination,
            remainingSeats: totalSeats,
            totalSeats: totalSeats,
            price: price,
            isActive: true,
            airline: msg.sender,
            metadataURI: metadataURI 
        });

        // Mint all tickets for this flight
        _mint(msg.sender, flightId, totalSeats, "");
        
        flights[flightId] = flight;
        companyFlights[msg.sender][flightNumber].push(flightId);
        
        emit FlightCreated(flightId, flightNumber, totalSeats);
    }

    function purchaseTickets(uint256 flightId, uint256 quantity) external payable {
        Flight storage flight = flights[flightId];
        
        require(flight.isActive, "Flight is not active");
        require(flight.remainingSeats >= quantity, "Not enough tickets available");
        require(msg.value >= flight.price * quantity, "Insufficient funds");
        require(block.timestamp < flight.departureTime, "Flight has departed");

        address seller = flight.airline; // Use stored airline address
        require(seller != address(0), "Invalid flight");
        
        // Transfer tickets to buyer
        _safeTransferFrom(seller, msg.sender, flightId, quantity, "");
        
        // Update remaining seats
        flight.remainingSeats -= quantity;
        
        if (flight.remainingSeats == 0) {
            flight.isActive = false;
        }
        
        emit TicketPurchased(flightId, msg.sender, quantity);
        
        // Transfer payment to seller
        payable(seller).transfer(msg.value);
    }

    function getFlightDetails(address company, string memory flightNumber) external view returns (Flight[] memory) {
        uint256[] memory flightIds = companyFlights[company][flightNumber];
        Flight[] memory flightDetails = new Flight[](flightIds.length);
        
        for (uint256 i = 0; i < flightIds.length; i++) {
            flightDetails[i] = flights[flightIds[i]];
        }
        
        return flightDetails;
    }

    function getAvailableSeats(uint256 flightId) external view returns (uint256) {
        return flights[flightId].remainingSeats;
    }
}