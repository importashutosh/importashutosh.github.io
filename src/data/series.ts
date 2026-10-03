export type SeriesTopic = { order: number; title: string };

export const series: Record<
  string,
  { id: string; title: string; description: string; topics: SeriesTopic[] }
> = {
  'system-design': {
    id: 'system-design',
    title: 'System Design',
    description: 'A running series on system design topics, one concept per post.',
    topics: [
      { order: 1, title: 'Rate limiting' },
      { order: 2, title: 'Consistent hashing' },
      { order: 3, title: 'Kafka and message queues' },
      { order: 4, title: 'Sharding' },
      { order: 5, title: 'CQRS' },
      { order: 6, title: 'Saga pattern' },
      { order: 7, title: 'CDN' },
      { order: 8, title: 'Caching' },
      // OWNER: add remaining topics to reach 30
    ],
  },
};
