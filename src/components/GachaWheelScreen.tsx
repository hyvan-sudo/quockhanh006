import React from 'react';
import { Player, WonReward, RoomGachaState, GachaSpinEvent } from '../types';
import { HostSpectatorScreen } from './HostSpectatorScreen';
import { PlayerGachaScreen } from './PlayerGachaScreen';

interface GachaWheelScreenProps {
  players: Player[];
  userPlayer: Player;
  gachaState: RoomGachaState;
  onTriggerSpin: (spinEvent: GachaSpinEvent) => void;
  onAdvanceTurn: () => void;
  onFinishMyTurn: () => void;
  onTriggerSpinOnBehalf?: (playerId: string) => void;
  onRecordReward: (reward: WonReward) => void;
  onGoBackToLanding: () => void;
  onOpenHistory: () => void;
}

export const GachaWheelScreen: React.FC<GachaWheelScreenProps> = ({
  players,
  userPlayer,
  gachaState,
  onTriggerSpin,
  onAdvanceTurn,
  onFinishMyTurn,
  onTriggerSpinOnBehalf,
  onRecordReward,
  onGoBackToLanding,
  onOpenHistory,
}) => {
  const isHost = !!userPlayer.isHost;

  if (isHost) {
    return (
      <HostSpectatorScreen
        players={players}
        userPlayer={userPlayer}
        gachaState={gachaState}
        onTriggerSpinOnBehalf={onTriggerSpinOnBehalf}
        onAdvanceTurn={onAdvanceTurn}
        onRecordReward={onRecordReward}
        onGoBackToLanding={onGoBackToLanding}
        onOpenHistory={onOpenHistory}
      />
    );
  }

  return (
    <PlayerGachaScreen
      players={players}
      userPlayer={userPlayer}
      gachaState={gachaState}
      onPlayerTriggerSpin={onTriggerSpin}
      onFinishMyTurn={onFinishMyTurn}
      onGoBackToLanding={onGoBackToLanding}
      onOpenHistory={onOpenHistory}
    />
  );
};
