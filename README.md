# 🦄 uwuVote - Solana Voting Platform

A cute and functional decentralized voting application built on Solana using Anchor framework and Next.js. Create campaigns, cast votes, and see results in real-time! ✨

![uwuVote Banner](https://via.placeholder.com/800x200/FF6B9D/FFFFFF?text=uwuVote+%F0%9F%A6%84)

## 🌟 Features

- ✅ **Create Voting Campaigns** - Set up campaigns with custom descriptions and poll options
- 🗳️ **Secure Voting** - One vote per wallet address per campaign
- 📊 **Real-time Results** - View live vote counts and campaign status
- ⏰ **Time-based Campaigns** - Set campaign duration (1 hour to 1 year)
- 🎨 **Beautiful UI** - Modern, responsive interface with dark/light mode
- 🔐 **Wallet Integration** - Phantom and Solflare wallet support
- 🌐 **Localnet Ready** - Fully configured for local Solana development

## 🏗️ Project Structure

```
uwuVote/
├── uwuProgram/           # Anchor program (Rust smart contract)
│   ├── programs/
│   │   └── solana-voting/
│   │       └── src/
│   │           └── lib.rs
│   ├── Anchor.toml
│   └── Cargo.toml
├── client/               # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── package.json
└── README.md
```

## 🧱 1. Setup Local Solana Environment

### Install Prerequisites

First, install the Solana CLI and Anchor CLI if not already installed:

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"

# Install Anchor CLI
npm install -g @coral-xyz/anchor-cli
# or
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
```

### Start Local Validator

Start the local Solana validator:

```bash
solana-test-validator
```

> 💡 **Tip**: Keep this terminal window open! The validator needs to stay running for the entire development session.

### Configure Solana CLI

In a separate terminal, set the Solana CLI config to localnet:

```bash
solana config set --url http://127.0.0.1:8899
```

Confirm your local balance (should show ~500M SOL):

```bash
solana balance
```

## 📦 2. Build and Deploy Anchor Program

Navigate to the Anchor project directory:

```bash
cd uwuProgram
```

### Build the Program

```bash
anchor build
```

This will generate:
- The `.so` program binary in `target/deploy/solana_voting.so`
- The IDL file in `target/idl/solana_voting.json`

### Deploy the Smart Contract

```bash
anchor deploy
```

> 📝 **Note**: The program ID is already configured as `DEwjDB522WETWNoVWwa3W1rTvoX2Zs4DZPaSpzmny3M7` in the code. If you need to change it, update both `lib.rs` and `Anchor.toml`.

### Optional: Run Tests

```bash
anchor test
```

## 🪪 3. Client Setup (Next.js Frontend)

Navigate to the Next.js project folder:

```bash
cd client
```

### Install Dependencies

```bash
npm install --force
```

> ⚠️ **Note**: We use `--force` to resolve React 19 peer dependency conflicts with Solana wallet adapters.

### Start the Development Server

```bash
npm run dev
```

The app should now be running at: **http://localhost:3000** 🎉

## 🦄 4. Wallet Setup & Airdrop

### Setup Phantom Wallet

1. **Install Phantom Wallet** extension in your browser
2. **Create or import** a wallet
3. **Switch to Localnet**:
   - Open Phantom Settings
   - Go to "Developer Settings"
   - Change Network to "Custom RPC"
   - Enter: `http://127.0.0.1:8899`

### Fund Your Wallet

**Option 1: Direct Airdrop**
```bash
solana airdrop 10 <YOUR_WALLET_ADDRESS>
```

**Option 2: Transfer from CLI Wallet**
```bash
solana transfer <PHANTOM_WALLET_ADDRESS> 10 --allow-unfunded-recipient
```

> 💰 **Tip**: Your CLI wallet starts with ~500M SOL by default on localnet!

## 📸 5. Usage Screenshots & Guide

### 🏠 Homepage - Connect Wallet
![Connect Wallet](https://via.placeholder.com/600x400/E8F4FF/1E40AF?text=Connect+Your+Wallet+%F0%9F%91%9B)

The landing page prompts users to connect their Solana wallet (Phantom or Solflare).

### 📝 Create a Campaign
![Create Campaign](https://via.placeholder.com/600x400/F0FDF4/16A34A?text=Create+Campaign+%F0%9F%93%9D)

**Features:**
- Campaign description (required)
- Multiple poll options (2-10 options)
- Duration selection (1 hour to 1 year)
- Real-time form validation
- Success toast with campaign ID

**Example Campaign:**
- Description: "What should our next community event be?"
- Options: ["Virtual Meetup", "Hackathon", "Workshop Series"]
- Duration: 7 days

### 🗳️ Vote on Campaigns
![Vote Interface](https://via.placeholder.com/600x400/FEF3C7/D97706?text=Cast+Your+Vote+%F0%9F%97%B3%EF%B8%8F)

**Features:**
- Campaign selector dropdown
- Dynamic poll options based on selected campaign
- Vote count display for each option
- Duplicate vote prevention
- Success confirmation with transaction signature

### 📊 Campaign List & Results
![Campaign Results](https://via.placeholder.com/600x400/FDF2F8/BE185D?text=Campaign+Results+%F0%9F%93%8A)

**Features:**
- All active and expired campaigns
- Real-time vote counts
- Campaign status (Active/Ended)
- Creator information
- Leading option highlight
- Refresh functionality

## 🔐 6. Environment Setup

The app is pre-configured for localnet, but you can customize settings:

### Optional: Environment Variables

Create a `.env.local` file in the `client` folder if you need custom configuration:

```env
NEXT_PUBLIC_PROGRAM_ID=DEwjDB522WETWNoVWwa3W1rTvoX2Zs4DZPaSpzmny3M7
NEXT_PUBLIC_SOLANA_NETWORK=http://127.0.0.1:8899
```

### Program ID Configuration

The program ID is already configured in multiple places:
- `uwuProgram/programs/solana-voting/src/lib.rs` (line 3)
- `uwuProgram/Anchor.toml` (line 9)
- `client/lib/idl.json` (address field)

If you redeploy and get a new program ID, update these files accordingly.

## 🎮 7. Development Workflow

### Typical Development Session

1. **Start Local Validator**
   ```bash
   solana-test-validator
   ```

2. **Deploy/Redeploy Program** (when smart contract changes)
   ```bash
   cd uwuProgram
   anchor build && anchor deploy
   ```

3. **Start Frontend**
   ```bash
   cd client
   npm run dev
   ```

4. **Test in Browser**
   - Connect wallet at http://localhost:3000
   - Create test campaigns
   - Vote with different wallets
   - Check results

### Making Changes

**Smart Contract Changes:**
- Edit `uwuProgram/programs/solana-voting/src/lib.rs`
- Run `anchor build && anchor deploy`
- Copy new IDL to `client/lib/idl.json` if needed

**Frontend Changes:**
- Edit files in `client/` directory
- Changes auto-reload with Next.js hot reload

## 🎀 8. Final Notes & Tips

### ⚠️ Important Warnings

- **Stay on Localnet**: Don't switch between devnet/localnet mid-session
- **Keep Validator Running**: The `solana-test-validator` must stay active
- **Wallet Network**: Ensure Phantom is set to localnet (http://127.0.0.1:8899)
- **One Vote Rule**: Each wallet can only vote once per campaign

### 🚀 Extending the dApp

This project is a great foundation for more advanced features:

- **DAO Voting**: Add governance token requirements
- **NFT-based Eligibility**: Require specific NFT ownership to vote
- **Weighted Voting**: Implement vote weight based on token holdings
- **Multi-signature Campaigns**: Require multiple approvals to create campaigns
- **IPFS Integration**: Store large campaign data off-chain
- **Mobile Support**: Add Solana Mobile wallet adapter

### 🧪 Testing

Run the Anchor test suite:

```bash
cd uwuProgram
anchor test
```

### 🐛 Common Issues

**"Program not found" Error:**
- Ensure `solana-test-validator` is running
- Check that the program was deployed successfully
- Verify the program ID matches in all configuration files

**Wallet Connection Issues:**
- Make sure Phantom is on the correct network (localnet)
- Try refreshing the page after connecting
- Check that you have enough SOL for transactions

**Transaction Failures:**
- Ensure you're not trying to vote twice on the same campaign
- Check that the campaign hasn't expired
- Verify you have sufficient SOL for transaction fees

### 🆘 Getting Help

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify all services are running (validator + frontend)
3. Ensure wallet is properly connected to localnet
4. Review the Anchor program logs in the validator terminal

---

## 🎉 Happy Voting!

You now have a fully functional Solana voting dApp! Create campaigns, gather votes, and see democracy in action on the blockchain. 

Made with 💖 using Solana, Anchor, and Next.js

---

**Contributors:** Manobendra Mandal
**License:** MIT  
**Solana Program ID:** `DEwjDB522WETWNoVWwa3W1rTvoX2Zs4DZPaSpzmny3M7`
