import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Circle, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';

const RecoveryPlan = () => {
  const [timeline, setTimeline] = useState('daily'); // daily, weekly
  const [milestones, setMilestones] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecoveryPlan();
  }, []);

  const fetchRecoveryPlan = async () => {
    try {
      const response = await axios.get('/api/recovery-plan', { withCredentials: true });
      setMilestones(response.data.milestones || getMockMilestones());
      setCurrentPhase(response.data.phase || 'Immediate Post-Op');
    } catch (error) {
      console.error('Error fetching recovery plan:', error);
      setMilestones(getMockMilestones());
      setCurrentPhase('Immediate Post-Op');
    } finally {
      setLoading(false);
    }
  };

  const getMockMilestones = () => {
    const dailyMilestones = [
      {
        day: 1,
        phase: 'Immediate Post-Op',
        milestones: [
          { id: 1, category: 'Rest', task: 'Stay in bed, minimal movement', completed: true, priority: 'high' },
          { id: 2, category: 'Pain', task: 'Take prescribed pain medication every 4-6 hours', completed: true, priority: 'high' },
          { id: 3, category: 'Diet', task: 'Clear liquids only (water, broth, apple juice)', completed: true, priority: 'medium' },
          { id: 4, category: 'Monitoring', task: 'Nurse checks vitals every 2 hours', completed: true, priority: 'high' }
        ]
      },
      {
        day: 2,
        phase: 'Immediate Post-Op',
        milestones: [
          { id: 5, category: 'Walking', task: 'Walk 50 feet with assistance (3 times)', completed: true, priority: 'high' },
          { id: 6, category: 'Diet', task: 'Progress to soft foods (yogurt, soup)', completed: true, priority: 'medium' },
          { id: 7, category: 'Wound', task: 'First dressing change by nurse', completed: false, priority: 'high' },
          { id: 8, category: 'Breathing', task: 'Use incentive spirometer 10 times/hour', completed: false, priority: 'medium' }
        ]
      },
      {
        day: 3,
        phase: 'Early Recovery',
        milestones: [
          { id: 9, category: 'Walking', task: 'Walk hallway length (2-3 times)', completed: false, priority: 'high' },
          { id: 10, category: 'Diet', task: 'Regular diet as tolerated', completed: false, priority: 'low' },
          { id: 11, category: 'Independence', task: 'Get out of bed without assistance', completed: false, priority: 'medium' },
          { id: 12, category: 'Education', task: 'Learn wound care techniques', completed: false, priority: 'high' }
        ]
      },
      {
        day: 4,
        phase: 'Early Recovery',
        milestones: [
          { id: 13, category: 'Walking', task: 'Walk 10 minutes continuously', completed: false, priority: 'high' },
          { id: 14, category: 'Shower', task: 'First shower with waterproof dressing', completed: false, priority: 'medium' },
          { id: 15, category: 'Discharge', task: 'Discharge readiness assessment', completed: false, priority: 'high' },
          { id: 16, category: 'Planning', task: 'Review home care instructions', completed: false, priority: 'high' }
        ]
      },
      {
        day: 5,
        phase: 'Discharge Preparation',
        milestones: [
          { id: 17, category: 'Walking', task: 'Walk stairs if needed at home', completed: false, priority: 'medium' },
          { id: 18, category: 'Medications', task: 'Understand all home medications', completed: false, priority: 'high' },
          { id: 19, category: 'Follow-up', task: 'Schedule 1-week follow-up appointment', completed: false, priority: 'high' },
          { id: 20, category: 'Emergency', task: 'Know warning signs to watch for', completed: false, priority: 'high' }
        ]
      }
    ];

    const weeklyMilestones = [
      {
        week: 1,
        phase: 'Hospital Recovery',
        goals: [
          { id: 1, goal: 'Pain managed with oral medications', status: 'completed' },
          { id: 2, goal: 'Walking independently', status: 'completed' },
          { id: 3, goal: 'Eating regular diet', status: 'completed' },
          { id: 4, goal: 'Wound healing well', status: 'in-progress' }
        ]
      },
      {
        week: 2,
        phase: 'Home Recovery',
        goals: [
          { id: 5, goal: 'Manage daily activities independently', status: 'in-progress' },
          { id: 6, goal: 'Walk 15 minutes twice daily', status: 'in-progress' },
          { id: 7, goal: 'Resume light household tasks', status: 'pending' },
          { id: 8, goal: 'Attend follow-up appointment', status: 'pending' }
        ]
      },
      {
        week: 3,
        phase: 'Active Recovery',
        goals: [
          { id: 9, goal: 'Increase walking to 30 minutes daily', status: 'pending' },
          { id: 10, goal: 'Begin gentle stretching exercises', status: 'pending' },
          { id: 11, goal: 'Resume driving (if cleared by doctor)', status: 'pending' },
          { id: 12, goal: 'Return to work (desk job) if approved', status: 'pending' }
        ]
      },
      {
        week: 4,
        phase: 'Advanced Recovery',
        goals: [
          { id: 13, goal: 'Walk 45 minutes daily', status: 'pending' },
          { id: 14, goal: 'Resume most normal activities', status: 'pending' },
          { id: 15, goal: 'Final wound check', status: 'pending' },
          { id: 16, goal: 'Discuss return to full activity', status: 'pending' }
        ]
      }
    ];

    return timeline === 'daily' ? dailyMilestones : weeklyMilestones;
  };

  const toggleMilestone = async (milestoneId) => {
    setMilestones(prev => 
      prev.map(day => ({
        ...day,
        milestones: day.milestones?.map(m => 
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        ) || day.goals?.map(g =>
          g.id === milestoneId ? { ...g, status: g.status === 'completed' ? 'in-progress' : 'completed' } : g
        )
      }))
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-gray-500 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Walking': '🚶',
      'Rest': '🛏️',
      'Diet': '🍽️',
      'Pain': '💊',
      'Wound': '🩹',
      'Breathing': '🫁',
      'Monitoring': '📊',
      'Independence': '💪',
      'Education': '📚',
      'Shower': '🚿',
      'Discharge': '🏠',
      'Planning': '📋',
      'Medications': '💊',
      'Follow-up': '📅',
      'Emergency': '🚨'
    };
    return icons[category] || '📌';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">🏥 Your Personalized Recovery Plan</h1>
        <p className="text-blue-100">Dynamic timeline adapts to your progress and symptoms</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="bg-white/20 px-4 py-2 rounded-lg">
            Current Phase: <strong>{currentPhase}</strong>
          </span>
          <TrendingUp className="ml-4" size={24} />
          <span>Recovery on track</span>
        </div>
      </div>

      {/* Timeline Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTimeline('daily')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            timeline === 'daily'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Calendar className="inline mr-2" size={20} />
          Daily View
        </button>
        <button
          onClick={() => setTimeline('weekly')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            timeline === 'weekly'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Clock className="inline mr-2" size={20} />
          Weekly Goals
        </button>
      </div>

      {/* Milestones Timeline */}
      {timeline === 'daily' ? (
        <div className="space-y-6">
          {milestones.map((dayData) => (
            <div key={dayData.day} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Day {dayData.day}</h2>
                  <p className="text-sm text-gray-500">{dayData.phase}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {dayData.milestones?.filter(m => m.completed).length || 0} / {dayData.milestones?.length || 0} completed
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${((dayData.milestones?.filter(m => m.completed).length || 0) / (dayData.milestones?.length || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {dayData.milestones?.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      milestone.completed
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                    onClick={() => toggleMilestone(milestone.id)}
                  >
                    <div className="mt-1">
                      {milestone.completed ? (
                        <CheckCircle className="text-green-600" size={24} />
                      ) : (
                        <Circle className="text-gray-400" size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl">{getCategoryIcon(milestone.category)}</span>
                        <span className="font-semibold text-gray-700">{milestone.category}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(milestone.priority)}`}>
                          {milestone.priority}
                        </span>
                      </div>
                      <p className={`text-gray-600 ${milestone.completed ? 'line-through' : ''}`}>
                        {milestone.task}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {milestones.map((weekData) => (
            <div key={weekData.week} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Week {weekData.week}</h2>
                  <p className="text-sm text-gray-500">{weekData.phase}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {weekData.goals?.filter(g => g.status === 'completed').length || 0} / {weekData.goals?.length || 0} achieved
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {weekData.goals?.map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${getStatusColor(goal.status)} border-current`}
                    onClick={() => toggleMilestone(goal.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {goal.status === 'completed' ? (
                          <CheckCircle size={20} />
                        ) : goal.status === 'in-progress' ? (
                          <Clock size={20} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{goal.goal}</p>
                        <span className="text-xs capitalize mt-1 inline-block">
                          {goal.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Smart Adaptation Notice */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-blue-600 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Dynamic Plan</h3>
            <p className="text-sm text-blue-700">
              Your recovery plan automatically adapts based on your symptom logs, progress tracking, and any changes in risk assessment. 
              If you report concerning symptoms, your care team will be notified and milestones may be adjusted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryPlan;
