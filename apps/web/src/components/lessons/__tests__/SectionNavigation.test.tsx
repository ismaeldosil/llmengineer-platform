import { render, fireEvent } from '@testing-library/react-native';
import { SectionNavigation } from '../SectionNavigation';

describe('SectionNavigation', () => {
  const mockOnPrevious = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly on first section', () => {
    const { getByText } = render(
      <SectionNavigation
        currentSection={0}
        totalSections={5}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        isFirstSection={true}
        isLastSection={false}
      />
    );

    expect(getByText('Anterior')).toBeTruthy();
    expect(getByText('Siguiente')).toBeTruthy();
    expect(getByText('1 de 5')).toBeTruthy();
  });

  it('disables previous button on first section', () => {
    const { getByText } = render(
      <SectionNavigation
        currentSection={0}
        totalSections={5}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        isFirstSection={true}
        isLastSection={false}
      />
    );

    const previousButton = getByText('Anterior');
    fireEvent.press(previousButton);

    // Should not call onPrevious when disabled
    expect(mockOnPrevious).not.toHaveBeenCalled();
  });

  it('calls onNext when next button is pressed', () => {
    const { getByText } = render(
      <SectionNavigation
        currentSection={0}
        totalSections={5}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        isFirstSection={true}
        isLastSection={false}
      />
    );

    const nextButton = getByText('Siguiente');
    fireEvent.press(nextButton);

    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('calls onPrevious when previous button is pressed on middle section', () => {
    const { getByText } = render(
      <SectionNavigation
        currentSection={2}
        totalSections={5}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        isFirstSection={false}
        isLastSection={false}
      />
    );

    const previousButton = getByText('Anterior');
    fireEvent.press(previousButton);

    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });

  it('shows complete button on last section', () => {
    const { getByText, queryByText } = render(
      <SectionNavigation
        currentSection={4}
        totalSections={5}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onComplete={mockOnComplete}
        isFirstSection={false}
        isLastSection={true}
      />
    );

    expect(getByText('Completar')).toBeTruthy();
    expect(queryByText('Siguiente')).toBeNull();
  });

  it('calls onComplete when complete button is pressed', () => {
    const { getByText } = render(
      <SectionNavigation
        currentSection={4}
        totalSections={5}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onComplete={mockOnComplete}
        isFirstSection={false}
        isLastSection={true}
      />
    );

    const completeButton = getByText('Completar');
    fireEvent.press(completeButton);

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('handles complete button press when onComplete is undefined', () => {
    const { getByText } = render(
      <SectionNavigation
        currentSection={4}
        totalSections={5}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        isFirstSection={false}
        isLastSection={true}
      />
    );

    const completeButton = getByText('Completar');

    // Should not throw error when onComplete is undefined
    expect(() => fireEvent.press(completeButton)).not.toThrow();
  });

  it('displays correct section indicator for middle section', () => {
    const { getByText } = render(
      <SectionNavigation
        currentSection={2}
        totalSections={5}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        isFirstSection={false}
        isLastSection={false}
      />
    );

    expect(getByText('3 de 5')).toBeTruthy();
  });

  it('enables both buttons on middle section', () => {
    const { getByText } = render(
      <SectionNavigation
        currentSection={2}
        totalSections={5}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        isFirstSection={false}
        isLastSection={false}
      />
    );

    const previousButton = getByText('Anterior');
    const nextButton = getByText('Siguiente');

    fireEvent.press(previousButton);
    fireEvent.press(nextButton);

    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });
});
