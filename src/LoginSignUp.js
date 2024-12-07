

export function setLoginAandSignUp(){ //登入註冊畫面
    
    const popup = document.getElementById('LoginSignUp-popup');
    const closeBtn = popup.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showLogin = document.getElementById('show-login');
    const showSignup = document.getElementById('show-signup');
    const loginBtn = document.getElementById('Login-btn');
    const profile = document.getElementById('profile');
    const logoutBtn = document.getElementById('Logout-btn');
    
    //保持使用者是登入狀態
    const local_user = localStorage.getItem('user_name');
    console.log(local_user);
    if(local_user!=null){

        const local_bio = localStorage.getItem('bio');
        const local_photo = localStorage.getItem('photoBase64');
        profile.style.display = 'block';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        document.getElementById('user-nickname').innerText = localStorage.getItem('nick_name');
        if (local_bio) {
            document.getElementById('user-bio-display').innerText = local_bio;
        }
        if (local_photo) {
            document.getElementById('user-avatar-image').src = local_photo;
        }
    } else {
        // 用戶未登入
        
        profile.style.display = 'none';
        loginBtn.style.display = 'block';
    }
    

    //打開跳窗
    loginBtn.addEventListener('click',()=>{
        popup.style.display = 'block';
    });
    //關閉跳窗
    closeBtn.addEventListener('click', ()=>{
        popup.style.display = 'none'
        signupForm.style.display = 'flex';
        loginForm.style.display = 'none';
    });
    //切換到註冊
    showSignup.addEventListener('click',(e)=>{
        e.preventDefault();
        signupForm.style.display = 'flex';
        loginForm.style.display = 'none';
        signupForm.classList.add('form-style');
    });
    //切換到登入
    showLogin.addEventListener('click',(e)=>{
        e.preventDefault();
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
        loginForm.classList.add('form-style');
    });

    //檢查機制...

    //處理註冊邏輯
    signupForm.addEventListener('submit',async (e)=>{
        e.preventDefault(); //自定義submit
        const user_name = signupForm.querySelector('#username').value;
        const nick_name = signupForm.querySelector('#nickname').value;
        const password = signupForm.querySelector('#password').value;
        const confirm_password = signupForm.querySelector('#confirmpassword').value;
        const newUser = {user_name,nick_name,password};
        if(password !== confirm_password){
            alert("Password doesn't match");
            return;
        }
        try{
            showLoading();
            const response = await fetch('http://localhost:3000/api/users/signup',{
                method:'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify(newUser)
            });
            hideLoading();
            if(response.ok){
                const data = await response.json();
                
                alert(data.message);
                signupForm.reset();
                popup.style.display = 'none';
                loginForm.style.display = 'flex';
                signupForm.style.display = 'none';  
            }else{
                const errData = await response.json();
                alert('Sign up failed:',errData.message);
            }
        }catch(err){
            console.error('Error:',err);
            alert('Sign up failed:',err);
        }
    });

    //處理登入邏輯
    loginForm.addEventListener('submit',async (e)=>{
        e.preventDefault();
        const user_name = loginForm.querySelector('#usernameLogin').value;
        const password = loginForm.querySelector('#passwordLogin').value;
        showLoading();
        try{

            const response = await fetch('http://localhost:3000/api/users/login',{
                method:'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    user_name,password
                })
            });
            hideLoading();
            if(response.ok){    //登入成功
                const data = await response.json();
                alert(data.message);
                await call_UserInfo(user_name);
                loginBtn.style.display = 'none';
                logoutBtn.style.display = 'block';
                popup.style.display = 'none';
                profile.style.display = 'block';
            
            }else{
                const errData = await response.json();
                alert(errData.message);
            }

        }catch(err){
            console.error('Error:',err);
            alert('Login failed:',err);
        }
    })

    //處理登出邏輯
    logoutBtn.addEventListener('click',()=>{
        localStorage.clear();
        window.location.reload();
        document.getElementById('Logout-btn').style.display = 'none';
        document.getElementById('Login-btn').style.display = 'display';
    })
}

async function call_UserInfo(user_name){  //處理登入與UserInfo交互邏輯
    const profile_name = document.getElementById('user-nickname');
    const profile_bio = document.getElementById('user-bio-display');
    const profile_photo = document.getElementById('user-avatar-image');  
    try{
        const response = await fetch(`
            http://localhost:3000/api/users/info?user_name=${encodeURIComponent(user_name)}`,{
            method:'GET',
            headers: {
                'Content-Type' : 'application/json'
            }
        });
        if(response.ok){
            const res = await response.json();
            const data = res.recordset[0];

            //將使用者資料存到localstorage
            localStorage.setItem('user_name',user_name);
            localStorage.setItem('nick_name',data.Nick_name);
            localStorage.setItem('photoBase64',data.PhotoBase64);
            localStorage.setItem('bio',data.Bio);
            profile_name.innerText = data.Nick_name;
            if (data.Bio!=null) profile_bio.innerText = data.Bio; //空就不回傳
            if (data.PhotoBase64!=null) profile_photo.src = data.PhotoBase64;
        }else{
            const errData = await response.json();
            alert(errData.message);
        }
    }catch(err){
        console.error(err);
        alert('Login failed:',err);
    }

} 

function showLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'block'; // 顯示轉圈圈
    }
}

function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'none'; // 隱藏轉圈圈
    }
}
