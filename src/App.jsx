import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  BookOpen, Plus, Play, Users, Trophy, Settings, LogOut, 
  Clock, Brain, Shuffle, List, Eye, EyeOff, ChevronDown,
  Heart, Share2, Edit2, Trash2, Check, X, Home, Search,
  Target, Zap, Award, TrendingUp, Calendar, Save, ArrowLeft,
  Menu, Shield
} from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// AI Mock Functions
const generateDistractors = async (correctAnswer, context, count = 3) => {
  const distractors = [
    `Similar to ${correctAnswer}`,
    `Related term ${Math.floor(Math.random() * 100)}`,
    `Alternative ${Math.floor(Math.random() * 100)}`
  ];
  return distractors.slice(0, count);
};

const generateDeceptiveTerm = async (correctAnswer, context) => {
  const deceptive = ['Black', 'Red', 'Blue', 'Green', 'Yellow'];
  return deceptive[Math.floor(Math.random() * deceptive.length)];
};

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

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
      <Navigation 
        view={view} 
        setView={setView} 
        user={user} 
        profile={profile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {view === 'home' && <HomeView setView={setView} />}
        {view === 'decks' && <DecksView user={user} setView={setView} />}
        {view === 'study' && <StudyView user={user} />}
        {view === 'leaderboard' && <LeaderboardView />}
        {view === 'dashboard' && <DashboardView user={user} />}
        {view === 'admin' && profile?.username === 'admin' && <AdminView />}
      </main>
    </div>
  );
}

function AuthScreen({ authMode, setAuthMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // Sign up without email confirmation required
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { username },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) throw error;
        
        // Create profile immediately
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: username
          });
          
          setMessage('Account created! You can now sign in. (Email verification is optional)');
          setTimeout(() => setAuthMode('login'), 2000);
        }
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

        {!showVerification ? (
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
                  minLength="3"
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
                minLength="6"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We've sent a verification code to <strong>{pendingEmail}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter 6-digit code"
                maxLength="6"
              />
            </div>
            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
              Verify Email
            </button>
            <button
              onClick={() => setShowVerification(false)}
              className="w-full text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Back to Sign Up
            </button>
          </div>
        )}

        {!showVerification && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Navigation({ view, setView, user, profile, mobileMenuOpen, setMobileMenuOpen }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">StudyMaster</span>
            </div>
            
            <div className="hidden md:flex space-x-2">
              <NavButton icon={Home} label="Home" active={view === 'home'} onClick={() => setView('home')} />
              <NavButton icon={BookOpen} label="Decks" active={view === 'decks'} onClick={() => setView('decks')} />
              <NavButton icon={Play} label="Study" active={view === 'study'} onClick={() => setView('study')} />
              <NavButton icon={Trophy} label="Leaderboard" active={view === 'leaderboard'} onClick={() => setView('leaderboard')} />
              <NavButton icon={Settings} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
              {profile?.username === 'admin' && (
                <NavButton icon={Shield} label="Admin" active={view === 'admin'} onClick={() => setView('admin')} />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:block text-sm text-gray-700">@{profile?.username || 'User'}</span>
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-indigo-600 transition rounded-lg hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <MobileNavButton icon={Home} label="Home" active={view === 'home'} onClick={() => { setView('home'); setMobileMenuOpen(false); }} />
            <MobileNavButton icon={BookOpen} label="Decks" active={view === 'decks'} onClick={() => { setView('decks'); setMobileMenuOpen(false); }} />
            <MobileNavButton icon={Play} label="Study" active={view === 'study'} onClick={() => { setView('study'); setMobileMenuOpen(false); }} />
            <MobileNavButton icon={Trophy} label="Leaderboard" active={view === 'leaderboard'} onClick={() => { setView('leaderboard'); setMobileMenuOpen(false); }} />
            <MobileNavButton icon={Settings} label="Dashboard" active={view === 'dashboard'} onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }} />
            {profile?.username === 'admin' && (
              <MobileNavButton icon={Shield} label="Admin" active={view === 'admin'} onClick={() => { setView('admin'); setMobileMenuOpen(false); }} />
            )}
            <MobileNavButton icon={LogOut} label="Sign Out" onClick={handleSignOut} />
          </div>
        )}
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

function MobileNavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 transition ${
        active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
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
    
    const { data: xpData } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setStats(xpData);

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
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back!</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard icon={Zap} label="Overall XP" value={stats?.overall_xp || 0} color="indigo" />
          <StatCard icon={Target} label="Multiple Choice" value={stats?.multiple_choice_xp || 0} color="blue" />
          <StatCard icon={Award} label="Identification" value={stats?.identification_xp || 0} color="green" />
          <StatCard icon={List} label="Enumeration" value={stats?.enumeration_xp || 0} color="purple" />
          <StatCard icon={Check} label="True/False" value={stats?.true_false_xp || 0} color="pink" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <ActionButton icon={Plus} label="Create New Deck" onClick={() => setView('decks')} color="indigo" />
            <ActionButton icon={Play} label="Start Study Session" onClick={() => setView('study')} color="green" />
            <ActionButton icon={Users} label="Challenge a Friend" onClick={() => setView('study')} color="purple" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Decks</h3>
          <div className="space-y-2">
            {recentDecks.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">No decks yet. Create your first deck!</p>
            ) : (
              recentDecks.map(deck => (
                <div key={deck.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{deck.name}</span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {deck.study_schedule?.length > 0 && deck.study_schedule[0].last_studied
                        ? new Date(deck.study_schedule[0].last_studied).toLocaleDateString()
                        : 'Never'}
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
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
      <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${colors[color]} mb-2`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="text-xl sm:text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-xs sm:text-sm text-gray-600">{label}</div>
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
      <span className="font-medium text-sm sm:text-base">{label}</span>
    </button>
  );
}

function DecksView({ user, setView }) {
  const [decks, setDecks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [editingDeck, setEditingDeck] = useState(null);

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

  const handleDeckCreated = (deckId) => {
    setShowCreateModal(false);
    setSelectedDeck(deckId);
    loadDecks();
  };

  if (selectedDeck) {
    return (
      <CardCreationView
        deckId={selectedDeck}
        onBack={() => {
          setSelectedDeck(null);
          loadDecks();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">My Decks</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Create Deck</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {decks.map(deck => (
          <DeckCard 
            key={deck.id} 
            deck={deck} 
            onSelect={() => setSelectedDeck(deck.id)}
            onEdit={() => setEditingDeck(deck)}
            onRefresh={loadDecks}
          />
        ))}
      </div>

      {showCreateModal && (
        <CreateDeckModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleDeckCreated}
          userId={user.id}
        />
      )}

      {editingDeck && (
        <EditDeckModal
          deck={editingDeck}
          onClose={() => setEditingDeck(null)}
          onSaved={() => {
            setEditingDeck(null);
            loadDecks();
          }}
        />
      )}
    </div>
  );
}

function DeckCard({ deck, onSelect, onEdit, onRefresh }) {
  const [cards, setCards] = useState([]);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${deck.name}"? This will delete all cards in this deck.`)) return;
    
    setDeleting(true);
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deck.id);

    if (!error) {
      onRefresh();
    } else {
      alert('Error deleting deck');
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition group">
      <div onClick={onSelect} className="p-4 sm:p-6 cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex-1">{deck.name}</h3>
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

      <div className="border-t border-gray-100 px-4 sm:px-6 py-3 flex justify-end space-x-2">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
          title="Edit deck"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
          title="Delete deck"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function CreateDeckModal({ onClose, onCreated, userId }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    const { data, error } = await supabase
      .from('decks')
      .insert([{ user_id: userId, name, description, is_public: isPublic }])
      .select()
      .single();

    if (!error && data) {
      onCreated(data.id);
    } else {
      alert('Error creating deck');
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Create New Deck</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2 w-4 h-4 text-indigo-600"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">Make this deck public</label>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create & Add Cards'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditDeckModal({ deck, onClose, onSaved }) {
  const [name, setName] = useState(deck.name);
  const [description, setDescription] = useState(deck.description || '');
  const [isPublic, setIsPublic] = useState(deck.is_public);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase
      .from('decks')
      .update({ name, description, is_public: isPublic })
      .eq('id', deck.id);

    if (!error) {
      onSaved();
    } else {
      alert('Error updating deck');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Edit Deck</h3>
        <form onSubmit={handleSave} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
              id="editPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2 w-4 h-4"
            />
            <label htmlFor="editPublic" className="text-sm text-gray-700">Make this deck public</label>
          </div>

          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CardCreationView({ deckId, onBack }) {
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [groups, setGroups] = useState([]);
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState({ start: 0, end: 0, text: '' });
  const [groupId, setGroupId] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    loadDeckData();
  }, [deckId]);

  const loadDeckData = async () => {
    const { data: deckData } = await supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .single();
    setDeck(deckData);

    const { data: cardsData } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: true });
    setCards(cardsData || []);

    const { data: groupsData } = await supabase
      .from('card_groups')
      .select('*')
      .eq('deck_id', deckId);
    setGroups(groupsData || []);
  };

  const handleTextSelect = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text && content.includes(text)) {
      const start = content.indexOf(text);
      setSelectedText({ start, end: start + text.length, text });
    }
  };

  const handleAddCard = async () => {
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

    if (!error) {
      setContent('');
      setSelectedText({ start: 0, end: 0, text: '' });
      loadDeckData();
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Delete this card?')) return;
    await supabase.from('cards').delete().eq('id', cardId);
    loadDeckData();
  };

  const getGroupColor = (gId) => {
    const group = groups.find(g => g.id === gId);
    return group?.color || '#E5E7EB';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Decks</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{deck?.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Create Card</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Content (Highlight the term you want to study)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onMouseUp={handleTextSelect}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="6"
                placeholder="Example: White is a color that represents peace"
              />
              {selectedText.text && (
                <p className="mt-2 text-sm text-indigo-600">
                  Selected term: <strong>{selectedText.text}</strong>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group (Optional)</label>
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
                onClick={() => setShowCreateGroup(true)}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Create New Group
              </button>
            </div>

            <button
              onClick={handleAddCard}
              disabled={!content || !selectedText.text}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              <span>Add Card</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Cards ({cards.length})
          </h3>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {cards.length === 0 ? (
              <p className="text-gray-500 text-center py-12 text-sm">
                No cards yet. Create your first card!
              </p>
            ) : (
              cards.map(card => (
                <div
                  key={card.id}
                  className="p-4 rounded-lg border-2 transition hover:shadow-md"
                  style={{ borderColor: card.group_id ? getGroupColor(card.group_id) : '#E5E7EB' }}
                >
                  <p className="text-gray-900 text-sm mb-3">
                    {card.content.substring(0, card.term_start)}
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-1 rounded">{card.term}</span>
                    {card.content.substring(card.term_end)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Mastery: {card.mastery_level || 0}%</span>
                      {card.group_id && (
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {groups.find(g => g.id === card.group_id)?.name}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingCard(card)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          deckId={deckId}
          onClose={() => setShowCreateGroup(false)}
          onCreated={() => {
            setShowCreateGroup(false);
            loadDeckData();
          }}
        />
      )}

      {editingCard && (
        <EditCardModal
          card={editingCard}
          groups={groups}
          onClose={() => setEditingCard(null)}
          onSaved={() => {
            setEditingCard(null);
            loadDeckData();
          }}
        />
      )}
    </div>
  );
}

function CreateGroupModal({ deckId, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [orderMatters, setOrderMatters] = useState(false);
  const [color, setColor] = useState('#6B7280');

  const colors = [
    { name: 'Gray', value: '#6B7280' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Pink', value: '#EC4899' },
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('card_groups')
      .insert([{ deck_id: deckId, name, order_matters: orderMatters, color }]);

    if (!error) onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Group</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Planets, Countries, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-full h-10 rounded-lg border-2 transition ${
                    color === c.value ? 'ring-2 ring-indigo-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="orderMatters"
              checked={orderMatters}
              onChange={(e) => setOrderMatters(e.target.checked)}
              className="mr-2 w-4 h-4"
            />
            <label htmlFor="orderMatters" className="text-sm text-gray-700">
              Order matters (for enumeration mode)
            </label>
          </div>

          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditCardModal({ card, groups, onClose, onSaved }) {
  const [content, setContent] = useState(card.content);
  const [selectedText, setSelectedText] = useState({ 
    start: card.term_start, 
    end: card.term_end, 
    text: card.term 
  });
  const [groupId, setGroupId] = useState(card.group_id);

  const handleTextSelect = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text && content.includes(text)) {
      const start = content.indexOf(text);
      setSelectedText({ start, end: start + text.length, text });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('cards')
      .update({
        content,
        term: selectedText.text,
        term_start: selectedText.start,
        term_end: selectedText.end,
        group_id: groupId
      })
      .eq('id', card.id);

    if (!error) onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Edit Card</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onMouseUp={handleTextSelect}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows="6"
              required
            />
            {selectedText.text && (
              <p className="mt-2 text-sm text-indigo-600">
                Selected term: <strong>{selectedText.text}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
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
          </div>

          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Save Changes
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
        Study session modes coming soon!
      </p>
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
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Leaderboard</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {['overall', 'multiple_choice', 'identification', 'enumeration', 'true_false'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
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
              <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
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
      <p className="text-gray-600">Analytics and settings coming soon!</p>
    </div>
  );
}

function AdminView() {
  const [users, setUsers] = useState([]);
  const [publicDecks, setPublicDecks] = useState([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*, user_xp(*)')
      .order('created_at', { ascending: false })
      .limit(20);
    setUsers(usersData || []);

    const { data: decksData } = await supabase
      .from('decks')
      .select('*, profiles(username)')
      .eq('is_public', true)
      .order('likes_count', { ascending: false })
      .limit(10);
    setPublicDecks(decksData || []);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-indigo-900">{users.length}</div>
            <div className="text-sm text-indigo-700">Total Users</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-900">{publicDecks.length}</div>
            <div className="text-sm text-green-700">Public Decks</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-900">
              {users.reduce((sum, u) => sum + (u.user_xp?.[0]?.overall_xp || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-purple-700">Total XP</div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Users</h3>
        <div className="space-y-2">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{user.username}</div>
                <div className="text-sm text-gray-500">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-sm text-indigo-600 font-medium">
                {user.user_xp?.[0]?.overall_xp || 0} XP
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;