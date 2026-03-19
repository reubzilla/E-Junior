import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { GrammarPoint } from '../types';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface GrammarPracticeProps {
  grammar: GrammarPoint[];
}

export const GrammarPractice: React.FC<GrammarPracticeProps> = ({ grammar }) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-serif">Grammar Essentials</h3>
        <p className="text-sm text-brand-ink/60">Clear rules with practical examples</p>
      </div>

      <div className="grid gap-6">
        {grammar.map((rule, i) => (
          <div key={i} className="p-8 bg-white rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-xl font-serif mb-3 text-brand-olive">{rule.title}</h4>
            <div className="text-brand-ink/80 mb-6 font-sans prose prose-sm max-w-none">
              <Markdown rehypePlugins={[rehypeRaw]}>{rule.description}</Markdown>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest font-semibold text-brand-olive/60">Examples</p>
              {rule.examples.map((ex, j) => (
                <div key={j} className="flex items-center gap-3 p-3 bg-brand-cream/50 rounded-xl border border-black/5">
                  <CheckCircle2 size={16} className="text-brand-olive shrink-0" />
                  <div className="text-sm italic font-serif prose prose-sm max-w-none">
                    <Markdown rehypePlugins={[rehypeRaw]}>{ex}</Markdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
