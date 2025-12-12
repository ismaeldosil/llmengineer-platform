import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSearchLessonsQuery, SearchResult } from '@/services/api';

interface LessonSearchProps {
  onResultSelect?: (result: SearchResult) => void;
}

export function LessonSearch({ onResultSelect }: LessonSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: results,
    isLoading,
    isFetching,
  } = useSearchLessonsQuery(
    { query: debouncedQuery, limit: 20 },
    { skip: debouncedQuery.length < 2 }
  );

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        setDebouncedQuery(text);
      }, 300);

      setDebounceTimer(timer);
    },
    [debounceTimer]
  );

  const handleResultPress = useCallback(
    (result: SearchResult) => {
      if (onResultSelect) {
        onResultSelect(result);
      } else {
        router.push(`/lessons/${result.lessonSlug}`);
      }
    },
    [onResultSelect, router]
  );

  const highlightText = useCallback((text: string, query: string) => {
    if (!query || query.length < 2) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));

    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <Text key={index} style={styles.highlight}>
          {part}
        </Text>
      ) : (
        part
      )
    );
  }, []);

  const getMatchTypeIcon = useCallback((matchType: SearchResult['matchType']) => {
    switch (matchType) {
      case 'title':
        return '📚';
      case 'description':
        return '📝';
      case 'section':
        return '📄';
      case 'keyPoint':
        return '💡';
      case 'quiz':
        return '❓';
      default:
        return '📌';
    }
  }, []);

  const getMatchTypeLabel = useCallback((matchType: SearchResult['matchType']) => {
    switch (matchType) {
      case 'title':
        return 'Título';
      case 'description':
        return 'Descripción';
      case 'section':
        return 'Sección';
      case 'keyPoint':
        return 'Punto clave';
      case 'quiz':
        return 'Quiz';
      default:
        return matchType;
    }
  }, []);

  const showLoading = isLoading || isFetching;
  const showResults = debouncedQuery.length >= 2 && !showLoading;
  const showEmptyState = showResults && (!results || results.length === 0);

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar concepto..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {showLoading && <ActivityIndicator size="small" color="#3B82F6" />}
        {searchQuery.length > 0 && !showLoading && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setDebouncedQuery('');
            }}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {showResults && results && results.length > 0 && (
        <ScrollView style={styles.resultsContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.resultsCount}>
            {results.length} resultado{results.length !== 1 ? 's' : ''} para "{debouncedQuery}"
          </Text>

          {results.map((result, index) => (
            <TouchableOpacity
              key={`${result.lessonId}-${result.matchType}-${index}`}
              style={styles.resultItem}
              onPress={() => handleResultPress(result)}
            >
              {/* Header */}
              <View style={styles.resultHeader}>
                <Text style={styles.resultIcon}>{getMatchTypeIcon(result.matchType)}</Text>
                <View style={styles.resultHeaderText}>
                  <Text style={styles.resultTitle}>{result.lessonTitle}</Text>
                  <Text style={styles.resultMeta}>
                    Semana {result.week} • {getMatchTypeLabel(result.matchType)}
                    {result.sectionTitle && ` • ${result.sectionTitle}`}
                  </Text>
                </View>
              </View>

              {/* Context */}
              <View style={styles.contextContainer}>
                {result.contextBefore && (
                  <Text style={styles.contextText} numberOfLines={2}>
                    {result.contextBefore}
                  </Text>
                )}
                <Text style={styles.matchedText}>
                  {highlightText(result.matchedText, debouncedQuery)}
                </Text>
                {result.contextAfter && (
                  <Text style={styles.contextText} numberOfLines={2}>
                    {result.contextAfter}
                  </Text>
                )}
              </View>

              {/* Action */}
              <Text style={styles.resultAction}>Ver lección →</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Empty State */}
      {showEmptyState && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateText}>
            No se encontraron resultados para "{debouncedQuery}"
          </Text>
          <Text style={styles.emptyStateHint}>Intenta con otro término o revisa la ortografía</Text>
        </View>
      )}

      {/* Hint */}
      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>Escribe al menos 2 caracteres para buscar</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#F9FAFB',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  resultsContainer: {
    marginTop: 16,
    maxHeight: 400,
  },
  resultsCount: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  resultItem: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  resultHeaderText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  resultMeta: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  contextContainer: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  contextText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  matchedText: {
    fontSize: 14,
    color: '#F9FAFB',
    lineHeight: 20,
    marginVertical: 4,
  },
  highlight: {
    backgroundColor: '#FCD34D',
    color: '#111827',
    fontWeight: '600',
    borderRadius: 2,
  },
  resultAction: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateHint: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  hintContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
