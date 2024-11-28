// import { setCookie,  getCookie} from "./cookie.js"; 
// import { transaction } from "./transaction";
import {connectWallet,disconnectWallet} from "./wallet.js"

window.onload = function(){

    document.getElementById('connect-wallet').addEventListener('click',connectWallet)
    document.getElementById('disconnect-wallet').addEventListener('click',disconnectWallet)
}