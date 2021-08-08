import greeterAbi from "../artifacts/contracts/Greeter.sol/Greeter.json";
import registrationAbi from "../artifacts/contracts/Registration.sol/Registration.json";
import documentAbi from "../artifacts/contracts/Document.sol/Document.json";

const abis = {
  greeter: greeterAbi.abi,
  registration: registrationAbi.abi,
  document: documentAbi.abi,
};

export default abis;
