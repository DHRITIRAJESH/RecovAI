import React, { useState } from 'react';
import { Book, Play, FileText, ChevronRight, Search, Clock, Download } from 'lucide-react';

const EducationLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'daily', name: 'Day-by-Day Guide', icon: '📅' },
    { id: 'wound', name: 'Wound Care', icon: '🩹' },
    { id: 'exercise', name: 'Exercises', icon: '💪' },
    { id: 'nutrition', name: 'Nutrition', icon: '🍽️' },
    { id: 'pain', name: 'Pain Management', icon: '💊' }
  ];

  const resources = [
    {
      id: 1,
      title: 'What to Expect: Day 1-7 After Surgery',
      category: 'daily',
      type: 'article',
      duration: '8 min read',
      content: 'Detailed timeline of recovery milestones and what\'s normal vs. concerning...',
      keyPoints: [
        'Day 1-2: Expect significant pain, limited mobility, hospital monitoring',
        'Day 3-4: Pain should start decreasing, begin walking short distances',
        'Day 5-7: Transition to home, manage activities independently',
        'Warning signs: Fever over 101°F, severe pain, excessive bleeding'
      ]
    },
    {
      id: 2,
      title: 'Surgical Wound Care: Step-by-Step Guide',
      category: 'wound',
      type: 'video',
      duration: '5:30 min',
      videoUrl: 'https://www.youtube.com/embed/wound-care-demo',
      content: 'Learn proper techniques for cleaning and dressing your surgical wound...',
      keyPoints: [
        'Wash hands thoroughly before touching wound',
        'Clean with saline solution or soap and water',
        'Pat dry gently with clean towel',
        'Apply new sterile dressing if needed',
        'Watch for signs of infection: redness, warmth, pus, increasing pain'
      ]
    },
    {
      id: 3,
      title: 'Breathing Exercises: Prevent Pneumonia',
      category: 'exercise',
      type: 'video',
      duration: '3:45 min',
      videoUrl: 'https://www.youtube.com/embed/breathing-exercises',
      content: 'Essential breathing techniques to keep lungs clear after surgery...',
      keyPoints: [
        'Use incentive spirometer 10 times every hour while awake',
        'Deep breathing: Inhale slowly for 5 counts, hold 5 counts, exhale 5 counts',
        'Coughing technique: Hug pillow to incision, take deep breath, cough 2-3 times',
        'Prevents pneumonia and promotes lung expansion'
      ]
    },
    {
      id: 4,
      title: 'Gentle Walking Routine: Week 1-4',
      category: 'exercise',
      type: 'article',
      duration: '6 min read',
      content: 'Progressive walking plan to rebuild strength safely...',
      keyPoints: [
        'Week 1: Walk 5 minutes, 3 times daily around home',
        'Week 2: Walk 10 minutes, 2-3 times daily',
        'Week 3: Walk 15-20 minutes once or twice daily',
        'Week 4: Walk 30 minutes daily, can add gentle inclines',
        'Stop if you experience dizziness, chest pain, or severe fatigue'
      ]
    },
    {
      id: 5,
      title: 'Nutrition for Healing: What to Eat',
      category: 'nutrition',
      type: 'article',
      duration: '10 min read',
      content: 'Foods that promote wound healing and boost recovery...',
      keyPoints: [
        'Protein: 20-30g per meal (chicken, fish, eggs, beans) - builds tissue',
        'Vitamin C: Citrus, berries, bell peppers - boosts collagen',
        'Zinc: Nuts, seeds, whole grains - supports immune system',
        'Hydration: 8-10 glasses of water daily',
        'Avoid: Processed foods, excessive sugar, alcohol'
      ]
    },
    {
      id: 6,
      title: 'Managing Pain Without Over-Medicating',
      category: 'pain',
      type: 'article',
      duration: '7 min read',
      content: 'Balance pain control with safe medication use...',
      keyPoints: [
        'Take pain meds BEFORE pain becomes severe (stay ahead of it)',
        'Use ice packs 15-20 minutes, 3-4 times daily',
        'Gentle movement helps - don\'t stay completely still',
        'Relaxation techniques: deep breathing, meditation, music',
        'Gradually reduce opioids as pain decreases (talk to doctor first)'
      ]
    },
    {
      id: 7,
      title: 'Showering Safely with Surgical Incision',
      category: 'wound',
      type: 'video',
      duration: '4:15 min',
      videoUrl: 'https://www.youtube.com/embed/shower-tips',
      content: 'How to keep your incision clean while showering...',
      keyPoints: [
        'Wait until cleared by doctor (usually 48-72 hours)',
        'Use waterproof dressing or plastic wrap over incision',
        'Use mild, unscented soap',
        'Pat incision dry - don\'t rub',
        'Avoid hot water directly on incision',
        'No baths, swimming, or hot tubs until fully healed'
      ]
    },
    {
      id: 8,
      title: 'When to Call Your Doctor: Warning Signs',
      category: 'daily',
      type: 'article',
      duration: '5 min read',
      content: 'Know the difference between normal recovery and complications...',
      keyPoints: [
        '🚨 CALL 911: Chest pain, difficulty breathing, severe bleeding',
        '☎️ CALL DOCTOR SAME DAY: Fever >101°F, vomiting, severe pain not controlled by meds',
        '📞 CALL WITHIN 24 HRS: Wound redness spreading, foul odor, excessive swelling',
        '✅ NORMAL: Mild pain, fatigue, small amount of clear drainage, bruising'
      ]
    },
    {
      id: 9,
      title: 'Core Strengthening: Weeks 3-6',
      category: 'exercise',
      type: 'video',
      duration: '8:20 min',
      videoUrl: 'https://www.youtube.com/embed/core-exercises',
      content: 'Gentle core exercises to rebuild abdominal strength...',
      keyPoints: [
        'Start ONLY after cleared by doctor/PT',
        'Pelvic tilts: Lie on back, gently tilt pelvis',
        'Heel slides: Slowly slide one heel away and back',
        'Seated marches: Lift knees alternately while seated',
        'No sit-ups, crunches, or heavy lifting until 6+ weeks'
      ]
    },
    {
      id: 10,
      title: 'Constipation Prevention & Relief',
      category: 'daily',
      type: 'article',
      duration: '6 min read',
      content: 'Combat the common side effect of pain medications...',
      keyPoints: [
        'Drink 8-10 glasses of water daily',
        'Eat high-fiber foods: fruits, vegetables, whole grains',
        'Take stool softener as prescribed',
        'Gentle walking helps bowel movement',
        'Don\'t strain - call doctor if no bowel movement for 3 days'
      ]
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">📚 Education Library</h1>
        <p className="text-indigo-100">Interactive content to guide your recovery journey</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, videos, guides..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
            }`}
          >
            <span className="text-xl">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setSelectedResource(resource)}
          >
            {/* Resource Type Badge */}
            <div className={`h-2 ${resource.type === 'video' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
            
            <div className="p-6">
              {/* Type Icon */}
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-lg ${resource.type === 'video' ? 'bg-red-100' : 'bg-blue-100'}`}>
                  {resource.type === 'video' ? (
                    <Play className={resource.type === 'video' ? 'text-red-600' : 'text-blue-600'} size={24} />
                  ) : (
                    <FileText className="text-blue-600" size={24} />
                  )}
                </div>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={14} />
                  {resource.duration}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                {resource.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {resource.content}
              </p>

              {/* Key Points Preview */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-1">Key Takeaways:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {resource.keyPoints.slice(0, 2).map((point, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span className="line-clamp-1">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* View Button */}
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                {resource.type === 'video' ? 'Watch Video' : 'Read Article'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedResource(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Close Button */}
              <button
                onClick={() => setSelectedResource(null)}
                className="float-right text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{selectedResource.title}</h2>

              {/* Video Player or Article Content */}
              {selectedResource.type === 'video' ? (
                <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm opacity-75">Video player would load here</p>
                    <p className="text-xs opacity-50 mt-2">{selectedResource.videoUrl}</p>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 text-lg mb-4">{selectedResource.content}</p>
                </div>
              )}

              {/* Key Points */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Book className="text-blue-600" size={24} />
                  Key Points
                </h3>
                <ul className="space-y-3">
                  {selectedResource.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Download size={20} />
                  Download PDF
                </button>
                <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
                  Mark as Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <Book className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No resources found</h3>
          <p className="text-gray-500">Try adjusting your search or category filter</p>
        </div>
      )}
    </div>
  );
};

export default EducationLibrary;
