/**
 * gameState.js
 * Manages all game state and logic with answer verification
 */

class GameState {
    constructor() {
        this.teams = [];
        this.currentQuestionIndex = 0;
        this.activeTeamIndex = 0;
        this.currentRound = {
            revealed: [],
            bank: 0,
            strikes: 0
        };
        this.gameStarted = false;
    }

    /**
     * Initialize teams with player data
     * @param {Array} teamData - Array of team objects with players
     */
    initializeTeams(teamData) {
        this.teams = teamData.map(team => ({
            ...team,
            score: 0
        }));
        this.gameStarted = true;
    }

    /**
     * Get the current question
     * @returns {Object} Current question object
     */
    getCurrentQuestion() {
        return GAME_QUESTIONS[this.currentQuestionIndex];
    }

    /**
     * Get current active team
     * @returns {Object} Current team object
     */
    getActiveTeam() {
        return this.teams[this.activeTeamIndex];
    }

    /**
     * Get all teams with current scores
     * @returns {Array} Array of team objects
     */
    getTeams() {
        return this.teams;
    }

    /**
     * Verify an answer and check if it matches any of the top 8 answers
     * @param {string} userAnswer - The answer entered by the user
     * @returns {Object} { found: boolean, answer: Object or null, answerIndex: number or -1 }
     */
    verifyAnswer(userAnswer) {
        const question = this.getCurrentQuestion();
        const cleanAnswer = userAnswer.trim().toLowerCase();

        // Check each answer
        for (let i = 0; i < question.answers.length; i++) {
            if (this.currentRound.revealed.includes(i)) {
                continue; // Skip already revealed answers
            }

            const answerText = question.answers[i].text.toLowerCase();
            
            // Check for exact or partial match
            if (this.isAnswerMatch(cleanAnswer, answerText)) {
                return {
                    found: true,
                    answer: question.answers[i],
                    answerIndex: i
                };
            }
        }

        return {
            found: false,
            answer: null,
            answerIndex: -1
        };
    }

    /**
     * Check if user answer matches the expected answer
     * Allows for partial matches and common variations
     * @param {string} userAnswer - Cleaned user input
     * @param {string} expectedAnswer - Cleaned expected answer
     * @returns {boolean}
     */
    isAnswerMatch(userAnswer, expectedAnswer) {
        // Exact match
        if (userAnswer === expectedAnswer) {
            return true;
        }

        // Check if user answer contains key words from expected answer
        const userWords = userAnswer.split(' ').filter(w => w.length > 2);
        const expectedWords = expectedAnswer.split(' ').filter(w => w.length > 2);

        // All expected words should be in user answer
        if (userWords.length > 0 && expectedWords.length > 0) {
            const matchCount = expectedWords.filter(word => 
                userWords.some(uWord => uWord.includes(word) || word.includes(uWord))
            ).length;
            
            return matchCount >= Math.ceil(expectedWords.length * 0.6); // 60% match
        }

        return false;
    }

    /**
     * Reveal an answer
     * @param {number} answerIndex - Index of answer to reveal
     * @returns {Object} Answer object
     */
    revealAnswer(answerIndex) {
        const question = this.getCurrentQuestion();
        
        if (!this.currentRound.revealed.includes(answerIndex)) {
            const answer = question.answers[answerIndex];
            this.currentRound.revealed.push(answerIndex);
            this.currentRound.bank += answer.points;
            return answer;
        }

        return null;
    }

    /**
     * Check if answer is already revealed
     * @param {number} answerIndex - Index to check
     * @returns {boolean} True if revealed
     */
    isAnswerRevealed(answerIndex) {
        return this.currentRound.revealed.includes(answerIndex);
    }

    /**
     * Log a strike (wrong answer)
     * @returns {boolean} True if game continues, false if 3 strikes reached
     */
    logStrike() {
        this.currentRound.strikes++;
        return this.currentRound.strikes < 3;
    }

    /**
     * Get current strike count
     * @returns {number} Number of strikes (0-3)
     */
    getStrikeCount() {
        return this.currentRound.strikes;
    }

    /**
     * Get strike display string (X, XX, XXX)
     * @returns {string} Strike display
     */
    getStrikeDisplay() {
        return "X".repeat(this.currentRound.strikes);
    }

    /**
     * Bank the current round points to active team
     * @returns {number} Points banked
     */
    bankPoints() {
        const points = this.currentRound.bank;
        this.teams[this.activeTeamIndex].score += points;
        return points;
    }

    /**
     * Switch to next active team
     * @returns {Object} New active team
     */
    switchActiveTeam() {
        this.activeTeamIndex = (this.activeTeamIndex + 1) % this.teams.length;
        return this.getActiveTeam();
    }

    /**
     * Move to next question and reset round
     */
    nextQuestion() {
        // Bank any remaining points to active team before moving on
        if (this.currentRound.bank > 0) {
            this.bankPoints();
        }

        // Reset round
        this.currentRound = {
            revealed: [],
            bank: 0,
            strikes: 0
        };

        // Move to next question, loop back to start if at end
        this.currentQuestionIndex = (this.currentQuestionIndex + 1) % GAME_QUESTIONS.length;
        
        // Rotate to next team
        this.switchActiveTeam();
    }

    /**
     * Get current round bank value
     * @returns {number} Bank value
     */
    getBankValue() {
        return this.currentRound.bank;
    }

    /**
     * Reset entire game
     */
    resetGame() {
        this.currentQuestionIndex = 0;
        this.activeTeamIndex = 0;
        this.currentRound = {
            revealed: [],
            bank: 0,
            strikes: 0
        };
        this.teams.forEach(team => team.score = 0);
    }

    /**
     * Get current question index
     * @returns {number} Current question index
     */
    getCurrentQuestionIndex() {
        return this.currentQuestionIndex;
    }
}

// Create global game state instance
const gameState = new GameState();