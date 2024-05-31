module guesswho::round { 
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use std::hash::sha2_256;
    use std::string::{Self, String};
    use sui::event;
    use sui::dynamic_field as df;
    use guesswho::game::{Self, Game, AdminCap};

    public struct Round<phantom T> has key, store { 
        id: UID,
        influencer_hash: vector<u8>,
        stake: Balance<T>,
    }

    public struct RoundOver has copy, drop { 
        id: ID, 
        winner: address,
    }

    // === Public-Package Functions ===
    public(package) fun uid<T>(self: &Round<T>): &UID { &self.id } 
    public(package) fun uid_mut<T>(self: &mut Round<T>): &mut UID { &mut self.id }

    public fun new<T>(_: &AdminCap, current_game: &mut Game, influencer_hash: String, ctx: &mut TxContext) {
        let round = Round<T>{
            id: object::new(ctx),
            influencer_hash: *influencer_hash.bytes(),
            stake: balance::zero(),
        };
        df::add(game::uid_mut(current_game), b"round", round);
    }

    public fun ask<T>(current_game: &mut Game, stake: Coin<T>) {
        let round = df::borrow_mut(game::uid_mut(current_game), b"round");
        add_to_stake(round, stake);
    }

    public fun guess<T>(current_game: &mut Game, stake: Coin<T>, influencer_guess: String, ctx: &mut TxContext) {
        let round = df::borrow_mut(game::uid_mut(current_game), b"round");
        add_to_stake(round, stake);
        let bytes = influencer_guess.bytes();
        if(sha2_256(*bytes) == round.influencer_hash) { 
            let round: Round<T> = df::remove(game::uid_mut(current_game), b"round");
            select_winner(round, ctx.sender(), ctx);
        }
    }

    fun select_winner<T>(
        round: Round<T>, 
        winner: address, 
        ctx: &mut TxContext) {
        let Round<T>{id: id, influencer_hash: _, stake: mut stake} = round;
        let mut payout = coin::from_balance(stake.withdraw_all(), ctx);
        let value = payout.value();
        payout.split_and_transfer(value, winner, ctx);
        payout.destroy_zero();
        stake.destroy_zero();
        event::emit(RoundOver {
            id: object::uid_to_inner(&id),
            winner,
        });
        object::delete(id);
    }

    fun add_to_stake<T>(round: &mut Round<T>, stake: Coin<T>) {
        round.stake.join(stake.into_balance());
    }
}