export function setUserInfo(){
    const bioDisplay = document.getElementById('user-bio-display');
    const bioEdit = document.getElementById('user-bio-edit');
    const editBioButton = document.getElementById('edit-bio-button');
    const saveBioButton = document.getElementById('save-bio-button');
    const avatarImage = document.getElementById("user-avatar-image");
    const avatarInput = document.getElementById("avatar-upload-input");

    editBioButton.addEventListener('click',()=>{
        //自我介紹切換
        bioEdit.value = bioDisplay.innerText;
            bioEdit.style.display = 'block';
            bioDisplay.style.display = 'none';
            //按鈕切換
            editBioButton.style.display = 'none';
            saveBioButton.style.display = 'block';
            //大頭貼切換
            avatarImage.classList.add("upload-mode");
        avatarImage.addEventListener('click',triggerUpload);
    });

    saveBioButton.addEventListener('click',async ()=>{
        //自我介紹切換
        bioDisplay.innerText = bioEdit.value; 
        bioEdit.style.display = 'none';
        bioDisplay.style.display = 'block';
        //按鈕切換
        editBioButton.style.display = 'block';
        saveBioButton.style.display = 'none';
        //大頭貼切換
        avatarImage.classList.remove("upload-mode");
        avatarImage.removeEventListener('click',triggerUpload);

        //更新資料庫
        const updateBio = bioEdit.value;
        const photoBase64 = avatarImage.src;
        const user_name = localStorage.getItem('user_name');
        const response = await fetch('http://localhost:3000/api/users/info',{
            method:'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({
                updateBio,
                photoBase64,
                user_name
            })
        });
        if(response.ok){
            alert('Successfully saved');
        }else{
            alert('Saved Error');
        }
        
    });
    function triggerUpload(){
        avatarInput.click();    //為了觸發<input type="file">
    }
    avatarInput.addEventListener('change',(event)=>{
        const file = event.target.files[0];
        if(file){
            const reader = new FileReader();
            reader.onload = (e) =>{
                avatarImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

    });
}

