import { createContext, useContext, useState, useCallback } from "react";

export const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modals, setModals] = useState({}); // { modalId: { open: boolean, data: any } }

  const openModal = useCallback((modalId, data = {}) => {
    setModals((prev) => ({ ...prev, [modalId]: { open: true, data } }));
  }, []);

  const closeModal = useCallback((modalId) => {
    setModals((prev) => ({
      ...prev,
      [modalId]: { ...prev[modalId], open: false },
    }));
  }, []);

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal(modalId) {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  const { modals, openModal, closeModal } = context;
  const isOpen = modals[modalId]?.open || false;
  const data = modals[modalId]?.data || {};

  const open = (data) => openModal(modalId, data);
  const close = () => closeModal(modalId);

  return { isOpen, data, open, close };
}
