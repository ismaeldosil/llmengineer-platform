# Lesson Sections System - Usage Guide

## Overview
The Lesson Sections system provides a complete navigation and progress tracking solution for lesson content. It includes three main components that work together to create an intuitive learning experience.

## Components

### 1. LessonSections (Main Container)
The primary component that orchestrates the entire section navigation system.

#### Props
```typescript
interface Section {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'code' | 'quiz';
}

interface LessonSectionsProps {
  sections: Section[];
  currentSection: number;
  onSectionChange: (index: number) => void;
  onComplete?: () => void;
}
```

#### Features
- State tracking of current section
- Automatic marking of read sections
- Smooth animated transitions between sections
- Scrollable content area
- Visual section type indicators

### 2. SectionProgress
Displays progress through the lesson with multiple visual indicators.

#### Features
- Text progress indicator (e.g., "2/5")
- Animated progress bar
- Dot indicators (completed, active, pending)

### 3. SectionNavigation
Navigation controls for moving between sections.

#### Features
- Previous button (disabled on first section)
- Next button (changes to "Completar" on last section)
- Section counter in the middle
- Icons from lucide-react-native

## Usage Example

```tsx
import { useState } from 'react';
import { View } from 'react-native';
import { LessonSections, Section } from '@/components/lessons';

export function LessonScreen() {
  const [currentSection, setCurrentSection] = useState(0);

  const sections: Section[] = [
    {
      id: '1',
      title: 'Introduction to React Native',
      content: 'React Native is a framework for building native mobile apps using React...',
      type: 'text',
    },
    {
      id: '2',
      title: 'Your First Component',
      content: 'Let\'s create a simple component:\n\nconst Hello = () => <Text>Hello!</Text>',
      type: 'code',
    },
    {
      id: '3',
      title: 'Knowledge Check',
      content: 'Answer these questions to test your understanding...',
      type: 'quiz',
    },
  ];

  const handleSectionChange = (index: number) => {
    setCurrentSection(index);
  };

  const handleComplete = () => {
    console.log('Lesson completed!');
    // Navigate to next lesson or show completion screen
  };

  return (
    <View style={{ flex: 1 }}>
      <LessonSections
        sections={sections}
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        onComplete={handleComplete}
      />
    </View>
  );
}
```

## Section Types

The system supports three section types:

1. **text** - Regular reading content (displays as "Lectura")
2. **code** - Code examples and exercises (displays as "Código")
3. **quiz** - Assessment sections (displays as "Quiz")

## Styling

All components use `StyleSheet.create` with a consistent dark theme:

- Background: `#111827`, `#1F2937`
- Primary: `#3B82F6` (blue)
- Success: `#10B981` (green)
- Text: `#F9FAFB`, `#D1D5DB`, `#9CA3AF`
- Borders: `#374151`

## Features in Detail

### Progress Tracking
- Sections are automatically marked as read when viewed
- Progress bar fills based on current section / total sections
- Dot indicators show: completed (green), active (blue, larger), pending (gray)

### Navigation
- **Anterior** button: Disabled on first section, grayed out
- **Siguiente** button: Available on all but last section
- **Completar** button: Only on last section, green with checkmark icon

### Animations
- Smooth fade-in transitions when changing sections
- Progress bar fills with animation
- Automatic scroll to top on section change

### Accessibility
- Clear section indicators
- Disabled state for unavailable navigation
- Visual feedback for current position

## Integration with Other Components

This system works well with:
- `XPCelebration` - Show after completing all sections
- Progress tracking systems
- Lesson completion APIs
- User progress persistence

## Testing

All components have comprehensive test coverage in the `__tests__` directory:
- `SectionProgress.test.tsx` - 8 test cases
- `SectionNavigation.test.tsx` - 10 test cases
- `LessonSections.test.tsx` - 13 test cases

Run tests with:
```bash
npm test -- --testPathPattern=lessons
```

## Best Practices

1. **Section Content**: Keep content concise and focused
2. **Section Count**: Aim for 3-7 sections per lesson for optimal UX
3. **Type Usage**: Use appropriate types for each section's purpose
4. **Completion Callback**: Always provide `onComplete` for proper lesson flow
5. **State Management**: Manage `currentSection` at parent level for flexibility

## Troubleshooting

### Section not updating
- Ensure `currentSection` prop is being updated in parent component
- Check `onSectionChange` callback is properly connected

### Navigation not working
- Verify `isFirstSection` and `isLastSection` props are calculated correctly
- Check that `onSectionChange` is not blocked by parent logic

### Progress not displaying
- Ensure `sections` array has valid data
- Check that `currentSection` is within bounds (0 to sections.length - 1)

## Future Enhancements

Potential additions to consider:
- Section bookmarking
- Progress persistence (localStorage/AsyncStorage)
- Section completion timestamps
- Keyboard navigation support
- Section search/jump functionality
- Section notes/annotations
