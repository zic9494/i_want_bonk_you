// import { setCookie,  getCookie} from "./cookie.js"; 
// import { transaction } from "./transaction";
import { smoothScroll } from "./PageScroll.js"
import {connectWallet,disconnectWallet} from "./wallet.js"

window.onload = function(){
    document.getElementById('connect-wallet').addEventListener('click',connectWallet)
    document.getElementById('disconnect-wallet').addEventListener('click',disconnectWallet)
}

document.querySelectorAll('.navbar a').forEach(anchor => {
    anchor.addEventListener('click', function(e){
        e.preventDefault()
        var targetID = this.getAttribute('href')
        smoothScroll(targetID, 1000) // 呼叫捲動函式(ID, time(ms))
    })
})