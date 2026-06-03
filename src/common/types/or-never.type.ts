export type OrNeverType<T> = T extends undefined ? never : T;
