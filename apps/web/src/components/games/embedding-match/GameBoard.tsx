import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MatchCard } from './MatchCard';

export interface Card {
  id: string;
  text: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameBoardProps {
  cards: Card[];
  onCardPress: (cardId: string) => void;
  disabled?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ cards, onCardPress, disabled = false }) => {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {cards.map((card) => (
          <View key={card.id} style={styles.cardContainer}>
            <MatchCard
              id={card.id}
              text={card.text}
              isFlipped={card.isFlipped}
              isMatched={card.isMatched}
              onPress={() => onCardPress(card.id)}
              disabled={disabled}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 8,
  },
  cardContainer: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    width: '23%' as any,
    minWidth: 80,
    maxWidth: 140,
  },
});
