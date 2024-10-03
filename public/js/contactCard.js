import { createContactCardTaskElement } from './taskLoading.js';
import { initializeTaskEventHandlers } from './taskEventHandlers.js';

export function initializeContactCard() {
    const modal = document.getElementById('contactCardModal');
    const closeBtn = modal.querySelector('.close');

    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    function capitalizeWords(string) {
        return string.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    async function openContactCard(contact) {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.innerHTML = ''; // Clear existing content

        // Create left half for contact information
        const leftHalf = document.createElement('div');
        leftHalf.className = 'modal-half left-half';
        leftHalf.innerHTML = `
            <h2>Team Information</h2>
            <div id="contactInfo"></div>
        `;
        modalContent.appendChild(leftHalf);

        // Create right half for tasks
        const rightHalf = document.createElement('div');
        rightHalf.className = 'modal-half right-half';
        rightHalf.innerHTML = `
            <h2>${capitalizeWords(contact.firstName + ' ' + contact.lastName)}</h2>
            <div id="contactTasks"></div>
        `;
        modalContent.appendChild(rightHalf);

        // Populate contact information
        populateContactInfo(contact);

        // Fetch and populate tasks
        try {
            const tasks = await fetchTasks(contact.id);
            console.log('Fetched tasks:', tasks);

            const tasksContainer = rightHalf.querySelector('#contactTasks');
            tasksContainer.innerHTML = '';

            if (Array.isArray(tasks) && tasks.length > 0) {
                tasks.forEach(task => {
                    try {
                        const taskWithContactInfo = {
                            ...task,
                            contactId: contact.id,
                            contactName: `${contact.firstName} ${contact.lastName}`.trim()
                        };
                        const taskElement = createContactCardTaskElement(taskWithContactInfo);
                        tasksContainer.appendChild(taskElement);
                    } catch (error) {
                        console.error('Error creating task element:', error);
                        const errorElement = document.createElement('p');
                        errorElement.textContent = 'Error loading task';
                        errorElement.style.color = 'red';
                        tasksContainer.appendChild(errorElement);
                    }
                });

                initializeTaskEventHandlers();
            } else {
                tasksContainer.innerHTML = '<p>No tasks found for this contact.</p>';
            }

            modal.style.display = "block";
        } catch (error) {
            console.error('Error fetching tasks:', error);
            rightHalf.querySelector('#contactTasks').innerHTML = '<p>Error loading tasks. Please try again.</p>';
            modal.style.display = "block";
        }
    }

    function populateContactInfo(contact) {
        const contactInfoContainer = document.getElementById('contactInfo');
        contactInfoContainer.innerHTML = '';

        // Custom field mapping provided
        const customFieldMap = {
            "MhHsChdQoey1L8TSIygX": "Team Name",
            "FDp1eP7up1cxt28TNlVk": "Points Scored Per Game",
            "vSIOypBC7x354IuJoPyF": "Points Allowed Per Game",
            "u8Hna8TPSo2UrUnSk51m": "Turnover Differential",
            "Fshz9Ym00JmhM2pikH0y": "Current Streak",
            "8DFDSuBdPtpZdaVcHbD7": "Away Record",
            "E0Z5PL1ofTnbtOIoyKA6": "Passing Yards Per Game",
            "Yr4PfGn8V0OfS3ps1PwL": "Rushing Yards Per Game",
            "LuK0OmzNw6nVBnhOnGmL": "Total Yards Per Game",
            "Sm6fVvDAyHstihugRbHm": "Third Down Conversion Rate",
            "Xd0cqFjEDoVVNyr07eF8": "Passing Yards Allowed Per Game",
            "PvcHLCr5704ZzMTxxzm0": "Rushing Yards Allowed Per Game",
            "TPHpCBeMxBRxrQVvKHU6": "Total Yards Allowed Per Game",
            "EAU1vCH6xtWdwTPJWRmQ": "Sacks Per Game",
            "9RNCFHszdcmD4HRRBxYL": "Interceptions Per Game",
            "anoKZLx5l3bPT4KOtLfG": "Field Goal Success Rate",
            "Kf8Do53SG7GMy23UGaFp": "Punt Return Average Yards",
            "e0AAWKWURjtlb9YKp9Zm": "Kick Return Average Yards",
            "8DMABwgRfaUNTCve0Ea8": "Red Zone Efficiency Offense",
            "MbQ9rueDdL11kwun8nLi": "Red Zone Efficiency Defense",
            "M1KQhgbt84alQIwJjeO2": "Penalties Per Game",
            "f4wK2GbF0j46Z6X9w0sJ": "Time of Possession",
            "X1tlHQ2Yi8ze7frD43gm": "Key Player Injuries",
            "2grz1EWPToJ4qFb5g55v": "Recent Player Performance",
            "5PprgY0piffkaBFlMMNW": "Current Season",
            "4edX4DaScgBXUY2GuJcY": "League ID",
            "6TWIObC2AlOLQA7NSh4v": "Team ID",
            "b0wPMAyfFKBPTu5NIjYG": "Game ID",
            "EajoC77xTDrRVD19OLg1": "Game Status",
            "BUrlElNXrgEJnRlMI6Ao": "Odds",
            "9cP6zFWAGKEPKOqkklgM": "Bet Type",
            "F66bhMFSeKxyuiitTNnp": "Conference",
            "SvRXBe3rYxpmPSQviFMJ": "Division",
            "bNtC8up7PpVAhdVtxfsc": "Overall Standings",
            "FcYDknkZE0TiERHQPMjr": "App Category",
            "nLqxt6wz2d3ckqtwzMKN": "App Sub-Category",
            "GMPuBVHRabH0z4LcJRFx": "Stadium/Location",
            "1HGwmpbWMR6WayDWOL2k": "Logo",
            "73neDmvUzB4SsUUqsKJl": "Current Week",
            "c6BZd0gdgqGxlUdpxbEY": "Game Date",
            "s9ucCtN8WpyedW7SZhuc": "Week 4 Game ID",
            "YF25I3Il2JYGtS9JgAj9": "Money Line",
            "NZXLW5RidU4aksVSbdqR": "Money Line Analysis",
            "NpuHYX07yhYmnrjnLDoE": "Over/Under",
            "q79t8P5LeWHDVXwj3bhq": "Over/Under Analysis",
            "FddrXpUW3dpZMO9X3L0V": "Odd/Even",
            "lmCzsBAIDCkSyUEI72lH": "Odd/Even Analysis",
            "JW73SrCJuNOEaDv7A0M6": "Point Spread",
            "k3AfDCc0VJ6wkww8TnEq": "Point Spread Analysis",
            "PwJ3c8va8iAaOTB5sI8o": "Total Points",
            "D7fPSRSVfhFpkNoJNZhV": "Total Points Analysis",
            "7EDIg3NXvGCc9YrBgXTT": "Game Information",
            "sKM1rj2IK1vqerIQud4W": "Win",
            "ZMWt3J3WAVwsv99wTSWK": "Loss",
            "mDulszN2dx3ihHnCWoc2": "Point Difference",
            "6BSWdhobBP7v8dVoJT5D": "First Downs Total",
            "HBkmGyRHQg5RcIlMzh12": "First Downs Passing",
            "mH3EjKComVXMxBCpMPMe": "First Downs Rushing",
            "JZqnYvoAqyTI6xq2i3DY": "First Downs From Penalties",
            "EcKRH5HJHRF9PM02eyP7": "Third Down Efficiency",
            "ljT6e8u712a2X7BACwt4": "Fourth Down Efficiency",
            "sdbmuebdUoShp6O7DCcw": "Total Plays",
            "faTxoswEjsJ6fvjEDx3W": "Total Yards",
            "EyIx4Y1Mlij3U3RnyTJX": "Yards Per Play",
            "drybRhMklEvmntYPjkDZ": "Total Drives",
            "VEGtUtZPdHVmWuO98XVb": "Total Passing Yards",
            "tbXPNJue0JeSCrPmgm7w": "Points Against",
            "CpsxGFdiPiwvOhA18tc4": "Int Touchdowns",
            "nAVdM9kN0v2lcwqkbrph": "Safeties",
            "ZibbVgyNLX2os3F7yOD1": "Sacks",
            "WcxMq4oR9aOmX47LS99J": "Fumbles Recovered",
            "rMlaMWU6jZbVj4SzTEVe": "Interceptions Total",
            "TFaQD4XyKDYgMTpqr5KN": "Possession Time",
            "eAhwnGq23wzSgyrvlQ3B": "Interceptions",
            "fl04yCnMsn1cYtnAfn8m": "Lost Fumbles",
            "LyJgyHEnSUbXpumxupyX": "Total Turnovers",
            "lKgsx6lIdgnOb1a8mWCn": "Penalties Yards",
            "eigHDODNkZ6sWZQXQQUU": "Penalties Total",
            "BkZlaqxJ7wMXbUK7fQqx": "Red Zone Made Att",
            "YlSyHLuEeTmSHGcX4rqf": "Comp Att",
            "yo9zUjpYxkwWbOVEQMlF": "Yards Per Pass",
            "hAmobIWhC0BLd8z2mjOF": "Interceptions Thrown",
            "zgNiuPndf08RTTbZCLFT": "Sacks Yards Lost",
            "Ik3napjSmzs9FqJLsaJE": "Total Rushing Yards",
            "Bynl6ZltuxUFbnUP63P5": "Rush Attempts",
            "vL2D4BcYcCQ6An00MRPy": "Yards Per Rush",
            "hNRu3wjEKMGQxNFCrMgL": "Wins",
            "jejriwIIvcSKweI120MP": "Losses",
            "Nfevxm5ELoCTtCwgOa8C": "Games Played"
        };

        // Function to capitalize each word
        const capitalizeWords = (str) => {
            return str.replace(/\b\w/g, char => char.toUpperCase());
        };

        // Function to format field values
        const formatFieldValue = (key, value) => {
            if (value === null || value === undefined || value === '') return 'N/A';
            if (key.toLowerCase().includes('date')) {
                return capitalizeWords(new Date(value).toLocaleString());
            }
            if (Array.isArray(value)) {
                return capitalizeWords(value.join(', ') || 'N/A');
            }
            if (typeof value === 'object') {
                return capitalizeWords(JSON.stringify(value));
            }
            return capitalizeWords(String(value));
        };

        // Exclude unnecessary fields
        const excludeFields = ['id', 'attributions'];

        // **Fields to exclude from display (custom field IDs)**
        const excludeCustomFields = [
            '4edX4DaScgBXUY2GuJcY', // League ID
            '6TWIObC2AlOLQA7NSh4v', // Team ID
            'FcYDknkZE0TiERHQPMjr', // App Category
            'nLqxt6wz2d3ckqtwzMKN', // App Sub-Category
            'b0wPMAyfFKBPTu5NIjYG'  // Game ID
        ];

        // Display custom fields
        if (contact.customFields) {
            const customFieldsSection = document.createElement('div');
            // No heading, as per your request

            // Handle logo display
            let logoHandled = false;
            if (Array.isArray(contact.customFields)) {
                // If customFields is an array
                for (const customField of contact.customFields) {
                    const key = customField.id || customField.Id;
                    const value = customField.value || customField.Value;

                    // Handle logo display
                    if (key === '1HGwmpbWMR6WayDWOL2k' && !logoHandled) {
                        const logoElement = document.createElement('img');
                        logoElement.src = value;
                        logoElement.alt = 'Team Logo';
                        logoElement.style.maxWidth = '100px';
                        logoElement.style.maxHeight = '100px';
                        customFieldsSection.appendChild(logoElement);
                        logoHandled = true;
                        continue;
                    }

                    // Skip fields that are in the excludeCustomFields array
                    if (excludeCustomFields.includes(key)) {
                        continue;
                    }

                    const fieldName = customFieldMap[key] || key;
                    const fieldValue = formatFieldValue(key, value);

                    const fieldElement = document.createElement('p');
                    fieldElement.innerHTML = `<strong>${capitalizeWords(fieldName)}:</strong> ${fieldValue}`;
                    customFieldsSection.appendChild(fieldElement);
                }
            } else if (typeof contact.customFields === 'object') {
                // If customFields is an object
                for (const [key, value] of Object.entries(contact.customFields)) {
                    if (key === '1HGwmpbWMR6WayDWOL2k' && !logoHandled) {
                        const logoElement = document.createElement('img');
                        logoElement.src = value;
                        logoElement.alt = 'Team Logo';
                        logoElement.style.maxWidth = '100px';
                        logoElement.style.maxHeight = '100px';
                        customFieldsSection.appendChild(logoElement);
                        logoHandled = true;
                        continue;
                    }

                    if (excludeCustomFields.includes(key)) {
                        continue;
                    }

                    const fieldName = customFieldMap[key] || key;
                    const fieldValue = formatFieldValue(key, value);

                    const fieldElement = document.createElement('p');
                    fieldElement.innerHTML = `<strong>${capitalizeWords(fieldName)}:</strong> ${fieldValue}`;
                    customFieldsSection.appendChild(fieldElement);
                }
            }
            contactInfoContainer.appendChild(customFieldsSection);
        }

        // Ensure the modal is displayed
        const modal = document.getElementById('contactCardModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    async function fetchTasks(contactId) {
        try {
            const response = await fetch(`/get-tasks/${contactId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            throw error;
        }
    }

    return { openContactCard };
}