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

export interface Book {
  affiliate_name: string;
  title: string;
  chapters: Chapter[];
}

export interface Chapter {
  // Non-empty in API request and response
  id?: string;

  // Non-empty in API response
  versionstamp?: string;

  title: string;
  coverImageUrl: string;
  chapterSections: ChapterSection[]
}

export interface ChapterSection {
  heading: string;
  description: string;
  subSections: SubSection[];
}

export interface SubSection {
  heading: string;
  content: string;
}