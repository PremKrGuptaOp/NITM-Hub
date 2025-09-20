import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../common/Header';
import { EventCard } from './EventCard';
import { mockEvents } from '../../data/mockData';
import { Calendar, Filter } from 'lucide-react';

type FilterType = 'all' | 'technical' | 'cultural' | 'sports';

export const EventsPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredEvents = mockEvents.filter(event => 
    filter === 'all' || event.category.toLowerCase() === filter
  );

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'technical', label: 'Technical' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'sports', label: 'Sports' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header 
        title="Events" 
        showMore
        onMore={() => {}}
      />

      {/* Filter Tabs */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="flex space-x-2 overflow-x-auto max-w-md mx-auto">
          {filters.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filter === id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="p-4 max-w-md mx-auto">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
            <p className="text-gray-500">Check back later for upcoming events!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};