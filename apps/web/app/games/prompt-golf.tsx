import { Stack } from 'expo-router';
import { PromptGolfGame } from '@/components/games/prompt-golf';

export default function PromptGolfScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Prompt Golf',
          headerShown: true,
        }}
      />
      <PromptGolfGame />
    </>
  );
}
