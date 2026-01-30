import './css/style.css';
import $ from 'jquery';
import GameUI from './ui.js';
import MemoryGame from './game.js'

// Main application module
$(document).ready(function() {
    // Initialize game and UI
    const game = new MemoryGame();
    const ui = new GameUI(game);
    
    // Initialize the game
    function initGame() {
        const state = game.initGame();
        ui.generateGameBoard();
        ui.updateGameInfo(state);
        ui.updateDifficultyButtons(game.difficulty);
        
        // Re-enable start button
        $("#start-btn").prop("disabled", false).css("opacity", "1");
    }
    
    // Start the game
    function startGame() {
        const started = game.startGame();
        if (started) {
            $("#start-btn").prop("disabled", true).css("opacity", "0.7");
            
            // Re-enable after 2 seconds
            setTimeout(() => {
                $("#start-btn").prop("disabled", false).css("opacity", "1");
            }, 2000);
        }
    }
    
    // Handle card click
    function handleCardClick() {
        const result = game.flipCard(this);
        
        if (result.valid) {
            if (result.action === "second") {
                ui.updateGameInfo(game.getGameState());
                
                // Check if game is complete
                if (result.match && game.checkGameComplete()) {
                    const gameStats = game.endGame();
                    ui.showWinMessage(gameStats);
                }
            }
        }
    }
    
    // Use hint
    function useHint() {
        const hintResult = game.useHint();
        
        if (hintResult.success) {
            ui.showHint(hintResult.cards);
            ui.updateGameInfo(game.getGameState());
        } else {
            ui.showNotification(hintResult.message, "warning");
        }
    }
    
    // Update game timer display
    function updateTimerDisplay() {
        const state = game.getGameState();
        if (state.started) {
            ui.updateGameInfo(state);
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Start button
        $("#start-btn").click(startGame);
        
        // Reset button
        $("#reset-btn").click(initGame);
        
        // Hint button
        $("#hint-btn").click(useHint);
        
        // Difficulty buttons
        $(".diff-btn").click(function() {
            const difficulty = $(this).data("difficulty");
            if (game.setDifficulty(difficulty)) {
                ui.updateDifficultyButtons(difficulty);
                initGame();
            }
        });
        
        // Card click (event delegation)
        $("#game-board").on("click", ".card", handleCardClick);
        
        // Win message buttons
        $("#play-again-btn").click(function() {
            ui.hideWinMessage();
            initGame();
            startGame();
        });
        
        $("#change-diff-btn").click(function() {
            ui.hideWinMessage();
            initGame();
        });
    }
    
    // Initialize timer for updating display
    setInterval(updateTimerDisplay, 1000);
    
    // Set up the game
    setupEventListeners();
    initGame();
    
    // Auto-start the game after 3 seconds
    setTimeout(() => {
        if (!game.getGameState().started) {
            startGame();
        }
    }, 3000);
});