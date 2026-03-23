import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, RefreshCcw, Trophy, ArrowRight, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { Word, Question } from '../types';
import { generateQuizQuestions, generateImage } from '../services/gemini';

interface VocabQuizProps {
  vocabulary: Word[];
  cefrLevel?: string;
  theme?: string;
}

export const VocabQuiz: React.FC<VocabQuizProps> = ({ vocabulary, cefrLevel, theme }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [scrambledSelectedIndices, setScrambledSelectedIndices] = useState<number[]>([]);
  const [shuffledScrambleOptions, setShuffledScrambleOptions] = useState<string[]>([]);

  const generateQuiz = async (useAI = false) => {
    if (vocabulary.length < 4) return;
    
    setIsLoading(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setCurrentImage(null);
    setScrambledSelectedIndices([]);
    setShuffledScrambleOptions([]);

    try {
      if (useAI) {
        const aiQuestions = await generateQuizQuestions(vocabulary, cefrLevel, theme);
        setQuestions(aiQuestions);
      } else {
        // Fallback to simple multiple choice
        const shuffledVocab = [...vocabulary].sort(() => Math.random() - 0.5);
        const quizQuestions: Question[] = shuffledVocab.map((item, idx) => {
          const otherDefinitions = vocabulary
            .filter((v) => v.term !== item.term)
            .map((v) => v.definition)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

          const options = [item.definition, ...otherDefinitions].sort(() => Math.random() - 0.5);

          return {
            id: `q-${idx}`,
            type: 'multiple_choice',
            word: item.term,
            prompt: `What is the definition of:`,
            correctAnswer: item.definition,
            options,
          };
        });
        setQuestions(quizQuestions);
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateQuiz(false);
  }, [vocabulary]);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (!currentQuestion) return;

    const loadMedia = async () => {
      setCurrentImage(null);
      
      if (currentQuestion.type === 'visual_context' && currentQuestion.imageDescription) {
        setIsMediaLoading(true);
        const img = await generateImage(currentQuestion.imageDescription);
        setCurrentImage(img || null);
        setIsMediaLoading(false);
      }
    };

    if (currentQuestion.type === 'sentence_scramble') {
      setShuffledScrambleOptions([...currentQuestion.options].sort(() => Math.random() - 0.5));
      setScrambledSelectedIndices([]);
    }

    loadMedia();
  }, [currentQuestion]);

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  if (vocabulary.length < 4) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-black/5 shadow-sm">
        <p className="text-brand-ink/60 font-serif text-xl italic">
          Add at least 4 vocabulary words to start a quiz!
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-24 flex flex-col items-center justify-center space-y-4 bg-white rounded-3xl border border-black/5 shadow-sm">
        <Loader2 className="animate-spin text-brand-olive" size={48} />
        <p className="text-brand-ink/60 font-serif italic">Gemini is crafting your personalized quiz...</p>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-12 text-center bg-white rounded-3xl border border-black/5 shadow-sm space-y-8"
      >
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-brand-cream rounded-full flex items-center justify-center text-brand-olive">
            <Trophy size={48} />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-serif mb-2">Quiz Complete!</h3>
          <p className="text-brand-ink/60">You've mastered the unit vocabulary.</p>
        </div>
        <div className="text-6xl font-serif text-brand-olive">
          {score} / {questions.length}
        </div>
        <div className="w-full bg-brand-cream h-4 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className="bg-brand-olive h-full"
          />
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => generateQuiz(false)}
            className="flex items-center gap-2 px-8 py-3 border border-brand-olive text-brand-olive rounded-2xl hover:bg-brand-cream transition-all font-bold"
          >
            <RefreshCcw size={20} />
            Standard Quiz
          </button>
          <button
            onClick={() => generateQuiz(true)}
            className="flex items-center gap-2 px-8 py-3 bg-brand-olive text-white rounded-2xl hover:opacity-90 transition-all font-bold shadow-md"
          >
            <Sparkles size={20} />
            AI Advanced Quiz
          </button>
        </div>
      </motion.div>
    );
  }

  if (!currentQuestion) return null;

  const renderQuestionHeader = () => {
    switch (currentQuestion.type) {
      case 'collocation':
        return (
          <div className="text-center space-y-4">
            <p className="text-xs uppercase tracking-widest font-bold text-brand-ink/40">The Collocation Match</p>
            <h2 className="text-5xl font-serif text-brand-olive">{currentQuestion.word} + [?]</h2>
            <p className="text-brand-ink/60 italic">Which word "partners" naturally with {currentQuestion.word}?</p>
          </div>
        );
      case 'odd_one_out':
        return (
          <div className="text-center space-y-4">
            <p className="text-xs uppercase tracking-widest font-bold text-brand-ink/40">Semantic Odd One Out</p>
            <h2 className="text-3xl font-serif text-brand-olive">Which one is different?</h2>
            <p className="text-brand-ink/60 italic">Three words belong together, one does not.</p>
          </div>
        );
      case 'visual_context':
        return (
          <div className="text-center space-y-6">
            <p className="text-xs uppercase tracking-widest font-bold text-brand-ink/40">Visual-to-Context Tap</p>
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-brand-cream rounded-2xl overflow-hidden flex items-center justify-center border border-black/5">
                {isMediaLoading ? (
                  <Loader2 className="animate-spin text-brand-olive/30" size={32} />
                ) : currentImage ? (
                  <img src={currentImage} alt="Context" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <ImageIcon size={48} className="text-brand-olive/20" />
                )}
              </div>
            </div>
            <h2 className="text-2xl font-serif leading-relaxed px-4">
              {currentQuestion.prompt.split('________').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block w-24 border-b-2 border-brand-olive mx-2 h-6" />
                  )}
                </React.Fragment>
              ))}
            </h2>
          </div>
        );
      case 'word_family':
        return (
          <div className="text-center space-y-6">
            <p className="text-xs uppercase tracking-widest font-bold text-brand-ink/40">Word Family Slider</p>
            <div className="bg-brand-cream p-4 rounded-xl inline-block">
              <p className="text-xs font-bold opacity-40 uppercase mb-1">Root Word</p>
              <p className="text-2xl font-serif font-bold text-brand-olive">{currentQuestion.rootWord}</p>
            </div>
            <h2 className="text-2xl font-serif leading-relaxed px-4">
              {currentQuestion.prompt.split('_______').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block w-24 border-b-2 border-brand-olive mx-2 h-6" />
                  )}
                </React.Fragment>
              ))}
            </h2>
          </div>
        );
      case 'sentence_scramble':
        return (
          <div className="text-center space-y-6">
            <p className="text-xs uppercase tracking-widest font-bold text-brand-ink/40">Sentence Scramble</p>
            <h2 className="text-3xl font-serif text-brand-olive">Put the words in order</h2>
            <div className="min-h-[100px] p-6 bg-brand-cream/30 rounded-2xl border-2 border-dashed border-brand-olive/20 flex flex-wrap gap-2 justify-center items-center">
              {scrambledSelectedIndices.map((idx, i) => (
                <motion.button
                  key={`selected-${i}`}
                  layoutId={`word-${idx}`}
                  onClick={() => !isAnswered && setScrambledSelectedIndices(prev => prev.filter((_, itemIdx) => itemIdx !== i))}
                  className="px-4 py-2 bg-brand-olive text-white rounded-xl font-serif shadow-sm"
                >
                  {shuffledScrambleOptions[idx]}
                </motion.button>
              ))}
              {scrambledSelectedIndices.length === 0 && (
                <p className="text-brand-ink/30 italic">Tap words below to build the sentence...</p>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest font-bold text-brand-ink/40 mb-4">What is the definition of:</p>
            <h2 className="text-5xl font-serif text-brand-olive">{currentQuestion.word}</h2>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-2xl font-serif">Vocabulary Quiz</h3>
            <p className="text-sm text-brand-ink/60">
              {questions.some(q => q.type !== 'multiple_choice') ? 'AI Advanced Mode' : 'Standard Mode'}
            </p>
          </div>
          {!isLoading && questions.every(q => q.type === 'multiple_choice') && (
            <button 
              onClick={() => generateQuiz(true)}
              className="flex items-center gap-2 px-3 py-1 bg-brand-cream text-brand-olive rounded-full text-xs font-bold hover:bg-brand-olive/10 transition-colors"
            >
              <Sparkles size={14} />
              Try AI Quiz
            </button>
          )}
        </div>
        <div className="text-sm font-mono font-bold text-brand-olive bg-brand-cream px-4 py-1 rounded-full">
          {currentQuestionIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="p-12 bg-white rounded-3xl border border-black/5 shadow-sm space-y-12">
        {renderQuestionHeader()}

        {currentQuestion.type === 'sentence_scramble' ? (
          <div className="space-y-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {shuffledScrambleOptions.map((word, i) => {
                const isSelected = scrambledSelectedIndices.includes(i);
                return (
                  <motion.button
                    key={`option-${i}`}
                    layoutId={`word-${i}`}
                    disabled={isAnswered || isSelected}
                    onClick={() => !isAnswered && setScrambledSelectedIndices(prev => [...prev, i])}
                    className={`px-6 py-3 rounded-xl border-2 font-serif transition-all ${
                      isSelected ? 'opacity-0 pointer-events-none' : 
                      isAnswered ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-olive hover:bg-brand-cream/30'
                    } border-brand-olive/10 text-brand-ink`}
                  >
                    {word}
                  </motion.button>
                );
              })}
            </div>
            
            {!isAnswered && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setScrambledSelectedIndices([])}
                  className="px-6 py-2 text-brand-ink/60 hover:text-brand-ink transition-colors font-bold"
                >
                  Clear
                </button>
                <button
                  disabled={scrambledSelectedIndices.length === 0}
                  onClick={() => {
                    const studentSentence = scrambledSelectedIndices.map(idx => shuffledScrambleOptions[idx]).join(' ');
                    setIsAnswered(true);
                    setSelectedOption(studentSentence);
                    if (studentSentence.toLowerCase().replace(/[.,!?;]/g, '') === currentQuestion.correctAnswer.toLowerCase().replace(/[.,!?;]/g, '')) {
                      setScore(prev => prev + 1);
                    }
                  }}
                  className="px-8 py-3 bg-brand-olive text-white rounded-2xl font-bold shadow-md disabled:opacity-50"
                >
                  Check Answer
                </button>
              </div>
            )}
            
            {isAnswered && (
              <div className={`p-6 rounded-2xl text-center font-serif ${
                selectedOption?.toLowerCase().replace(/[.,!?;]/g, '') === currentQuestion.correctAnswer.toLowerCase().replace(/[.,!?;]/g, '')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <p className="font-bold mb-2">
                  {selectedOption?.toLowerCase().replace(/[.,!?;]/g, '') === currentQuestion.correctAnswer.toLowerCase().replace(/[.,!?;]/g, '')
                    ? 'Correct!'
                    : 'Not quite...'}
                </p>
                <p className="text-sm opacity-80">Correct sentence: {currentQuestion.correctAnswer}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, i) => {
              const isCorrect = option === currentQuestion.correctAnswer;
              const isSelected = option === selectedOption;
              
              let buttonClass = "p-6 rounded-2xl border text-left transition-all flex justify-between items-center ";
              if (!isAnswered) {
                buttonClass += "bg-white border-black/5 hover:border-brand-olive/30 hover:bg-brand-cream/30";
              } else {
                if (isCorrect) {
                  buttonClass += "bg-green-50 border-green-200 text-green-700";
                } else if (isSelected) {
                  buttonClass += "bg-red-50 border-red-200 text-red-700";
                } else {
                  buttonClass += "bg-white border-black/5 opacity-50";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                  className={buttonClass}
                >
                  <span className="font-serif">{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 size={20} className="text-green-600" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle size={20} className="text-red-600" />}
                </button>
              );
            })}
          </div>
        )}

        {isAnswered && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-brand-olive text-white rounded-2xl hover:opacity-90 transition-all font-bold shadow-md"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
