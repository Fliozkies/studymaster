import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  BookOpen, Plus, Play, Users, Trophy, Settings, LogOut, 
  Clock, Brain, Shuffle, List, Eye, EyeOff, ChevronDown,
  Heart, Share2, Edit2, Trash2, Check, X, Home, Search,
  Target, Zap, Award, TrendingUp, Calendar
} from 'lucide-react';

// Initialize Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// AI Mock Functions (replace with actual AI API calls)
const generateDistractors = async (correctAnswer, context, count = 3) => {
  // Simulate AI generation - replace with actual API call
  const distractors = [
    `Similar to ${correctAnswer}`,
    `Related term ${Math.floor(Math.random() * 100)}`,
    `Alternative ${Math.floor(Math.random() * 100)}`
  ];
  return distractors.slice(0, count);
};

const generateDeceptiveTerm = async (correctAnswer, context) => {
  // Simulate AI generation - replace with actual API call
  const deceptive = [
    'Black', 'Red', 'Blue', 'Green', 'Yellow', 
    'War', 'Chaos', 'Darkness', 'Anger', 'Fear',
    'Hue', 'Shade', 'Tone', 'Tint', 'Pigment'
  ];
  return deceptive[Math.floor(Math.random() * deceptive.length)];
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading StudyMaster...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen authMode={authMode} setAuthMode={setAuthMode} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <Navigation view={view} setView={setView} user={user} />
      <main className="container mx-auto px-4 py-6">
        {view === 'home' && <HomeView setView={setView} />}
        {view === 'decks' && <DecksView user={user} setView={setView} />}
        {view === 'study' && <StudyView user={user} />}
        {view === 'leaderboard' && <LeaderboardView />}
        {view === 'dashboard' && <DashboardView user={user} />}
      </main>
    </div>
  );
}

function AuthScreen({ authMode, setAuthMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } }
        });
        if (error) throw error;
        alert('Check your email for verification link!');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">StudyMaster</h1>
          <p className="text-gray-600 mt-2">Master anything, one card at a time</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Navigation({ view, setView, user }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">StudyMaster</span>
            </div>
            
            <div className="hidden md:flex space-x-4">
              <NavButton icon={Home} label="Home" active={view === 'home'} onClick={() => setView('home')} />
              <NavButton icon={BookOpen} label="Decks" active={view === 'decks'} onClick={() => setView('decks')} />
              <NavButton icon={Play} label="Study" active={view === 'study'} onClick={() => setView('study')} />
              <NavButton icon={Trophy} label="Leaderboard" active={view === 'leaderboard'} onClick={() => setView('leaderboard')} />
              <NavButton icon={Settings} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-indigo-600 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
        active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

function HomeView({ setView }) {
  const [stats, setStats] = useState(null);
  const [recentDecks, setRecentDecks] = useState([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Load user XP
    const { data: xpData } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setStats(xpData);

    // Load recent decks
    const { data: decksData } = await supabase
      .from('decks')
      .select('*, study_schedule(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5);

    setRecentDecks(decksData || []);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back!</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={Zap}
            label="Overall XP"
            value={stats?.overall_xp || 0}
            color="indigo"
          />
          <StatCard
            icon={Target}
            label="Multiple Choice"
            value={stats?.multiple_choice_xp || 0}
            color="blue"
          />
          <StatCard
            icon={Award}
            label="Identification"
            value={stats?.identification_xp || 0}
            color="green"
          />
          <StatCard
            icon={List}
            label="Enumeration"
            value={stats?.enumeration_xp || 0}
            color="purple"
          />
          <StatCard
            icon={Check}
            label="True/False"
            value={stats?.true_false_xp || 0}
            color="pink"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <ActionButton
              icon={Plus}
              label="Create New Deck"
              onClick={() => setView('decks')}
              color="indigo"
            />
            <ActionButton
              icon={Play}
              label="Start Study Session"
              onClick={() => setView('study')}
              color="green"
            />
            <ActionButton
              icon={Users}
              label="Challenge a Friend"
              onClick={() => setView('study')}
              color="purple"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Decks</h3>
          <div className="space-y-2">
            {recentDecks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No decks yet. Create your first deck!</p>
            ) : (
              recentDecks.map(deck => (
                <div key={deck.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{deck.name}</span>
                    <span className="text-sm text-gray-500">
                      {deck.study_schedule?.length > 0 && deck.study_schedule[0].last_studied
                        ? new Date(deck.study_schedule[0].last_studied).toLocaleDateString()
                        : 'Never studied'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600'
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${colors[color]} mb-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, color }) {
  const colors = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 ${colors[color]} text-white rounded-lg transition`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

function DecksView({ user, setView }) {
  const [decks, setDecks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    const { data } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setDecks(data || []);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">My Decks</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Create Deck</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map(deck => (
          <DeckCard 
            key={deck.id} 
            deck={deck} 
            onSelect={() => setSelectedDeck(deck)}
            onRefresh={loadDecks}
          />
        ))}
      </div>

      {showCreateModal && (
        <CreateDeckModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadDecks();
          }}
          userId={user.id}
        />
      )}

      {selectedDeck && (
        <DeckDetailModal
          deck={selectedDeck}
          onClose={() => setSelectedDeck(null)}
          onRefresh={loadDecks}
        />
      )}
    </div>
  );
}

function DeckCard({ deck, onSelect, onRefresh }) {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    loadCards();
  }, [deck.id]);

  const loadCards = async () => {
    const { data } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', deck.id);
    setCards(data || []);
  };

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{deck.name}</h3>
        {deck.is_public && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Public</span>
        )}
      </div>
      
      {deck.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{deck.description}</p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{cards.length} cards</span>
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4" />
          <span>{deck.likes_count || 0}</span>
        </div>
      </div>
    </div>
  );
}

function CreateDeckModal({ onClose, onCreated, userId }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('decks')
      .insert([{ user_id: userId, name, description, is_public: isPublic }]);

    if (!error) onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Create New Deck</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deck Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows="3"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Make this deck public</label>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeckDetailModal({ deck, onClose, onRefresh }) {
  const [cards, setCards] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);

  useEffect(() => {
    loadDeckData();
  }, [deck.id]);

  const loadDeckData = async () => {
    const { data: cardsData } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', deck.id)
      .order('created_at', { ascending: false });

    const { data: groupsData } = await supabase
      .from('card_groups')
      .select('*')
      .eq('deck_id', deck.id);

    setCards(cardsData || []);
    setGroups(groupsData || []);
  };

  const getGroupColor = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group?.color || '#6B7280';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl my-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{deck.name}</h3>
            {deck.description && <p className="text-gray-600 mt-1">{deck.description}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {cards.map(card => (
            <div
              key={card.id}
              className="p-4 rounded-lg border-2"
              style={{ borderColor: card.group_id ? getGroupColor(card.group_id) : '#E5E7EB' }}
            >
              <p className="text-gray-900">
                {card.content.substring(0, card.term_start)}
                <span className="font-bold text-indigo-600">{card.term}</span>
                {card.content.substring(card.term_end)}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <span>Mastery: {card.mastery_level || 0}%</span>
                {card.group_id && (
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {groups.find(g => g.id === card.group_id)?.name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {showAddCard && (
          <AddCardModal
            deckId={deck.id}
            groups={groups}
            onClose={() => setShowAddCard(false)}
            onAdded={() => {
              setShowAddCard(false);
              loadDeckData();
            }}
          />
        )}
      </div>
    </div>
  );
}

function AddCardModal({ deckId, groups, onClose, onAdded }) {
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState({ start: 0, end: 0, text: '' });
  const [groupId, setGroupId] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const handleTextSelect = () => {
    const selection = window.getSelection();
    const text = selection.toString();
    if (text && content.includes(text)) {
      const start = content.indexOf(text);
      setSelectedText({ start, end: start + text.length, text });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedText.text) {
      alert('Please highlight a term first!');
      return;
    }

    const { error } = await supabase
      .from('cards')
      .insert([{
        deck_id: deckId,
        content,
        term: selectedText.text,
        term_start: selectedText.start,
        term_end: selectedText.end,
        group_id: groupId
      }]);

    if (!error) onAdded();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Add New Card</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Content (Highlight the term to study)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onMouseUp={handleTextSelect}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows="4"
              required
            />
            {selectedText.text && (
              <p className="mt-2 text-sm text-indigo-600">
                Selected term: <strong>{selectedText.text}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group (Optional)</label>
            <select
              value={groupId || ''}
              onChange={(e) => setGroupId(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">No Group</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowCreateGroup(true)}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
            >
              + Create New Group
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StudyView({ user }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Study Session</h2>
      <p className="text-gray-600 text-center py-12">
        Study session interface coming soon! This will include:
      </p>
      <ul className="text-gray-600 max-w-md mx-auto space-y-2">
        <li>• Multiple choice mode</li>
        <li>• Identification mode</li>
        <li>• Enumeration mode</li>
        <li>• True/False mode</li>
        <li>• 1v1 competitive matches</li>
        <li>• Focus mode</li>
        <li>• Progress tracking</li>
      </ul>
    </div>
  );
}

function LeaderboardView() {
  const [mode, setMode] = useState('overall');
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    loadLeaderboard();
  }, [mode]);

  const loadLeaderboard = async () => {
    const xpField = mode === 'overall' ? 'overall_xp' : `${mode}_xp`;
    
    const { data } = await supabase
      .from('user_xp')
      .select(`*, profiles(username)`)
      .order(xpField, { ascending: false })
      .limit(10);

    setLeaders(data || []);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Leaderboard</h2>

      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {['overall', 'multiple_choice', 'identification', 'enumeration', 'true_false'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              mode === m ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {m.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {leaders.map((leader, index) => (
          <div key={leader.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                index === 1 ? 'bg-gray-300 text-gray-700' :
                index === 2 ? 'bg-orange-400 text-orange-900' :
                'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className="font-medium text-gray-900">{leader.profiles?.username || 'Unknown'}</span>
            </div>
            <span className="font-bold text-indigo-600">
              {leader[mode === 'overall' ? 'overall_xp' : `${mode}_xp`].toLocaleString()} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardView({ user }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      <p className="text-gray-600">
        Dashboard features coming soon! This will include analytics, deck management, and settings.
      </p>
    </div>
  );
}

export default App;