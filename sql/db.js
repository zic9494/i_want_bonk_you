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
app.use(express.json()); //中間件:解析json檔

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
    }catch(err){
        console.error('Error:',err);
    }
});

app.post('/api/users/login',async (req,res) => { //登入的POST請求
    try{

        console.log(req.body);
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
        console.log(checkUserResponse.recordset[0]);
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

app.get('/api/users/info',async (req,res)=>{
    console.log('test1');
    const user_name = req.query.user_name;
    const checkSQL = `SELECT Nick_name,Bio,PhotoURL FROM Users WHERE User_name = @User_name`;

    const query = await pool.request()
                        .input('User_name',sql.VarChar(50),user_name)
                        .query(checkSQL);
    //檢查用戶是否存在
    if (!query.recordset.length){
        return res.status(404).json({message: "Not found User"})          
    }
    console.log(query);
    res.status(201).json(query);
});

app.post('/api/users/info',async (req,res) => { //登入的POST請求
    try{

        console.log(req.body);
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
        console.log(checkUserResponse.recordset[0]);
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



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`伺服器運行中：http://localhost:${PORT}`);
});