/**
 * ui.js
 * Handles all UI updates and rendering
 */

class UI {
    /**
     * Hide setup screen and show game screen
     */
    static showGameScreen() {
        document.getElementById('setupScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
        // Add event delegation for answer slots
        this.setupAnswerClickHandler();
    }

    /**
     * Setup event delegation for answer slot clicks
     */
    static setupAnswerClickHandler() {
        const answersContainer = document.getElementById('answersContainer');
        answersContainer.addEventListener('click', (e) => {
            const slot = e.target.closest('.answer-slot');
            if (slot && !slot.classList.contains('revealed')) {
                const answerIndex = parseInt(slot.dataset.answerIndex);
                Events.handleAnswerClick(answerIndex);
            }
        });
    }

    /**
     * Generate team input fields based on number of teams
     */
    static generateTeamInputs() {
        const teamCount = parseInt(document.getElementById('teamCount').value) || 2;
        const container = document.getElementById('teamsContainer');
        container.innerHTML = '';

        for (let i = 0; i < teamCount; i++) {
            const teamDiv = document.createElement('div');
            teamDiv.className = 'team-input-group';
            teamDiv.dataset.teamIndex = i;
            teamDiv.innerHTML = `
                <h3>Team ${i + 1}</h3>
                <div class="players-container"></div>
                <button class="add-player-btn" data-team="${i}">+ Add Player</button>
            `;
            container.appendChild(teamDiv);

            // Add default player
            this.addPlayerInput(i, `Player 1`);
        }

        // Add event listeners to add player buttons
        document.querySelectorAll('.add-player-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const teamIndex = parseInt(btn.dataset.team);
                const playerCount = btn.parentElement.querySelectorAll('.player-input').length + 1;
                this.addPlayerInput(teamIndex, `Player ${playerCount}`);
            });
        });
    }

    /**
     * Add a player input field to a team
     */
    static addPlayerInput(teamIndex, defaultName = '') {
        const teamDiv = document.querySelector(`[data-team-index="${teamIndex}"]`);
        const container = teamDiv.querySelector('.players-container');
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-input';
        playerDiv.innerHTML = `
            <input type="text" placeholder="${defaultName}" value="${defaultName}">
            <button class="remove-player-btn" data-team="${teamIndex}">×</button>
        `;
        container.appendChild(playerDiv);

        // Add remove listener
        playerDiv.querySelector('.remove-player-btn').addEventListener('click', () => {
            playerDiv.remove();
        });
    }

    /**
     * Get team data from setup form
     * @returns {Array} Array of team objects with players
     */
    static getTeamDataFromForm() {
        const teams = [];
        document.querySelectorAll('.team-input-group').forEach((teamDiv, index) => {
            const players = [];
            teamDiv.querySelectorAll('.player-input input').forEach(input => {
                if (input.value.trim()) {
                    players.push(input.value.trim());
                }
            });

            if (players.length > 0) {
                teams.push({
                    name: `Team ${index + 1}`,
                    players: players
                });
            }
        });
        return teams;
    }

    /**
     * Render scoreboard
     */
    static renderScoreboard() {
        const container = document.getElementById('scoreboardContainer');
        const teams = gameState.getTeams();
        container.innerHTML = '';

        teams.forEach((team, index) => {
            const isActive = index === gameState.activeTeamIndex;
            const card = document.createElement('div');
            card.className = `score-card ${isActive ? 'active' : ''}`;
            card.innerHTML = `
                <div class="score-card-team">${team.name}</div>
                <div class="score-card-value">${team.score}</div>
                <div class="score-card-players">${team.players.join(', ')}</div>
            `;
            container.appendChild(card);
        });
    }

    /**
     * Render the answer board with answer slots
     */
    static renderAnswerBoard() {
        const question = gameState.getCurrentQuestion();
        const container = document.getElementById('answersContainer');
        container.innerHTML = '';

        question.answers.forEach((answer, index) => {
            const isRevealed = gameState.isAnswerRevealed(index);
            const slot = document.createElement('div');
            slot.className = `answer-slot ${isRevealed ? 'revealed' : ''}`;
            slot.dataset.answerIndex = index;
            
            if (isRevealed) {
                slot.innerHTML = `
                    <div class="answer-number">${index + 1}</div>
                    <div class="answer-text">${answer.text}</div>
                    <div class="answer-points">${answer.points} pts</div>
                `;
            } else {
                slot.innerHTML = `
                    <div class="answer-number">${index + 1}</div>
                    <div class="answer-text">?</div>
                    <div class="answer-points">${answer.points} pts</div>
                `;
            }
            
            container.appendChild(slot);
        });
    }

    /**
     * Reveal a specific answer
     */
    static revealAnswer(answerIndex) {
        const slot = document.querySelector(`[data-answer-index="${answerIndex}"]`);
        if (slot && !slot.classList.contains('revealed')) {
            const question = gameState.getCurrentQuestion();
            const answer = question.answers[answerIndex];
            
            slot.classList.add('revealed');
            slot.innerHTML = `
                <div class="answer-number">${answerIndex + 1}</div>
                <div class="answer-text">${answer.text}</div>
                <div class="answer-points">${answer.points} pts</div>
            `;
            this.playRevealAnimation();
            this.updateRoundInfo();
        }
    }

    /**
     * Play reveal animation (could add sound here)
     */
    static playRevealAnimation() {
        // Could add sound effect here
        // const audio = new Audio('reveal-sound.mp3');
        // audio.play();
    }

    /**
     * Update question display
     */
    static updateQuestion() {
        const question = gameState.getCurrentQuestion();
        document.getElementById('questionText').textContent = question.question;
    }

    /**
     * Update active team name and highlight
     */
    static updateActiveTeam() {
        const activeTeam = gameState.getActiveTeam();
        document.getElementById('activeTeamName').textContent = activeTeam.name;
        this.renderScoreboard(); // Re-render to highlight active team
    }

    /**
     * Update bank display
     */
    static updateBankDisplay() {
        const bank = gameState.getBankValue();
        document.getElementById('bankValue').textContent = bank;
    }

    /**
     * Update strike counter
     */
    static updateStrikeCounter() {
        const strikes = gameState.getStrikeDisplay();
        const strikeElement = document.getElementById('strikeCounter');
        strikeElement.textContent = strikes || 'No Strikes';
        
        // Visual feedback
        if (gameState.getStrikeCount() === 3) {
            strikeElement.style.color = 'var(--danger)';
            strikeElement.style.fontSize = '1.8rem';
        } else {
            strikeElement.style.color = 'var(--danger)';
            strikeElement.style.fontSize = '1.5rem';
        }
    }

    /**
     * Update all round info displays
     */
    static updateRoundInfo() {
        this.updateBankDisplay();
        this.updateStrikeCounter();
        this.updateActiveTeam();
    }

    /**
     * Initialize game display
     */
    static initializeGameDisplay() {
        this.renderScoreboard();
        this.updateQuestion();
        this.renderAnswerBoard();
        this.updateRoundInfo();
    }

    /**
     * Reset board for new round
     */
    static resetBoard() {
        gameState.clearBoard();
        this.renderAnswerBoard();
        this.updateRoundInfo();
    }

    /**
     * Clear the board visually while keeping state
     */
    static clearBoardVisual() {
        gameState.clearBoard();
        this.renderAnswerBoard();
    }
}