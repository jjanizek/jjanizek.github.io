let currentIndex = 0;
let reportData = null;

const VIZ_TOKEN = process.env.VIZ_TOKEN;
const PASSWORD = process.env.PASSWORD;
const REPO_NAME = process.env.REPO_NAME;
const DIRECTORY_PATH = process.env.DIRECTORY_PATH;

async function authenticate() {
    const enteredPassword = document.getElementById('password').value;
    if (enteredPassword !== PASSWORD) {
        alert('Incorrect password!');
        return;
    }
    document.getElementById('content').style.display = 'block';
    await populateDropdown();
}

async function populateDropdown() {
    const dropdown = document.getElementById('jsonFiles');
    dropdown.innerHTML = ''; // Clear any existing options

    const url = `https://api.github.com/repos/${REPO_NAME}/contents/${DIRECTORY_PATH}`;
    console.log('Requesting URL:', url);

    const headers = {
        'Authorization': `token ${VIZ_TOKEN}`,
        'Accept': 'application/vnd.github.v3.raw'
    };
    console.log('Request headers:', headers);

    const response = await fetch(url, { headers });

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
    const url = `https://api.github.com/repos/${REPO_NAME}/contents/${selectedFilePath}`;
    console.log('Loading JSON from URL:', url);

    const headers = {
        'Authorization': `token ${VIZ_TOKEN}`,
        'Accept': 'application/vnd.github.v3.raw'
    };
    console.log('Request headers:', headers);

    const response = await fetch(url, { headers });

    if (!response.ok) {
        console.error('Failed to fetch data from GitHub:', response.status, response.statusText);
        alert('Failed to fetch data from GitHub');
        return;
    }

    reportData = JSON.parse(atob((await response.json()).content));
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
