import fs from 'fs';
import path from 'path';
import { image_search } from 'duckduckgo-images-api';

async function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

async function fetchImages() {
  console.log('Fetching real board game images via DuckDuckGo...');
  
  const storePath = path.resolve(process.cwd(), 'src/store/useBoardGameStore.ts');
  let storeContent = fs.readFileSync(storePath, 'utf8');
  
  const regex = /const initialGames: Game\[\] = (\[\s*[\s\S]*?\s*\]);/;
  const match = storeContent.match(regex);
  
  if (!match) {
    console.error("Could not find initialGames array in the store.");
    return;
  }

  const games = JSON.parse(match[1]);
  const updatedGames = [];
  
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    
    // Check if we already have a real URL or an SVG
    if (game.imageUrl && game.imageUrl.startsWith('data:image')) {
      // Find a real image
      try {
        const query = `${game.title} board game box cover`;
        const results = await image_search({ query, moderate: true });
        
        if (results && results.length > 0) {
          // get the first valid looking image
          game.imageUrl = results[0].image;
          console.log(`[${i+1}/200] Found image for ${game.title}: ${game.imageUrl.substring(0, 30)}...`);
        } else {
          console.log(`[${i+1}/200] No image found for ${game.title}`);
        }
      } catch(e) {
         console.log(`[${i+1}/200] Error fetching for ${game.title}`);
      }
      
      await delay(500); // polite delay
    }
    
    updatedGames.push(game);
  }

  const gamesString = JSON.stringify(updatedGames, null, 2);
  storeContent = storeContent.replace(regex, `const initialGames: Game[] = ${gamesString};`);
  
  fs.writeFileSync(storePath, storeContent);
  console.log("Successfully updated games with real images.");
}

fetchImages();
