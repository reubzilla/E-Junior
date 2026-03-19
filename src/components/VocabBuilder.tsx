import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Volume2 } from 'lucide-react';
import { Word } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface VocabBuilderProps {
  vocabulary: Word[];
}

export const VocabBuilder: React.FC<VocabBuilderProps> = ({ vocabulary }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!vocabulary || vocabulary.length === 0) return <div>No vocabulary added yet.</div>;

  const nextWord = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % vocabulary.length);
  };

  const prevWord = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + vocabulary.length) % vocabulary.length);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const currentWord = vocabulary[currentIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif">Vocabulary Cards</h3>
          <p className="text-sm text-brand-ink/60">Master the unit words</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevWord} className="p-2 rounded-full hover:bg-black/5 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextWord} className="p-2 rounded-full hover:bg-black/5 transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div 
        className="relative h-64 cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex + (isFlipped ? '-back' : '-front')}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`w-full h-full p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm border border-black/5 ${isFlipped ? 'bg-brand-olive text-white' : 'bg-white'}`}
          >
            {!isFlipped ? (
              <>
                <h2 className="text-4xl font-serif mb-4">{currentWord.term}</h2>
                <button 
                  onClick={(e) => { e.stopPropagation(); speak(currentWord.term); }}
                  className="p-2 rounded-full bg-brand-cream text-brand-olive hover:bg-brand-cream/80 transition-colors"
                >
                  <Volume2 size={20} />
                </button>
              </>
            ) : (
              <div className="prose prose-sm prose-invert text-center">
                <div className="text-xl font-serif mb-4 italic">
                  <Markdown rehypePlugins={[rehypeRaw]}>{currentWord.definition}</Markdown>
                </div>
                <div className="text-sm opacity-80 font-sans">
                  <Markdown rehypePlugins={[rehypeRaw]}>{`Example: ${currentWord.example}`}</Markdown>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 bg-brand-olive text-white rounded-2xl shadow-sm">
        <h4 className="font-serif text-lg mb-2">Progress</h4>
        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-white h-full transition-all duration-500" 
            style={{ width: `${((currentIndex + 1) / vocabulary.length) * 100}%` }}
          />
        </div>
        <p className="text-xs mt-2 opacity-80">{currentIndex + 1} of {vocabulary.length} words</p>
      </div>
    </div>
  );
};
