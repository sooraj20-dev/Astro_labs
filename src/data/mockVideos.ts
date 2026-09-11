import {
  noSmileAngry,
  noSmileCry,
  noSmileCurious4,
  noSmileSmileMock,
  smileJoker,
  smileMockLaugh1,
  smileSmile,
  wierdLaughExpression,
  wierdLaughFear,
  wierdLaughLaughing,
  wierdLaughMockLaugh,
  wierdLaughSuspicious,
  mockBeardVideo,
} from './videoAssets';

export interface MockVideo {
  id: string;
  src: string;
  intensity: 'mild' | 'medium' | 'extreme';
  category: 'no_smile' | 'smile' | 'wierd_laugh';
  caption: string;
  transliteration: string;
  character?: string;
}

export const MOCK_VIDEOS: MockVideo[] = [
  // ========================================================
  // 1. NO_SMILE FOLDER VIDEOS (src/assets/videos/no_smile/)
  // ========================================================
  {
    id: 'no-smile-01',
    src: noSmileSmileMock,
    intensity: 'mild',
    category: 'no_smile',
    caption: 'മെല്ലെ ചിരിച്ചാൽ മതി, പല്ല് കൊഴിഞ്ഞു പോകും!',
    transliteration: 'Melle chirichaal mathi, pallu kozhinju pokum!',
    character: 'ജഗതി ശ്രീകുമാർ',
  },
  {
    id: 'no-smile-02',
    src: noSmileCurious4,
    intensity: 'mild',
    category: 'no_smile',
    caption: 'വലിയ ഗൗരവക്കാരനാണെന്ന ഭാവമൊക്കെ പോയോ?',
    transliteration: 'Valiya gowravakkaarananenna bhaavamokke poyo?',
    character: 'കുതിരവട്ടം പപ്പു',
  },
  {
    id: 'no-smile-03',
    src: noSmileAngry,
    intensity: 'medium',
    category: 'no_smile',
    caption: 'അറസ്റ്റ് വാറണ്ട് റെഡിയാണ്, ചിരി അടിയന്തരമായി നിർത്തിക്കോളൂ!',
    transliteration: 'Arrest warrant ready aaanu, chiri adiyantharamaayi nirthikkoloo!',
    character: 'കൊച്ചിൻ ഹനീഫ / തിലകൻ',
  },
  {
    id: 'no-smile-04',
    src: noSmileCry,
    intensity: 'medium',
    category: 'no_smile',
    caption: 'കരഞ്ഞു മെഴുകല്ലേ പൊന്നേ, ടിഷ്യൂ എടുത്തു തരട്ടേ?',
    transliteration: 'Karanju mezhukalle ponne, tissue eduthu tharatte?',
    character: 'സലീം കുമാർ',
  },

  // ========================================================
  // 2. SMILE FOLDER VIDEOS (src/assets/videos/smile/)
  // ========================================================
  {
    id: 'smile-01',
    src: smileSmile,
    intensity: 'mild',
    category: 'smile',
    caption: 'എന്താ ചുണ്ടിലൊരു കള്ളച്ചിരി?',
    transliteration: 'Entha chundiloru kallachiri?',
    character: 'ഇന്നസെന്റ്',
  },
  {
    id: 'smile-02',
    src: smileMockLaugh1,
    intensity: 'medium',
    category: 'smile',
    caption: 'അടിയന്തര സാഹചര്യം! ഇവിടെ ചിരി സുനാമി വരുന്നു!',
    transliteration: 'Adiyanthara saahacharyam! Ivide chiri tsunami varunnu!',
    character: 'കുതിരവട്ടം പപ്പു',
  },
  {
    id: 'smile-03',
    src: smileJoker,
    intensity: 'extreme',
    category: 'smile',
    caption: 'ഇത് കോമാളി കളിക്കാൻ പറ്റിയ സ്ഥലമല്ല!',
    transliteration: 'Ithu komali kalikkan pattiya sthalamalla!',
    character: 'ജോക്കർ / ജഗതി',
  },

  // ========================================================
  // 3. WIERD_LAUGH FOLDER VIDEOS (src/assets/videos/wierd_laugh/)
  // ========================================================
  {
    id: 'wierd-01',
    src: wierdLaughLaughing,
    intensity: 'extreme',
    category: 'wierd_laugh',
    caption: 'അയ്യോ കൺട്രോൾ പോയി! വാ മൂട് മനുഷ്യാ!',
    transliteration: 'Ayyo control poyi! Vaa moodu manushyaa!',
    character: 'സലീം കുമാർ',
  },
  {
    id: 'wierd-02',
    src: wierdLaughMockLaugh,
    intensity: 'medium',
    category: 'wierd_laugh',
    caption: 'മതി ചിരിച്ചത്, ഇവിടെ ആരും തമാശ പറഞ്ഞില്ല!',
    transliteration: 'Mathi chirichathu, ivide aarum thamaasha paranjilla!',
    character: 'തിലകൻ',
  },
  {
    id: 'wierd-03',
    src: wierdLaughSuspicious,
    intensity: 'medium',
    category: 'wierd_laugh',
    caption: 'ഇവൻ എന്തോ കാര്യമായി ഒപ്പിച്ചിട്ടുണ്ട്!',
    transliteration: 'Ivan entho kaaryamaayi oppichittundu!',
    character: 'സിഐഡി മൂസ',
  },
  {
    id: 'wierd-04',
    src: wierdLaughExpression,
    intensity: 'medium',
    category: 'wierd_laugh',
    caption: 'ക്യാമറയുടെ മുന്നിൽ തന്നെ ഇളിക്കണം എന്ന് വല്ല നിർബന്ധവുമുണ്ടോ?',
    transliteration: 'Camerayude munnil thanne ilikkanam ennu valla nirbandhavumundo?',
    character: 'മോഹൻലാൽ',
  },
  {
    id: 'wierd-05',
    src: wierdLaughFear,
    intensity: 'extreme',
    category: 'wierd_laugh',
    caption: 'ഇത്രക്ക് പേടിക്കാൻ ഞാൻ ആരാ ഭൂതമോ? ചിരിക്കല്ലേ!',
    transliteration: 'Ithrakku pedikkan njan aara bhoothamo? Chirikkalle!',
    character: 'മുകേഷ് / ജഗദീഷ്',
  },
  {
    id: 'beard-01',
    src: mockBeardVideo,
    intensity: 'medium',
    category: 'wierd_laugh',
    caption: 'ഈ ചിരിക്ക് ഞാൻ ഒരു കേസ് ചാർജ്ജ് ചെയ്യും!',
    transliteration: 'Ee chirikku njan oru case charge cheyyum!',
    character: 'സ്ഫടികം ചാക്കോ മാഷ്',
  },
];

/**
 * Filter mock videos by folder category.
 */
export function getMockVideosByCategory(category: 'no_smile' | 'smile' | 'wierd_laugh'): MockVideo[] {
  return MOCK_VIDEOS.filter((video) => video.category === category);
}

/**
 * Filter mock videos by intensity.
 */
export function getMockVideosByIntensity(intensity: 'mild' | 'medium' | 'extreme'): MockVideo[] {
  return MOCK_VIDEOS.filter((video) => video.intensity === intensity);
}

// Global cycle history of played videos to guarantee NO repetition until all videos have been played
const playedVideoIds = new Set<string>();
let lastPlayedVideoId: string | null = null;

/**
 * Reset the played history if needed.
 */
export function resetPlayedVideosHistory(): void {
  playedVideoIds.clear();
  lastPlayedVideoId = null;
}

/**
 * Randomly select a mock video matching the given intensity or category without
 * repeating ANY video until all available videos in the library have been watched.
 */
export function selectRandomMockVideo(
  intensity: 'mild' | 'medium' | 'extreme',
  previousVideoId: string | null = null,
  categoryPreference?: 'no_smile' | 'smile' | 'wierd_laugh'
): MockVideo {
  let eligibleVideos = categoryPreference
    ? getMockVideosByCategory(categoryPreference)
    : getMockVideosByIntensity(intensity);

  if (eligibleVideos.length === 0) {
    eligibleVideos = MOCK_VIDEOS;
  }

  // 1. Filter out videos that have already been played in the current cycle
  let unplayed = eligibleVideos.filter(
    (v) => !playedVideoIds.has(v.id) && !playedVideoIds.has(v.src)
  );

  // 2. If all eligible videos have been exhausted, reset cycle while keeping last played to prevent consecutive repeat
  if (unplayed.length === 0) {
    playedVideoIds.clear();
    if (lastPlayedVideoId) {
      playedVideoIds.add(lastPlayedVideoId);
    }
    unplayed = eligibleVideos.filter(
      (v) => !playedVideoIds.has(v.id) && !playedVideoIds.has(v.src)
    );
    if (unplayed.length === 0) {
      unplayed = eligibleVideos;
    }
  }

  // 3. Exclude previousVideoId if more than one option exists
  if (previousVideoId && unplayed.length > 1) {
    const withoutPrev = unplayed.filter(
      (v) => v.id !== previousVideoId && v.src !== previousVideoId
    );
    if (withoutPrev.length > 0) {
      unplayed = withoutPrev;
    }
  }

  const randomIndex = Math.floor(Math.random() * unplayed.length);
  const selected = unplayed[randomIndex];

  // Mark as played in current cycle
  playedVideoIds.add(selected.id);
  playedVideoIds.add(selected.src);
  lastPlayedVideoId = selected.id;

  return selected;
}
