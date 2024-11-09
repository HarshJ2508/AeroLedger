// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AirlineTicket is Ownable {

    struct Flight {
        string flightNumber;
        uint256 departureTime;
        string source;
        string destination;
        uint256 availableSeats;
        uint256 price;
        bool isActive;
    }

    uint256 private totalFlightsCreated = 0;
    mapping (uint256 => Flight) public flightDetails;

    constructor (address initialOwner) Ownable(initialOwner) {}

    event FlightCreated(uint256 indexed flightId, string flightNumber);
    event TicketPurchased(uint256 indexed flightId, address indexed passenger);
    
    function createFlight(string memory flightNumber, uint256 departureTime, string memory source, string memory destination, uint256 price, uint256 availableSeats ) external onlyOwner returns (uint256) {
        uint256 flightId = totalFlightsCreated++;

        require(departureTime >= block.timestamp, "Invalid Departure Time");
        
        Flight memory flight = Flight({
            flightNumber: flightNumber,
            departureTime: departureTime,
            source: source,
            destination: destination,
            price: price,
            availableSeats: availableSeats,
            isActive: true 
        });

        flightDetails[flightId] = flight;
        emit FlightCreated(flightId, flightNumber);
        return flightId;
    }

    function getFlightDetails(uint flightId) external view returns (Flight memory) {
        require(flightId < totalFlightsCreated, "Invalid flight id");
        return flightDetails[flightId];
    }

    function purchaseTicket(uint256 flightId, uint256 ticketsCount) external payable  {
        Flight storage flight = flightDetails[flightId];
        require(flightId < totalFlightsCreated, "Invalid flight id");
        require(ticketsCount > 0, "Invalid ticket count");
        require(flight.availableSeats - ticketsCount >= 0, "Sorry! not enough seats left");
        require(msg.value >= flight.price * ticketsCount, "Insufficient amount");
        
        flightDetails[flightId].availableSeats -= ticketsCount;
        emit TicketPurchased(flightId, msg.sender);
    }
}
