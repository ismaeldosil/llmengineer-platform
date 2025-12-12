import React from 'react';
import { render } from '@testing-library/react-native';
import { Icon } from '../Icon';
import { Home, Settings, User, Bell } from 'lucide-react-native';

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  Home: ({ size, color, strokeWidth }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="mock-icon">
        <Text testID="icon-size">{size}</Text>
        <Text testID="icon-color">{color}</Text>
        <Text testID="icon-stroke">{strokeWidth}</Text>
      </View>
    );
  },
  Settings: ({ size, color, strokeWidth }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="mock-icon">
        <Text testID="icon-size">{size}</Text>
        <Text testID="icon-color">{color}</Text>
        <Text testID="icon-stroke">{strokeWidth}</Text>
      </View>
    );
  },
  User: ({ size, color, strokeWidth }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="mock-icon">
        <Text testID="icon-size">{size}</Text>
        <Text testID="icon-color">{color}</Text>
        <Text testID="icon-stroke">{strokeWidth}</Text>
      </View>
    );
  },
  Bell: ({ size, color, strokeWidth }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="mock-icon">
        <Text testID="icon-size">{size}</Text>
        <Text testID="icon-color">{color}</Text>
        <Text testID="icon-stroke">{strokeWidth}</Text>
      </View>
    );
  },
}));

describe('Icon', () => {
  describe('size prop', () => {
    it('renders with default size (md = 20)', () => {
      const { getByTestId } = render(<Icon icon={Home} />);
      expect(getByTestId('icon-size')).toHaveTextContent('20');
    });

    it('renders with xs size (12)', () => {
      const { getByTestId } = render(<Icon icon={Home} size="xs" />);
      expect(getByTestId('icon-size')).toHaveTextContent('12');
    });

    it('renders with sm size (16)', () => {
      const { getByTestId } = render(<Icon icon={Home} size="sm" />);
      expect(getByTestId('icon-size')).toHaveTextContent('16');
    });

    it('renders with md size (20)', () => {
      const { getByTestId } = render(<Icon icon={Home} size="md" />);
      expect(getByTestId('icon-size')).toHaveTextContent('20');
    });

    it('renders with lg size (24)', () => {
      const { getByTestId } = render(<Icon icon={Home} size="lg" />);
      expect(getByTestId('icon-size')).toHaveTextContent('24');
    });

    it('renders with xl size (32)', () => {
      const { getByTestId } = render(<Icon icon={Home} size="xl" />);
      expect(getByTestId('icon-size')).toHaveTextContent('32');
    });
  });

  describe('variant prop', () => {
    it('renders with default variant color (#f3f4f6)', () => {
      const { getByTestId } = render(<Icon icon={Settings} />);
      expect(getByTestId('icon-color')).toHaveTextContent('#f3f4f6');
    });

    it('renders with primary variant (#3b82f6)', () => {
      const { getByTestId } = render(<Icon icon={Settings} variant="primary" />);
      expect(getByTestId('icon-color')).toHaveTextContent('#3b82f6');
    });

    it('renders with secondary variant (#9ca3af)', () => {
      const { getByTestId } = render(<Icon icon={Settings} variant="secondary" />);
      expect(getByTestId('icon-color')).toHaveTextContent('#9ca3af');
    });

    it('renders with success variant (#22c55e)', () => {
      const { getByTestId } = render(<Icon icon={Settings} variant="success" />);
      expect(getByTestId('icon-color')).toHaveTextContent('#22c55e');
    });

    it('renders with warning variant (#f59e0b)', () => {
      const { getByTestId } = render(<Icon icon={Settings} variant="warning" />);
      expect(getByTestId('icon-color')).toHaveTextContent('#f59e0b');
    });

    it('renders with error variant (#ef4444)', () => {
      const { getByTestId } = render(<Icon icon={Settings} variant="error" />);
      expect(getByTestId('icon-color')).toHaveTextContent('#ef4444');
    });

    it('renders with muted variant (#6b7280)', () => {
      const { getByTestId } = render(<Icon icon={Settings} variant="muted" />);
      expect(getByTestId('icon-color')).toHaveTextContent('#6b7280');
    });
  });

  describe('color prop', () => {
    it('overrides variant color when color prop is provided', () => {
      const { getByTestId } = render(
        <Icon icon={User} variant="primary" color="#ff0000" />
      );
      expect(getByTestId('icon-color')).toHaveTextContent('#ff0000');
    });

    it('uses custom color directly', () => {
      const { getByTestId } = render(<Icon icon={User} color="#123456" />);
      expect(getByTestId('icon-color')).toHaveTextContent('#123456');
    });
  });

  describe('strokeWidth prop', () => {
    it('renders with default strokeWidth (2)', () => {
      const { getByTestId } = render(<Icon icon={Bell} />);
      expect(getByTestId('icon-stroke')).toHaveTextContent('2');
    });

    it('renders with custom strokeWidth', () => {
      const { getByTestId } = render(<Icon icon={Bell} strokeWidth={1.5} />);
      expect(getByTestId('icon-stroke')).toHaveTextContent('1.5');
    });

    it('renders with thick strokeWidth', () => {
      const { getByTestId } = render(<Icon icon={Bell} strokeWidth={3} />);
      expect(getByTestId('icon-stroke')).toHaveTextContent('3');
    });
  });

  describe('different icons', () => {
    it('renders Home icon', () => {
      const { getByTestId } = render(<Icon icon={Home} />);
      expect(getByTestId('mock-icon')).toBeTruthy();
    });

    it('renders Settings icon', () => {
      const { getByTestId } = render(<Icon icon={Settings} />);
      expect(getByTestId('mock-icon')).toBeTruthy();
    });

    it('renders User icon', () => {
      const { getByTestId } = render(<Icon icon={User} />);
      expect(getByTestId('mock-icon')).toBeTruthy();
    });

    it('renders Bell icon', () => {
      const { getByTestId } = render(<Icon icon={Bell} />);
      expect(getByTestId('mock-icon')).toBeTruthy();
    });
  });

  describe('combined props', () => {
    it('renders with all props combined', () => {
      const { getByTestId } = render(
        <Icon icon={Home} size="lg" variant="success" strokeWidth={2.5} />
      );
      expect(getByTestId('icon-size')).toHaveTextContent('24');
      expect(getByTestId('icon-color')).toHaveTextContent('#22c55e');
      expect(getByTestId('icon-stroke')).toHaveTextContent('2.5');
    });

    it('renders with custom color overriding variant', () => {
      const { getByTestId } = render(
        <Icon icon={Settings} size="xl" variant="error" color="#purple" strokeWidth={1} />
      );
      expect(getByTestId('icon-size')).toHaveTextContent('32');
      expect(getByTestId('icon-color')).toHaveTextContent('#purple');
      expect(getByTestId('icon-stroke')).toHaveTextContent('1');
    });
  });
});
