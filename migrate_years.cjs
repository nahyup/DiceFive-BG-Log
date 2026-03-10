const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');

try {
  // Read existing data
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);

  let migrationCount = 0;

  // Iterate over state.games
  if (data.state && data.state.games) {
    data.state.games = data.state.games.map(game => {
      // Look for (YYYY) in the title
      const match = game.title.match(/\((\d{4})\)/);
      if (match) {
        const year = parseInt(match[1], 10);
        // Clean the title by removing the year and trimming trailing spaces
        const cleanTitle = game.title.replace(/\s*\(\d{4}\)/, '').trim();
        
        migrationCount++;
        return {
          ...game,
          title: cleanTitle,
          publishedYear: year
        };
      }
      return game;
    });
  }

  // Write back to data.json
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Migration complete! Successfully updated ${migrationCount} games with a 'publishedYear' attribute.`);

} catch (error) {
  console.error("Migration failed:", error);
}
