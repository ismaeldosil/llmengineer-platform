# Lesson Sections - Quick Reference

## Basic Usage

```tsx
import { useState } from 'react';
import { LessonSections, Section } from '@/components/lessons';

function MyLesson() {
  const [current, setCurrent] = useState(0);

  const sections: Section[] = [
    { id: '1', title: 'Intro', content: '...', type: 'text' },
    { id: '2', title: 'Code', content: '...', type: 'code' },
    { id: '3', title: 'Quiz', content: '...', type: 'quiz' },
  ];

  return (
    <LessonSections
      sections={sections}
      currentSection={current}
      onSectionChange={setCurrent}
      onComplete={() => alert('Done!')}
    />
  );
}
```

## Props

### LessonSections
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `sections` | `Section[]` | Yes | Array of lesson sections |
| `currentSection` | `number` | Yes | Current section index (0-based) |
| `onSectionChange` | `(index: number) => void` | Yes | Called when user navigates |
| `onComplete` | `() => void` | No | Called when "Completar" is clicked |

### Section Type
```typescript
interface Section {
  id: string;          // Unique identifier
  title: string;       // Section heading
  content: string;     // Section text content
  type: 'text' | 'code' | 'quiz';  // Display type
}
```

## Section Types

- `'text'` → Displays as "Lectura"
- `'code'` → Displays as "Código"
- `'quiz'` → Displays as "Quiz"

## Component Breakdown

### LessonSections (Main)
- Manages section state
- Handles animations
- Tracks read sections
- Scrolls to top on change

### SectionProgress (Top)
- Text: "2 / 5"
- Progress bar: 40% filled
- Dots: ⚫️ 🔵 ⚫️ ⚫️ ⚫️

### SectionNavigation (Bottom)
- **First section:** ⬅️ Anterior (disabled) | Siguiente ➡️
- **Middle section:** ⬅️ Anterior | 3 de 5 | Siguiente ➡️
- **Last section:** ⬅️ Anterior | Completar ✅

## Common Patterns

### With State Persistence
```tsx
const [current, setCurrent] = useState(() => {
  const saved = localStorage.getItem('lesson-progress');
  return saved ? JSON.parse(saved) : 0;
});

const handleChange = (index: number) => {
  setCurrent(index);
  localStorage.setItem('lesson-progress', JSON.stringify(index));
};
```

### With Completion Callback
```tsx
const handleComplete = async () => {
  await api.completeLesson(lessonId);
  navigation.navigate('LessonComplete', { xp: 100 });
};
```

### With Analytics
```tsx
const handleChange = (index: number) => {
  analytics.track('section_change', {
    lessonId,
    from: current,
    to: index,
  });
  setCurrent(index);
};
```

## Styling

All components use dark theme:
- Background: `#111827`, `#1F2937`
- Primary: `#3B82F6` (blue)
- Success: `#10B981` (green)
- Text: `#F9FAFB`, `#D1D5DB`, `#9CA3AF`

## Testing

```bash
npm test -- --testPathPattern=lessons
```

## Files

- `LessonSections.tsx` - Main container
- `SectionProgress.tsx` - Progress indicator
- `SectionNavigation.tsx` - Nav buttons
- `index.ts` - Exports

## Import Path

```tsx
import { LessonSections, Section, LessonSectionsProps } from '@/components/lessons';
```

## Gotchas

1. `currentSection` is 0-based (first section = 0)
2. Must manage `currentSection` state in parent
3. `onComplete` is optional but recommended
4. Sections are read-only (no editing support)
5. Content is plain text (no rich formatting)

## See Also

- `README.md` - Full overview
- `USAGE.md` - Detailed guide
- `IMPLEMENTATION.md` - Technical details
- `LessonSections.example.tsx` - Working examples
