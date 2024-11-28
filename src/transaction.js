export class transaction {
    #PrivateKey
    Data(TGaddress, Amount, charge, private) {
        this.TargetAddress = TGaddress
        this.Amount = Amount
        this.Charge = charge
        this.#PrivateKey = private
    }
    Chage_PrivateKey(NewKey){
        this.#PrivateKey = NewKey
    }
}