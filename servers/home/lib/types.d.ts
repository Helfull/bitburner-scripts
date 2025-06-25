type SubNamespaceFunctionNames<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? Prefix extends ''
      ? K & string
      : `${Prefix}.${K & string}`
    : T[K] extends object
      ? SubNamespaceFunctionNames<T[K], Prefix extends '' ? K & string : `${Prefix}.${K & string}`>
      : never
}[keyof T];

type NSFunctionNames = SubNamespaceFunctionNames<NS>;