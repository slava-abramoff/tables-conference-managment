import { useContext } from "react";
import { ModalContext } from "../context/ModalContext";

import ConfirmModal from "./ConfirmModal";
import EditUserModal from "./EditUserModal";
import CreateMeetModal from "./CreateMeetModal";
import ConfirmDeleteLectureModal from "./ConfirmDeleteLectureModal";

const modalRegistry = {
  confirm: ConfirmModal,
  editUser: EditUserModal,
  createMeet: CreateMeetModal,
  deleteLecture: ConfirmDeleteLectureModal,
};

function ModalManager() {
  const { modals } = useContext(ModalContext);

  return (
    <>
      {Object.entries(modalRegistry).map(([modalId, ModalComponent]) => {
        const { open = false, data = {} } = modals[modalId] || {};
        return open ? <ModalComponent key={modalId} {...data} /> : null;
      })}
    </>
  );
}

export default ModalManager;
