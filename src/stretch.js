
const end_streching = document.getElementById('stop-stretch-button')
const stretchSettingsModal = document.getElementById('stretch-settings-modal');
const confirmSettingsButton = document.getElementById('confirm-settings-button');
const modalSolBtn = document.getElementById('modal-sol-btn');
const modalBonkBtn = document.getElementById('modal-bonk-btn');
const modalCurrencyLabel = document.getElementById('modal-currency-label');
const modalBetAmount = document.getElementById('modal-bet-amount');
const neck = document.getElementById('neck');
let selectedCurrency = 'BONK';

const openSettingsButton = document.getElementById('open-settings-button');
const closeSettingsModal = document.getElementById('close-settings-modal');

export function setStretch(){

      // 打開彈窗
    openSettingsButton.addEventListener('click', () => {
        stretchSettingsModal.style.display = 'flex';
    });

     // 關閉彈窗
     closeSettingsModal.addEventListener('click', () => {
        stretchSettingsModal.style.display = 'none';
    });
    
     // 切換貨幣
     modalSolBtn.addEventListener('click', () => switchCurrency('SOL'));
     modalBonkBtn.addEventListener('click', () => switchCurrency('BONK'));

     function switchCurrency(currency) {
        selectedCurrency = currency;
        modalSolBtn.classList.toggle('active', currency === 'SOL');
        modalBonkBtn.classList.toggle('active', currency === 'BONK');
        modalCurrencyLabel.innerText = currency;
        modalBetAmount.value = 'Enter your bet';
        modalBetAmount.setAttribute('step', currency === 'SOL' ? '0.0001' : '1');
        modalBetAmount.setAttribute('min', currency === 'SOL' ? '0.0001' : '1');
    }

     // 確認設置
     confirmSettingsButton.addEventListener('click', () => {
        const betValue = parseFloat(modalBetAmount.value || 0);
        if (betValue <= 0) {
            alert('Please enter a valid bet amount!');
            return;
        }

        // 開始動畫
        neck.style.transition = 'height 2s ease-in-out';
        neck.style.height = `${50 + betValue}px`;

        stretchSettingsModal.style.display = 'none';
    });
     //伸頭
     start_streching.addEventListener("click", StretchOut)

     //縮回來
     end_streching.addEventListener("click", StretchBack)


}

async function StretchOut() {
    
    neck.classList.add('stretch');


    const resp = await fetch(
        `http://localhost:3000/api/ChangeStretch?user_name=${localStorage.getItem("user_name")}&action=true`,{
        method:'GET',
        headers: {
            'Content-Type' : 'application/json'
        }
        }
    )
    if (resp){
        start_streching.style.display = "none";
        end_streching.style.display = "inline-block";
    }
}
async function StretchBack() {
    
    neck.classList.remove('stretch');

    const resp = await fetch(
        `http://localhost:3000/api/ChangeStretch?user_name=${localStorage.getItem("user_name")}&action=`,{
        method:'GET',
        headers: {
            'Content-Type' : 'application/json'
        }
        }
    )
    if (resp){
        start_streching.style.display = "inline-block" //選其他的會跑版
        end_streching.style.display = "none"
    }
}