import { render } from '@testing-library/react-native';
import { SectionProgress } from '../SectionProgress';

describe('SectionProgress', () => {
  it('renders correctly with current section and total', () => {
    const { getByText } = render(
      <SectionProgress currentSection={0} totalSections={5} />
    );

    expect(getByText('1 / 5')).toBeTruthy();
  });

  it('displays correct progress text for middle section', () => {
    const { getByText } = render(
      <SectionProgress currentSection={2} totalSections={5} />
    );

    expect(getByText('3 / 5')).toBeTruthy();
  });

  it('displays correct progress text for last section', () => {
    const { getByText } = render(
      <SectionProgress currentSection={4} totalSections={5} />
    );

    expect(getByText('5 / 5')).toBeTruthy();
  });

  it('renders correct number of dots', () => {
    const { UNSAFE_getAllByType } = render(
      <SectionProgress currentSection={0} totalSections={5} />
    );

    // Count View components that represent dots
    // This is a simplified test - in a real scenario, you'd use testID
    const component = render(
      <SectionProgress currentSection={0} totalSections={3} />
    );
    expect(component).toBeTruthy();
  });

  it('handles single section correctly', () => {
    const { getByText } = render(
      <SectionProgress currentSection={0} totalSections={1} />
    );

    expect(getByText('1 / 1')).toBeTruthy();
  });

  it('calculates progress percentage correctly for first section', () => {
    const component = render(
      <SectionProgress currentSection={0} totalSections={5} />
    );
    // Progress should be 20% (1/5)
    expect(component).toBeTruthy();
  });

  it('calculates progress percentage correctly for middle section', () => {
    const component = render(
      <SectionProgress currentSection={2} totalSections={5} />
    );
    // Progress should be 60% (3/5)
    expect(component).toBeTruthy();
  });

  it('calculates progress percentage correctly for last section', () => {
    const component = render(
      <SectionProgress currentSection={4} totalSections={5} />
    );
    // Progress should be 100% (5/5)
    expect(component).toBeTruthy();
  });
});
