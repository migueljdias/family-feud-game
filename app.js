/**
 * app.js
 * Main application logic and event handlers
 */

/**
 * Events namespace - contains all event handlers
 */
const Events = {
    /**
     * Handle setup screen team count change
     */
    handleTeamCountChange() {
        document.getElementById('teamCount').addEventListener('change', () => {
            UI.generateTeamInputs();
        });
    },

    /**
     * Handle generate teams button
     */
    handleGenerateTeams() {
        document.getElementById('generateTeamsBtn').addEventListener('click', () => {
            UI.generateTeamInputs();
        });
    },

    /**
     * Handle start game button
     */
    handleStartGame() {
        document.getElementById('startGameBtn').addEventListener('click', () => {
            const teams = UI.getTeamDataFromForm();
            
            if (teams.length < 2) {
                alert('Please set up at least 2 teams with players!');
                return;
            }

            gameState.initializeTeams(teams);
            UI.showGameScreen();
            UI.initializeGameDisplay();
        });
    },

    /**
     * Handle answer click on the board
     */
    handleAnswerClick(answerIndex) {
        const answer = gameState.revealAnswer(answerIndex);
        if (answer) {
            UI.revealAnswer(answerIndex);
        }
    },

    /**
     * Handle next question button
     */
    handleNextQuestion() {
        document.getElementById('nextQuestionBtn').addEventListener('click', () => {
            gameState.nextQuestion();
            UI.updateQuestion();
            UI.renderAnswerBoard();
            UI.updateRoundInfo();
        });
    },

    /**
     * Handle clear board button
     */
    handleClearBoard() {
        document.getElementById('clearBoardBtn').addEventListener('click', () => {
            if (confirm('Clear the board? Unanswered questions will be hidden.')) {
                UI.clearBoardVisual();
            }
        });
    },

    /**
     * Handle log strike button
     */
    handleLogStrike() {
        document.getElementById('logStrikeBtn').addEventListener('click', () => {
            const continueGame = gameState.logStrike();
            UI.updateStrikeCounter();

            if (!continueGame) {
                alert('Three strikes! Points banked. Moving to next team...');
                gameState.nextQuestion();
                UI.updateQuestion();
                UI.renderAnswerBoard();
                UI.updateRoundInfo();
            }
        });
    },

    /**
     * Handle switch team button
     */
    handleSwitchTeam() {
        document.getElementById('switchTeamBtn').addEventListener('click', () => {
            // Bank current points before switching
            const pointsBanked = gameState.bankPoints();
            gameState.switchActiveTeam();
            gameState.currentRound = {
                revealed: [],
                bank: 0,
                strikes: 0
            };
            UI.renderAnswerBoard();
            UI.updateRoundInfo();
        });
    },

    /**
     * Handle bank points button
     */
    handleBankPoints() {
        document.getElementById('bankPointsBtn').addEventListener('click', () => {
            const pointsBanked = gameState.bankPoints();
            if (pointsBanked > 0) {
                alert(`${gameState.getActiveTeam().name} banked ${pointsBanked} points!`);
            }
            gameState.currentRound.bank = 0;
            gameState.currentRound.strikes = 0;
            gameState.currentRound.revealed = [];
            UI.updateRoundInfo();
            UI.renderAnswerBoard();
        });
    },

    /**
     * Handle reset game button
     */
    handleResetGame() {
        document.getElementById('resetGameBtn').addEventListener('click', () => {
            if (confirm('Reset the entire game? This cannot be undone.')) {
                gameState.resetGame();
                UI.initializeGameDisplay();
            }
        });
    },

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only listen for number keys 1-8 when game screen is active
            if (!document.getElementById('gameScreen').classList.contains('active')) {
                return;
            }

            const key = parseInt(e.key);
            if (key >= 1 && key <= 8) {
                const answerIndex = key - 1;
                const question = gameState.getCurrentQuestion();
                
                if (answerIndex < question.answers.length) {
                    Events.handleAnswerClick(answerIndex);
                }
            }

            // S key for strike
            if (e.key.toUpperCase() === 'S') {
                document.getElementById('logStrikeBtn').click();
            }

            // T key for team switch
            if (e.key.toUpperCase() === 'T') {
                document.getElementById('switchTeamBtn').click();
            }

            // B key for bank points
            if (e.key.toUpperCase() === 'B') {
                document.getElementById('bankPointsBtn').click();
            }

            // N key for next question
            if (e.key.toUpperCase() === 'N') {
                document.getElementById('nextQuestionBtn').click();
            }
        });
    }
};

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    Events.handleTeamCountChange();
    Events.handleGenerateTeams();
    Events.handleStartGame();
    Events.handleNextQuestion();
    Events.handleClearBoard();
    Events.handleLogStrike();
    Events.handleSwitchTeam();
    Events.handleBankPoints();
    Events.handleResetGame();
    Events.handleKeyboardShortcuts();
}

/**
 * Initialize app on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Set up initial team inputs
    UI.generateTeamInputs();
    
    // Initialize all event listeners
    initializeEventListeners();

    console.log('Family Feud Game initialized!');
    console.log('Keyboard shortcuts:');
    console.log('  1-8: Reveal answer slot');
    console.log('  S: Log strike');
    console.log('  T: Switch team');
    console.log('  B: Bank points');
    console.log('  N: Next question');
});