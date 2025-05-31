// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SiliconValleyQuizNFT is ERC721Enumerable, Ownable {
    enum Character {
        Gilfoyle,
        Richard,
        Gavin,
        Erlich
    }

    uint256 public nextTokenId;
    mapping(address => mapping(Character => bool)) public hasMintedCharacter;
    mapping(uint256 => Character) public tokenCharacter;

    string public baseURI;

    constructor(
        string memory _baseURI
    ) Ownable(msg.sender) ERC721("Silicon Valley Character", "SVCQ") {
        baseURI = _baseURI;
    }

    function mintCharacter(
        address user,
        string memory characterName
    ) external onlyOwner {
        Character character = _stringToCharacter(characterName);

        require(
            !hasMintedCharacter[user][character],
            "Already minted this character"
        );

        uint256 tokenId = nextTokenId++;
        _safeMint(user, tokenId);

        hasMintedCharacter[user][character] = true;
        tokenCharacter[tokenId] = character;
    }

    function _stringToCharacter(
        string memory name
    ) internal pure returns (Character) {
        bytes32 nameHash = keccak256(abi.encodePacked(name));

        if (nameHash == keccak256("gilfoyle")) return Character.Gilfoyle;
        if (nameHash == keccak256("richard")) return Character.Richard;
        if (nameHash == keccak256("gavin")) return Character.Gavin;
        if (nameHash == keccak256("erlich")) return Character.Erlich;

        revert("Invalid character");
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(tokenId < nextTokenId, "Nonexistent token");

        Character character = tokenCharacter[tokenId];
        return
            string(
                abi.encodePacked(
                    baseURI,
                    "/",
                    _characterToString(character),
                    ".json"
                )
            );
    }

    function _characterToString(
        Character character
    ) internal pure returns (string memory) {
        if (character == Character.Gilfoyle) return "gilfoyle";
        if (character == Character.Richard) return "richard";
        if (character == Character.Gavin) return "gavin";
        if (character == Character.Erlich) return "erlich";
        return "";
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }
}
