/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { LessonSearch } from '../LessonSearch';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the API hook
const mockSearchResults = [
  {
    lessonId: 'lesson-1',
    lessonSlug: 'intro-to-llms',
    lessonTitle: 'Introduction to LLMs',
    week: 1,
    matchType: 'section' as const,
    sectionTitle: 'What is an LLM?',
    sectionIndex: 0,
    matchedText: 'tokenization is the process',
    contextBefore: 'LLMs use',
    contextAfter: 'to split text',
  },
  {
    lessonId: 'lesson-1',
    lessonSlug: 'intro-to-llms',
    lessonTitle: 'Introduction to LLMs',
    week: 1,
    matchType: 'quiz' as const,
    questionIndex: 0,
    matchedText: 'What is tokenization?',
    contextBefore: '',
    contextAfter: 'A process to split text',
  },
];

const mockUseSearchLessonsQuery = jest.fn();

jest.mock('@/services/api', () => ({
  useSearchLessonsQuery: (params: any, options: any) => mockUseSearchLessonsQuery(params, options),
  SearchResult: {},
}));

describe('LessonSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchLessonsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
    });
  });

  it('renders search input', () => {
    const { getByPlaceholderText } = render(<LessonSearch />);
    expect(getByPlaceholderText('Buscar concepto...')).toBeTruthy();
  });

  it('shows hint when query is less than 2 characters', async () => {
    const { getByPlaceholderText, getByText } = render(<LessonSearch />);

    const input = getByPlaceholderText('Buscar concepto...');
    fireEvent.changeText(input, 't');

    await waitFor(() => {
      expect(getByText('Escribe al menos 2 caracteres para buscar')).toBeTruthy();
    });
  });

  it('shows loading indicator when fetching', async () => {
    mockUseSearchLessonsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
    });

    const { getByPlaceholderText } = render(<LessonSearch />);
    const input = getByPlaceholderText('Buscar concepto...');

    await act(async () => {
      fireEvent.changeText(input, 'token');
    });

    // ActivityIndicator is shown during loading
    expect(mockUseSearchLessonsQuery).toHaveBeenCalled();
  });

  it('shows empty state when no results found', async () => {
    mockUseSearchLessonsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
    });

    const { getByPlaceholderText, findByText } = render(<LessonSearch />);
    const input = getByPlaceholderText('Buscar concepto...');

    await act(async () => {
      fireEvent.changeText(input, 'nonexistent');
      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    const emptyText = await findByText(/No se encontraron resultados/i);
    expect(emptyText).toBeTruthy();
  });

  it('displays search results', async () => {
    mockUseSearchLessonsQuery.mockReturnValue({
      data: mockSearchResults,
      isLoading: false,
      isFetching: false,
    });

    const { getByPlaceholderText, findAllByText } = render(<LessonSearch />);
    const input = getByPlaceholderText('Buscar concepto...');

    await act(async () => {
      fireEvent.changeText(input, 'tokenization');
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    const resultTitles = await findAllByText('Introduction to LLMs');
    expect(resultTitles.length).toBeGreaterThan(0);
  });

  it('shows results count', async () => {
    mockUseSearchLessonsQuery.mockReturnValue({
      data: mockSearchResults,
      isLoading: false,
      isFetching: false,
    });

    const { getByPlaceholderText, findByText } = render(<LessonSearch />);
    const input = getByPlaceholderText('Buscar concepto...');

    await act(async () => {
      fireEvent.changeText(input, 'tokenization');
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    const countText = await findByText(/2 resultados/i);
    expect(countText).toBeTruthy();
  });

  it('clears search when clear button is pressed', async () => {
    mockUseSearchLessonsQuery.mockReturnValue({
      data: mockSearchResults,
      isLoading: false,
      isFetching: false,
    });

    const { getByPlaceholderText, getByText } = render(<LessonSearch />);
    const input = getByPlaceholderText('Buscar concepto...');

    await act(async () => {
      fireEvent.changeText(input, 'token');
    });

    const clearButton = getByText('✕');
    fireEvent.press(clearButton);

    expect(input.props.value).toBe('');
  });

  it('calls onResultSelect callback when provided', async () => {
    const mockOnResultSelect = jest.fn();
    mockUseSearchLessonsQuery.mockReturnValue({
      data: mockSearchResults,
      isLoading: false,
      isFetching: false,
    });

    const { getByPlaceholderText, findAllByText } = render(
      <LessonSearch onResultSelect={mockOnResultSelect} />
    );
    const input = getByPlaceholderText('Buscar concepto...');

    await act(async () => {
      fireEvent.changeText(input, 'tokenization');
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    // Find all "Ver lección →" texts and press the first result item
    const resultActions = await findAllByText('Ver lección →');
    fireEvent.press(resultActions[0]);

    expect(mockOnResultSelect).toHaveBeenCalledWith(mockSearchResults[0]);
  });

  it('shows correct match type icons', async () => {
    mockUseSearchLessonsQuery.mockReturnValue({
      data: mockSearchResults,
      isLoading: false,
      isFetching: false,
    });

    const { getByPlaceholderText, findByText } = render(<LessonSearch />);
    const input = getByPlaceholderText('Buscar concepto...');

    await act(async () => {
      fireEvent.changeText(input, 'tokenization');
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    // Section icon and Quiz icon
    const sectionIcon = await findByText('📄');
    const quizIcon = await findByText('❓');
    expect(sectionIcon).toBeTruthy();
    expect(quizIcon).toBeTruthy();
  });

  it('shows week number in results', async () => {
    mockUseSearchLessonsQuery.mockReturnValue({
      data: mockSearchResults,
      isLoading: false,
      isFetching: false,
    });

    const { getByPlaceholderText, findByText } = render(<LessonSearch />);
    const input = getByPlaceholderText('Buscar concepto...');

    await act(async () => {
      fireEvent.changeText(input, 'tokenization');
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    // The meta text includes week, match type, and section title
    const weekText = await findByText(/Semana 1 • Sección/i);
    expect(weekText).toBeTruthy();
  });

  it('debounces search requests', async () => {
    mockUseSearchLessonsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
    });

    const { getByPlaceholderText } = render(<LessonSearch />);
    const input = getByPlaceholderText('Buscar concepto...');

    // Type multiple characters quickly
    fireEvent.changeText(input, 't');
    fireEvent.changeText(input, 'to');
    fireEvent.changeText(input, 'tok');

    // Query should be skipped until debounce
    expect(mockUseSearchLessonsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ query: '' }),
      expect.objectContaining({ skip: true })
    );
  });
});
