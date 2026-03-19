import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  BookOpen, 
  GraduationCap, 
  Languages, 
  Menu, 
  X, 
  Layers, 
  Presentation as PresentationIcon,
  FileText,
  Settings,
  LogIn,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebase';
import { ChatTutor } from './components/ChatTutor';
import { VocabBuilder } from './components/VocabBuilder';
import { VocabQuiz } from './components/VocabQuiz';
import { GrammarPractice } from './components/GrammarPractice';
import { PresentationGuide } from './components/PresentationGuide';
import { Syllabus } from './components/Syllabus';
import { TeacherPortal } from './components/TeacherPortal';
import { Level, Unit } from './types';

type MainTab = 'course' | 'chat' | 'syllabus' | 'teacher';
type UnitTab = 'vocab' | 'quiz' | 'grammar' | 'presentation';

const AUTHORIZED_TEACHERS = [
  "reuben.brown@jsh.mgu.ac.jp"
  // Add more teacher emails here
];

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('course');
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [activeUnitTab, setActiveUnitTab] = useState<UnitTab>('vocab');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mainTabs = [
    { id: 'course', label: 'Course Content', icon: Layers },
    { id: 'chat', label: 'AI Tutor', icon: MessageSquare },
    { id: 'syllabus', label: 'Syllabus', icon: FileText },
  ];

  const unitTabs = [
    { id: 'vocab', label: 'Vocabulary', icon: BookOpen },
    { id: 'quiz', label: 'Quiz', icon: CheckCircle2 },
    { id: 'grammar', label: 'Grammar', icon: GraduationCap },
    { id: 'presentation', label: 'Presentation', icon: PresentationIcon },
  ];

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch levels
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'levels'), (snapshot) => {
      const levelsData = snapshot.docs.map(doc => doc.data() as Level);
      const sorted = levelsData.sort((a, b) => a.id - b.id);
      setLevels(sorted);
      if (sorted.length > 0 && !selectedLevel) {
        setSelectedLevel(sorted[0]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch units for selected level
  useEffect(() => {
    if (!selectedLevel) return;
    const q = query(collection(db, 'units'), where('levelId', '==', selectedLevel.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unitsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      const sorted = unitsData.sort((a: any, b: any) => a.unitNumber - b.unitNumber);
      setUnits(sorted);
      if (sorted.length > 0) {
        // Keep selected unit if it exists in the new list, otherwise pick first
        const current = sorted.find((u: any) => u.unitNumber === selectedUnit?.unitNumber);
        setSelectedUnit(current || sorted[0]);
      } else {
        setSelectedUnit(null);
      }
    });
    return () => unsubscribe();
  }, [selectedLevel]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  const isAdmin = user?.email && AUTHORIZED_TEACHERS.includes(user.email);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-brand-olive rounded-2xl" />
          <p className="font-serif text-xl text-brand-olive">Loading E-Junior...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-brand-cream/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-olive rounded-xl flex items-center justify-center text-white">
                <Languages size={24} />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight">E-Junior</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex gap-6 items-center">
              {mainTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id as MainTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeMainTab === tab.id
                      ? 'bg-brand-olive text-white shadow-sm'
                      : 'text-brand-ink/60 hover:text-brand-ink hover:bg-black/5'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
              
              {isAdmin && (
                <button
                  onClick={() => setActiveMainTab('teacher')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeMainTab === 'teacher'
                      ? 'bg-brand-olive text-white shadow-sm'
                      : 'text-brand-olive hover:bg-brand-olive/5'
                  }`}
                >
                  <Settings size={18} />
                  Teacher Portal
                </button>
              )}

              <div className="h-6 w-px bg-black/10 mx-2" />

              {user ? (
                <div className="flex items-center gap-3">
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-black/10" />
                  <button onClick={handleLogout} className="text-brand-ink/60 hover:text-brand-ink p-2">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-full text-sm font-medium hover:bg-black/5 transition-all"
                >
                  <LogIn size={18} />
                  Login
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-brand-ink"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-black/5 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                {mainTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveMainTab(tab.id as MainTab);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full p-4 rounded-2xl text-left ${
                      activeMainTab === tab.id
                        ? 'bg-brand-olive text-white'
                        : 'text-brand-ink/60'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setActiveMainTab('teacher');
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full p-4 rounded-2xl text-left ${
                      activeMainTab === 'teacher'
                        ? 'bg-brand-olive text-white'
                        : 'text-brand-olive'
                    }`}
                  >
                    <Settings size={20} />
                    <span className="font-medium">Teacher Portal</span>
                  </button>
                )}
                <div className="pt-4 border-t border-black/5">
                  {user ? (
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full p-4 text-brand-ink/60">
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  ) : (
                    <button onClick={handleLogin} className="flex items-center gap-3 w-full p-4 text-brand-ink/60">
                      <LogIn size={20} />
                      <span>Login</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {activeMainTab === 'course' ? (
            <motion.div
              key="course"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* Sidebar: Level & Unit Selection */}
              <div className="lg:col-span-4 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-serif">Level Selection</h2>
                  <div className="grid grid-cols-1 gap-2">
                    {levels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setSelectedLevel(level)}
                        className={`p-4 rounded-2xl text-left border transition-all ${
                          selectedLevel?.id === level.id
                            ? 'bg-brand-olive text-white border-brand-olive shadow-md'
                            : 'bg-white border-black/5 text-brand-ink/70 hover:border-brand-olive/30'
                        }`}
                      >
                        <span className="font-serif text-lg">{level.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-serif">Units</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {units.map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => setSelectedUnit(unit)}
                        className={`p-3 rounded-xl text-center border transition-all ${
                          selectedUnit?.id === unit.id
                            ? 'bg-brand-olive/10 border-brand-olive text-brand-olive font-bold'
                            : 'bg-white border-black/5 text-brand-ink/60 hover:bg-brand-cream'
                        }`}
                      >
                        Unit {unit.unitNumber}
                      </button>
                    ))}
                  </div>
                  {units.length === 0 && (
                    <p className="text-sm text-brand-ink/40 italic">No units found for this level.</p>
                  )}
                </div>
              </div>

              {/* Unit Content Area */}
              <div className="lg:col-span-8 space-y-8">
                {selectedUnit ? (
                  <>
                    <div className="flex items-center justify-between border-b border-black/5 pb-4">
                      <h1 className="text-4xl font-serif">{selectedLevel?.name} - Unit {selectedUnit.unitNumber}</h1>
                    </div>

                    {/* Unit Tabs */}
                    <div className="flex gap-4 p-1 bg-brand-cream rounded-2xl w-fit">
                      {unitTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveUnitTab(tab.id as UnitTab)}
                          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                            activeUnitTab === tab.id
                              ? 'bg-white text-brand-olive shadow-sm'
                              : 'text-brand-ink/60 hover:text-brand-ink'
                          }`}
                        >
                          <tab.icon size={16} />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="mt-8">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeUnitTab + selectedUnit.id + selectedLevel?.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          {activeUnitTab === 'vocab' && <VocabBuilder vocabulary={selectedUnit.vocabulary} />}
                          {activeUnitTab === 'quiz' && <VocabQuiz vocabulary={selectedUnit.vocabulary} />}
                          {activeUnitTab === 'grammar' && <GrammarPractice grammar={selectedUnit.grammar} />}
                          {activeUnitTab === 'presentation' && <PresentationGuide presentations={selectedUnit.presentations} rubric={selectedUnit.rubric} />}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-black/5 rounded-3xl">
                    <p className="text-brand-ink/40 font-serif text-xl italic">Select a level and unit to begin learning.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeMainTab === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <ChatTutor />
            </motion.div>
          ) : activeMainTab === 'syllabus' ? (
            <motion.div
              key="syllabus"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Syllabus />
            </motion.div>
          ) : (
            <motion.div
              key="teacher"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TeacherPortal />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Languages size={20} className="text-brand-olive" />
            <span className="font-serif font-bold text-xl">E-Junior</span>
          </div>
          <p className="text-sm text-brand-ink/40">
            © 2026 E-Junior Special Course. Dedicated to student excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
