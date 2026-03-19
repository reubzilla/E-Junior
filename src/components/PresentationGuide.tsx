import React from 'react';
import { ClipboardCheck, ListChecks } from 'lucide-react';
import { Presentation, RubricCriterion } from '../types';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence } from 'motion/react';

interface PresentationGuideProps {
  presentations: Presentation[];
  rubric: RubricCriterion[];
}

export const PresentationGuide: React.FC<PresentationGuideProps> = ({ presentations, rubric }) => {
  const [selectedProjectIndex, setSelectedProjectIndex] = React.useState(0);

  const presentation = presentations?.[selectedProjectIndex];

  if (!presentations || presentations.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-black/5 shadow-sm">
        <p className="text-brand-ink/40 font-serif text-xl italic">No presentation tasks available for this unit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Project Selection */}
      <div className="flex gap-4 p-1 bg-brand-cream rounded-2xl w-fit">
        {presentations.map((pres, i) => (
          <button
            key={pres.id || i}
            onClick={() => setSelectedProjectIndex(i)}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedProjectIndex === i
                ? 'bg-white text-brand-olive shadow-sm'
                : 'text-brand-ink/60 hover:text-brand-ink'
            }`}
          >
            Project {String.fromCharCode(65 + i)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedProjectIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
            <h3 className="text-2xl font-serif mb-4 text-brand-olive">{presentation.title}</h3>
            <div className="text-brand-ink/70 mb-6 prose prose-sm max-w-none">
              <Markdown rehypePlugins={[rehypeRaw]}>{presentation.task}</Markdown>
            </div>
            
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 font-serif text-lg">
                <ListChecks className="text-brand-olive" size={20} />
                Scaffolded Process
              </h4>
              <div className="grid gap-3">
                {presentation.scaffolding.map((step, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-brand-cream/30 rounded-2xl border border-black/5">
                    <div className="w-6 h-6 rounded-full bg-brand-olive text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="text-sm prose prose-sm max-w-none">
                      <Markdown rehypePlugins={[rehypeRaw]}>{step}</Markdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="bg-brand-olive text-white p-8 rounded-3xl shadow-lg">
        <h4 className="flex items-center gap-2 font-serif text-xl mb-6">
          <ClipboardCheck size={24} />
          Assessment Rubric
        </h4>
        <div className="grid gap-4">
          {rubric && rubric.length > 0 ? (
            rubric.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                <div>
                  <p className="font-serif text-lg">{item.name}</p>
                  <p className="text-xs opacity-70">{item.description}</p>
                </div>
                <span className="font-mono text-sm font-bold">Max: {item.maxPoints}</span>
              </div>
            ))
          ) : (
            <p className="text-sm opacity-60 italic">No rubric defined for this unit.</p>
          )}
        </div>
      </div>
    </div>
  );
};
