# seahorse
# Built with Seahorse v0.2.0

from seahorse.prelude import *

declare_id('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')

#初始化用戶PDA
@instruction
def initialize_user_pda(signer: Signer, token_account: Empty[TokenAccount], mint: TokenMint):

    #新增代幣子帳戶
    token_account.init(
        payer = signer,
        mint = mint,
        authority = signer,
        seeds = ['user-pda', signer.key()]
    )

    bump = token_account.bump()

#用戶提取bonk
@instruction
def withdraw_BONK(signer: Signer, amount: u64, userPDA_account: TokenAccount, target_account: TokenAccount, mint: TokenMint):
    
    pda_pubkey = Pubkey.find_program_address(["user-pda", signer.key()])

    userPDA_account.transfer(
        authority = userPDA_account,
        to = target_account,
        amount = amount,
        signer = ["user-pda", target_account]
    )