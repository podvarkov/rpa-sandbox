import React, { useContext, useEffect, useState } from "react";
import { useIsFetching } from "react-query";

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
  const isFetching = useIsFetching();
  useEffect(() => {
    setVisible(!!isFetching);
  }, [isFetching, setVisible]);
  return (
    <ProgressContext.Provider value={{ visible, setVisible }}>
      {children}
    </ProgressContext.Provider>
  );
};
