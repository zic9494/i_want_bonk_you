import { Connection,PublicKey,Keypair,Transaction
        ,SystemProgram,sendAndConfirmTransaction,
        TransactionInstruction, } from '@solana/web3.js';

import { Program, AnchorProvider, Wallet } from '@project-serum/anchor'; 

import idl from '../idl/idl.json'; // 您的 IDL 檔案
import { Buffer } from 'buffer';



const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const BONK_MINT = new PublicKey("DbuJVxtDKN5RCSKGBzU4JZUGqxUNCrJRnDYJd6RiLw4q");
const tokenProgramId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const rentSysvarId = new PublicKey("SysvarRent111111111111111111111111111111111");
const counter = new PublicKey("B52bgYHBYczERra5job3bdbiLHSLWsWc7Eci1px4Mipy");

const provider = new AnchorProvider(connection, {
    publicKey: null,
    signAllTransactions: (txs) => txs,
    signTransaction: (tx) => tx
}, {}); 

const walletBalances = {
    SOL: 0,  
    BONK: 0
};


export async function setDeposit(){
    const depositContainer = document.getElementById('deposit-container');
    const depositSolBtn = document.getElementById('deposit-sol-btn');
    const depositBonkBtn = document.getElementById('deposit-bonk-btn');
    const depositSlider = document.getElementById('deposit-slider');
    const depositAmount = document.getElementById('deposit-amount');
    const currencyLabel = document.getElementById('currency-label');
    const confirmDepositBtn = document.getElementById('confirm-deposit-btn');
    const backToGameDeposit = document.getElementById('back-to-game-deposit');
    const gameUI = document.getElementById('game_ui');
    const createAccountModal = document.getElementById("create-account-modal");
    const createAccountBtn = document.getElementById("create-account-btn");
    const closeBtn = document.getElementById('closeBtn');
    
    const programId = new PublicKey('CrAydyeqPc5bozC2H3MgqwZXQ3ytEyDBujWLv2yWcfVw');
    let currentCurrency = 'SOL'; // 預設為 SOL

    const wallet = await window.solana.connect();
    const walletPK = wallet.publicKey;
    provider.wallet.publicKey = walletPK;
    //user的tokenAccount
    const [tokenAccountpda,tokenAccountBump] = await PublicKey.findProgramAddress(
        [Buffer.from('token'),walletPK.toBuffer()],programId);
    //user的PDA
    const [sol_pda,bump] = await PublicKey.findProgramAddress(
        [Buffer.from('user_sol'),walletPK.toBuffer()],programId);
    //user的PDA的tokenAccount
    const [pdaTokenAccount,pdaTokenAccountBump] = await PublicKey.findProgramAddress(
        [Buffer.from('user_bonk'),walletPK.toBuffer()],programId);

    await getWalletBalances(walletPK);
    updateSlider();

    // 更新滑動條的最大值和顯示的金額
    function updateSlider() {
        depositSlider.max = walletBalances[currentCurrency];
        depositSlider.value = 0;
        depositAmount.innerText = depositSlider.value;  //讀取input的數字所以會隨者拉條變化
        currencyLabel.innerText = currentCurrency;
    }

    // 切換幣種
    function switchCurrency(currency) {
        currentCurrency = currency;
        depositSolBtn.classList.toggle('active', currency === 'SOL');
        depositBonkBtn.classList.toggle('active', currency === 'BONK');
        updateSlider();
    }

    // 滑動條事件
    depositSlider.addEventListener('input', () => {
        depositAmount.innerText = depositSlider.value;
    });

    // 切換貨幣按鈕事件
    depositSolBtn.addEventListener('click', () => switchCurrency('SOL'));
    depositBonkBtn.addEventListener('click', () => switchCurrency('BONK'));

    // 確認按鈕事件
    confirmDepositBtn.addEventListener('click',async () => {
        
        
        //確認是否存在PDA
        const isPdaExist = await checkIsPdaExist(tokenAccountpda);
        if(!isPdaExist){
            createAccountModal.style.display = 'flex';
        }
        // 更新餘額
        walletBalances[currentCurrency] += parseFloat(depositSlider.value);
        updateSlider();
    });

    createAccountBtn.addEventListener('click',()=>{
        
        const program = new Program(idl, programId, provider);
        initializeUserAllPda(tokenAccountpda,sol_pda,pdaTokenAccount,program,wallet);
        createAccountModal.style.display = 'none';
    })
    // 返回按鈕事件
    backToGameDeposit.addEventListener('click', () => {
        gameUI.style.display = 'block';
        depositContainer.style.display = 'none';
    });

    closeBtn.addEventListener('click',()=>{
        createAccountModal.style.display = 'none';
    })
}



async function initializeUserAllPda(tokenAccountpda,sol_pda,pdaTokenAccount,program,wallet) {
    try{
        const ix = await program.methods
            .addNewTokenaccount() // 無參數的情況
            .accounts({
                signer: wallet.publicKey,
                tokenAccount: tokenAccountpda,
                mint: BONK_MINT,
                systemProgram: SystemProgram.programId,
                tokenProgram: tokenProgramId,
                rent: rentSysvarId,
            })
            .instruction();

        const ix2 = await program.methods
            .initializeUserSolPda() 
            .accounts({
                signer: wallet.publicKey,
                solAccount: sol_pda,
                mint: BONK_MINT,
                counter: counter,
                systemProgram: SystemProgram.programId,
                rent: rentSysvarId,
            })
            .instruction();


        const ix3 = await program.methods
            .initializeUserTokenPda() 
            .accounts({
                signer: wallet.publicKey,
                tokenAccount: pdaTokenAccount,
                userSol : sol_pda,
                counter: counter,
                mint: BONK_MINT,
                tokenProgram: tokenProgramId,
                systemProgram: SystemProgram.programId,
                rent: rentSysvarId,
            })
            .instruction();
        
        //打包交易
        const transaction = new Transaction()
            .add(ix)
            .add(ix2)
            .add(ix3);


        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;

        // 透過錢包簽名
        const signature = await window.solana.signAndSendTransaction(transaction);

        await connection.confirmTransaction(signature, "confirmed");
        console.log("Transaction confirmed with signature:", signature);


    }catch(err){
        console.error(err);
    }
}




async function getWalletBalances(walletPublicKey) {
    const solBalance = await connection.getBalance(walletPublicKey) / 1_000_000_000;

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey,{
        mint:BONK_MINT //filter
    });

    let bonkBalance = 0;
    if(tokenAccounts.value.length>0){
        bonkBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    }
    walletBalances.BONK = bonkBalance;
    walletBalances.SOL = solBalance;
    console.log(solBalance,bonkBalance);
} 

async function checkIsPdaExist(pda) {
    try{
        const accountInfo = await connection.getAccountInfo(pda);
        console.log("accountinfo:",accountInfo);
        return accountInfo !== null;
    }catch(err){
        console.error(err);
    }
}