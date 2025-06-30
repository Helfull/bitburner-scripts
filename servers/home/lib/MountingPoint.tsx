import React from 'react';
import ReactDOM from 'react-dom';
import { createContext } from 'react';
import { doc } from '@lib/bbElements';

export const NetscriptContext = createContext<NS>(null);
export const CleanupContext = createContext<(f: () => void) => void>(null);
export const TerminateContext = createContext<() => void>(null);

export type ContextProvider<T> = {
  context: React.Context<T>;
  value: T;
};

type Props = {
  contexts: ContextProvider<any>[];
  children: React.ReactNode;
};

export function ContextCollection({ contexts, children }: Props) {
  return contexts.reduce(
    (previousContextElement, { context: { Provider: CurrentContext }, value }) => (
      <CurrentContext value={value}>{previousContextElement}</CurrentContext>
    ),
    children,
  );
}

export const createMountingPoint = (ns: NS, mpConfig: {closeOnExit:boolean, tailSetup?: () => Promise<void>} = { closeOnExit: true,  }) => {
  const cleanupCallbacks: (() => void)[] = [];
  return {
    addCleanup: (f: () => void) => cleanupCallbacks.push(f),
    cleanup: () => {
      cleanupCallbacks.forEach((f) => f());
    },
    async mount(component: React.ReactElement, root?: HTMLElement): Promise<unkown> {
      return new Promise(async (resolve) => {
        if (!root) {
          ns.clearLog();
          ns.ui.openTail();
          ns.disableLog('ALL');
          ns.printRaw(<span data-pid={ns.pid}></span>);
          await ns.sleep(0); // give up control so DOM can update
          root = doc.querySelector(`span[data-pid="${ns.pid}"]`) as HTMLElement;

          if (!root) {
            ns.print('Failed to find root element');
            resolve();
          }

          if (mpConfig.closeOnExit) {
            cleanupCallbacks.push(() => {
               ns.ui.closeTail();
            });
          }
        }

        const contexts = [
          {
            context: NetscriptContext,
            value: ns,
          },
          {
            context: TerminateContext,
            value: resolve,
          },
          {
            context: CleanupContext,
            value: (f: () => void) => cleanupCallbacks.push(f),
          },
        ];

        cleanupCallbacks.push(() => ReactDOM.unmountComponentAtNode(root));
        try {
          ReactDOM.render(
            <ContextCollection contexts={contexts}>
              {component}
            </ContextCollection>,
            root,
          );
        } catch (e) {
          console.warn(e);
          resolve();
        }

        watchForElementRemoval(root, () => {
          resolve();
        });
      });
    },
  };
};

function watchForElementRemoval(element: Element, callback: () => void) {
  const observer = new MutationObserver(function (mutations) {
    // loop through all mutations
    mutations.forEach(function (mutation) {
      // check for changes to the child list
      if (mutation.type === 'childList') {
        mutation.removedNodes.forEach((node) => {
          if (!containsRecursive(node, element)) return;
          callback();
          observer.disconnect();
        });
      }
    });
  });

  // start observing the dom
  observer.observe(doc.body, { childList: true, subtree: true });

  return {
    cleanup: () => observer.disconnect(),
  };
}

export function containsRecursive(container: Node | Element, child: Element): boolean {
  if (!('children' in container)) return false;
  return [...container.children].reduce((prev, cur) => prev || cur == child || containsRecursive(cur, child), false);
}
