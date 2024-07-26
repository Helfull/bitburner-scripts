import { Color } from '@lib/colors';

type ScriptArg = string | number | boolean;

type ScriptDefinition<T extends FlagsDefinition> = {
  description: string;
  flags?: T;
};

type Flag<T = any> = {
  description: string;
  defaultValue: T;
};

type FlagsDefinition = {
  [K: string]: Flag;
};

type DefaultFlags = {
  [K in keyof typeof defaultFlags]: {
    description: string;
    defaultValue: (typeof defaultFlags)[K]['defaultValue'];
  };
};

type MapFlagsArray<T extends FlagsDefinition> = {
  [P in keyof T]: T[P]['defaultValue'];
};

type DefaultFlagsMapped = MapFlagsArray<DefaultFlags>;

type FlagsEvaluated<T extends FlagsDefinition> = MapFlagsArray<T> & DefaultFlagsMapped;

const defaultFlags = {
  help: {
    description: 'Displays this help message, providing detailed information about script usage.',
    defaultValue: false,
  },
  cli: {
    description: 'Enables command-line interface mode, directing output to the terminal.',
    defaultValue: false,
  },
  win: {
    description: 'Opens script logs in a new window, similar to the --tail option for enhanced readability.',
    defaultValue: false,
  },
};

export function defineScript<T extends FlagsDefinition>(ns: NS, definition: ScriptDefinition<T>): FlagsEvaluated<T> {
  const args = getFlags(ns, definition.flags);

  setupTail(ns, args);

  printHelp(ns, args, definition);

  return args;
}

function setupTail<T extends FlagsDefinition>(ns: NS, args: FlagsEvaluated<T>) {
  ns.disableLog('ALL');

  if (args.win) {
    ns.tail();
  }
}

function printHelp<T extends FlagsDefinition>(ns, args: FlagsEvaluated<T>, definition: ScriptDefinition<T>) {
  function printSection(ns: any, title: string, content: string) {
    ns.tprintf(Color.yellow.wrap(`=== ${title} ===\n`));
    ns.tprintf(content + '\n\n');
  }

  if (args.help) {
    const scriptName = Color.pink.wrap(ns.getScriptName());
    ns.tprintf(Color.green.wrap(`\n********** Help for ${scriptName} **********\n`));

    ns.tprintf(
      Color.white.wrap(
        `Welcome to the help section for ${scriptName}. Here's everything you need to know to get started:\n\n`,
      ),
    );

    const formatFlag = ([key, { description, defaultValue }]) =>
      `  ${Color.red.wrap('--' + key)}: (default: ${Color.grey.wrap(defaultValue)})\n    ${description}`;

    const customFlagsHelpText = Object.entries(definition.flags).map(formatFlag).join('\n');

    const defaultFlagsHelpText = Object.entries(defaultFlags).map(formatFlag).join('\n');

    printSection(ns, 'Description', definition.description);
    printSection(ns, 'Flags', customFlagsHelpText);
    printSection(ns, 'Global Flags', defaultFlagsHelpText);

    ns.tprintf(Color.white.wrap('For more information, visit the official documentation or reach out on the forums.'));

    ns.exit();
  }
}

function getFlags<T extends FlagsDefinition>(ns: NS, flagsInput: T): FlagsEvaluated<T> {
  const combinedFlagsInput: T & typeof defaultFlags = { ...defaultFlags, ...flagsInput };

  const schema: [string, ScriptArg | string[]][] = Object.entries(combinedFlagsInput).map(([key, { defaultValue }]) => [
    key,
    defaultValue,
  ]);
  const flagsResult = ns.flags(schema);

  return flagsResult as FlagsEvaluated<T>;
}
