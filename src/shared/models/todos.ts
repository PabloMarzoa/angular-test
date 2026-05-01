export interface TodosItem {
  userId: number;
  id: number;
  completed: boolean;
  title: string;
}

export interface TodoNew extends Omit<TodosItem, 'id'> {}
