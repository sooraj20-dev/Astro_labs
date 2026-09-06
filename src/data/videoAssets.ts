// src/assets/videos registry
// Directly imports all videos and audio from src/assets/videos without relying on the public folder.

// 1. no_smile/ folder
import noSmileAngry from '@/assets/videos/no_smile/angry.mp4';
import noSmileCry from '@/assets/videos/no_smile/cry.mp4';
import noSmileCurious4 from '@/assets/videos/no_smile/curious4.mp4';
import noSmileSmileMock from '@/assets/videos/no_smile/smile_mock.mp4';

// 2. smile/ folder
import smileJoker from '@/assets/videos/smile/joker.mp4';
import smileMockLaugh1 from '@/assets/videos/smile/mock_laugh1.mp4';
import smileSmile from '@/assets/videos/smile/smile.mp4';

// 3. wierd_laugh/ folder
import wierdLaughExpression from '@/assets/videos/wierd_laugh/expression.mp4';
import wierdLaughFear from '@/assets/videos/wierd_laugh/fear.mp4';
import wierdLaughLaughing from '@/assets/videos/wierd_laugh/laughing.mp4';
import wierdLaughMockLaugh from '@/assets/videos/wierd_laugh/mock_laugh.mp4';
import wierdLaughSuspicious from '@/assets/videos/wierd_laugh/suspicious.mp4';

// 4. Root assets/videos
import introSmileAudio from '@/assets/videos/intro_smile.mp3';
import introSmileVideo from '@/assets/videos/intro_smile.mp4';
import mockBeardVideo from '@/assets/videos/mock_beard.mp4';

export const ASSET_VIDEOS = {
  // Folder: no_smile
  noSmile: {
    angry: noSmileAngry,
    cry: noSmileCry,
    curious4: noSmileCurious4,
    smileMock: noSmileSmileMock,
  },
  // Folder: smile
  smile: {
    joker: smileJoker,
    mockLaugh1: smileMockLaugh1,
    smile: smileSmile,
  },
  // Folder: wierd_laugh
  wierdLaugh: {
    expression: wierdLaughExpression,
    fear: wierdLaughFear,
    laughing: wierdLaughLaughing,
    mockLaugh: wierdLaughMockLaugh,
    suspicious: wierdLaughSuspicious,
  },
  // Root assets
  intro: {
    audio: introSmileAudio,
    video: introSmileVideo,
  },
  root: {
    mockBeard: mockBeardVideo,
  },
} as const;

// Categorized lists for random selection
export const NO_SMILE_VIDEOS: string[] = [
  noSmileAngry,
  noSmileCry,
  noSmileCurious4,
  noSmileSmileMock,
];

export const SMILE_VIDEOS: string[] = [
  smileSmile,
  smileMockLaugh1,
  smileJoker,
];

export const WIERD_LAUGH_VIDEOS: string[] = [
  wierdLaughLaughing,
  wierdLaughMockLaugh,
  wierdLaughExpression,
  wierdLaughSuspicious,
  wierdLaughFear,
];

export {
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
  introSmileAudio,
  introSmileVideo,
  mockBeardVideo,
};
