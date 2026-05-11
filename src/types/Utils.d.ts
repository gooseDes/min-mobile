type ValuesOf<T> = T[keyof T];
type KeyOf<T> = { [K in keyof T]: T[K] };

interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}
