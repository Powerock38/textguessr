import { DATE, LANG } from './main.js';
import { random, randomChoice } from './utils.js';

async function wikipedia() {
  let hex = random(DATE, 0, 0x5B).toString(16).toUpperCase();
  if (hex.length === 1) hex = '0' + hex;

  let category = LANG === 'en' ? "Category:Featured_articles" : "Catégorie: Article de qualité";

  return await fetch(`https://${LANG}.wikipedia.org/w/api.php?action=query&format=json&prop=&list=categorymembers&formatversion=2&cmtitle=${encodeURIComponent(category)}&cmprop=ids&cmtype=page&cmlimit=max&cmsort=sortkey&cmstarthexsortkey=${hex}&origin=*`)
    .then(res => res.json())
    .then(json => randomChoice(DATE, json.query.categorymembers).pageid)
    .then(pageid => fetch(`https://${LANG}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&list=&pageids=${pageid}&formatversion=2&exchars=1200&exintro=1&explaintext=1&origin=*`))
    .then(res => res.json())
    .then(json => json.query.pages[0].title + '\n\n' + json.query.pages[0].extract);
}

async function tmdb_film() {
  return await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=47b7e6a681c8c6761e7c1943ffd4cafc&language=${LANG}&page=${random(DATE, 1, 500)}`)
    .then(res => res.json())
    .then(json => json.results.filter(tv => tv.overview))
    .then(results => {
      const movie = randomChoice(DATE, results);
      return movie.title + '\n\n' + movie.overview;
    });
}

async function tmdb_tv() {
  return await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=47b7e6a681c8c6761e7c1943ffd4cafc&language=${LANG}&page=${random(DATE, 1, 500)}`)
    .then(res => res.json())
    .then(json => json.results.filter(tv => tv.overview))
    .then(results => {
      const tv = randomChoice(DATE, results);
      return tv.name + '\n\n' + tv.overview;
    });
}

async function musixmatch() {
  const [trackId, title, artist] = await fetch(
    'https://corsproxy.io/?'
    + encodeURIComponent(
      `https://api.musixmatch.com/ws/1.1/chart.tracks.get?apikey=2c2d825eae36d569b96d768531590236&chart_name=top&f_has_lyrics=1&page=${random(DATE, 1, 100)}&page_size=1&country=${LANG}`
    )
  )
    .then(res => res.json())
    .then(json => {
      const track = json.message.body.track_list[0].track
      return [track.track_id, track.track_name, track.artist_name];
    });

  return await fetch('https://corsproxy.io/?' + encodeURIComponent(`https://api.musixmatch.com/ws/1.1/track.lyrics.get?apikey=2c2d825eae36d569b96d768531590236&track_id=${trackId}`))
    .then(res => res.json())
    .then(json => {
      const lyrics = json.message.body.lyrics.lyrics_body.split('*******')[0].trim();

      return title + '\n' + artist + '\n\n' + lyrics;
    });
}

export default {
  wikipedia,
  tmdb_film,
  tmdb_tv,
  musixmatch,
}
