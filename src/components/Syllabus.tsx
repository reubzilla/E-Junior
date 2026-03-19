import React, { useEffect, useState } from 'react';
import { Info, Calendar, Target, Award } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { SyllabusData } from '../types';
import ReactMarkdown from 'react-markdown';

import { DEFAULT_SYLLABUS } from '../constants';

const IconMap = {
  Target: Target,
  Calendar: Calendar,
  Award: Award,
  Info: Info,
};

export const Syllabus: React.FC = () => {
  const [syllabus, setSyllabus] = useState<SyllabusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'syllabus', 'main-syllabus'), (doc) => {
      if (doc.exists()) {
        setSyllabus(doc.data() as SyllabusData);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-olive"></div>
      </div>
    );
  }

  const displaySyllabus = syllabus || DEFAULT_SYLLABUS;

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-4xl font-serif">{displaySyllabus.title}</h2>
        <p className="text-brand-ink/60">{displaySyllabus.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displaySyllabus.sections.map((section, index) => {
          const IconComponent = IconMap[section.icon as keyof typeof IconMap] || Info;
          const isLast = index === displaySyllabus.sections.length - 1;

          return (
            <div 
              key={section.id} 
              className={`p-8 rounded-3xl border border-black/5 shadow-sm space-y-4 ${isLast ? 'bg-brand-olive text-white' : 'bg-white'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLast ? 'bg-white/10' : 'bg-brand-cream text-brand-olive'}`}>
                <IconComponent size={24} />
              </div>
              <h3 className="text-xl font-serif">{section.title}</h3>
              <div className={`text-sm leading-relaxed ${isLast ? 'opacity-90' : 'text-brand-ink/70'} prose prose-sm max-w-none ${isLast ? 'prose-invert' : ''}`}>
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
