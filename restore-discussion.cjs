const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const localesDir = path.join(__dirname, 'frontend', 'src', 'locales');
const locales = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

for (const file of locales) {
    const localePath = path.join(localesDir, file);
    const currentData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
    
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

    let restored = false;
    
    // Ensure common.discussion object exists
    if (!currentData.common.discussion) {
        currentData.common.discussion = {};
    }

    if (oldData.common && oldData.common.open_discussion) {
        currentData.common.discussion.open = oldData.common.open_discussion;
        restored = true;
    }
    
    if (oldData.common && oldData.common.discussion) {
        currentData.common.discussion.title = oldData.common.discussion;
        restored = true;
    }

    if (restored) {
        fs.writeFileSync(localePath, JSON.stringify(currentData, null, '\t') + '\n', 'utf8');
        console.log(`Restored discussion keys in ${file}`);
    }
}
