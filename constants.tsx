
import React from 'react';
import { 
  Wrench, 
  Zap, 
  HardHat, 
  Layers, 
  PaintBucket, 
  Hammer, 
  Brush, 
  Home 
} from 'lucide-react';

export const SERVICE_CATEGORIES = [
  { id: 'pedreiro', icon: <HardHat size={18} /> },
  { id: 'canalizador', icon: <Wrench size={18} /> },
  { id: 'eletricista', icon: <Zap size={18} /> },
  { id: 'pladur', icon: <Layers size={18} /> },
  { id: 'capoto', icon: <Home size={18} /> },
  { id: 'pintura', icon: <PaintBucket size={18} /> },
  { id: 'carpinteiro', icon: <Hammer size={18} /> },
  { id: 'estuque', icon: <Brush size={18} /> }
];

export const APP_NAME = "ÁTRIOS";
export const FREE_ITEM_LIMIT = 3;
export const FREE_SERVICE_LIMIT = 3;
export const FREE_EXPENSE_LIMIT = 3;
export const FREE_PAYMENT_LIMIT = 3;
export const FREE_PDF_LIMIT = 3;
export const FREE_BUDGET_LIMIT = 3;
