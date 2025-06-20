import { Color } from '@lib/colors';

type ScriptArg = string | number | boolean;

type ScriptDefinition<T extends FlagsDefinition, Y extends ArgsDefinition> = {
  description: string;
  args?: Y;
  flags?: T;
};

type Value<T = any> = {
  description: string;
  defaultValue: T;
};

type Arg<T = any> = Value<T>

type Args = {
  [K: string]: Arg;
};

type Flag<T = any> = Value<T>;

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
  win: {
    description: 'Opens script logs in a new window, similar to the --tail option for enhanced readability.',
    defaultValue: false,
  },
};

type ArgsDefinition = {
  [K: string]: Arg;
};

type MapArgsArray<T extends ArgsDefinition> = {
  [P in keyof T]: T[P]['defaultValue'];
};

type ArgsEvaluated<T extends ArgsDefinition> = MapArgsArray<T>;

type CommandLineArgs<T, Y> = {
  args: ArgsEvaluated<Y>;
  flags: FlagsEvaluated<T>;
}

export function defineScript<T extends FlagsDefinition, Y extends ArgsDefinition>(
  ns: NS,
  definition: ScriptDefinition<T, Y>
): CommandLineArgs<T, Y> | FlagsEvaluated<T> {

  const argCountRequired = Object.keys(definition.args ?? {}).length;

  const flags = getFlags(ns, definition.flags);

  setupTail(ns, flags);

  printHelp(ns, flags, definition);

  if (argCountRequired === 0) {
    return flags;
  }

  const args = getArgs(flags['_'] || [], definition.args) as ArgsEvaluated<Y>;
  delete flags['_'];

  if (args.length < argCountRequired) {
    ns.tprintf(Color.red.wrap(`Error: Missing required arguments. Expected: ${argCountRequired}, Provided: ${args.length}`));
    printHelp(ns, { help: true } as FlagsEvaluated<T>, definition);
    ns.exit();
  }

  return { args, flags };
}

function setupTail<T extends FlagsDefinition>(ns: NS, args: FlagsEvaluated<T>) {
  ns.disableLog('ALL');

  if (args.win) {
    ns.ui.openTail();
  }
}

function printHelp<T extends FlagsDefinition, Y extends ArgsDefinition>(ns, flags: FlagsEvaluated<T>, definition: ScriptDefinition<T, Y>) {
  function printSection(ns: any, title: string, content: string) {
    ns.tprintf(Color.yellow.wrap(`=== ${title} ===\n`));
    ns.tprintf(content + '\n\n');
  }

  if (flags.help) {
    const scriptName = Color.pink.wrap(ns.getScriptName());
    ns.tprintf(Color.green.wrap(`\n********** Help for ${scriptName} **********\n`));

    ns.tprintf(
      Color.white.wrap(
        `Welcome to the help section for ${scriptName}. Here's everything you need to know to get started:\n\n`,
      ),
    );

    const argsText = Object.keys(definition.args ?? {})
      .map((arg) => `${Color.white.wrap('[')}${Color.red.wrap(arg)}${Color.white.wrap(']')}`)
      .join(', ');

    const flagsText = Object.keys(definition.flags)
      .map((flag) => `(--${Color.red.wrap(flag)})`)
      .join(', ');

    const execCommandText = Color.grey.wrap(
      `${Color.white.wrap(`run ${ns.getScriptName()}`)} ${argsText} ${flagsText}`,
    );

    printSection(ns, 'Description', definition.description + '\n\n' + execCommandText);

    if (Object.keys(definition.args ?? {}).length > 0) {

      const formatArg = ([key, { description, defaultValue }]) =>
        `  ${Color.red.wrap(key)}: (default: ${Color.grey.wrap(defaultValue)})\n    ${description}`;

      const argsHelpText = Object.entries(definition.args).map(formatArg).join('\n');

      printSection(ns, 'Args', argsHelpText);
    }

    const formatFlag = ([key, { description, defaultValue }]) =>
      `  ${Color.red.wrap('--' + key)}: (default: ${Color.grey.wrap(defaultValue)})\n    ${description}`;

    const customFlagsHelpText = Object.entries(definition.flags).map(formatFlag).join('\n');

    const defaultFlagsHelpText = Object.entries(defaultFlags).map(formatFlag).join('\n');

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

/**
 * Extracts and evaluates command line arguments based on the provided definition.
 *
 * @param args
 * @param definition
 */
function getArgs<T extends ArgsDefinition>(args: string[], definition?: T): ArgsEvaluated<T> {

  if (!definition || Object.keys(definition).length === 0) {
    return {} as ArgsEvaluated<T>;
  }

  const argsEvaluated = {};

  Object.entries(definition).forEach(([key, argDefinition], index) => {

    if (args[index] === undefined) {

      argsEvaluated[key] = argDefinition.defaultValue ?? null;
      return;

    }

    argsEvaluated[key] = args[index];

  });

  return argsEvaluated as ArgsEvaluated<T>;

}
