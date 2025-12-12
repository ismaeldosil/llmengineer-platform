import { View, Text, StyleSheet, TextInput, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';

interface CodeCompletionProps {
  question: string;
  codeTemplate: string; // Code with _____ placeholder
  correctAnswer: string;
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
  disabled?: boolean;
  showResult?: boolean;
  language?: 'javascript' | 'python' | 'typescript';
}

export function CodeCompletion({
  question,
  codeTemplate,
  correctAnswer,
  userAnswer,
  onAnswerChange,
  disabled = false,
  showResult = false,
  language = 'javascript',
}: CodeCompletionProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showResult) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [showResult, fadeAnim]);

  // Auto-focus on mount
  useEffect(() => {
    if (!disabled) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [disabled]);

  const handleTextChange = (text: string) => {
    if (disabled) return;
    onAnswerChange(text);
  };

  const isCorrect = showResult && userAnswer.trim() === correctAnswer.trim();

  // Syntax highlighting helper
  const highlightSyntax = (code: string) => {
    const keywords: Record<string, string[]> = {
      javascript: ['const', 'let', 'var', 'function', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'class', 'export', 'import', 'from', 'new', 'this', 'typeof', 'instanceof'],
      typescript: ['const', 'let', 'var', 'function', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'class', 'export', 'import', 'from', 'new', 'this', 'typeof', 'instanceof', 'interface', 'type', 'enum'],
      python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'as', 'with', 'try', 'except', 'finally', 'async', 'await', 'lambda', 'yield'],
    };

    const langKeywords = keywords[language] || keywords.javascript;

    // Split code into lines
    const lines = code.split('\n');

    return lines.map((line, lineIndex) => {
      const parts: Array<{ text: string; type: 'keyword' | 'string' | 'number' | 'comment' | 'text' }> = [];
      let currentPos = 0;

      // Simple regex-based tokenization
      const tokens: Array<{ text: string; type: 'keyword' | 'string' | 'number' | 'comment' | 'text'; start: number }> = [];

      // Match comments
      const commentMatch = line.match(/\/\/.*/);
      if (commentMatch) {
        const commentStart = line.indexOf(commentMatch[0]);
        tokens.push({ text: commentMatch[0], type: 'comment', start: commentStart });
      }

      // Match strings (both single and double quotes)
      const stringRegex = /(['"])(?:(?=(\\?))\2.)*?\1/g;
      let match;
      while ((match = stringRegex.exec(line)) !== null) {
        tokens.push({ text: match[0], type: 'string', start: match.index });
      }

      // Match numbers
      const numberRegex = /\b\d+\.?\d*\b/g;
      while ((match = numberRegex.exec(line)) !== null) {
        tokens.push({ text: match[0], type: 'number', start: match.index });
      }

      // Match keywords
      langKeywords.forEach(keyword => {
        const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'g');
        while ((match = keywordRegex.exec(line)) !== null) {
          tokens.push({ text: match[0], type: 'keyword', start: match.index });
        }
      });

      // Sort tokens by position
      tokens.sort((a, b) => a.start - b.start);

      // Build parts array
      let lastEnd = 0;
      tokens.forEach(token => {
        // Add text before token
        if (token.start > lastEnd) {
          parts.push({ text: line.substring(lastEnd, token.start), type: 'text' });
        }
        // Add token
        parts.push({ text: token.text, type: token.type });
        lastEnd = token.start + token.text.length;
      });

      // Add remaining text
      if (lastEnd < line.length) {
        parts.push({ text: line.substring(lastEnd), type: 'text' });
      }

      // If no tokens found, add the whole line as text
      if (parts.length === 0) {
        parts.push({ text: line, type: 'text' });
      }

      return { parts, lineIndex };
    });
  };

  // Split code by placeholder
  const placeholderRegex = /_{3,}/;
  const hasPlaceholder = placeholderRegex.test(codeTemplate);
  const codeParts = codeTemplate.split(placeholderRegex);

  const renderCodeWithInput = () => {
    if (!hasPlaceholder) {
      // No placeholder, just render the code
      const highlightedLines = highlightSyntax(codeTemplate);
      return (
        <View style={styles.codeLines}>
          {highlightedLines.map(({ parts, lineIndex }) => (
            <View key={lineIndex} style={styles.codeLine}>
              {parts.map((part, partIndex) => (
                <Text key={partIndex} style={[styles.codeText, getTextStyle(part.type)]}>
                  {part.text}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
    }

    // Has placeholder - render with input
    const beforeCode = codeParts[0] || '';
    const afterCode = codeParts[1] || '';

    const beforeLines = highlightSyntax(beforeCode);
    const afterLines = highlightSyntax(afterCode);

    return (
      <View style={styles.codeLines}>
        {/* Before placeholder */}
        {beforeLines.map(({ parts, lineIndex }, idx) => {
          const isLastLine = idx === beforeLines.length - 1;
          return (
            <View key={`before-${lineIndex}`} style={styles.codeLine}>
              {parts.map((part, partIndex) => (
                <Text key={partIndex} style={[styles.codeText, getTextStyle(part.type)]}>
                  {part.text}
                </Text>
              ))}
              {/* Add input inline if it's the last line */}
              {isLastLine && (
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.codeInput,
                    isFocused && styles.codeInputFocused,
                    showResult && isCorrect && styles.codeInputCorrect,
                    showResult && !isCorrect && styles.codeInputIncorrect,
                  ]}
                  value={userAnswer}
                  onChangeText={handleTextChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="..."
                  placeholderTextColor="#6B7280"
                  editable={!disabled}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                />
              )}
              {/* Show after code on same line if both exist */}
              {isLastLine && afterLines.length > 0 && afterLines[0].parts.map((part, partIndex) => (
                <Text key={`after-inline-${partIndex}`} style={[styles.codeText, getTextStyle(part.type)]}>
                  {part.text}
                </Text>
              ))}
            </View>
          );
        })}
        {/* After placeholder (remaining lines if any) */}
        {afterLines.slice(1).map(({ parts, lineIndex }) => (
          <View key={`after-${lineIndex}`} style={styles.codeLine}>
            {parts.map((part, partIndex) => (
              <Text key={partIndex} style={[styles.codeText, getTextStyle(part.type)]}>
                {part.text}
              </Text>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const getTextStyle = (type: 'keyword' | 'string' | 'number' | 'comment' | 'text') => {
    switch (type) {
      case 'keyword':
        return styles.keyword;
      case 'string':
        return styles.string;
      case 'number':
        return styles.number;
      case 'comment':
        return styles.comment;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Question */}
      <Text style={styles.question}>{question}</Text>

      {/* Code Block */}
      <View style={styles.codeContainer}>
        {renderCodeWithInput()}
      </View>

      {/* Result Feedback */}
      {showResult && (
        <Animated.View style={[styles.feedback, { opacity: fadeAnim }]}>
          {isCorrect ? (
            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackIcon}>✓</Text>
              <View style={styles.feedbackTextContainer}>
                <Text style={styles.feedbackTextCorrect}>¡Correcto!</Text>
              </View>
            </View>
          ) : (
            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackIcon}>✗</Text>
              <View style={styles.feedbackTextContainer}>
                <Text style={styles.feedbackTextIncorrect}>Incorrecto</Text>
                <Text style={styles.correctAnswerLabel}>Respuesta correcta:</Text>
                <Text style={styles.correctAnswerValue}>{correctAnswer}</Text>
              </View>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 24,
    lineHeight: 26,
  },
  codeContainer: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  codeLines: {
    gap: 4,
  },
  codeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    minHeight: 22,
  },
  codeText: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 22,
  },
  keyword: {
    color: '#60A5FA', // Blue
  },
  string: {
    color: '#34D399', // Green
  },
  number: {
    color: '#FB923C', // Orange
  },
  comment: {
    color: '#9CA3AF', // Gray
  },
  codeInput: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: '#F9FAFB',
    backgroundColor: '#1F2937',
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 80,
    marginHorizontal: 4,
  },
  codeInputFocused: {
    borderColor: '#3B82F6', // Blue when focused
  },
  codeInputCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#10B98110',
  },
  codeInputIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#EF444410',
  },
  feedback: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  feedbackContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  feedbackIcon: {
    fontSize: 24,
  },
  feedbackTextContainer: {
    flex: 1,
    gap: 8,
  },
  feedbackTextCorrect: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  feedbackTextIncorrect: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  correctAnswerLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  correctAnswerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    fontFamily: 'Courier',
    backgroundColor: '#111827',
    padding: 8,
    borderRadius: 6,
  },
});
