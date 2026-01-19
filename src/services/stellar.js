import StellarSdk from 'stellar-sdk';

// Initialize Stellar server based on network
const getServer = () => {
  const horizonUrl = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
  return new StellarSdk.Server(horizonUrl);
};

// Get network passphrase
const getNetworkPassphrase = () => {
  return process.env.STELLAR_NETWORK_PASSPHRASE || 
    (process.env.STELLAR_NETWORK === 'mainnet' 
      ? 'Public Global Stellar Network ; September 2015'
      : 'Test SDF Network ; September 2015');
};

// Create a new keypair
export const createKeypair = () => {
  return StellarSdk.Keypair.random();
};

// Get account info from Stellar network
export const getAccount = async (publicKey) => {
  try {
    const server = getServer();
    return await server.loadAccount(publicKey);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('Account not found');
    }
    throw error;
  }
};

// Build and submit a transaction
export const submitTransaction = async (sourceKeypair, operations, memo = null) => {
  try {
    const server = getServer();
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: getNetworkPassphrase()
    });

    // Add operations
    operations.forEach(op => transaction.addOperation(op));

    // Add memo if provided
    if (memo) {
      transaction.addMemo(StellarSdk.Memo.text(memo));
    }

    // Set timeout (optional)
    transaction.setTimeout(30);

    // Build and sign
    const tx = transaction.build();
    tx.sign(sourceKeypair);

    // Submit
    const result = await server.submitTransaction(tx);
    return {
      success: true,
      hash: result.hash,
      ledger: result.ledger,
      transaction: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
};

// Create a payment operation
export const createPayment = (destination, amount, asset = StellarSdk.Asset.native()) => {
  return StellarSdk.Operation.payment({
    destination,
    asset,
    amount: amount.toString()
  });
};

// Create an asset
export const createAsset = (code, issuer) => {
  return new StellarSdk.Asset(code, issuer);
};

// Issue an asset (create trustline and payment)
export const issueAsset = async (issuerKeypair, recipientPublicKey, assetCode, amount) => {
  const server = getServer();
  const recipientAccount = await getAccount(recipientPublicKey);
  
  const asset = new StellarSdk.Asset(assetCode, issuerKeypair.publicKey());
  
  // Check if trustline exists, if not create it
  const hasTrustline = recipientAccount.balances.some(
    balance => balance.asset_code === assetCode && balance.asset_issuer === issuerKeypair.publicKey()
  );

  const operations = [];

  if (!hasTrustline) {
    operations.push(
      StellarSdk.Operation.changeTrust({
        asset: asset
      })
    );
  }

  operations.push(
    StellarSdk.Operation.payment({
      destination: recipientPublicKey,
      asset: asset,
      amount: amount.toString()
    })
  );

  return await submitTransaction(issuerKeypair, operations);
};

// Fund account (testnet only)
export const fundAccount = async (publicKey) => {
  if (process.env.STELLAR_NETWORK !== 'testnet') {
    throw new Error('Account funding only available on testnet');
  }

  try {
    const response = await fetch(
      `https://friendbot.stellar.org/?addr=${publicKey}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to fund account: ${error.message}`);
  }
};

// Get transaction details
export const getTransaction = async (hash) => {
  const server = getServer();
  return await server.transactions().transaction(hash).call();
};

// Get account transactions
export const getAccountTransactions = async (publicKey, limit = 10) => {
  const server = getServer();
  return await server.transactions()
    .forAccount(publicKey)
    .limit(limit)
    .order('desc')
    .call();
};

export default {
  getServer,
  getNetworkPassphrase,
  createKeypair,
  getAccount,
  submitTransaction,
  createPayment,
  createAsset,
  issueAsset,
  fundAccount,
  getTransaction,
  getAccountTransactions
};
