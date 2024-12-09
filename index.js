const { ethers } = require("ethers");
const { NonceManager } = ethers;

// Configuración del proveedor y contrato de Aave en Base Mainnet
const provider = new ethers.JsonRpcProvider("https://blast.gateway.tenderly.co/5yGcUWjtMCxxz5YoLUD0sH");

// Dirección y ABI del Aave LendingPool en Base
const aaveLendingPoolAddress = "0xa70B0F3C2470AbBE104BdB3F3aaa9C7C54BEA7A8"; // Dirección de Aave
const lendingPoolAbi = [
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserAccountData",
    "outputs": [
      { "internalType": "uint256", "name": "totalCollateralBase", "type": "uint256" },
      { "internalType": "uint256", "name": "totalDebtBase", "type": "uint256" },
      { "internalType": "uint256", "name": "availableBorrowsBase", "type": "uint256" },
      { "internalType": "uint256", "name": "currentLiquidationThreshold", "type": "uint256" },
      { "internalType": "uint256", "name": "ltv", "type": "uint256" },
      { "internalType": "uint256", "name": "healthFactor", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Instancia del contrato de Aave LendingPool
const lendingPool = new ethers.Contract(aaveLendingPoolAddress, lendingPoolAbi, provider);

// Configuración de la wallet
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
const signer = new NonceManager(wallet.connect(provider));

// Dirección y ABI del contrato FlashLoan
const flashLoanContractAddress = "0xb177CfCbAc6EF5353CB5aFaa9C5A8B9Ce6700E52"; // Dirección de tu contrato
const flashLoanContractAbi = [
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
    ],
    "name": "callattack",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Crear la instancia del contrato de flashloan
const flashLoanContract = new ethers.Contract(flashLoanContractAddress, flashLoanContractAbi, signer);

const userAddresses = [
  "0x0F6e98A756A40dD050dC78959f45559F98d3289d",
  "0xf6c9f3062D0d7Bb4E99228aA6030df929219BaC3",
  "0xE51748456ea9759C19D232A32F96bA3c1C110776",
  "0xafd94316995Bd0dc8B6c54f7794bC36961904e72",
  "0x6Fc993bE4FAF3d30517B00679389fE76dC8187d6",
  "0x193B92fb0f3cac8B9A11C44233b2C7e07c3F6b9b",
  "0x9D45d92D4F4850fd91C70D97ee9c2A9B4b151d1A",
  "0xa1B04dd16ad6b29b3f151e0A04944A070f5d0DD2",
  "0x0A46dbbbE111EFCB20C3C4a375c87e5f9Fa4CC8d",
  "0xcaee487a37B6565892cBcC7CE1e9D0ecAB31396a",
  "0x78fBd92bDed9383eDb78c6f403F8bF0b8BF883A8",
  "0xa98797D52344DB92D004B980F08e0d4eFA04fc20",
  "0x0d0A72BBB6710F540B93bb8Ad8E2cBf203515c53",
  "0xbb176a3Ef8e7213f92E1011A6BC96d45662A0104",
  "0x9FDaC23e9bcF2b577eA2BAaDC316ecb6619d4450",
  "0x2b5F543Dfff77eAFA203370663002c9C85165253",
  "0x0F6e98A756A40dD050dC78959f45559F98d3289d",
  "0x1e5af0088716407ABAC8cC3283797C87A3A4d3F7",
  "0x31DE21d4b449e7b7BE7a445afB9EEDc350Cc570A",
  "0x4019D293e32764376ceE1edbe79055e0496fBda4",
  "0x605175a47D4F63eDAf209254878dBf0F7c74E58D",
  "0xA9E7Cf8979e432CE235830bEB0447FEb683591eB",
  "0xbD16C73a08544d916e53Ad1ba342f08d23994776",
  "0x0125054443c774AC1009187b54bd6B035ee4C61a",
  "0x922803FB3D6addDEA0D4AA76FDf4AcD8252a8d1F",
  "0xEa8D5bcf2d033c7FD2F4a2b9F364B8Ac5dfF658a",
  "0x98e0e710d6B75c82Be92D32B7a0A10ad9b452427",
  "0xFf768D53F1C652F321075a14967a423221467908",
  "0xFf67eD25226632D065Bc68018A977101D50E3F1c",
  "0xa248c4160bfef88763ad45Af3b97249F4C8fe153",
  "0x21dA8E4373A1e0f403F64B142Aa0DD6260315AB7",
  "0xBAf019E5512462fA224a0a351e3675D5879f6001",
  "0x33020Db041980Cef52f469b3B73286e1813f7F29",
  "0x78fBd92bDed9383eDb78c6f403F8bF0b8BF883A8",
  "0xAc03BF9a0d32f0297A58C4d4e96f6426E5f19B76",
  "0xe602585A21a898c7900578848B6DE1E7e4bA2347",
  "0xEac9e00278e5C89247faF64B525Ba1a161D82EB0",
  "0x799f660455B457bD345D185Ae7206e59C1e604e2",
  "0xe66e1E9E37E4e148b21Eb22001431818E980d060",
  "0x6dC743840C41bA1474c4DB2e807c6F31C390954d",
  "0x3Dfc19E7f25fE1dDDA05b07F803eBFd4aadae4bF",
  "0xF8969A9315CCbc18b8D19247EbcD06A2A00ae82b",
  "0x4Bc10a13A35565107BA0D6A0B273e163ef1Fb746",
  "0xD3fdC98D610349f5C94D9C341D878403721C7D34",
  "0x7cA69AC0DB7CdA38B633E796610D8151782E3C38",
  "0xF457ff54Bafa1ba885fbE66Fb0dBF8db43655d72",
  "0x9CcD2536a2Ba3d30489263Bf73c54FC11dd13D89",
  "0x13E6c8F0F86910deF52AA43d6A635760684A8B2f",
  "0xC6Bf4f14E48192106CB901ad8954184bf01C1AF9",
  "0x44A24DeE8a8e57927aA7627B02F5576aFFFEB964",
  "0xA54f450E8e94ABB275D50fa266136AC1c47fDB7B",
  "0x6f63B52CC363cBc5d7b487d2b15B77C861724e3C",
  "0x46193F7235e41D17592e1a8BCCda016d276F3524",
  "0xc33255d608a94713d5e5A53AA4843931a2d2Ee79",
  "0xee1D6A47208527858769980D3d932Ca897705cA2",
  "0xc92BC4995eC172Cae2596E1732Cf398bfd6ceA35",
  "0xbA4C1B0C30A76FDf7dD2382B35252902eE79d2c7",
  "0x4bab59dcFb7A23fe90e1E6E7c66436FaeEd8A639",
  "0xdeB51faF2c2bC458193b85B565C55f0C0BFf92df",
  "0xee162031A5f2d89D302068cB5ba8097eE611F5fB",
  "0xB7ABF0FD4053B68BeE51340Ec11FEBc0BC2bd5d6",
  "0x9E50069c599FFEF2C919CF98004874064C34164C",
  "0x7596d0f64081F8AF189915da2d02D4e09a1d979A",
  "0x87b394D8832a1b00170f5238d7CCd67dc68c4223"
];

async function monitorHealthFactor(userAddress) {
  try {
    const data = await lendingPool.getUserAccountData(userAddress);
    const healthFactor = ethers.formatUnits(data.healthFactor, 18);

    console.log(`Health Factor actual para ${userAddress}: ${healthFactor}`);
    if (parseFloat(healthFactor) < 1) {
      console.log(`HF < 1. Ejecutando flashloan para ${userAddress}...`);
      await executeLoan(userAddress);
    }
  } catch (error) {
    console.error(`Error al obtener datos para la dirección ${userAddress}:`, error);
  }
}

async function executeLoan(userAddress) {
  try {
    // Obtener las tarifas de gas
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.utils.parseUnits("0.0001", "gwei"); // Default a 20 Gwei si no hay gasPrice

    // Ejecutar el flashloan
    const tx = await flashLoanContract.callattack(userAddress, {
      gasLimit: 1923072, // Ajusta según el contrato
      gasPrice: gasPrice
    });

    console.log(`Transacción enviada: ${tx.hash}`);
    await tx.wait();
    console.log(`Flashloan ejecutado exitosamente para ${userAddress}`);
  } catch (error) {
    console.error(`Error al ejecutar el flashloan para ${userAddress}:`, error);
  }
}

async function monitorMultipleAddresses() {
  while (true) {
    try {
      for (let userAddress of userAddresses) {
        await monitorHealthFactor(userAddress);
      }
    } catch (error) {
      console.error("Error en el monitoreo:", error);
    }
  }
}

// Iniciar el monitoreo continuo
(async () => {
  await monitorMultipleAddresses();  // Inicia el monitoreo
})();
