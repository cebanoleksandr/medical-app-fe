import type { FC, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { alpha, useTheme } from '@mui/material/styles';

interface IProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const BasePopup: FC<IProps> = ({ isVisible, onClose, children }) => {
  const theme = useTheme();

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-100"
            style={{ backgroundColor: alpha('#01132F', 0.5) }}
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            key="modal"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[92vw]
                       sm:w-auto sm:min-w-120 sm:max-w-[90vw] max-h-[90vh] overflow-y-auto m-0
                       z-500 shadow-lg p-4"
            style={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.shape.borderRadius,
              color: theme.palette.text.primary,
            }}
            initial={{ opacity: 0, scale: 0.5, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default BasePopup;
