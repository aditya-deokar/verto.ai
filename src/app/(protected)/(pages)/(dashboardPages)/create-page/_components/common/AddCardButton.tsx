import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddCardButtonProps {
  onAddCard: () => void;
}

export const AddCardButton: React.FC<AddCardButtonProps> = ({ onAddCard }) => {
  const [showGap, setShowGap] = useState(false);

  return (
    <div
      className="w-full relative h-6 flex items-center justify-center group"
      onMouseEnter={() => setShowGap(true)}
      onMouseLeave={() => setShowGap(false)}
    >
      <div className={`w-full h-px transition-all duration-500 ${showGap ? 'bg-foreground/10 scale-x-100' : 'bg-transparent scale-x-50'}`} />
      
      <AnimatePresence>
        {showGap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute z-20"
          >
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 rounded-lg p-0 bg-background border-border/40 hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300 shadow-sm"
              onClick={onAddCard}
              aria-label="Add new card"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
