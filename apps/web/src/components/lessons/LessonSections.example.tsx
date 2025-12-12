/* eslint-disable no-console */
/**
 * Example implementation of the LessonSections component
 * This file demonstrates how to use the lesson sections system
 *
 * Usage:
 * import { LessonSectionsExample } from '@/components/lessons/LessonSections.example';
 */

import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LessonSections, Section } from './LessonSections';

export function LessonSectionsExample() {
  const [currentSection, setCurrentSection] = useState(0);

  // Example lesson sections
  const sections: Section[] = [
    {
      id: 'intro-1',
      title: 'Welcome to React Native',
      content: `React Native is a powerful framework that allows you to build native mobile applications using JavaScript and React.

In this lesson, you'll learn the fundamentals of React Native development, including components, styling, and navigation.

Key benefits:
• Write once, run on iOS and Android
• Use familiar React concepts
• Access native APIs and features
• Hot reloading for fast development`,
      type: 'text',
    },
    {
      id: 'components-2',
      title: 'Understanding Components',
      content: `Components are the building blocks of React Native applications. They are reusable pieces of UI that can be composed together.

Example of a simple component:

import { View, Text } from 'react-native';

function Greeting({ name }) {
  return (
    <View>
      <Text>Hello, {name}!</Text>
    </View>
  );
}

Components can accept props and manage their own state, making them flexible and powerful.`,
      type: 'code',
    },
    {
      id: 'styling-3',
      title: 'Styling in React Native',
      content: `React Native uses StyleSheet API for styling components. It's similar to CSS but uses JavaScript objects.

Example:

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

Benefits:
• Type checking for style properties
• Better performance than inline styles
• Cleaner, more maintainable code`,
      type: 'code',
    },
    {
      id: 'practice-4',
      title: 'Practice Exercise',
      content: `Now it's time to put your knowledge to the test!

Exercise: Create a simple ProfileCard component that:
1. Accepts name and role as props
2. Displays the information in a styled card
3. Uses StyleSheet for styling

Try it on your own before checking the solution. Remember to use View, Text, and StyleSheet components we've learned about.`,
      type: 'quiz',
    },
    {
      id: 'summary-5',
      title: 'Lesson Summary',
      content: `Congratulations! You've completed the React Native basics lesson.

What you learned:
✓ What React Native is and its benefits
✓ How to create and use components
✓ Styling components with StyleSheet
✓ Basic component composition

Next steps:
• Practice building simple components
• Explore the React Native documentation
• Try the advanced lessons
• Build your first complete app

Keep practicing and you'll be building amazing mobile apps in no time!`,
      type: 'text',
    },
  ];

  const handleSectionChange = (index: number) => {
    setCurrentSection(index);
    console.log(`Navigated to section ${index + 1}`);
  };

  const handleComplete = () => {
    console.log('Lesson completed! 🎉');
    // In a real app, you might:
    // - Navigate to the next lesson
    // - Show XP celebration
    // - Update user progress in database
    // - Unlock next content
    alert('Lesson completed! Great job! 🎉');
  };

  return (
    <View style={styles.container}>
      <LessonSections
        sections={sections}
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        onComplete={handleComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
});

// Alternative: Controlled component pattern
export function ControlledLessonSections() {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());

  const sections: Section[] = [
    // ... your sections
  ];

  const handleSectionChange = (index: number) => {
    // Mark current section as completed before moving
    setCompletedSections((prev) => new Set(prev).add(currentSection));
    setCurrentSection(index);

    // You could also save progress to AsyncStorage here
    // await AsyncStorage.setItem('lesson-progress', JSON.stringify({
    //   currentSection: index,
    //   completedSections: Array.from(completedSections),
    // }));
  };

  const handleComplete = async () => {
    // Mark final section as completed
    setCompletedSections((prev) => new Set(prev).add(currentSection));

    // Save completion to backend
    // await api.completeLesson(lessonId);

    console.log(`Completed sections: ${completedSections.size + 1}/${sections.length}`);
  };

  return (
    <View style={styles.container}>
      <LessonSections
        sections={sections}
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        onComplete={handleComplete}
      />
    </View>
  );
}
