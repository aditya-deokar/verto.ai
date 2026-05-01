import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card as UICard } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import { OutlineCard } from '@/lib/types';

interface CardProps {
  card: OutlineCard;
  isEditing: boolean;
  isSelected: boolean;
  editText: string;
  onEditChange: (value: string) => void;
  onEditBlur: () => void;
  onEditKeyDown: (e: React.KeyboardEvent) => void;
  onCardClick: () => void;
  onCardDoubleClick: () => void;
  onDeleteClick: () => void;
  dragHandlers: {
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: () => void;
  };
  onDragOver: (e: React.DragEvent) => void;
  dragOverStyles: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  card,
  isEditing,
  isSelected,
  editText,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
  onCardClick,
  onCardDoubleClick,
  onDeleteClick,
  dragHandlers,
  onDragOver,
  dragOverStyles,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }}
      className="relative group"
    >
      <div
        draggable
        {...dragHandlers}
        onDragOver={onDragOver}
        style={dragOverStyles}
      >
        <UICard
          className={`p-3 cursor-grab active:cursor-grabbing border-border/20 bg-background/50 backdrop-blur-sm transition-all duration-300 rounded-xl ${
            isEditing || isSelected ? 'border-foreground shadow-lg scale-[1.01] z-10' : 'hover:border-border/60 hover:bg-muted/5'
          }`}
          onClick={onCardClick}
          onDoubleClick={onCardDoubleClick}
        >
          <div className="flex items-center gap-4">
            {/* Grip & Number */}
            <div className="flex items-center gap-2 shrink-0">
               <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
               <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border transition-colors ${
                 isEditing || isSelected 
                  ? 'bg-foreground text-background border-foreground' 
                  : 'bg-muted/30 text-muted-foreground/60 border-border/10'
               }`}>
                 {card.order}
               </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <Input
                  ref={inputRef}
                  value={editText}
                  onChange={(e) => onEditChange(e.target.value)}
                  onBlur={onEditBlur}
                  onKeyDown={onEditKeyDown}
                  className="h-7 text-xs font-bold border-none focus-visible:ring-0 p-0 bg-transparent"
                />
              ) : (
                <p className="text-xs font-bold tracking-tight truncate py-1">
                  {card.title}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick();
                }}
                className="h-8 w-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                aria-label={`Delete card ${card.order}`}
              >
                <Trash2 className="h-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </UICard>
      </div>
    </motion.div>
  );
};
