import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, RefreshCcw, Trophy, ArrowRight } from 'lucide-react';
import { Word } from '../types';

interface VocabQuizProps {
  vocabulary: Word[];
}

interface Question {
  word: string;
  correctAnswer: string;
  options: string[];
}

export const VocabQuiz: React.FC<VocabQuizProps> = ({ vocabulary }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const generateQuiz = () => {
    if (vocabulary.length < 4) return;

    const shuffledVocab = [...vocabulary].sort(() => Math.random() - 0.5);
    const quizQuestions = shuffledVocab.map((item) => {
      const otherDefinitions = vocabulary
        .filter((v) => v.term !== item.term)
        .map((v) => v.definition)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [item.definition, ...otherDefinitions].sort(() => Math.random() - 0.5);

      return {
        word: item.term,
        correctAnswer: item.definition,
        options,
      };
    });

    setQuestions(quizQuestions);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  useEffect(() => {
    generateQuiz();
  }, [vocabulary]);

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === questions[currentQuestionIndex].correctAnswer) {
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
        <button
          onClick={generateQuiz}
          className="flex items-center gap-2 px-8 py-3 bg-brand-olive text-white rounded-2xl mx-auto hover:opacity-90 transition-all font-bold shadow-md"
        >
          <RefreshCcw size={20} />
          Try Again
        </button>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif">Vocabulary Quiz</h3>
          <p className="text-sm text-brand-ink/60">Test your knowledge</p>
        </div>
        <div className="text-sm font-mono font-bold text-brand-olive bg-brand-cream px-4 py-1 rounded-full">
          {currentQuestionIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="p-12 bg-white rounded-3xl border border-black/5 shadow-sm space-y-12">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest font-bold text-brand-ink/40 mb-4">What is the definition of:</p>
          <h2 className="text-5xl font-serif text-brand-olive">{currentQuestion.word}</h2>
        </div>

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
