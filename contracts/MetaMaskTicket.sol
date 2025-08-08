// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MetaMaskTicket
 * @dev A simple ERC721-based NFT contract for MetaMask-compatible, non-transferable tickets with check-in functionality
 */
contract MetaMaskTicket is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    mapping(uint256 => address) public ticketOwner;
    mapping(uint256 => bool) public isCheckedIn;

    event TicketMinted(uint256 indexed tokenId, address indexed to, string tokenUri);
    event TicketCheckedIn(uint256 indexed tokenId, address indexed owner);

    constructor() ERC721("MetaMask Ticket", "MMTIX") Ownable(msg.sender) {}

    function mintTo(address to, string memory tokenUri) external onlyOwner returns (uint256 tokenId) {
        tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);

        ticketOwner[tokenId] = to;

        emit TicketMinted(tokenId, to, tokenUri);
    }

    function checkIn(uint256 tokenId) external {
        require(_exists(tokenId), "Ticket does not exist");
        require(ticketOwner[tokenId] == msg.sender, "Not authorized to check in");
        require(!isCheckedIn[tokenId], "Ticket already checked in");

        isCheckedIn[tokenId] = true;

        emit TicketCheckedIn(tokenId, msg.sender);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Prevents transfer — makes the ticket soulbound
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        // Allow minting only
        require(from == address(0), "Ticket is non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
