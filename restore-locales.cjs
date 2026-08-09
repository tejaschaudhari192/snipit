const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const localesDir = path.join(__dirname, 'frontend', 'src', 'locales');
const locales = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json');

// Get a nested property
function getNested(obj, pathParts) {
    let current = obj;
    for (let i = 0; i < pathParts.length; i++) {
        if (!current) return undefined;
        current = current[pathParts[i]];
    }
    return current;
}

// Set a nested property
function setNested(obj, pathParts, value) {
    let current = obj;
    for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) current[pathParts[i]] = {};
        current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;
}

for (const file of locales) {
    const localePath = path.join(localesDir, file);
    const currentData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
    
    // Get the old valid data from the commit before corruption (8264c5f~1)
    let oldDataText;
    try {
        oldDataText = execSync(`git show 8264c5f~1:frontend/src/locales/${file}`, { encoding: 'utf8' });
    } catch (e) {
        console.error(`Error fetching old data for ${file}:`, e.message);
        continue;
    }
    
    let oldData;
    try {
        oldData = JSON.parse(oldDataText);
    } catch (e) {
        console.error(`Error parsing old JSON for ${file}:`, e.message);
        continue;
    }

    // Get the corrupted target values from the 'tools' section in the CURRENT file
    const corruptedTitle = currentData?.tools?.title;
    const corruptedSubtitle = currentData?.tools?.subtitle;
    
    if (!corruptedTitle) {
        console.log(`Skipping ${file} - no tools.title found`);
        continue;
    }

    let restoredCount = 0;

    // Traverse the current JSON to find matching corrupted values
    function traverseAndRestore(current, pathParts = []) {
        if (typeof current === 'object' && current !== null) {
            for (let k in current) {
                traverseAndRestore(current[k], [...pathParts, k]);
            }
        } else if (typeof current === 'string') {
            // Check if this string is the corrupted translation
            if (current === corruptedTitle || current === corruptedSubtitle) {
                // Ignore the actual tools.title / tools.subtitle which are correctly these values
                const fullPath = pathParts.join('.');
                if (fullPath !== 'tools.title' && fullPath !== 'tools.subtitle') {
                    // It's corrupted! Fetch the correct value from oldData
                    const oldVal = getNested(oldData, pathParts);
                    if (oldVal && typeof oldVal === 'string' && oldVal !== current) {
                        setNested(currentData, pathParts, oldVal);
                        restoredCount++;
                    }
                }
            }
        }
    }

    traverseAndRestore(currentData);
    
    if (restoredCount > 0) {
        fs.writeFileSync(localePath, JSON.stringify(currentData, null, '\t') + '\n', 'utf8');
        console.log(`Restored ${restoredCount} values in ${file}`);
    } else {
        console.log(`No corrupted values found to restore in ${file}`);
    }
}
