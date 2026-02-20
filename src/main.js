// Main entry point - FIXED best score handling
import $ from 'jquery';
import { MemoryGame } from './game.js';
import { GameDisplay } from './display.js';
import { AudioManager } from './audio.js';

// Import styles
import './css/style.css';
import './css/theme.css';

// Initialize everything when DOM is ready
$(document).ready(function() {
    // Create game instances
    const game = new MemoryGame();
    const audioManager = new AudioManager();
    const display = new GameDisplay(game, audioManager);
    
    // Debug: Check initial best scores
    console.log('Initial best scores:', game.bestScores);
    
    // Initialize the game
    function initGame() {
        const state = game.initGame();
        display.generateGameBoard();
        display.updateGameInfo(state);
        display.updateDifficultyButtons(game.difficulty);
        display.updateThemeButtons(game.themeManager.getCurrentTheme());
        display.hideTimerWarning();
        
        $("#start-btn").prop("disabled", false);
    }
    
    // Start the game
    function startGame() {
        const started = game.startGame();
        if (started) {
            $("#start-btn").prop("disabled", true);
            audioManager.play('flip');
            
            setTimeout(() => {
                $("#start-btn").prop("disabled", false);
            }, 2000);
        }
    }
    
    // Handle card click
    function handleCardClick() {
        const state = game.getGameState();
        if (!state.started || state.paused || state.gameOver) return;
        
        const result = game.flipCard(this);
        
        if (result.valid) {
            audioManager.play('flip');
            
            if (result.action === "second") {
                display.updateGameInfo(game.getGameState());
                
                if (result.match) {
                    audioManager.play('match');
                    
                    if (game.checkGameComplete()) {
                        setTimeout(() => {
                            audioManager.play('win');
                            const gameStats = game.endGame();
                            
                            // FIXED: Force best scores update in display
                            const updatedState = game.getGameState();
                            display.updateGameInfo(updatedState);
                            
                            // Show win message with stats
                            display.showWinMessage(gameStats);
                            
                            // Show notifications
                            if (gameStats.newBestScore) {
                                display.showNotification(`🎉 NEW BEST SCORE: ${gameStats.score}!`, "success");
                                console.log('New best score achieved!', gameStats.difficulty, gameStats.score);
                            }
                            
                            if (gameStats.achievements && gameStats.achievements.length > 0) {
                                gameStats.achievements.forEach(achievement => {
                                    display.showAchievement(achievement);
                                    display.showNotification(`🏆 Achievement: ${achievement.name}`, "success");
                                });
                            }
                        }, 500);
                    }
                }
            }
        }
    }
    
    // Reset best scores (hidden feature - press R key 3 times)
    let resetCount = 0;
    $(document).keypress(function(e) {
        if (e.key === 'r' || e.key === 'R') {
            resetCount++;
            if (resetCount === 3) {
                const scores = game.resetBestScores();
                display.updateGameInfo(game.getGameState());
                display.showNotification('Best scores reset!', 'warning');
                console.log('Best scores reset:', scores);
                resetCount = 0;
            }
        }
    });
    
    // Use hint
    function useHint() {
        const state = game.getGameState();
        if (!state.started || state.paused || state.gameOver) {
            display.showNotification("Cannot use hint now", "warning");
            return;
        }
        
        const hintResult = game.useHint();
        
        if (hintResult.success) {
            audioManager.play('hint');
            display.showHint(hintResult.cards);
            display.updateGameInfo(game.getGameState());
            display.showNotification(`💡 Hint used! ${hintResult.hintsRemaining} remaining`, "info");
        } else {
            display.showNotification(hintResult.message, "warning");
        }
    }
    
    // Toggle sound
    function toggleSound() {
        const enabled = audioManager.toggle();
        display.updateGameInfo(game.getGameState());
        display.showNotification(`Sound ${enabled ? 'ON' : 'OFF'}`, enabled ? 'success' : 'warning');
    }
    
    // Change game speed
    function changeSpeed(increment) {
        const state = game.getGameState();
        const currentSpeed = state.speed;
        const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
        let currentIndex = speeds.indexOf(currentSpeed);
        
        if (currentIndex === -1) currentIndex = 2;
        
        currentIndex += increment;
        currentIndex = Math.max(0, Math.min(speeds.length - 1, currentIndex));
        
        game.setGameSpeed(speeds[currentIndex]);
        display.updateGameInfo(game.getGameState());
        
        const speedNames = {0.5: "Slow", 0.75: "Relaxed", 1.0: "Normal", 1.25: "Fast", 1.5: "Very Fast", 2.0: "Extreme"};
        display.showNotification(`Speed: ${speedNames[speeds[currentIndex]]}`, "info");
    }
    
    // Update timer display
    function updateTimerDisplay() {
        const state = game.getGameState();
        if (state.started && !state.paused && !state.gameOver) {
            display.updateGameInfo(state);
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Main controls
        $("#start-btn").click(startGame);
        $("#pause-btn").click(() => {
            if (game.getGameState().gameOver) return;
            const isPaused = game.togglePause();
            if (isPaused) {
                display.showPauseMessage();
            } else {
                display.hidePauseMessage();
            }
            display.updateGameInfo(game.getGameState());
        });
        
        $("#reset-btn").click(() => {
            initGame();
            display.showNotification("Game Reset", "info");
        });
        
        $("#hint-btn").click(useHint);
        $("#sound-btn").click(toggleSound);
        
        // Speed controls
        $("#speed-up").click(() => changeSpeed(1));
        $("#speed-down").click(() => changeSpeed(-1));
        
        // Difficulty buttons
        $(".diff-btn").click(function() {
            const difficulty = $(this).data("difficulty");
            if (game.setDifficulty(difficulty)) {
                display.updateDifficultyButtons(difficulty);
                initGame();
                display.showNotification(`${difficulty} mode selected`, "info");
            }
        });
        
        // Theme buttons
        $(".theme-btn").click(function() {
            const theme = $(this).data("theme");
            if (game.setTheme(theme)) {
                display.updateThemeButtons(theme);
                initGame();
                display.showNotification(`${game.themeManager.getThemeName(theme)} theme`, "success");
            }
        });
        
        // Card click
        $("#game-board").on("click", ".card", handleCardClick);
        
        // Win message buttons
        $("#play-again-btn").click(function() {
            display.hideWinMessage();
            initGame();
            startGame();
        });
        
        $("#change-diff-btn").click(function() {
            display.hideWinMessage();
            initGame();
        });
        
        // Timeout message buttons
        $("#try-again-btn").click(function() {
            display.hideTimeoutMessage();
            initGame();
            startGame();
        });
        
        $("#timeout-change-diff").click(function() {
            display.hideTimeoutMessage();
            initGame();
        });
        
        // Pause message buttons
        $("#resume-btn").click(() => {
            game.togglePause();
            display.hidePauseMessage();
            display.updateGameInfo(game.getGameState());
        });
        
        $("#restart-btn").click(() => {
            game.togglePause();
            display.hidePauseMessage();
            initGame();
            display.showNotification("Game Restarted", "info");
        });
    }
    
    // Initialize timer
    setInterval(updateTimerDisplay, 1000);
    
    // Set up everything
    setupEventListeners();
    initGame();
    
    // Auto-start after 2 seconds
    setTimeout(() => {
        if (!game.getGameState().started && !game.getGameState().gameOver) {
            startGame();
        }
    }, 2000);
});