export interface TodoList {
  items: TodoListItem[];
}

export interface TodoListItem {
  // Non-empty in API request and response
  id?: string;

  // Non-empty in API response
  versionstamp?: string;

  text: string;
  imgUrl: string;
  createdAt: number;
  updatedAt: number;
}
