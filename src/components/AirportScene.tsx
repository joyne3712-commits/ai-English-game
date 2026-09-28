import React from 'react';
import { Hotspot } from '../types';
import { AirportGameEngine } from './airport/AirportGameEngine';

export interface AirportSceneProps {
  hotspots: Hotspot[];
  activeHotspotId?: string | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  hasBoardingPass: boolean;
  playerPos: { x: number; y: number };
  onMovePlayer: (x: number, y: number) => void;
  floatingReward: { text: string; id: number } | null;
  interactingNpcId?: string | null;
  isDialogueActive?: boolean;
  playerAlert?: string | null;
  isIntroWalking?: boolean;
  onIntroWalkReachTarget?: () => void;
  inGameMinutes?: number;
  activeObjectiveId?: string | null;
  isGateChanged?: boolean;
  hasBoardingPassVerified?: boolean;
  isBoardingCelebrating?: boolean;
  isBoardingSequenceActive?: boolean;
  onBoardingSequenceComplete?: () => void;
  isBoardingEnteringDoor?: boolean;
  onBoardingEnteringDoorComplete?: () => void;
}

export const AirportScene: React.FC<AirportSceneProps> = (props) => {
  return <AirportGameEngine {...props} />;
};
