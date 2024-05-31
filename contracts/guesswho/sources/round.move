module guesswho::round { 
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::hash;
    use std::string::{Self, String};
    use sui::event;
    use sui::dynamic_field as df;
    use guesswho::game::{Self, Game, AdminCap};

    public struct Round<phantom T> has key, store { 
        id: UID,
        answer_hash: vector<u8>,
        stake: Balance<T>,
    }

    public struct RoundOver has copy, drop { 
        id: ID, 
        winner: address,
    }

    // === Public-Package Functions ===
    public(package) fun uid<T>(self: &Round<T>): &UID { &self.id } 
    public(package) fun uid_mut<T>(self: &mut Round<T>): &mut UID { &mut self.id }

    // Create a new round
    public fun new<T>(_: &AdminCap, current_game: &mut Game, answer_hash: vector<u8>, ctx: &mut TxContext) {
        let round = Round<T>{
            id: object::new(ctx),
            answer_hash,
            stake: balance::zero(),
        };
        // Rounds are added as dynamic fields to the game
        df::add(game::uid_mut(current_game), b"round", round);
    }

    // Ask a question 
    public fun ask<T>(current_game: &mut Game, stake: Coin<T>) {
        let round = df::borrow_mut(game::uid_mut(current_game), b"round");
        add_to_stake(round, stake);
    }
    
    // Guess 
    public fun guess<T>(current_game: &mut Game, stake: Coin<T>, guess: String, ctx: &mut TxContext) {
        let round = df::borrow_mut(game::uid_mut(current_game), b"round");
        add_to_stake(round, stake);
        // Check if hash matches
        if(hash::keccak256(guess.bytes()) == round.answer_hash) { 
            let round: Round<T> = df::remove(game::uid_mut(current_game), b"round");
            select_winner(round, ctx.sender(), ctx);
        }
    }

    fun select_winner<T>(
        round: Round<T>, 
        winner: address, 
        ctx: &mut TxContext) {
        let Round<T>{id: id, answer_hash: _, stake: mut stake} = round;
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

    entry fun check_hashes_equal(guess: String, answer_hash: vector<u8>): bool { 
        hash::keccak256(guess.bytes()) == answer_hash
    }
}