import {
  AnonAadhaarProof,
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

export default function Home({ setUseTestAadhaar, useTestAadhaar }: HomeProps) {
  const [anonAadhaar] = useAnonAadhaar();
  const [, latestProof] = useProver();

  const [selectedFields, setSelectedFields] = useState({
    revealAgeAbove18: false,
    revealGender: false,
    revealState: false,
    revealPinCode: false
  });
  const [domainName, setDomainName] = useState("");

  useEffect(() => {
    if (anonAadhaar.status === "logged-in") {
      console.log(anonAadhaar.status);
    }
  }, [anonAadhaar]);

  const switchAadhaar = () => {
    setUseTestAadhaar(!useTestAadhaar);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      return signer;
    } catch (error) {
      console.error("User rejected connection:", error);
      return null;
    }
  };

  const VERIFIER_ADDRESS = "0x6bE8Cec7a06BA19c39ef328e8c8940cEfeF7E281";
  const VERIFIER_ABI = [{ "inputs": [{ "internalType": "address", "name": "_verifier", "type": "address" }, { "internalType": "uint256", "name": "_pubkeyHash", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "storedPublicKeyHash", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "verifier", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "nullifierSeed", "type": "uint256" }, { "internalType": "uint256", "name": "nullifier", "type": "uint256" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "internalType": "uint256", "name": "signal", "type": "uint256" }, { "internalType": "uint256[4]", "name": "revealArray", "type": "uint256[4]" }, { "internalType": "uint256[8]", "name": "groth16Proof", "type": "uint256[8]" }], "name": "verifyAnonAadhaarProof", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }];


  const handleDomainRegistration = async () => {
    if (anonAadhaar.status !== "logged-in") {
      alert("Please verify your Aadhar first!");
      return;
    }

    if (!latestProof) {
      alert("Please generate a proof first!");
      return;
    }

    console.log(latestProof)

    const { proof, claim } = latestProof;

    // Format the groth16 proof array
    const groth16Proof = [
      proof.groth16Proof.pi_a[0],
      proof.groth16Proof.pi_a[1],
      proof.groth16Proof.pi_b[0][0],
      proof.groth16Proof.pi_b[0][1],
      proof.groth16Proof.pi_b[1][0],
      proof.groth16Proof.pi_b[1][1],
      proof.groth16Proof.pi_c[0],
      proof.groth16Proof.pi_c[1]
    ];

    // Format reveal array (0 for not revealed, 1 for revealed)
    const revealArray = [
      claim.ageAbove18 ? 1 : 0,
      claim.gender ? 1 : 0,
      claim.pincode ? 1 : 0,
      claim.state ? 1 : 0
    ];


    try {
      const signer = await connectWallet();
      if (!signer) return;

      const verifierContract = new ethers.Contract(VERIFIER_ADDRESS, VERIFIER_ABI, signer);

      console.log(proof)

      // Call verifyAnonAadhaarProof instead of verifyProof
      const isValid = await verifierContract.verifyAnonAadhaarProof(
        proof.nullifierSeed,
        proof.nullifier,
        proof.timestamp,
        proof.signalHash,
        revealArray,
        groth16Proof
      );

      console.log(isValid)

      if (isValid) {
        console.log("Proof verified successfully");
        // Proceed with domain registration
      } else {
        console.error("Proof verification failed");
      }
    } catch (error) {
      console.error("Error verifying proof:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      {/* Hero Section */}
      <header className="text-center mb-16 pt-8">
        <h1 className="text-5xl font-bold mb-4 text-[#00008B]">
          AadhaarDomain
        </h1>
        <p className="text-xl text-[#1E4B9C] mb-6">
          Get your verified .aadhaar.base.eth domain powered by Anon Aadhaar
        </p>
        <div className="max-w-2xl mx-auto text-[#666666] space-y-4">
          <p>
            AadharDomain enables Indian citizens to claim their digital identity on Base
            while maintaining privacy through zero-knowledge proofs.
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

      <main className="flex flex-col items-center gap-8">
        {/* Main Card */}
        <div className="bg-white rounded-2xl max-w-screen-sm mx-auto p-8 border border-[#1E4B9C] shadow-xl">
          <h2 className="font-semibold text-xl mb-6 text-center text-[#00008B]">
            Verify & Register Your Domain
          </h2>

          {/* Proof Selection Form */}
          <div className="w-full max-w-md mx-auto mb-8">
            <h3 className="font-semibold mb-4 text-[#1E4B9C]">Choose Verification Details:</h3>
            <div className="space-y-3">
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

          {/* Aadhar Verification Button */}
          <div className="flex justify-center mb-8">
            <LogInWithAnonAadhaar
              nullifierSeed={1234}
              fieldsToReveal={Object.entries(selectedFields)
                .filter(([_, value]) => value)
                .map(([key]) => key as keyof typeof selectedFields)}
            />
          </div>

          {/* Domain Registration Form */}
          {anonAadhaar.status === "logged-in" && (
            <div className="w-full max-w-md mx-auto space-y-4">
              <h3 className="font-semibold text-[#1E4B9C]">Register Your Domain</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  placeholder="Enter your desired domain name"
                  className="flex-1 rounded-md border border-[#1E4B9C] px-3 py-2 text-[#666666] placeholder-gray-400"
                />
                <span className="py-2 text-[#666666]">.aadhaar.base.eth</span>
              </div>
              <button
                onClick={handleDomainRegistration}
                className="w-full rounded-md bg-[#1E4B9C] px-4 py-2 text-white hover:bg-[#00008B] transition-colors"
              >
                Register Domain
              </button>
            </div>
          )}

          {/* Test/Real Mode Switch */}
          <div className="mt-8 text-center">
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
          <div className="bg-white rounded-2xl max-w-screen-sm mx-auto p-8 border border-[#1E4B9C]">
            <p className="text-[#1E4B9C] text-center mb-4">✅ Aadhar Proof Generated</p>
            {latestProof && (
              <AnonAadhaarProof code={JSON.stringify(latestProof, null, 2)} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}