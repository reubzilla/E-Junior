import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, setDoc, doc, addDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Level, Unit, Word, GrammarPoint, Presentation, RubricCriterion, SyllabusData, SyllabusSection } from '../types';
import { Plus, Save, Trash2, Edit2, ChevronRight, ChevronDown, FileUp, X, Layout, FileText, BookOpen, ShieldAlert } from 'lucide-react';
import { E_JUNIOR_LEVELS, DEFAULT_SYLLABUS } from '../constants';
import { motion } from 'motion/react';

const AUTHORIZED_TEACHERS = [
  "reuben.brown@jsh.mgu.ac.jp"
  // Add more teacher emails here
];

export const TeacherPortal: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [portalTab, setPortalTab] = useState<'units' | 'syllabus'>('units');
  const [syllabus, setSyllabus] = useState<SyllabusData | null>(null);

  const userEmail = auth.currentUser?.email;
  const isAdmin = userEmail && AUTHORIZED_TEACHERS.includes(userEmail);

  // Fetch levels and units from Firestore
  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribeLevels = onSnapshot(collection(db, 'levels'), (snapshot) => {
      const levelsData = snapshot.docs.map(doc => doc.data() as Level);
      setLevels(levelsData.sort((a, b) => a.id - b.id));
      if (levelsData.length > 0 && !selectedLevel) {
        setSelectedLevel(levelsData[0]);
      }
    });

    const unsubscribeSyllabus = onSnapshot(doc(db, 'syllabus', 'main-syllabus'), (doc) => {
      if (doc.exists()) {
        setSyllabus(doc.data() as SyllabusData);
      } else {
        setSyllabus(DEFAULT_SYLLABUS);
      }
    });

    return () => {
      unsubscribeLevels();
      unsubscribeSyllabus();
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedLevel || !isAdmin) return;
    const q = query(collection(db, 'units'), where('levelId', '==', selectedLevel.id));
    const unsubscribeUnits = onSnapshot(q, (snapshot) => {
      const unitsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      setUnits(unitsData.sort((a: any, b: any) => a.unitNumber - b.unitNumber));
    });

    return () => unsubscribeUnits();
  }, [selectedLevel, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-black/5 shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-serif text-brand-ink mb-2">Access Denied</h2>
        <p className="text-brand-ink/60 max-w-md text-center">
          You do not have permission to access the Teacher Portal. Please contact the administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  const handleSaveLevel = async () => {
    if (!selectedLevel) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'levels', selectedLevel.id.toString()), selectedLevel);
      alert('Level details saved successfully!');
      setIsEditingLevel(false);
    } catch (error) {
      console.error('Error saving level:', error);
      alert('Error saving level.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUnit = async () => {
    if (!selectedUnit) return;
    setIsSaving(true);
    try {
      const unitRef = doc(db, 'units', (selectedUnit as any).id);
      await setDoc(unitRef, selectedUnit);
      alert('Unit saved successfully!');
    } catch (error) {
      console.error('Error saving unit:', error);
      alert('Error saving unit. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const addVocabItem = () => {
    if (!selectedUnit) return;
    const newVocab = [...(selectedUnit.vocabulary || []), { term: '', definition: '', example: '' }];
    setSelectedUnit({ ...selectedUnit, vocabulary: newVocab });
  };

  const updateVocabItem = (index: number, field: keyof Word, value: string) => {
    if (!selectedUnit) return;
    const newVocab = [...selectedUnit.vocabulary];
    newVocab[index] = { ...newVocab[index], [field]: value };
    setSelectedUnit({ ...selectedUnit, vocabulary: newVocab });
  };

  const removeVocabItem = (index: number) => {
    if (!selectedUnit) return;
    const newVocab = selectedUnit.vocabulary.filter((_, i) => i !== index);
    setSelectedUnit({ ...selectedUnit, vocabulary: newVocab });
  };

  const addGrammarPoint = () => {
    if (!selectedUnit) return;
    const newGrammar = [...(selectedUnit.grammar || []), { title: '', description: '', examples: [] }];
    setSelectedUnit({ ...selectedUnit, grammar: newGrammar });
  };

  const removeGrammarPoint = (index: number) => {
    if (!selectedUnit) return;
    const newGrammar = selectedUnit.grammar.filter((_, i) => i !== index);
    setSelectedUnit({ ...selectedUnit, grammar: newGrammar });
  };

  const handleBulkImport = () => {
    if (!selectedUnit || !bulkText.trim()) return;

    // Split by lines, then by tab or semicolon
    const lines = bulkText.trim().split('\n');
    const newWords: Word[] = [];

    lines.forEach(line => {
      const parts = line.split(/\t|;/);
      if (parts.length >= 2) {
        newWords.push({
          term: parts[0].trim(),
          definition: parts[1].trim(),
          example: parts[2]?.trim() || ''
        });
      }
    });

    if (newWords.length > 0) {
      setSelectedUnit({
        ...selectedUnit,
        vocabulary: [...selectedUnit.vocabulary, ...newWords]
      });
      setBulkText('');
      setShowBulkImport(false);
    }
  };

  const updateGrammarPoint = (index: number, field: keyof GrammarPoint, value: any) => {
    if (!selectedUnit) return;
    const newGrammar = [...selectedUnit.grammar];
    newGrammar[index] = { ...newGrammar[index], [field]: value };
    setSelectedUnit({ ...selectedUnit, grammar: newGrammar });
  };

  const addPresentation = () => {
    if (!selectedUnit) return;
    const newPresentations = [...(selectedUnit.presentations || []), { id: crypto.randomUUID(), title: '', task: '', scaffolding: [] }];
    setSelectedUnit({ ...selectedUnit, presentations: newPresentations });
  };

  const removePresentation = (index: number) => {
    if (!selectedUnit) return;
    const newPresentations = selectedUnit.presentations.filter((_, i) => i !== index);
    setSelectedUnit({ ...selectedUnit, presentations: newPresentations });
  };

  const updatePresentation = (index: number, field: keyof Presentation, value: any) => {
    if (!selectedUnit) return;
    const newPresentations = [...selectedUnit.presentations];
    newPresentations[index] = { ...newPresentations[index], [field]: value };
    setSelectedUnit({ ...selectedUnit, presentations: newPresentations });
  };

  const addRubricCriterion = () => {
    if (!selectedUnit) return;
    const newRubric = [...(selectedUnit.rubric || []), { name: '', description: '', maxPoints: 5 }];
    setSelectedUnit({ ...selectedUnit, rubric: newRubric });
  };

  const removeRubricCriterion = (index: number) => {
    if (!selectedUnit) return;
    const newRubric = selectedUnit.rubric.filter((_, i) => i !== index);
    setSelectedUnit({ ...selectedUnit, rubric: newRubric });
  };

  const updateRubricCriterion = (index: number, field: keyof RubricCriterion, value: any) => {
    if (!selectedUnit) return;
    const newRubric = [...selectedUnit.rubric];
    newRubric[index] = { ...newRubric[index], [field]: value };
    setSelectedUnit({ ...selectedUnit, rubric: newRubric });
  };

  const handleSaveSyllabus = async () => {
    if (!syllabus) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'syllabus', 'main-syllabus'), syllabus);
      alert('Syllabus saved successfully!');
    } catch (error) {
      console.error('Error saving syllabus:', error);
      alert('Error saving syllabus.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSyllabus = (field: keyof SyllabusData, value: any) => {
    if (!syllabus) return;
    setSyllabus({ ...syllabus, [field]: value });
  };

  const updateSyllabusSection = (index: number, field: keyof SyllabusSection, value: any) => {
    if (!syllabus) return;
    const newSections = [...syllabus.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSyllabus({ ...syllabus, sections: newSections });
  };

  // Bootstrap initial data if empty
  const bootstrapData = async () => {
    const levelsSnap = await getDocs(collection(db, 'levels'));
    if (levelsSnap.empty) {
      for (const level of E_JUNIOR_LEVELS) {
        await setDoc(doc(db, 'levels', level.id.toString()), { 
          id: level.id, 
          name: level.name,
          imageUrl: level.imageUrl,
          imagePosition: 'center'
        });
        for (const unit of level.units) {
          await addDoc(collection(db, 'units'), {
            levelId: level.id,
            unitNumber: unit.id,
            title: unit.title,
            imageUrl: '',
            imagePosition: 'center',
            vocabulary: unit.vocabulary,
            grammar: unit.grammar,
            presentations: unit.presentations,
            rubric: unit.rubric
          });
        }
      }
      alert('Levels and Units bootstrapped!');
    }
    
    // Bootstrap syllabus separately if missing
    const syllabusSnap = await getDocs(collection(db, 'syllabus'));
    if (syllabusSnap.empty) {
      await setDoc(doc(db, 'syllabus', 'main-syllabus'), DEFAULT_SYLLABUS);
      alert('Syllabus bootstrapped!');
    } else {
      alert('Syllabus already exists.');
    }
  };

  return (
    <div className="space-y-8 bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif">Teacher Portal</h2>
        <div className="flex gap-4 items-center">
          <div className="flex bg-brand-cream p-1 rounded-xl">
            <button
              onClick={() => setPortalTab('units')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${portalTab === 'units' ? 'bg-white text-brand-olive shadow-sm' : 'text-brand-ink/40'}`}
            >
              <BookOpen size={16} /> Units
            </button>
            <button
              onClick={() => setPortalTab('syllabus')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${portalTab === 'syllabus' ? 'bg-white text-brand-olive shadow-sm' : 'text-brand-ink/40'}`}
            >
              <FileText size={16} /> Syllabus
            </button>
          </div>
          <button 
            onClick={bootstrapData}
            className="text-xs text-brand-olive underline"
          >
            Reset/Bootstrap Data
          </button>
        </div>
      </div>

      {portalTab === 'units' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-brand-ink/60 uppercase tracking-wider">Select Level</label>
                <button 
                  onClick={() => setIsEditingLevel(!isEditingLevel)}
                  className="text-xs text-brand-olive font-bold flex items-center gap-1 hover:underline"
                >
                  <Edit2 size={12} /> {isEditingLevel ? 'Cancel' : 'Edit Level Details'}
                </button>
              </div>
              
              {isEditingLevel && selectedLevel ? (
                <div className="p-4 bg-brand-cream/50 rounded-2xl border border-brand-olive/20 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold opacity-30 uppercase">Level Name</p>
                      <input
                        value={selectedLevel.name}
                        onChange={(e) => setSelectedLevel({ ...selectedLevel, name: e.target.value })}
                        className="w-full p-2 rounded-lg border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold opacity-30 uppercase">Cover Image URL</p>
                      <input
                        value={selectedLevel.imageUrl || ''}
                        onChange={(e) => setSelectedLevel({ ...selectedLevel, imageUrl: e.target.value })}
                        placeholder="https://example.com/cover.jpg"
                        className="w-full p-2 rounded-lg border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold opacity-30 uppercase">Image Crop/Position</p>
                      <select
                        value={selectedLevel.imagePosition || 'center'}
                        onChange={(e) => setSelectedLevel({ ...selectedLevel, imagePosition: e.target.value })}
                        className="w-full p-2 rounded-lg border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none"
                      >
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveLevel}
                    disabled={isSaving}
                    className="w-full py-2 bg-brand-olive text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                  >
                    {isSaving ? 'Saving...' : 'Save Level Details'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {levels.map(level => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-4 py-2 rounded-xl border transition-all ${selectedLevel?.id === level.id ? 'bg-brand-olive text-white' : 'bg-brand-cream text-brand-ink/60'}`}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-brand-ink/60 uppercase tracking-wider">Select Unit</label>
              <div className="grid grid-cols-4 gap-2">
                {units.map(unit => (
                  <button
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit)}
                    className={`p-2 rounded-xl border text-center text-sm transition-all ${selectedUnit?.id === unit.id ? 'bg-brand-olive text-white' : 'bg-brand-cream text-brand-ink/60'}`}
                  >
                    U{unit.unitNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedUnit && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12 pt-8 border-t border-black/5"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif">Editing: {selectedLevel?.name} - Unit {selectedUnit.unitNumber}</h3>
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1">
                    <input
                      placeholder="Unit Image URL"
                      value={selectedUnit.imageUrl || ''}
                      onChange={(e) => setSelectedUnit({ ...selectedUnit, imageUrl: e.target.value })}
                      className="text-xs p-1 border rounded"
                    />
                    <select
                      value={selectedUnit.imagePosition || 'center'}
                      onChange={(e) => setSelectedUnit({ ...selectedUnit, imagePosition: e.target.value })}
                      className="text-[10px] p-1 border rounded"
                    >
                      <option value="center">Center Crop</option>
                      <option value="top">Top Crop</option>
                      <option value="bottom">Bottom Crop</option>
                    </select>
                  </div>
                  <button
                    onClick={handleSaveUnit}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-brand-olive text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
                  >
                    {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                  </button>
                </div>
              </div>

              {/* Vocabulary Editor */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-serif text-brand-olive">Vocabulary</h4>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowBulkImport(true)} 
                      className="flex items-center gap-1 text-sm text-brand-olive font-bold hover:underline"
                    >
                      <FileUp size={16} /> Bulk Import
                    </button>
                    <button 
                      onClick={addVocabItem} 
                      className="flex items-center gap-1 text-sm text-brand-olive font-bold hover:underline"
                    >
                      <Plus size={16} /> Add Word
                    </button>
                  </div>
                </div>

                {showBulkImport && (
                  <div className="p-6 bg-brand-cream/50 rounded-3xl border-2 border-dashed border-brand-olive/30 space-y-4">
                    <div className="flex justify-between items-center">
                      <h5 className="font-serif font-bold">Bulk Import Vocabulary</h5>
                      <button onClick={() => setShowBulkImport(false)} className="text-brand-ink/40 hover:text-brand-ink">
                        <X size={20} />
                      </button>
                    </div>
                    <p className="text-xs text-brand-ink/60">
                      Paste your list below. Format: <strong>Word [TAB or ;] Definition [TAB or ;] Example</strong> (one per line)
                    </p>
                    <textarea
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder="apple; a red fruit; I like apples."
                      className="w-full h-48 p-4 rounded-2xl border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none font-mono text-sm"
                    />
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setShowBulkImport(false)}
                        className="px-4 py-2 text-sm font-bold text-brand-ink/60 hover:text-brand-ink"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleBulkImport}
                        className="px-6 py-2 bg-brand-olive text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                      >
                        Import {bulkText.trim().split('\n').filter(l => l.includes('\t') || l.includes(';')).length} Words
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid gap-4">
                  {selectedUnit.vocabulary.map((word, i) => (
                    <div key={i} className="p-4 bg-brand-cream/30 rounded-2xl border border-black/5 space-y-3 relative group">
                      <button 
                        onClick={() => removeVocabItem(i)}
                        className="absolute top-4 right-4 text-red-500 opacity-20 hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg"
                        title="Delete word"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold opacity-30 uppercase">Word</p>
                          <input
                            placeholder="Word/Term"
                            value={word.term}
                            onChange={(e) => updateVocabItem(i, 'term', e.target.value)}
                            className="w-full p-2 rounded-lg border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <p className="text-[10px] font-bold opacity-30 uppercase">Definition (Markdown supported)</p>
                          <textarea
                            placeholder="Definition"
                            value={word.definition}
                            onChange={(e) => updateVocabItem(i, 'definition', e.target.value)}
                            className="w-full p-2 rounded-lg border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none h-12"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold opacity-30 uppercase">Example Sentence (Markdown supported)</p>
                        <textarea
                          placeholder="Example Sentence"
                          value={word.example}
                          onChange={(e) => updateVocabItem(i, 'example', e.target.value)}
                          className="w-full p-2 rounded-lg border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none h-12"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grammar Editor */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-serif text-brand-olive">Grammar Points</h4>
                  <button onClick={addGrammarPoint} className="flex items-center gap-1 text-sm text-brand-olive font-bold hover:underline">
                    <Plus size={16} /> Add Grammar Point
                  </button>
                </div>
                <div className="grid gap-6">
                  {selectedUnit.grammar.map((point, i) => (
                    <div key={i} className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm space-y-4 relative group">
                      <button 
                        onClick={() => removeGrammarPoint(i)}
                        className="absolute top-4 right-4 text-red-500 opacity-20 hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg"
                        title="Delete grammar point"
                      >
                        <Trash2 size={18} />
                      </button>
                      <h5 className="font-serif text-lg">Point {i + 1}</h5>
                      <input
                        placeholder="Grammar Title"
                        value={point.title}
                        onChange={(e) => updateGrammarPoint(i, 'title', e.target.value)}
                        className="w-full p-2 rounded-lg border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none font-bold"
                      />
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold opacity-30 uppercase">Description (Markdown supported)</p>
                        <textarea
                          placeholder="Description"
                          value={point.description}
                          onChange={(e) => updateGrammarPoint(i, 'description', e.target.value)}
                          className="w-full p-2 rounded-lg border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none h-20"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold opacity-50 uppercase">Examples (one per line)</p>
                        <textarea
                          placeholder="Examples"
                          value={point.examples.join('\n')}
                          onChange={(e) => updateGrammarPoint(i, 'examples', e.target.value.split('\n'))}
                          className="w-full p-2 rounded-lg border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none h-24 font-serif italic"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Presentation Editor */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-serif text-brand-olive">Presentation Tasks (Projects A, B, C)</h4>
                  <button onClick={addPresentation} className="flex items-center gap-1 text-sm text-brand-olive font-bold hover:underline">
                    <Plus size={16} /> Add Project
                  </button>
                </div>
                <div className="grid gap-6">
                  {selectedUnit.presentations?.map((pres, i) => (
                    <div key={pres.id || i} className="p-6 bg-brand-olive text-white rounded-3xl shadow-lg space-y-4 relative group">
                      <button 
                        onClick={() => removePresentation(i)}
                        className="absolute top-4 right-4 text-white opacity-40 hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-lg"
                        title="Delete project"
                      >
                        <Trash2 size={18} />
                      </button>
                      <h5 className="font-serif text-lg">Project {String.fromCharCode(65 + i)}</h5>
                      <input
                        placeholder="Presentation Title"
                        value={pres.title}
                        onChange={(e) => updatePresentation(i, 'title', e.target.value)}
                        className="w-full p-2 bg-white/10 rounded-lg border border-white/20 focus:ring-1 focus:ring-white outline-none font-serif text-xl"
                      />
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold opacity-50 uppercase">Task Description (Markdown supported)</p>
                        <textarea
                          placeholder="Task Description"
                          value={pres.task}
                          onChange={(e) => updatePresentation(i, 'task', e.target.value)}
                          className="w-full p-2 bg-white/10 rounded-lg border border-white/20 focus:ring-1 focus:ring-white outline-none h-24"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold opacity-70 uppercase">Scaffolding Steps (one per line, Markdown supported)</p>
                        <textarea
                          placeholder="Scaffolding Steps"
                          value={pres.scaffolding.join('\n')}
                          onChange={(e) => updatePresentation(i, 'scaffolding', e.target.value.split('\n'))}
                          className="w-full p-2 bg-white/10 rounded-lg border border-white/20 focus:ring-1 focus:ring-white outline-none h-32"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rubric Editor */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-serif text-brand-olive">Assessment Rubric</h4>
                  <button onClick={addRubricCriterion} className="flex items-center gap-1 text-sm text-brand-olive font-bold hover:underline">
                    <Plus size={16} /> Add Criterion
                  </button>
                </div>
                <div className="grid gap-4">
                  {selectedUnit.rubric?.map((criterion, i) => (
                    <div key={i} className="p-4 bg-white rounded-2xl border border-black/5 shadow-sm space-y-3 relative group">
                      <button 
                        onClick={() => removeRubricCriterion(i)}
                        className="absolute top-4 right-4 text-red-500 opacity-20 hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg"
                        title="Delete criterion"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold opacity-30 uppercase">Criterion Name</p>
                          <input
                            placeholder="e.g. Pronunciation"
                            value={criterion.name}
                            onChange={(e) => updateRubricCriterion(i, 'name', e.target.value)}
                            className="w-full p-2 rounded-lg border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none font-bold"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <p className="text-[10px] font-bold opacity-30 uppercase">Description</p>
                          <input
                            placeholder="What are we looking for?"
                            value={criterion.description}
                            onChange={(e) => updateRubricCriterion(i, 'description', e.target.value)}
                            className="w-full p-2 rounded-lg border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold opacity-30 uppercase">Max Points</p>
                          <input
                            type="number"
                            value={criterion.maxPoints}
                            onChange={(e) => updateRubricCriterion(i, 'maxPoints', parseInt(e.target.value))}
                            className="w-full p-2 rounded-lg border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-serif text-brand-olive">Edit Course Syllabus</h3>
            <button
              onClick={handleSaveSyllabus}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-brand-olive text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
            >
              {isSaving ? 'Saving...' : <><Save size={18} /> Save Syllabus</>}
            </button>
          </div>

          {syllabus && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold opacity-40 uppercase">Main Title</label>
                  <input
                    value={syllabus.title}
                    onChange={(e) => updateSyllabus('title', e.target.value)}
                    className="w-full p-3 rounded-xl border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none text-xl font-serif"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold opacity-40 uppercase">Main Description</label>
                  <textarea
                    value={syllabus.description}
                    onChange={(e) => updateSyllabus('description', e.target.value)}
                    className="w-full p-3 rounded-xl border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none h-20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {syllabus.sections.map((section, i) => (
                  <div key={section.id} className="p-6 bg-brand-cream/30 rounded-3xl border border-black/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-serif font-bold text-brand-olive">Section {i + 1}</h4>
                      <div className="text-xs opacity-40 font-mono">{section.icon}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold opacity-30 uppercase">Title</label>
                      <input
                        value={section.title}
                        onChange={(e) => updateSyllabusSection(i, 'title', e.target.value)}
                        className="w-full p-2 rounded-lg border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none font-serif"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold opacity-30 uppercase">Content (Markdown supported)</label>
                      <textarea
                        value={section.content}
                        onChange={(e) => updateSyllabusSection(i, 'content', e.target.value)}
                        className="w-full p-2 rounded-lg border border-black/10 focus:ring-1 focus:ring-brand-olive outline-none h-32 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
