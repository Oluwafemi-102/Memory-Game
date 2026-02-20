import $ from 'jquery';

// Display management module (formerly ui.js)
export class GameDisplay {
    constructor(game, audioManager) {
        this.game = game;
        this.audioManager = audioManager;
        this.hintTimeout = null;
        this.warningShown = false;
    }
    
   // Update all display elements - FIXED best score display
updateGameInfo(state) {
    $("#moves").text(state.moves);
    $("#timer").text(state.timer + "s");
    $("#time-limit").text(state.timeLimit + "s");
    $("#matches").text(`${state.matches}/${state.totalMatches}`);
    $("#score").text(state.score);
    $("#hint-count").text(state.hintsRemaining);
    $("#progress-fill").css("width", state.progress + "%");
    $("#progress-text").text(state.progress + "% Complete");
    
    // FIXED: Update best scores with proper formatting
    if (state.bestScores) {
        $("#best-easy").text(state.bestScores.easy || 0);
        $("#best-medium").text(state.bestScores.medium || 0);
        $("#best-hard").text(state.bestScores.hard || 0);
        $("#best-expert").text(state.bestScores.expert || 0);
        
        // Debug: Log to console to verify
        console.log('Displaying best scores:', state.bestScores);
    }
    
    // Update sound button
    const soundIcon = this.audioManager.getStatus() ? "🔊" : "🔇";
    $("#sound-btn").html(`${soundIcon} Sound`);
    
    // Update pause button
    const pauseText = state.paused ? "▶️ Resume" : "⏸️ Pause";
    $("#pause-btn").text(pauseText);
    
    // Update speed display
    const speedLabels = {
        0.5: "🐢 Slow",
        0.75: "🚶 Relaxed",
        1.0: "⚡ Normal",
        1.25: "🏃 Fast",
        1.5: "🏃‍♂️ Very Fast",
        2.0: "🔥 Extreme"
    };
    $("#speed-display").text(speedLabels[state.speed] || "Normal");
    
    // Timer warning
    if (state.timeRemaining <= 30 && state.timeRemaining > 0 && !this.warningShown) {
        this.showTimerWarning();
    }
    
    if (state.timeRemaining > 30) {
        this.hideTimerWarning();
    }
    
    if (state.timeRemaining <= 10 && state.timeRemaining > 0) {
        $("#timer-warning").text(`⏰ CRITICAL! Only ${state.timeRemaining}s remaining!`);
    }
}

// Show win message with best score highlight - FIXED
showWinMessage(gameStats) {
    $("#final-moves").text(gameStats.moves);
    $("#final-time").text(gameStats.time + "s");
    $("#final-score").text(gameStats.score);
    
    // Highlight if new best score
    if (gameStats.newBestScore) {
        $("#final-score").css({
            'color': '#ffcc00',
            'font-size': '2.2rem',
            'text-shadow': '0 0 10px #ffcc00'
        });
    }
    
    // Display stars
    const starsContainer = $("#final-rating");
    starsContainer.empty();
    for (let i = 0; i < 3; i++) {
        starsContainer.append(i < gameStats.rating ? "★" : "☆");
    }
    
    // Display new achievements
    const achievementsContainer = $("#new-achievements");
    achievementsContainer.empty();
    
    if (gameStats.achievements && gameStats.achievements.length > 0) {
        achievementsContainer.append("<h4>🎖️ New Achievements</h4>");
        gameStats.achievements.forEach(achievement => {
            const badge = $(`
                <div class="achievement-badge">
                    🏅 ${achievement.name}
                </div>
            `);
            achievementsContainer.append(badge);
        });
    }
    
    // Add new best score message
    if (gameStats.newBestScore) {
        const bestBadge = $(`
            <div class="achievement-badge" style="background: linear-gradient(135deg, #ffcc00, #ff9900); margin-top: 10px;">
                🏆 NEW BEST SCORE! 🏆
            </div>
        `);
        achievementsContainer.append(bestBadge);
    }
    
    $("#win-message").addClass("show");
}
    
    // Generate game board
    generateGameBoard() {
        const gameBoard = $("#game-board");
        gameBoard.empty();
        
        const settings = this.game.difficultySettings[this.game.difficulty];
        const totalCards = settings.rows * settings.cols;
        
        gameBoard.css({
            "grid-template-columns": `repeat(${settings.cols}, 1fr)`,
            "gap": settings.rows === 6 ? "12px" : "15px"
        });
        
        const cardSymbols = this.game.generateCardSymbols();
        
        for (let i = 0; i < totalCards; i++) {
            const card = $(`
                <div class="card" data-symbol="${cardSymbols[i]}" data-index="${i}">
                    <div class="card-front">${cardSymbols[i]}</div>
                    <div class="card-back">❓</div>
                </div>
            `);
            
            gameBoard.append(card);
        }
        
        // Adjust card height based on difficulty
        let cardHeight;
        if (settings.rows === 6 && settings.cols === 8) {
            cardHeight = "90px";
        } else if (settings.rows === 6) {
            cardHeight = "100px";
        } else {
            cardHeight = "120px";
        }
        
        $(".card").css("height", cardHeight);
    }
    
    // Timer warning methods
    showTimerWarning() {
        this.warningShown = true;
        $("#timer-warning").addClass("show");
    }
    
    hideTimerWarning() {
        this.warningShown = false;
        $("#timer-warning").removeClass("show");
    }
    
    // Show win message
    showWinMessage(gameStats) {
        $("#final-moves").text(gameStats.moves);
        $("#final-time").text(gameStats.time + "s");
        $("#final-score").text(gameStats.score);
        
        // Display stars
        const starsContainer = $("#final-rating");
        starsContainer.empty();
        for (let i = 0; i < 3; i++) {
            starsContainer.append(i < gameStats.rating ? "★" : "☆");
        }
        
        // Display new achievements
        const achievementsContainer = $("#new-achievements");
        achievementsContainer.empty();
        
        if (gameStats.achievements.length > 0) {
            achievementsContainer.append("<h4>🎖️ New Achievements</h4>");
            gameStats.achievements.forEach(achievement => {
                const badge = $(`
                    <div class="achievement-badge">
                        🏅 ${achievement.name}
                    </div>
                `);
                achievementsContainer.append(badge);
            });
        }
        
        $("#win-message").addClass("show");
    }
    
    // Show timeout message
    showTimeoutMessage(gameOverState) {
        $("#timeout-moves").text(gameOverState.moves);
        $("#timeout-matches").text(gameOverState.matches);
        $("#timeout-message").addClass("show");
    }
    
    // Hide win message
    hideWinMessage() {
        $("#win-message").removeClass("show");
    }
    
    // Hide timeout message
    hideTimeoutMessage() {
        $("#timeout-message").removeClass("show");
    }
    
    // Show pause message
    showPauseMessage() {
        $("#pause-message").addClass("show");
    }
    
    // Hide pause message
    hidePauseMessage() {
        $("#pause-message").removeClass("show");
    }
    
    // Show hint effect
    showHint(cards) {
        if (this.hintTimeout) clearTimeout(this.hintTimeout);
        
        $(cards).addClass("hint");
        $("#hint-overlay").css("opacity", "0.3");
        
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
    
    // Update theme buttons
    updateThemeButtons(selectedTheme) {
        $(".theme-btn").removeClass("active");
        $(`.theme-btn[data-theme="${selectedTheme}"]`).addClass("active");
    }
    
    // Show achievement notification
    showAchievement(achievement) {
        const notification = $(`
            <div class="achievement-badge">
                🏅 ${achievement.name}
            </div>
        `);
        
        $("#achievements-list").prepend(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    // Show notification
    showNotification(message, type = "info") {
        const notification = $(`
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#00b09b' : type === 'warning' ? '#ffb347' : '#8e2de2'};
                color: white;
                padding: 15px 25px;
                border-radius: 50px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                z-index: 2000;
                animation: slideIn 0.3s ease;
            ">
                ${message}
            </div>
        `);
        
        $("body").append(notification);
        
        setTimeout(() => {
            notification.fadeOut(() => notification.remove());
        }, 3000);
    }
}