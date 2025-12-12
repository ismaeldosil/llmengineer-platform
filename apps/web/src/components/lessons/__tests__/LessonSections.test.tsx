/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LessonSections, Section } from '../LessonSections';

const mockSections: Section[] = [
  {
    id: '1',
    title: 'Introduction to React',
    content: 'React is a JavaScript library for building user interfaces.',
    type: 'text',
  },
  {
    id: '2',
    title: 'Components',
    content: 'Components are the building blocks of React applications.',
    type: 'code',
  },
  {
    id: '3',
    title: 'State Management',
    content: 'State is a way to store data that changes over time.',
    type: 'text',
  },
  {
    id: '4',
    title: 'Quiz Time',
    content: 'Test your knowledge about React basics.',
    type: 'quiz',
  },
];

describe('LessonSections', () => {
  const mockOnSectionChange = jest.fn();
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with sections', () => {
    const { getByText } = render(
      <LessonSections
        sections={mockSections}
        currentSection={0}
        onSectionChange={mockOnSectionChange}
      />
    );

    expect(getByText('Introduction to React')).toBeTruthy();
    expect(getByText('React is a JavaScript library for building user interfaces.')).toBeTruthy();
  });

  it('displays correct section type label for text', () => {
    const { getByText } = render(
      <LessonSections
        sections={mockSections}
        currentSection={0}
        onSectionChange={mockOnSectionChange}
      />
    );

    expect(getByText('Lectura')).toBeTruthy();
  });

  it('displays correct section type label for code', () => {
    const { getByText } = render(
      <LessonSections
        sections={mockSections}
        currentSection={1}
        onSectionChange={mockOnSectionChange}
      />
    );

    expect(getByText('Código')).toBeTruthy();
  });

  it('displays correct section type label for quiz', () => {
    const { getByText } = render(
      <LessonSections
        sections={mockSections}
        currentSection={3}
        onSectionChange={mockOnSectionChange}
      />
    );

    expect(getByText('Quiz')).toBeTruthy();
  });

  it('calls onSectionChange when next button is pressed', () => {
    const { getByText } = render(
      <LessonSections
        sections={mockSections}
        currentSection={0}
        onSectionChange={mockOnSectionChange}
      />
    );

    const nextButton = getByText('Siguiente');
    fireEvent.press(nextButton);

    expect(mockOnSectionChange).toHaveBeenCalledWith(1);
  });

  it('calls onSectionChange when previous button is pressed', () => {
    const { getByText } = render(
      <LessonSections
        sections={mockSections}
        currentSection={1}
        onSectionChange={mockOnSectionChange}
      />
    );

    const previousButton = getByText('Anterior');
    fireEvent.press(previousButton);

    expect(mockOnSectionChange).toHaveBeenCalledWith(0);
  });

  it('does not call onSectionChange when on first section and previous is pressed', () => {
    const { getByText } = render(
      <LessonSections
        sections={mockSections}
        currentSection={0}
        onSectionChange={mockOnSectionChange}
      />
    );

    const previousButton = getByText('Anterior');
    fireEvent.press(previousButton);

    expect(mockOnSectionChange).not.toHaveBeenCalled();
  });

  it('shows complete button on last section', () => {
    const { getByText } = render(
      <LessonSections
        sections={mockSections}
        currentSection={3}
        onSectionChange={mockOnSectionChange}
        onComplete={mockOnComplete}
      />
    );

    expect(getByText('Completar')).toBeTruthy();
  });

  it('calls onComplete when complete button is pressed', () => {
    const { getByText } = render(
      <LessonSections
        sections={mockSections}
        currentSection={3}
        onSectionChange={mockOnSectionChange}
        onComplete={mockOnComplete}
      />
    );

    const completeButton = getByText('Completar');
    fireEvent.press(completeButton);

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('displays progress indicator correctly', () => {
    const { getByText } = render(
      <LessonSections
        sections={mockSections}
        currentSection={0}
        onSectionChange={mockOnSectionChange}
      />
    );

    expect(getByText('1 / 4')).toBeTruthy();
  });

  it('updates progress when section changes', () => {
    const { getByText, rerender } = render(
      <LessonSections
        sections={mockSections}
        currentSection={0}
        onSectionChange={mockOnSectionChange}
      />
    );

    expect(getByText('1 / 4')).toBeTruthy();

    rerender(
      <LessonSections
        sections={mockSections}
        currentSection={2}
        onSectionChange={mockOnSectionChange}
      />
    );

    expect(getByText('3 / 4')).toBeTruthy();
  });

  it('displays read indicator after section is viewed', async () => {
    const { getByText } = render(
      <LessonSections
        sections={mockSections}
        currentSection={0}
        onSectionChange={mockOnSectionChange}
      />
    );

    await waitFor(() => {
      expect(getByText('Sección leída')).toBeTruthy();
    });
  });

  it('renders error state when no section data is available', () => {
    const { getByText } = render(
      <LessonSections sections={[]} currentSection={0} onSectionChange={mockOnSectionChange} />
    );

    expect(getByText('No section data available')).toBeTruthy();
  });

  it('handles section navigation correctly through multiple sections', () => {
    const { getByText, rerender } = render(
      <LessonSections
        sections={mockSections}
        currentSection={0}
        onSectionChange={mockOnSectionChange}
      />
    );

    // Navigate forward
    const nextButton = getByText('Siguiente');
    fireEvent.press(nextButton);
    expect(mockOnSectionChange).toHaveBeenCalledWith(1);

    // Update to next section
    rerender(
      <LessonSections
        sections={mockSections}
        currentSection={1}
        onSectionChange={mockOnSectionChange}
      />
    );

    expect(getByText('Components')).toBeTruthy();

    // Navigate forward again
    fireEvent.press(nextButton);
    expect(mockOnSectionChange).toHaveBeenCalledWith(2);
  });

  it('renders all sections with correct content', () => {
    mockSections.forEach((section, index) => {
      const { getByText } = render(
        <LessonSections
          sections={mockSections}
          currentSection={index}
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(getByText(section.title)).toBeTruthy();
      expect(getByText(section.content)).toBeTruthy();
    });
  });

  it('handles single section correctly', () => {
    const singleSection: Section[] = [
      {
        id: '1',
        title: 'Only Section',
        content: 'This is the only section.',
        type: 'text',
      },
    ];

    const { getByText } = render(
      <LessonSections
        sections={singleSection}
        currentSection={0}
        onSectionChange={mockOnSectionChange}
        onComplete={mockOnComplete}
      />
    );

    expect(getByText('Only Section')).toBeTruthy();
    expect(getByText('Completar')).toBeTruthy();
    expect(getByText('1 / 1')).toBeTruthy();
  });
});
