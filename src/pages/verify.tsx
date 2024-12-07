import {
    verify,
    init,
    artifactUrls,
    ArtifactsOrigin,
    InitArgs,
    AnonAadhaarCore,
    // Prodution public key hash from UIDAI
    productionPublicKeyHash,
    // Test public key hash from Anon Aadhaar QR Generator
    testPublicKeyHash,
} from "@anon-aadhaar/core";

async function verifyAnonAadhaarProof(anonAadhaarProof: AnonAadhaarCore) {
    // Arguments to initialise the core library
    const anonAadhaarInitArgs: InitArgs = {
        wasmURL: artifactUrls.v2.wasm,
        zkeyURL: artifactUrls.v2.zkey,
        vkeyURL: artifactUrls.v2.vk,
        artifactsOrigin: ArtifactsOrigin.server,
    };

    // Initialize the core library with the above arguments
    await init(anonAadhaarInitArgs);

    // Call the verify function from the core library.
    // Will verify the Groth16 proof and public signals.
    if (!(await verify(anonAadhaarProof)))
        throw Error("[verifyAnonAadhaarProof]: Your proof is not a valid proof.");
    // Verify that the signing public corresponf to the official UIDAI public key.
    if (!(productionPublicKeyHash === anonAadhaarProof.proof.pubkeyHash))
        throw Error(
            "[verifyAnonAadhaarProof]: The document was not signed with the Indian government public key."
        );
    // Verify that the proof was signed less than 1 hour ago.
    if (
        !(
            Math.floor(Date.now() / 1000) - Number(anonAadhaarProof.proof.timestamp) <
            3600
        )
    )
        throw Error(
            "[verifyAnonAadhaarProof]: Your QR must have been signed less than 1 hour ago."
        );
    // Verify that the nullifier seed is the same as the one used to generate the proof.
    if (
        !(
            anonAadhaarProof.proof.nullifierSeed ===
            process.env.NEXT_PUBLIC_NULLIFIER_SEED!
        )
    )
        throw Error(
            "[verifyAnonAadhaarProof]: Your must generate a proof from authorised frontend."
        );
    // Verify that the user is over 18 years old.
    if (!(anonAadhaarProof.proof.ageAbove18 !== "1"))
        throw Error(
            "[verifyAnonAadhaarProof]: Your must be over 18 to access this service."
        );

    return true;
}

export default verifyAnonAadhaarProof;