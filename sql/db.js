import sql from 'mssql'; 
import express from 'express'; 
import fs from 'fs/promises';
import bcrypt from 'bcrypt';
import cors from 'cors';

//node db.js運行Express伺服器，這樣我們就可以call自己定義的API去操作SQL
let pool = null;
const saltRounds = 10;

const config ={ 
    server: 'bonk-you.database.windows.net', //伺服器名稱
    user: 'bonkman', //帳號名稱
    password: 'BonkBonk1234', //密碼
    database: 'Bonk You', //資料庫名稱
};

async function connectToDatabase() {    //連接SQL Server
    try {
        console.log(typeof config.server);
        pool = await sql.connect(config);
        console.log('成功連接！');
    } catch (err) {
        console.error('連接失敗:', err);
    }
}

async function init_db() {  //初始化資料庫
    try{
        const initSQL = await fs.readFile('./init.sql','utf-8');
        await pool.request().query(initSQL);
        console.log('initialize success!')
    }catch(err){
        console.error('Error:',err)
    }
}

await connectToDatabase();
await init_db();


const app = express();
app.use(cors()); //中間件:允許跨域請求
app.use(express.json({limit:'10mb'})); //中間件:解析json檔

app.post('/api/users/signup',async (req,res) => {  //註冊的POST請求
    try{
        const user_name = req.body.user_name;
        const nick_name = req.body.nick_name;
        const password = req.body.password;
        
        
        const checkSQL = `SELECT * FROM Users WHERE User_name = @User_name`;

        const checkUserResponse = await pool.request()
                            .input('User_name',sql.VarChar(50),user_name)
                            .query(checkSQL);

        //檢查用戶是否註冊過
        if (checkUserResponse.recordset.length>0){
            return res.status(409).json({message: "Username already exist"});        
        }

        const hashedPassword = await bcrypt.hash(password,saltRounds);
        //新增到SQL
        await pool.request()
            .input('User_name', sql.Char(50), user_name)
            .input('Nick_name', sql.VarChar(50), nick_name)
            .input('Password', sql.VarChar(255), hashedPassword)
            .query(
                `INSERT INTO Users(User_name,Nick_name,Password)
                VALUES (@User_name, @Nick_name, @Password)`
            );
        
        res.status(201).json({message: "User created successfully"});
        console.log('created successfully');
        
        //Online_Users新增使用者
        await pool.request()
            .input('User_name', sql.Char(50), user_name)
            .query(
                `INSERT INTO Online_Users(User_name)
                VALUES (@User_name)`
            );
    }catch(err){
        console.error('Error:',err);
    }
});

app.post('/api/users/login',async (req,res) => { //登入的POST請求
    try{

        const user_name = req.body.user_name;
        const password = req.body.password;

        const checkSQL = `SELECT * FROM Users WHERE User_name = @User_name`;

        const checkUserResponse = await pool.request()
                            .input('User_name',sql.VarChar(50),user_name)
                            .query(checkSQL);
        //檢查用戶是否存在
        if (!checkUserResponse.recordset.length){
            return res.status(409).json({message: "Incorrect password or Username doesn't exist"})          
        }

        //檢查密碼
        const isPasswordCorrect = await bcrypt.compare(password,checkUserResponse.recordset[0].Password);
        if(!isPasswordCorrect){
            return res.status(409).json({message: "Incorrect password or Username doesn't exist"})      
        }

        res.status(201).json({message: "Login successfully"})
    }catch(err){
        console.error(err);
    }
});

app.get('/api/users/info',async (req,res)=>{  //登入回傳使用者資訊的GET請求
    const user_name = req.query.user_name;
    const checkSQL = `SELECT Nick_name,Bio,PhotoBase64 FROM Users WHERE User_name = @User_name`;

    const query = await pool.request()
                        .input('User_name',sql.VarChar(50),user_name)
                        .query(checkSQL);
    //檢查用戶是否存在
    if (!query.recordset.length){
        return res.status(404).json({message: "Not found User"})          
    }

    res.status(201).json(query);
});

app.post('/api/users/info',async (req,res) => { //更新info的POST請求
    try{

        const user_name = req.body.user_name;
        const bio = req.body.updateBio;
        const photoBase64 = req.body.photoBase64;
        
        const checkSQL = `SELECT * FROM Users WHERE User_name = @User_name`;

        const checkUserResponse = await pool.request()
                            .input('User_name',sql.VarChar(50),user_name)
                            .query(checkSQL);
        //檢查用戶是否存在
        if (!checkUserResponse.recordset.length){
            return res.status(409).json({message: "Username doesn't exist"});     
        }

        //更新profile
        const updateSQL = `
            UPDATE Users
            SET Bio = @Bio,PhotoBase64 = @PhotoBase64
            WHERE User_name = @User_name
            `
        await pool.request()
            .input('Bio',sql.VarChar(255),bio)
            .input('PhotoBase64',sql.NVarChar(sql.MAX),photoBase64)
            .input('User_name',sql.VarChar(50),user_name)
            .query(updateSQL);     

        res.status(201).json({message: "update successfully"})
    }catch(err){
        console.error(err);
    }   
});
//查詢遊戲狀態
app.get('/api/status/query',async (req, res)=>{
    const user_name = req.query.user_name;
    const querySQL = `SELECT Stretched,SOL_balance,BONK_balance
                    FROM Online_Users WHERE User_name = @User_name`;

    const query = await pool.request()
                        .input('User_name',sql.VarChar(50),user_name)
                        .query(querySQL);

    res.json(query.recordset[0]);
});
    
                


app.get('/api/update/bonked', async (req, res)=>{
    const Attacker = req.query.attacker
    const Bonked = req.query.bonked
    let commed =
    `
        UPDATE Online_Users
        SET Bonked_times = Bonked_times + 1
        WHERE User_name = @bonked
    `
    await pool.request()
        .input('bonked',sql.VarChar(50), Bonked)
        .query(commed);
    
    commed = 
    `
        SELECT Attack_id FROM Attacks
        WHERE Attacker_user_name = @attacker AND Target_user_name = @Bonked
    `
    let query = await pool.request()
        .input('bonked',sql.VarChar(50), Bonked)
        .input('attacker',sql.VarChar(50), Attacker)
        .query(commed);
    if (query.rowsAffected[0]==0){
        commed = 
        `
            INSERT INTO Attacks(Attacker_user_name, Target_user_name)
            VALUES(@attacker, @Bonked)
        `
    }else{
        commed = 
        `
            UPDATE Attacks
            SET Last_attack_time = GETDATE()
            WHERE Attacker_user_name = @attacker AND Target_user_name = @Bonked
        `
    }
    query = await pool.request()
        .input('bonked',sql.VarChar(50), Bonked)
        .input('attacker',sql.VarChar(50), Attacker)
        .query(commed);
    
    res.status(201).json(query)
})

//取得伸頭
app.get('/api/GetStretch', async (req, res) =>{
    const user_name = req.query.user_name
    const commed =
    `
        SELECT A.User_name
        FROM Online_Users AS A
        LEFT JOIN Attacks AS B ON A.User_name = B.Target_user_name
        WHERE A.Stretched = 'true' 
        AND (B.Last_attack_time < DATEADD(hour, -1, GETDATE()) OR B.Target_user_name IS NULL)
        AND A.User_name != '${user_name}'
    `
    const data = await pool.request()
        .query(`SELECT * FROM Online_Users
            WHERE Stretched = 'true'`)
    return res.status(200).json(data)
})

//改變伸、縮頭
app.get('/api/ChangeStretch', async (req, res)=>{
    try{
        const user_name = req.query.user_name
        const action = Boolean(req.query.action)
        

        await pool.request()
            .input('action', sql.Bit ,action)
            .input('User_name',sql.VarChar(50),user_name)
            .query(`UPDATE Online_Users
                SET Stretched = @action
                WHERE User_name = @User_name`)

        res.status(200).json({massage: "update successfully"})
    }catch(err){
        console.log(err);
    }
})

//送出好友請求
app.post('/api/friends/send',async (req,res) => {
    try{
        const from_user = req.body.from_user;
        const to_user = req.body.to_user;
        const checkSQL = `SELECT status FROM Friendships WHERE 
                    (From_user = @from_user AND To_user = @to_user) 
                    OR (From_user = @to_user AND To_user = @from_user)`;
        const query = await pool.request()
                .input('from_user',sql.VarChar(50),from_user)
                .input('to_user',sql.VarChar(50),to_user)
                .query(checkSQL);
        if(query.recordset.length>0){
            const currentStatus = query.recordset[0].Status;
            res.json({message:`The relationship is currently ${currentStatus}`});
        }else{
            const insertSQL = `INSERT INTO Friendships(From_user,To_user,Status)
                                VALUES (@from_user, @to_user, 'pending')`;
            await pool.request()
                    .input('from_user',sql.VarChar(50),from_user)
                    .input('to_user',sql.VarChar(50),to_user)
                    .query(insertSQL);
            res.json({message:`Friend request sent`});
        }
    }catch(err){
        console.error(err);
    }
})

//接受好友請求
app.post('/api/friends/confirm',async (req,res) => {
    try{
        const from_user = req.body.from_user;
        const to_user = req.body.to_user;

        const checkSQL = `SELECT Status FROM Friendships 
                    WHERE (From_user = @from_user AND To_user = @to_user AND Status='pending')`;
        const query = await pool.request()
                .input('from_user',sql.VarChar(50),from_user)
                .input('to_user',sql.VarChar(50),to_user)
                .query(checkSQL);
        if(!query.recordset.length){
            res.status(404).json({message:`The relationship dosen't exist`});
        }else{
            const updateSQL = `UPDATE Friendships
                               SET Status = 'confirmed'
                               WHERE (From_user = @from_user AND to_user = @to_user)`;
            await pool.request()
                    .input('from_user',sql.VarChar(50),from_user)
                    .input('to_user',sql.VarChar(50),to_user)
                    .query(updateSQL);
            res.status(200).json({message:`Comfirm request successfully`});
        }
    }catch(err){
        console.error(err);
    }
})

//拒絕好友請求
app.delete('/api/friends/decline',async (req,res) => {
    try{
        const from_user = req.body.from_user;
        const to_user = req.body.to_user;

        // 刪除好友邀請
        const deleteSQL = `DELETE FROM Friendships 
                           WHERE (From_user = @from_user AND To_user = @to_user AND Status = 'pending')
                              OR (From_user = @to_user AND To_user = @from_user AND Status = 'pending')`;

        const result = await pool.request()
            .input('from_user', sql.VarChar(50), from_user)
            .input('to_user', sql.VarChar(50), to_user)
            .query(deleteSQL);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "No pending invitation found" });
        }

        res.status(200).json({ message: "Friend request declined successfully" });
    }catch(err){
        console.error(err);
    }
})

//查詢好友列表
app.get('/api/friends/query',async (req,res)=>{
    const user_name = req.query.user_name;
    const querySQL = `SELECT From_user,To_user From Friendships 
                    WHERE ( From_user = @user_name OR To_user = @user_name) AND Status = 'confirmed'`;
    const query = await pool.request()
                    .input('user_name',sql.VarChar(50),user_name)
                    .query(querySQL);
    res.status(200).json(query.recordset);
});

//後門
app.get('/develop', async (req, res)=>{
    const commed = 
    `
        SELECT * FROM Attacks
    `
    let query = await pool.request()
        .query(commed);
    
    return  res.status(201).json(query)
    
})



//查詢好友邀請
app.get('/api/friends/queryRequest',async (req,res)=>{
    const user_name = req.query.user_name;
    const querySQL = `SELECT From_user,To_user From Friendships 
                    WHERE To_user = @user_name AND Status = 'pending'`;
    const query = await pool.request()
                    .input('user_name',sql.VarChar(50),user_name)
                    .query(querySQL);
    
    res.status(200).json(query.recordset);
});

//查詢A對B攻擊次數
app.get('/api/attacks/query', async (req,res)=>{
    try{
        const attack_user = req.query.attack_user;
        const target_user = req.query.target_user;
    
        const querySQL = `SELECT COUNT(Attack_id) AS attackCount FROM Attacks 
                    WHERE Attacker_user_name = @Attacker_user_name AND 
                    Target_user_name = @Target_user_name`;
        const query = await pool.request()
                        .input('Attacker_user_name',sql.VarChar(50),attack_user)
                        .input('Target_user_name',sql.VarChar(50),target_user)
                        .query(querySQL);
        res.status(200).json(query.recordset[0]);
    }catch(err){
        console.error(err);
    }
});

//查詢用戶PDA
app.get('/api/pda/query', async (req,res)=>{
    try{
        const wallet = req.query.wallet_address;
        const querySQL = `SELECT Pda_address FROM PDA WHERE Wallet_address = @Wallet_address`;
        const query = await pool.request()
                        .input('Wallet_address',sql.VarChar(50),wallet)
                        .query(querySQL);
        if (!query.recordset.length){
            return res.status(404).json({message:"Pda doesn't exist"});
        }
        res.status(200).json(query.recordset[0]);

    }catch(err){
        console.error(err);
    }
});

// 新增用戶PDA
app.post('/api/pda/add', async (req, res) => {
    try {
        const wallet_address = req.query.wallet_address;
        const pda_address = req.query.pda_address;

        const insertSQL = `INSERT INTO PDA (Wallet_address, Pda_address) VALUES (@Wallet_address, @Pda_address)`;
        await pool.request()
            .input('Wallet_address', sql.VarChar(50), wallet_address)
            .input('Pda_address', sql.VarChar(50), pda_address)
            .query(insertSQL);

        res.status(200).json({ message: "PDA added successfully" });

    } catch (err) {
        console.error("Error adding PDA:", err);
    }
});




const PORT = 3000;
app.listen(PORT, () => {
    console.log(`伺服器運行中：http://localhost:${PORT}`);
});