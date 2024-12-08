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

app.get('/api/GetStretch', async (req, res) =>{
    const data = await pool.request()
        .query(`SELECT * FROM Online_Users
            WHERE Stretched = 'true'`)
    return res.status(200).json(data)
})

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

app.get('/develop', async (req, res)=>{
    const commed = 
    `
        SELECT * FROM Online_Users
    `
    // `
    //     INSERT INTO Online_Users(user_name)
    //     VALUES('qwe')
    // `
    const data = await pool.request()
        .query(commed)
    return res.status(200).json(data)
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`伺服器運行中：http://localhost:${PORT}`);
});