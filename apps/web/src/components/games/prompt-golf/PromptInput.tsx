import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';

interface PromptInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const countTokens = (text: string): number => {
  return text.split(/[\s.,!?;:'"()[\]{}]+/).filter(Boolean).length;
};

export function PromptInput({
  value,
  onChange,
  placeholder = 'Enter your prompt here...',
  disabled = false,
}: PromptInputProps) {
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    setTokenCount(countTokens(value));
  }, [value]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Your Prompt</Text>
        <View style={styles.tokenCounter}>
          <Text style={styles.tokenCount}>{tokenCount}</Text>
          <Text style={styles.tokenLabel}>tokens</Text>
        </View>
      </View>

      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        editable={!disabled}
      />

      <Text style={styles.hint}>
        Tip: Craft the shortest prompt that achieves the target output
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  tokenCounter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  tokenCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  tokenLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
    padding: 16,
    fontSize: 16,
    color: '#F9FAFB',
    minHeight: 150,
    fontFamily: 'monospace',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
