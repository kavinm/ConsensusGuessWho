/// Module: Round
module guesswho::game {

    public struct Game has key { 
        id: UID,
    }

    public struct AdminCap has key {
        id: UID,
    }

    // === Public-Package Functions ===
    public(package) fun uid(self: &Game): &UID { &self.id } 
    public(package) fun uid_mut(self: &mut Game): &mut UID { &mut self.id }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap {
            id: object::new(ctx),
        }, ctx.sender());
        transfer::share_object(Game {
            id: object::new(ctx),
        });
    }
}

