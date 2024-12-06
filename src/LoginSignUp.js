export function setLoginAandSignUp(){
    console.log("qwe");
    //登入註冊畫面
    const popup = document.getElementById('LoginSignUp-popup');
    const closeBtn = popup.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showLogin = document.getElementById('show-login');
    const showSignup = document.getElementById('show-signup');
    const loginBtn = document.getElementById('Login-btn');
    

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
            const response = await fetch('http://localhost:3000/api/users/signup',{
                method:'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify(newUser)
            });
            if(response.ok){
                const data = await response.json();
                alert(data.message);
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
            if(response.ok){
                const data = await response.json();
                alert(data.message);
                popup.style.display = 'none';

            }else{
                const errData = await response.json();
                alert('Login failed:',errData.message);
            }

        }catch(err){
            console.error('Error:',err);
            alert('Login failed:',err);
        }
    })

    //登入後切換頁面邏輯

}