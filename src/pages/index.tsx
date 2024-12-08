import ConnectWalletWithENS from "@/components/ConnectWalletWithENS";
import {
  LogInWithAnonAadhaar,
  useAnonAadhaar,
  useProver,
} from "@anon-aadhaar/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

type HomeProps = {
  setUseTestAadhaar: (state: boolean) => void;
  useTestAadhaar: boolean;
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

const VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || " ";
const VERIFIER_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_verifier",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_pubkeyHash",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "verified",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "VerificationStored",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nullifierSeed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nullifier",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "signal",
        "type": "uint256"
      },
      {
        "internalType": "uint256[4]",
        "name": "revealArray",
        "type": "uint256[4]"
      },
      {
        "internalType": "uint256[8]",
        "name": "groth16Proof",
        "type": "uint256[8]"
      }
    ],
    "name": "verifyAndStoreProof",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "storedPublicKeyHash",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userData",
    "outputs": [
      {
        "internalType": "bool",
        "name": "age",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "gender",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "pincode",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "state",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "verifiedAddresses",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "verifier",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nullifierSeed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nullifier",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "signal",
        "type": "uint256"
      },
      {
        "internalType": "uint256[4]",
        "name": "revealArray",
        "type": "uint256[4]"
      },
      {
        "internalType": "uint256[8]",
        "name": "groth16Proof",
        "type": "uint256[8]"
      }
    ],
    "name": "verifyAnonAadhaarProof",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

type UserVerificationData = {
  age: boolean;
  gender: boolean;
  pincode: bigint;
  state: bigint;
} | null;

export default function Home({ setUseTestAadhaar, useTestAadhaar }: HomeProps) {
  const [anonAadhaar] = useAnonAadhaar();
  const [, latestProof] = useProver();

  const [selectedFields, setSelectedFields] = useState({
    revealAgeAbove18: false,
    revealGender: false,
    revealState: false,
    revealPinCode: false
  });
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [userVerificationData, setUserVerificationData] = useState<UserVerificationData>(null);

  useEffect(() => {
    if (anonAadhaar.status === "logged-in") {
      console.log(anonAadhaar.status);
    }
  }, [anonAadhaar]);

  const switchAadhaar = () => {
    setUseTestAadhaar(!useTestAadhaar);
  };

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const verifierContract = new ethers.Contract(VERIFIER_ADDRESS, VERIFIER_ABI, signer);
      const userAddress = await signer.getAddress();
      const userData = await verifierContract.userData(userAddress);
      
      setUserVerificationData({
        age: userData[0],
        gender: userData[1],
        pincode: userData[2],
        state: userData[3]
      });

      return signer;
    } catch (error) {
      console.error("User rejected connection:", error);
      return null;
    }
  };


  const handleVerifyProof = async () => {
    if (anonAadhaar.status !== "logged-in") {
      alert("Please verify your Aadhar first!");
      return;
    }

    if (!latestProof) {
      alert("Please generate a proof first!");
      return;
    }

    const { proof } = latestProof;

    // Format the groth16 proof array
    const groth16Proof = [
      proof.groth16Proof.pi_a[0],
      proof.groth16Proof.pi_a[1],
      proof.groth16Proof.pi_b[0][1],
      proof.groth16Proof.pi_b[0][0],
      proof.groth16Proof.pi_b[1][1],
      proof.groth16Proof.pi_b[1][0],
      proof.groth16Proof.pi_c[0],
      proof.groth16Proof.pi_c[1]
    ];

    // Format reveal array (0 for not revealed, 1 for revealed)
    const revealArray = [
      proof.ageAbove18,
      proof.gender,
      proof.pincode,
      proof.state
    ];


    try {
      const signer = await connectWallet();
      if (!signer) return;

      const verifierContract = new ethers.Contract(VERIFIER_ADDRESS, VERIFIER_ABI, signer);

      // console.log("input: ", [
      //   proof.nullifierSeed,
      //   proof.nullifier,
      //   proof.timestamp,
      //   1,
      //   revealArray,
      //   groth16Proof
      // ])

      // Call verifyAnonAadhaarProof instead of verifyProof
      const tx = await verifierContract.verifyAndStoreProof(
        proof.nullifierSeed,
        proof.nullifier,
        proof.timestamp,
        1,
        revealArray,
        groth16Proof,
        { gasLimit: 1000000 }
      );

      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      if (receipt.status === 1) {
        setVerificationMessage("✅ Proof verified successfully!");
      } else {
        setVerificationMessage("❌ Proof verification failed.");
      }
    } catch (error) {
      console.error("Error verifying proof:", error);
      setVerificationMessage("❌ An error occurred during verification.");
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      {/* Hero Section */}
      <header className="text-center mb-12 pt-8">
        <h1 className="text-5xl font-bold mb-4 text-[#00008B]">
          AadhaarDomain
        </h1>
        <p className="text-xl text-[#1E4B9C] mb-6">
          Connect your ENS name with Aadhaar verification powered by Anon Aadhaar
        </p>
        <div className="max-w-2xl mx-auto text-[#666666] space-y-4">
          <p>
            AadhaarDomain enables Indian citizens to link their digital identity
            with their ENS name while maintaining privacy through zero-knowledge proofs.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#1E4B9C]">✓</span>
              <span>Privacy Preserved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#1E4B9C]">✓</span>
              <span>Sybil Resistant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#1E4B9C]">✓</span>
              <span>Decentralized Identity</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Restructured for better spacing */}
      <main className="flex flex-col items-center gap-6 max-w-screen-sm mx-auto">
        {/* Connect Wallet - Centered */}
        <div className="w-full flex justify-center mb-4">
          <ConnectWalletWithENS />
        </div>

        {/* Main Card - Adjusted padding and width */}
        <div className="bg-white rounded-2xl w-full p-6 border border-[#1E4B9C] shadow-xl">
          <h2 className="font-semibold text-xl mb-4 text-center text-[#00008B]">
            Connect ENS Name with Aadhaar Verification
          </h2>

          {/* Proof Selection Form - Adjusted spacing */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-[#1E4B9C]">Choose Verification Details:</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(selectedFields).map((field) => (
                <label key={field} className="flex items-center space-x-2 text-[#666666]">
                  <input
                    type="checkbox"
                    checked={selectedFields[field as keyof typeof selectedFields]}
                    onChange={(e) => setSelectedFields(prev => ({
                      ...prev,
                      [field]: e.target.checked
                    }))}
                    className="rounded border-[#1E4B9C] text-[#1E4B9C] focus:ring-[#1E4B9C]"
                  />
                  <span>{field.replace(/([A-Z])/g, ' $1').replace('reveal', '')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Add this before the LogInWithAnonAadhaar component */}
          {userVerificationData && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3 text-[#1E4B9C]">Your Verification Status:</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <span>{userVerificationData.age ? "✅" : "❌"}</span>
                  <span>Age Verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>{userVerificationData.gender ? "✅" : "❌"}</span>
                  <span>Gender Verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>{userVerificationData.pincode > 0n ? "✅" : "❌"}</span>
                  <span>Pincode Verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>{userVerificationData.state > 0n ? "✅" : "❌"}</span>
                  <span>State Verification</span>
                </div>
              </div>
            </div>
          )}

          {/* Aadhar Verification Button */}
          <div className="flex justify-center mb-6">
            <LogInWithAnonAadhaar
              nullifierSeed={1234}
              fieldsToReveal={Object.entries(selectedFields)
                .filter(([_, value]) => value)
                .map(([key]) => key as keyof typeof selectedFields)}
            />
          </div>

          {/* Test/Real Mode Switch */}
          <div className="text-center">
            <p className="text-sm text-[#666666] mb-2">
              Currently using: <strong>{useTestAadhaar ? "Test" : "Real"}</strong> Aadhaar mode
            </p>
            <button
              onClick={switchAadhaar}
              type="button"
              className="rounded bg-[#1E4B9C] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#00008B] transition-colors"
            >
              Switch to {useTestAadhaar ? "Real" : "Test"} Mode
            </button>
          </div>
        </div>

        {/* Proof Display Section */}
        {anonAadhaar.status === "logged-in" && (
          <div className="bg-white rounded-2xl w-full p-6 border border-[#1E4B9C]">
            <p className="text-[#1E4B9C] text-center mb-4">✅ Aadhar Proof Generated</p>
            <div className="flex justify-center">
              <button
                onClick={handleVerifyProof}
                type="button"
                className="rounded bg-[#1E4B9C] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#00008B] transition-colors"
              >
                Verify Proof
              </button>
            </div>
            {verificationMessage && (
              <p className="text-center mt-4 text-lg text-[#1E4B9C]">{verificationMessage}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}