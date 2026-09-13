import { createContext, useContext, useState, type ReactNode } from "react";
import {
  createDemo,
  proposeDecision,
  approveDecision,
  type Actor,
  type Decision,
  type DemoState,
} from "./model";

type DemoContextValue = {
  state: DemoState;
  actor: Actor;
  setActor: (actor: Actor) => void;
  propose: (id: string, action: Decision["action"], reason: string) => void;
  approve: (id: string) => void;
  reset: () => void;
};
const DemoContext = createContext<DemoContextValue | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createDemo);
  const [actor, setActor] = useState<Actor>("operator");
  // Synchronous validation lets callers show errors, not an optimistic success.
  const propose = (id: string, action: Decision["action"], reason: string) =>
    setState(proposeDecision(state, id, action, reason, actor));
  const approve = (id: string) => setState(approveDecision(state, id, actor));
  return (
    <DemoContext.Provider
      value={{
        state,
        actor,
        setActor,
        propose,
        approve,
        reset: () => {
          setState(createDemo());
          setActor("operator");
        },
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}
export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("Demo provider missing");
  return value;
}
