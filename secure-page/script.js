let currentIndex = 0;
let reportData = null;

async function authenticate() {
    const enteredPassword = document.getElementById('password').value;
    if (enteredPassword !== window.PASSWORD) {
        alert('Incorrect password!');
        return;
    }
    document.getElementById('content').style.display = 'block';
    await populateDropdown();
}

async function populateDropdown() {
    const dropdown = document.getElementById('jsonFiles');
    dropdown.innerHTML = ''; // Clear any existing options

    const url = `https://api.github.com/repos/${window.REPO_NAME}/contents/${window.DIRECTORY_PATH}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${window.VIZ_TOKEN}`,
            'Accept': 'application/vnd.github.v3.raw'
        }
    });

    if (!response.ok) {
        console.error('Failed to fetch directory contents from GitHub:', response.status, response.statusText);
        alert('Failed to fetch directory contents from GitHub');
        return;
    }

    const files = await response.json();
    files.forEach(file => {
        if (file.name.endsWith('.json')) {
            const option = document.createElement('option');
            option.value = file.path;
            option.text = file.name;
            dropdown.add(option);
        }
    });
}

async function loadJSON() {
    const selectedFilePath = document.getElementById('jsonFiles').value;
    const url = `https://api.github.com/repos/${window.REPO_NAME}/contents/${selectedFilePath}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${window.VIZ_TOKEN}`,
            'Accept': 'application/vnd.github.v3.raw'
        }
    });

    if (!response.ok) {
        console.error('Failed to fetch data from GitHub:', response.status, response.statusText);
        alert('Failed to fetch data from GitHub');
        return;
    }

    reportData = await response.json();
    currentIndex = 0;
    document.getElementById('data').style.display = 'block';
    displaySet();
}

function displaySet() {
    if (!reportData || !reportData.prompts) {
        alert('No data to display');
        return;
    }

    const questionDataDiv = document.getElementById('questionData');
    const prompt = reportData.prompts[currentIndex];
    const targets = reportData.targets_[currentIndex];
    const completion = reportData.results[currentIndex].completion;
    const gradedAs = reportData.results[currentIndex].metrics.multiple_choice_grade ? 'Correct' : 'Incorrect';

    const targetKeys = Object.keys(targets).filter(key => targets[key] === 1).join(', ');

    questionDataDiv.innerHTML = `
        <h3>Question ${currentIndex + 1}</h3>
        <p><strong>PROMPT:</strong> ${prompt}</p>
        <p><strong>Ground truth answer should be:</strong> ${targetKeys}</p>
        <p><strong>Completion:</strong> ${completion}</p>
        <p><strong>Graded as:</strong> ${gradedAs}</p>
    `;
}

function nextSet() {
    currentIndex++;
    if (currentIndex >= reportData.prompts.length) {
        alert('End of data');
        currentIndex = 0;
    }
    displaySet();
}
