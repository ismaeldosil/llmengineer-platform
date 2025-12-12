# Lesson Sections System

A comprehensive lesson navigation and progress tracking system for the LLM Engineer Platform.

## Overview

This system provides an intuitive and feature-rich interface for navigating through lesson content with real-time progress tracking, smooth animations, and clear visual indicators.

## Components

### LessonSections (Main Container)
**File:** `LessonSections.tsx`

The orchestrator component that manages the entire lesson section experience.

**Key Features:**
- Section state management
- Automatic read tracking
- Smooth animated transitions
- Scrollable content with auto-scroll on navigation
- Visual section type indicators (Lectura, Código, Quiz)
- Error handling for missing data

### SectionProgress
**File:** `SectionProgress.tsx`

Displays lesson progress with multiple visual indicators.

**Visual Elements:**
- Text counter (e.g., "2 / 5")
- Animated progress bar
- Dot indicators:
  - Gray: Pending sections
  - Blue (larger): Current section
  - Green: Completed sections

### SectionNavigation
**File:** `SectionNavigation.tsx`

Bottom navigation bar with intelligent button states.

**Features:**
- **Anterior** button:
  - Active on all but first section
  - Grayed out and disabled on first section
  - Chevron left icon
- **Siguiente** button:
  - Active on all but last section
  - Chevron right icon
- **Completar** button:
  - Appears only on last section
  - Green background
  - Checkmark icon
- Center section indicator (e.g., "3 de 5")

## File Structure

```
apps/web/src/components/lessons/
├── __tests__/
│   ├── LessonSections.test.tsx      (13 test cases)
│   ├── SectionNavigation.test.tsx   (10 test cases)
│   └── SectionProgress.test.tsx     (8 test cases)
├── index.ts                         (Main exports)
├── LessonSections.tsx               (Main container - 180 LOC)
├── SectionNavigation.tsx            (Navigation controls - 170 LOC)
├── SectionProgress.tsx              (Progress indicators - 100 LOC)
├── LessonSections.example.tsx       (Usage examples)
├── USAGE.md                         (Detailed usage guide)
├── README.md                        (This file)
└── XPCelebration.tsx               (Existing component)
```

## Quick Start

```tsx
import { useState } from 'react';
import { LessonSections, Section } from '@/components/lessons';

function MyLesson() {
  const [currentSection, setCurrentSection] = useState(0);

  const sections: Section[] = [
    {
      id: '1',
      title: 'Introduction',
      content: 'Welcome to the lesson...',
      type: 'text',
    },
    // ... more sections
  ];

  return (
    <LessonSections
      sections={sections}
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      onComplete={() => console.log('Done!')}
    />
  );
}
```

## TypeScript Types

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

## Styling System

All components use `StyleSheet.create` with a consistent dark theme:

**Color Palette:**
- Background: `#111827` (dark), `#1F2937` (lighter dark)
- Primary: `#3B82F6` (blue)
- Success: `#10B981` (green)
- Text: `#F9FAFB` (white), `#D1D5DB` (light gray), `#9CA3AF` (gray)
- Borders: `#374151` (dark gray)
- Disabled: `#6B7280` (medium gray)

## Animations

Powered by `react-native-reanimated`:
- Fade-in transitions between sections (300ms)
- Smooth progress bar filling
- Auto-scroll to top on section change

## User Experience Flow

1. **Enter Lesson**
   - Progress bar shows 0%
   - First dot highlighted in blue
   - "Anterior" button disabled
   - Shows section 1 content

2. **Navigate Forward**
   - Tap "Siguiente" button
   - Content fades to new section
   - Progress bar updates
   - Previous dot turns green (completed)
   - Current dot highlighted in blue

3. **Navigate Backward**
   - Tap "Anterior" button
   - Return to previous section
   - Progress indicator updates
   - All sections remain marked as read

4. **Complete Lesson**
   - Reach last section
   - "Siguiente" changes to "Completar"
   - Tap to trigger completion callback
   - Progress bar at 100%

## Testing

All components have comprehensive test coverage:

**Run tests:**
```bash
npm test -- --testPathPattern=lessons
```

**Coverage includes:**
- Component rendering
- User interactions
- State updates
- Edge cases (first/last section)
- Error states
- Callback invocations

## Integration Points

**Works seamlessly with:**
- `XPCelebration` - Show after lesson completion
- Redux/Context for global state
- AsyncStorage for progress persistence
- API endpoints for lesson data
- Analytics tracking

## Accessibility

- Clear visual hierarchy
- Disabled state indicators
- Consistent navigation patterns
- Touch-friendly button sizes
- Color-blind friendly indicators (not solely color-dependent)

## Performance

- Optimized re-renders with React hooks
- Efficient animation system
- Lazy evaluation of section content
- Minimal prop drilling

## Browser/Platform Support

- iOS (React Native)
- Android (React Native)
- Web (React Native Web)

## Known Limitations

1. No keyboard navigation support (mobile-first design)
2. Single column layout (no split view)
3. No section jumping (sequential navigation only)
4. Content is text-only (no rich media components)

## Future Enhancements

Potential additions:
- [ ] Section bookmarking
- [ ] Progress persistence (localStorage/AsyncStorage)
- [ ] Section completion timestamps
- [ ] Keyboard navigation for web
- [ ] Section search/jump functionality
- [ ] Rich media content support (images, videos)
- [ ] Section notes/annotations
- [ ] Offline mode support
- [ ] Print/export functionality

## Dependencies

```json
{
  "react": "18.2.0",
  "react-native": "^0.73.0",
  "react-native-reanimated": "~3.6.0",
  "lucide-react-native": "^0.475.0"
}
```

## Contributing

When modifying these components:
1. Maintain TypeScript type safety
2. Add tests for new features
3. Follow existing styling patterns
4. Update documentation
5. Test on both iOS and Android

## License

Part of the LLM Engineer Platform

## Support

For issues or questions, refer to:
- `USAGE.md` - Detailed usage guide
- `LessonSections.example.tsx` - Working examples
- Test files - Expected behavior examples

---

**Task:** LESSONS-009 - Sistema de Secciones de Lección (#24)
**Status:** ✅ Complete
**Lines of Code:** ~1,465 total
**Test Coverage:** 31 test cases across 3 test files
