import { Connection, PublicKey } from '@solana/web3.js';
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

const walletBalances = {
    SOL: 0,  // 模擬的 SOL 餘額
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
    
    let currentCurrency = 'SOL'; // 預設為 SOL

    const wallet = await window.solana.connect();
    const walletPublicKey = wallet.publicKey;
    await getWalletBalances(walletPublicKey);
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
    confirmDepositBtn.addEventListener('click', () => {
        alert(`Deposited ${depositSlider.value} ${currentCurrency} into the game.`);
        // 更新餘額
        walletBalances[currentCurrency] -= parseFloat(depositSlider.value);
        updateSlider();
    });

    // 返回按鈕事件
    backToGameDeposit.addEventListener('click', () => {
        gameUI.style.display = 'block';
        depositContainer.style.display = 'none';
    });



}


async function getWalletBalances(walletPublicKey) {
    const solBalance = await connection.getBalance(walletPublicKey) / 1_000_000_000;

    const BONK_MINT = new PublicKey("92cbrjAnwQJfW7PKePEGpnFpPZEF3WPCTtMUa2wDEnfN");

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