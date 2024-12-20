import React, { ReactNode } from 'react';
import "../styles/globals.css"

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html>
        <body>
            {children}
        </body>
    </html>
  );
}

export default Layout;
