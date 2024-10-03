export async function loadTasks() {
    try {
        const response = await fetch('/contacts', { method: 'GET' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Fetched contacts and currentWeek:', data);

        if (data && Array.isArray(data.contacts)) {
            console.log("Contacts array is present, processing matchups.");

            // Use the currentWeek from data
            const currentWeek = data.currentWeek || 3; // Default to week 1 if not provided
            populateMatchups(data.contacts, currentWeek);
        } else {
            console.log('No contacts array to display', data);
        }
    } catch (error) {
        console.error('Failed to load contacts:', error);
        alert('Failed to load contacts. Please try again.');
    }
}

function populateMatchups(contacts, currentWeek) {
    // Clear existing matchups
    document.querySelectorAll('.matchup-list').forEach(e => e.innerHTML = '');

    const matchupsContainer = document.querySelector('.matchup-list-container');
    if (!matchupsContainer) {
        console.error("Matchups container not found in the DOM");
        return;
    }

    console.log(`Updating matchups for week ${currentWeek}`);

    // Pair teams based on shared game IDs
    const matchups = pairTeamsByGameId(contacts);
    console.log(`Created ${matchups.length} matchups`);

    // Create and append matchup elements
    matchups.forEach((matchup, index) => {
        const matchupElement = createMatchupElement(matchup);
        console.log(`Appending matchup ${index + 1}:`, matchupElement);
        matchupsContainer.appendChild(matchupElement);
    });

    // Update matchup count and current week after appending matchups
    const columnTitle = document.querySelector('.column-title');
    if (columnTitle) {
        const currentWeekSpan = columnTitle.querySelector('#currentWeekDisplay');
        if (currentWeekSpan) {
            currentWeekSpan.textContent = currentWeek;
        }
        const matchupCountSpan = columnTitle.querySelector('.matchup-count');
        if (matchupCountSpan) {
            matchupCountSpan.textContent = `(${matchups.length})`;
            console.log(`Updated matchup count: ${matchups.length}`);
        } else {
            console.log(`Matchup count span not found`);
        }
    } else {
        console.log(`Column title not found`);
    }
}

function pairTeamsByGameId(contacts) {
    const gameIdMap = {};

    // Group teams by gameId
    contacts.forEach(contact => {
        // Directly access the 'Game ID' field
        let gameId = contact['Game ID'];

        if (!gameId) {
            console.warn('No Game ID found for contact:', contact);
            return; // Skip contacts without a Game ID
        }

        if (!gameIdMap[gameId]) {
            gameIdMap[gameId] = [];
        }
        gameIdMap[gameId].push(contact);
    });

    // Create matchups
    const matchups = [];
    Object.keys(gameIdMap).forEach(gameId => {
        const teams = gameIdMap[gameId];
        if (teams.length >= 2) {
            // Pair teams (taking the first two for simplicity)
            matchups.push({ homeTeam: teams[0], awayTeam: teams[1], gameId });
        } else {
            console.warn(`Game ID ${gameId} has less than two teams.`);
        }
    });

    console.log('Created matchups:', matchups);
    return matchups;
}

function createMatchupElement(matchup) {
    console.log('Creating matchup element for:', matchup);

    const matchupElement = document.createElement('div');
    matchupElement.className = 'matchup-card';
    matchupElement.dataset.gameId = matchup.gameId;

    // Teams Section
    const teamsSection = document.createElement('div');
    teamsSection.className = 'teams-section';

    // Home Team
    const homeTeamElement = document.createElement('div');
    homeTeamElement.className = 'team home-team';

    const homeTeamLogo = document.createElement('img');
    homeTeamLogo.src = matchup.homeTeam['1HGwmpbWMR6WayDWOL2k'] || 'default-logo.png';
    homeTeamLogo.alt = `${capitalizeWords(matchup.homeTeam.firstName)} ${capitalizeWords(matchup.homeTeam.lastName)} Logo`;

    const homeTeamName = document.createElement('h3');
    homeTeamName.textContent = `${capitalizeWords(matchup.homeTeam.firstName)} ${capitalizeWords(matchup.homeTeam.lastName)}`.trim();

    homeTeamElement.appendChild(homeTeamLogo);
    homeTeamElement.appendChild(homeTeamName);

    // VS Divider
    const vsElement = document.createElement('div');
    vsElement.className = 'vs-divider';
    vsElement.textContent = 'VS';

    // Away Team
    const awayTeamElement = document.createElement('div');
    awayTeamElement.className = 'team away-team';

    const awayTeamLogo = document.createElement('img');
    awayTeamLogo.src = matchup.awayTeam['1HGwmpbWMR6WayDWOL2k'] || 'default-logo.png';
    awayTeamLogo.alt = `${capitalizeWords(matchup.awayTeam.firstName)} ${capitalizeWords(matchup.awayTeam.lastName)} Logo`;

    const awayTeamName = document.createElement('h3');
    awayTeamName.textContent = `${capitalizeWords(matchup.awayTeam.firstName)} ${capitalizeWords(matchup.awayTeam.lastName)}`.trim();

    awayTeamElement.appendChild(awayTeamLogo);
    awayTeamElement.appendChild(awayTeamName);

    // Append teams to teams section
    teamsSection.appendChild(homeTeamElement);
    teamsSection.appendChild(vsElement);
    teamsSection.appendChild(awayTeamElement);

    // Predictions Section
    const predictionsElement = document.createElement('div');
    predictionsElement.className = 'predictions';

    // Map bet types to custom field IDs
    const betFields = {
        'Money Line': {
            prediction: 'YF25I3Il2JYGtS9JgAj9',
            analysis: 'NZXLW5RidU4aksVSbdqR',
            displayLogo: true
        },
        'Over/Under': {
            prediction: 'NpuHYX07yhYmnrjnLDoE',
            analysis: 'q79t8P5LeWHDVXwj3bhq',
            displayLogo: false
        },
        'Odd/Even': {
            prediction: 'FddrXpUW3dpZMO9X3L0V',
            analysis: 'lmCzsBAIDCkSyUEI72lH',
            displayLogo: false
        },
        'Point Spread': {
            prediction: 'JW73SrCJuNOEaDv7A0M6',
            analysis: 'k3AfDCc0VJ6wkww8TnEq',
            displayLogo: false
        },
        'Total Points': {
            prediction: 'PwJ3c8va8iAaOTB5sI8o',
            analysis: 'D7fPSRSVfhFpkNoJNZhV',
            displayLogo: false
        }
    };

    Object.keys(betFields).forEach(betType => {
        const betInfo = betFields[betType];

        // Create Bet Element
        const betElement = document.createElement('div');
        betElement.className = 'bet';

        // Bet Header
        const betHeader = document.createElement('div');
        betHeader.className = 'bet-header';

        const betName = document.createElement('div');
        betName.className = 'bet-name';
        betName.textContent = betType;

        // Predicted Value
        const predictedValue = matchup.homeTeam[betInfo.prediction] || 'N/A'; // Using homeTeam's data

        const predictedTeamName = document.createElement('div');
        predictedTeamName.className = 'predicted-team-name';
        predictedTeamName.textContent = predictedValue;

        // Only display logo for Money Line
        if (betInfo.displayLogo && (predictedValue === 'Home Team' || predictedValue === 'Away Team')) {
            const predictedTeamLogo = document.createElement('img');
            if (predictedValue === 'Home Team') {
                predictedTeamLogo.src = homeTeamLogo.src;
            } else {
                predictedTeamLogo.src = awayTeamLogo.src;
            }
            predictedTeamLogo.alt = 'Predicted Team Logo';
            betHeader.appendChild(predictedTeamLogo);
        }

        // Expand/Collapse Icon
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'toggle-icon';
        toggleIcon.innerHTML = '&#9654;'; // Right-pointing arrow

        // Append elements to bet header
        betHeader.appendChild(betName);
        betHeader.appendChild(predictedTeamName);
        betHeader.appendChild(toggleIcon);

        // AI Analysis Content
        const aiAnalysisContent = document.createElement('div');
        aiAnalysisContent.className = 'ai-analysis-content';
        aiAnalysisContent.textContent = matchup.homeTeam[betInfo.analysis] || 'No analysis available.';

        // Event Listener for Expand/Collapse
        betHeader.addEventListener('click', () => {
            aiAnalysisContent.classList.toggle('expanded');
            toggleIcon.innerHTML = aiAnalysisContent.classList.contains('expanded') ? '&#9660;' : '&#9654;'; // Toggle between down and right arrow
        });

        betElement.appendChild(betHeader);
        betElement.appendChild(aiAnalysisContent);

        predictionsElement.appendChild(betElement);
    });

    // Assemble the matchup card
    matchupElement.appendChild(teamsSection);
    matchupElement.appendChild(predictionsElement);

    // Add click event to expand/collapse predictions
    matchupElement.addEventListener('click', (event) => {
        if (!event.target.closest('.bet-header')) {
            predictionsElement.classList.toggle('expanded');
        }
    });

    return matchupElement;
}

// Helper function to capitalize each word in a string
function capitalizeWords(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}

export function createContactCardTaskElement(contact) {
    // ... implementation ...
}