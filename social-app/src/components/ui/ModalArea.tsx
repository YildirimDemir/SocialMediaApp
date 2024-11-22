import React, { ReactNode } from 'react'
import Style from './modalarea.module.css'

interface ModalAreaProps {
  children: ReactNode;
}

export default function ModalArea({ children }: ModalAreaProps) {
  return (
    <div className={Style.modalArea}>
      {children}
    </div>
  )
}