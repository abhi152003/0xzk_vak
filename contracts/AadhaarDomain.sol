
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

interface IAnonAadhaarGroth16Verifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[9] calldata publicInputs
    ) external view returns (bool);
}

interface IAnonAadhaar {
    function verifyAnonAadhaarProof(
        uint nullifierSeed,
        uint nullifier,
        uint timestamp,
        uint signal,
        uint[4] memory revealArray,
        uint[8] memory groth16Proof
    ) external view returns (bool);
}

contract AnonAadhaar is IAnonAadhaar {
    address public verifier;
    uint256 public immutable storedPublicKeyHash;

    // Struct to store verification details
    struct UserData {
        bool[4] revealed;  // Array to hold reveal flags
        bool age;          // Whether age is revealed
        bool gender;       // Whether gender is revealed
        uint pincode;      // Revealed pincode
        uint state;        // Revealed state
    }

    // Mapping from address to UserData
    mapping(address => UserData) public userData;

     // Array to store all verified addresses
    address[] public verifiedAddresses;
    
    // Event to emit when a new verification is stored
    event VerificationStored(address indexed user, bool verified, uint timestamp);

    constructor(address _verifier, uint256 _pubkeyHash) {
        verifier = _verifier;
        storedPublicKeyHash = _pubkeyHash;
    }

    // Original verifyAnonAadhaarProof function remains unchanged
    function verifyAnonAadhaarProof(
        uint nullifierSeed,
        uint nullifier,
        uint timestamp,
        uint signal,
        uint[4] calldata revealArray,
        uint[8] calldata groth16Proof
    ) public view returns (bool) {
        uint signalHash = _hash(signal);
        return
            IAnonAadhaarGroth16Verifier(verifier).verifyProof(
                [groth16Proof[0], groth16Proof[1]],
                [
                    [groth16Proof[2], groth16Proof[3]],
                    [groth16Proof[4], groth16Proof[5]]
                ],
                [groth16Proof[6], groth16Proof[7]],
                [
                    storedPublicKeyHash,
                    nullifier,
                    timestamp,
                    revealArray[0],
                    revealArray[1],
                    revealArray[2],
                    revealArray[3],
                    nullifierSeed,
                    signalHash
                ]
            );
    }

    function verifyAndStoreProof(
        uint nullifierSeed,
        uint nullifier,
        uint timestamp,
        uint signal,
        uint[4] calldata revealArray,
        uint[8] calldata groth16Proof
    ) public returns (bool success) {
        // First verify the proof
        bool isValid = verifyAnonAadhaarProof(
            nullifierSeed,
            nullifier,
            timestamp,
            signal,
            revealArray,
            groth16Proof
        );

        // Only store if verification is successful
        if (isValid) {
            UserData memory user;

            user.revealed = [revealArray[0] != 0, revealArray[1] != 0, revealArray[2] != 0, revealArray[3] != 0];
            user.age = revealArray[0] == 1;  // Example mapping for age
            user.gender = revealArray[1] == 77;  // Example mapping for gender, male =1, female=0
            user.pincode = revealArray[2] != 0 ? revealArray[2] : 0;  // Example mapping for pincode
            user.state = revealArray[3] != 0 ? revealArray[3] : 0;  // Example mapping for state

            userData[msg.sender] = user;
            // Add the user address to the verified addresses list
            verifiedAddresses.push(msg.sender);

            emit VerificationStored(msg.sender, true, timestamp);
            return true;
        }

        return false;
    }

    function _hash(uint256 message) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(message))) >> 3;
    }

    // Function to get the number of verified addresses
    function getVerifiedAddressesLength() public view returns (uint256) {
        return verifiedAddresses.length;
    }
}
