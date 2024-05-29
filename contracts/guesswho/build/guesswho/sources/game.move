/// Module: game
module guesswho::game {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use std::hash::sha2_256;

    const EWinnerAlreadySelected: u64 = 1;
    const EInvalidHash: u64 = 2;

    public struct Game<phantom T: key + store> has key, store{ 
        id: UID,
        influencer_hash: vector<u8>,
        winner: Option<address>,
        stake: Balance<T>,
    }

    public struct AdminCap has key{ 
        id: UID,
    }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap {
            id: object::new(ctx),
        }, ctx.sender());
    }

    public fun new<T: key + store>(influencer_hash: vector<u8>, ctx: &mut TxContext) {
        let game = Game<T>{
            id: object::new(ctx),
            influencer_hash,
            winner: option::none(),
            stake: balance::zero(),
        };
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, ctx.sender());
        transfer::share_object(game);
    }

    public fun guess<T: key + store>(game: &mut Game<T>, stake: Coin<T>) {
        game.stake.join(stake.into_balance());
    }

    public fun select_winner<T: key + store>(
        _: &AdminCap, 
        game: &mut Game<T>, 
        influencer: vector<u8>,
        winner: address, 
        ctx: &mut TxContext) {
        assert!(game.winner.is_none(), EWinnerAlreadySelected);
        assert!(sha2_256(influencer) == game.influencer_hash, EInvalidHash);
        game.winner = option::some(winner);
        let stake = game.stake.withdraw_all();
        let mut payout = coin::from_balance(stake, ctx);
        let value = payout.value();
        payout.split_and_transfer(value, winner, ctx);
        payout.destroy_zero();
    }
}

