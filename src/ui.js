import $ from 'jquery';

// UI management module
export default class GameUI {
    constructor(game) {
        this.game = game;
        this.hintTimeout = null;
    }
    
    // Update the game info display
    updateGameInfo(state) {
        $("#moves").text(state.moves);
        $("#timer").text(state.timer + "s");
        $("#matches").text(`${state.matches}/${state.totalMatches}`);
        $("#hint-btn").html(`<i class="fas fa-lightbulb"></i> Hint (${state.hintsRemaining})`);
        $("#difficulty-display").text(state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1));
    }
    
    // Generate the game board
    generateGameBoard() {
        const gameBoard = $("#game-board");
        gameBoard.empty();
        
        // Determine grid size based on difficulty
        let gridSize = 4;
        if (this.game.difficulty === "medium") {
            gridSize = 6;
        } else if (this.game.difficulty === "hard") {
            gridSize = 6;
        }
        
        // Update grid layout
        if (this.game.difficulty === "medium") {
            gameBoard.css("grid-template-columns", "repeat(6, 1fr)");
        } else if (this.game.difficulty === "hard") {
            gameBoard.css("grid-template-columns", "repeat(6, 1fr)");
        } else {
            gameBoard.css("grid-template-columns", "repeat(4, 1fr)");
        }
        
        // Get symbols and create cards
        const cardSymbols = this.game.generateCardSymbols();
        
        for (let i = 0; i < cardSymbols.length; i++) {
            const card = $(`
                <div class="card" data-symbol="${cardSymbols[i]}" data-index="${i}">
                    <div class="card-front">${cardSymbols[i]}</div>
                    <div class="card-back">?</div>
                </div>
            `);
            
            gameBoard.append(card);
        }
        
        // Adjust card size based on difficulty
        const cardHeight = this.game.difficulty === "hard" ? "100px" : "120px";
        $(".card").css("height", cardHeight);
    }
    
    // Show win message
    showWinMessage(gameStats) {
        $("#final-moves").text(gameStats.moves);
        $("#final-time").text(gameStats.time);
        
        // Display stars
        const starsContainer = $("#stars");
        starsContainer.empty();
        
        for (let i = 0; i < 3; i++) {
            const star = $(`<i class="${i < gameStats.rating ? 'fas' : 'far'} fa-star"></i>`);
            starsContainer.append(star);
        }
        
        // Show message with animation
        setTimeout(() => {
            $("#win-message").addClass("show");
        }, 800);
    }
    
    // Hide win message
    hideWinMessage() {
        $("#win-message").removeClass("show");
    }
    
    // Show hint effect on cards
    showHint(cards) {
        // Clear any existing hint timeout
        if (this.hintTimeout) clearTimeout(this.hintTimeout);
        
        // Add hint class to cards
        $(cards).addClass("hint");
        
        // Show hint overlay
        $("#hint-overlay").css("opacity", "0.5");
        
        // Remove hint effect after 1.5 seconds
        this.hintTimeout = setTimeout(() => {
            $(cards).removeClass("hint");
            $("#hint-overlay").css("opacity", "0");
        }, 1500);
    }
    
    // Update difficulty buttons
    updateDifficultyButtons(selectedDifficulty) {
        $(".diff-btn").removeClass("active");
        $(`.diff-btn[data-difficulty="${selectedDifficulty}"]`).addClass("active");
    }
    
    // Show notification (optional enhancement)
    showNotification(message, type = "info") {
        // Create notification element
        const notification = $(`
            <div class="notification ${type}">
                ${message}
            </div>
        `);
        
        // Add to body
        $("body").append(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.fadeOut(() => notification.remove());
        }, 3000);
    }
}

// Export the UI class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameUI;
}
