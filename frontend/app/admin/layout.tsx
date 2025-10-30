"use client";

import Link from "@node_modules/next/link";
import NavbarItems from "@constants/navbarItems";
import React, { useState } from "react";
import { Menu, X, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area"; // از کد خودت
import Image from "@node_modules/next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const [colorState, setColorState] = useState("white");
  return (
    <div className="flex h-screen text-iransans">
      {/* --- Sidebar دسکتاپ: ثابت 30% --- */}
      <div
        className={`
          hidden large:block md:flex flex-col bg-[#191970] border-r transition-all duration-300
          ${collapsed ? "w-[80px]" : "w-[20%]"}
        `}
      >
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-end"
          } p-2`}
        >
          <div className="flex justify-between items-center w-full">
            <Image
              src={"/img/Bahonar_university.png"}
              alt="Bahonar Logo"
              width={36}
              height={36}
              />
              {!collapsed && (
                <p className="font-estedadSB text-white">مدیریت تالار ها</p>
              )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hover:bg-black hover:text-white"
          >
            {collapsed ? (
              <ChevronsLeft color={colorState} />
            ) : (
              <ChevronsRight color={colorState} />
            )}
          </Button>
        </div>

        <Separator />
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">
            {/* Dashboard */}
            {NavbarItems.map((item) => (
              <Link
                key={item.name}
                href={item.url}
                className="gap-2 font-iransansB block"
              >
                <Button variant="secondary" className="w-full justify-start">
                  <Image
                    src={item.image}
                    alt={item.value}
                    width={20}
                    height={20}
                  />
                  {!collapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </div>

      {/* --- Sidebar موبایل با همبرگری --- */}
      <div className="md:hidden">
        <Sheet>
          {/* همبرگری در موبایل */}
          <div className="p-2 border-b large:hidden">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
          </div>
          {/* Drawer موبایل */}
          <SheetContent side="left" className="p-0 w-64 bg-[#191970]">
            <div className="flex flex-col h-full">
              <div className="p-2 border-b flex justify-end">
                <Button variant="ghost" size="icon">
                  <X />
                </Button>
              </div>
              <Separator />
              <ScrollArea className="flex-1 p-4">
                <nav className="space-y-2">
                  {NavbarItems.map((item) => (
                    <Button
                      key={item.name}
                      variant="secondary"
                      className="w-full font-iransansB"
                    >
                      <Link href={item.url}>{item.name}</Link>
                    </Button>
                  ))}
                </nav>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1 overflow-y-auto h-screen">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
