import { useState } from "react";
import TransactionFormPanel from "./TransactionFormPanel";
import type { Transaction } from "../../../../types/transaction";
import { ModalShell } from "../../../../components/ui/ModalShell";

interface TransactionFormModalProps {
  transaction?: Transaction;
  onSaved: () => void;
  onClose: () => void;
  onDelete?: () => void;
}

const styles = {
  backdrop:
    "app-scrollbar fixed inset-0 z-[100] flex items-center justify-center overflow-auto overscroll-contain bg-[var(--backdrop)] px-3 py-4 backdrop-blur sm:p-4",
  modalWrapper: "w-full max-w-md rounded-lg",
};

export default function TransactionFormModal({
  transaction,
  onSaved,
  onClose,
  onDelete,
}: TransactionFormModalProps) {
  const [closeRequestKey, setCloseRequestKey] = useState(0);

  const requestClose = () => {
    setCloseRequestKey((current) => current + 1);
  };

  return (
    <ModalShell backdropClassName={styles.backdrop} onClose={requestClose}>
      <div
        className={styles.modalWrapper}
        onClick={(event) => event.stopPropagation()}
      >
        <TransactionFormPanel
          mode="modal"
          transaction={transaction}
          closeRequestKey={closeRequestKey}
          onClose={onClose}
          onSaved={onSaved}
          onDelete={onDelete}
        />
      </div>
    </ModalShell>
  );
}
