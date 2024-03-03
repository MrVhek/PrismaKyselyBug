import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type DragAndDropResults = {
    id: Generated<number>;
    variableId: number;
};
export type VariableCategoricalValues = {
    variableValueUid: string;
    type: string;
    labels: unknown | null;
    index: number | null;
};
export type Variables = {
    id: Generated<number>;
};
export type VariableValues = {
    uid: Generated<string>;
    variableId: number;
    timestamp: Timestamp;
    type: string;
    participantUid: string;
};
export type DB = {
    DragAndDropResults: DragAndDropResults;
    VariableCategoricalValues: VariableCategoricalValues;
    Variables: Variables;
    VariableValues: VariableValues;
};
