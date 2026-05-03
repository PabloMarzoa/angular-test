export interface TodosItem {
  userId: number;
  id: number;
  completed: boolean;
  title: string;
}

export type TodoNew = Omit<TodosItem, 'id'>;
