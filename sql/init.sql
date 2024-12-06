IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users(
        Id INT IDENTITY(1,1) PRIMARY KEY, 
        User_name VARCHAR(50) NOT NULL UNIQUE,
        Password VARCHAR(255) NOT NULL,
        Nick_name VARCHAR(50) NOT NULL,     
        PhotoURL VARCHAR(255) NULL,
        Bio VARCHAR(255) NULL,
        Created_at DATETIME2 DEFAULT GETDATE()     
    )
END