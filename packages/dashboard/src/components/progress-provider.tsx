import React, { useContext, useState } from "react";

interface ProgressContextType {
  visible: boolean;
  setVisible: (flag: boolean) => void;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const ProgressContext = React.createContext<ProgressContextType>(null!);
export const useProgress = () => {
  return useContext(ProgressContext);
};
export const ProgressProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <ProgressContext.Provider value={{ visible, setVisible }}>
      {children}
    </ProgressContext.Provider>
  );
};
