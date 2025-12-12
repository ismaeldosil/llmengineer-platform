/**
 * ActivityHistory Component - Example Usage
 *
 * This file demonstrates how to use the ActivityHistory component
 * in different scenarios throughout the application.
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { ActivityHistory, Activity } from './ActivityHistory';

// Example 1: Basic Usage with Static Data
export function BasicExample() {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'lesson',
      title: 'Completaste "Introducción a LLMs"',
      description: 'Primera lección del módulo básico',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      metadata: { xp: 50 },
    },
    {
      id: '2',
      type: 'badge',
      title: 'Ganaste insignia "Primer Paso"',
      description: 'Completaste tu primera lección',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      metadata: { xp: 100 },
    },
    {
      id: '3',
      type: 'level',
      title: 'Alcanzaste Nivel 5',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      id: '4',
      type: 'game',
      title: 'Jugaste "Quiz de Conceptos"',
      description: 'Excelente desempeño en el quiz',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      metadata: { score: 850, xp: 75 },
    },
  ];

  return <ActivityHistory activities={activities} />;
}

// Example 2: With Load More Functionality
export function LoadMoreExample() {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'lesson',
      title: 'Completaste "Arquitectura de Transformers"',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      metadata: { xp: 75 },
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleLoadMore = async () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newActivities: Activity[] = [
        {
          id: String(activities.length + 1),
          type: 'badge',
          title: 'Ganaste insignia "Experto en Prompts"',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          metadata: { xp: 150 },
        },
      ];

      setActivities([...activities, ...newActivities]);
      setLoading(false);
    }, 1000);
  };

  return <ActivityHistory activities={activities} onLoadMore={handleLoadMore} loading={loading} />;
}

// Example 3: With API Integration
export function ApiIntegrationExample() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await fetch('/api/user/activities');
      // const data = await response.json();

      // Mock data for demonstration
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'lesson',
          title: 'Completaste "Fine-tuning de Modelos"',
          description: 'Lección avanzada sobre ajuste fino',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          metadata: { xp: 100 },
        },
        {
          id: '2',
          type: 'game',
          title: 'Jugaste "Desafío de Embeddings"',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          metadata: { score: 950, xp: 80 },
        },
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  return <ActivityHistory activities={activities} loading={loading} />;
}

// Example 4: Empty State
export function EmptyStateExample() {
  return <ActivityHistory activities={[]} />;
}

// Example 5: Paginated Loading
export function PaginatedExample() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadPage = async (pageNum: number) => {
    setLoading(true);

    // Simulate API call with pagination
    setTimeout(() => {
      const newActivities: Activity[] = Array.from({ length: 5 }, (_, i) => ({
        id: String((pageNum - 1) * 5 + i + 1),
        type: (['lesson', 'badge', 'level', 'game'] as const)[i % 4],
        title: `Actividad ${(pageNum - 1) * 5 + i + 1}`,
        timestamp: new Date(Date.now() - (pageNum * 5 + i) * 24 * 60 * 60 * 1000),
        metadata: { xp: 50 },
      }));

      setActivities([...activities, ...newActivities]);
      setHasMore(pageNum < 3); // Only 3 pages available
      setLoading(false);
    }, 1000);
  };

  React.useEffect(() => {
    loadPage(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPage(nextPage);
  };

  return (
    <ActivityHistory
      activities={activities}
      onLoadMore={hasMore ? handleLoadMore : undefined}
      loading={loading}
    />
  );
}

// Example 6: Real-time Updates
export function RealTimeExample() {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'lesson',
      title: 'Completaste "RAG y Retrieval"',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      metadata: { xp: 60 },
    },
  ]);

  // Simulate real-time updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      const newActivity: Activity = {
        id: String(Date.now()),
        type: 'game',
        title: 'Nuevo logro desbloqueado',
        timestamp: new Date(),
        metadata: { xp: 25 },
      };

      setActivities((prev) => [newActivity, ...prev]);
    }, 30000); // Add new activity every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return <ActivityHistory activities={activities} />;
}

// Example 7: Filtered Activities
export function FilteredExample() {
  const allActivities: Activity[] = [
    {
      id: '1',
      type: 'lesson',
      title: 'Completaste "Prompt Engineering"',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      metadata: { xp: 50 },
    },
    {
      id: '2',
      type: 'badge',
      title: 'Ganaste insignia "Maestro de Prompts"',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      metadata: { xp: 100 },
    },
    {
      id: '3',
      type: 'game',
      title: 'Jugaste "Quiz de LLMs"',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      metadata: { score: 780, xp: 60 },
    },
    {
      id: '4',
      type: 'level',
      title: 'Alcanzaste Nivel 10',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  ];

  const [filter, _setFilter] = useState<Activity['type'] | 'all'>('all');

  const filteredActivities =
    filter === 'all' ? allActivities : allActivities.filter((a) => a.type === filter);

  return (
    <View>
      {/* Add filter buttons here */}
      <ActivityHistory activities={filteredActivities} />
    </View>
  );
}
