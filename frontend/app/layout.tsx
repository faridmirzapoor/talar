import React, { ReactNode, Suspense } from "react";
import "../styles/globals.css";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  );
};

export default Layout;
