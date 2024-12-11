import { Connection,PublicKey,Keypair,Transaction
        ,SystemProgram,sendAndConfirmTransaction,
        TransactionInstruction, } from '@solana/web3.js';
import { createTransferInstruction } from '@solana/spl-token';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor'; 
import idl from '../idl/idl.json'; // 您的 IDL 檔案
import { Buffer } from 'buffer';



const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

//調用合約會需要的參數
const BONK_MINT = new PublicKey("GGmKGGs29t8k3WEpFJkWrsLLymHzbC8CSEAXyjUfGcEM");
const tokenProgramId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const rentSysvarId = new PublicKey("SysvarRent111111111111111111111111111111111");
const counter = new PublicKey("3ms6Hz7JkPm6NFGFdwkXgnAMXitMQHKrJjytvSXLomTJ");

const provider = new AnchorProvider(connection, {
    publicKey: null,
    signAllTransactions: (txs) => txs,
    signTransaction: (tx) => tx
}, {}); 

const walletBalances = {
    SOL: 0,  
    BONK: 0
};

export {connection,provider};



export async function setDeposit(){
    const depositContainer = document.getElementById('deposit-container');
    const depositSolBtn = document.getElementById('deposit-sol-btn');
    const depositBonkBtn = document.getElementById('deposit-bonk-btn');
    const depositSlider = document.getElementById('deposit-slider');
    const depositAmount = document.getElementById('deposit-amount');
    const currencyLabel = document.getElementById('currency-label');
    const customAmountInput = document.getElementById('custom-amount');
    const confirmDepositBtn = document.getElementById('confirm-deposit-btn');
    const backToGameDeposit = document.getElementById('back-to-game-deposit');
    const gameUI = document.getElementById('game_ui');
    const createAccountModal = document.getElementById("create-account-modal");
    const createAccountBtn = document.getElementById("create-account-btn");
    const backToDeposit = document.getElementById('back-to-deposit');
    const solBalanceText = document.querySelectorAll('.sol-balance'); 
    const bonkBalanceText = document.querySelectorAll('.bonk-balance');  //抓遊戲內所有有餘額的地方
    
    const programId = new PublicKey('EiSSSmeYvZUPSCHwQgHY27hN6WjjDQTaGXvEvX37KX8F');
    let currentCurrency = 'SOL'; // 預設為 SOL

    const wallet = await window.solana.connect();
    const walletPK = wallet.publicKey;
    provider.wallet.publicKey = walletPK;
    //user的tokenAccount
    const [tokenAccountpda,tokenAccountBump] = await PublicKey.findProgramAddress(
        [Buffer.from('token'),walletPK.toBuffer()],programId);
    //user的PDA
    const [sol_pda,bump] = await PublicKey.findProgramAddress(
        [Buffer.from('user_solana'),walletPK.toBuffer()],programId);
    //user的PDA的tokenAccount
    const [pdaTokenAccount,pdaTokenAccountBump] = await PublicKey.findProgramAddress(
        [Buffer.from('User_Bonk'),walletPK.toBuffer()],programId);


    //更新遊戲內餘額
    await updateGameBalance();
   
    //抓取錢包餘額
    await getWalletBalances(walletPK);
    
    updateSlider();

   

    // 滑動條事件
    depositSlider.addEventListener('input', () => {
        const value = parseFloat(depositSlider.value);  //string(depositSlider.value) to float(value)
        depositAmount.innerText = value.toFixed(currencyLabel.innerText === 'SOL' ? 4 : 0); //toFixed表示小數顯示位數
        customAmountInput.value = value;
    });

    // 自訂數字框
    customAmountInput.addEventListener('input', ()=>{
        if(customAmountInput.value > walletBalances[currentCurrency]){
            value = walletBalances[currentCurrency];
            alert("The amount exceeds your available balance!")
        }
        const value = parseFloat(customAmountInput.value || 0); 
        depositSlider.value = value;
        depositSlider.innerText = value.toFixed(currencyLabel.innerText === 'SOL' ? 4 : 0);
        depositAmount.innerText = value.toFixed(currentCurrency === 'SOL' ? 4 : 0);
    });

    // 切換貨幣按鈕事件
    depositSolBtn.addEventListener('click', () => {
        customAmountInput.setAttribute('step','0.0001');
        switchCurrency('SOL');
    });

    depositBonkBtn.addEventListener('click', () => {
        customAmountInput.setAttribute('step','1')
        switchCurrency('BONK')
    });

    // 確認按鈕事件
    confirmDepositBtn.addEventListener('click',async () => {
        const amount = parseFloat(customAmountInput.value || 0);
        if(amount===0){
            alert("Please enter a valid number greater than 0");
            return;
        }
        //確認是否存在PDA
        const isPdaExist = await checkIsPdaExist(tokenAccountpda);
        if(!isPdaExist){
            createAccountModal.style.display = 'flex';
        }else if(currentCurrency==='SOL'){
            const isSuccess = await transferSol(wallet,sol_pda,amount);
            if(isSuccess){
                alert("Deposit successfully");
            }else{
                alert("fail to deposit. Please try again");
            }
        }else if(currentCurrency==='BONK'){
            const isSuccess = await transferBonk(tokenAccountpda,pdaTokenAccount,wallet,amount);
            if(isSuccess){
                alert("Deposit successfully");
            }else{
                alert("fail to deposit. Please try again");
            }
        }
        await updateGameBalance();
        updateSlider();
        
    });

    createAccountBtn.addEventListener('click',async ()=>{
        
        const program = new Program(idl, programId, provider);
        const isInit = await initializeUserAllPda(tokenAccountpda,sol_pda,pdaTokenAccount,program,wallet);
        createAccountModal.style.display = 'none';
        if(isInit){
            alert("Account created successfully");
        }else{
            alert("fail to create account. Please try again");
        }
    });

    // 返回遊戲
    backToGameDeposit.addEventListener('click', () => {
        gameUI.style.display = 'block';
        depositContainer.style.display = 'none';
    });

    //返回deposit
    backToDeposit.addEventListener('click',()=>{
        createAccountModal.style.display = 'none';
    })

    //更新遊戲內餘額
    async function updateGameBalance() {
        try {
            const solPdaBalance = await connection.getBalance(sol_pda);
            solBalanceText.forEach(sol_balance =>{
                sol_balance.innerText = `${(solPdaBalance/ 1_000_000_000).toFixed(4)} SOL`;
            });
            console.log(`PDA SOL Balance: ${solPdaBalance / 1_000_000_000} SOL`);


            const bonkPdaBalance = await connection.getTokenAccountBalance(pdaTokenAccount);
            console.log(bonkPdaBalance.value.uiAmount);
            bonkBalanceText.forEach(bonk_balance =>{
                bonk_balance.innerText = `${bonkPdaBalance.value.uiAmount} BONK`;
            });
            console.log(`BONK SOL Balance: ${bonkPdaBalance.value.uiAmount} BONK`);
    
            
            
            
        } catch (err) {
            console.error("Error fetching PDA SOL balance:", err);
        }
    }


     // 更新滑動條的最大值和顯示的金額
     function updateSlider() {
        const maxBalance = walletBalances[currentCurrency];
        depositSlider.max = maxBalance;
        depositSlider.value = 0;
        customAmountInput.value = 0;
        depositAmount.innerText = depositSlider.value;  //讀取input的數字所以會隨者拉條變化
        currencyLabel.innerText = currentCurrency;

        // 設置自訂金額輸入框的範圍提示
        customAmountInput.setAttribute('max', maxBalance);
        customAmountInput.setAttribute('min', '0');
    }

    // 切換幣種
    function switchCurrency(currency) {
        currentCurrency = currency;
        depositSolBtn.classList.toggle('active', currency === 'SOL');
        depositBonkBtn.classList.toggle('active', currency === 'BONK');
        updateSlider();
    }
}

//轉Bonk
async function transferBonk(fromTokenAccount,toTokenAccount,wallet,amount) {
    try{
        const ix = createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            wallet.publicKey,
            amount,
            tokenProgramId
        )
        //打包交易
        const transaction = new Transaction().add(ix);
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;

        // 透過錢包簽名
        const signature = await window.solana.signAndSendTransaction(transaction);

        await connection.confirmTransaction(signature, "confirmed");
        console.log("Transaction confirmed with signature:", signature);
        return true;

    }catch(err){
        console.error(err);
    }
}

async function transferSol(wallet,sol_pda,amount) {
    try{
        //純轉sol的transaction
        const ix = SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: sol_pda,
            lamports: amount * 1_000_000_000,
        });

        const transaction = new Transaction().add(ix);

        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;

        const signature = await window.solana.signAndSendTransaction(transaction);

        await connection.confirmTransaction(signature, "confirmed");
        console.log("Transaction confirmed with signature:", signature);
        return true;
    }catch(err){
        console.error(err);
        return false;
    }

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
        return true;

    }catch(err){
        console.error(err);
        return false;
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