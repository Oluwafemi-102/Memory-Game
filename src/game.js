import $ from 'jquery';

// Core game logic with timer limit feature
import { ThemeManager } from './theme.js';

export class MemoryGame {
    constructor() {
        this.gameStarted = false;
        this.gameTimer = 0;
        this.timeLimit = 120; // Default time limit in seconds
        this.timerInterval = null;
        this.moves = 0;
        this.matches = 0;
        this.totalMatches = 8;
        this.difficulty = "easy";
        this.canFlip = true;
        this.firstCard = null;
        this.secondCard = null;
        this.hintsRemaining = 3;
        this.score = 0;
        this.isPaused = false;
        this.gameSpeed = 1.0;
        this.isGameOver = false;
        
        // Difficulty settings with time limits
        this.difficultySettings = {
            easy: { 
                rows: 4, cols: 4, 
                timeBonus: 1000, 
                movePenalty: 10,
                timeLimit: 180, // 3 minutes
                name: "Easy"
            },
            medium: { 
                rows: 4, cols: 6, 
                timeBonus: 1500, 
                movePenalty: 8,
                timeLimit: 150, // 2.5 minutes
                name: "Medium"
            },
            hard: { 
                rows: 6, cols: 6, 
                timeBonus: 2000, 
                movePenalty: 6,
                timeLimit: 120, // 2 minutes
                name: "Hard"
            },
            expert: { 
                rows: 6, cols: 8, 
                timeBonus: 2500, 
                movePenalty: 4,
                timeLimit: 90, // 1.5 minutes
                name: "Expert"
            }
        };
        
        this.themeManager = new ThemeManager();
        
        // Achievements system
        this.achievements = {
            firstWin: { earned: false, name: "First Victory", description: "Win your first game" },
            speedDemon: { earned: false, name: "Speed Demon", description: "Win in under 60 seconds" },
            perfectMatch: { earned: false, name: "Perfect Match", description: "Win with no mistakes" },
            memoryMaster: { earned: false, name: "Memory Master", description: "Win on expert difficulty" },
            hintSaver: { earned: false, name: "Hint Saver", description: "Win without using hints" },
            lastSecond: { earned: false, name: "Last Second", description: "Win with less than 10 seconds left" }
        };
        
        // Load best scores from localStorage
        this.bestScores = this.loadBestScores();
        this.loadAchievements();
    }
    
    // Initialize the game
    initGame() {
        this.gameStarted = false;
        this.gameTimer = 0;
        this.moves = 0;
        this.matches = 0;
        this.score = 0;
        this.canFlip = true;
        this.firstCard = null;
        this.secondCard = null;
        this.hintsRemaining = 3;
        this.isPaused = false;
        this.isGameOver = false;
        
        const settings = this.difficultySettings[this.difficulty];
        this.totalMatches = (settings.rows * settings.cols) / 2;
        this.timeLimit = settings.timeLimit;
        
        // Clear any existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        return this.getGameState();
    }
    
    // Generate card symbols
    generateCardSymbols() {
        const symbols = this.themeManager.getThemeSymbols(this.themeManager.getCurrentTheme());
        const settings = this.difficultySettings[this.difficulty];
        const totalCards = settings.rows * settings.cols;
        
        const requiredSymbols = totalCards / 2;
        const selectedSymbols = symbols.slice(0, Math.min(requiredSymbols, symbols.length));
        
        let cardSymbols = [];
        selectedSymbols.forEach(symbol => {
            cardSymbols.push(symbol, symbol);
        });
        
        while (cardSymbols.length < totalCards) {
            const extraSymbol = selectedSymbols[Math.floor(Math.random() * selectedSymbols.length)];
            cardSymbols.push(extraSymbol, extraSymbol);
        }
        
        return this.shuffleArray(cardSymbols.slice(0, totalCards));
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Start the game
    startGame() {
        if (this.gameStarted || this.isPaused || this.isGameOver) return false;
        
        this.gameStarted = true;
        
        // Start timer with game speed consideration
        this.timerInterval = setInterval(() => {
            if (!this.isPaused && this.gameStarted && !this.isGameOver) {
                this.gameTimer++;
                this.updateScore();
                
                // Check if time limit exceeded
                if (this.gameTimer >= this.timeLimit) {
                    this.gameOver('timeout');
                }
            }
        }, 1000 / this.gameSpeed);
        
        return true;
    }
    
    // Game over due to timeout
    gameOver(reason) {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        this.gameStarted = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        return {
            reason: reason,
            moves: this.moves,
            matches: this.matches,
            time: this.gameTimer,
            timeLimit: this.timeLimit
        };
    }
    
    // Toggle pause
    togglePause() {
        if (this.isGameOver) return false;
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }
    
    // Handle card flip
    flipCard(cardElement) {
        if (!this.gameStarted || this.isPaused || this.isGameOver || !this.canFlip || 
            $(cardElement).hasClass("flipped") || $(cardElement).hasClass("matched")) {
            return { valid: false };
        }
        
        $(cardElement).addClass("flipped");
        
        if (!this.firstCard) {
            this.firstCard = cardElement;
            return { valid: true, action: "first" };
        } else {
            this.secondCard = cardElement;
            this.canFlip = false;
            this.moves++;
            this.updateScore();
            
            const firstSymbol = $(this.firstCard).data("symbol");
            const secondSymbol = $(this.secondCard).data("symbol");
            
            if (firstSymbol === secondSymbol) {
                // Match found
                setTimeout(() => {
                    $(this.firstCard).addClass("matched");
                    $(this.secondCard).addClass("matched");
                    this.matches++;
                    this.updateScore(true);
                    this.resetTurn();
                    
                    // Check for win
                    if (this.matches === this.totalMatches) {
                        this.gameStarted = false;
                        if (this.timerInterval) {
                            clearInterval(this.timerInterval);
                            this.timerInterval = null;
                        }
                    }
                }, 500 / this.gameSpeed);
                
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
                }, 1000 / this.gameSpeed);
                
                return { 
                    valid: true, 
                    action: "second", 
                    match: false, 
                    moves: this.moves 
                };
            }
        }
    }
    
    resetTurn() {
        this.firstCard = null;
        this.secondCard = null;
        this.canFlip = true;
    }
    
    // Use hint
    useHint() {
        if (this.hintsRemaining <= 0 || this.isGameOver) {
            return { success: false, message: "No hints remaining" };
        }
        
        this.hintsRemaining--;
        
        const unflippedCards = $(".card:not(.flipped):not(.matched)");
        if (unflippedCards.length === 0) {
            return { success: false, message: "No cards to hint" };
        }
        
        const randomIndex = Math.floor(Math.random() * unflippedCards.length);
        const hintCard = unflippedCards[randomIndex];
        const cardSymbol = $(hintCard).data("symbol");
        const matchingCard = $(`.card[data-symbol="${cardSymbol}"]:not(.flipped):not(.matched)`)
            .not(hintCard)[0];
        
        return { 
            success: true, 
            hintsRemaining: this.hintsRemaining,
            cards: [hintCard, matchingCard]
        };
    }
    
    // Update score
    updateScore(isMatch = false) {
        const settings = this.difficultySettings[this.difficulty];
        
        // Base score calculation
        let newScore = 1000 - (this.moves * settings.movePenalty);
        
        // Time bonus (more points for faster completion)
        newScore += Math.max(0, settings.timeBonus - (this.gameTimer * 10));
        
        // Time remaining bonus
        const timeRemaining = Math.max(0, this.timeLimit - this.gameTimer);
        newScore += timeRemaining * 5;
        
        if (isMatch) {
            newScore += 50 * this.gameSpeed;
        }
        
        const difficultyMultiplier = {
            easy: 1,
            medium: 1.5,
            hard: 2,
            expert: 3
        };
        
        newScore *= difficultyMultiplier[this.difficulty] || 1;
        this.score = Math.max(0, Math.floor(newScore));
        
        return this.score;
    }
    
    // Check if game is complete
    checkGameComplete() {
        return this.matches === this.totalMatches;
    }
    
    // End the game with win
    endGame() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.updateScore();
        const rating = this.calculateRating();
        const newAchievements = this.checkAchievements();
        const newBestScore = this.updateBestScore();
        
        return {
            moves: this.moves,
            time: this.gameTimer,
            timeLimit: this.timeLimit,
            score: this.score,
            rating: rating,
            difficulty: this.difficulty,
            achievements: newAchievements,
            newBestScore: newBestScore
        };
    }
    
    // Calculate star rating
    calculateRating() {
        let stars = 3;
        
        const settings = this.difficultySettings[this.difficulty];
        const expectedMoves = this.totalMatches * 2;
        const expectedTime = this.totalMatches * 5;
        
        if (this.moves > expectedMoves * 1.5 || this.gameTimer > expectedTime * 2) {
            stars = 1;
        } else if (this.moves > expectedMoves || this.gameTimer > expectedTime) {
            stars = 2;
        }
        
        if (this.moves === this.totalMatches * 2) {
            stars = 3;
        }
        
        return stars;
    }
    
    // Check achievements
    checkAchievements() {
        const newAchievements = [];
        
        if (!this.achievements.firstWin.earned) {
            this.achievements.firstWin.earned = true;
            newAchievements.push(this.achievements.firstWin);
        }
        z
        if (!this.achievements.speedDemon.earned && this.gameTimer < 60) {
            this.achievements.speedDemon.earned = true;
            newAchievements.push(this.achievements.speedDemon);
        }
        
        if (!this.achievements.perfectMatch.earned && this.moves === this.totalMatches * 2) {
            this.achievements.perfectMatch.earned = true;
            newAchievements.push(this.achievements.perfectMatch);
        }
        
        if (!this.achievements.memoryMaster.earned && this.difficulty === "expert") {
            this.achievements.memoryMaster.earned = true;
            newAchievements.push(this.achievements.memoryMaster);
        }
        
        if (!this.achievements.hintSaver.earned && this.hintsRemaining === 3) {
            this.achievements.hintSaver.earned = true;
            newAchievements.push(this.achievements.hintSaver);
        }
        
        if (!this.achievements.lastSecond.earned && (this.timeLimit - this.gameTimer) < 10) {
            this.achievements.lastSecond.earned = true;
            newAchievements.push(this.achievements.lastSecond);
        }
        
        this.saveAchievements();
        
        return newAchievements;
    }
    
    // Update best score - FIXED VERSION
updateBestScore() {
    const currentBest = this.bestScores[this.difficulty] || 0;
    console.log('Current best:', currentBest, 'New score:', this.score); // Debug log
    
    if (this.score > currentBest) {
        this.bestScores[this.difficulty] = this.score;
        this.saveBestScores();
        console.log('New best score saved!', this.difficulty, this.score); // Debug log
        return true;
    }
    return false;
}

// Save best scores to localStorage - FIXED
saveBestScores() {
    try {
        localStorage.setItem('memoryGameBestScores', JSON.stringify(this.bestScores));
        console.log('Scores saved:', this.bestScores); // Debug log
    } catch (e) {
        console.error('Failed to save best scores:', e);
    }
}

// Load best scores from localStorage - FIXED
loadBestScores() {
    try {
        const saved = localStorage.getItem('memoryGameBestScores');
        console.log('Loaded from localStorage:', saved); // Debug log
        
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load best scores:', e);
    }
    
    // Default scores if nothing saved
    return {
        easy: 0,
        medium: 0,
        hard: 0,
        expert: 0
    };
}

// Reset best scores (useful for testing)
resetBestScores() {
    this.bestScores = {
        easy: 0,
        medium: 0,
        hard: 0,
        expert: 0
    };
    this.saveBestScores();
    return this.bestScores;
}
    
    // Save/Load methods
    saveAchievements() {
        const achievementsData = {};
        Object.keys(this.achievements).forEach(key => {
            achievementsData[key] = this.achievements[key].earned;
        });
        localStorage.setItem('memoryGameAchievements', JSON.stringify(achievementsData));
    }
    
    loadAchievements() {
        const saved = localStorage.getItem('memoryGameAchievements');
        if (saved) {
            const achievementsData = JSON.parse(saved);
            Object.keys(achievementsData).forEach(key => {
                if (this.achievements[key]) {
                    this.achievements[key].earned = achievementsData[key];
                }
            });
        }
    }
    
    
    
    
    // Settings
    setDifficulty(difficulty) {
        if (this.difficultySettings[difficulty]) {
            this.difficulty = difficulty;
            return true;
        }
        return false;
    }
    
    setTheme(theme) {
        return this.themeManager.setTheme(theme);
    }
    
    setGameSpeed(speed) {
        this.gameSpeed = Math.max(0.5, Math.min(2, speed));
        
        // Restart timer with new speed
        if (this.gameStarted && !this.isPaused && !this.isGameOver) {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
            }
            this.timerInterval = setInterval(() => {
                if (!this.isPaused && this.gameStarted && !this.isGameOver) {
                    this.gameTimer++;
                    this.updateScore();
                    
                    if (this.gameTimer >= this.timeLimit) {
                        this.gameOver('timeout');
                    }
                }
            }, 1000 / this.gameSpeed);
        }
        
        return this.gameSpeed;
    }
    
    // Get game state
    getGameState() {
        const settings = this.difficultySettings[this.difficulty];
        const timeRemaining = Math.max(0, this.timeLimit - this.gameTimer);
        const timePercentage = Math.min(100, (this.gameTimer / this.timeLimit) * 100);
        
        return {
            started: this.gameStarted,
            paused: this.isPaused,
            gameOver: this.isGameOver,
            timer: this.gameTimer,
            timeLimit: this.timeLimit,
            timeRemaining: timeRemaining,
            timePercentage: timePercentage,
            moves: this.moves,
            matches: this.matches,
            totalMatches: this.totalMatches,
            difficulty: this.difficulty,
            difficultyName: settings.name,
            hintsRemaining: this.hintsRemaining,
            score: this.score,
            canFlip: this.canFlip,
            speed: this.gameSpeed,
            theme: this.themeManager.getCurrentTheme(),
            progress: Math.floor((this.matches / this.totalMatches) * 100),
            bestScores: this.bestScores
        };
    }
}