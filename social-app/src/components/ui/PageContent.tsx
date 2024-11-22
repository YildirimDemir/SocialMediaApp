import React, { ReactNode } from 'react';
import Style from './pagecontent.module.css';
import Sidebar from './Sidebar';

interface PageContentProps {
  children: ReactNode;
}

const PageContent: React.FC<PageContentProps> = ({ children }) => {
  return (
    <div className={Style.pageArea}>
      <div className={Style.sidebarArea}>
        <Sidebar />
      </div>
      <div className={Style.contentArea}>
        {children}
      </div>
    </div>
  );
};

export default PageContent;
