// types.ts
export type BlockType = "paragraph" | "header" | "unordered-list-item";
export interface Block {
  type: string;
  text: string;
}

export interface RichText {
  blocks: Block[];
}

export type Content = {
  blocks: Block[];
};

export interface Section {
  title: string;
  description?: { blocks: Block[] };
  sections?: Section[];
}

export interface Chapter {
  index: string;
  title: string;
  description: string;
  sections: Section[];
  imageUrl?: string;
  isIncluded: boolean;
}

export type ResourceRoadmap = {
  chapters: Chapter[];
};
