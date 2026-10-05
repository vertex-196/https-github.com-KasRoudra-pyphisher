import React from 'react';
import { Composition, Still } from 'remotion';
import { HeroLoop } from './HeroLoop';
import { Reel } from './Reel';
import { OgImage } from './OgImage';
import { SunFlow, SUNFLOW_FRAMES } from './SunFlow';

export const Root: React.FC = () => (
  <>
    <Composition id="HeroLoop" component={HeroLoop} width={1280} height={720} fps={30} durationInFrames={300} />
    <Composition id="HeroLoopMobile" component={HeroLoop} width={720} height={900} fps={30} durationInFrames={300} />
    <Composition id="Reel" component={Reel} width={1080} height={1920} fps={30} durationInFrames={450} />
    <Composition id="SunFlow" component={SunFlow} width={1080} height={1920} fps={30} durationInFrames={SUNFLOW_FRAMES} />
    <Still id="OgImage" component={OgImage} width={1200} height={630} />
  </>
);
