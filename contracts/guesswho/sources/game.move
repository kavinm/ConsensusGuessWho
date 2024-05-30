/// Module: game
module guesswho::game {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use std::hash::sha2_256;
    use std::string::String;

    const EWinnerAlreadySelected: u64 = 1;

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

    public fun ask<T: key + store>(game: &mut Game<T>, stake: Coin<T>) {
        add_to_stake(game, stake);
    }

    public fun guess<T: key + store>(game: &mut Game<T>, stake: Coin<T>, influencer_guess: String, ctx: &mut TxContext) {
        add_to_stake(game, stake);
        let bytes = influencer_guess.bytes();
        if(sha2_256(*bytes) == game.influencer_hash) { 
            select_winner(game, ctx.sender(), ctx);
        }
    }

    fun select_winner<T: key + store>(
        game: &mut Game<T>, 
        winner: address, 
        ctx: &mut TxContext) {
        assert!(game.winner.is_none(), EWinnerAlreadySelected);
        game.winner = option::some(winner);
        let stake = game.stake.withdraw_all();
        let mut payout = coin::from_balance(stake, ctx);
        let value = payout.value();
        payout.split_and_transfer(value, winner, ctx);
        payout.destroy_zero();
    }

    fun add_to_stake<T: key + store>(game: &mut Game<T>, stake: Coin<T>) {
        game.stake.join(stake.into_balance());
     }
}

