'use client';

import React from 'react';
import Style from './singlepostmenu.module.css';

interface PostMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void; 
  onDelete: () => void;
}

const SinglePostMenu: React.FC<PostMenuProps> = ({ isOpen, onClose, onEdit, onDelete }) => {
  return (
    <div className={`${Style.editModal} ${isOpen ? '' : Style.closed}`}>
      <div className={Style.menuBox}>
        <button className={Style.menuBtn} onClick={onEdit}>Edit Post</button>  
        <button className={Style.menuBtn} onClick={onDelete}>Delete Post</button>
        <button className={Style.closeBtn} onClick={onClose}>X</button>
      </div>
    </div>
  );
};

export default SinglePostMenu;
