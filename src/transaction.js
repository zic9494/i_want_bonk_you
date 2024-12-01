export class transaction {
    #PrivateKey
    constructor(TGaddress, Amount, charge, Key) {
        this.TargetAddress = TGaddress
        this.Amount = Amount
        this.Charge = charge
        this.#PrivateKey = key
    }
    Chage_PrivateKey(NewKey){
        this.#PrivateKey = NewKey
    }
}
export class UserInfo{
    #PrivateKey
    constructor(key){
        this.#PrivateKey = key
    }
}