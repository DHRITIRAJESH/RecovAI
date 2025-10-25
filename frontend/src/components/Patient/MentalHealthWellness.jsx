import React, { useState, useEffect } from 'react';
import { Heart, Smile, Frown, Meh, TrendingUp, Calendar, Play, Phone, MessageCircle } from 'lucide-react';
import axios from 'axios';

const MentalHealthWellness = () => {
  const [todayMood, setTodayMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [moodSaved, setMoodSaved] = useState(false);

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const response = await axios.get('/api/mood/history', { withCredentials: true });
      setMoodHistory(response.data.history || getMockMoodHistory());
    } catch (error) {
      console.error('Error fetching mood history:', error);
      setMoodHistory(getMockMoodHistory());
    }
  };

  const getMockMoodHistory = () => {
    return [
      { date: '2025-10-26', mood: 'good', note: 'Feeling stronger today' },
      { date: '2025-10-25', mood: 'okay', note: 'Some anxiety about recovery' },
      { date: '2025-10-24', mood: 'bad', note: 'Pain was difficult' },
      { date: '2025-10-23', mood: 'okay', note: 'First day home, nervous' },
      { date: '2025-10-22', mood: 'bad', note: 'Post-surgery fatigue' },
      { date: '2025-10-21', mood: 'bad', note: 'Surgery day, scared' },
      { date: '2025-10-20', mood: 'anxious', note: 'Pre-surgery jitters' }
    ];
  };

  const moods = [
    { value: 'great', emoji: '😄', label: 'Great', color: 'green' },
    { value: 'good', emoji: '🙂', label: 'Good', color: 'lightgreen' },
    { value: 'okay', emoji: '😐', label: 'Okay', color: 'yellow' },
    { value: 'bad', emoji: '☹️', label: 'Bad', color: 'orange' },
    { value: 'terrible', emoji: '😢', label: 'Terrible', color: 'red' }
  ];

  const meditations = [
    {
      id: 1,
      title: 'Deep Breathing for Pain Relief',
      duration: '5 min',
      category: 'Pain Management',
      icon: '🧘',
      description: 'Guided breathing to reduce pain perception and promote relaxation'
    },
    {
      id: 2,
      title: 'Body Scan Meditation',
      duration: '10 min',
      category: 'Relaxation',
      icon: '✨',
      description: 'Progressive muscle relaxation to release tension and improve sleep'
    },
    {
      id: 3,
      title: 'Anxiety Release',
      duration: '8 min',
      category: 'Mental Health',
      icon: '🌊',
      description: 'Calm anxious thoughts about recovery and regain mental peace'
    },
    {
      id: 4,
      title: 'Healing Visualization',
      duration: '12 min',
      category: 'Recovery',
      icon: '🌟',
      description: 'Visualize your body healing and recovering stronger each day'
    },
    {
      id: 5,
      title: 'Gratitude Practice',
      duration: '7 min',
      category: 'Positive Thinking',
      icon: '💚',
      description: 'Focus on progress and cultivate gratitude for your recovery journey'
    },
    {
      id: 6,
      title: 'Sleep Preparation',
      duration: '15 min',
      category: 'Sleep',
      icon: '🌙',
      description: 'Wind down and prepare for restful, healing sleep'
    }
  ];

  const wellnessTips = [
    {
      icon: '💪',
      title: 'Celebrate Small Wins',
      tip: 'Each day of recovery is progress. Walked to the bathroom? Win. Took your meds on time? Win. Be proud of every step.'
    },
    {
      icon: '🗣️',
      title: 'Talk About It',
      tip: 'It\'s normal to feel anxious, scared, or frustrated. Share your feelings with family, friends, or your care team.'
    },
    {
      icon: '📵',
      title: 'Limit Stress',
      tip: 'Reduce stressful activities, news, or social media. Focus on healing - your body and mind need rest.'
    },
    {
      icon: '🌞',
      title: 'Get Sunlight',
      tip: 'Spend 10-15 minutes in natural light daily. It boosts mood, regulates sleep, and supports healing.'
    }
  ];

  const resources = [
    {
      type: 'Counselor',
      name: 'Hospital Counseling Services',
      phone: '+1 (555) 123-4570',
      available: 'Mon-Fri, 9 AM - 5 PM',
      description: 'Free counseling for surgical patients'
    },
    {
      type: 'Support Group',
      name: 'Recovery Support Community',
      link: 'https://recovercommunity.org',
      available: '24/7 Online Forum',
      description: 'Connect with others going through similar experiences'
    },
    {
      type: 'Crisis Line',
      name: 'Mental Health Crisis Hotline',
      phone: '988',
      available: '24/7',
      description: 'Immediate support for mental health emergencies'
    }
  ];

  const saveMood = async (mood) => {
    setTodayMood(mood);
    setMoodSaved(true);

    try {
      await axios.post('/api/mood/log', {
        mood: mood.value,
        date: new Date().toISOString().split('T')[0],
        note: ''
      }, { withCredentials: true });

      fetchMoodHistory();
    } catch (error) {
      console.error('Error saving mood:', error);
    }

    setTimeout(() => setMoodSaved(false), 3000);
  };

  const getMoodColor = (mood) => {
    const colors = {
      great: 'bg-green-100 border-green-500 text-green-800',
      good: 'bg-lime-100 border-lime-500 text-lime-800',
      okay: 'bg-yellow-100 border-yellow-500 text-yellow-800',
      bad: 'bg-orange-100 border-orange-500 text-orange-800',
      terrible: 'bg-red-100 border-red-500 text-red-800',
      anxious: 'bg-purple-100 border-purple-500 text-purple-800'
    };
    return colors[mood] || colors.okay;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">💗 Mental Health & Wellness</h1>
        <p className="text-pink-100">Your emotional well-being is just as important as physical recovery</p>
      </div>

      {/* Mood Saved Confirmation */}
      {moodSaved && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 p-4 rounded">
          <p className="text-green-800 font-medium">✅ Mood logged successfully! Keep tracking your progress.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Daily Mood Tracker */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Heart className="text-pink-600" />
            How are you feeling today?
          </h2>
          
          <div className="grid grid-cols-5 gap-3 mb-6">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => saveMood(mood)}
                className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                  todayMood?.value === mood.value
                    ? getMoodColor(mood.value) + ' scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-2">{mood.emoji}</div>
                <div className="text-sm font-medium text-gray-700">{mood.label}</div>
              </button>
            ))}
          </div>

          {/* Mood Trend Chart */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp size={20} />
              7-Day Mood Trend
            </h3>
            <div className="flex items-end gap-2 h-32 mb-2">
              {moodHistory.slice(0, 7).reverse().map((entry, index) => {
                const moodValue = { terrible: 1, bad: 2, okay: 3, good: 4, great: 5, anxious: 2 }[entry.mood] || 3;
                const height = (moodValue / 5) * 100;
                const color = {
                  terrible: 'bg-red-400',
                  bad: 'bg-orange-400',
                  okay: 'bg-yellow-400',
                  good: 'bg-lime-400',
                  great: 'bg-green-400',
                  anxious: 'bg-purple-400'
                }[entry.mood];

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t ${color}`}
                      style={{ height: `${height}%` }}
                      title={entry.note}
                    />
                    <span className="text-xs text-gray-500 mt-1">
                      {index === 6 ? 'Today' : `${7-index}d`}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-gray-500 text-center">
              Hover over bars to see your notes
            </div>
          </div>
        </div>

        {/* Wellness Tips */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Wellness Tips</h3>
          <div className="space-y-4">
            {wellnessTips.map((tip, index) => (
              <div key={index} className="border-l-4 border-purple-500 pl-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{tip.icon}</span>
                  <h4 className="font-semibold text-gray-800 text-sm">{tip.title}</h4>
                </div>
                <p className="text-xs text-gray-600">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guided Meditations */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Play className="text-purple-600" />
          Guided Meditations & Mindfulness
        </h2>
        <p className="text-gray-600 mb-6">
          Evidence-based techniques to manage pain, reduce anxiety, and promote healing
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meditations.map((meditation) => (
            <div
              key={meditation.id}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedMeditation(meditation)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{meditation.icon}</div>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  {meditation.duration}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{meditation.title}</h3>
              <p className="text-xs text-gray-500 mb-3">{meditation.category}</p>
              <p className="text-sm text-gray-600 mb-4">{meditation.description}</p>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                <Play size={16} />
                Start Session
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Resources */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Phone className="text-blue-600" />
          Professional Support Resources
        </h2>
        <p className="text-gray-600 mb-6">
          You don't have to face this alone. Reach out to mental health professionals anytime.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {resources.map((resource, index) => (
            <div key={index} className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-bold text-blue-900 mb-1">{resource.type}</h3>
              <p className="text-sm font-medium text-blue-800 mb-2">{resource.name}</p>
              <p className="text-xs text-blue-600 mb-3">{resource.description}</p>
              <div className="text-xs text-blue-700 mb-3">
                <Calendar className="inline mr-1" size={12} />
                {resource.available}
              </div>
              {resource.phone ? (
                <a
                  href={`tel:${resource.phone}`}
                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                >
                  Call {resource.phone}
                </a>
              ) : (
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                >
                  Visit Online
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Meditation Player Modal */}
      {selectedMeditation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMeditation(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedMeditation(null)}
              className="float-right text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            <div className="text-center">
              <div className="text-6xl mb-4">{selectedMeditation.icon}</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedMeditation.title}</h2>
              <p className="text-purple-600 mb-4">{selectedMeditation.category} • {selectedMeditation.duration}</p>
              <p className="text-gray-600 mb-8">{selectedMeditation.description}</p>
              
              {/* Mock Audio Player */}
              <div className="bg-purple-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <button className="bg-purple-600 text-white rounded-full p-6 hover:bg-purple-700 transition-colors">
                    <Play size={32} />
                  </button>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <div className="flex justify-between text-sm text-purple-700 mt-2">
                  <span>0:00</span>
                  <span>{selectedMeditation.duration}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMeditation(null)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-6 bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
        <div className="flex items-start gap-3">
          <Heart className="text-purple-600 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-purple-900 mb-1">Your Mental Health Matters</h3>
            <p className="text-sm text-purple-700">
              Recovery isn't just physical. Anxiety, depression, and stress are common after surgery. 
              If you're struggling, please reach out to the resources above. You deserve support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthWellness;
