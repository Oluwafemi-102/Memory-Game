import $ from 'jquery';

// // Game logic module
export default class MemoryGame {
    constructor() {
        this.gameStarted = false;
        this.gameTimer = 0;
        this.timerInterval = null;
        this.moves = 0;
        this.matches = 0;
        this.totalMatches = 8;
        this.difficulty = "easy";
        this.canFlip = true;
        this.firstCard = null;
        this.secondCard = null;
        this.hintsRemaining = 3;
        
        // Card symbols (emojis for visual appeal)
        this.symbols = {
            easy: ["🍎", "🍌", "🍒", "🍇", "🍊", "🍓", "🍍", "🥭"],
            medium: ["🍎", "🍌", "🍒", "🍇", "🍊", "🍓", "🍍", "🥭", "🥥", "🍑", "🍈", "🍋"],
            hard: ["🍎", "🍌", "🍒", "🍇", "🍊", "🍓", "🍍", "🥭", "🥥", "🍑", "🍈", "🍋", 
                   "🍉", "🥝", "🫐", "🍐", "🥑", "🌶️"]
        };
    }
    
    // Initialize the game
    initGame() {
        this.gameStarted = false;
        this.gameTimer = 0;
        this.moves = 0;
        this.matches = 0;
        this.canFlip = true;
        this.firstCard = null;
        this.secondCard = null;
        this.hintsRemaining = 3;
        
        // Determine total matches based on difficulty
        if (this.difficulty === "medium") {
            this.totalMatches = 12;
        } else if (this.difficulty === "hard") {
            this.totalMatches = 18;
        } else {
            this.totalMatches = 8;
        }
        
        // Clear any existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        return {
            moves: this.moves,
            timer: this.gameTimer,
            matches: this.matches,
            totalMatches: this.totalMatches,
            difficulty: this.difficulty,
            hintsRemaining: this.hintsRemaining
        };
    }
    
    // Generate card symbols for the current game
    generateCardSymbols() {
        const currentSymbols = this.symbols[this.difficulty];
        
        // Duplicate symbols to create pairs
        let cardSymbols = [];
        currentSymbols.forEach(symbol => {
            cardSymbols.push(symbol, symbol);
        });
        
        // Shuffle the cards
        return this.shuffleArray(cardSymbols);
    }
    
    // Shuffle array using Fisher-Yates algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Start the game
    startGame() {
        if (this.gameStarted) return false;
        
        this.gameStarted = true;
        
        // Start timer
        this.timerInterval = setInterval(() => {
            this.gameTimer++;
        }, 1000);
        
        return true;
    }
    
    // Handle card flip
    flipCard(cardElement) {
        if (!this.gameStarted || !this.canFlip || 
            $(cardElement).hasClass("flipped") || 
            $(cardElement).hasClass("matched")) {
            return { valid: false };
        }
        
        // Mark card as flipped
        $(cardElement).addClass("flipped");
        
        if (!this.firstCard) {
            this.firstCard = cardElement;
            return { valid: true, action: "first" };
        } else {
            this.secondCard = cardElement;
            this.canFlip = false;
            
            // Increment moves
            this.moves++;
            
            // Check for match
            const firstSymbol = $(this.firstCard).data("symbol");
            const secondSymbol = $(this.secondCard).data("symbol");
            
            if (firstSymbol === secondSymbol) {
                // Match found: increment matches immediately so callers
                // (UI / end-game checks) see the updated count right away.
                this.matches++;

                setTimeout(() => {
                    $(this.firstCard).addClass("matched");
                    $(this.secondCard).addClass("matched");
                    this.resetTurn();
                }, 500);

                return { 
                    valid: true, 
                    action: "second", 
                    match: true, 
                    moves: this.moves,
                    matches: this.matches 
                };
            } else {
                // No match
                setTimeout(() => {
                    $(this.firstCard).removeClass("flipped");
                    $(this.secondCard).removeClass("flipped");
                    this.resetTurn();
                }, 1000);
                
                return { 
                    valid: true, 
                    action: "second", 
                    match: false, 
                    moves: this.moves 
                };
            }
        }
    }
    
    // Reset turn after checking cards
    resetTurn() {
        this.firstCard = null;
        this.secondCard = null;
        this.canFlip = true;
    }
    
    // Use a hint
    useHint() {
        if (this.hintsRemaining <= 0) return { success: false, message: "No hints remaining" };
        
        this.hintsRemaining--;
        
        // Find all unflipped, unmatched cards
        const unflippedCards = $(".card:not(.flipped):not(.matched)");
        if (unflippedCards.length === 0) return { success: false, message: "No cards to hint" };
        
        // Pick a random unflipped card
        const randomIndex = Math.floor(Math.random() * unflippedCards.length);
        const hintCard = unflippedCards[randomIndex];
        
        // Also find its match
        const cardSymbol = $(hintCard).data("symbol");
        const matchingCard = $(`.card[data-symbol="${cardSymbol}"]:not(.flipped):not(.matched)`)
            .not(hintCard)[0];
        
        return { 
            success: true, 
            hintsRemaining: this.hintsRemaining,
            cards: [hintCard, matchingCard]
        };
    }
    
    // Check if game is complete
    checkGameComplete() {
        return this.matches === this.totalMatches;
    }
    
    // End the game
    endGame() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        const rating = this.calculateRating();
        
        return {
            moves: this.moves,
            time: this.gameTimer,
            rating: rating
        };
        
    }
    
    // Calculate star rating based on performance
    calculateRating() {
        let stars = 3;
        
        // Adjust based on difficulty
        const difficultyMultiplier = {
            easy: 1.2,
            medium: 1.0,
            hard: 0.8
        };
        
        const multiplier = difficultyMultiplier[this.difficulty] || 1.0;
        const expectedMoves = this.totalMatches * 2 * multiplier;
        
        if (this.moves > expectedMoves * 1.5) stars = 1;
        else if (this.moves > expectedMoves) stars = 2;
        
        return stars;
    }
    
    // Change difficulty
    setDifficulty(difficulty) {
        if (["easy", "medium", "hard"].includes(difficulty)) {
            this.difficulty = difficulty;
            return true;
        }
        return false;
    }
    
    // Get current game state
    getGameState() {
        return {
            started: this.gameStarted,
            timer: this.gameTimer,
            moves: this.moves,
            matches: this.matches,
            totalMatches: this.totalMatches,
            difficulty: this.difficulty,
            hintsRemaining: this.hintsRemaining,
            canFlip: this.canFlip
        };
    }
}

// Export the game class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemoryGame;
}