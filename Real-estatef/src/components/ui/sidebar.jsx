import React, { useState, createContext, useContext } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "../../utils/cn";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarTrigger = ({ className, ...props }) => {
  const { open, setOpen } = useSidebar();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
      className={cn(
        "rounded-lg p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center",
        className
      )}
      title={open ? "Collapse sidebar" : "Expand sidebar"}
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      {...props}
    >
      {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
    </button>
  );
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate = true,
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex flex-col bg-white border-r border-slate-200 w-[260px] flex-shrink-0 text-left",
        className
      )}
      animate={{
        width: animate ? (open ? "260px" : "68px") : "260px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-14 px-4 py-2 flex flex-row md:hidden items-center justify-between bg-white border-b border-slate-200 w-full"
      )}
      {...props}
    >
      <div className="flex justify-end z-20 w-full">
        <Menu
          className="text-slate-800 cursor-pointer"
          onClick={() => setOpen(!open)}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-white p-10 z-[50] flex flex-col justify-between text-left",
              className
            )}
          >
            <div
              className="absolute right-6 top-6 z-50 text-slate-800 cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              <X className="h-6 w-6" />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  onClick,
  ...props
}) => {
  const { open, animate } = useSidebar();
  
  const content = (
    <>
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{ duration: 0.15 }}
        className="text-slate-700 text-xs font-black uppercase tracking-wider group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center justify-start gap-3.5 group/sidebar py-3 px-2 rounded-xl hover:bg-slate-100/80 transition-colors w-full cursor-pointer text-left",
          className
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={link.href}
      className={cn(
        "flex items-center justify-start gap-3.5 group/sidebar py-3 px-2 rounded-xl hover:bg-slate-100/80 transition-colors w-full",
        className
      )}
      {...props}
    >
      {content}
    </Link>
  );
};
