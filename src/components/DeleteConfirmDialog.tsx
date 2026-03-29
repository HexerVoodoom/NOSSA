import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ isOpen, title, message, onClose, onConfirm }: DeleteConfirmDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  
  if (!isOpen) return null;
  
  const handleClose = () => {
    setStep(1);
    onClose();
  };
  
  const handleFirstConfirm = () => {
    setStep(2);
  };
  
  const handleFinalConfirm = () => {
    setStep(1);
    onConfirm();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-[16px]">
      <div className="bg-white rounded-[12px] p-[24px] max-w-[400px] w-full">
        {step === 1 ? (
          <>
            <div className="flex items-center gap-3 mb-[12px]">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <p className="font-['Inter:Bold',sans-serif] text-[20px] text-black">
                {title}
              </p>
            </div>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] text-black/70 mb-[24px]">
              {message}
            </p>
            <div className="flex gap-[12px] justify-end">
              <button
                onClick={handleClose}
                className="px-[16px] py-[12px] rounded-[12px] border border-black hover:bg-gray-50"
              >
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-black">Cancelar</p>
              </button>
              <button
                onClick={handleFirstConfirm}
                className="bg-red-500 px-[16px] py-[12px] rounded-[12px] text-white hover:bg-red-600"
              >
                <p className="font-['Inter:Regular',sans-serif] text-[14px]">Excluir</p>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-[12px]">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <p className="font-['Inter:Bold',sans-serif] text-[20px] text-black">
                Tem certeza?
              </p>
            </div>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] text-black/70 mb-[24px]">
              Esta ação não pode ser desfeita. Confirme novamente para excluir permanentemente.
            </p>
            <div className="flex gap-[12px] justify-end">
              <button
                onClick={handleClose}
                className="px-[16px] py-[12px] rounded-[12px] border border-black hover:bg-gray-50"
              >
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-black">Cancelar</p>
              </button>
              <button
                onClick={handleFinalConfirm}
                className="bg-red-600 px-[16px] py-[12px] rounded-[12px] text-white hover:bg-red-700"
              >
                <p className="font-['Inter:Regular',sans-serif] text-[14px]">Confirmar Exclusão</p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
